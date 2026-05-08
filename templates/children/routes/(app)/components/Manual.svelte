<script lang="ts">
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import {
    ArrowRight,
    CheckCircle2,
    Calendar,
    Heart,
    Sparkles,
    Users,
    Music,
    BookOpen,
  } from "@lucide/svelte";
</script>

<section class="py-16 bg-muted/30">
  <div class="mx-auto max-w-[1440px] padded">
    <!-- Header -->
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
        Getting Started is Simple
      </h2>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Join our children's ministry in just a few simple steps. We make it easy
        for your family to get connected.
      </p>
    </div>

    <!-- Cards Grid -->
    <div class="grid md:grid-cols-2 gap-8 mb-12">
      <!-- Why Kids Love Us Card -->
      <Card
        class="border-2 hover:border-primary/50 transition-all duration-500 overflow-hidden relative group"
      >
        <!-- Decorative gradient background -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        ></div>

        <!-- Floating decorative elements -->
        <div
          class="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity"
        >
          <Sparkles class="h-8 w-8 text-pink-500 floating-icon" />
        </div>
        <div
          class="absolute bottom-20 right-8 opacity-15 group-hover:opacity-30 transition-opacity"
        >
          <Heart class="h-6 w-6 text-rose-400 floating-icon-delayed" />
        </div>

        <CardHeader class="px-4 relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-opacity"
              ></div>
              <div
                class="relative p-3 bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300"
              >
                <Heart class="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle class="text-2xl shimmer-text">Why Kids Love Us</CardTitle
            >
          </div>
          <CardDescription class="text-base">
            A nurturing environment where faith and growth come together
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4 px-4 relative z-10">
          <div
            class="feature-item flex gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-default"
          >
            <div class="flex-shrink-0 mt-1">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg floating-icon"
              >
                <Users class="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-1 text-amber-600 dark:text-amber-400">
                Amazing Friends
              </h4>
              <p class="text-sm text-muted-foreground">
                Build lasting friendships with kids who share the same faith
                journey
              </p>
            </div>
          </div>

          <div
            class="feature-item flex gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-default"
          >
            <div class="flex-shrink-0 mt-1">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg floating-icon-delayed"
              >
                <Music class="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h4
                class="font-semibold mb-1 text-emerald-600 dark:text-emerald-400"
              >
                Exciting Worship
              </h4>
              <p class="text-sm text-muted-foreground">
                High-energy praise sessions with dancing, singing, and
                celebration
              </p>
            </div>
          </div>

          <div
            class="feature-item flex gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-default"
          >
            <div class="flex-shrink-0 mt-1">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg floating-icon-delayed-2"
              >
                <BookOpen class="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-1 text-blue-600 dark:text-blue-400">
                Interactive Bible Stories
              </h4>
              <p class="text-sm text-muted-foreground">
                Interactive storytelling that brings God's word to life in
                exciting ways
              </p>
            </div>
          </div>

          <div
            class="feature-item flex gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-default"
          >
            <div class="flex-shrink-0 mt-1">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg"
              >
                <Sparkles class="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-1 text-pink-600 dark:text-pink-400">
                Creative Activities
              </h4>
              <p class="text-sm text-muted-foreground">
                Arts, crafts, games, and adventures that spark imagination
              </p>
            </div>
          </div>

          <div
            class="pt-4 border-t border-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-900 dark:to-purple-900"
          >
            <div
              class="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30"
            >
              <span class="text-2xl">✨</span>
              <p class="text-sm font-medium text-foreground">
                <span class="text-primary font-bold">Every child matters!</span>
                Our dedicated teachers ensure each kid feels loved and valued.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- What to Expect Card -->
      <Card class="border-2 hover:border-primary/50 transition-colors">
        <CardHeader class="px-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg blur-md opacity-50"
              ></div>
              <div
                class="relative p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg shadow-lg"
              >
                <Calendar class="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle class="text-2xl">What to Expect</CardTitle>
          </div>
          <CardDescription class="text-base">
            A typical Sunday experience for your child in our ministry
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4 px-4">
          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-1">
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                1
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-1">Warm Welcome</h4>
              <p class="text-sm text-muted-foreground">
                Our friendly team greets each child with love and enthusiasm
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-1">
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                2
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-1">Worship & Praise</h4>
              <p class="text-sm text-muted-foreground">
                Age-appropriate worship songs and interactive praise time
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-1">
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                3
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-1">Bible Lesson</h4>
              <p class="text-sm text-muted-foreground">
                Engaging stories and lessons that make God's Word come alive
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-1">
              <CheckCircle2 class="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 class="font-semibold mb-1 text-green-600">Activities</h4>
              <p class="text-sm text-muted-foreground">
                Games, crafts, and fellowship that reinforce the day's lesson
              </p>
            </div>
          </div>

          <div class="pt-4 border-t">
            <div class="flex items-start gap-2 text-sm text-muted-foreground">
              <span class="text-primary">⏰</span>
              <p>
                <strong>Service Time:</strong> Every Mondays at 5:00 PM. Children
                are grouped by age for optimal learning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Tips Section -->
    <Card
      class="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2 border-yellow-200/50 dark:border-yellow-800/50"
    >
      <CardHeader class="px-4">
        <CardTitle class="text-xl flex items-center gap-2">
          <span>📚</span>
          Quick Tips for Parents
        </CardTitle>
      </CardHeader>
      <CardContent class="px-4">
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="flex gap-3">
            <ArrowRight class="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h5 class="font-semibold mb-1">Arrive Early</h5>
              <p class="text-sm text-muted-foreground">
                Give your child time to settle in and connect with friends
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <ArrowRight class="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h5 class="font-semibold mb-1">Label Belongings</h5>
              <p class="text-sm text-muted-foreground">
                Mark water bottles, bags, and jackets with your child's name
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <ArrowRight class="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h5 class="font-semibold mb-1">Need Help?</h5>
              <p class="text-sm text-muted-foreground">
                Contact our children's ministry team for any questions
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</section>
