<script lang="ts">
  import type { LayoutProps } from "./$types";
  import Header from "$lib/components/sections/header.svelte";
  import Footer from "$lib/components/sections/footer.svelte";
  import CookieConsentBtn from "$lib/components/widgets/CookieConsentBtn.svelte";

  import BottomNav from "$lib/components/widgets/BottomNav.svelte";
  import ReviewPrompt from "$lib/components/store/ReviewPrompt.svelte";

  let { children, data }: LayoutProps = $props();

  let searchQuery = $state("");

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };
</script>

<div class="min-h-screen bg-background text-foreground">
  <Header />

  <!-- Main Content -->
  <main class="min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
    {@render children()}
  </main>

  <BottomNav />
  <Footer />
</div>

<!-- Global Widgets -->
<ReviewPrompt />
<CookieConsentBtn />
