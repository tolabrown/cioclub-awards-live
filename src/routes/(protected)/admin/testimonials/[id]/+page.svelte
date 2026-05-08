<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { deserialize } from "$app/forms";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Loader2,
    Save,
    ArrowLeft,
    Trash2,
    Image as ImageIcon,
    User,
    Globe,
    Building2,
    Upload,
    Quote
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import type { PageProps } from "./$types";

  let { data=$bindable() }: PageProps = $props();

  let isSaving = $state(false);
  let isUploading = $state(false);
  
  let testimonialData = $state({
    name: data.testimonial?.name || "",
    country: data.testimonial?.country || "",
    organization: data.testimonial?.organization || "",
    testimonial: data.testimonial?.testimonial || "",
    imageId: data.testimonial?.imageId || null,
    image: data.testimonial?.image || null
  });

  async function handleImageUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isUploading = true;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData
      });
      const responseText = await response.text();
      const result = deserialize(responseText) as any;
      
      if (result.type === 'success' && result.data?.image) {
         const successData = result.data.image;
         testimonialData.imageId = successData.id;
         testimonialData.image = successData;
         toast.success("Image uploaded");
      } else {
        console.error("Upload failed result:", result);
        toast.error("Upload failed: No image data returned");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      isUploading = false;
    }
  }

  async function removeImage() {
    if (!testimonialData.imageId) return;
    
    const formData = new FormData();
    formData.append("fileId", testimonialData.imageId);
    
    try {
      const response = await fetch("?/deleteFile", {
        method: "POST",
        body: formData
      });
      
      if (response.ok) {
        testimonialData.imageId = null;
        testimonialData.image = null;
        toast.success("Image removed");
      }
    } catch (err) {
      toast.error("Failed to remove image");
    }
  }
</script>

