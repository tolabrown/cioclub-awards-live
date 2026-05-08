<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Sparkles, ArrowRight, Calendar } from "@lucide/svelte";
</script>

<div class="relative z-20 -mt-12 md:-mt-16 container mx-auto px-4">
  <div
    class="glass border-primary/20 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 bg-background/80 backdrop-blur-xl group hover:border-primary/40 transition-all duration-500"
  >
    <div class="flex items-center gap-6">
      <div
        class="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500"
      >
        <Calendar class="size-8" />
      </div>
      <div class="space-y-1">
        <h3 class="text-xl md:text-2xl font-bold tracking-tight">
          Need Expert Strategic Guidance?
        </h3>
        <p class="text-muted-foreground font-medium">
          Book a complimentary consultation with our master consultants.
        </p>
      </div>
    </div>

    <Button
      href="/consultation"
      class="w-full md:w-auto rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
    >
      Schedule Free Consultation
      <ArrowRight
        class="size-4 group-hover:translate-x-1 transition-transform"
      />
    </Button>
  </div>
</div>

<style>
  .glass {
    background: rgba(var(--background-rgb), 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(var(--primary-rgb), 0.1);
  }
</style>
