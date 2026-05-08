<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import type { User } from "$lib/auth";
  import { ArrowRight } from "@lucide/svelte";
  import { getStyle } from "@toolsntuts/utils";
  import { getContext } from "svelte";

  const user = getContext("me") as User | undefined;

  const style = getStyle("./bible_learning_kids.webp");
</script>

<section
  class="bg-gradient-hero relative aspect-[340/488] w-full overflow-hidden sm:aspect-[618/424] md:aspect-[768/472] lg:aspect-[1024/520] xl:aspect-[1440/424]"
>
  <div class="absolute size-full" {style}>
    <div class="size-full bg-black/60 dark:bg-background/70"></div>
  </div>
  <div
    class="absolute top-1/2 left-1/2 z-[1] mx-auto h-full w-full -translate-x-1/2 -translate-y-1/2 px-4 flex flex-col items-center justify-center padded"
  >
    <div class="flex flex-col gap-4 text-center">
      <h2 class="text-white">Remnant Christian Network Lagos</h2>
      <h1 class="text-white text-4xl font-bold md:text-7xl lg:text-8xl">
        Raising Total Kingdom Children
      </h1>
      <p class="mx-auto mb-8 max-w-3xl opacity-90 text-white">
        Raising children to be Heavenly Focused, Earthly Relevant, and
        Significant as Salt of the Earth and Light of the World.
      </p>
      <div class="flex flex-col justify-center gap-4 sm:flex-row">
        {#if user}
          <Button
            href="/children"
            size="lg"
            variant="outline"
          >
            View Children
            <ArrowRight class="ml-2 h-5 w-5" />
          </Button>
          <Button
            href="/dashboard"
            size="lg"
            variant="outline"
            class="border-primary-foreground px-8 py-4 hover:bg-primary-foreground hover:text-primary"
          >
            Dashboard
          </Button>
        {:else}
          <Button
            href="/auth/login?redirectTo=/children"
            size="lg"
            variant="outline"
          >
            Get Started Today
            <ArrowRight class="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            class="border-primary-foreground px-8 py-4 hover:bg-primary-foreground hover:text-primary"
          >
            Learn More
          </Button>
        {/if}
      </div>
    </div>
  </div>
</section>
