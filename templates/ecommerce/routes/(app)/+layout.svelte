<script lang="ts">
  import Header from "$lib/components/sections/header.svelte";
  import Footer from "$lib/components/sections/footer.svelte";
  import BottomNav from "$lib/components/widgets/BottomNav.svelte";
	import CookieConsentBtn from "$lib/components/widgets/CookieConsentBtn.svelte";
	import WhatsAppFAB from "$lib/components/widgets/WhatsAppFAB.svelte";
  
  let { children } = $props();
</script>

<div class="flex min-h-screen flex-col animate-in pb-16 lg:pb-0">
  <Header />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
  <BottomNav />
</div>
<!-- Global Widgets -->
<WhatsAppFAB />
<CookieConsentBtn />
