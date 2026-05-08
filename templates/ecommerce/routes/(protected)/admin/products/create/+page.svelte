<script lang="ts">
  import type { PageProps } from "./$types";
  import { enhance, deserialize } from "$app/forms";
  import { goto } from "$app/navigation";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import SearchableSelect from "$lib/components/ui/searchable-select/searchable-select.svelte";
  import MultiSearchableSelect from "$lib/components/ui/searchable-select/multi-searchable-select.svelte";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    ChevronLeft,
    Upload,
    X,
    Loader2,
    Sparkles,
    Plus,
    Trash2,
    Check,
    Link,
    Image as ImageIcon,
    Info,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();

  let isSubmitting = $state(false);
  let isGenerating = $state(false);

  // Form State
  let name = $state("");
  let description = $state("");
  let shortDescription = $state("");
  let sku = $state("SKU" + Date.now());
  let barcode = $state("");
  let basePrice = $state("");
  let compareAtPrice = $state("");
  let marketPrice = $state("");
  let stockQuantity = $state("0");
  let lowStockThreshold = $state("10");
  let categoryId = $state("");
  let isActive = $state(true);
  let isFeatured = $state(false);
  let isPublished = $state(false);
  let metaTitle = $state("");
  let metaDescription = $state("");
  // Image State
  let uploadedFiles = $state<{ fileId: string; url: string }[]>([]);
  let imageUrlInput = $state("");
  let isProcessingImage = $state(false);
  let uploadingImages = $state<Set<string>>(new Set());
  let uploadingPreviews = $state<Map<string, string>>(new Map());

  // Tags & Sizes & Features
  let selectedTagIds = $state<string[]>([]);
  let features = $state<{ name: string; value: string }[]>([]);
  let productSizes = $state<
    {
      sizeId: string;
      additionalPrice: string;
      stockQuantity: string;
      sku: string;
      isAvailable: boolean;
    }[]
  >([]);

  async function uploadImageToServer(file: File, tempId: string) {
    uploadingImages.add(tempId);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success" && result.data?.file) {
        const file = result.data.file as { id: string; url: string };
        uploadedFiles = [...uploadedFiles, { fileId: file.id, url: file.url }];
        toast.success("Image uploaded successfully");
      } else {
        const error =
          result.type === "failure"
            ? typeof result.data?.error === "string"
              ? result.data.error
              : "Upload failed"
            : "Upload failed";
        toast.error(error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      uploadingImages.delete(tempId);
      uploadingPreviews.delete(tempId);
    }
  }

  async function processAndAddFile(file: File) {
    isProcessingImage = true;
    const tempUrl = URL.createObjectURL(file);
    const tempId = crypto.randomUUID();
    uploadingPreviews.set(tempId, tempUrl);

    try {
      const resized = await resizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: "webp",
      });
      await uploadImageToServer(resized, tempId);
    } catch (error) {
      console.error("Resizing error:", error);
      toast.error(`Failed to process ${file.name}`);
      uploadingPreviews.delete(tempId);
    } finally {
      isProcessingImage = false;
    }
  }

  const handleImageUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      for (const file of files) {
        await processAndAddFile(file);
      }
      input.value = "";
    }
  };

  const handleImageUrl = async () => {
    if (!imageUrlInput) return;

    isProcessingImage = true;
    try {
      const response = await fetch(imageUrlInput);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const fileName = imageUrlInput.split("/").pop() || "image.webp";
      const file = new File([blob], fileName, { type: blob.type });

      await processAndAddFile(file);
      imageUrlInput = "";
    } catch (error) {
      console.error("URL Image error:", error);
      toast.error("Failed to load image from URL");
    } finally {
      isProcessingImage = false;
    }
  };

  const removeUploadedFile = (index: number) => {
    uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
  };

  const addFeature = () => {
    features = [...features, { name: "", value: "" }];
  };

  const removeFeature = (index: number) => {
    features = features.filter((_, i) => i !== index);
  };

  const addSize = (sizeId: string, sizeName: string) => {
    if (productSizes.find((ps) => ps.sizeId === sizeId)) return;
    productSizes = [
      ...productSizes,
      {
        sizeId,
        additionalPrice: "0",
        stockQuantity: "0",
        sku: `${sku ? sku + "-" : ""}${sizeName.toUpperCase()}`,
        isAvailable: true,
      },
    ];
  };

  const removeSize = (index: number) => {
    productSizes = productSizes.filter((_, i) => i !== index);
  };

  async function generateAIPrompt() {
    if (!name && !shortDescription) {
      toast.error("Please provide a name or short description first");
      return;
    }

    isGenerating = true;
    try {
      const response = await fetch("/api/products/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: name + " " + shortDescription }),
      });

      if (!response.ok) throw new Error("Failed to generate description");

      const aiData = await response.json();
      description = aiData.description;
      if (aiData.metaTitle) metaTitle = aiData.metaTitle;
      if (aiData.metaDescription) metaDescription = aiData.metaDescription;
      if (aiData.marketPrice) marketPrice = String(aiData.marketPrice);
      if (aiData.features?.length > 0) features = aiData.features;

      toast.success("AI Content generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI content");
    } finally {
      isGenerating = false;
    }
  }

  // Fetch functions for SearchableSelect
  async function fetchCategories(query: string) {
    return data.categories
      .filter((c: any) => c.name.toLowerCase().includes(query.toLowerCase()))
      .map((c: any) => ({
        ...c,
        image: c.imageFile?.url ? { url: c.imageFile.url } : null,
      }));
  }

  async function fetchTags(query: string) {
    return data.tags
      .filter((t: any) => t.name.toLowerCase().includes(query.toLowerCase()))
      .map((t: any) => ({
        ...t,
        image: t.image ? { url: t.image } : null,
      }));
  }
