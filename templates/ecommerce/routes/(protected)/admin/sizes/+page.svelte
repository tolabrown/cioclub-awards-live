<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Switch } from "$lib/components/ui/switch";
  import { Ruler, Plus, Search, Trash2, Edit2, Loader2 } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Badge } from "$lib/components/ui/badge";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const { sizes } = $derived(data);

  let isDialogOpen = $state(false);
  let isSubmitting = $state(false);
  let isDeleting = $state<string | null>(null);

  let editingSize = $state<any>(null);
  let sizeName = $state("");
  let sizeAbbreviation = $state("");
  let sizeSortOrder = $state(0);
  let sizeIsActive = $state(true);

  function openCreateDialog() {
    editingSize = null;
    sizeName = "";
    sizeAbbreviation = "";
    sizeSortOrder = sizes.length
      ? Math.max(...sizes.map((s: any) => s.sortOrder)) + 1
      : 0;
    sizeIsActive = true;
    isDialogOpen = true;
  }

  function openEditDialog(size: any) {
    editingSize = size;
    sizeName = size.name;
    sizeAbbreviation = size.abbreviation;
    sizeSortOrder = size.sortOrder;
    sizeIsActive = size.isActive;
    isDialogOpen = true;
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Product Sizes</h1>
      <Button onclick={openCreateDialog}
        ><Plus class="size-4 mr-2" /> Create Size</Button
      >
    </div>
    <p class="text-muted-foreground">
      Manage size variations and sorting order for your products.
    </p>
  </div>

  <div class="rounded-md border bg-card overflow-hidden">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Abbreviation</Table.Head>
          <Table.Head>Sort Order</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Usage</Table.Head>
          <Table.Head class="text-right">Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each sizes as size}
          <Table.Row>
            <Table.Cell class="font-medium">{size.name}</Table.Cell>
            <Table.Cell
              ><code class="text-xs bg-muted px-1.5 py-0.5 rounded"
                >{size.abbreviation}</code
              ></Table.Cell
            >
            <Table.Cell>{size.sortOrder}</Table.Cell>
            <Table.Cell>
              <Badge variant={size.isActive ? "default" : "secondary"}
                >{size.isActive ? "Active" : "Inactive"}</Badge
              >
            </Table.Cell>
            <Table.Cell>
              <span class="text-sm">{size.productCount || 0} products</span>
            </Table.Cell>
            <Table.Cell class="text-right">
              <div class="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => openEditDialog(size)}
                >
                  <Edit2 class="size-4" />
                </Button>
                <form
                  method="POST"
                  action="?/delete"
                  use:enhance={() => {
                    isDeleting = size.id;
                    return async ({ result }) => {
                      isDeleting = null;
                      if (result.type === "success") {
                        toast.success("Size deleted successfully");
                        await invalidateAll();
                      } else {
                        toast.error("Failed to delete size");
                      }
                    };
                  }}
                >
                  <input type="hidden" name="id" value={size.id} />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    class="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isDeleting === size.id}
                  >
                    {#if isDeleting === size.id}
                      <Loader2 class="size-4 animate-spin" />
                    {:else}
                      <Trash2 class="size-4" />
                    {/if}
                  </Button>
                </form>
              </div>
            </Table.Cell>
          </Table.Row>
        {/each}
        {#if sizes.length === 0}
          <Table.Row>
            <Table.Cell colspan={6} class="h-24 text-center">
              No sizes found.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
</div>

<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{editingSize ? "Edit Size" : "Create Size"}</Dialog.Title>
    </Dialog.Header>
    <form
      method="POST"
      action="?/save"
      use:enhance={() => {
        isSubmitting = true;
        return async ({ result }) => {
          isSubmitting = false;
          if (result.type === "success") {
            isDialogOpen = false;
            toast.success(
              `Size ${editingSize ? "updated" : "created"} successfully`,
            );
            await invalidateAll();
          } else {
            toast.error("Failed to save size");
          }
        };
      }}
      class="space-y-4 pt-4"
    >
      {#if editingSize}
        <input type="hidden" name="id" value={editingSize.id} />
      {/if}
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            name="name"
            bind:value={sizeName}
            placeholder="e.g. Large"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="abbreviation">Abbreviation</Label>
          <Input
            id="abbreviation"
            name="abbreviation"
            bind:value={sizeAbbreviation}
            placeholder="e.g. L"
            required
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            bind:value={sizeSortOrder}
            required
          />
        </div>
        <div class="flex items-center justify-between pt-8">
          <Label for="isActive">Active Status</Label>
          <Switch id="isActive" bind:checked={sizeIsActive} />
          <input type="hidden" name="isActive" value={sizeIsActive} />
        </div>
      </div>
      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          onclick={() => (isDialogOpen = false)}>Cancel</Button
        >
        <Button type="submit" disabled={isSubmitting}>
          {#if isSubmitting}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Saving...
          {:else}
            Save Size
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
