<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    CheckCircle2,
    ArrowRight,
    Home,
    Newspaper,
    Calendar,
    LayoutDashboard,
    Quote,
    Award,
    ShieldCheck,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
</script>

<div
  class="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4"
>
  <div class="max-w-4xl w-full">
    <div
      class="bg-card border border-border shadow-lg rounded-xl p-12 lg:p-24 text-center space-y-12"
    >
      <!-- Background Decorative -->
      <div
        class="absolute inset-0 bg-[radial-gradient(#135bec11_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
      ></div>
      <div
        class="absolute -right-24 -top-24 size-96 bg-primary/5 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -left-24 -bottom-24 size-96 bg-accent-gold/5 rounded-full blur-3xl"
      ></div>

      <!-- Icon & Success Message -->
      <div class="space-y-8 relative z-10">
        <div class="flex justify-center">
          <div class="relative">
            <div
              class="absolute -inset-8 bg-primary/10 rounded-full blur-2xl animate-pulse"
            ></div>
            <div
              class="relative size-32 lg:size-40 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 class="size-16 lg:size-20" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h1
            class="text-4xl lg:text-6xl font-bold text-foreground tracking-tight"
          >
            Institutional <span class="text-primary italic">Alignment</span> Confirmed
          </h1>
          <p
            class="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Welcome to the enclave. Your membership status has been activated,
            granting you exclusive access to the continental tech ecosystem.
          </p>
        </div>
      </div>

      <!-- Brand Element / Visual -->
      <div
        class="relative h-48 lg:h-64 rounded-xl overflow-hidden shadow-lg group z-10"
      >
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb09SntfwhlabqNAyWt8XONvJqJ1X-ot_yy97xHE-1zv8lPBJ6QrDp-7-B0GOqXgNRY46qJeGPg5euMuqiRtTa3YS1Mr13iqXRF-NjcJHv-6orJQ2HHeNHKa75G-eTBreHQYeemH88bUeDVBzLyFs_eMHR5yPpEINi8pLV3zldSTnyNPYvQ4W6gg95apC80xAJt_2yuITkK5BPCYNaNZ9BcHP5w6cQTY_8987gGxFQxNeobdieThCwHpqNsVqsLPjW0ul52aS0uw"
          alt="Elite Network"
          class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-[#002B5B]/80 via-transparent to-transparent flex items-end justify-center p-8"
        >
          <div
            class="flex items-center gap-2 text-white font-bold uppercase text-xs tracking-widest bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20"
          >
            <ShieldCheck class="size-4" />
            Verified Member
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid sm:grid-cols-2 gap-6 relative z-10 pt-8">
        <Button
          class="h-20 rounded-xl font-bold uppercase text-sm tracking-widest shadow-lg transition-all active:scale-95 gap-3"
        >
          <LayoutDashboard class="size-5" />
          Member Dashboard
        </Button>
        <Button
          variant="outline"
          class="h-20 rounded-xl border-border font-bold uppercase text-sm tracking-widest hover:bg-muted transition-all active:scale-95 gap-3 text-foreground"
        >
          <Newspaper class="size-5 text-primary" />
          Explore Newsroom
        </Button>
      </div>

      <!-- Footer Vision -->
      <div class="pt-12 text-center relative z-10 border-t border-border">
        <p
          class="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground"
        >
          Powered by Excellence Since 19XX
        </p>
      </div>
    </div>
  </div>
</div>
