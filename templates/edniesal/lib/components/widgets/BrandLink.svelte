<script lang="ts">
  import { page } from "$app/state";
  import { Constants } from "$lib/constants/index";
  import Logo from "$lib/components/icons/logo.svelte";

  const settings = $derived(page.data.settings);
</script>

<a href="/" rel="prefetch" aria-label="logo" class="flex items-center gap-2">
  <Logo class="h-10 md:h-14 aspect-auto" />
  <!-- <div class="mt-2">
    <span class="font-bold text-lg block leading-[1] -mb-2"
      >{settings?.storeName || Constants.BRANDNAME}</span
    >
    <span
      class="text-[10px] text-muted-foreground leading-[1] uppercase font-bold"
      >{settings?.storeCaption || Constants.TAGLINE}</span
    >
  </div> -->
</a>
