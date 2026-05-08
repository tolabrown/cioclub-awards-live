<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Card, CardContent } from "$lib/components/ui/card/index.js";
  import {
    Mail,
    Phone,
    MapPin,
    MessageCircle,
    Send,
    Sparkles,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { enhance } from "$app/forms";
  import { COMPANY_INFO } from "$lib/constants/index";

  let isSubmitting = $state(false);
</script>

<div class="center px-4 py-12 md:py-20">
  <div class="grid gap-16 lg:grid-cols-2 lg:items-center">
    <!-- Left Column: Content & Info -->
    <div class="space-y-8 animate-in">
      <div>
        <div
          class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-6"
        >
          <Sparkles class="size-3.5" />
          We're Here for You
        </div>
        <h1
          class="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6"
        >
          Let's Start a <span
            class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >Conversation</span
          >
        </h1>
        <p class="text-lg text-muted-foreground leading-relaxed max-w-lg">
          Have a question about a product, order, or just want to say hello? Our
          team is standing by to assist you with anything you need.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Card class="border-border/50 bg-card/30 backdrop-blur-sm">
          <CardContent class="p-6">
            <div
              class="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center text-primary mb-4"
            >
              <Mail class="size-5" />
            </div>
            <h3 class="font-bold text-lg mb-1">Email Us</h3>
            <p class="text-sm text-muted-foreground mb-3">
              Response within 24 hours
            </p>
            <a
              href="mailto:{COMPANY_INFO.email}"
              class="text-sm font-bold text-primary hover:underline"
              >{COMPANY_INFO.email}</a
            >
          </CardContent>
        </Card>

        <Card class="border-border/50 bg-card/30 backdrop-blur-sm">
          <CardContent class="p-6">
            <div
              class="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center text-primary mb-4"
            >
              <Phone class="size-5" />
            </div>
            <h3 class="font-bold text-lg mb-1">Call Us</h3>
            <p class="text-sm text-muted-foreground mb-3">
              Mon-Fri from 9am to 6pm
            </p>
            <a
              href="tel:{COMPANY_INFO.phone}"
              class="text-sm font-bold text-primary hover:underline"
              >{COMPANY_INFO.phone}</a
            >
          </CardContent>
        </Card>

        <Card class="border-border/50 bg-card/30 backdrop-blur-sm">
          <CardContent class="p-6">
            <div
              class="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center text-primary mb-4"
            >
              <MapPin class="size-5" />
            </div>
            <h3 class="font-bold text-lg mb-1">Visit Us</h3>
            <p class="text-sm text-muted-foreground mb-3">Main Office HQ</p>
            <p class="text-sm font-bold">{COMPANY_INFO.address}</p>
          </CardContent>
        </Card>

        <Card class="border-border/50 bg-card/30 backdrop-blur-sm">
          <CardContent class="p-6">
            <div
              class="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center text-primary mb-4"
            >
              <MessageCircle class="size-5" />
            </div>
            <h3 class="font-bold text-lg mb-1">Live Chat</h3>
            <p class="text-sm text-muted-foreground mb-3">
              Available for quick help
            </p>
            <Button
              size="sm"
              variant="outline"
              href={`https://wa.me/${COMPANY_INFO.phone.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              class="mt-1">Start Chat</Button
            >
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Right Column: Contact Form -->
    <div class="relative">
      <!-- Decorative Backdrop -->
      <div
        class="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-primary/10 blur-3xl rounded-xl -z-10 opacity-50"
      ></div>

      <Card class="border-border shadow-lg rounded-xl">
        <CardContent class="p-8 md:p-10">
          <form
            method="POST"
            use:enhance={() => {
              isSubmitting = true;
              return async ({ result }) => {
                isSubmitting = false;
                if (result.type === "success") {
                  toast.success("Message sent successfully!", {
                    description:
                      "One of our representatives will get back to you shortly.",
                    position: "top-center",
                  });
                } else {
                  toast.error("Failed to send message. Please try again.");
                }
              };
            }}
            class="space-y-6"
          >
            <div class="grid gap-6 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="first-name" class="font-bold">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  required
                  class="rounded-lg h-11"
                />
              </div>
              <div class="space-y-2">
                <Label for="last-name" class="font-bold">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  required
                  class="rounded-lg h-11"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="email" class="font-bold">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                class="rounded-lg h-11"
              />
            </div>

            <div class="space-y-2">
              <Label for="subject" class="font-bold">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="How can we help?"
                required
                class="rounded-lg h-11"
              />
            </div>

            <div class="space-y-2">
              <Label for="message" class="font-bold">Your Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us more about your inquiry..."
                rows={5}
                required
                class="rounded-lg resize-none"
              />
            </div>

            <Button
              type="submit"
              class="w-full font-bold text-base rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {#if isSubmitting}
                <div
                  class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
                ></div>
                Sending Message...
              {:else}
                <Send class="mr-2 size-4" />
                Send Inquiry
              {/if}
            </Button>

            <p
              class="text-center text-xs text-muted-foreground mx-auto max-w-[240px]"
            >
              By sending this inquiry, you agree to our <a
                href="/terms"
                class="underline hover:text-primary">Terms of Service</a
              >
              and
              <a href="/privacy" class="underline hover:text-primary"
                >Privacy Policy</a
              >.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
