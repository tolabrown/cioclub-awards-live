<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Users,
    X,
    CheckCircle2,
    Loader2,
    ChevronRight,
    ChevronLeft,
    Trophy,
    Heart,
    Camera,
    Mic,
    Star,
    Handshake,
    Shield,
    Video,
    Share2,
    Crown,
    AlertCircle,
    Send,
  } from "@lucide/svelte";

  let { open = $bindable(false) } = $props();

  // Form step state
  let step = $state(1);
  const totalSteps = 4;

  // Form state
  let firstName = $state("");
  let lastName = $state("");
  let email = $state("");
  let phone = $state("");
  let ageRange = $state("");
  let helpAreas = $state<string[]>([]);
  let helpAreasOther = $state("");
  let aboutYourself = $state("");
  let whyVolunteer = $state("");
  let hasPreviousExperience = $state<boolean | null>(null);
  let availableFullDay = $state<boolean | null>(null);
  let availableBriefing = $state<boolean | null>(null);

  let isSubmitting = $state(false);
  let submitted = $state(false);
  let errorMessage = $state("");

  const helpAreaOptions = [
    { label: "Guest Reception / Ushering", icon: Handshake },
    { label: "VIP & Executive Protocol", icon: Crown },
    { label: "Conference / Session Support", icon: Users },
    { label: "Awards Ceremony Support", icon: Trophy },
    { label: "Stage & Backstage Coordination", icon: Star },
    { label: "Media & Content Creation", icon: Camera },
    { label: "Photography", icon: Camera },
    { label: "Videography", icon: Video },
    { label: "Social Media Coverage", icon: Share2 },
    { label: "Hospitality & Guest Experience", icon: Heart },
    { label: "Other", icon: AlertCircle },
  ];

  const ageRanges = ["18–24", "25–34", "35–44", "45+"];

  function toggleHelpArea(area: string) {
    if (helpAreas.includes(area)) {
      helpAreas = helpAreas.filter((a) => a !== area);
    } else {
      helpAreas = [...helpAreas, area];
    }
  }

  function canProceedStep1() {
    return firstName.trim() && lastName.trim() && email.trim() && phone.trim() && ageRange;
  }

  function canProceedStep2() {
    return helpAreas.length > 0 && (!helpAreas.includes("Other") || helpAreasOther.trim());
  }

  function canProceedStep3() {
    return aboutYourself.trim().length >= 20 && whyVolunteer.trim().length >= 20;
  }

  function canProceedStep4() {
    return hasPreviousExperience !== null && availableFullDay !== null && availableBriefing !== null;
  }

  async function handleSubmit() {
    if (!canProceedStep4()) return;
    isSubmitting = true;
    errorMessage = "";

    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          ageRange,
          helpAreas,
          helpAreasOther: helpAreas.includes("Other") ? helpAreasOther : "",
          aboutYourself,
          whyVolunteer,
          hasPreviousExperience,
          availableFullDay,
          availableBriefing,
        }),
      });
      const data = await res.json();
      if (data.success) {
        submitted = true;
      } else {
        errorMessage = data.message || "An error occurred. Please try again.";
      }
    } catch {
      errorMessage = "Network error. Please check your connection and try again.";
    } finally {
      isSubmitting = false;
    }
  }

  function resetForm() {
    step = 1;
    firstName = "";
    lastName = "";
    email = "";
    phone = "";
    ageRange = "";
    helpAreas = [];
    helpAreasOther = "";
    aboutYourself = "";
    whyVolunteer = "";
    hasPreviousExperience = null;
    availableFullDay = null;
    availableBriefing = null;
    submitted = false;
    errorMessage = "";
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-0 shadow-2xl"
  >
    <!-- Header -->
    <div
      class="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-8 py-7 shrink-0 overflow-hidden"
    >
      <!-- Decorative dot grid -->
      <div
        class="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]"
      ></div>
      <!-- Gold accent line -->
      <div
        class="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"
      ></div>

      <div class="relative z-10 space-y-2">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-[0.15em]"
        >
          <Trophy class="size-3" />
          The CIO & C-Suite Awards Africa 2026
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
          Volunteer Application
        </h2>
        <p class="text-sm text-white/70 font-medium">
          Tuesday, 27 October 2026 · Balmoral Convention Center, Lagos
        </p>
      </div>

      {#if !submitted}
        <!-- Step progress -->
        <div class="relative z-10 mt-6 flex items-center gap-2">
          {#each Array.from({ length: totalSteps }, (_, i) => i + 1) as s}
            <div
              class="h-1.5 flex-1 rounded-full transition-all duration-500 {s <= step
                ? 'bg-amber-500'
                : 'bg-white/20'}"
            ></div>
          {/each}
        </div>
        <p class="relative z-10 text-[10px] font-bold text-white/50 uppercase tracking-widest mt-2">
          Step {step} of {totalSteps}
        </p>
      {/if}
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto">
      {#if submitted}
        <!-- Success state -->
        <div class="flex flex-col items-center justify-center py-16 px-8 text-center space-y-5">
          <div
            class="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/30"
          >
            <CheckCircle2 class="size-10 text-emerald-500" />
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-extrabold text-foreground">Application Submitted!</h3>
            <p class="text-muted-foreground font-medium max-w-sm">
              Thank you, <strong class="text-foreground">{firstName}</strong>! We've received your
              volunteer application and will be in touch soon with next steps.
            </p>
          </div>
          <div
            class="w-full max-w-sm bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400 font-medium"
          >
            📧 A confirmation email has been sent to <strong>{email}</strong>
          </div>
          <Button onclick={resetForm} class="mt-4 rounded-xl font-bold px-8">Close</Button>
        </div>
      {:else}
        <div class="px-8 py-7 space-y-6">
          <!-- Step 1: Personal Information -->
          {#if step === 1}
            <div class="space-y-1">
              <h3 class="text-lg font-extrabold text-foreground">Personal Information</h3>
              <p class="text-sm text-muted-foreground">Tell us about yourself</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="firstName" class="font-bold text-xs uppercase tracking-wider">First Name *</Label>
                <Input
                  id="firstName"
                  bind:value={firstName}
                  placeholder="e.g. Chidi"
                  class="rounded-xl h-11"
                />
              </div>
              <div class="space-y-2">
                <Label for="lastName" class="font-bold text-xs uppercase tracking-wider">Last Name *</Label>
                <Input
                  id="lastName"
                  bind:value={lastName}
                  placeholder="e.g. Okafor"
                  class="rounded-xl h-11"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="email" class="font-bold text-xs uppercase tracking-wider">Email Address *</Label>
              <Input
                id="email"
                type="email"
                bind:value={email}
                placeholder="you@example.com"
                class="rounded-xl h-11"
              />
            </div>

            <div class="space-y-2">
              <Label for="phone" class="font-bold text-xs uppercase tracking-wider">Phone / WhatsApp Number *</Label>
              <Input
                id="phone"
                type="tel"
                bind:value={phone}
                placeholder="+234 801 234 5678"
                class="rounded-xl h-11"
              />
            </div>

            <div class="space-y-3">
              <Label class="font-bold text-xs uppercase tracking-wider">Age Range *</Label>
              <div class="grid grid-cols-4 gap-2">
                {#each ageRanges as range}
                  <button
                    type="button"
                    onclick={() => (ageRange = range)}
                    class="py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 cursor-pointer
                      {ageRange === range
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5 text-foreground'}"
                  >
                    {range}
                  </button>
                {/each}
              </div>
            </div>

          <!-- Step 2: Areas of Help -->
          {:else if step === 2}
            <div class="space-y-1">
              <h3 class="text-lg font-extrabold text-foreground">What would you like to help with?</h3>
              <p class="text-sm text-muted-foreground">You may select more than one.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each helpAreaOptions as option}
                <button
                  type="button"
                  onclick={() => toggleHelpArea(option.label)}
                  class="flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 text-left cursor-pointer
                    {helpAreas.includes(option.label)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5 text-foreground'}"
                >
                  <div
                    class="size-6 rounded-lg flex items-center justify-center shrink-0 transition-all
                      {helpAreas.includes(option.label) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}"
                  >
                    <option.icon class="size-3.5" />
                  </div>
                  <span class="leading-tight">{option.label}</span>
                  {#if helpAreas.includes(option.label)}
                    <CheckCircle2 class="size-4 ml-auto shrink-0 text-primary" />
                  {/if}
                </button>
              {/each}
            </div>

            {#if helpAreas.includes("Other")}
              <div class="space-y-2">
                <Label for="otherArea" class="font-bold text-xs uppercase tracking-wider">Please specify *</Label>
                <Input
                  id="otherArea"
                  bind:value={helpAreasOther}
                  placeholder="Describe your area of help..."
                  class="rounded-xl h-11"
                />
              </div>
            {/if}

          <!-- Step 3: About You -->
          {:else if step === 3}
            <div class="space-y-1">
              <h3 class="text-lg font-extrabold text-foreground">About You</h3>
              <p class="text-sm text-muted-foreground">Help us get to know you better.</p>
            </div>

            <div class="space-y-2">
              <Label for="about" class="font-bold text-xs uppercase tracking-wider">Tell us a little about yourself *</Label>
              <Textarea
                id="about"
                bind:value={aboutYourself}
                placeholder="Share your background, skills, interests, and what makes you a great volunteer..."
                class="rounded-xl min-h-[120px] resize-none"
              />
              <p class="text-xs text-muted-foreground text-right">{aboutYourself.length} chars (min 20)</p>
            </div>

            <div class="space-y-2">
              <Label for="why" class="font-bold text-xs uppercase tracking-wider">Why would you like to volunteer at The CIO & C-Suite Awards Africa 2026? *</Label>
              <Textarea
                id="why"
                bind:value={whyVolunteer}
                placeholder="What motivates you to be part of this event? What do you hope to gain and contribute?"
                class="rounded-xl min-h-[120px] resize-none"
              />
              <p class="text-xs text-muted-foreground text-right">{whyVolunteer.length} chars (min 20)</p>
            </div>

          <!-- Step 4: Availability -->
          {:else if step === 4}
            <div class="space-y-1">
              <h3 class="text-lg font-extrabold text-foreground">Availability & Experience</h3>
              <p class="text-sm text-muted-foreground">Final confirmation details.</p>
            </div>

            <!-- Previous experience -->
            <div class="space-y-3">
              <Label class="font-bold text-xs uppercase tracking-wider">Do you have any previous event, conference or volunteer experience? *</Label>
              <div class="grid grid-cols-2 gap-3">
                {#each [{ val: true, label: "Yes" }, { val: false, label: "No" }] as opt}
                  <button
                    type="button"
                    onclick={() => (hasPreviousExperience = opt.val)}
                    class="py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer
                      {hasPreviousExperience === opt.val
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/40 hover:bg-primary/5'}"
                  >
                    {opt.label}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Full day availability -->
            <div class="space-y-3">
              <Label class="font-bold text-xs uppercase tracking-wider">Are you available for the full duration of the event on Tuesday, 27 October 2026? *</Label>
              <div class="grid grid-cols-2 gap-3">
                {#each [{ val: true, label: "Yes" }, { val: false, label: "No" }] as opt}
                  <button
                    type="button"
                    onclick={() => (availableFullDay = opt.val)}
                    class="py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer
                      {availableFullDay === opt.val
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-border hover:border-emerald-500/40 hover:bg-emerald-500/5'}"
                  >
                    {opt.label}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Briefing availability -->
            <div class="space-y-3">
              <Label class="font-bold text-xs uppercase tracking-wider">Are you available to attend a mandatory volunteer briefing/training session before the event? *</Label>
              <div class="grid grid-cols-2 gap-3">
                {#each [{ val: true, label: "Yes" }, { val: false, label: "No" }] as opt}
                  <button
                    type="button"
                    onclick={() => (availableBriefing = opt.val)}
                    class="py-3 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer
                      {availableBriefing === opt.val
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-border hover:border-emerald-500/40 hover:bg-emerald-500/5'}"
                  >
                    {opt.label}
                  </button>
                {/each}
              </div>
            </div>

            {#if errorMessage}
              <div class="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                <AlertCircle class="size-4 shrink-0" />
                {errorMessage}
              </div>
            {/if}
          {/if}
        </div>
      {/if}
    </div>

    <!-- Footer / Navigation -->
    {#if !submitted}
      <div
        class="shrink-0 px-8 py-5 border-t border-border bg-muted/30 flex items-center justify-between gap-4"
      >
        <Button
          variant="ghost"
          onclick={() => {
            if (step === 1) {
              open = false;
            } else {
              step--;
            }
          }}
          class="rounded-xl font-bold gap-2"
        >
          <ChevronLeft class="size-4" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>

        {#if step < totalSteps}
          <Button
            onclick={() => step++}
            disabled={(step === 1 && !canProceedStep1()) ||
              (step === 2 && !canProceedStep2()) ||
              (step === 3 && !canProceedStep3())}
            class="rounded-xl font-bold gap-2 px-6"
          >
            Continue
            <ChevronRight class="size-4" />
          </Button>
        {:else}
          <Button
            onclick={handleSubmit}
            disabled={isSubmitting || !canProceedStep4()}
            class="rounded-xl font-bold gap-2 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950"
          >
            {#if isSubmitting}
              <Loader2 class="size-4 animate-spin" />
              Submitting…
            {:else}
              <Send class="size-4" />
              Submit Application
            {/if}
          </Button>
        {/if}
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
