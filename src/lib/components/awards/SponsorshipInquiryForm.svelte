<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
  } from "$lib/components/ui/select";
  import { Building, Award, Mail, Phone, Send, Loader2 } from "@lucide/svelte";
  import { enhance } from "$app/forms";

  let {
    packages = [],
    initialPackage = "",
    isSubmitting = $bindable(false),
    onSuccess,
  } = $props();

  let packageInterest = $state("");

  // Sync package interest if initialPackage changes externally
  $effect(() => {
    if (initialPackage) {
      packageInterest = initialPackage;
    }
  });
</script>

<form
  method="POST"
  action="?/submit"
  use:enhance={() => {
    isSubmitting = true;
    return async ({ result, update }) => {
      await update();
      isSubmitting = false;
      if (result.type === "success") {
        onSuccess?.();
      }
    };
  }}
  class="space-y-6"
>
  <div class="grid sm:grid-cols-2 gap-4">
    <div class="space-y-2">
      <Label
        for="companyName"
        class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
      >
        <Building class="size-3.5 text-primary" />
        Company Name *
      </Label>
      <Input
        id="companyName"
        name="companyName"
        placeholder="Your company"
        class="rounded-xl border-border/50 bg-card/50"
        required
      />
    </div>
    <div class="space-y-2">
      <Label
        for="packageInterest"
        class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
      >
        <Award class="size-3.5 text-primary" />
        Package Interest *
      </Label>
      <input type="hidden" name="packageInterest" value={packageInterest} />
      <Select type="single" bind:value={packageInterest} required>
        <SelectTrigger class="rounded-xl h-10 border-border/50 bg-card/50">
          <span class="text-sm font-medium">
            {packages.find((p) => p.id === packageInterest)?.name ||
              (packageInterest === "custom"
                ? "Custom Package"
                : "Select Package")}
          </span>
        </SelectTrigger>
        <SelectContent class="rounded-xl border-border/50 shadow-lg">
          {#each packages as pkg}
            <SelectItem value={pkg.id} class="font-medium text-sm rounded-lg"
              >{pkg.name}</SelectItem
            >
          {/each}
          <SelectItem value="custom" class="font-medium text-sm rounded-lg"
            >Custom Package</SelectItem
          >
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="grid sm:grid-cols-2 gap-4">
    <div class="space-y-2">
      <Label
        for="contactName"
        class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >Contact Name *</Label
      >
      <Input
        id="contactName"
        name="contactName"
        placeholder="Your full name"
        class="rounded-xl border-border/50 bg-card/50"
        required
      />
    </div>
    <div class="space-y-2">
      <Label
        for="contactEmail"
        class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
      >
        <Mail class="size-3.5 text-primary" />
        Email Address *
      </Label>
      <Input
        id="contactEmail"
        name="contactEmail"
        type="email"
        placeholder="you@company.com"
        class="rounded-xl border-border/50 bg-card/50"
        required
      />
    </div>
  </div>

  <div class="space-y-2">
    <Label
      for="contactPhone"
      class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"
    >
      <Phone class="size-3.5 text-primary" />
      Phone Number
    </Label>
    <Input
      id="contactPhone"
      name="contactPhone"
      type="tel"
      placeholder="+2348102668340"
      class="rounded-xl border-border/50 bg-card/50"
    />
  </div>

  <div class="space-y-2">
    <Label
      for="message"
      class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
      >Additional Message</Label
    >
    <Textarea
      id="message"
      name="message"
      placeholder="Tell us about your sponsorship goals or any questions you have..."
      class="min-h-[100px] rounded-xl border-border/50 bg-card/50 resize-none"
    />
  </div>

  <Button
    type="submit"
    class="w-full rounded-xl font-bold py-6 shadow-md shadow-primary/20"
    disabled={isSubmitting}
  >
    {#if isSubmitting}
      <Loader2 class="mr-2 size-4 animate-spin" />
      Submitting...
    {:else}
      <Send class="mr-2 size-4" />
      Submit Inquiry
    {/if}
  </Button>
</form>
