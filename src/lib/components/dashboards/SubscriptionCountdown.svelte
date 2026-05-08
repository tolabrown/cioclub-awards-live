<script lang="ts">
  import { getDaysRemaining } from "$lib/utils/subscription";
  import * as Card from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import { Button } from "$lib/components/ui/button";
  import { Calendar, AlertCircle, Zap, ShieldCheck } from "@lucide/svelte";
  import { slide, fade } from "svelte/transition";

  interface Props {
    subscriptionEndsAt: Date | string | null | undefined;
  }

  let { subscriptionEndsAt }: Props = $props();

  const daysLeft = $derived(getDaysRemaining(subscriptionEndsAt));
  const isExpiringSoon = $derived(daysLeft > 0 && daysLeft <= 30);
  const isExpired = $derived(daysLeft === 0);
  const isOneYear = $derived(daysLeft === 365);

  // Progress calculation (based on a typical 365 day year)
  // If more than 365 days, cap at 100%
  const progress = $derived(Math.min(100, (daysLeft / 365) * 100));

  function formatDays(days: number) {
    if (days === 0) return "Expired";
    if (days === 365) return "1 Year";
    if (days > 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      return remainingDays > 0 ? `${years}y ${remainingDays}d` : `${years} Year${years > 1 ? 's' : ''}`;
    }
    return `${days} Days`;
  }
</script>

<Card.Root class="relative overflow-hidden border border-white/10 shadow-2xl bg-[#0A0A0A]/80 backdrop-blur-xl group">
  <!-- Decorative background elements -->
  <div class="absolute -top-24 -right-24 size-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-colors duration-700"></div>
  <div class="absolute -bottom-24 -left-24 size-64 bg-amber-500/5 blur-[100px] rounded-full"></div>

  <Card.Content class="p-0 relative z-10">
    <div class="flex flex-col md:flex-row items-stretch">
      <!-- Left side: Status & Countdown -->
      <div class="p-8 flex-1 w-full space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div 
              class={`p-3 rounded-2xl transition-all duration-500 shadow-inner ${
                isExpired ? 'bg-destructive/10 text-destructive border border-destructive/20' : 
                isExpiringSoon ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                'bg-primary/10 text-primary border border-primary/20'
              } group-hover:scale-110`}
            >
              {#if isExpired}
                <AlertCircle class="size-6" />
              {:else if isExpiringSoon}
                <Zap class="size-6 animate-pulse" />
              {:else}
                <ShieldCheck class="size-6" />
              {/if}
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                Subscription Balance
              </p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-4xl font-black tracking-tight text-white tabular-nums">
                  {isOneYear ? "1" : (isExpired ? "0" : daysLeft)}
                </h3>
                <span class="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                  {isOneYear ? "Year" : "Days Left"}
                </span>
              </div>
            </div>
          </div>
          
          {#if isExpiringSoon}
            <div in:fade class="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 shadow-lg shadow-amber-500/5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span class="text-[10px] font-black uppercase tracking-widest">Urgent Renewal</span>
            </div>
          {:else if !isExpired}
            <div class="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
              <div class="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span class="text-[10px] font-black uppercase tracking-widest text-white/90">Active Protocol</span>
            </div>
          {/if}
        </div>

        <div class="space-y-3 pt-2">
          <div class="flex justify-between items-end">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Status Verification</span>
            <span class="text-sm font-black text-white/80">{Math.round(progress)}%</span>
          </div>
          <div class="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              class={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] ${
                isExpired ? 'bg-destructive w-0' : 
                isExpiringSoon ? 'bg-amber-500 w-[${progress}%]' : 
                'bg-primary'
              }`}
              style="width: {progress}%"
            ></div>
          </div>
        </div>
      </div>

      <!-- Right side: Strategic CTA -->
      <div class="bg-white/[0.02] p-8 md:w-80 w-full flex flex-col justify-center gap-6 border-t md:border-t-0 md:border-l border-white/5 backdrop-blur-sm">
        <div class="space-y-2">
          <h4 class="text-sm font-bold text-white tracking-wide">Strategic Continuity</h4>
          <p class="text-xs text-muted-foreground leading-relaxed font-medium">
            Maintain your position in the African IT elite. Access to restricted resources and elite networking depends on your membership status.
          </p>
        </div>
        <a href="/membership#join" class="w-full">
          <Button 
            class={`w-full gap-3 shadow-2xl transition-all duration-300 rounded-xl active:scale-95 ${
              isExpiringSoon 
                ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20' 
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20'
            }`}
          >
            <Zap class="size-4" />
            {(isExpired || isExpiringSoon) ? 'Renew Membership' : 'Extend Tenure'}
          </Button>
        </a>
      </div>
    </div>
  </Card.Content>
</Card.Root>

<style>
  :root {
    --primary-rgb: 245, 158, 11; /* Coordinating with the amber theme of the dashboard */
  }
</style>
