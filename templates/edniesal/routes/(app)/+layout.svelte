<script lang="ts">
  import Header from "$lib/components/sections/header.svelte";
  import Footer from "$lib/components/sections/footer.svelte";
  import MobileNav from "$lib/components/sections/mobile-nav.svelte";
  let { children } = $props();
</script>

<div class="flex min-h-screen flex-col animate-in">
  <Header />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
  <MobileNav />
</div>
