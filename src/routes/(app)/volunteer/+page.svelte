<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";
  import {
    Users,
    CheckCircle2,
    Loader2,
    ChevronRight,
    ChevronLeft,
    Trophy,
    Heart,
    Camera,
    Star,
    Handshake,
    Video,
    Share2,
    Crown,
    AlertCircle,
    Send,
    MapPin,
    Calendar,
    Briefcase,
    Award,
    Copy,
    Check,
    ArrowRight,
    Sparkles,
    ShieldCheck,
  } from "@lucide/svelte";
  import { Constants } from "$lib/constants";

  // Form step state
  let step = $state(1);
  const totalSteps = 4;

  // Form state
  let firstName = $state("");
  let lastName = $state("");
  let email = $state("");
  let phone = $state("");
  let location = $state("");
  let ageRange = $state("");
  let helpAreas = $state<string[]>([]);
  let helpAreasOther = $state("");
  let aboutYourself = $state("");
  let whyVolunteer = $state("");
  let hasPreviousExperience = $state<boolean | null>(null);
  let hasProgramManagementExperience = $state<boolean | null>(null);
  let programManagementExperience = $state("");
  let availableFullDay = $state<boolean | null>(null);
  let availableBriefing = $state<boolean | null>(null);

  let isSubmitting = $state(false);
  let submitted = $state(false);
  let errorMessage = $state("");
  let copied = $state(false);

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
    return firstName.trim() && lastName.trim() && email.trim() && phone.trim() && location.trim() && ageRange;
  }

  function canProceedStep2() {
    return helpAreas.length > 0 && (!helpAreas.includes("Other") || helpAreasOther.trim());
  }

  function canProceedStep3() {
    return aboutYourself.trim().length >= 20 && whyVolunteer.trim().length >= 20;
  }

  function canProceedStep4() {
    return (
      hasPreviousExperience !== null &&
      hasProgramManagementExperience !== null &&
      (!hasProgramManagementExperience || programManagementExperience.trim().length > 0) &&
      availableFullDay !== null &&
      availableBriefing !== null
    );
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
          location,
          ageRange,
          helpAreas,
          helpAreasOther: helpAreas.includes("Other") ? helpAreasOther : "",
          aboutYourself,
          whyVolunteer,
          hasPreviousExperience,
          hasProgramManagementExperience,
          programManagementExperience: hasProgramManagementExperience ? programManagementExperience : "",
          availableFullDay,
          availableBriefing,
        }),
      });
      const data = await res.json();
      if (data.success) {
        submitted = true;
        toast.success("Application submitted successfully!");
        window.scrollTo({ top: 300, behavior: "smooth" });
      } else {
        errorMessage = data.message || "An error occurred. Please try again.";
        toast.error(errorMessage);
      }
    } catch {
      errorMessage = "Network error. Please check your connection and try again.";
      toast.error(errorMessage);
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
    location = "";
    ageRange = "";
    helpAreas = [];
    helpAreasOther = "";
    aboutYourself = "";
    whyVolunteer = "";
    hasPreviousExperience = null;
    hasProgramManagementExperience = null;
    programManagementExperience = "";
    availableFullDay = null;
    availableBriefing = null;
    submitted = false;
    errorMessage = "";
  }

  function copyShareLink() {
    const url = typeof window !== "undefined" ? window.location.href : "https://www.thecioclubafrica.com/volunteer";
    navigator.clipboard.writeText(url);
    copied = true;
    toast.success("Volunteer form link copied to clipboard!");
    setTimeout(() => (copied = false), 3000);
  }

  const shareText = encodeURIComponent(
    "Apply to volunteer at The CIO & C-Suite Awards Africa 2026! Join the team powering Africa's premier technology leadership event on Tuesday, 27 October 2026 at Balmoral Convention Center, Lagos. Apply here:"
  );
  const shareUrl = "https://www.thecioclubafrica.com/volunteer";
</script>

