<script lang="ts">
  import { Constants, SiteMeta, getNavigation } from "$lib/constants";
  import BrandLink from "$lib/components/widgets/BrandLink.svelte";
  import {
    Mail,
    Shield,
    Linkedin,
    Twitter,
    Phone,
    MessageSquare,
  } from "@lucide/svelte";

  const currentYear = new Date().getFullYear();
</script>

<footer
  class="bg-background border-t border-border py-8 relative overflow-hidden"
>
  <div class="center relative z-10">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="col-span-1 md:col-span-2">
        <div class="mb-4">
          <BrandLink />
        </div>
        <p
          class="text-muted-foreground max-w-sm mb-4 font-sans text-sm leading-relaxed"
        >
          Elevating corporate governance and business advisory to world-class
          standards across international markets.
        </p>
        <div class="flex gap-2">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            class="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Linkedin class="w-4 h-4" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            class="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Twitter class="w-4 h-4" />
          </a>
        </div>
      </div>

      <div>
        <h4
          class="font-heading font-bold text-foreground mb-4 uppercase tracking-widest text-sm"
        >
          Quick Links
        </h4>
        <ul class="space-y-2 text-muted-foreground text-sm">
          <li>
            <a href="/" class="hover:text-primary transition-colors">Home</a>
          </li>
          <li>
            <a href="/services" class="hover:text-primary transition-colors"
              >Services</a
            >
          </li>
          <li>
            <a href="/team" class="hover:text-primary transition-colors">Team</a
            >
          </li>
          <li>
            <a href="/contact" class="hover:text-primary transition-colors"
              >Contact</a
            >
          </li>
        </ul>
      </div>

      <div>
        <h4
          class="font-heading font-bold text-foreground mb-4 uppercase tracking-widest text-sm"
        >
          Support
        </h4>
        <ul class="space-y-2 text-muted-foreground text-sm">
          <li>
            <a
              href="mailto:{Constants.SUPPORTEMAIL}"
              class="hover:text-primary transition-colors flex items-center gap-2"
            >
              <Mail class="w-3 h-3" />
              {Constants.SUPPORTEMAIL}
            </a>
          </li>
          <li class="pt-2">
            <div
              class="flex items-center gap-2 text-foreground font-bold uppercase tracking-widest text-[10px] mb-2"
            >
              <Phone class="w-3 h-3" /> Direct Support
            </div>
            <div class="space-y-3 pl-5">
              <div class="flex items-center justify-between gap-2">
                <a
                  href="tel:{Constants.ADESEWA_PHONE}"
                  class="hover:text-primary transition-colors"
                >
                  Adesewa Jethro
                </a>
                <a
                  href={Constants.ADESEWA_WHATSAPP}
                  target="_blank"
                  class="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <MessageSquare class="size-3" />
                </a>
              </div>
              <div class="flex items-center justify-between gap-2">
                <a
                  href="tel:{Constants.CORDELIA_PHONE}"
                  class="hover:text-primary transition-colors"
                >
                  Dr. Cordelia Ilori
                </a>
                <a
                  href={Constants.CORDELIA_WHATSAPP}
                  target="_blank"
                  class="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <MessageSquare class="size-3" />
                </a>
              </div>
            </div>
          </li>
          <li class="pt-2">
            <a
              href="/privacy"
              class="hover:text-primary transition-colors flex items-center gap-2"
            >
              <Shield class="w-3 h-3" /> Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="/cookie-policy"
              class="hover:text-primary transition-colors flex items-center gap-2"
            >
              <Shield class="w-3 h-3" /> Cookie Policy
            </a>
          </li>
          <li>
            <a
              href="/terms-of-use"
              class="hover:text-primary transition-colors flex items-center gap-2"
            >
              <Shield class="w-3 h-3" /> Terms of Use
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="pt-4 border-t border-border text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4"
    >
      <p class="text-muted-foreground text-[10px]">
        © {currentYear}
        {Constants.BRANDNAME} Consulting. All rights reserved.
      </p>
      <div
        class="flex gap-4 text-muted-foreground text-[10px] font-medium uppercase tracking-widest"
      >
        <span>Nigeria</span>
        <span>UK</span>
        <span>US</span>
        <span>Canada</span>
      </div>
    </div>
  </div>
</footer>
