<script lang="ts">
  import Header from "$lib/components/sections/header.svelte";
  import Footer from "$lib/components/sections/footer.svelte";
  import MobileNav from "$lib/components/sections/mobile-nav.svelte";
  import PopupCarousel from "$lib/components/widgets/PopupCarousel.svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  
  let { children, data } = $props();
  let isPopupOpen = $state(false);
</script>

<QueryClientProvider client={infiniteScroll.queryClient}>
  <div class="flex min-h-screen flex-col animate-in">
    <Header onOpenPopup={() => (isPopupOpen = true)} />
    <main class="flex-1">
      {@render children()}
    </main>
    <Footer />
    <MobileNav onOpenPopup={() => (isPopupOpen = true)} />

    <PopupCarousel 
      nominationPeriod={data.popupData?.nominationPeriod} 
      upcomingEvent={data.popupData?.upcomingEvent}
      bind:open={isPopupOpen}
    />
  </div>
</QueryClientProvider>
