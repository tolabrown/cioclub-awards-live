<script lang="ts">
  import * as CookieConsent from "vanilla-cookieconsent";
  import { onMount } from "svelte";
  import "vanilla-cookieconsent/dist/cookieconsent.css";
  import config from "$lib/common/cookieconsent-config";

  // Initialize cookie consent on mount
  onMount(() => {
    CookieConsent.run(config);
  });

  // Export the showPreferences function for use in other components
  export const showCookiePreferences = () => {
    CookieConsent.showPreferences();
  };
</script>

<!-- This component only initializes cookie consent, no UI rendered -->
