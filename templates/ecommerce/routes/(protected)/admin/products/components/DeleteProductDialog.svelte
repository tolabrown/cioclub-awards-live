<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Loader2, AlertTriangle, Package, Trash2 } from "@lucide/svelte";
  import { formatPrice } from "$lib/fxns";

  interface Props {
    open: boolean;
    product: any;
    isDeleting: boolean;
    onConfirm: () => void;
    onClose: () => void;
  }

  let { open = $bindable(), product, isDeleting, onConfirm, onClose }: Props = $props();

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose();
    }
    open = val;
  };
</script>

<AlertDialog.Root {open} onOpenChange={handleOpenChange}>
  <AlertDialog.Content class="max-w-[400px] rounded-xl shadow-lg border-muted-foreground/10">
    <AlertDialog.Header>
      <div class="flex items-center gap-3 mb-2">
        <div class="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Trash2 class="h-5 w-5" />
        </div>
        <div>
          <AlertDialog.Title class="font-bold text-xl">Delete Product?</AlertDialog.Title>
          <AlertDialog.Description class="text-xs">
            This action cannot be undone.
          </AlertDialog.Description>
        </div>
      </div>
    </AlertDialog.Header>

    {#if product}
      <div class="py-4 space-y-3">
        <div class="p-3 bg-muted/30 rounded-lg border border-border flex items-center gap-3">
          <div class="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
            {#if product.images?.[0]?.url}
              <img src={product.images[0].url} alt="" class="h-full w-full object-cover" />
            {:else}
              <Package class="h-6 w-6 text-muted-foreground/40" />
            {/if}
          </div>
          <div class="min-w-0">
            <p class="font-bold text-sm truncate">{product.name}</p>
            <p class="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{product.sku}</p>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Will be removed:</p>
          <ul class="text-xs space-y-1.5 bg-destructive/5 p-3 rounded-lg border border-destructive/10">
            <li class="flex items-center gap-2 text-destructive-foreground/80">
              <span class="h-1 w-1 rounded-full bg-destructive"></span>
              All product images from storage
            </li>
            <li class="flex items-center gap-2 text-destructive-foreground/80">
              <span class="h-1 w-1 rounded-full bg-destructive"></span>
              All size variants and stock data
            </li>
            <li class="flex items-center gap-2 text-destructive-foreground/80">
              <span class="h-1 w-1 rounded-full bg-destructive"></span>
              All assigned tags and categories
            </li>
          </ul>
        </div>
      </div>
    {/if}

    <AlertDialog.Footer class="gap-2 sm:gap-0 mt-2">
      <AlertDialog.Cancel disabled={isDeleting}>
        Cancel
      </AlertDialog.Cancel>
      <Button 
        variant="destructive" 
        onclick={onConfirm}
        disabled={isDeleting}
      >
        {#if isDeleting}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        {:else}
          Delete Product
        {/if}
      </Button>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
