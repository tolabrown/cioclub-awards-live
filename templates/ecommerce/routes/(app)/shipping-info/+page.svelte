<script lang="ts">
  import {
    Truck,
    ShieldCheck,
    Clock,
    MapPin,
    Package,
    ArrowRight,
    CheckCircle2,
    Info,
    PhoneCall,
    Mail,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Card, CardContent } from "$lib/components/ui/card";
  import JumiaLogo from "$lib/components/icons/JumiaLogo.svelte";
  import { COMPANY_INFO } from "$lib/constants/index";
  import JumiaLogoWhite from "$lib/components/icons/JumiaLogoWhite.svelte";

  const benefits = [
    {
      title: "Real-Time Tracking",
      description:
        "Know exactly where your package is at every step of the journey with Jumia's advanced tracking system.",
      icon: MapPin,
    },
    {
      title: "Secure Handling",
      description:
        "Our logistics partners are trained to handle your items with the utmost care, from warehouse to doorstep.",
      icon: ShieldCheck,
    },
    {
      title: "Express Delivery",
      description:
        "Priority processing for your orders ensures they reach you faster than traditional shipping methods.",
      icon: Clock,
    },
  ];

  const steps = [
    {
      title: "Order Confirmation",
      description:
        "Once you place an order, we verify and process it within 24 hours.",
    },
    {
      title: "Quality Inspection",
      description:
        "Every item undergoes a rigorous quality check before being packed.",
    },
    {
      title: "In Transit",
      description:
        "Your package is handed over to Jumia Logistics for rapid transit.",
    },
    {
      title: "Last-Mile Delivery",
      description:
        "The local delivery agent brings the package right to your specific location.",
    },
  ];
</script>

<svelte:head>
  <title>Shipping Information | Lania Stores</title>
</svelte:head>

<div class="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
  <!-- Hero Section -->
  <section class="relative overflow-hidden bg-slate-900 px-2 py-24 text-white">
    <div class="absolute inset-0 opacity-20">
      <div
        class="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]"
      ></div>
      <div
        class="absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]"
      ></div>
    </div>

    <div class="relative center">
      <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div class="space-y-8">
          <Badge
            variant="outline"
            class="border-primary/50 text-primary uppercase tracking-widest px-4 py-1 rounded-full bg-primary/10"
            >Logistics Excellence</Badge
          >
          <h1 class="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Swift & Secure <br />
            <span class="text-primary">Delivery Services</span>
          </h1>
          <p class="max-w-xl text-lg text-slate-400">
            We partner with Jumia Logistics to provide world-class shipping
            solutions across Nigeria. Experience reliable, fast, and fully
            tracked delivery for every order.
          </p>
          <div class="flex flex-wrap gap-4">
            <Button href="/products">Start Shopping</Button>
            <Button
              variant="outline"
              href="https://www.jumia.com.ng/sp-jumia-delivery/"
              target="_blank"
              rel="noopener noreferrer"
              class="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <JumiaLogoWhite class="!h-4 !w-16 shrink-0" />
              <span class="whitespace-nowrap">Authorized Partner</span>
            </Button>
          </div>
        </div>

        <div class="relative lg:block hidden">
          <div
            class="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-2xl"
          ></div>
          <img
            src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&q=80&w=1000"
            alt="Logistics"
            class="relative rounded-3xl border border-white/10 shadow-2xl transition-transform hover:scale-[1.02]"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Benefits -->
  <section class="px-2 py-20">
    <div class="center">
      <div class="mb-16 text-center">
        <h2
          class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
        >
          Why choose our shipping?
        </h2>
        <div class="mt-4 h-1.5 w-24 mx-auto rounded-full bg-primary"></div>
      </div>

      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each benefits as benefit}
          <div
            class="group relative rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-primary/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"
            >
              <benefit.icon class="h-7 w-7" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-slate-900 dark:text-white">
              {benefit.title}
            </h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              {benefit.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- How it Works -->
  <section
    class="bg-white dark:bg-slate-900 px-2 py-12 border-y border-slate-200 dark:border-slate-800"
  >
    <div class="center w-full">
      <div class="grid gap-16 lg:grid-cols-2">
        <div>
          <h2
            class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Seamless Logistic Journey
          </h2>
          <p class="mt-6 text-lg text-slate-600 dark:text-slate-400">
            From the moment you hit "Checkout" to the second the package arrives
            at your door, we've optimized every mile to ensure efficiency and
            safety.
          </p>

          <div class="mt-12 space-y-10">
            {#each steps as step, i}
              <div class="flex gap-6">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                >
                  {i + 1}
                </div>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p class="mt-1 text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div
          class="rounded-3xl bg-slate-50 p-8 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
        >
          <div class="mb-8 flex items-center gap-3">
            <Info class="h-6 w-6 text-primary" />
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
              Delivery Timelines
            </h3>
          </div>

          <div class="space-y-6">
            <div
              class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500"
                >
                  <CheckCircle2 class="h-6 w-6" />
                </div>
                <span class="font-bold text-slate-700 dark:text-slate-300"
                  >Lagos State</span
                >
              </div>
              <span
                class="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-bold text-green-600"
                >1 - 2 Days</span
              >
            </div>

            <div
              class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"
                >
                  <CheckCircle2 class="h-6 w-6" />
                </div>
                <span class="font-bold text-slate-700 dark:text-slate-300"
                  >South West / North Central</span
                >
              </div>
              <span
                class="rounded-lg bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-600"
                >3 - 4 Days</span
              >
            </div>

            <div
              class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500"
                >
                  <CheckCircle2 class="h-6 w-6" />
                </div>
                <span class="font-bold text-slate-700 dark:text-slate-300"
                  >Other Locations</span
                >
              </div>
              <span
                class="rounded-lg bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-600"
                >5 - 7 Days</span
              >
            </div>
          </div>

          <div
            class="mt-8 rounded-2xl bg-primary/5 p-6 border border-primary/10"
          >
            <p
              class="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic"
            >
              * Delivery times are estimated business days and may vary during
              peak seasons or promotional events.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Help Desk -->
  <section class="px-2 py-20">
    <div class="mx-auto max-w-4xl text-center">
      <h2
        class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
      >
        Need delivery assistance?
      </h2>
      <p class="mt-4 text-slate-600 dark:text-slate-400">
        Our logistics support desk is available 24/7 to help track your items or
        resolve any issues.
      </p>

      <div class="mt-12 grid gap-6 sm:grid-cols-2">
        <a
          href="tel:{COMPANY_INFO.phone}"
          class="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <PhoneCall class="h-6 w-6" />
          </div>
          <div class="text-left">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >
              Call Us
            </p>
            <p class="text-lg font-bold text-slate-900 dark:text-white">
              {COMPANY_INFO.phone}
            </p>
          </div>
        </a>

        <a
          href="mailto:{COMPANY_INFO.email}"
          class="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500"
          >
            <Mail class="h-6 w-6" />
          </div>
          <div class="text-left">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >
              Email Us
            </p>
            <p class="text-lg font-bold text-slate-900 dark:text-white">
              {COMPANY_INFO.email}
            </p>
          </div>
        </a>
      </div>
    </div>
  </section>
</div>
