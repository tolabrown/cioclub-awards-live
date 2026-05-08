<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Image,
    FileText,
    Film,
    Search,
    HardDrive,
    Upload,
    Trash2,
    Loader2,
    X,
    Copy,
    Check,
    ExternalLink,
  } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Badge } from "$lib/components/ui/badge";
  import { formatDistanceToNow } from "date-fns";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  let { data }: PageProps = $props();
  const { stats } = $derived(data);

  let isUploadDialogOpen = $state(false);
  let isUploading = $state(false);
  let isDeleting = $state<string | null>(null);
  let selectedFiles = $state<FileList | null>(null);

  // Infinite Scroll State
  let files = $state<any[]>([]);
  let meta = $state<any>(null);
  let isLoadingMore = $state(false);
  let observerTarget = $state<HTMLElement | null>(null);
  let copiedId = $state<string | null>(null);

  $effect(() => {
    files = data.files || [];
    meta = data.meta;
  });

  async function fetchMore() {
    if (isLoadingMore || !meta?.hasMore) return;

    isLoadingMore = true;
    try {
      const nextPage = (meta.page || 1) + 1;
      const res = await fetch(
        `/api/files?page=${nextPage}&limit=${meta.limit || 24}`,
      );
      const result = await res.json();

      if (result.success) {
        files = [...files, ...result.files];
        meta = result.meta;
      }
    } catch (error) {
      console.error("Failed to load more files:", error);
    } finally {
      isLoadingMore = false;
    }
  }

  onMount(() => {
    if (!browser) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && meta?.hasMore && !isLoadingMore) {
          fetchMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => observer.disconnect();
  });

  async function copyToClipboard(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      copiedId = id;
      toast.success("File ID copied to clipboard");
      setTimeout(() => {
        if (copiedId === id) copiedId = null;
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy ID");
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
      return Image;
    if (ext && ["mp4", "webm", "ogg"].includes(ext)) return Film;
    return FileText;
  };

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    selectedFiles = target.files;
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Media Library</h1>
      <Button onclick={() => (isUploadDialogOpen = true)}
        ><Upload class="size-4 mr-2" /> Upload Assets</Button
      >
    </div>
    <p class="text-muted-foreground">
      Manage your store's images, videos, and documents.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="rounded-xl border bg-card p-4 flex items-center gap-4">
      <div
        class="size-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
      >
        <HardDrive class="size-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p class="text-sm text-muted-foreground">Total Storage</p>
        <p class="text-xl font-bold">{formatSize(stats?.totalSize || 0)}</p>
      </div>
    </div>
    <div class="rounded-xl border bg-card p-4 flex items-center gap-4">
      <div
        class="size-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center"
      >
        <Image class="size-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div>
        <p class="text-sm text-muted-foreground">Total Assets</p>
        <p class="text-xl font-bold">{stats?.totalFiles || 0}</p>
      </div>
    </div>
  </div>

  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
  >
    {#each files as file (file.id)}
      <div
        class="group relative rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:ring-2 hover:ring-primary hover:shadow-xl hover:-translate-y-1 duration-300"
      >
        <div
          class="aspect-square flex items-center justify-center bg-muted/30 relative"
        >
          {#if file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)}
            <img
              src={file.url}
              alt={file.remoteId}
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          {:else}
            {@const Icon = getFileIcon(file.url)}
            <Icon class="size-12 text-muted-foreground/50" />
          {/if}

          <!-- Glassmorphism Overlay -->
          <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4"
          >
            <Button
              variant="secondary"
              size="icon"
              class="size-9 rounded-xl bg-white/20 backdrop-blur-md border-white/20 hover:bg-white/40 text-white transition-all transform translate-y-4 group-hover:translate-y-0"
              onclick={() => copyToClipboard(file.id)}
              title="Copy File ID"
            >
              {#if copiedId === file.id}
                <Check class="size-4" />
              {:else}
                <Copy class="size-4" />
              {/if}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              class="size-9 rounded-xl bg-white/20 backdrop-blur-md border-white/20 hover:bg-white/40 text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75"
              href={file.url}
              target="_blank"
              title="Open Original"
            >
              <ExternalLink class="size-4" />
            </Button>

            <form
              method="POST"
              action="?/delete"
              use:enhance={() => {
                isDeleting = file.id;
                return async ({ result }) => {
                  isDeleting = null;
                  if (result.type === "success") {
                    toast.success("File deleted successfully");
                    files = files.filter((f) => f.id !== file.id);
                  } else {
                    toast.error("Failed to delete file");
                  }
                };
              }}
              class="contents"
            >
              <input type="hidden" name="id" value={file.id} />
              <Button
                variant="destructive"
                size="icon"
                class="size-9 rounded-xl shadow-lg border-white/10 transition-all transform translate-y-4 group-hover:translate-y-0 delay-150"
                type="submit"
                disabled={isDeleting === file.id}
              >
                {#if isDeleting === file.id}
                  <Loader2 class="size-4 animate-spin" />
                {:else}
                  <Trash2 class="size-4" />
                {/if}
              </Button>
            </form>
          </div>
        </div>
        <div class="p-3 border-t bg-card/80">
          <p
            class="text-[11px] font-bold truncate text-foreground/80"
            title={file.remoteId}
          >
            {file.remoteId}
          </p>
          <div class="flex items-center justify-between mt-1">
            <p class="text-[10px] text-muted-foreground font-medium">
              {formatSize(file.size)}
            </p>
            <Badge
              variant="outline"
              class="text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider font-black opacity-60"
            >
              {file.url.split(".").pop()}
            </Badge>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Intersection Observer Sentinel -->
  <div bind:this={observerTarget} class="w-full flex justify-center py-8">
    {#if isLoadingMore}
      <div class="flex flex-col items-center gap-2">
        <Loader2 class="size-8 text-primary animate-spin" />
        <p class="text-xs font-bold text-muted-foreground animate-pulse">
          Loading more magic...
        </p>
      </div>
    {:else if !meta?.hasMore && files.length > 0}
      <div class="flex flex-col items-center gap-2 py-4">
        <div class="h-px w-20 bg-border"></div>
        <p
          class="text-xs font-black uppercase tracking-widest text-muted-foreground/40 italic"
        >
          End of the line
        </p>
      </div>
    {/if}
  </div>

  {#if files.length === 0}
    <div
      class="rounded-lg border border-dashed p-12 flex flex-col items-center justify-center text-center"
    >
      <Image class="size-12 text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold">No media found</h3>
      <p class="text-muted-foreground max-w-sm">
        Start by uploading some images or files to your library.
      </p>
      <Button
        variant="outline"
        class="mt-4"
        onclick={() => (isUploadDialogOpen = true)}
      >
        <Upload class="size-4 mr-2" /> Upload your first asset
      </Button>
    </div>
  {/if}
</div>

<Dialog.Root bind:open={isUploadDialogOpen}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Upload Media</Dialog.Title>
    </Dialog.Header>
    <form
      method="POST"
      action="?/upload"
      enctype="multipart/form-data"
      use:enhance={() => {
        isUploading = true;
        return async ({ result }) => {
          isUploading = false;
          if (result.type === "success") {
            isUploadDialogOpen = false;
            toast.success("Files uploaded successfully");
            selectedFiles = null;
            await invalidateAll();
          } else {
            toast.error("Failed to upload files");
          }
        };
      }}
      class="space-y-4 pt-4"
    >
      <div class="space-y-2">
        <Label for="files">Select Files</Label>
        <div
          class="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative"
        >
          <input
            id="files"
            name="files"
            type="file"
            multiple
            class="absolute inset-0 opacity-0 cursor-pointer"
            onchange={handleFileChange}
            required
          />
          <Upload class="size-8 text-muted-foreground mb-2" />
          <p class="text-sm font-medium">Click to browse or drag and drop</p>
          <p class="text-xs text-muted-foreground mt-1">Images, videos, docs</p>
        </div>

        {#if selectedFiles && selectedFiles.length > 0}
          <div class="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
            {#each Array.from(selectedFiles) as file}
              <div
                class="flex items-center justify-between text-xs p-2 bg-muted rounded-md"
              >
                <span class="truncate pr-4">{file.name}</span>
                <span class="text-muted-foreground flex-shrink-0"
                  >{formatSize(file.size)}</span
                >
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="category">Category</Label>
        <select
          id="category"
          name="category"
          class="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="general">General</option>
          <option value="products">Products</option>
          <option value="banners">Banners</option>
          <option value="blog">Blog</option>
        </select>
      </div>

      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          onclick={() => (isUploadDialogOpen = false)}>Cancel</Button
        >
        <Button
          type="submit"
          disabled={isUploading || !selectedFiles || selectedFiles.length === 0}
        >
          {#if isUploading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          {:else}
            Upload {selectedFiles ? `(${selectedFiles.length})` : ""}
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
