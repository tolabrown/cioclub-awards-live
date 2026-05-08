<script lang="ts">
  import { browser } from "$app/environment";
  import ProductDetailsView from "./ProductDetailsView.svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

  interface Props {
    open: boolean;
    product: any;
    isLoading?: boolean;
    onClose: () => void;
  }

  let {
    open = $bindable(),
    product,
    isLoading = false,
    onClose,
  }: Props = $props();

  let isMobile = $state(false);

  // Dynamic imports
  let Dialog: any = $state(null);
  let Drawer: any = $state(null);

  $effect(() => {
    if (browser) {
      import("$lib/components/ui/dialog/index.js").then((module) => {
        Dialog = module;
      });
      import("$lib/components/ui/drawer/index.js").then((module) => {
        Drawer = module;
      });
    }
  });

  $effect(() => {
    if (browser) {
      const checkMobile = () => {
        isMobile = window.innerWidth < 1024;
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
    }
    open = newOpen;
  };
</script>

{#if product}
  {#if !isMobile}
    {#if Dialog}
      <Dialog.Root {open} onOpenChange={handleOpenChange}>
      <Dialog.Content
        class="w-full !max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-xl border-none shadow-lg"
      >
        <ScrollArea class="h-full max-h-[90vh] p-8">
          <ProductDetailsView
            {product}
            reviewStats={product.reviewStats}
            showTabs={false}
          />
        </ScrollArea>
      </Dialog.Content>
      </Dialog.Root>
    {/if}
  {:else}
    {#if browser && Drawer}
      <Drawer.Root {open} onOpenChange={handleOpenChange}>
        <Drawer.Content class="max-h-[85vh]">
          <Drawer.Header class="text-left px-6 pt-6">
            <Drawer.Title class="text-xl font-bold">{product.name}</Drawer.Title>
          </Drawer.Header>
          <div class="overflow-y-auto px-6 pb-12 mt-4 scrollbar-hide">
            <ProductDetailsView
              {product}
              reviewStats={product.reviewStats}
              showTabs={false}
            />
          </div>
        </Drawer.Content>
      </Drawer.Root>
    {/if}
  {/if}
{/if}
