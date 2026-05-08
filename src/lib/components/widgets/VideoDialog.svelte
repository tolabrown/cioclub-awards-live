<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Play } from "@lucide/svelte";

  let {
    videoUrl = "https://www.youtube.com/embed/Yaqsk7aHCak?si=fyqRhXfPSdfvyVr5",
    title = "CIO Awards 2025",
    open = $bindable(false),
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="sm:max-w-[1000px] p-0 overflow-hidden bg-black/90 border-white/10 ring-0 backdrop-blur-xl"
  >
    <Dialog.Header class="sr-only">
      <Dialog.Title>{title}</Dialog.Title>
    </Dialog.Header>
    <div class="aspect-video w-full shadow-2xl">
      {#if open}
        <iframe
          width="100%"
          height="100%"
          src={videoUrl}
          {title}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          class="w-full h-full"
        ></iframe>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
