<script lang="ts">
  import { cn } from "$lib/utils";
  import { Quote, X } from "@lucide/svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { Button } from "$lib/components/ui/button";
  import { ScrollArea } from "$lib/components/ui/scroll-area";

  interface Testimonial {
    id: string;
    name: string;
    organization?: string;
    country?: string;
    testimonial: string;
    image?: {
      url: string;
      directUrl?: string;
    };
  }

  interface Props {
    testimonials: Testimonial[];
  }

  let { testimonials = [] }: Props = $props();

  const isMobile = new IsMobile();
  let selectedTestimonial = $state<Testimonial | null>(null);
  let open = $state(false);

  function handleCardClick(t: Testimonial) {
    selectedTestimonial = t;
    open = true;
  }
</script>

{#if testimonials && testimonials.length > 0}
  <section class="py-24 bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>
    <div class="absolute -top-24 -right-24 size-96 bg-primary/5 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-24 -left-24 size-96 bg-primary/5 rounded-full blur-3xl"></div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="text-center space-y-4 mb-20 max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
          <Quote class="size-3" />
          Member Voices
        </div>
        <h2 class="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
          What Our <span class="text-primary italic">Community</span> Says
        </h2>
        <p class="text-muted-foreground text-lg font-medium leading-relaxed">
          Hear from the leaders and visionaries who are part of Africa's premier technology leadership collective.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each testimonials as t}
          <button
            class="text-left w-full h-full block group outline-hidden"
            onclick={() => handleCardClick(t)}
          >
            <Card.Root
              class="h-full border-border/40 bg-card/60 backdrop-blur-md hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-3xl p-4 md:p-6 relative flex flex-col overflow-hidden shadow-sm"
            >
              <!-- Quote Icon Background -->
              <div
                class="absolute top-6 right-8 text-primary/5 group-hover:text-primary/10 transition-colors"
              >
                <Quote class="size-24 rotate-12" />
              </div>

              <div class="flex-1 space-y-6 relative z-10">
                <div class="text-primary text-left">
                  <Quote
                    class="size-8 opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>

                <div
                  class="prose prose-sm dark:prose-invert max-w-none italic text-muted-foreground font-medium leading-relaxed line-clamp-6"
                >
                  {@html t.testimonial}
                </div>
              </div>

              <div
                class="flex items-center gap-4 pt-8 mt-auto border-t border-border/20 relative z-10"
              >
                <div
                  class="size-14 rounded-2xl overflow-hidden border-2 border-background shadow-md shrink-0 ring-4 ring-primary/5"
                >
                  {#if t.image}
                    <img
                      src={t.image.directUrl || t.image.url}
                      alt={t.name}
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onerror={(e) => {
                        const img = e.currentTarget;
                        if (t.image?.directUrl && (img as any).src === t.image.directUrl) {
                          (img as any).src = t.image.url;
                        }
                      }}
                    />
                  {:else}
                    <div
                      class="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase"
                    >
                      {t.name.charAt(0)}
                    </div>
                  {/if}
                </div>
                <div class="space-y-1">
                  <h4
                    class="font-bold text-foreground group-hover:text-primary transition-colors"
                  >
                    {t.name}
                  </h4>
                  <div class="flex flex-col">
                    <p
                      class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                    >
                      {t.organization || "Private Member"}
                    </p>
                    {#if t.country}
                      <p class="text-[9px] font-bold text-primary/70 italic">
                        {t.country}
                      </p>
                    {/if}
                  </div>
                </div>
              </div>
            </Card.Root>
          </button>
        {/each}
      </div>
    </div>
  </section>
{/if}

{#if isMobile.current}
  <Drawer.Root bind:open>
    <Drawer.Content class="p-6 pb-12 outline-hidden">
      {#if selectedTestimonial}
        <Drawer.Header class="text-left px-0">
          <Drawer.Title class="text-2xl font-bold">Member Voice</Drawer.Title>
          <Drawer.Description class="text-sm font-medium">
            Reading {selectedTestimonial.name}'s experience
          </Drawer.Description>
        </Drawer.Header>
        
        <div class="py-6 space-y-6">
          <ScrollArea class="h-[40vh] pr-4">
            <div class="relative">
              <Quote class="size-12 text-primary opacity-20 absolute -top-4 -left-4 -z-10" />
              <div class="prose prose-sm dark:prose-invert max-w-none italic text-muted-foreground font-medium leading-relaxed text-lg">
                {@html selectedTestimonial.testimonial}
              </div>
            </div>
          </ScrollArea>

          <div class="flex items-center gap-4 pt-6 border-t">
            <div class="size-16 rounded-2xl overflow-hidden border-2 border-background shadow-md shrink-0 ring-4 ring-primary/5">
              {#if selectedTestimonial.image}
                <img 
                  src={selectedTestimonial.image.directUrl || selectedTestimonial.image.url} 
                  alt={selectedTestimonial.name} 
                  class="w-full h-full object-cover" 
                  onerror={(e) => {
                    const img = e.currentTarget;
                    if (selectedTestimonial?.image?.directUrl && (img as any).src === selectedTestimonial.image.directUrl) {
                      (img as any).src = selectedTestimonial.image.url;
                    }
                  }}
                />
              {:else}
                <div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase">
                  {selectedTestimonial.name.charAt(0)}
                </div>
              {/if}
            </div>
            <div class="space-y-1">
              <h4 class="font-bold text-xl text-foreground">{selectedTestimonial.name}</h4>
              <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {selectedTestimonial.organization || "Private Member"}
              </p>
              {#if selectedTestimonial.country}
                <p class="text-[10px] font-bold text-primary/70 italic">{selectedTestimonial.country}</p>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <Drawer.Footer class="px-0 pt-4">
        <Drawer.Close>
          <Button variant="outline" class="w-full h-12 rounded-xl font-bold">Dismiss View</Button>
        </Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{:else}
  <Dialog.Root bind:open>
    <Dialog.Content class="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none outline-hidden">
      {#if selectedTestimonial}
        <div class="bg-card border border-border/40 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
          <!-- Decorative Background -->
          <div class="absolute -top-20 -right-20 size-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-20 -left-20 size-64 bg-primary/5 rounded-full blur-3xl"></div>
          
          <div class="relative z-10 space-y-8">
            <div class="text-primary transition-all duration-300">
              <Quote class="size-12 opacity-50" />
            </div>

            <ScrollArea class="h-[400px] pr-4 bg-transparent border-none">
              <div class="prose prose-lg dark:prose-invert max-w-none italic text-muted-foreground font-medium leading-relaxed">
                {@html selectedTestimonial.testimonial}
              </div>
            </ScrollArea>

            <div class="flex items-center gap-6 pt-10 border-t border-border/20">
              <div class="size-20 rounded-3xl overflow-hidden border-4 border-background shadow-xl shrink-0 ring-8 ring-primary/5">
                {#if selectedTestimonial.image}
                  <img 
                    src={selectedTestimonial.image.directUrl || selectedTestimonial.image.url} 
                    alt={selectedTestimonial.name} 
                    class="w-full h-full object-cover" 
                    onerror={(e) => {
                      const img = e.currentTarget;
                      if (selectedTestimonial?.image?.directUrl && (img as any).src === selectedTestimonial.image.directUrl) {
                        (img as any).src = selectedTestimonial.image.url;
                      }
                    }}
                  />
                {:else}
                  <div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl uppercase">
                    {selectedTestimonial.name.charAt(0)}
                  </div>
                {/if}
              </div>
              <div class="space-y-2">
                <h4 class="text-2xl font-black text-foreground">{selectedTestimonial.name}</h4>
                <div class="flex flex-col gap-1">
                  <p class="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    {selectedTestimonial.organization || "Private Member"}
                  </p>
                  {#if selectedTestimonial.country}
                    <p class="text-xs font-bold text-muted-foreground/60 italic">{selectedTestimonial.country}</p>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
{/if}
