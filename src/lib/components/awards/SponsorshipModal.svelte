<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
    import { Button } from "../ui/button";
  import SponsorshipInquiryForm from "./SponsorshipInquiryForm.svelte";
  import { Handshake, CheckCircle } from "@lucide/svelte";

  let {
    open = $bindable(false),
    initialPackage = "",
    packages = [],
  } = $props();

  const isMobile = new IsMobile();
  let isSubmitting = $state(false);
  let isSubmitted = $state(false);

  function handleSuccess() {
    isSubmitted = true;
    // Auto close after showing thank you for a bit
    setTimeout(() => {
      open = false;
    }, 4000);
  }

  // Reset submitted state when modal closes
  $effect(() => {
    if (!open) {
      setTimeout(() => {
        isSubmitted = false;
      }, 300); // Wait for transition
    }
  });
</script>

{#if isMobile.current}
  <Drawer.Root bind:open>
    <Drawer.Content class="px-4 pb-10">
      <Drawer.Header class="text-left px-0">
        <Drawer.Title class="text-2xl font-bold flex items-center gap-2">
          <div class="bg-primary/10 p-2 rounded-xl text-primary">
            <Handshake class="size-6" />
          </div>
          {isSubmitted ? "Thank You!" : "Sponsorship Interest"}
        </Drawer.Title>
        <Drawer.Description class="text-muted-foreground font-medium">
          {#if isSubmitted}
            We've received your inquiry. Our partnership team will contact you
            within 24-48 hours.
          {:else}
            Partner with CIO Awards Africa. Fill out the form below and our team
            will get in touch.
          {/if}
        </Drawer.Description>
      </Drawer.Header>

      <div class="mt-4">
        {#if isSubmitted}
          <div
            class="py-12 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div
              class="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-in zoom-in duration-300"
            >
              <CheckCircle class="size-10" />
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-bold">Submission Successful</h3>
              <p class="text-muted-foreground text-sm max-w-xs mx-auto">
                Your interest has been recorded. You can close this drawer or
                wait for it to close automatically.
              </p>
            </div>
            <Button
              variant="outline"
              class="rounded-xl px-8"
              onclick={() => (open = false)}>Close</Button
            >
          </div>
        {:else}
          <SponsorshipInquiryForm
            {packages}
            {initialPackage}
            bind:isSubmitting
            onSuccess={handleSuccess}
          />
        {/if}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{:else}
  <Dialog.Root bind:open>
    <Dialog.Content
      class="sm:max-w-[600px] rounded-xl border-border/60 shadow-lg p-0 overflow-hidden"
    >
      <Dialog.Header
        class="p-8 bg-muted/20 border-b border-border/40 text-left"
      >
        <Dialog.Title class="text-3xl font-bold flex items-center gap-3">
          <div class="bg-primary/10 p-2 rounded-xl text-primary">
            <Handshake class="size-8" />
          </div>
          {isSubmitted ? "Success!" : "Sponsorship Interest"}
        </Dialog.Title>
        <Dialog.Description
          class="text-muted-foreground font-medium text-base mt-2"
        >
          {#if isSubmitted}
            Your sponsorship inquiry has been submitted successfully.
          {:else}
            Align your brand with Africa's premier technology leadership
            community. The Partnership team will reach out within 24-48 hours.
          {/if}
        </Dialog.Description>
      </Dialog.Header>

      <div class="p-8">
        {#if isSubmitted}
          <div
            class="py-12 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div
              class="size-24 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-in zoom-in spin-in-12 duration-500"
            >
              <CheckCircle class="size-12" />
            </div>
            <div class="space-y-2">
              <h2 class="text-2xl font-bold">Inquiry Received</h2>
              <p class="text-muted-foreground max-w-sm mx-auto">
                Thank you for your interest! Our partnership team is reviewing
                your request and will be in touch shortly.
              </p>
            </div>
            <Button
              class="rounded-xl px-12 h-12 font-bold"
              onclick={() => (open = false)}>Got it!</Button
            >
          </div>
        {:else}
          <SponsorshipInquiryForm
            {packages}
            {initialPackage}
            bind:isSubmitting
            onSuccess={handleSuccess}
          />
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}