</script>

<div class="space-y-6 w-full pb-20">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onclick={() => goto("/admin/products")}
      >
        <ChevronLeft class="size-4" />
      </Button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Add New Product</h1>
        <p class="text-sm text-muted-foreground">
          Fill in the details to create a world-class product listing
        </p>
      </div>
    </div>
  </div>

  <form
    method="POST"
    action="?/create"
    enctype="multipart/form-data"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ result }) => {
        isSubmitting = false;
        if (result.type === "redirect") {
          toast.success(
            isPublished
              ? "Product published successfully"
              : "Draft saved successfully",
          );
          goto(result.location);
        } else if (result.type === "failure") {
          const errorMsg = result.data?.error;
          toast.error(
            typeof errorMsg === "string"
              ? errorMsg
              : "Failed to create product",
          );
        }
      };
    }}
    class="grid gap-6 lg:grid-cols-3"
  >
    <!-- Hidden fields for JSON data -->
    <input type="hidden" name="features" value={JSON.stringify(features)} />
    <input type="hidden" name="sizes" value={JSON.stringify(productSizes)} />
    <input type="hidden" name="isPublished" value={String(isPublished)} />

    <!-- Main Content -->
    <div class="space-y-6 lg:col-span-2">
      <!-- Basic Info -->
      <Card>
        <CardHeader>
          <CardTitle>Description & Content</CardTitle>
          <CardDescription>Give your product a compelling story</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              bind:value={name}
              required
              placeholder="e.g. Premium Ergonomic Chair"
            />
          </div>

          <div class="space-y-2">
            <Label for="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              bind:value={shortDescription}
              placeholder="A punchy one-liner for your product"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between mb-1">
              <Label for="description">Full Description *</Label>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onclick={generateAIPrompt}
                disabled={isGenerating}
                class="gap-1.5 h-8"
              >
                {#if isGenerating}
                  <Loader2 class="size-3 animate-spin" />
                  Generating...
                {:else}
                  <Sparkles class="size-3 text-primary" />
                  AI Writing Assistant
                {/if}
              </Button>
            </div>
            <div class="rounded-md border bg-card overflow-hidden">
              <RichEditor bind:value={description} />
              <input type="hidden" name="description" value={description} />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Features -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <div>
            <CardTitle>Product Features</CardTitle>
            <CardDescription>Key specifications for comparison</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onclick={addFeature}
            class="gap-1"
          >
            <Plus class="size-4" /> Add Feature
          </Button>
        </CardHeader>
        <CardContent>
          {#if features.length === 0}
            <div
              class="text-center py-6 border-2 border-dashed rounded-lg bg-muted/20"
            >
              <p class="text-sm text-muted-foreground mb-4">
                No features added yet. Use the AI Assistant to generate them
                automatically or add manually.
              </p>
              <Button variant="outline" size="sm" onclick={addFeature}
                >Add First Feature</Button
              >
            </div>
          {:else}
            <div class="space-y-3">
              {#each features as feature, i}
                <div class="flex gap-3 items-start group">
                  <div class="flex-1">
                    <Input
                      bind:value={feature.name}
                      placeholder="Feature Name (e.g. Material)"
                    />
                  </div>
                  <div class="flex-1">
                    <Input
                      bind:value={feature.value}
                      placeholder="Value (e.g. Premium Leather)"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onclick={() => removeFeature(i)}
                    class="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              {/each}
            </div>
          {/if}
        </CardContent>
      </Card>

      <!-- Pricing & Inventory -->
      <div class="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="basePrice">Base Price (₦) *</Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                step="0.01"
                bind:value={basePrice}
                required
                placeholder="0.00"
              />
            </div>
            <div class="space-y-2">
              <Label for="compareAtPrice">Compare at Price (₦)</Label>
              <Input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                step="0.01"
                bind:value={compareAtPrice}
                placeholder="0.00"
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Label for="marketPrice">Market Price (₦)</Label>
                <div title="Current market value for comparison">
                  <Info class="size-3.5 text-muted-foreground" />
                </div>
              </div>
              <Input
                id="marketPrice"
                name="marketPrice"
                type="number"
                step="0.01"
                bind:value={marketPrice}
                placeholder="Current market price"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="sku">SKU *</Label>
              </div>
              <Input
                id="sku"
                name="sku"
                bind:value={sku}
                required
                readonly
                class="bg-muted cursor-not-allowed opacity-80"
              />
              <p class="text-[10px] text-muted-foreground">
                Automated system ID
              </p>
            </div>
            <div class="space-y-2">
              <Label for="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                bind:value={stockQuantity}
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="lowStockThreshold">Low Stock Alert</Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                bind:value={lowStockThreshold}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Size Variants -->
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0"
        >
          <div>
            <CardTitle>Size Variants</CardTitle>
            <CardDescription
              >Manage different prices for different sizes</CardDescription
            >
          </div>
          <div class="flex gap-2">
            {#if data.sizes.length > 0}
              <div class="group relative">
                <Button variant="outline" size="sm" type="button" class="gap-1">
                  Add Size <Plus class="size-4" />
                </Button>
                <div
                  class="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 divide-y overflow-hidden"
                >
                  {#each data.sizes as size}
                    <button
                      type="button"
                      class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
                      onclick={() => addSize(size.id, size.name)}
                      disabled={!!productSizes.find(
                        (ps) => ps.sizeId === size.id,
                      )}
                    >
                      {size.name} ({size.abbreviation})
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </CardHeader>
        <CardContent>
          {#if productSizes.length === 0}
            <div
              class="text-center py-6 bg-muted/10 rounded-lg border-2 border-dashed"
            >
              <p class="text-sm text-muted-foreground italic">
                No size variants added. Suitable for "One Size" products.
              </p>
            </div>
          {:else}
            <div class="space-y-4">
              {#each productSizes as pSize, i}
                <div class="p-4 border rounded-lg bg-card space-y-4 relative">
                  <div class="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      class="text-xs font-bold px-2 py-0.5"
                    >
                      {data.sizes.find((s) => s.id === pSize.sizeId)?.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onclick={() => removeSize(i)}
                      class="text-muted-foreground hover:text-destructive h-8 w-8"
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                  <div class="grid gap-4 sm:grid-cols-3">
                    <div class="space-y-1.5">
                      <Label class="text-xs">Additional Price (₦)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        bind:value={pSize.additionalPrice}
                        placeholder="+0.00"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-xs">Stock</Label>
                      <Input type="number" bind:value={pSize.stockQuantity} />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-xs">SKU</Label>
                      <Input bind:value={pSize.sku} />
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </CardContent>
      </Card>

      <!-- Images -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Catalog Images</CardTitle>
              <CardDescription
                >Upload files or paste URLs (Auto-resized to &lt;200KB)</CardDescription
              >
            </div>
            {#if isProcessingImage}
              <div
                class="flex items-center gap-2 text-xs text-muted-foreground animate-pulse"
              >
                <Loader2 class="size-3 animate-spin" />
                Processing...
              </div>
            {/if}
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Image Control Area -->
          <div class="grid gap-4 sm:grid-cols-2">
            <label
              class="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-all text-center px-4"
            >
              <Upload class="size-6 text-muted-foreground mb-2" />
              <span class="text-sm font-semibold">Click to Upload Files</span>
              <span class="text-xs text-muted-foreground mt-1"
                >Supports multiple selection</span
              >
              <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                onchange={handleImageUpload}
              />
            </label>

            <div
              class="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/5 p-4 space-y-3"
            >
              <div class="flex items-center gap-2 w-full">
                <Link class="size-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Paste image URL here..."
                  class="h-9 text-xs"
                  bind:value={imageUrlInput}
                  onkeydown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleImageUrl())}
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                class="w-full h-8 text-xs"
                onclick={handleImageUrl}
                disabled={!imageUrlInput || isProcessingImage}
              >
                Add from URL
              </Button>
            </div>
          </div>

          <Separator />

          <!-- Previews Grid -->
          <div class="grid gap-4 grid-cols-2 sm:grid-cols-4 md:grid-cols-5">
            {#each uploadedFiles as f, i (f.fileId)}
              <div
                class="group relative aspect-square overflow-hidden rounded-lg border bg-muted ring-offset-background transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2"
              >
                <input type="hidden" name="fileId" value={f.fileId} />
                <img
                  src={f.url}
                  alt="Preview"
                  class="h-full w-full object-cover"
                />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    class="h-8 w-8 rounded-full"
                    type="button"
                    onclick={() => removeUploadedFile(i)}
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
                {#if i === 0}
                  <div class="absolute left-1.5 top-1.5">
                    <Badge class="h-5 px-1.5 text-[10px] bg-primary shadow-sm"
                      >Primary</Badge
                    >
                  </div>
                {/if}
              </div>
            {/each}

            {#each Array.from(uploadingPreviews.entries()) as [id, preview] (id)}
              <div
                class="relative aspect-square overflow-hidden rounded-lg border bg-muted animate-pulse"
              >
                <img
                  src={preview}
                  alt="Uploading..."
                  class="h-full w-full object-cover opacity-50 grayscale"
                />
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="flex flex-col items-center gap-1">
                    <Loader2 class="size-6 animate-spin text-primary" />
                    <span class="text-[10px] font-medium text-primary"
                      >Uploading...</span
                    >
                  </div>
                </div>
              </div>
            {/each}

            {#if uploadedFiles.length === 0 && uploadingPreviews.size === 0}
              <div
                class="col-span-full py-8 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10"
              >
                <ImageIcon class="size-8 opacity-20 mb-2" />
                <p class="text-sm italic">No images added yet</p>
              </div>
            {/if}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Actions -->
      <Card class="border-primary/20 shadow-md">
        <CardContent class="space-y-3 pt-6">
          <Button
            type="submit"
            class="w-full font-bold shadow-sm"
            disabled={isSubmitting}
            onclick={() => (isPublished = true)}
          >
            {#if isSubmitting && isPublished}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            {:else}
              Publish Product
            {/if}
          </Button>
          <Button
            type="submit"
            variant="outline"
            class="w-full"
            disabled={isSubmitting}
            onclick={() => (isPublished = false)}
          >
            {#if isSubmitting && !isPublished}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              Saving Draft...
            {:else}
              Save as Draft
            {/if}
          </Button>
        </CardContent>
      </Card>

      <!-- Organization -->
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <SearchableSelect
            name="categoryId"
            label="Category"
            entityName="Category"
            bind:value={categoryId}
            fetchOptions={fetchCategories}
            placeholder="Search categories..."
          />

          <MultiSearchableSelect
            name="tagIds"
            label="Promotion & Labels"
            entityName="Tag"
            bind:selectedIds={selectedTagIds}
            fetchOptions={fetchTags}
            placeholder="e.g. Flash Sale, New Arrival"
          />
        </CardContent>
      </Card>

      <!-- Visibility -->
      <Card>
        <CardHeader>
          <CardTitle>Visibility & Status</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <Label for="isActive" class="cursor-pointer">Publicly Active</Label>
            <Switch id="isActive" name="isActive" bind:checked={isActive} />
          </div>
          <div class="flex items-center justify-between">
            <Label for="isFeatured" class="cursor-pointer"
              >Featured Product</Label
            >
            <Switch
              id="isFeatured"
              name="isFeatured"
              bind:checked={isFeatured}
            />
          </div>
        </CardContent>
      </Card>

      <!-- SEO -->
      <Card>
        <CardHeader>
          <CardTitle>SEO Optimization</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="metaTitle">SEO Title</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              bind:value={metaTitle}
              placeholder="Focus keyword title"
            />
          </div>
          <div class="space-y-2">
            <Label for="metaDescription">SEO Description</Label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              bind:value={metaDescription}
              rows={3}
              placeholder="Brief summary for search engines"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </form>
</div>
