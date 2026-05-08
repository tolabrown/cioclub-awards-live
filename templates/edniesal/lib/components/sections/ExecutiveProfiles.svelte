<script lang="ts">
  import { Linkedin, Mail, Twitter, ShieldCheck } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";

  let { leaders = [], title = "Board of Directors" } = $props();
</script>

<section id="leadership" class="py-24 relative overflow-hidden bg-background">
  <!-- Decorative background element -->
  <div
    class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10"
  ></div>

  <div class="container mx-auto px-4 relative z-10">
    <div
      class="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700"
    >
      <div
        class="inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 mb-6"
      >
        <ShieldCheck class="w-4 h-4 text-primary mr-2" />
        <span class="text-xs font-bold text-primary tracking-widest uppercase"
          >world class leadership</span
        >
      </div>
      <h2 class="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
        {title}
      </h2>
      <p
        class="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed"
      >
        Guided by industry veterans and visionary leaders committed to
        transforming the African business landscape through governance and
        digital strategy.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {#each leaders as leader, i}
        <div
          class="group relative animate-in fade-in slide-in-from-bottom-8 duration-700"
          style="animation-delay: {i * 100}ms"
        >
          <div
            class="absolute -inset-2 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>
          <Card.Root
            class="flex flex-col md:flex-row gap-8 items-center md:items-start p-8 border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:border-primary/30 transition-all h-full"
          >
            <div class="shrink-0">
              <div
                class="relative w-32 h-40 md:w-36 md:h-48 rounded-xl overflow-hidden border border-border shadow-lg group-hover:shadow-primary/20 transition-all duration-500"
              >
                <img
                  src={leader.image?.url ||
                    leader.imageUrl ||
                    "/team/placeholder.webp"}
                  alt={leader.name}
                  class="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100"
                />
              </div>
            </div>

            <div class="flex-1 text-center md:text-left space-y-4">
              <div>
                <h3
                  class="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors"
                >
                  {leader.name}
                </h3>
                <p
                  class="text-primary font-bold text-xs uppercase tracking-widest mt-1"
                >
                  {leader.role}
                </p>
              </div>

              <p
                class="text-sm text-muted-foreground leading-relaxed font-medium line-clamp-4"
              >
                {leader.bio}
              </p>

              <div
                class="flex items-center justify-center md:justify-start gap-3 pt-2"
              >
                {#if leader.linkedinUrl}
                  <Button
                    href={leader.linkedinUrl}
                    target="_blank"
                    variant="outline"
                    size="icon"
                    class="rounded-full bg-background/50 hover:bg-primary hover:text-white border-border/50 transition-all"
                  >
                    <Linkedin class="w-4 h-4" />
                  </Button>
                {/if}
              </div>
            </div>
          </Card.Root>
        </div>
      {/each}
    </div>
  </div>
</section>
