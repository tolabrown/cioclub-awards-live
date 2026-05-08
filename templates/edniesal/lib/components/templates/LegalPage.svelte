<script lang="ts">
  import SEO from "$lib/components/widgets/SEO.svelte";
  
  let { data } = $props();
  const page = $derived(data.page.data);
</script>

<SEO 
  title={data.page.title} 
  description={data.page.description} 
  ogimage={data.page.ogimage} 
/>

<div class="py-24 bg-background">
  <div class="container mx-auto px-4 max-w-4xl">
    <div class="space-y-8">
      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">{data.page.title}</h1>
        <p class="text-muted-foreground text-lg italic">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div class="prose prose-lg dark:prose-invert max-w-none prose-headings:tracking-tight">
        {#if page.content}
          {@html page.content}
        {:else}
          <div class="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
            No content available for this page yet. Please add content via the admin dashboard.
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
