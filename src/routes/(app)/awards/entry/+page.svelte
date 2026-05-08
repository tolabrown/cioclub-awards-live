<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
  } from "$lib/components/ui/select";
  import {
    Trophy,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Upload,
    FileText,
    Building,
    Globe,
    Loader2,
    Sparkles,
    Clock,
    Lock,
    CalendarClock,
    Pencil,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";
  import { onMount } from "svelte";

  let { data, form } = $props();

  let currentStep = $state(1);
  let isSubmitting = $state(false);

  // Form state
  let category = $state("");
  let projectTitle = $state("");
  let projectDescription = $state("");
  let organizationName = $state("");
  let industry = $state("");
  let country = $state("");
  let impactStatement = $state("");
  let supportingDoc: File | null = $state(null);

  // Countdown state
  let now = $state(new Date());
  let countdownInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    countdownInterval = setInterval(() => {
      now = new Date();
    }, 1000);
    return () => clearInterval(countdownInterval);
  });

  const period = $derived(data.nominationPeriod);
  const periodStatus = $derived(period.status);

  const countdownTarget = $derived.by(() => {
    if (periodStatus === "upcoming" && period.startDate)
      return new Date(period.startDate);
    if (periodStatus === "active" && period.endDate)
      return new Date(period.endDate);
    return null;
  });

  const timeRemaining = $derived.by(() => {
    if (!countdownTarget) return null;
    const diff = countdownTarget.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  });

  // Reload the page when the countdown timer reaches zero
  let hadTimeRemaining = $state(false);
  $effect(() => {
    if (timeRemaining) {
      hadTimeRemaining = true;
    } else if (hadTimeRemaining) {
      // Countdown just finished — reload to get fresh server state
      hadTimeRemaining = false;
      invalidateAll();
    }
  });

  // Determine if the selected category has an existing entry (editing mode)
  const selectedEntry = $derived(
    data.existingEntries.find((e: any) => e.category === category) ?? null,
  );
  const isEditing = $derived(!!selectedEntry);

  // Auto-fill form fields when selecting a category with an existing entry
  $effect(() => {
    const entry = data.existingEntries.find(
      (e: any) => e.category === category,
    );
    if (entry) {
      projectTitle = entry.projectTitle;
      projectDescription = entry.projectDescription;
      organizationName = entry.organizationName;
      industry = entry.industry;
      country = entry.country;
      impactStatement = entry.impactStatement;
      supportingDoc = null; // Can't restore File objects; user can re-upload
    } else if (category) {
      // Reset fields when switching to a fresh category
      projectTitle = "";
      projectDescription = "";
      organizationName = "";
      industry = "";
      country = "";
      impactStatement = "";
      supportingDoc = null;
    }
  });

  const steps = [
    { number: 1, title: "Category", icon: Trophy },
    { number: 2, title: "Organization", icon: Building },
    { number: 3, title: "Project", icon: FileText },
    { number: 4, title: "Impact", icon: Globe },
    { number: 5, title: "Review", icon: CheckCircle },
  ];

  function nextStep() {
    if (currentStep < 5) currentStep++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevStep() {
    if (currentStep > 1) currentStep--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      supportingDoc = input.files[0];
    }
  }

  $effect(() => {
    if (form?.success) {
      toast.success(
        form?.updated
          ? "Entry updated successfully! Your changes have been saved."
          : "Entry submitted successfully! We'll review your submission and get back to you.",
      );
      // Reset form
      currentStep = 1;
      category = "";
      projectTitle = "";
      projectDescription = "";
      organizationName = "";
      industry = "";
      country = "";
      impactStatement = "";
      supportingDoc = null;
    } else if (form?.message) {
      toast.error(form.message);
    }
  });
</script>

