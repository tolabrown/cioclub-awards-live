<script lang="ts">
  import { Constants } from "$lib/constants";
  import BrandLink from "$lib/components/widgets/BrandLink.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
    ArrowUp,
  } from "@lucide/svelte";

  const socialLinks = [
    { icon: Facebook, href: Constants.FACEBOOK },
    { icon: Twitter, href: Constants.TWITTER },
    { icon: Linkedin, href: Constants.LINKEDIN },
    { icon: Instagram, href: Constants.INSTAGRAM },
    { icon: Youtube, href: Constants.YOUTUBE },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
</script>

<footer
  class="bg-card text-card-foreground border-t border-border pt-20 pb-12 overflow-hidden relative"
>
  <!-- Decorative background elements -->
  <div
    class="absolute -right-20 -top-20 size-80 bg-primary/5 rounded-full blur-3xl"
  ></div>
  <div
    class="absolute -left-20 -bottom-20 size-80 bg-primary/5 rounded-full blur-3xl"
  ></div>

  <div class="container mx-auto px-4 relative z-10">
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16"
    >
      <div class="space-y-8">
        <BrandLink />
        <p class="text-muted-foreground leading-relaxed max-w-sm">
          The premier platform for IT leaders in Africa, driving digital
          transformation and excellence through collaboration, innovation, and
          strategic leadership.
        </p>
        <div class="flex gap-3">
          {#each socialLinks as social}
            <Button
              variant="outline"
              size="icon"
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm"
            >
              <social.icon class="h-4 w-4" />
            </Button>
          {/each}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 lg:col-span-2">
        <div>
          <h4 class="font-bold text-lg mb-8 relative inline-block">
            Quick Links
            <span
              class="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"
            ></span>
          </h4>
          <ul class="space-y-4">
            {#each [{ label: "About Us", href: "/about" }, { label: "Membership", href: "/membership" }, { label: "Events & Awards", href: "/events" }, { label: "Partnerships", href: "/partnerships" }, { label: "News & Insights", href: "/news" }] as link}
              <li>
                <a
                  href={link.href}
                  class="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span
                    class="w-0 h-0.5 bg-primary group-hover:w-2 transition-all"
                  ></span>
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>

        <div>
          <h4 class="font-bold text-lg mb-8 relative inline-block">
            Support
            <span
              class="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"
            ></span>
          </h4>
          <ul class="space-y-4">
            {#each [{ label: "Contact Us", href: "/contact" }, { label: "Donate", href: "/donate" }, { label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "FAQ", href: "/faq" }, { label: "Gallery", href: "/gallery" }] as link}
              <li>
                <a
                  href={link.href}
                  class="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  <span
                    class="w-0 h-0.5 bg-primary group-hover:w-2 transition-all"
                  ></span>
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>

      <div class="lg:col-span-1">
        <h4 class="font-bold text-lg mb-8 relative inline-block">
          Contact Info
          <span
            class="absolute -bottom-2 left-0 w-8 h-1 bg-primary rounded-full"
          ></span>
        </h4>
        <div
          class="bg-muted/30 rounded-xl p-6 border border-border/50 space-y-6 shadow-sm backdrop-blur-sm"
        >
          <a
            href="https://www.google.com/maps/place/L'Monarch+Plaza/@6.5886053,3.3617455,19z/data=!4m6!3m5!1s0x103b935dd877b665:0x7ccbe9670a5cf77a!8m2!3d6.5891462!4d3.361598!16s%2Fg%2F11r_xrg2pr?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-start gap-4 hover:opacity-80 transition-opacity"
          >
            <div
              class="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
            >
              <MapPin class="h-5 w-5 text-primary" />
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold">Office Address</p>
              <p class="text-xs text-muted-foreground leading-relaxed">
                Lagos, Nigeria
              </p>
            </div>
          </a>

          <div class="flex items-start gap-4">
            <div
              class="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
            >
              <Phone class="h-5 w-5 text-primary" />
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold">Direct Support</p>
              <div class="flex flex-col gap-1">

                <a
                  href="tel:{Constants.ADESEWA_PHONE}"
                  class="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Adesewa Jethro
                </a>
                <a
                  href="tel:{Constants.RACHEAL_PHONE}"
                  class="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Racheal Odeja
                </a>
              </div>
            </div>
          </div>

          <a
            href="mailto:{Constants.SUPPORTEMAIL}"
            class="flex items-start gap-4 hover:opacity-80 transition-opacity"
          >
            <div
              class="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
            >
              <Mail class="h-5 w-5 text-primary" />
            </div>
            <div class="space-y-1">
              <p class="text-sm font-bold">Email Address</p>
              <p class="text-xs text-muted-foreground truncate">
                {Constants.SUPPORTEMAIL}
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>

    <div
      class="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6"
    >
      <p class="text-sm text-muted-foreground order-2 md:order-1">
        © {new Date().getFullYear()}
        {Constants.BRANDNAME}. All rights reserved. Powered by
        <a
          href="https://www.edniesalconsulting.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline">Edniesal</a
        >.
      </p>

      <div class="flex items-center gap-6 order-1 md:order-2">
        <button
          onclick={scrollToTop}
          class="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
        >
          Back to top
          <ArrowUp class="size-4" />
        </button>
      </div>
    </div>
  </div>
</footer>
