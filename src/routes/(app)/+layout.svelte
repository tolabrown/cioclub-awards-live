<script lang="ts">
  import Header from "$lib/components/sections/header.svelte";
  import Footer from "$lib/components/sections/footer.svelte";
  import MobileNav from "$lib/components/sections/mobile-nav.svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  
  let { children, data } = $props();
</script>

<QueryClientProvider client={infiniteScroll.queryClient}>
  <div class="flex min-h-screen flex-col animate-in">
    <Header onOpenPopup={() => {}} />
    <main class="flex-1">
      {@render children()}
    </main>
    <Footer />
    <MobileNav onOpenPopup={() => {}} />
  </div>
</QueryClientProvider>
