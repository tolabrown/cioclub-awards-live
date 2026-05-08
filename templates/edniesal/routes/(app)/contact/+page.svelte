<script lang="ts">
  import { Constants } from "$lib/constants";
  import { enhance } from "$app/forms";
  import MeshGradient from "$lib/components/widgets/MeshGradient.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import {
    Mail,
    Phone,
    MapPin,
    Globe,
    Loader2,
    CheckCircle2,
    Building2,
    Briefcase,
    MessageSquare,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";

  let { data, form } = $props();
  let loading = $state(false);
  const page = $derived(data.page.data);

  $effect(() => {
    if (form?.success) {
      toast.success(form.success);
    }
    if (form?.error) {
      toast.error(form.error);
    }
  });
</script>

<svelte:head>
  <title>{data.page.title}</title>
  <meta name="description" content={data.page.description} />
</svelte:head>

<div
  class="bg-background min-h-screen text-foreground relative overflow-hidden pb-20"
>
  <MeshGradient />

  <!-- Grid Pattern -->
  <div
    class="fixed inset-0 pointer-events-none opacity-5 -z-20 [mask-image:linear-gradient(180deg,var(--foreground),transparent)]"
    style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px);"
  ></div>

  <div class="container mx-auto px-4 pt-20 relative z-10 text-center mb-16">
    <div
      class="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 mb-6 animate-in fade-in"
    >
      <span class="text-xs font-bold text-primary tracking-widest uppercase"
        >Get In Touch</span
      >
    </div>
    <h1 class="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
      Let's <span class="text-primary italic">Connect</span>
    </h1>
    <p
      class="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
    >
      Whether you're looking for strategic board advisory, scaling your SME, or
      exploring partnership opportunities, our experts are ready to guide you.
    </p>
  </div>

  <div class="container mx-auto px-4">
    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto"
    >
      <!-- Contact Info & Extra Sections -->
      <div
        class="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700"
      >
        <Card.Root
          class="p-4 md:p-8 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl"
        >
          <h2 class="text-2xl font-bold mb-8 tracking-tight">Our Presence</h2>

          <div class="space-y-8">
            <div class="flex items-center gap-6 group">
              <div
                class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <Mail class="w-6 h-6" />
              </div>
              <div>
                <a
                  href="mailto:info@edniesalconsulting.com"
                  class="text-lg font-bold hover:text-primary transition-colors hover:underline"
                  >Email Us</a
                >
              </div>
            </div>

            <div class="flex items-center gap-6 group">
              <div
                class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <Phone class="w-6 h-6" />
              </div>
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Direct Support
                </p>
                <div class="space-y-4">
                  <div class="flex items-center justify-between gap-4">
                    <a
                      href="tel:{Constants.ADESEWA_PHONE}"
                      class="text-lg font-bold hover:text-primary transition-colors hover:underline"
                      >Adesewa Jethro</a
                    >
                    <a
                      href={Constants.ADESEWA_WHATSAPP as string}
                      target="_blank"
                      class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                    >
                      <MessageSquare class="w-5 h-5" />
                    </a>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <a
                      href="tel:{Constants.CORDELIA_PHONE}"
                      class="text-lg font-bold hover:text-primary transition-colors hover:underline"
                      >Dr. Cordelia Ilori</a
                    >
                    <a
                      href={Constants.CORDELIA_WHATSAPP as string}
                      target="_blank"
                      class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                    >
                      <MessageSquare class="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-6 group">
              <div
                class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <MapPin class="w-6 h-6" />
              </div>
              <div>
                <a
                  href="https://www.google.com/maps/place/L'Monarch+Plaza/@6.5886053,3.3617455,19z/data=!4m6!3m5!1s0x103b935dd877b665:0x7ccbe9670a5cf77a!8m2!3d6.5891462!4d3.361598!16s%2Fg%2F11r_xrg2pr?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-lg font-bold hover:text-primary transition-colors hover:underline"
                  >Headquarters</a
                >
              </div>
            </div>
          </div>
        </Card.Root>

        <!-- Work With Us Section -->
        <div
          class="p-4 md:p-8 border border-primary/20 rounded-2xl bg-primary/5 backdrop-blur-md shadow-lg relative overflow-hidden group"
        >
          <div
            class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
          >
            <Briefcase class="w-24 h-24" />
          </div>
          <h3 class="text-2xl font-bold text-foreground mb-4 tracking-tight">
            Work With Us
          </h3>
          <p
            class="text-muted-foreground font-medium mb-6 leading-relaxed relative z-10"
          >
            {page.workWithUs}
          </p>
          <div class="flex flex-wrap gap-3 relative z-10">
            <div
              class="px-4 py-2 rounded-xl bg-background/50 border border-border text-xs font-bold uppercase tracking-widest"
            >
              Global Network
            </div>
            <div
              class="px-4 py-2 rounded-xl bg-background/50 border border-border text-xs font-bold uppercase tracking-widest"
            >
              Enterprise Strategy
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="animate-in fade-in slide-in-from-right-4 duration-700">
        <Card.Root
          class="p-4 md:p-8 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl"
        >
          {#if form?.success}
            <div class="text-center py-10 animate-in zoom-in duration-500">
              <div
                class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 class="w-10 h-10 text-primary" />
              </div>
              <h3 class="text-3xl font-bold text-foreground mb-4">
                Inquiry Received
              </h3>
              <p class="text-muted-foreground font-medium mb-8">
                {form.success}
              </p>
              <Button
                href="/"
                variant="outline"
                class="rounded-xl h-12 px-8 font-bold">Return Home</Button
              >
            </div>
          {:else}
            <form
              method="POST"
              use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                  loading = false;
                  await update();
                };
              }}
              class="space-y-6"
            >
              <div class="space-y-2">
                <Label
                  for="name"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Full Name</Label
                >
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  class="h-12 bg-background/50 border-border/50 focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>

              <div class="space-y-2">
                <Label
                  for="email"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Work Email</Label
                >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  required
                  class="h-12 bg-background/50 border-border/50 focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>

              <div class="space-y-2">
                <Label
                  for="subject"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Area of Interest</Label
                >
                <SelectComponent
                  name="subject"
                  placeholder="Select an area of interest"
                  class="h-12 bg-background/50 border-border/50 focus:ring-1 focus:ring-primary/20 rounded-xl font-medium w-full"
                  value="Governance Advisory"
                  options={[
                    {
                      label: "Governance Advisory",
                      value: "Governance Advisory",
                    },
                    { label: "SME Scaling", value: "SME Scaling" },
                    { label: "Data Protection", value: "Data Protection" },
                    { label: "Partnership Inquiry", value: "Partnership" },
                    { label: "Career & Recruitment", value: "Career" },
                    { label: "Other Inquiry", value: "Other" },
                  ]}
                />
              </div>

              <div class="space-y-2">
                <Label
                  for="message"
                  class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >Your Message</Label
                >
                <Textarea
                  id="message"
                  name="message"
                  placeholder="How can our hub assist you today?"
                  required
                  class="bg-background/50 border-border/50 min-h-[150px] focus:ring-1 focus:ring-primary/20 rounded-xl font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                class="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {#if loading}
                  <Loader2 class="mr-2 h-4 w-4 animate-spin" /> Transmitting...
                {:else}
                  Send Message
                {/if}
              </Button>
            </form>
          {/if}
        </Card.Root>
      </div>
    </div>
  </div>
</div>
