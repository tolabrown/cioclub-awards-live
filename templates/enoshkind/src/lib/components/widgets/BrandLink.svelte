<script lang="ts">
  import Logo from "$lib/components/icons/logo.svelte";
  import { Constants } from "$lib/constants";
</script>

<a href="/" rel="prefetch" aria-label="logo" class="flex items-center gap-1">
  <Logo class="size-8 aspect-square" />
  <div class="flex flex-col">
    <span class="font-bold text">{Constants.BRANDNAME}</span>
    <span class="text-muted-foreground text-sm leading-3">{Constants.BRANDCAPTION}</span>
  </div>
</a>