<svelte:head>
  <title>Submit Entry | CIO Awards Africa</title>
  <meta
    name="description"
    content="Submit your entry for The CIO & C-Suite Awards Africa. Showcase your digital transformation achievements and compete for recognition as Africa's top IT leader."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section
    class="relative py-20 bg-primary text-primary-foreground overflow-hidden"
  >
    <!-- Theme-aware gradient background as per guidelines -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-background/10"
    ></div>
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:20px_20px] opacity-30"
    ></div>

    <div class="container mx-auto px-4 relative z-10 pt-16">
      <div class="max-w-3xl mx-auto text-center space-y-6">
        <Badge
          variant="outline"
          class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-primary-foreground/30 text-primary-foreground"
        >
          <Sparkles class="size-3 mr-2 text-accent" />
          Excellence in Leadership
        </Badge>
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Awards <span class="text-accent-foreground/80 opacity-90 italic"
            >Entry</span
          > Portal
        </h1>
        <p
          class="text-lg md:text-xl text-primary-foreground/80 font-medium max-w-2xl mx-auto"
        >
          Showcase your digital transformation achievements and compete for
          recognition as Africa's top IT leader.
        </p>
      </div>
    </div>
  </section>

  <div class="container mx-auto px-4 -mt-10 pb-32 relative z-20">
    {#if periodStatus === "not_set" || periodStatus === "closed"}
      <!-- Submissions Closed -->
      <div class="max-w-2xl mx-auto text-center mt-16">
        <Card class="border-border/50">
          <CardContent class="py-16 space-y-6">
            <div
              class="size-20 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto"
            >
              <Lock class="size-10" />
            </div>
            <h2 class="text-2xl font-bold text-foreground">
              Submissions {periodStatus === "closed"
                ? "Have Ended"
                : "Coming Soon"}
            </h2>
            <p class="text-muted-foreground max-w-md mx-auto">
              {#if periodStatus === "closed"}
                The entry submission period has ended. Thank you to everyone who
                participated. Winners will be announced soon.
              {:else}
                Entry submissions have not been opened yet. Check back soon for
                the next submission period.
              {/if}
            </p>
            <Button href="/awards" variant="outline">Back to Awards</Button>
          </CardContent>
        </Card>
      </div>
    {:else if periodStatus === "upcoming" && timeRemaining}
      <!-- Upcoming: Countdown to Start -->
      <div class="max-w-2xl mx-auto text-center mt-16">
        <Card class="border-primary/20">
          <CardContent class="py-16 space-y-8">
            <div
              class="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto"
            >
              <CalendarClock class="size-10" />
            </div>
            <div class="space-y-2">
              <h2 class="text-2xl font-bold text-foreground">
                Entry Submissions Opening Soon
              </h2>
              <p class="text-muted-foreground max-w-md mx-auto">
                The entry window opens on {new Date(
                  period.startDate ?? "",
                ).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <!-- Countdown Timer -->
            <div class="flex justify-center gap-3 sm:gap-4">
              {#each [{ value: timeRemaining.days, label: "Days" }, { value: timeRemaining.hours, label: "Hours" }, { value: timeRemaining.minutes, label: "Mins" }, { value: timeRemaining.seconds, label: "Secs" }] as unit}
                <div class="flex flex-col items-center">
                  <div
                    class="size-16 sm:size-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                  >
                    <span
                      class="text-2xl sm:text-3xl font-bold text-primary tabular-nums"
                    >
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2"
                  >
                    {unit.label}
                  </span>
                </div>
              {/each}
            </div>

            <Button href="/awards" variant="outline">Back to Awards</Button>
          </CardContent>
        </Card>
      </div>
    {:else}
      <!-- Active Period -->

      <!-- Countdown Banner -->
      {#if timeRemaining}
        <div class="max-w-3xl mx-auto mb-6">
          <Card class="border-primary/20 bg-primary/5">
            <CardContent class="py-4">
              <div
                class="flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3">
                  <Clock class="size-5 text-primary shrink-0" />
                  <span class="text-sm font-medium text-foreground"
                    >Submissions close in</span
                  >
                </div>
                <div class="flex gap-2">
                  {#each [{ value: timeRemaining.days, label: "d" }, { value: timeRemaining.hours, label: "h" }, { value: timeRemaining.minutes, label: "m" }, { value: timeRemaining.seconds, label: "s" }] as unit}
                    <div class="flex items-center gap-0.5">
                      <span class="text-lg font-bold text-primary tabular-nums">
                        {String(unit.value).padStart(2, "0")}
                      </span>
                      <span class="text-xs text-muted-foreground font-medium"
                        >{unit.label}</span
                      >
                    </div>
                    {#if unit.label !== "s"}
                      <span class="text-muted-foreground/50 font-bold">:</span>
                    {/if}
                  {/each}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      {/if}
      <!-- Progress Steps -->
      <div
        class="max-w-3xl mx-auto mb-10 p-6 bg-card rounded-xl shadow-lg border border-border/50 backdrop-blur-sm animate-in fade-in duration-700"
      >
        <div class="flex items-center justify-between">
          {#each steps as step}
            <div class="flex flex-col items-center relative z-10">
              <div
                class="size-10 rounded-full flex items-center justify-center transition-all duration-300 {currentStep >=
                step.number
                  ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'}"
              >
                {#if currentStep > step.number}
                  <CheckCircle class="size-5" />
                {:else}
                  <step.icon class="size-5" />
                {/if}
              </div>
              <span
                class="text-[10px] font-bold uppercase tracking-tighter mt-3 hidden sm:block {currentStep >=
                step.number
                  ? 'text-foreground'
                  : 'text-muted-foreground'}">{step.title}</span
              >
            </div>
            {#if step.number < steps.length}
              <div
                class="flex-1 h-1 mx-2 rounded-full relative overflow-hidden bg-muted"
              >
                <div
                  class="absolute inset-0 bg-primary transition-all duration-500 ease-in-out"
                  style="width: {currentStep > step.number ? '100%' : '0%'}"
                ></div>
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Editing Banner -->
      {#if isEditing && category}
        <div
          class="max-w-3xl mx-auto mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div
            class="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div
              class="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"
            >
              <Pencil class="size-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-foreground">
                Editing Existing Entry
              </p>
              <p class="text-xs text-muted-foreground">
                You're updating your <span class="font-semibold text-primary"
                  >{data.categories.find((c: any) => c.value === category)
                    ?.label}</span
                > submission. Changes will replace your previous entry.
              </p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Form -->
      <form
        method="POST"
        action="?/submit"
        enctype="multipart/form-data"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            await update();
            isSubmitting = false;
          };
        }}
      >
        <!-- Hidden inputs always present in the form regardless of step -->
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="industry" value={industry} />
        <input type="hidden" name="country" value={country} />
        <input type="hidden" name="organizationName" value={organizationName} />
        <input type="hidden" name="projectTitle" value={projectTitle} />
        <input
          type="hidden"
          name="projectDescription"
          value={projectDescription}
        />
        <input type="hidden" name="impactStatement" value={impactStatement} />

        <div class="max-w-2xl mx-auto">
          <!-- Step 1: Category -->
          {#if currentStep === 1}
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card class="rounded-xl shadow-lg border-border/50">
                <CardHeader>
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                    >
                      <Trophy class="size-5" />
                    </div>
                    <div>
                      <CardTitle class="font-bold"
                        >Select Award Category</CardTitle
                      >
                      <CardDescription
                        >Choose the category that best represents your
                        achievement.</CardDescription
                      >
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="grid gap-3">
                    {#each data.categories as cat}
                      {@const hasEntry = data.enteredCategories.includes(
                        cat.value,
                      )}
                      <button
                        type="button"
                        class="flex items-center gap-4 p-5 rounded-xl border transition-all text-left group {category ===
                        cat.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'}"
                        onclick={() => (category = cat.value)}
                      >
                        <div
                          class="size-10 rounded-lg bg-muted flex items-center justify-center transition-colors {category ===
                          cat.value
                            ? 'bg-primary text-primary-foreground'
                            : 'group-hover:bg-primary/10 group-hover:text-primary'}"
                        >
                          <Trophy class="size-5" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <span
                            class="font-bold text-lg {category === cat.value
                              ? 'text-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'}"
                            >{cat.label}</span
                          >
                          {#if hasEntry}
                            <p
                              class="text-xs font-medium text-primary/70 flex items-center gap-1 mt-0.5"
                            >
                              <Pencil class="size-3" /> Entry submitted — click to
                              edit
                            </p>
                          {/if}
                        </div>
                        {#if category === cat.value}
                          <div class="ml-auto animate-in zoom-in duration-300">
                            <CheckCircle class="size-6 text-primary" />
                          </div>
                        {/if}
                      </button>
                    {/each}
                  </div>
                </CardContent>
                <CardFooter class="justify-end pt-6">
                  <Button
                    type="button"
                    onclick={nextStep}
                    disabled={!category}
                    class="px-8 font-bold"
                  >
                    Continue <ArrowRight class="ml-2 size-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          {/if}

          <!-- Step 2: Organization -->
          {#if currentStep === 2}
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card class="rounded-xl shadow-lg border-border/50">
                <CardHeader>
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                    >
                      <Building class="size-5" />
                    </div>
                    <div>
                      <CardTitle class="font-bold"
                        >Organization Details</CardTitle
                      >
                      <CardDescription
                        >Tell us about your organization and industry.</CardDescription
                      >
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-6">
                  <div class="space-y-3">
                    <Label
                      for="organizationName"
                      class="font-bold uppercase text-[10px] tracking-widest"
                      >Organization Name</Label
                    >
                    <Input
                      id="organizationName"
                      bind:value={organizationName}
                      placeholder="e.g., First Bank of Nigeria"
                      required
                      class="rounded-lg h-12"
                    />
                  </div>

                  <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-3">
                      <Label
                        for="industry"
                        class="font-bold uppercase text-[10px] tracking-widest"
                        >Industry</Label
                      >

                      <Select type="single" bind:value={industry}>
                        <SelectTrigger class="rounded-lg h-12"
                          >{industry || "Select industry"}</SelectTrigger
                        >
                        <SelectContent>
                          {#each data.industries as ind}
                            <SelectItem value={ind} class="font-medium"
                              >{ind}</SelectItem
                            >
                          {/each}
                        </SelectContent>
                      </Select>
                    </div>

                    <div class="space-y-3">
                      <Label
                        for="country"
                        class="font-bold uppercase text-[10px] tracking-widest"
                        >Country</Label
                      >

                      <Select type="single" bind:value={country}>
                        <SelectTrigger class="rounded-lg h-12"
                          >{country || "Select country"}</SelectTrigger
                        >
                        <SelectContent>
                          {#each data.countries as c}
                            <SelectItem value={c} class="font-medium"
                              >{c}</SelectItem
                            >
                          {/each}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter class="justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onclick={prevStep}
                    class="font-bold"
                  >
                    <ArrowLeft class="mr-2 size-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    onclick={nextStep}
                    disabled={!organizationName || !industry || !country}
                    class="px-8 font-bold"
                  >
                    Continue <ArrowRight class="ml-2 size-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          {/if}

          <!-- Step 3: Project -->
          {#if currentStep === 3}
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card class="rounded-xl shadow-lg border-border/50">
                <CardHeader>
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                    >
                      <FileText class="size-5" />
                    </div>
                    <div>
                      <CardTitle class="font-bold"
                        >Project Information</CardTitle
                      >
                      <CardDescription
                        >Describe the project or initiative you're submitting.</CardDescription
                      >
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-6">
                  <div class="space-y-3">
                    <Label
                      for="projectTitle"
                      class="font-bold uppercase text-[10px] tracking-widest"
                      >Project Title</Label
                    >
                    <Input
                      id="projectTitle"
                      bind:value={projectTitle}
                      placeholder="e.g., Digital Banking Transformation Initiative"
                      required
                      class="rounded-lg h-12"
                    />
                  </div>
                  <div class="space-y-3">
                    <Label
                      for="projectDescription"
                      class="font-bold uppercase text-[10px] tracking-widest"
                      >Project Description</Label
                    >
                    <Textarea
                      id="projectDescription"
                      bind:value={projectDescription}
                      placeholder="Provide a detailed description of your project, including objectives, scope, and implementation approach..."
                      class="min-h-[250px] rounded-lg resize-none p-4"
                      required
                    />
                    <div class="flex justify-between items-center">
                      <p
                        class="text-[10px] font-bold uppercase tracking-wider {projectDescription.length <
                        100
                          ? 'text-destructive'
                          : 'text-primary'}"
                      >
                        {projectDescription.length < 100
                          ? `Need ${100 - projectDescription.length} more characters`
                          : "Minimum requirement met"}
                      </p>
                      <p class="text-[10px] font-bold text-muted-foreground">
                        {projectDescription.length} characters
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter class="justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onclick={prevStep}
                    class="font-bold"
                  >
                    <ArrowLeft class="mr-2 size-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    onclick={nextStep}
                    disabled={!projectTitle || projectDescription.length < 100}
                    class="px-8 font-bold"
                  >
                    Continue <ArrowRight class="ml-2 size-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          {/if}

          <!-- Step 4: Impact -->
          {#if currentStep === 4}
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card class="rounded-xl shadow-lg border-border/50">
                <CardHeader>
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                    >
                      <Globe class="size-5" />
                    </div>
                    <div>
                      <CardTitle class="font-bold">Impact & Evidence</CardTitle>
                      <CardDescription
                        >Describe the impact and provide supporting evidence.</CardDescription
                      >
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-8">
                  <div class="space-y-3">
                    <Label
                      for="impactStatement"
                      class="font-bold uppercase text-[10px] tracking-widest"
                      >Impact Statement</Label
                    >
                    <Textarea
                      id="impactStatement"
                      bind:value={impactStatement}
                      placeholder="Describe the measurable impact of your project on your organization and stakeholders..."
                      class="min-h-[200px] rounded-lg resize-none p-4"
                      required
                    />
                    <div class="flex justify-between items-center">
                      <p
                        class="text-[10px] font-bold uppercase tracking-wider {impactStatement.length <
                        50
                          ? 'text-destructive'
                          : 'text-primary'}"
                      >
                        {impactStatement.length < 50
                          ? `Need ${50 - impactStatement.length} more characters`
                          : "Minimum requirement met"}
                      </p>
                      <p class="text-[10px] font-bold text-muted-foreground">
                        {impactStatement.length} characters
                      </p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <Label
                      class="font-bold uppercase text-[10px] tracking-widest"
                      >Supporting Document (Optional)</Label
                    >
                    <div
                      class="relative group rounded-xl border-2 border-dashed border-border p-10 transition-all hover:bg-muted/50 hover:border-primary/50"
                    >
                      <input
                        type="file"
                        id="supportingDoc"
                        name="supportingDoc"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onchange={handleFileChange}
                      />
                      <div class="text-center space-y-4">
                        <div
                          class="size-16 rounded-full bg-muted flex items-center justify-center mx-auto group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                        >
                          <Upload class="size-8" />
                        </div>
                        <div class="space-y-1">
                          {#if supportingDoc}
                            <p
                              class="text-sm font-bold text-foreground truncate max-w-xs mx-auto"
                            >
                              {supportingDoc.name}
                            </p>
                            <p
                              class="text-xs font-medium text-muted-foreground"
                            >
                              {(supportingDoc.size / 1024 / 1024).toFixed(2)} MB •
                              PDF/DOC/PPT
                            </p>
                          {:else if isEditing && selectedEntry?.supportingDoc}
                            <p
                              class="text-sm font-bold text-foreground truncate max-w-xs mx-auto"
                            >
                              {selectedEntry.supportingDoc.name ??
                                "Supporting Document"}
                            </p>
                            <p
                              class="text-xs font-medium text-muted-foreground"
                            >
                              Previously uploaded • Click to replace
                            </p>
                          {:else}
                            <p class="text-sm font-bold text-foreground">
                              Click or drag to upload
                            </p>
                            <p
                              class="text-xs font-medium text-muted-foreground"
                            >
                              Supporting evidence, case studies, or slide decks
                              (Max 10MB)
                            </p>
                          {/if}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter class="justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onclick={prevStep}
                    class="font-bold"
                  >
                    <ArrowLeft class="mr-2 size-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    onclick={nextStep}
                    disabled={impactStatement.length < 50}
                    class="px-8 font-bold"
                  >
                    Continue <ArrowRight class="ml-2 size-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          {/if}

          <!-- Step 5: Review -->
          {#if currentStep === 5}
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card class="rounded-xl shadow-lg border-border/50">
                <CardHeader>
                  <div class="flex items-center gap-3 mb-2">
                    <div
                      class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                    >
                      <CheckCircle class="size-5" />
                    </div>
                    <div>
                      <CardTitle class="font-bold">Final Review</CardTitle>
                      <CardDescription
                        >Please review your entry details before submission.</CardDescription
                      >
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-6">
                  <div class="grid gap-4">
                    <div
                      class="p-6 rounded-xl bg-muted/30 border border-border/50 space-y-4"
                    >
                      <div class="grid sm:grid-cols-2 gap-6">
                        <div class="space-y-1">
                          <p
                            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                          >
                            Category
                          </p>
                          <p class="font-bold text-foreground">
                            {data.categories.find(
                              (c: any) => c.value === category,
                            )?.label || category}
                          </p>
                        </div>
                        <div class="space-y-1">
                          <p
                            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                          >
                            Organization
                          </p>
                          <p class="font-bold text-foreground">
                            {organizationName}
                          </p>
                          <p
                            class="text-xs font-medium text-muted-foreground italic"
                          >
                            {industry} • {country}
                          </p>
                        </div>
                      </div>

                      <div class="h-px bg-border/50 w-full"></div>

                      <div class="space-y-2">
                        <p
                          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Project Title
                        </p>
                        <p class="font-bold text-foreground text-lg">
                          {projectTitle}
                        </p>
                        <div class="space-y-1">
                          <p
                            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3"
                          >
                            Brief Description
                          </p>
                          <p
                            class="text-sm text-muted-foreground leading-relaxed line-clamp-4"
                          >
                            {projectDescription}
                          </p>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <p
                          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        >
                          Impact Highlights
                        </p>
                        <p
                          class="text-sm text-muted-foreground leading-relaxed"
                        >
                          {impactStatement}
                        </p>
                      </div>

                      {#if supportingDoc}
                        <div
                          class="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50"
                        >
                          <div
                            class="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary"
                          >
                            <FileText class="size-5" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold truncate">
                              {supportingDoc.name}
                            </p>
                            <p
                              class="text-[10px] text-muted-foreground font-medium uppercase"
                            >
                              {(supportingDoc.size / 1024 / 1024).toFixed(2)} MB Document
                            </p>
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>

                  <div
                    class="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-3 items-start"
                  >
                    <CheckCircle class="size-5 text-primary shrink-0 mt-0.5" />
                    <p class="text-xs font-medium text-muted-foreground">
                      {isEditing
                        ? "By updating this entry, you confirm that all information provided is accurate. Your previous submission will be replaced."
                        : "By submitting this entry, you confirm that all information provided is accurate and you agree to the awards terms and conditions."}
                    </p>
                  </div>
                </CardContent>
                <CardFooter class="justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onclick={prevStep}
                    class="font-bold"
                  >
                    <ArrowLeft class="mr-2 size-4" /> Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    class="px-10 font-bold shadow-lg shadow-primary/20"
                  >
                    {#if isSubmitting}
                      <Loader2 class="mr-2 size-4 animate-spin" />
                      {isEditing ? "Updating..." : "Submitting..."}
                    {:else}
                      {isEditing ? "Update Entry" : "Confirm & Submit"}
                      <CheckCircle class="ml-2 size-4" />
                    {/if}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          {/if}
        </div>
      </form>
    {/if}
  </div>
</div>