<svelte:head>
  <title>Volunteer Application | The CIO & C-Suite Awards Africa 2026</title>
  <meta
    name="description"
    content="Apply to join the volunteer team for The CIO & C-Suite Awards Africa 2026. Tuesday, 27 October 2026 at Balmoral Convention Center, Victoria Island, Lagos."
  />
  <meta property="og:title" content="Volunteer Application · The CIO & C-Suite Awards Africa 2026" />
  <meta
    property="og:description"
    content="Join the volunteer team powering Africa's premier technology leadership event on Tuesday, 27 October 2026 in Lagos."
  />
  <meta property="og:url" content="https://www.thecioclubafrica.com/volunteer" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Volunteer Application · The CIO & C-Suite Awards Africa 2026" />
  <meta
    name="twitter:description"
    content="Join the volunteer team powering Africa's premier technology leadership event on Tuesday, 27 October 2026 in Lagos."
  />
</svelte:head>

<div class="min-h-screen bg-background relative overflow-hidden">
  <!-- Ambient background glow elements -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,#d9770615,transparent_70%)] pointer-events-none"></div>

  <!-- Hero Header -->
  <section class="relative pt-16 pb-12 md:pt-24 md:pb-16 border-b border-border/40 bg-gradient-to-b from-muted/30 to-background">
    <div class="container mx-auto px-4 max-w-5xl">
      <div class="text-center space-y-5">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Trophy class="size-3.5" />
          The CIO & C-Suite Awards Africa 2026
        </div>

        <h1 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
          Join Our <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600">Volunteer Team</span>
        </h1>

        <p class="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          Be part of the energetic team powering Africa's most prestigious gathering of IT executives and technology pioneers. Gain unparalleled experience, build your professional network, and make history with us.
        </p>

        <!-- Event Details Chips -->
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/60 text-xs sm:text-sm font-semibold text-foreground shadow-xs">
            <Calendar class="size-4 text-amber-500 shrink-0" />
            Tuesday, 27 October 2026
          </div>
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/60 text-xs sm:text-sm font-semibold text-foreground shadow-xs">
            <MapPin class="size-4 text-amber-500 shrink-0" />
            Balmoral Convention Center, VI, Lagos
          </div>
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/60 text-xs sm:text-sm font-semibold text-foreground shadow-xs">
            <Sparkles class="size-4 text-amber-500 shrink-0" />
            7th Annual Edition
          </div>
        </div>

        <!-- Share Toolbar -->
        <div class="flex flex-wrap items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onclick={copyShareLink}
            class="rounded-xl font-bold gap-2 text-xs h-9 border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-foreground"
          >
            {#if copied}
              <Check class="size-3.5 text-emerald-500" />
              <span>Link Copied!</span>
            {:else}
              <Copy class="size-3.5 text-amber-500" />
              <span>Copy Direct Link</span>
            {/if}
          </Button>

          <a
            href="https://api.whatsapp.com/send?text={shareText}%20{encodeURIComponent(shareUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all"
          >
            <span>💬 Share on WhatsApp</span>
          </a>

          <a
            href="https://twitter.com/intent/tweet?text={shareText}&url={encodeURIComponent(shareUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all"
          >
            <span>𝕏 Share on X</span>
          </a>

          <a
            href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(shareUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all"
          >
            <span>💼 Share on LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  </section>


  <!-- Application Form Section -->
  <section class="py-12 md:py-16">
    <div class="container mx-auto px-4 max-w-3xl">
      <div class="bg-card rounded-3xl border-2 border-border/70 shadow-2xl overflow-hidden">
        <!-- Form Header -->
        <div class="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-8 py-8 overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

          <div class="relative z-10 space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
              <Trophy class="size-3" />
              Official Volunteer Portal
            </div>
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Volunteer Application Form
            </h2>
            <p class="text-sm text-white/70 font-medium">
              Please complete all steps accurately. Applications are reviewed on a rolling basis.
            </p>
          </div>

          {#if !submitted}
            <!-- Step Progress Indicators -->
            <div class="relative z-10 mt-6 flex items-center gap-2">
              {#each Array.from({ length: totalSteps }, (_, i) => i + 1) as s}
                <div
                  class="h-2 flex-1 rounded-full transition-all duration-500 {s <= step
                    ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                    : 'bg-white/20'}"
                ></div>
              {/each}
            </div>
            <div class="relative z-10 flex items-center justify-between text-[11px] font-bold text-white/60 uppercase tracking-wider mt-2">
              <span>Step {step} of {totalSteps}: {step === 1 ? 'Personal Details' : step === 2 ? 'Help Areas' : step === 3 ? 'About You' : 'Availability & Experience'}</span>
              <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
            </div>
          {/if}
        </div>

        <!-- Form Body -->
        <div class="p-6 sm:p-10">
          {#if submitted}
            <!-- Success Screen -->
            <div class="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div class="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 class="size-10 text-emerald-500" />
              </div>
              <div class="space-y-3">
                <h3 class="text-2xl sm:text-3xl font-black text-foreground">Application Received!</h3>
                <p class="text-muted-foreground font-medium max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                  Thank you, <strong class="text-foreground">{firstName} {lastName}</strong>! We have received your application to volunteer for The CIO & C-Suite Awards Africa 2026.
                </p>
              </div>

              <div class="w-full max-w-md bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-sm text-amber-700 dark:text-amber-400 font-medium space-y-2 text-left">
                <div class="flex items-center gap-2 font-bold text-base">
                  <span>📧 Confirmation Email Sent</span>
                </div>
                <p class="text-xs leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                  A confirmation message has been dispatched to <strong>{email}</strong>. Our volunteer coordination team will contact you regarding role assignment and briefing sessions.
                </p>
              </div>

              <div class="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <Button onclick={copyShareLink} variant="outline" class="w-full rounded-xl font-bold gap-2">
                  <Copy class="size-4" /> Share with Friends
                </Button>
                <Button onclick={resetForm} class="w-full rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950">
                  Submit Another
                </Button>
              </div>
            </div>
          {:else}
            <!-- Step 1: Personal Details -->
            {#if step === 1}
              <div class="space-y-6">
                <div class="border-b border-border/40 pb-4">
                  <h3 class="text-xl font-extrabold text-foreground">Personal Information</h3>
                  <p class="text-sm text-muted-foreground">Provide your contact and demographic information.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="firstName" class="font-bold text-xs uppercase tracking-wider">First Name *</Label>
                    <Input
                      id="firstName"
                      bind:value={firstName}
                      placeholder="e.g. Chidi"
                      class="rounded-xl h-12"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label for="lastName" class="font-bold text-xs uppercase tracking-wider">Last Name *</Label>
                    <Input
                      id="lastName"
                      bind:value={lastName}
                      placeholder="e.g. Okafor"
                      class="rounded-xl h-12"
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
                    class="rounded-xl h-12"
                  />
                  <p class="text-[11px] text-muted-foreground">Official notifications and briefings will be sent here.</p>
                </div>

                <div class="space-y-2">
                  <Label for="phone" class="font-bold text-xs uppercase tracking-wider">Phone / WhatsApp Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    bind:value={phone}
                    placeholder="+234 801 234 5678"
                    class="rounded-xl h-12"
                  />
                </div>

                <!-- Location field -->
                <div class="space-y-2">
                  <Label for="location" class="font-bold text-xs uppercase tracking-wider">Location (City, State / Country) *</Label>
                  <Input
                    id="location"
                    bind:value={location}
                    placeholder="e.g. Lagos, Nigeria"
                    class="rounded-xl h-12"
                  />
                  <p class="text-[11px] text-muted-foreground">Volunteers must be able to attend in person at the venue in Lagos on Tuesday, 27 October 2026.</p>
                </div>

                <div class="space-y-3">
                  <Label class="font-bold text-xs uppercase tracking-wider">Age Range *</Label>
                  <div class="grid grid-cols-4 gap-2.5">
                    {#each ageRanges as range}
                      <button
                        type="button"
                        onclick={() => (ageRange = range)}
                        class="py-3 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 cursor-pointer
                          {ageRange === range
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5 text-foreground'}"
                      >
                        {range}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>

            <!-- Step 2: Areas of Help -->
            {:else if step === 2}
              <div class="space-y-6">
                <div class="border-b border-border/40 pb-4">
                  <h3 class="text-xl font-extrabold text-foreground">What would you like to help with?</h3>
                  <p class="text-sm text-muted-foreground">Select one or more volunteer teams you are interested in.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {#each helpAreaOptions as option}
                    <button
                      type="button"
                      onclick={() => toggleHelpArea(option.label)}
                      class="flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 text-left cursor-pointer
                        {helpAreas.includes(option.label)
                        ? 'border-primary bg-primary/5 text-primary shadow-xs'
                        : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5 text-foreground'}"
                    >
                      <div
                        class="size-7 rounded-lg flex items-center justify-center shrink-0 transition-all
                          {helpAreas.includes(option.label) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}"
                      >
                        <option.icon class="size-4" />
                      </div>
                      <span class="leading-tight text-xs sm:text-sm">{option.label}</span>
                      {#if helpAreas.includes(option.label)}
                        <CheckCircle2 class="size-4 ml-auto shrink-0 text-primary" />
                      {/if}
                    </button>
                  {/each}
                </div>

                {#if helpAreas.includes("Other")}
                  <div class="space-y-2 pt-2">
                    <Label for="otherArea" class="font-bold text-xs uppercase tracking-wider">Please specify your special skills or interest *</Label>
                    <Input
                      id="otherArea"
                      bind:value={helpAreasOther}
                      placeholder="Describe your proposed area of contribution..."
                      class="rounded-xl h-12"
                    />
                  </div>
                {/if}
              </div>

            <!-- Step 3: About You -->
            {:else if step === 3}
              <div class="space-y-6">
                <div class="border-b border-border/40 pb-4">
                  <h3 class="text-xl font-extrabold text-foreground">About You</h3>
                  <p class="text-sm text-muted-foreground">Help our coordination committee understand your background and goals.</p>
                </div>

                <div class="space-y-2">
                  <Label for="about" class="font-bold text-xs uppercase tracking-wider">Tell us a little about yourself *</Label>
                  <Textarea
                    id="about"
                    bind:value={aboutYourself}
                    placeholder="Share your current occupation/studies, skills, strengths, and what makes you an exceptional volunteer..."
                    class="rounded-xl min-h-[130px] resize-none"
                  />
                  <div class="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Minimum 20 characters</span>
                    <span class={aboutYourself.trim().length >= 20 ? "text-emerald-500 font-bold" : ""}>
                      {aboutYourself.length} characters
                    </span>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="why" class="font-bold text-xs uppercase tracking-wider">Why would you like to volunteer at The CIO & C-Suite Awards Africa 2026? *</Label>
                  <Textarea
                    id="why"
                    bind:value={whyVolunteer}
                    placeholder="What inspires you about this event? What do you hope to contribute to the experience of attendees and honorees?"
                    class="rounded-xl min-h-[130px] resize-none"
                  />
                  <div class="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Minimum 20 characters</span>
                    <span class={whyVolunteer.trim().length >= 20 ? "text-emerald-500 font-bold" : ""}>
                      {whyVolunteer.length} characters
                    </span>
                  </div>
                </div>
              </div>

            <!-- Step 4: Availability & Experience -->
            {:else if step === 4}
              <div class="space-y-6">
                <div class="border-b border-border/40 pb-4">
                  <h3 class="text-xl font-extrabold text-foreground">Availability & Experience</h3>
                  <p class="text-sm text-muted-foreground">Final confirmation questions before submitting your application.</p>
                </div>

                <!-- Previous event experience -->
                <div class="space-y-3">
                  <Label class="font-bold text-xs uppercase tracking-wider">Do you have any previous event, conference, or volunteer experience? *</Label>
                  <div class="grid grid-cols-2 gap-3">
                    {#each [{ val: true, label: "Yes" }, { val: false, label: "No" }] as opt}
                      <button
                        type="button"
                        onclick={() => (hasPreviousExperience = opt.val)}
                        class="py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer
                          {hasPreviousExperience === opt.val
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'border-border hover:border-primary/40 hover:bg-primary/5'}"
                      >
                        {opt.label}
                      </button>
                    {/each}
                  </div>
                </div>

                <!-- Program management experience -->
                <div class="space-y-3">
                  <Label class="font-bold text-xs uppercase tracking-wider">Do you have program management experience? *</Label>
                  <div class="grid grid-cols-2 gap-3">
                    {#each [{ val: true, label: "Yes" }, { val: false, label: "No" }] as opt}
                      <button
                        type="button"
                        onclick={() => {
                          hasProgramManagementExperience = opt.val;
                          if (!opt.val) programManagementExperience = "";
                        }}
                        class="py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer
                          {hasProgramManagementExperience === opt.val
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'border-border hover:border-primary/40 hover:bg-primary/5'}"
                      >
                        {opt.label}
                      </button>
                    {/each}
                  </div>
                  {#if hasProgramManagementExperience}
                    <div class="space-y-1.5 pt-1">
                      <Label for="pmExpPage" class="font-bold text-xs text-muted-foreground">Describe your program management experience (roles, projects, or tools) *</Label>
                      <Textarea
                        id="pmExpPage"
                        bind:value={programManagementExperience}
                        placeholder="e.g. Coordinated event timelines and session schedules, managed volunteer squads, agile certification, Asana/Trello/Jira proficiency..."
                        class="rounded-xl min-h-[90px] resize-none text-sm"
                      />
                    </div>
                  {/if}
                </div>

                <!-- Full day availability -->
                <div class="space-y-3">
                  <Label class="font-bold text-xs uppercase tracking-wider">Are you available for the full duration of the event on Tuesday, 27 October 2026? *</Label>
                  <div class="grid grid-cols-2 gap-3">
                    {#each [{ val: true, label: "Yes" }, { val: false, label: "No" }] as opt}
                      <button
                        type="button"
                        onclick={() => (availableFullDay = opt.val)}
                        class="py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer
                          {availableFullDay === opt.val
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
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
                        class="py-3.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 cursor-pointer
                          {availableBriefing === opt.val
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'border-border hover:border-emerald-500/40 hover:bg-emerald-500/5'}"
                      >
                        {opt.label}
                      </button>
                    {/each}
                  </div>
                </div>

                {#if errorMessage}
                  <div class="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    <AlertCircle class="size-4 shrink-0" />
                    {errorMessage}
                  </div>
                {/if}
              </div>
            {/if}

            <!-- Navigation Buttons -->
            <div class="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onclick={() => {
                  if (step > 1) step--;
                }}
                disabled={step === 1}
                class="rounded-xl font-bold gap-2"
              >
                <ChevronLeft class="size-4" />
                Previous
              </Button>

              {#if step < totalSteps}
                <Button
                  onclick={() => step++}
                  disabled={(step === 1 && !canProceedStep1()) ||
                    (step === 2 && !canProceedStep2()) ||
                    (step === 3 && !canProceedStep3())}
                  class="rounded-xl font-bold gap-2 px-7 h-11"
                >
                  Continue
                  <ChevronRight class="size-4" />
                </Button>
              {:else}
                <Button
                  onclick={handleSubmit}
                  disabled={isSubmitting || !canProceedStep4()}
                  class="rounded-xl font-bold gap-2 px-8 h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/25"
                >
                  {#if isSubmitting}
                    <Loader2 class="size-4 animate-spin" />
                    Submitting Application…
                  {:else}
                    <Send class="size-4" />
                    Submit Application
                  {/if}
                </Button>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer Help Box -->
      <div class="mt-8 text-center text-xs text-muted-foreground space-y-2">
        <p>
          Questions about volunteering? Contact our Volunteer Coordination Desk at
          <a href="mailto:{Constants.SUPPORTEMAIL}" class="text-primary font-semibold hover:underline">
            {Constants.SUPPORTEMAIL}
          </a>
        </p>
        <p>
          Learn more about <a href="/awards" class="text-foreground font-semibold hover:underline">The CIO & C-Suite Awards Africa 2026</a>
        </p>
      </div>
    </div>
  </section>
</div>
