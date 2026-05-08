<script lang="ts">
  import * as ImageCropper from "$lib/components/ui/image-cropper";
  import { Button } from "$lib/components/ui/button";
  import { ZoomIn, ZoomOut } from "@lucide/svelte";

  interface Props {
    imageFile: File;
    onCrop: (croppedFile: File) => void;
    onCancel: () => void;
  }

  let { imageFile, onCrop, onCancel }: Props = $props();

  let src = $state("");
  let zoom = $state(1);
  let cropperElement: any;

  // Convert cropped URL to File and call onCrop
  async function handleCropped(url: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const croppedFile = new File([blob], imageFile.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      onCrop(croppedFile);
    } catch (error) {
      console.error("Failed to process cropped image:", error);
      alert("Failed to process image. Please try again.");
    }
  }

  function handleUnsupportedFile(file: File) {
    alert(`Unsupported file type: ${file.type}. Please use an image file.`);
  }

  function handleZoomIn() {
    zoom = Math.min(zoom + 0.2, 3);
  }

  function handleZoomOut() {
    zoom = Math.max(zoom - 0.2, 1);
  }

  // Automatically upload the file when component mounts
  $effect(() => {
    if (imageFile) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(imageFile);

      const fileInput = document.getElementById(
        "teacher-image-cropper-input",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });
</script>

<ImageCropper.Root
  bind:src
  id="teacher-image-cropper-input"
  onCropped={handleCropped}
  onUnsupportedFile={handleUnsupportedFile}
>
  <ImageCropper.Dialog class="max-w-4xl">
    <div class="space-y-2">
      <!-- Header -->
      <div class="space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Crop Teacher Photo</h2>
        <p class="text-sm text-muted-foreground">
          Drag to reposition • Use zoom controls to adjust size • Perfect your
          photo
        </p>
      </div>

      <!-- Cropper Area -->
      <div
        class="relative h-[300px] w-full overflow-hidden rounded-xl border-2 border-primary/20 bg-black/5 shadow-2xl"
      >
        <ImageCropper.Cropper
          bind:this={cropperElement}
          cropShape="rect"
          aspect={1}
          showGrid={true}
          {zoom}
        />
      </div>

      <!-- Zoom Controls -->
      <div
        class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center mb-0"
      >
        <div
          class="flex items-center gap-3 rounded-full border bg-background px-6 py-3 shadow-lg"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onclick={handleZoomOut}
            disabled={zoom <= 1}
            class="h-10 w-10 rounded-full hover:bg-primary/10"
          >
            <ZoomOut class="h-5 w-5" />
          </Button>

          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-muted-foreground">Zoom</span>
            <span class="min-w-[3ch] text-center text-sm font-bold"
              >{Math.round(zoom * 100)}%</span
            >
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onclick={handleZoomIn}
            disabled={zoom >= 3}
            class="h-10 w-10 rounded-full hover:bg-primary/10"
          >
            <ZoomIn class="h-5 w-5" />
          </Button>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="flex flex-col gap-4 border-t sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            ><span class="font-medium">Tip:</span> Pinch or use buttons to zoom,
            drag to move</span
          >
        </div>
        <div class="flex gap-3">
          <ImageCropper.Cancel>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onclick={onCancel}
              class="min-w-[100px]"
            >
              Cancel
            </Button>
          </ImageCropper.Cancel>
          <ImageCropper.Crop>
            <Button type="button" size="lg" class="min-w-[140px]">
              Crop & Save
            </Button>
          </ImageCropper.Crop>
        </div>
      </div>
    </div>
  </ImageCropper.Dialog>
</ImageCropper.Root>
