<script lang="ts">
  import {
    Image as ImageIcon,
    Loader2,
    AlertCircle,
    FileText,
    Film,
    XCircle,
  } from "@lucide/svelte";
  import { fade, scale } from "svelte/transition";

  let { fileId = "" } = $props<{ fileId?: string }>();

  let fileData = $state<any>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  async function fetchFile(id: string) {
    if (!id || id.length < 10) {
      fileData = null;
      error = null;
      return;
    }

    isLoading = true;
    error = null;
    try {
      const res = await fetch(`/api/files/${id}`);
      const result = await res.json();
      if (result.success) {
        fileData = result.file;
      } else {
        error = result.error || "File not found";
        fileData = null;
      }
    } catch (err) {
      error = "Failed to load preview";
      fileData = null;
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    fetchFile(fileId);
  });

  const getFileIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
      return null;
    if (ext && ["mp4", "webm", "ogg"].includes(ext)) return Film;
    return FileText;
  };
</script>

<div
  class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border/50 bg-accent/5 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-accent/10"
>
  {#if isLoading}
    <div
      in:fade={{ duration: 200 }}
      class="flex flex-col items-center gap-3 text-primary"
    >
      <Loader2 class="size-10 animate-spin opacity-80" />
      <span class="text-[10px] font-black uppercase tracking-widest opacity-60"
        >Fetching Asset...</span
      >
    </div>
  {:else if fileData}
    <div
      in:scale={{ duration: 400, start: 0.95 }}
      class="relative h-full w-full"
    >
      {#if fileData.mimeType?.startsWith("image/") || !getFileIcon(fileData.url)}
        <img
          src={fileData.url}
          alt="Preview"
          class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <!-- Glassmorphism Overlay for ID -->
        <div
          class="absolute bottom-2 left-2 right-2 rounded-lg bg-black/40 p-2 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <p class="text-[9px] font-bold text-white/90 truncate">
            {fileData.filename} ({fileData.mimeType})
          </p>
        </div>
      {:else}
        {@const Icon = getFileIcon(fileData.url)}
        <div
          class="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/20"
        >
          <Icon class="size-12 text-muted-foreground/40" />
          <p class="text-[10px] font-bold text-muted-foreground/60">
            {fileData.filename}
          </p>
        </div>
      {/if}
    </div>
  {:else if error}
    <div in:fade class="flex flex-col items-center gap-2 p-4 text-center">
      <XCircle class="size-10 text-destructive/40" />
      <div class="space-y-1">
        <p class="text-xs font-bold text-destructive/80">Preview Failed</p>
        <p class="text-[9px] text-muted-foreground leading-tight max-w-[150px]">
          {error}
        </p>
      </div>
    </div>
  {:else}
    <div
      in:fade
      class="flex flex-col items-center gap-2 text-muted-foreground/30"
    >
      <ImageIcon class="size-12" />
      <p class="text-[10px] font-bold uppercase tracking-widest">
        No Asset Loaded
      </p>
    </div>
  {/if}

  <!-- Selection Indicator -->
  {#if fileData}
    <div class="absolute top-2 right-2">
      <div
        class="size-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
      ></div>
    </div>
  {/if}
</div>
