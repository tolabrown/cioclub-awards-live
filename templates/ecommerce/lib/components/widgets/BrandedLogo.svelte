<script lang="ts">
  import { page } from "$app/state";
  import Logo from "$lib/components/icons/logo.svelte";
  import { cn } from "$lib/utils";

  let { class: className = "" } = $props<{ class?: string }>();

  const settings = $derived(page.data.settings);

  // We'll use a CSS-based approach for zero-flash switching
  // but also provide $derived for complex logic if needed.
</script>

<div class={cn("relative flex items-center justify-center", className)}>
  {#if settings?.logoLight?.url || settings?.logoDark?.url}
    {#if settings?.logoLight?.url}
      <img
        src={settings.logoLight.url}
        alt={settings.storeName}
        class={cn(
          "h-full w-full object-contain transition-opacity duration-300",
          settings.logoDark?.url ? "dark:hidden" : "",
        )}
      />
    {/if}

    {#if settings?.logoDark?.url}
      <img
        src={settings.logoDark.url}
        alt={settings.storeName}
        class={cn(
          "h-full w-full object-contain transition-opacity duration-300 hidden dark:block",
          !settings.logoLight?.url ? "block" : "",
        )}
      />
    {/if}
  {:else if settings?.logo?.url}
    <!-- Fallback to legacy logo if only that exists -->
    <img
      src={settings.logo.url}
      alt={settings.storeName}
      class="h-full w-full object-contain"
    />
  {:else}
    <Logo class="h-full w-full" />
  {/if}
</div>