<div class="flex flex-col gap-4 w-full pb-20">
  <!-- Header -->
  <div class="flex items-center justify-between pt-4">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" href="/admin/testimonials" class="rounded-full hover:bg-muted">
        <ArrowLeft class="size-5" />
      </Button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          {data.testimonial ? "Edit Testimonial" : "New Testimonial"}
        </h1>
        <p class="text-muted-foreground text-sm font-medium">
          {data.testimonial ? `Editing testimonial from ${testimonialData.name}` : "Add a new member testimonial to the platform"}
        </p>
      </div>
    </div>
  </div>

  <form
    method="POST"
    action="?/save"
    use:enhance={() => {
      isSaving = true;
      return async ({ result }) => {
        isSaving = false;
        // @ts-ignore
        if (result.type === "success") {
          // @ts-ignore
          toast.success(result.data?.message || "Saved successfully");
          if (data.testimonial === null) {
            // @ts-ignore
            goto(`/admin/testimonials/${result.data?.id}`);
          }
        } else {
          // @ts-ignore
          toast.error(result.data?.error || "Failed to save");
        }
      };
    }}
    class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
  >
    <div class="md:col-span-2 space-y-6">
      <!-- Testimonial Editor -->
      <Card.Root class="border-border/60 shadow-md">
        <Card.Header class="pb-3">
          <div class="flex items-center gap-2">
            <div class="bg-primary/10 p-1.5 rounded-lg text-primary">
              <Quote class="size-4" />
            </div>
            <div>
              <Card.Title class="text-lg">Testimonial Content</Card.Title>
              <Card.Description>The direct quote or message about their experience.</Card.Description>
            </div>
          </div>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            <RichEditor bind:value={testimonialData.testimonial} class="min-h-[200px]" />
            <input type="hidden" name="testimonial" value={testimonialData.testimonial} />
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Personal Info -->
      <Card.Root class="border-border/60 shadow-md">
        <Card.Header class="pb-3">
          <div class="flex items-center gap-2">
            <div class="bg-primary/10 p-1.5 rounded-lg text-primary">
              <User class="size-4" />
            </div>
            <div>
              <Card.Title class="text-lg">Person Details</Card.Title>
              <Card.Description>Information about the testimonial provider.</Card.Description>
            </div>
          </div>
        </Card.Header>
        <Card.Content class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="name" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="name" name="name" bind:value={testimonialData.name} class="pl-9 bg-muted/20" placeholder="e.g. Dr. Rachael Adebayo" required />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="organization" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization</Label>
            <div class="relative">
              <Building2 class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="organization" name="organization" bind:value={testimonialData.organization} class="pl-9 bg-muted/20" placeholder="e.g. Global Tech Africa" />
            </div>
          </div>
          <div class="space-y-2 sm:col-span-2">
            <Label for="country" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</Label>
            <div class="relative">
              <Globe class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="country" name="country" bind:value={testimonialData.country} class="pl-9 bg-muted/20" placeholder="e.g. South Africa" />
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <div class="space-y-6">
      <!-- Profile Image -->
      <Card.Root class="border-border/60 shadow-md overflow-hidden">
        <Card.Header class="pb-3 bg-muted/30 border-b border-border/40">
          <Card.Title class="text-sm flex items-center gap-2">
            <ImageIcon class="size-4 text-primary" />
            Profile Image
          </Card.Title>
        </Card.Header>
        <Card.Content class="p-6 space-y-4">
          <div class="relative aspect-square rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 flex flex-col items-center justify-center overflow-hidden group shadow-inner">
            {#if testimonialData.image}
              <img 
                src={testimonialData.image.directUrl || testimonialData.image.url} 
                alt="Profile" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onerror={(e) => {
                  const img = e.currentTarget;
                  if (testimonialData.image?.directUrl && (img as any).src === testimonialData.image.directUrl) {
                    (img as any).src = testimonialData.image.url;
                  }
                }}
              />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <Button variant="destructive" size="icon" class="h-10 w-10 rounded-full shadow-lg" onclick={removeImage}>
                  <Trash2 class="size-4" />
                </Button>
              </div>
            {:else if isUploading}
              <div class="flex flex-col items-center gap-3">
                <Loader2 class="size-10 animate-spin text-primary" />
                <p class="text-xs font-bold text-primary animate-pulse uppercase tracking-widest">Uploading...</p>
              </div>
            {:else}
              <div class="flex flex-col items-center gap-3 p-6 text-center">
                <div class="bg-primary/5 p-4 rounded-full">
                  <User class="size-12 text-muted-foreground/30" />
                </div>
                <div>
                  <p class="text-xs text-muted-foreground font-bold uppercase tracking-wider">No Image</p>
                  <p class="text-[10px] text-muted-foreground mt-1 px-4">
                    Upload a face shot for better personalization
                  </p>
                </div>
              </div>
              <label class="absolute inset-0 cursor-pointer">
                <input type="file" class="hidden" accept="image/*" onchange={handleImageUpload} />
              </label>
            {/if}
          </div>
          
          <input type="hidden" name="imageId" value={testimonialData.imageId} />

          <div class="relative">
            <Button variant="outline" class="w-full gap-2 text-xs font-bold rounded-xl border-border/60 h-10 overflow-hidden" disabled={isUploading}>
              {#if isUploading}
                <Loader2 class="size-3.5 animate-spin" />
              {:else}
                <Upload class="size-3.5" />
              {/if}
              {testimonialData.imageId ? "Change Image" : "Upload Image"}
              <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onchange={handleImageUpload} />
            </Button>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Save Actions -->
      <Card.Root class="border-border/60 shadow-xl bg-primary/3 sticky top-6">
        <Card.Content class="p-2 space-y-2">
          <Button type="submit" class="w-full gap-2 rounded-xl shadow-lg shadow-primary/20  bg-primary hover:bg-primary/90" disabled={isSaving}>
            {#if isSaving}
              <Loader2 class="size-5 animate-spin" />
              Saving...
            {:else}
              <Save class="size-5" />
              Save Testimonial
            {/if}
          </Button>
          
          <Separator class="bg-border/40" />
          
          <Button variant="ghost" href="/admin/testimonials" class="w-full rounded-xl text-muted-foreground hover:text-foreground">
            Cancel & Return
          </Button>
        </Card.Content>
      </Card.Root>
    </div>
  </form>
</div>
