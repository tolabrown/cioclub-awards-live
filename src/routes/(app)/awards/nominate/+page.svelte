<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";
  import {
    UserPlus,
    Send,
    CheckCircle,
    Star,
    Clock,
    Lock,
    CalendarClock,
    ExternalLink,
  } from "@lucide/svelte";
  import { onMount } from "svelte";

  let { data } = $props();

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
</script>

<svelte:head>
  <title>Nominate a Leader | CIO Awards Africa</title>
  <meta
    name="description"
    content="Nominate an outstanding IT leader for The CIO & C-Suite Awards Africa. Recognize the visionaries transforming African organizations through technology."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section
    class="relative py-24 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-linear-to-br from-primary via-primary/95 to-background/20"
    ></div>
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
    ></div>

    <div class="container mx-auto px-4 relative z-10 pt-16">
      <div class="max-w-3xl mx-auto text-center space-y-6">
        <Badge
          variant="outline"
          class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-primary-foreground/30 text-primary-foreground"
        >
          <UserPlus class="size-3 mr-2 text-accent" />
          Nominate a Leader
        </Badge>
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Recognize <span class="text-accent-foreground/80 italic"
            >IT Excellence</span
          >
        </h1>
        <p
          class="text-lg md:text-xl text-primary-foreground/80 font-medium max-w-2xl mx-auto"
        >
          Know an exceptional IT leader who deserves recognition? Nominate them
          for The CIO & C-Suite Awards Africa {new Date().getFullYear()}.
        </p>
      </div>
    </div>
  </section>

  <section class="py-16">
    <div class="container mx-auto px-4">
      {#if periodStatus === "not_set" || periodStatus === "closed"}
        <!-- Nominations Closed -->
        <div class="max-w-2xl mx-auto text-center">
          <Card class="border-border/50">
            <CardContent class="py-16 space-y-6">
              <div
                class="size-20 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto"
              >
                <Lock class="size-10" />
              </div>
              <h2 class="text-2xl font-bold text-foreground">
                Nominations {periodStatus === "closed"
                  ? "Have Ended"
                  : "Coming Soon"}
              </h2>
              <p class="text-muted-foreground max-w-md mx-auto">
                {#if periodStatus === "closed"}
                  The nomination period has ended. Thank you to everyone who
                  participated. Winners will be announced soon.
                {:else}
                  Nominations have not been opened yet. Check back soon for the
                  next nomination period.
                {/if}
              </p>
              <Button href="/awards" variant="outline">Back to Awards</Button>
            </CardContent>
          </Card>
        </div>
      {:else if periodStatus === "upcoming" && timeRemaining}
        <!-- Upcoming: Countdown to Start -->
        <div class="max-w-2xl mx-auto text-center">
          <Card class="border-primary/20">
            <CardContent class="py-16 space-y-8">
              <div
                class="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto"
              >
                <CalendarClock class="size-10" />
              </div>
              <div class="space-y-2">
                <h2 class="text-2xl font-bold text-foreground">
                  Nominations Opening Soon
                </h2>
                <p class="text-muted-foreground max-w-md mx-auto">
                  The nomination window opens on {new Date(
                    period.startDate!,
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
        <!-- Active Nomination Period with Countdown -->

        <!-- Countdown Banner -->
        {#if timeRemaining}
          <div class="max-w-4xl mx-auto mb-8">
            <Card class="border-primary/20 bg-primary/5">
              <CardContent class="py-4">
                <div
                  class="flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div class="flex items-center gap-3">
                    <Clock class="size-5 text-primary shrink-0" />
                    <span class="text-sm font-medium text-foreground"
                      >Nominations close in</span
                    >
                  </div>
                  <div class="flex gap-2">
                    {#each [{ value: timeRemaining.days, label: "d" }, { value: timeRemaining.hours, label: "h" }, { value: timeRemaining.minutes, label: "m" }, { value: timeRemaining.seconds, label: "s" }] as unit}
                      <div class="flex items-center gap-0.5">
                        <span
                          class="text-lg font-bold text-primary tabular-nums"
                        >
                          {String(unit.value).padStart(2, "0")}
                        </span>
                        <span class="text-xs text-muted-foreground font-medium"
                          >{unit.label}</span
                        >
                      </div>
                      {#if unit.label !== "s"}
                        <span class="text-muted-foreground/50 font-bold">:</span
                        >
                      {/if}
                    {/each}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        {/if}

        <div class="grid lg:grid-cols-3 gap-12">
          <!-- Sidebar -->
          <div class="space-y-6">
            <Card>
              <CardContent class="p-6 space-y-4">
                <div
                  class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
                >
                  <Star class="size-6" />
                </div>
                <h3 class="text-lg font-bold text-foreground">Why Nominate?</h3>
                <ul class="space-y-3 text-sm text-muted-foreground">
                  <li class="flex gap-2">
                    <CheckCircle class="size-4 text-primary shrink-0 mt-0.5" />
                    <span>Recognize colleagues who drive innovation</span>
                  </li>
                  <li class="flex gap-2">
                    <CheckCircle class="size-4 text-primary shrink-0 mt-0.5" />
                    <span>Highlight transformative IT leadership</span>
                  </li>
                  <li class="flex gap-2">
                    <CheckCircle class="size-4 text-primary shrink-0 mt-0.5" />
                    <span>Support African technology excellence</span>
                  </li>
                  <li class="flex gap-2">
                    <CheckCircle class="size-4 text-primary shrink-0 mt-0.5" />
                    <span>Build a stronger IT community</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent class="p-6 space-y-4">
                <h3 class="text-lg font-bold text-foreground">
                  Nomination Criteria
                </h3>
                <p class="text-sm text-muted-foreground">
                  The nominee should demonstrate:
                </p>
                <ul class="space-y-2 text-sm text-muted-foreground">
                  <li>• Strategic IT leadership</li>
                  <li>• Measurable business impact</li>
                  <li>• Innovation in technology adoption</li>
                  <li>• Team development & mentorship</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <!-- Link to External Form -->
          <div class="lg:col-span-2">
            <Card class="h-full flex flex-col justify-center items-center text-center p-8 space-y-8 border-primary/20 bg-primary/5 rounded-xl shadow-lg">
              <div class="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Send class="size-10" />
              </div>
              <div class="space-y-4 max-w-md">
                <h2 class="text-3xl font-bold text-foreground">Submit Your Nomination</h2>
                <p class="text-muted-foreground">
                  Recognize outstanding IT leadership. Click the button below to complete the nomination form on our secure platform.
                </p>
              </div>
              <Button href="https://zfrmz.com/ehOL2qeENHenXNdwxiLi" target="_blank" class="w-fit font-bold">
                Open Nomination Form
                <ExternalLink class="ml-2 size-5" />
              </Button>
              <div class="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-4 py-2 rounded-full border border-border/50">
                <CheckCircle class="size-3 text-primary" />
                <span>External form opens in a new tab</span>
              </div>
            </Card>
          </div>
        </div>
      {/if}
    </div>
  </section>
</div>
