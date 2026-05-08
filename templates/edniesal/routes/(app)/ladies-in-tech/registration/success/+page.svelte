<script lang="ts">
  import {
    CheckCircle2,
    ArrowRight,
    Mail,
    Download,
    PartyPopper,
    Heart,
    RefreshCw,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { toPng } from "html-to-image";

  let mounted = $state(false);
  let cardRef = $state<HTMLElement | null>(null);
  let isSaving = $state(false);

  onMount(() => (mounted = true));

  async function saveConfirmation() {
    if (!cardRef) return;
    isSaving = true;

    try {
      // Small delay to ensure the bounce animation doesn't catch a weird frame
      await new Promise((r) => setTimeout(r, 200));

      const dataUrl = await toPng(cardRef, {
        quality: 1,
        pixelRatio: 2, // High clarity
        backgroundColor: "#ffffff",
        style: {
          borderRadius: "0", // Make it look like a clean ticket
        },
      });

      // Try to share first if supported (good for mobile)
      if (typeof navigator.share !== "undefined") {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "registration-confirmation.png", {
            type: "image/png",
          });
          await navigator.share({
            files: [file],
            title: "Registration Confirmation",
            text: "I just registered for Ladies in Tech 4.0!",
          });
          isSaving = false;
          return;
        } catch (shareError) {
          console.log("Share failed, falling back to download", shareError);
        }
      }

      // Fallback: Download
      const link = document.createElement("a");
      link.download = `registration-lit-4.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to save confirmation:", error);
    } finally {
      isSaving = false;
    }
  }
</script>

<div
  class="bg-background min-h-screen relative overflow-hidden flex items-center justify-center py-20"
>
  <MeshGradient />

  <div
    class="fixed inset-0 pointer-events-none opacity-5 -z-20 [mask-image:linear-gradient(180deg,var(--foreground),transparent)]"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px);"
  ></div>

  <div class="container mx-auto px-4 max-w-2xl relative z-10">
    <div bind:this={cardRef}>
      <Card.Root
        class="border-none bg-card/40 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden border-2 border-pink-500/10 text-center animate-in fade-in zoom-in duration-1000"
      >
        <div class="p-12 md:p-16 space-y-8">
          <!-- Success Icon -->
          <div class="relative inline-block">
            <div
              class="size-24 rounded-3xl bg-pink-500/10 flex items-center justify-center border-2 border-pink-500/20 shadow-xl shadow-pink-500/10 animate-bounce"
            >
              <CheckCircle2 class="size-12 text-pink-600" />
            </div>
            <div
              class="absolute -top-4 -right-4 size-10 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center animate-pulse"
            >
              <PartyPopper class="size-5 text-primary" />
            </div>
          </div>

          <!-- Success Message -->
          <div class="space-y-4">
            <h1
              class="text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-none text-foreground"
            >
              Registration <span class="text-pink-600 italic">Confirmed!</span>
            </h1>
            <p
              class="text-lg font-bold text-muted-foreground uppercase tracking-widest leading-relaxed max-w-md mx-auto"
            >
              Thank you for your registration and payment. We are excited to
              have you join us.
            </p>
          </div>

          <!-- Details Card -->
          <div
            class="bg-primary/5 rounded-3xl p-8 border border-primary/10 text-left space-y-6"
          >
            <div class="flex items-center gap-4">
              <div
                class="size-10 rounded-xl bg-background flex items-center justify-center border border-border"
              >
                <Heart class="size-5 text-pink-500" />
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase text-pink-600 tracking-widest"
                >
                  Event
                </p>
                <p class="font-bold">Ladies in Tech & Leadership 4.0</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div
                class="size-10 rounded-xl bg-background flex items-center justify-center border border-border"
              >
                <Mail class="size-5 text-primary" />
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase text-primary tracking-widest"
                >
                  Confirmation Sent
                </p>
                <p class="font-bold text-muted-foreground">
                  Check your inbox for full details
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-4 pt-4">
            <Button
              href="/ladies-in-tech"
              class="w-full shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              Explore More Events <ArrowRight class="ml-2 size-4" />
            </Button>

            <Button
              variant="ghost"
              class="w-full rounded-2xl text-muted-foreground hover:text-foreground"
              onclick={saveConfirmation}
              disabled={isSaving}
            >
              {#if isSaving}
                <RefreshCw class="mr-2 size-4 animate-spin" /> Saving...
              {:else}
                <Download class="mr-2 size-4" /> Save Confirmation
              {/if}
            </Button>
          </div>

          <!-- Note -->
          <p
            class="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]"
          >
            Transaction Verified & Securely Processed
          </p>
        </div>
      </Card.Root>
    </div>
  </div>
</div>
