<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import { Button } from "$lib/components/ui/button";
  import { HelpCircle, Mail, ArrowLeft, MessageCircle } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  let { data } = $props();
</script>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section class="relative py-20 lg:py-32 overflow-hidden bg-slate-900">
    <div
      class="absolute inset-0 bg-linear-to-br from-primary/20 via-slate-900 to-background"
    ></div>
    <div
      class="absolute inset-0 bg-grid-white/[0.02] bg-size-[40px_40px]"
    ></div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-3xl">
        <Button
          variant="ghost"
          class="text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5 mb-8 -ml-4 font-bold"
          href="/awards"
        >
          <ArrowLeft class="size-4 mr-2" />
          Back to Awards
        </Button>
        <h1
          class="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-6"
        >
          Frequently Asked <span class="text-primary italic">Questions</span>
        </h1>
        <p
          class="text-xl text-white font-medium leading-relaxed"
        >
          Everything you need to know about the CIO & C-Suite Conference &
          Awards Africa.
        </p>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="py-24">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <div class="grid gap-12 lg:grid-cols-[1fr_300px]">
          <!-- Accordion -->
          <div class="space-y-4">
            <Accordion.Root type="single" class="w-full space-y-4">
              {#each data.faqs as faq, i}
                <Accordion.Item
                  value={`item-${i}`}
                  class="border rounded-xl bg-card shadow-sm px-4 overflow-hidden"
                >
                  <Accordion.Trigger class="hover:no-underline py-4">
                    <span
                      class="text-left font-bold text-lg text-foreground hover:text-primary transition-colors"
                    >
                      {faq.question}
                    </span>
                  </Accordion.Trigger>
                  <Accordion.Content
                    class="pb-6 text-muted-foreground font-medium leading-relaxed"
                  >
                    {faq.answer}
                  </Accordion.Content>
                </Accordion.Item>
              {/each}
            </Accordion.Root>
          </div>

          <!-- Sidebar Info -->
          <div class="space-y-6">
            <div
              class="p-8 rounded-xl bg-primary/5 border border-primary/10 space-y-4 sticky top-24"
            >
              <div
                class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
              >
                <MessageCircle class="size-6" />
              </div>
              <h3 class="text-xl font-bold text-foreground">
                Still have questions?
              </h3>
              <p class="text-sm text-muted-foreground font-medium">
                Our team is here to help with anything related to nominations,
                tickets, or sponsorship.
              </p>
              <div class="pt-2 flex flex-col gap-2">
                <Button
                  variant="default"
                  class="w-full rounded-xl font-bold shadow-md"
                  href="mailto:racheal@edniesalconsulting.com"
                >
                  <Mail class="size-4 mr-2" />
                  Email Racheal
                </Button>
                <Button
                  variant="outline"
                  class="w-full rounded-xl font-bold"
                  href="/partnerships"
                >
                  Partnership Info
                </Button>
              </div>
            </div>

            <div
              class="p-8 rounded-xl border border-border bg-card shadow-sm space-y-2"
            >
              <h4
                class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Location
              </h4>
              <p class="font-bold text-foreground">The Civic Center</p>
              <p class="text-sm text-muted-foreground font-medium">
                Ozumba Mbadiwe Ave, Victoria Island, Lagos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Banner -->
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-4">
      <div
        class="max-w-5xl mx-auto rounded-xl bg-card border border-border p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-lg"
      >
        <div class="text-center lg:text-left space-y-2">
          <h2 class="text-3xl font-bold text-foreground">
            Ready to join the elite?
          </h2>
          <p class="text-muted-foreground font-medium">
            Secure your place at Africa's biggest leadership gathering.
          </p>
        </div>
        <div class="flex gap-4">
          <Button
            variant="default"
            class="shadow-lg shadow-primary/20"
            >Reserve Ticket</Button
          >
        </div>
      </div>
    </div>
  </section>
</div>
