<script lang="ts">
  import WhatsApp from "$lib/components/icons/WhatsApp.svelte";
  import { cn } from "$lib/utils";
  import { COMPANY_INFO, SITE_NAME } from "$lib/constants";

  let { class: className } = $props<{ class?: string }>();

  const whatsappNumber = COMPANY_INFO.phone;
  const message = `Hello ${SITE_NAME}, I have an inquiry about your products.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(message)}`;
</script>

<div
  class={cn(
    "fixed bottom-20 lg:bottom-6 right-4 z-[100] group hidden lg:flex flex-col items-end gap-3",
    className,
  )}
>
  <!-- Inquiry Label -->
  <div
    class="bg-card px-4 py-2 rounded-xl shadow-2xl border border-primary/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none"
  >
    <p class="text-xs font-bold text-primary whitespace-nowrap">
      Chat with us on WhatsApp
    </p>
  </div>

  <!-- WhatsApp Button -->
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="relative flex items-center justify-center size-10 rounded-xl bg-background shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_50px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group/btn"
    aria-label="Chat on WhatsApp"
  >
    <!-- Pulse Effect -->
    <span
      class="absolute inset-0 rounded-xl bg-[#25D366] animate-ping opacity-20 group-hover:opacity-0"
    ></span>

    <!-- WhatsApp Icon -->
    <WhatsApp class="w-6 h-6 fill-white" />

    <!-- Notification Badge -->
    <div class="absolute -top-1 -right-1 flex h-3 w-3">
      <span
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
      ></span>
      <span
        class="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"
      ></span>
    </div>
  </a>
</div>
