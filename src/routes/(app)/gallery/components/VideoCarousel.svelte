<script lang="ts">
  import type { iFile } from "$lib/interface";
  import * as Carousel from "$lib/components/ui/carousel/index.js";

  interface Props {
    videos: iFile[];
  }

  let { videos }: Props = $props();
</script>

<div class="w-full max-w-5xl mx-auto px-4">
  <Carousel.Root
    opts={{
      align: "start",
      loop: true,
    }}
    class="w-full"
  >
    <Carousel.Content>
      {#each videos as video}
        <Carousel.Item class="md:basis-1/2 lg:basis-1/2">
          <div class="p-1">
            <div
              class="relative aspect-video rounded-3xl overflow-hidden bg-black group shadow-lg"
            >
              <video
                src={video.url}
                class="w-full h-full object-cover"
                controls
                preload="metadata"
              >
                <track kind="captions" />
              </video>
            </div>
            <p
              class="mt-4 text-sm font-bold text-center truncate px-2 uppercase tracking-widest text-muted-foreground"
            >
              {video.name || "Event Highlight"}
            </p>
          </div>
        </Carousel.Item>
      {/each}
    </Carousel.Content>
    <div class="hidden md:block">
      <Carousel.Previous />
      <Carousel.Next />
    </div>
  </Carousel.Root>
</div>
