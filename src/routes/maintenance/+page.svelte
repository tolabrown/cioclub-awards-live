<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Construction,
    Clock,
    Hammer,
    Wrench,
    ArrowLeft,
    MonitorPlay,
    BellRing,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  const lastUpdated = "Maintenance ends in approximately 2 hours";
</script>

<div
  class="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden"
>
  <!-- Background Accents -->
  <div
    class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:40px_40px] opacity-40"
  ></div>
  <div
    class="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48"
  ></div>
  <div
    class="absolute bottom-0 left-0 w-96 h-96 bg-accent-gold/5 rounded-full blur-[120px] -ml-48 -mb-48"
  ></div>

  <div class="container max-w-4xl mx-auto px-4 relative z-10">
    <div
      class="bg-card border border-border shadow-lg rounded-xl p-12 lg:p-24 text-center space-y-12"
    >
      <!-- Icon Showcase -->
      <div class="flex justify-center">
        <div class="relative">
          <div
            class="absolute -inset-10 bg-accent-gold/10 rounded-full blur-3xl animate-pulse"
          ></div>
          <div
            class="relative size-32 lg:size-40 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-lg"
          >
            <Construction class="size-16 lg:size-20" />
            <div
              class="absolute -bottom-2 -right-2 bg-primary size-12 rounded-lg flex items-center justify-center text-primary-foreground shadow-md animate-bounce"
            >
              <Clock class="size-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
        >
          System Upgrade In Progress
        </div>
        <h1
          class="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight"
        >
          Refining the Experience
        </h1>
        <p
          class="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
        >
          We're currently enhancing our digital portal to provide a more
          seamless experience for our members across the continent.
        </p>
      </div>

      <!-- Status Grid -->
      <div class="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {#each [{ icon: Hammer, label: "Core Revamp", status: "Active" }, { icon: Wrench, label: "Optimization", status: "Ongoing" }, { icon: MonitorPlay, label: "UI Polish", status: "Finalizing" }] as item}
          <div
            class="p-6 rounded-xl bg-muted/50 border border-border space-y-2"
          >
            <item.icon class="size-6 text-primary mx-auto" />
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              {item.label}
            </p>
            <p class="text-sm font-bold text-foreground">{item.status}</p>
          </div>
        {/each}
      </div>

      <!-- Action -->
      <div class="pt-8 space-y-6">
        <div class="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            class="h-16 px-12 font-bold transition-all gap-3 shadow-lg"
          >
            <BellRing class="size-5" />
            Notify Me on Completion
          </Button>
          <a
            href="/"
            class="inline-flex h-16 items-center px-12 rounded-xl border-2 border-primary/20 text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary/5 transition-all gap-3"
          >
            <ArrowLeft class="size-5" />
            Return Home
          </a>
        </div>
        <p class="text-xs font-medium text-slate-500 uppercase tracking-widest">
          {lastUpdated}
        </p>
      </div>
    </div>

    <!-- Footer Meta -->
    <div class="mt-12 text-center">
      <p class="text-sm font-medium text-slate-500">
        Professional Support: <span class="text-slate-300"
          >info@thecioclubafrica.com</span
        >
      </p>
    </div>
  </div>
</div>
