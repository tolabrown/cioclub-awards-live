<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "$lib/components/ui/tabs";
  import {
    Users,
    ChevronRight,
    Linkedin,
    Twitter,
    UserCircle,
    Quote,
  } from "@lucide/svelte";
  import * as Drawer from "$lib/components/ui/drawer";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";

  let { data } = $props();
  const content = $derived(data.content);

  let isProfileOpen = $state(false);
  let selectedMember = $state<any>(null);
  let activeSection = $state("");

  $effect(() => {
    if (!activeSection && content.sections?.length > 0) {
      activeSection = content.sections[0].id;
    }
  });

  const committeeOptions = $derived(
    content.sections.map((s: any) => ({
      label: s.title,
      value: s.id,
    })),
  );

  function openProfile(member: any) {
    selectedMember = member;
    isProfileOpen = true;
  }

  $effect(() => {
    console.log("image is",content.quote.image);
  });
</script>

<div class="min-h-screen">
  <!-- Hero Section -->
  <section
    class="relative py-32 bg-primary text-primary-foreground overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div
      class="container mx-auto px-4 relative z-10 text-center space-y-4 pt-20"
    >
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground text-xs font-bold uppercase tracking-widest"
      >
        <Users class="size-4" />
        {content.hero.badge}
      </div>
      <h1
        class="text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
      >
        {content.hero.title}
      </h1>
      <p
        class="text-xl text-primary-foreground/80 max-w-2xl mx-auto font-medium"
      >
        {content.hero.description}
      </p>
    </div>
  </section>

  <!-- Team Sections with Tabs -->
  <section class="py-32 bg-background relative -mt-16 z-20">
    <div class="container mx-auto px-4">
      {#if content.sections && content.sections.length > 0}
        <Tabs
          value={activeSection}
          onValueChange={(v) => (activeSection = v)}
          class="w-full space-y-8"
        >
          <div
            class="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
          >
            <!-- <div class="max-w-xl space-y-4">
              <h2
                class="text-3xl font-bold uppercase tracking-tight text-foreground"
              >
                Our Committees
              </h2>
              <div class="h-1.5 w-24 bg-primary rounded-full"></div>
              <p class="text-lg text-muted-foreground font-medium">
                Diverse leadership groups bringing specialized expertise to
                Africa's digital transformation.
              </p>
            </div> -->

            <div class="flex flex-col gap-2">
              <!-- <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1"
                >Select Committee</span
              > -->
              <SelectComponent
                options={committeeOptions}
                bind:value={activeSection}
                placeholder="Choose Committee"
                name="committee-selector"
                class="w-full sm:w-[300px] h-12 rounded-xl bg-muted border-border/50 font-bold uppercase tracking-widest text-[10px] shadow-sm hover:border-primary/30 transition-all"
              />
            </div>
          </div>

          {#each content.sections as section}
            <TabsContent value={section.id} class="space-y-4">
              <div class="max-w-2xl">
                <p
                  class="text-xl text-muted-foreground leading-relaxed font-medium italic"
                >
                  {section.description}
                </p>
              </div>

              {#if section.members && section.members.length > 0}
                <div
                  class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {#each section.members as member}
                    <div
                      class="group bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      <div
                        class="p-4 pb-0 flex flex-col items-center text-center"
                      >
                        <div
                          class="size-28 rounded-xl overflow-hidden bg-muted border-2 border-primary/10 group-hover:border-primary/30 transition-colors shadow-md"
                        >
                          {#if member.image}
                            <img
                              src={member.image}
                              alt={member.name}
                              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          {:else}
                            <div
                              class="w-full h-full flex items-center justify-center bg-primary/5"
                            >
                              <UserCircle
                                class="size-12 text-primary opacity-20"
                              />
                            </div>
                          {/if}
                        </div>

                        <div class="mt-6 space-y-1">
                          <h3 class="text-xl font-bold text-foreground">
                            {member.name}
                          </h3>
                        </div>
                      </div>

                      <div class="p-4 pt-6 flex-1 flex flex-col">
                        <p
                          class="text-muted-foreground text-sm line-clamp-4 font-medium leading-relaxed"
                        >
                          {member.bio}
                        </p>

                        <div
                          class="mt-auto pt-4 flex items-center justify-between"
                        >
                          <div class="flex gap-2">
                            {#if member.socials?.linkedin && member.socials.linkedin !== "#"}
                              <a
                                href={member.socials.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                              >
                                <Linkedin class="size-4" />
                              </a>
                            {/if}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            class="group/btn text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-primary/5 rounded-lg"
                            onclick={() => openProfile(member)}
                          >
                            Profile
                            <ChevronRight
                              class="size-3 group-hover/btn:translate-x-1 transition-transform"
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div
                  class="py-24 text-center border-2 border-dashed border-border rounded-xl bg-muted/20"
                >
                  <Users
                    class="size-12 text-muted-foreground mx-auto mb-4 opacity-20"
                  />
                  <p
                    class="text-muted-foreground font-medium uppercase tracking-widest text-xs"
                  >
                    Profiles coming soon
                  </p>
                </div>
              {/if}
            </TabsContent>
          {/each}
        </Tabs>
      {/if}
    </div>
  </section>

  <!-- Profile Drawer -->
  <Drawer.Root bind:open={isProfileOpen}>
    <Drawer.Content class="max-h-[96vh] rounded-t-xl">
      {#if selectedMember}
        <div class="mx-auto w-full max-w-2xl overflow-y-auto px-6 py-12">
          <Drawer.Header class="px-0 flex flex-col items-center text-center">
            <div
              class="size-32 rounded-xl overflow-hidden bg-muted border-2 border-primary/10 mb-6 shadow-lg"
            >
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                class="w-full h-full object-cover"
              />
            </div>
            <Drawer.Title
              class="text-3xl font-bold tracking-tight text-foreground"
            >
              {selectedMember.name}
            </Drawer.Title>
            <div class="mt-2">
              <Badge
                variant="secondary"
                class="font-bold text-xs uppercase tracking-widest px-3 py-1"
              >
                {selectedMember.role}
              </Badge>
            </div>
          </Drawer.Header>

          <div class="py-10 space-y-8">
            <div class="prose prose-slate dark:prose-invert max-w-none">
              <p
                class="text-lg text-muted-foreground leading-relaxed font-medium"
              >
                {selectedMember.bio}
              </p>
            </div>

            <div class="flex items-center justify-center gap-4 pt-6 border-t">
              {#if selectedMember.socials?.linkedin && selectedMember.socials.linkedin !== "#"}
                <Button
                  variant="outline"
                  class="gap-2 font-bold uppercase text-xs tracking-widest rounded-lg"
                  onclick={() =>
                    window.open(selectedMember.socials.linkedin, "_blank")}
                >
                  <Linkedin class="size-4" />
                  LinkedIn Profile
                </Button>
              {/if}
            </div>
          </div>

          <Drawer.Footer class="px-0 pt-6">
            <Drawer.Close>
              <Button
                variant="ghost"
                class="w-full font-bold uppercase text-xs tracking-widest rounded-lg h-12"
              >
                Close Profile
              </Button>
            </Drawer.Close>
          </Drawer.Footer>
        </div>
      {/if}
    </Drawer.Content>
  </Drawer.Root>

  <!-- Institutional Values -->
  <section class="py-32 bg-slate-50 dark:bg-slate-950/50">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-2 gap-20 items-center">
        <div class="space-y-4">
          <div class="space-y-4">
            <h2
              class="text-4xl font-bold uppercase tracking-tight text-foreground"
            >
              {content.values.title}
            </h2>
            <p class="text-xl text-muted-foreground font-medium">
              {content.values.subtitle}
            </p>
          </div>

          <div class="grid gap-4">
            {#each content.values.items as value}
              <div class="flex gap-6 items-start">
                <div
                  class="size-12 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center text-primary shrink-0"
                >
                  <UserCircle class="size-6" />
                </div>
                <div class="space-y-4">
                  <h4 class="text-xl font-bold text-foreground">
                    {value.title}
                  </h4>
                  <p class="text-muted-foreground font-medium">{value.desc}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="relative">
          <div
            class="absolute -inset-4 bg-primary/5 rounded-[4rem] blur-2xl"
          ></div>
          <div
            class="relative bg-primary rounded-xl p-4 lg:p-16 text-primary-foreground space-y-4 shadow-lg overflow-hidden"
          >
            <Quote
              class="size-16 text-primary-foreground opacity-10 absolute -top-4 -right-4"
            />
            <p
              class="text-2xl font-medium leading-relaxed italic z-10 relative"
            >
              "{content.quote.text}"
            </p>
            <div class="flex items-center gap-4 pt-4">
              <div
                class="size-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20"
              >
                <img
                  src={content.quote.image}
                  class="w-full h-full rounded-full object-cover"
                  alt={content.quote.author}
                />
              </div>
              <div>
                <p class="font-bold text-lg">{content.quote.author}</p>
                <p
                  class="text-xs font-bold uppercase tracking-widest text-primary-foreground/70"
                >
                  {content.quote.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Join Leadership CTA -->
  <!-- <section class="py-32 bg-background">
    <div class="container mx-auto px-4 text-center space-y-4">
      <h2
        class="text-4xl font-bold uppercase tracking-tight text-foreground max-w-2xl mx-auto"
      >
        Help Shape the Future of African Tech
      </h2>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
        Interested in board advisory roles or contributing to our executive
        committees?
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <Button
          class="font-bold uppercase text-sm tracking-widest shadow-lg transition-all"
        >
          Connect with Leadership
        </Button>
        <Button
          variant="outline"
          class="font-bold uppercase text-sm tracking-widest transition-all"
        >
          View Open Positions
        </Button>
      </div>
    </div>
  </section> -->
</div>
