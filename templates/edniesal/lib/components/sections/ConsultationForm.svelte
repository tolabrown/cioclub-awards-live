<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Loader2,
    CheckCircle2,
    Sparkles,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";

  let loading = $state(false);
  let submitted = $state(false);
  let message = $state("");

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

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    loading = true;
    try {
      const res = await fetch("/consultation?/submit", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result?.type === "success" || res.ok) {
        submitted = true;
        toast.success(
          "Your consultation request has been submitted successfully. We will get back to you soon."
        );
        form.reset();
        message = "";
      } else {
        const errorMsg =
          result?.data?.error || "Something went wrong. Please try again.";
        toast.error(errorMsg);
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      loading = false;
    }
  }
</script>

<Card.Root
  class="border-border/50 bg-card/60 backdrop-blur-md shadow-lg rounded-xl overflow-hidden h-full"
>
  <Card.Header class="pb-0">
    <Card.Title class="text-xl font-bold tracking-tight">
      Schedule a <span class="text-primary italic">Free Consultation</span>
    </Card.Title>
    <p class="text-sm text-muted-foreground">
      Our experts are ready to listen and guide you.
    </p>
  </Card.Header>

  <Card.Content>
    {#if submitted}
      <div class="py-8 text-center">
        <div
          class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary"
        >
          <CheckCircle2 class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold mb-3">Request Received!</h3>
        <p class="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          We will get back to you soon.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/services" variant="outline">
            Explore Our Services
          </Button>
          <Button
            variant="default"
            onclick={() => {
              submitted = false;
            }}
          >
            Submit Another
          </Button>
        </div>
      </div>
    {:else}
      <form
        onsubmit={handleSubmit}
        class="space-y-4 pt-2"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label
              for="hp-firstName"
              class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
              >First name <span class="text-primary">*</span></Label
            >
            <Input
              id="hp-firstName"
              name="firstName"
              placeholder="e.g. John"
              required
            />
          </div>
          <div class="space-y-1.5">
            <Label
              for="hp-lastName"
              class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
              >Last name <span class="text-primary">*</span></Label
            >
            <Input
              id="hp-lastName"
              name="lastName"
              placeholder="e.g. Doe"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label
              for="hp-country"
              class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
              >Country <span class="text-primary">*</span></Label
            >
            <SelectComponent
              name="country"
              placeholder="Select your country"
              options={countries}
              class="w-full"
            />
          </div>
          <div class="space-y-1.5">
            <Label
              for="hp-countryOther"
              class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
              >Country not on list?</Label
            >
            <Input
              id="hp-countryOther"
              name="countryOther"
              placeholder="Please Specify"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label
              for="hp-company"
              class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
              >Company / Organization <span class="text-primary">*</span
              ></Label
            >
            <Input
              id="hp-company"
              name="company"
              placeholder="e.g. Acme Corp"
              required
            />
          </div>
          <div class="space-y-1.5">
            <Label
              for="hp-email"
              class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
              >Company email <span class="text-primary">*</span></Label
            >
            <Input
              id="hp-email"
              name="email"
              type="email"
              placeholder="email@company.com"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label
              for="hp-phone"
              class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
              >Phone <span class="text-primary">*</span></Label
            >
            <Input
              id="hp-phone"
              name="phone"
              type="tel"
              placeholder="+234 ..."
              required
            />
          </div>
          <div class="space-y-1.5">
            <Label
              for="hp-topic"
              class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
              >How Can We Help? <span class="text-primary">*</span
              ></Label
            >
            <SelectComponent
              name="topic"
              placeholder="Select a service"
              options={topics}
              class="w-full"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label
            for="hp-message"
            class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
            >Message <span class="text-primary">*</span></Label
          >
          <div
            class="border border-border rounded-xl overflow-hidden"
          >
            <RichEditor bind:value={message} class="min-h-[120px]" />
            <input type="hidden" name="message" value={message} />
          </div>
          <p class="text-[10px] text-muted-foreground italic mt-1">
            Please describe how we can help...
          </p>
        </div>

        <div class="pt-2">
          <Button
            type="submit"
            disabled={loading}
            class="w-full"
          >
            {#if loading}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" /> Scheduling...
            {:else}
              Submit Request <Sparkles class="ml-2 h-4 w-4" />
            {/if}
          </Button>
        </div>
      </form>
    {/if}
  </Card.Content>
</Card.Root>
