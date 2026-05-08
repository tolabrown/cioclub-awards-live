<script lang="ts">
  import {
    Plus,
    Minus,
    MessageCircle,
    Truck,
    CreditCard,
    RotateCcw,
    ShieldCheck,
    HelpCircle,
    ChevronDown,
    Search,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils";
  import { fade, slide } from "svelte/transition";

  let searchQuery = $state("");
  let activeTab = $state("general");

  const categories = [
    { id: "general", label: "General", icon: HelpCircle },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payment", label: "Payments", icon: CreditCard },
    { id: "returns", label: "Returns", icon: RotateCcw },
  ];

  const faqs = [
    {
      id: 1,
      category: "general",
      question: "How do I track my order?",
      answer:
        "You can track your order by visiting the 'Orders' section in your account dashboard. Once your order is shipped, we'll also send you an email with a tracking number and a link to trace your package.",
    },
    {
      id: 2,
      category: "shipping",
      question: "What are your shipping rates?",
      answer:
        "Shipping rates vary based on your location and the size of your package. We offer competitive rates through Jumia Shipping. You can calculate the exact shipping cost in your cart by selecting your delivery zone.",
    },
    {
      id: 3,
      category: "payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit and debit cards through our secure payment processor, Paystack. This includes Visa, Mastercard, and Verve. We also support bank transfers for verified customers.",
    },
    {
      id: 4,
      category: "returns",
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return policy for most items. If you're not satisfied with your purchase, you can initiate a return through your dashboard. Please ensure the item is in its original packaging and condition.",
    },
    {
      id: 5,
      category: "general",
      question: "Are your products authentic?",
      answer:
        "Yes, 100% of our products are sourced directly from authorized distributors or the manufacturers themselves. We guarantee the authenticity of every item sold on Lania Stores.",
    },
    {
      id: 6,
      category: "shipping",
      question: "How long does delivery take?",
      answer:
        "Typically, delivery within Lagos takes 1-2 business days. For other states, it usually takes 3-5 business days. You can see the estimated delivery time for your specific zone in the cart.",
    },
  ];

  let openId = $state<number | null>(null);

  const filteredFaqs = $derived(
    faqs.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = faq.category === activeTab;
      return matchesSearch && matchesCategory;
    }),
  );

  function toggleFaqAt(id: number) {
    if (openId === id) openId = null;
    else openId = id;
  }
</script>

<svelte:head>
  <title>Frequently Asked Questions | Lania Stores</title>
</svelte:head>

<div class="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
  <!-- Hero Section -->
  <section
    class="relative overflow-hidden bg-primary px-2 py-20 text-center text-primary-foreground"
  >
    <div class="absolute inset-0 opacity-10">
      <div
        class="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl"
      ></div>
      <div
        class="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white blur-3xl"
      ></div>
    </div>

    <div class="relative center">
      <Badge
        variant="outline"
        class="mb-4 border-primary-foreground/20 text-primary-foreground/80 uppercase tracking-widest px-4 py-1 rounded-full"
        >Support Center</Badge
      >
      <h1
        class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        How can we help you?
      </h1>
      <p class="mx-auto mb-10 max-w-xl text-lg text-primary-foreground/80">
        Find quick answers to common questions about shipping, payments,
        returns, and more.
      </p>

      <div class="relative mx-auto max-w-xl">
        <Search
          class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/50"
        />
        <Input
          type="search"
          placeholder="Search for questions..."
          bind:value={searchQuery}
          class="h-14 rounded-2xl border-none bg-white/95 pl-12 text-slate-900 shadow-2xl focus-visible:ring-white dark:bg-slate-900/95 dark:text-white"
        />
      </div>
    </div>
  </section>

  <div class="mx-auto max-w-4xl px-6 py-12">
    <!-- Category Tabs -->
    <div class="mb-12 flex flex-wrap justify-center gap-3">
      {#each categories as cat}
        <Button
          onclick={() => (activeTab = cat.id)}
          variant={activeTab === cat.id ? "default" : "outline"}
          class={cn(
            "gap-2",
            activeTab === cat.id && "shadow-lg shadow-primary/20",
          )}
        >
          <cat.icon class="h-4 w-4" />
          {cat.label}
        </Button>
      {/each}
    </div>

    <!-- FAQ List -->
    <div class="space-y-4">
      {#if filteredFaqs.length > 0}
        {#each filteredFaqs as faq (faq.id)}
          <div
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              onclick={() => toggleFaqAt(faq.id)}
              class="flex w-full items-center justify-between p-6 text-left"
            >
              <span
                class="text-base font-bold text-slate-900 dark:text-white sm:text-lg"
              >
                {faq.question}
              </span>
              <div
                class={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300",
                  openId === faq.id
                    ? "bg-primary/10 text-primary rotate-180"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800",
                )}
              >
                <ChevronDown class="h-5 w-5" />
              </div>
            </button>

            {#if openId === faq.id}
              <div
                transition:slide
                class="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                <div
                  class="border-t border-slate-100 dark:border-slate-800 pt-4"
                >
                  {faq.answer}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      {:else}
        <div class="py-20 text-center">
          <div
            class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <Search class="h-10 w-10 text-slate-300" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">
            No results found
          </h3>
          <p class="text-slate-500">
            We couldn't find any questions matching "{searchQuery}"
          </p>
          <Button variant="link" onclick={() => (searchQuery = "")} class="mt-2"
            >Clear search</Button
          >
        </div>
      {/if}
    </div>

    <!-- Contact CTA -->
    <div
      class="mt-20 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center text-white dark:from-primary dark:to-primary/80 lg:p-12"
    >
      <div class="mx-auto max-w-xl">
        <div class="mb-6 flex justify-center">
          <div
            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md"
          >
            <MessageCircle class="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 class="mb-4 text-3xl font-bold tracking-tight">
          Still have questions?
        </h2>
        <p class="mb-8 text-white/70">
          Can't find the answer you're looking for? Our friendly support team is
          here to help you.
        </p>
        <div
          class="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            href="/contact"
            class="rounded-xl bg-white font-bold text-slate-900 hover:bg-white/90"
          >
            Contact Us
          </Button>
          <Button
            variant="outline"
            class="rounded-xl border-white/20 font-bold text-white hover:bg-white/10"
          >
            Email Support
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
