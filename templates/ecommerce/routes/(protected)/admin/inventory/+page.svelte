<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Boxes,
    Package,
    AlertTriangle,
    Search,
    Loader2,
  } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Badge } from "$lib/components/ui/badge";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const { products, search } = $derived(data);

  let isUpdateDialogOpen = $state(false);
  let isUpdating = $state(false);
  let selectedProduct = $state<any>(null);
  let newQuantity = $state(0);

  const getStockBadge = (quantity: number, threshold: number) => {
    if (quantity <= 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity <= threshold)
      return { label: "Low Stock", variant: "destructive" as const };
    return { label: "In Stock", variant: "outline" as const };
  };

  function openUpdateDialog(product: any) {
    selectedProduct = product;
    newQuantity = product.stockQuantity;
    isUpdateDialogOpen = true;
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-bold tracking-tight">Inventory</h1>
    <p class="text-muted-foreground">
      Monitor stock levels, set alerts, and manage product availability.
    </p>
  </div>

  <div class="flex items-center gap-4">
    <form class="relative flex-1 max-w-sm">
      <Input
        name="search"
        value={search}
        placeholder="Search products or SKU..."
        class="pl-10"
      />
      <Search
        class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
      />
    </form>
  </div>

  <div class="rounded-xl border bg-card overflow-hidden">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Product</Table.Head>
          <Table.Head>SKU</Table.Head>
          <Table.Head>Stock Quantity</Table.Head>
          <Table.Head>Threshold</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head class="text-right">Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each products as product}
          {@const stock = getStockBadge(
            product.stockQuantity,
            product.lowStockThreshold,
          )}
          <Table.Row>
            <Table.Cell class="font-medium">{product.name}</Table.Cell>
            <Table.Cell
              ><code class="text-xs bg-muted px-1.5 py-0.5 rounded"
                >{product.sku}</code
              ></Table.Cell
            >
            <Table.Cell>
              <div class="flex items-center gap-2">
                <span
                  class={product.stockQuantity <= product.lowStockThreshold
                    ? "text-destructive font-bold"
                    : ""}
                >
                  {product.stockQuantity}
                </span>
                {#if product.stockQuantity <= product.lowStockThreshold}
                  <AlertTriangle class="size-3.5 text-destructive" />
                {/if}
              </div>
            </Table.Cell>
            <Table.Cell class="text-muted-foreground"
              >{product.lowStockThreshold}</Table.Cell
            >
            <Table.Cell>
              <Badge
                variant={stock.variant}
                class={stock.label === "In Stock"
                  ? "text-emerald-600 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                  : ""}
              >
                {stock.label}
              </Badge>
            </Table.Cell>
            <Table.Cell class="text-right">
              <Button
                variant="ghost"
                size="sm"
                onclick={() => openUpdateDialog(product)}>Update Stock</Button
              >
            </Table.Cell>
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={6}
              class="h-32 text-center text-muted-foreground"
            >
              <Package class="size-8 mx-auto mb-2 opacity-20" />
              No products found.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>

<Dialog.Root bind:open={isUpdateDialogOpen}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Update Stock</Dialog.Title>
      <Dialog.Description>
        Adjust stock levels for <strong>{selectedProduct?.name}</strong>
      </Dialog.Description>
    </Dialog.Header>
    <form
      method="POST"
      action="?/updateStock"
      use:enhance={() => {
        isUpdating = true;
        return async ({ result }) => {
          isUpdating = false;
          if (result.type === "success") {
            isUpdateDialogOpen = false;
            toast.success("Stock updated successfully");
            await invalidateAll();
          } else {
            toast.error("Failed to update stock");
          }
        };
      }}
      class="space-y-4 pt-4"
    >
      <input type="hidden" name="id" value={selectedProduct?.id} />
      <div class="space-y-2">
        <Label for="quantity">New Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          bind:value={newQuantity}
          min="0"
          required
        />
        <p class="text-xs text-muted-foreground">
          Current stock: {selectedProduct?.stockQuantity}
        </p>
      </div>

      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          onclick={() => (isUpdateDialogOpen = false)}>Cancel</Button
        >
        <Button type="submit" disabled={isUpdating}>
          {#if isUpdating}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Updating...
          {:else}
            Save Changes
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
