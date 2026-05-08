<script lang="ts">
  import {
    ChevronLeft,
    CheckCircle2,
    Loader2,
    Globe,
    Building2,
    UserCircle2,
    Mail,
    Phone,
    ArrowRight,
    Info,
    Zap,
    ShieldCheck,
    Sparkles,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";
  import { toast } from "svelte-sonner";

  let { data } = $props();
  const event = $derived(data.event);

  let isSubmitting = $state(false);

  let formData = $state({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    organization: "",
    designation: "",
    category: "pass",
  });

  const packages = [
    {
      id: "package",
      name: "Full Experience",
      badge: "BEST VALUE",
      price: 1500,
      accent: "from-pink-500 to-rose-600",
      accentBg: "bg-pink-500/8 border-pink-500/20",
      accentBadge: "bg-pink-500 text-white",
      description: [
        "4-start hotel accommodation - 5 nights",
        "Breakfast Inclusive",
        "Single occupancy",
        "Airport Transfers",
        "Complimentary Airport VIP Lounge (LOS - KGL)",
        "Concierge Service",
        "Access to the conference",
        "Kigali city tour",
      ],
    },
    {
      id: "pass",
      name: "Conference Pass",
      badge: null,
      price: 200,
      accent: "from-violet-500 to-purple-600",
      accentBg: "bg-violet-500/8 border-violet-500/20",
      accentBadge: null,
      description: [
        "Full conference access",
        "All sessions & workshops",
        "Networking opportunities",
      ],
    },
  ];

  const selected = $derived(packages.find((p) => p.id === formData.category)!);

  async function handleRegister(e: Event) {
    e.preventDefault();
    isSubmitting = true;

    try {
      const res = await fetch("/api/ladies-in-tech/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId: event.id,
          amount: selected.price,
        }),
      });

      const result = await res.json();

      if (result.success && result.paymentLink) {
        window.location.href = result.paymentLink;
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Register — {event.title}</title>
</svelte:head>

<div
  class="min-h-screen bg-background relative overflow-hidden font-sans pb-20"
>
  <!-- Subtle Grid Background -->
  <div
    class="fixed inset-0 pointer-events-none opacity-[0.05] -z-10"
    style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 30px 30px;"
  ></div>

  <div class="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
    <!-- Back Navigation -->
    <div class="mb-8">
      <Button
        variant="ghost"
        href="/ladies-in-tech/{event.id}"
        class="gap-2 text-muted-foreground hover:text-foreground hover:bg-transparent px-0 text-xs font-bold uppercase tracking-widest"
      >
        <ChevronLeft class="size-4" /> Back to event
      </Button>
    </div>

    <!-- Header Section -->
    <div class="text-center mb-8 space-y-2">
      <h1 class="text-3xl md:text-5xl font-bold tracking-tighter leading-none">
        Registration: <span class="text-pink-600">Ladies In Tech</span>
      </h1>
      <div
        class="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]"
      >
        <span>Ladies In Tech 4.0</span>
        <span class="text-pink-600">•</span>
        <span>2026</span>
      </div>
    </div>

    <!-- Main Registration Form -->
    <form onsubmit={handleRegister}>
      <div class="grid lg:grid-cols-2 gap-4 md:gap-6 items-start">
        <!-- LEFT COLUMN: Personal Information -->
        <div class="space-y-8">
          <div
            class="bg-card rounded-2xl border border-border/50 shadow-sm p-4 md:p-6 space-y-10"
          >
            <h2 class="text-xl font-bold uppercase text-foreground/80">
              Personal Information
            </h2>

            <div class="grid grid-cols-2 gap-6">
              <!-- First & Last Name -->
              <div class="space-y-2.5">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >First Name</Label
                >
                <div class="relative">
                  <UserCircle2
                    class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40"
                  />
                  <Input
                    bind:value={formData.firstName}
                    required
                    placeholder="Jane"
                    class="pl-12 border-border/60 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div class="space-y-2.5">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >Last Name</Label
                >
                <Input
                  bind:value={formData.lastName}
                  required
                  placeholder="Doe"
                  class="border-border/60 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm font-medium"
                />
              </div>

              <!-- Email Address -->
              <div class="space-y-2.5 col-span-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >Email Address</Label
                >
                <div class="relative">
                  <Mail
                    class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40"
                  />
                  <Input
                    type="email"
                    bind:value={formData.email}
                    required
                    placeholder="jane@example.com"
                    class="pl-12 border-border/60 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <!-- Phone Number -->
              <div class="space-y-2.5 col-span-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >Phone Number (with country code)</Label
                >
                <div class="relative">
                  <Phone
                    class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40"
                  />
                  <Input
                    bind:value={formData.phone}
                    required
                    placeholder="+234 800 000 0000"
                    class="pl-12 border-border/60 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <!-- Country -->
              <div class="space-y-2.5 col-span-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >Country of Residence</Label
                >
                <div class="relative">
                  <Globe
                    class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40"
                  />
                  <Input
                    bind:value={formData.country}
                    required
                    placeholder="Nigeria"
                    class="pl-12 border-border/60 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <!-- Organization & Designation -->
              <div class="space-y-2.5">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >Organization</Label
                >
                <div class="relative">
                  <Building2
                    class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40"
                  />
                  <Input
                    bind:value={formData.organization}
                    placeholder="Acme Inc"
                    class="pl-12 border-border/60 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div class="space-y-2.5">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >Designation</Label
                >
                <Input
                  bind:value={formData.designation}
                  placeholder="CTO"
                  class="border-border/60 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <!-- Important Notice Alert -->
          <div
            class="flex gap-4 p-6 rounded-2xl bg-orange-500/5 border border-orange-200/20 items-start"
          >
            <div
              class="size-6 rounded-full flex items-center justify-center border border-orange-200/30 shrink-0 mt-0.5"
            >
              <Info class="size-3.5 text-[#F97316]" />
            </div>
            <p class="text-[11px] text-orange-600 leading-relaxed font-bold">
              <span class="text-orange-500 uppercase tracking-wider mr-1"
                >Important Notice:</span
              > All registration fees exclude flight tickets. Participants are responsible
              for booking their own flights.
            </p>
          </div>
        </div>

        <!-- RIGHT COLUMN: Registration Category -->
        <div class="space-y-8 lg:sticky lg:top-8">
          <div
            class="bg-pink-500/[0.03] rounded-2xl border border-pink-500/10 shadow-sm space-y-10 p-4 md:p-6"
          >
            <h2 class="text-xl font-bold uppercase text-foreground/80">
              Registration Category
            </h2>

            <RadioGroup.Root bind:value={formData.category} class="space-y-6">
              {#each packages as pkg}
                <div class="relative group">
                  <RadioGroup.Item
                    value={pkg.id}
                    id={pkg.id}
                    class="peer sr-only"
                  />
                  <Label
                    for={pkg.id}
                    class="block p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative bg-card
                           {formData.category === pkg.id
                      ? 'border-pink-500 ring-4 ring-pink-500/5 shadow-xl'
                      : 'border-border/40 hover:border-pink-200 shadow-sm'}"
                  >
                    <!-- Selection Indicator -->
                    {#if formData.category === pkg.id}
                      <div
                        class="absolute -top-3 -right-3 size-7 bg-pink-500 rounded-full border-4 border-background flex items-center justify-center shadow-lg"
                      >
                        <CheckCircle2 class="size-3 text-white" />
                      </div>
                    {/if}

                    <div
                      class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
                    >
                      <div class="space-y-1">
                        <h3
                          class="font-bold text-sm uppercase tracking-wider text-foreground leading-tight"
                        >
                          {pkg.name}
                        </h3>
                        {#if pkg.badge}
                          <span
                            class="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-pink-500/10 text-pink-600 border border-pink-500/20 italic"
                          >
                            {pkg.badge}
                          </span>
                        {/if}
                      </div>
                      <div class="text-3xl font-bold text-pink-600">
                        ${pkg.price}
                      </div>
                    </div>

                    <ul class="space-y-3">
                      {#each pkg.description as item}
                        <li
                          class="flex items-center gap-2.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest"
                        >
                          <CheckCircle2
                            class="size-3.5 text-emerald-500 shrink-0"
                          />
                          {item}
                        </li>
                      {/each}
                    </ul>
                  </Label>
                </div>
              {/each}
            </RadioGroup.Root>

            <div
              class="border-t border-pink-500/10 flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              <div class="space-y-1">
                <p
                  class="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground"
                >
                  Total Fee
                </p>
                <p class="text-4xl font-bold text-foreground">
                  ${selected.price}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                class="bg-pink-600 hover:bg-pink-700 text-white shadow-xl shadow-pink-500/20 transition-all group"
              >
                {#if isSubmitting}
                  <Loader2 class="size-5 animate-spin" />
                {:else}
                  Proceed to Payment
                  <ArrowRight
                    class="ml-2 size-4 group-hover:translate-x-1 transition-transform"
                  />
                {/if}
              </Button>
            </div>

            <div
              class="flex flex-col items-center gap-6 pt-4 border-t border-pink-500/10"
            >
              <div
                class="flex items-center gap-3 text-[9px] text-muted-foreground/60 font-bold uppercase tracking-[0.4em]"
              >
                <ShieldCheck class="size-3 text-emerald-500/60" />
                Secured by Flutterwave
              </div>
              <div
                class="flex items-center justify-center gap-3 grayscale opacity-40"
              >
                {#each ["VISA", "MASTER", "AMEX"] as brand}
                  <div
                    class="h-6 w-10 border border-border/50 rounded flex items-center justify-center text-[7px] font-bold tracking-tighter"
                  >
                    {brand}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
