<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Globe, Lightbulb, Cross } from "@lucide/svelte";
</script>

<section class="py-20 relative overflow-hidden">
  <!-- Decorative background -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
    <div
      class="absolute top-1/4 left-10 w-48 h-48 bg-pink-500 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute bottom-1/4 right-10 w-48 h-48 bg-cyan-500 rounded-full blur-3xl"
    ></div>
  </div>

  <div class="mx-auto max-w-[1440px] relative z-10 padded">
    <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <div>
        <Badge class="mb-4 bg-pink-500 text-white border-0" variant="secondary"
          >Our Vision</Badge
        >
        <h2 class="mb-6 text-3xl font-bold md:text-4xl">
          Raising Total Kingdom Children
        </h2>
        <p class="mb-6 text-muted-foreground">
          The Remnant Christian Network Lagos Children Department exists to
          provide comprehensive biblical education that transforms hearts,
          renews minds, and equips children to be effective witnesses in their
          communities and beyond.
        </p>
        <div class="space-y-4">
          <div class="flex items-start space-x-3 group">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-br from-[#f71002] to-pink-500 rounded-lg blur-md opacity-50"
              ></div>
              <div
                class="relative bg-gradient-to-br from-[#f71002] to-pink-500 rounded-lg p-2 shadow-lg group-hover:scale-110 transition-transform"
              >
                <Cross class="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h4 class="mb-1 font-semibold">Heavenly Focused</h4>
              <p class="text-muted-foreground">
                Teaching children to fix their eyes on Jesus and eternal values
              </p>
            </div>
          </div>
          <div class="flex items-start space-x-3 group">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg blur-md opacity-50"
              ></div>
              <div
                class="relative bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg p-2 shadow-lg group-hover:scale-110 transition-transform"
              >
                <Globe class="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h4 class="mb-1 font-semibold">Earthly Relevant</h4>
              <p class="text-muted-foreground">
                Equipping children to make a difference in their world today
              </p>
            </div>
          </div>
          <div class="flex items-start space-x-3 group">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-br from-[#fd6c02] to-yellow-500 rounded-lg blur-md opacity-50"
              ></div>
              <div
                class="relative bg-gradient-to-br from-[#fd6c02] to-yellow-500 rounded-lg p-2 shadow-lg group-hover:scale-110 transition-transform"
              >
                <Lightbulb class="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h4 class="mb-1 font-semibold">Salt & Light</h4>
              <p class="text-muted-foreground">
                Empowering children to be transformative agents in their
                communities
              </p>
            </div>
          </div>
        </div>
      </div>
      <Card
        class="shadow-elevated bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-emerald-200/50 dark:border-emerald-800/50"
      >
        <CardHeader>
          <CardTitle class="text-base">Core Values</CardTitle>
          <CardDescription class="text-base"
            >The principles that guide our ministry approach</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div class="h-2 w-2 rounded-full bg-primary"></div>
              <span class="font-medium">Biblical Authority</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="h-2 w-2 rounded-full bg-primary"></div>
              <span class="font-medium">Christ-Centered Learning</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="h-2 w-2 rounded-full bg-primary"></div>
              <span class="font-medium">Community Fellowship</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="h-2 w-2 rounded-full bg-primary"></div>
              <span class="font-medium">Practical Application</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="h-2 w-2 rounded-full bg-primary"></div>
              <span class="font-medium">Spiritual Formation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</section>
