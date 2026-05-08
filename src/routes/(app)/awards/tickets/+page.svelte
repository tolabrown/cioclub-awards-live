<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "$lib/components/ui/dialog";
  import {
    Ticket,
    Calendar,
    MapPin,
    Clock,
    CheckCircle,
    Star,
    Users,
    Loader2,
    CreditCard,
    Minus,
    Plus,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";

  let { data, form } = $props();

  let selectedTicket = $state<string | null>(null);
  let quantity = $state(1);
  let showBookingModal = $state(false);
  let isSubmitting = $state(false);

  $effect(() => {
    if (form?.success) {
      toast.success(
        "Booking created! Please complete payment to confirm your tickets.",
      );
      showBookingModal = false;
      selectedTicket = null;
      quantity = 1;
    } else if (form?.message) {
      toast.error(form.message);
    }
  });

  function selectTicket(ticketId: string) {
    selectedTicket = ticketId;
    quantity = 1;
    showBookingModal = true;
  }

  function incrementQuantity() {
    if (selectedTicket !== "corporate_table" && quantity < 10) {
      quantity++;
    }
  }

  function decrementQuantity() {
    if (quantity > 1) {
      quantity--;
    }
  }

  const selectedTicketDetails = $derived(
    data.ticketTypes.find((t: any) => t.id === selectedTicket),
  );

  const totalPrice = $derived(
    selectedTicketDetails ? selectedTicketDetails.price * quantity : 0,
  );
</script>

<svelte:head>
  <title>Tickets | CIO Awards Africa {new Date().getFullYear()}</title>
  <meta
    name="description"
    content="Secure your tickets to The CIO & C-Suite Awards Africa {new Date().getFullYear()} gala ceremony. Join Africa's top IT leaders for an evening of celebration and networking."
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Hero Section -->
  <section class="relative py-24 overflow-hidden">
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10"
    ></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-4xl mx-auto text-center space-y-6">
        <Badge
          variant="secondary"
          class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
        >
          <Ticket class="size-3 mr-2" />
          Secure Your Seat
        </Badge>
        <h1
          class="text-3xl md:text-5xl font-bold tracking-tight text-foreground"
        >
          CIO Awards Africa <span class="text-primary"
            >{new Date().getFullYear()}</span
          >
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join Africa's premier IT leadership celebration. Reserve your tickets
          for an unforgettable evening of recognition, networking, and
          excellence.
        </p>

        <!-- Event Details -->
        <div class="flex flex-wrap items-center justify-center gap-6 pt-4">
          <div class="flex items-center gap-2 text-muted-foreground">
            <Calendar class="size-5 text-primary" />
            <span class="font-medium">
              {new Date(data.eventDetails.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div class="flex items-center gap-2 text-muted-foreground">
            <Clock class="size-5 text-primary" />
            <span class="font-medium">
              {new Date(data.eventDetails.time).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })} WAT
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Tickets Section -->
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {#each data.ticketTypes as ticket}
          <Card
            class={cn(
              "relative overflow-hidden transition-all hover:shadow-lg",
              ticket.recommended && "border-primary shadow-md",
            )}
          >
            {#if ticket.recommended}
              <div
                class="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-bl-lg"
              >
                Most Popular
              </div>
            {/if}
            <CardHeader class="text-center pb-4">
              <div
                class="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4"
              >
                {#if ticket.id === "standard"}
                  <Ticket class="size-7" />
                {:else if ticket.id === "vip"}
                  <Star class="size-7" />
                {:else}
                  <Users class="size-7" />
                {/if}
              </div>
              <CardTitle class="text-xl">{ticket.name}</CardTitle>
              <CardDescription>{ticket.description}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="text-center">
                <span class="text-4xl font-bold text-foreground"
                  >{ticket.priceDisplay}</span
                >
                {#if ticket.id === "corporate_table"}
                  <span class="text-muted-foreground text-sm">
                    / table of 10</span
                  >
                {:else}
                  <span class="text-muted-foreground text-sm"> / person</span>
                {/if}
              </div>
              <ul class="space-y-3">
                {#each ticket.features as feature}
                  <li class="flex items-start gap-3">
                    <CheckCircle class="size-5 text-primary shrink-0 mt-0.5" />
                    <span class="text-sm text-muted-foreground">{feature}</span>
                  </li>
                {/each}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                class="w-full"
                variant={ticket.recommended ? "default" : "outline"}
                onclick={() => selectTicket(ticket.id)}
              >
                Select {ticket.name}
              </Button>
            </CardFooter>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Event Highlights -->
  <section class="py-16 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <h2 class="text-2xl md:text-3xl font-bold text-foreground">
          What to Expect
        </h2>
        <div class="grid sm:grid-cols-3 gap-8">
          <div class="space-y-3">
            <div
              class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto"
            >
              <Star class="size-6" />
            </div>
            <h3 class="font-bold text-foreground">Awards Ceremony</h3>
            <p class="text-sm text-muted-foreground">
              Celebrate Africa's top IT leaders and their achievements
            </p>
          </div>
          <div class="space-y-3">
            <div
              class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto"
            >
              <Users class="size-6" />
            </div>
            <h3 class="font-bold text-foreground">Networking</h3>
            <p class="text-sm text-muted-foreground">
              Connect with 500+ senior technology executives
            </p>
          </div>
          <div class="space-y-3">
            <div
              class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto"
            >
              🍽️
            </div>
            <h3 class="font-bold text-foreground">Gala Dinner</h3>
            <p class="text-sm text-muted-foreground">
              Exquisite dining experience with premium service
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<!-- Booking Modal -->
<Dialog bind:open={showBookingModal}>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Book {selectedTicketDetails?.name} Ticket</DialogTitle>
      <DialogDescription>Complete your booking details below</DialogDescription>
    </DialogHeader>

    <form
      method="POST"
      action="?/book"
      use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          await update();
          isSubmitting = false;
        };
      }}
    >
      <input type="hidden" name="ticketType" value={selectedTicket} />
      <input type="hidden" name="quantity" value={quantity} />

      <div class="space-y-4 py-4">
        {#if selectedTicket !== "corporate_table"}
          <div
            class="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
          >
            <span class="font-medium">Quantity</span>
            <div class="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                class="size-8"
                onclick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus class="size-4" />
              </Button>
              <span class="w-8 text-center font-bold">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                class="size-8"
                onclick={incrementQuantity}
                disabled={quantity >= 10}
              >
                <Plus class="size-4" />
              </Button>
            </div>
          </div>
        {/if}

        <div class="space-y-2">
          <Label for="attendeeName">Full Name *</Label>
          <Input
            id="attendeeName"
            name="attendeeName"
            placeholder="Your full name"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="attendeeEmail">Email Address *</Label>
          <Input
            id="attendeeEmail"
            name="attendeeEmail"
            type="email"
            placeholder="you@company.com"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="attendeeCompany">Company</Label>
          <Input
            id="attendeeCompany"
            name="attendeeCompany"
            placeholder="Your company"
          />
        </div>

        <div class="space-y-2">
          <Label for="attendeePhone">Phone Number</Label>
          <Input
            id="attendeePhone"
            name="attendeePhone"
            type="tel"
            placeholder="+2348102668340"
          />
        </div>

        <div class="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="font-medium text-foreground">Total</span>
            <span class="text-xl font-bold text-primary">
              ₦{(totalPrice / 100).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <Button
          type="button"
          variant="outline"
          class="flex-1"
          onclick={() => (showBookingModal = false)}
        >
          Cancel
        </Button>
        <Button type="submit" class="flex-1" disabled={isSubmitting}>
          {#if isSubmitting}
            <Loader2 class="mr-2 size-4 animate-spin" />
            Processing...
          {:else}
            <CreditCard class="mr-2 size-4" />
            Proceed to Pay
          {/if}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
