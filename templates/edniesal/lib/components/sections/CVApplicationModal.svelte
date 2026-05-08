<script lang="ts">
  import { browser } from "$app/environment";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { toast } from "svelte-sonner";
  import {
    Upload,
    FileText,
    Loader2,
    X,
    Check,
    Send,
    Briefcase,
  } from "@lucide/svelte";

  let { open = $bindable(false) } = $props();

  let innerWidth = $state(0);
  let isMobile = $derived(innerWidth < 768);

  // Form state
  let name = $state("");
  let email = $state("");
  let phone = $state("");
  let coverLetter = $state("");
  let cvFileId = $state<string | null>(null);
  let cvFileName = $state("");
  let uploading = $state(false);
  let submitting = $state(false);
  let submitted = $state(false);

  // Rich editor (loaded client-side only)
  let RichEditor: any = $state(null);

  $effect(() => {
    if (browser && open && !RichEditor) {
      import("$lib/components/ui/editor/rich-editor.svelte").then((mod) => {
        RichEditor = mod.default;
      });
    }
  });

  let fileInput = $state<HTMLInputElement>();

  async function handleFileUpload(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    uploading = true;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        cvFileId = result.id;
        cvFileName = file.name;
        toast.success("CV uploaded successfully");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload CV");
    } finally {
      uploading = false;
    }
  }

  function removeFile() {
    cvFileId = null;
    cvFileName = "";
    if (fileInput) fileInput.value = "";
  }

  async function handleSubmit() {
    // Validate
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!cvFileId) {
      toast.error("Please upload your CV");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    submitting = true;
    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          coverLetter: coverLetter || null,
          cvFileId,
        }),
      });
      const result = await response.json();

      if (result.success) {
        submitted = true;
      } else {
        toast.error(result.error || "Submission failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit application");
    } finally {
      submitting = false;
    }
  }

  function resetForm() {
    name = "";
    email = "";
    phone = "";
    coverLetter = "";
    cvFileId = null;
    cvFileName = "";
    submitted = false;
  }

  function handleClose() {
    open = false;
    // Delay reset so the animation finishes
    setTimeout(resetForm, 300);
  }
</script>

<svelte:window bind:innerWidth />

<input
  type="file"
  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  class="hidden"
  bind:this={fileInput}
  onchange={handleFileUpload}
/>

{#snippet formContent()}
  {#if submitted}
    <div
      class="flex flex-col items-center justify-center py-8 text-center space-y-4"
    >
      <div
        class="size-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
      >
        <Check class="size-8" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-bold">Application Submitted!</h3>
        <p class="text-sm text-muted-foreground max-w-sm">
          Thank you, {name}. We've received your application and will review it
          shortly. We'll be in touch via email if your profile matches our
          requirements.
        </p>
      </div>
      <Button variant="outline" onclick={handleClose}>Close</Button>
    </div>
  {:else}
    <div class="space-y-4">
      <!-- Personal Info -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <Label
            for="cv-name"
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Full Name *</Label
          >
          <Input
            id="cv-name"
            bind:value={name}
            placeholder="John Doe"
            required
          />
        </div>
        <div class="space-y-1.5">
          <Label
            for="cv-email"
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >Email *</Label
          >
          <Input
            id="cv-email"
            type="email"
            bind:value={email}
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <Label
          for="cv-phone"
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >Phone Number *</Label
        >
        <Input
          id="cv-phone"
          type="tel"
          bind:value={phone}
          placeholder="+234 801 234 5678"
          required
        />
      </div>

      <!-- CV Upload -->
      <div class="space-y-1.5">
        <Label
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >Upload CV *</Label
        >
        {#if cvFileName}
          <div
            class="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
          >
            <div
              class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"
            >
              <FileText class="size-5" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{cvFileName}</p>
              <p class="text-xs text-muted-foreground">Ready to submit</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onclick={removeFile}
            >
              <X class="size-4" />
            </Button>
          </div>
        {:else}
          <button
            type="button"
            onclick={() => fileInput?.click()}
            disabled={uploading}
            class="w-full flex flex-col items-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/20 transition-colors cursor-pointer"
          >
            {#if uploading}
              <Loader2 class="size-6 text-muted-foreground animate-spin" />
              <span class="text-xs font-medium text-muted-foreground"
                >Uploading...</span
              >
            {:else}
              <Upload class="size-6 text-muted-foreground" />
              <span class="text-xs font-medium text-muted-foreground"
                >Click to upload PDF or Word document</span
              >
              <span class="text-xs text-muted-foreground/60">Max 10MB</span>
            {/if}
          </button>
        {/if}
      </div>

      <!-- Cover Letter -->
      <div class="space-y-1.5">
        <Label
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >Cover Letter</Label
        >
        <p class="text-xs text-muted-foreground">
          Optional — tell us why you'd be a great fit
        </p>
        {#if RichEditor}
          <div
            class="max-h-48 overflow-y-auto overflow-x-hidden rounded-lg border"
          >
            <RichEditor bind:value={coverLetter} />
          </div>
        {:else}
          <div
            class="h-32 rounded-lg border bg-muted/20 flex items-center justify-center"
          >
            <Loader2 class="size-5 animate-spin text-muted-foreground" />
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/snippet}

{#snippet formFooter()}
  {#if !submitted}
    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" onclick={handleClose}>
        Cancel
      </Button>
      <Button
        type="button"
        disabled={submitting || uploading}
        onclick={handleSubmit}
      >
        {#if submitting}
          <Loader2 class="size-4 animate-spin mr-2" /> Submitting...
        {:else}
          <Send class="size-4 mr-2" /> Submit Application
        {/if}
      </Button>
    </div>
  {/if}
{/snippet}

<!-- Desktop Dialog -->
{#if !isMobile}
  <Dialog.Root
    bind:open
    onOpenChange={(v) => {
      if (!v) handleClose();
    }}
  >
    <Dialog.Content
      class="sm:max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden"
    >
      <Dialog.Header>
        <div class="flex items-center gap-3">
          <div
            class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
          >
            <Briefcase class="size-5" />
          </div>
          <div>
            <Dialog.Title>Apply to Join Our Team</Dialog.Title>
            <Dialog.Description class="text-xs text-muted-foreground"
              >Submit your CV and tell us about yourself</Dialog.Description
            >
          </div>
        </div>
      </Dialog.Header>
      {@render formContent()}
      <Dialog.Footer>
        {@render formFooter()}
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
{/if}

<!-- Mobile Drawer -->
{#if isMobile}
  <Drawer.Root
    bind:open
    onOpenChange={(v) => {
      if (!v) handleClose();
    }}
  >
    <Drawer.Content>
      <Drawer.Header>
        <div class="flex items-center gap-3">
          <div
            class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
          >
            <Briefcase class="size-5" />
          </div>
          <div>
            <Drawer.Title>Apply to Join Our Team</Drawer.Title>
            <Drawer.Description class="text-xs text-muted-foreground"
              >Submit your CV and tell us about yourself</Drawer.Description
            >
          </div>
        </div>
      </Drawer.Header>
      <div class="px-4 pb-4 overflow-y-auto max-h-[70vh]">
        {@render formContent()}
      </div>
      <Drawer.Footer>
        {@render formFooter()}
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{/if}
