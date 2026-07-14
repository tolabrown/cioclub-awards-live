<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$lib/components/ui/select";
  import { Card, CardContent } from "$lib/components/ui/card";
  import {
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Send,
    Handshake,
    User,
    ArrowRight,
    Headset,
    Globe,
    Shield,
    Loader2,
    CheckCircle,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { enhance } from "$app/forms";

  let { data, form } = $props();

  let isSubmitting = $state(false);
  let isSuccess = $state(false);
  let selectedInquiryType = $state<string>("");

  const contactMethods = [
    {
      icon: Mail,
      label: "Email Us",
      value: "info@thecioclubafrica.com",
      description: "Send us a message anytime.",
      href: "mailto:info@thecioclubafrica.com",
    },
    {
      icon: Phone,
      label: "Direct Support",
      description: "Mon-Fri from 8am to 5pm.",
      isPersonnel: true,
      contacts: [
        {
          name: "Adesewa Jethro",
          tel: "tel:+2348102668340",
          wa: "https://wa.me/2348102668340",
        },
      ],
    },
    {
      icon: MapPin,
      label: "Lagos HQ",
      value: "Ikeja Lagos",
      description: "Our primary regional hub.",
      href: "https://www.google.com/maps/place/L'Monarch+Plaza/@6.5886053,3.3617455,19z/data=!4m6!3m5!1s0x103b935dd877b665:0x7ccbe9670a5cf77a!8m2!3d6.5891462!4d3.361598!16s%2Fg%2F11r_xrg2pr?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D",
    },
  ];

  function handleSubmit() {
    isSubmitting = true;
    return async ({
      result,
      update,
    }: {
      result: any;
      update: () => Promise<void>;
    }) => {
      isSubmitting = false;
      if (result.type === "success" && result.data?.success) {
        isSuccess = true;
        selectedInquiryType = "";
      } else {
        await update();
      }
    };
  }

  function resetForm() {
    isSuccess = false;
    selectedInquiryType = "";
  }
</script>

<div class="min-h-screen overflow-x-hidden">
  <!-- Hero Section -->
  <section
    class="relative py-20 md:py-32 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
    ></div>
    <div
      class="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center space-y-4 pt-12 md:pt-20"
    >
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
      >
        <Headset class="size-4" />
        Member Support
      </div>
      <h1
        class="text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
      >
        Connect with the Future
      </h1>
      <p
        class="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium"
      >
        Whether you're looking to join the elite circle of C-Suite Executives or
        explore corporate partnerships, our team is here to guide you.
      </p>
    </div>
  </section>

  <!-- Main Content -->
  <section
    class="py-20 lg:py-32 bg-background relative -mt-16 z-20 overflow-x-hidden"
  >
    <div class="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div class="grid lg:grid-cols-12 gap-4">
        <!-- Left Column: Form -->
        <div class="lg:col-span-7">
          <Card
            class="rounded-xl border border-border shadow-lg overflow-hidden bg-card"
          >
            <CardContent class="p-4 space-y-8">
              {#if isSuccess}
                <!-- Success State -->
                <div class="text-center space-y-4 py-10">
                  <div
                    class="size-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <CheckCircle class="size-10 text-primary" />
                  </div>
                  <div class="space-y-4">
                    <h2
                      class="text-3xl font-bold tracking-tight text-foreground"
                    >
                      Message Sent Successfully
                    </h2>
                    <p
                      class="text-lg text-muted-foreground font-medium max-w-md mx-auto"
                    >
                      Thank you for reaching out. Our team will review your
                      inquiry and get back to you within 24-48 hours.
                    </p>
                  </div>
                  <Button
                    onclick={resetForm}
                    class="font-bold uppercase tracking-widest text-sm"
                  >
                    Send Another Message
                  </Button>
                </div>
              {:else}
                <!-- Form State -->
                <div class="space-y-2">
                  <h2
                    class="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
                  >
                    Direct Inquiry
                  </h2>
                  <p
                    class="text-base md:text-lg text-muted-foreground font-medium italic"
                  >
                    "Advancing leadership through meaningful connections."
                  </p>
                </div>

                {#if form?.message}
                  <div
                    class="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                  >
                    {form.message}
                  </div>
                {/if}

                <form
                  method="POST"
                  action="?/submit"
                  use:enhance={handleSubmit}
                  class="grid gap-4"
                >
                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="space-y-4">
                      <label
                        for="fullName"
                        class="text-xs font-bold uppercase tracking-widest text-foreground"
                        >Full Name</label
                      >
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Abiola Laseinde"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div class="space-y-4">
                      <label
                        for="email"
                        class="text-xs font-bold uppercase tracking-widest text-foreground"
                        >Professional Email</label
                      >
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ceo@company.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div class="space-y-4">
                    <label
                      for="inquiryType"
                      class="text-xs font-bold uppercase tracking-widest text-foreground"
                      >Inquiry Type</label
                    >
                    <input
                      type="hidden"
                      name="inquiryType"
                      value={selectedInquiryType}
                    />
                    <Select
                      type="single"
                      bind:value={selectedInquiryType}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="inquiryType"
                        >{selectedInquiryType.length > 0
                          ? selectedInquiryType
                          : "How can we help you?"}</SelectTrigger
                      >
                      <SelectContent>
                        {#each data.inquiryTypes as type}
                          <SelectItem
                            value={type.value}
                            class="font-bold py-3 uppercase text-[10px] tracking-widest"
                            >{type.label}</SelectItem
                          >
                        {/each}
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="space-y-4">
                    <label
                      for="message"
                      class="text-xs font-bold uppercase tracking-widest text-foreground"
                      >Your Message</label
                    >
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Describe your inquiry in detail..."
                      class="min-h-[200px]"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedInquiryType}
                    class="font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all gap-3"
                  >
                    {#if isSubmitting}
                      <Loader2 class="size-5 animate-spin" />
                      Sending...
                    {:else}
                      Send Inquiry
                      <Send class="size-5" />
                    {/if}
                  </Button>
                </form>
              {/if}
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Info & Partnership -->
        <div class="lg:col-span-5 space-y-4">
          <!-- Contact Methods Grid -->
          <div class="grid sm:grid-cols-2 gap-4">
            {#each contactMethods as method}
              <div
                class="block p-4 rounded-xl bg-card border border-border/50 space-y-4 hover:border-primary/30 transition-colors group shadow-sm"
              >
                <div
                  class="size-14 rounded-xl bg-muted flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform"
                >
                  <method.icon class="size-6" />
                </div>
                <div class="space-y-4">
                  <h3
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {method.label}
                  </h3>
                  {#if method.isPersonnel}
                    <div class="space-y-3">
                      {#each method.contacts as contact}
                        <div class="flex items-center justify-between">
                          <a
                            href={contact.tel}
                            class="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors"
                          >
                            {contact.name}
                          </a>
                          <a
                            href={contact.wa}
                            target="_blank"
                            class="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                          >
                            <MessageSquare class="size-4" />
                          </a>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <a
                      href={method.href}
                      target={method.href?.startsWith("http")
                        ? "_blank"
                        : undefined}
                      class="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors block"
                    >
                      {method.value}
                    </a>
                  {/if}
                </div>
                <p class="text-xs font-medium text-muted-foreground">
                  {method.description}
                </p>
              </div>
            {/each}
          </div>

          <!-- Partnership Highlight Card -->
          <div
            class="bg-primary text-primary-foreground rounded-xl p-4 md:p-6 lg:p-12 relative overflow-hidden shadow-lg border border-primary-foreground/5"
          >
            <div class="absolute inset-0 bg-grid-white opacity-5"></div>
            <div class="relative z-10 space-y-4">
              <div class="flex items-center gap-4">
                <div
                  class="size-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center"
                >
                  <Handshake class="size-6 text-accent-gold" />
                </div>
                <span
                  class="text-xs font-bold uppercase tracking-widest text-primary-foreground/70"
                  >Institutional Partners</span
                >
              </div>

              <div class="space-y-4">
                <h2 class="text-3xl font-bold leading-tight">
                  Corporate & Strategic Support
                </h2>
                <p
                  class="text-primary-foreground/80 font-medium leading-relaxed"
                >
                  Join forces with Africa's most influential tech community to
                  drive institutional digital transformation.
                </p>
              </div>

              <div
                class="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-4 p-4 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 backdrop-blur-sm"
              >
                <div class="grid grid-cols-[64px_1fr] gap-2">
                  <div
                    class="size-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center text-primary shrink-0"
                  >
                    <User class="size-8" />
                  </div>
                  <div class="flex-1">
                    <p class="font-bold">Adesewa Jethro</p>
                    <p
                      class="text-[10px] text-black/80 font-bold uppercase tracking-widest"
                    >
                      Head of Partnerships
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  class="rounded-full px-6 font-bold uppercase text-[10px] tracking-widest"
                  href="https://wa.me/2348102668340"
                  target="_blank"
                >
                  Connect
                </Button>
              </div>
            </div>

            <!-- Abstract background icon -->
            <div
              class="absolute -right-12 -bottom-12 opacity-10 hidden md:block"
            >
              <Shield class="size-48 text-white rotate-12" />
            </div>
          </div>

          <!-- Locations / FAQ Prompt -->
          <div
            class="p-10 border-2 border-dashed border-border rounded-xl text-center space-y-4"
          >
            <MessageSquare class="size-10 mx-auto text-primary/30" />
            <h3
              class="text-xl font-bold uppercase tracking-tight text-foreground"
            >
              Need Quick Answers?
            </h3>
            <p class="text-muted-foreground font-medium">
              Check our membership guide and FAQ for immediate support.
            </p>
            <Button
              variant="link"
              class="text-primary font-bold text-lg group"
              href="/faq"
            >
              Read Member Guide
              <ArrowRight
                class="ml-2 size-5 group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  :global(.bg-grid-white) {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
  }
</style>
