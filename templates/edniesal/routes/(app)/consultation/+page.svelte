<script lang="ts">
  import { enhance } from "$app/forms";
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Loader2,
    CheckCircle2,
    Globe,
    Calendar,
    ArrowLeft,
    Sparkles,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";

  let { form } = $props();
  let loading = $state(false);
  let message = $state("");

  $effect(() => {
    if (form?.success) {
      toast.success(form.success);
    }
    if (form?.error) {
      toast.error(form.error);
    }
  });

  const countries = [
    { label: "Nigeria", value: "Nigeria" },
    { label: "Kenya", value: "Kenya" },
    { label: "Ghana", value: "Ghana" },
    { label: "Uganda", value: "Uganda" },
    { label: "South Africa", value: "South Africa" },
    { label: "DR Congo", value: "DR Congo" },
    { label: "Ethiopia", value: "Ethiopia" },
    { label: "Zambia", value: "Zambia" },
    { label: "Other", value: "Other" },
  ];

  const topics = [
    { label: "Digital Transformation", value: "Digital Transformation" },
    { label: "IT Consulting & Advisory", value: "IT Consulting & Advisory" },
    { label: "AI Services", value: "AI Services" },
    { label: "Data Services", value: "Data Services" },
    { label: "Infrastructure Services", value: "Infrastructure Services" },
    { label: "Cash Complete", value: "Cash Complete" },
    { label: "Cribro", value: "Cribro" },
    { label: "Simplex", value: "Simplex" },
    { label: "BluePrime", value: "BluePrime" },
    {
      label: "Customer Engagement Manager",
      value: "Customer Engagement Manager",
    },
    { label: "Other", value: "Other" },
  ];
</script>

<svelte:head>
  <title>Schedule a Free Consultation | edniesal</title>
  <meta
    name="description"
    content="Book a complimentary consultation with our master consultants."
  />
</svelte:head>

<div
  class="bg-background min-h-screen text-foreground relative overflow-hidden pb-24"
>
  <MeshGradient />

  <div
    class="fixed inset-0 pointer-events-none opacity-5 -z-20 [mask-image:linear-gradient(180deg,var(--foreground),transparent)]"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px);"
  ></div>

  <div class="container mx-auto px-4 pt-12 md:pt-20 relative z-10">
    <div class="max-w-4xl mx-auto">
      <Button href="/" variant="ghost" class="mb-8 group rounded-xl">
        <ArrowLeft
          class="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform"
        />
        Back to Home
      </Button>

      <div class="text-center mb-12">
        <div
          class="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 mb-6 animate-in fade-in"
        >
          <Calendar class="size-4 text-primary mr-2" />
          <span class="text-xs font-bold text-primary tracking-widest uppercase"
            >Consultation</span
          >
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Schedule a <span class="text-primary italic">Free Consultation</span>
        </h1>
        <p class="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
          Take the first step towards transforming your organization. Our
          experts are ready to listen and guide you.
        </p>
      </div>

      <Card.Root
        class="border-border/50 bg-card/60 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden"
      >
        {#if form?.success}
          <div class="p-12 text-center animate-in zoom-in duration-500">
            <div
              class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary shadow-lg shadow-primary/10"
            >
              <CheckCircle2 class="w-12 h-12" />
            </div>
            <h2 class="text-3xl font-bold mb-4">Request Received!</h2>
            <p class="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
              {form.success}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="/"
                variant="default"
                class="rounded-xl min-w-[200px]"
                >Return Home</Button
              >
              <Button
                href="/services"
                variant="outline"
                class="rounded-xl min-w-[200px]"
                >Our Services</Button
              >
            </div>
          </div>
        {:else}
          <form
            method="POST"
            action="?/submit"
            use:enhance={() => {
              loading = true;
              return async ({ update }) => {
                loading = false;
                await update();
              };
            }}
            class="p-6 md:p-12 space-y-8"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-2">
                <Label
                  for="firstName"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >First name <span class="text-primary">*</span></Label
                >
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="e.g. John"
                  required
                  class="bg-background/50 border-border focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>
              <div class="space-y-2">
                <Label
                  for="lastName"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Last name <span class="text-primary">*</span></Label
                >
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="e.g. Doe"
                  required
                  class="bg-background/50 border-border focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-2">
                <Label
                  for="country"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Country <span class="text-primary">*</span></Label
                >
                <SelectComponent
                  name="country"
                  placeholder="Select your country"
                  options={countries}
                  class="w-full bg-background/50 border-border rounded-xl font-medium"
                />
              </div>
              <div class="space-y-2">
                <Label
                  for="countryOther"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Country not on list?</Label
                >
                <Input
                  id="countryOther"
                  name="countryOther"
                  placeholder="Please Specify"
                  class="bg-background/50 border-border focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-2">
                <Label
                  for="company"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Company / Organization <span class="text-primary">*</span
                  ></Label
                >
                <Input
                  id="company"
                  name="company"
                  placeholder="e.g. Acme Corp"
                  required
                  class="bg-background/50 border-border focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>
              <div class="space-y-2">
                <Label
                  for="email"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Company email <span class="text-primary">*</span></Label
                >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@company.com"
                  required
                  class="bg-background/50 border-border focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-2">
                <Label
                  for="phone"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Phone <span class="text-primary">*</span></Label
                >
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+234 ..."
                  required
                  class="bg-background/50 border-border focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>
              <div class="space-y-2">
                <Label
                  for="topic"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >How Can We Help You? <span class="text-primary">*</span
                  ></Label
                >
                <SelectComponent
                  name="topic"
                  placeholder="Select a service"
                  options={topics}
                  class="w-full bg-background/50 border-border rounded-xl font-medium"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label
                for="message"
                class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                >Message <span class="text-primary">*</span></Label
              >
              <div
                class="bg-background/50 border border-border rounded-xl overflow-hidden"
              >
                <RichEditor bind:value={message} class="min-h-[200px]" />
                <input type="hidden" name="message" value={message} />
              </div>
              <p class="text-[10px] text-muted-foreground italic mt-1">
                To better assist you, please describe how we can help...
              </p>
            </div>

            <div class="pt-6">
              <Button
                type="submit"
                disabled={loading}
                class="w-full md:w-auto min-w-[200px] rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                {#if loading}
                  <Loader2 class="mr-2 h-5 w-5 animate-spin" /> Scheduling...
                {:else}
                  Submit Request <Sparkles class="ml-2 h-4 w-4" />
                {/if}
              </Button>
            </div>
          </form>
        {/if}
      </Card.Root>

      <div
        class="mt-12 text-center text-muted-foreground flex items-center justify-center gap-2"
      >
        <Globe class="size-4" />
        <span class="text-xs font-bold uppercase tracking-widest"
          >Global Advisory Strategic Excellence</span
        >
      </div>
    </div>
  </div>
</div>
