<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Loader2,
    Upload,
    Trash2,
    Link as LinkIcon,
    Check,
    Copy,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  let {
    value = $bindable(""),
    label = "Image",
    description = "Upload an image or provide a URL",
    onchange = (url: string) => {},
    ondelete = () => {},
  } = $props();

  let uploading = $state(false);
  let fileInput = $state<HTMLInputElement>();
  let copied = $state(false);

  async function handleUpload(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    uploading = true;
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        value = result.directUrl;
        onchange(result.directUrl);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      uploading = false;
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(value);
    copied = true;
    setTimeout(() => (copied = false), 2000);
    toast.success("URL copied to clipboard");
  }

  async function removeImage() {
    const prevValue = value;
    value = "";
    if (fileInput) fileInput.value = "";
    ondelete();

    // If it's a Minio asset, try to delete it from storage too
    if (prevValue.includes("minio.toolsntuts.com")) {
      try {
        // Extract ID: https://api.minio.toolsntuts.com/uploads/1739396345869-image.png
        // Our API expects the ID (object name)
        const parts = prevValue.split("/");
        const id = parts[parts.length - 1];

        if (id) {
          const response = await fetch("/api/files", {
            method: "DELETE",
            body: JSON.stringify({ id }),
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            console.error("Failed to delete from storage");
          }
        }
      } catch (err) {
        console.error("Error during storage deletion:", err);
      }
    }

    toast.success("Image removed");
  }
</script>

<div class="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4">
  <div class="flex items-center justify-between">
    <div class="space-y-0.5">
      <Label class="font-bold uppercase tracking-wider text-[10px] text-primary"
        >{label}</Label
      >
      {#if description}
        <p class="text-[10px] text-muted-foreground font-medium italic">
          {description}
        </p>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-4">
    <!-- Preview -->
    <div
      class="relative aspect-video w-full sm:w-48 shrink-0 rounded-xl overflow-hidden border border-border/50 bg-background/50 flex items-center justify-center group shadow-sm"
    >
      {#if value}
        <img src={value} alt="Preview" class="w-full h-full object-cover" />
        <div
          class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <Button
            variant="destructive"
            size="icon"
            class="size-8"
            onclick={removeImage}
          >
            <Trash2 class="size-4" />
          </Button>
        </div>
      {:else}
        <div class="flex flex-col items-center gap-2 text-muted-foreground">
          <Upload class="size-8 opacity-20" />
          <span
            class="text-[10px] font-bold uppercase tracking-widest opacity-50"
            >No Media</span
          >
        </div>
      {/if}
    </div>

    <!-- Controls -->
    <div class="flex-1 space-y-4">
      <div class="flex flex-col gap-2">
        <div class="relative">
          <Input
            type="text"
            bind:value
            placeholder="https://example.com/image.jpg"
            class="pr-24 font-mono text-xs font-bold bg-background/50"
          />
          <div class="absolute right-1 top-1 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              class="size-8"
              onclick={copyToClipboard}
              disabled={!value}
            >
              {#if copied}
                <Check class="size-4 text-emerald-500" />
              {:else}
                <Copy class="size-4" />
              {/if}
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="size-8 shadow-sm"
              onclick={() => fileInput?.click()}
              disabled={uploading}
            >
              {#if uploading}
                <Loader2 class="size-4 animate-spin" />
              {:else}
                <Upload class="size-4" />
              {/if}
            </Button>
          </div>
        </div>
        <p
          class="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1 opacity-70"
        >
          <LinkIcon class="size-3" /> Paste URL or upload from device
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        class="hidden"
        bind:this={fileInput}
        onchange={handleUpload}
      />
    </div>
  </div>
</div>
