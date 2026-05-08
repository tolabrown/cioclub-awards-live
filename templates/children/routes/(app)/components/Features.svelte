<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Book, Music, Users, Heart } from "@lucide/svelte";

  const features = [
    {
      icon: Book,
      title: "Bible Stories",
      description:
        "Engaging Bible lessons that bring God's Word to life for young hearts",
      gradient: "from-[#f71002] to-pink-500",
    },
    {
      icon: Music,
      title: "Worship & Praise",
      description:
        "Joyful worship sessions where children learn to praise God with all their hearts",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Users,
      title: "Fellowship",
      description:
        "Building lasting friendships in a loving Christian community",
      gradient: "from-[#fd6c02] to-yellow-500",
    },
    {
      icon: Heart,
      title: "Character Building",
      description:
        "Developing godly character and values through interactive activities",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];
</script>

<section
  class="bg-gradient-to-br from-muted via-muted/50 to-muted py-20 relative overflow-hidden"
>
  <!-- Decorative background -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
    <div
      class="absolute top-20 right-20 w-64 h-64 bg-[#f71002] rounded-full blur-3xl"
    ></div>
    <div
      class="absolute bottom-20 left-20 w-64 h-64 bg-cyan-500 rounded-full blur-3xl"
    ></div>
  </div>

  <div class="mx-auto max-w-[1440px] relative z-10 padded">
    <div class="mb-16 text-center">
      <Badge class="mb-4 bg-[#fd6c02] text-white border-0" variant="outline"
        >What We Do</Badge
      >
      <h2 class="mb-4 text-3xl font-bold md:text-4xl">
        Excellence in Children's Ministry
      </h2>
      <p class="mx-auto max-w-2xl text-muted-foreground">
        Our ministry provides a comprehensive learning experience designed to
        develop mature, effective disciples of Jesus Christ.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      {#each features as feature, i}
        {@const Icon = feature.icon}
        <Card
          class="hover:shadow-elevated transition-all duration-300 shadow-card border-2 hover:border-primary/20 group overflow-hidden relative"
        >
          <!-- Gradient background on hover -->
          <div
            class="absolute inset-0 bg-gradient-to-br {feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity"
          ></div>

          <CardHeader class="relative">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div
                  class="absolute inset-0 bg-gradient-to-br {feature.gradient} rounded-lg blur-md opacity-50"
                ></div>
                <div
                  class="relative rounded-lg bg-gradient-to-br {feature.gradient} p-3 shadow-lg group-hover:scale-110 transition-transform"
                >
                  <Icon class="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle class="group-hover:text-primary transition-colors"
                >{feature.title}</CardTitle
              >
            </div>
          </CardHeader>
          <CardContent class="relative">
            <p class="text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</section>
