<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    ArrowLeft,
    ArrowRight,
    Download,
    Calendar,
    User,
    FileText,
    Shield,
    CheckCircle2,
    Lock,
    Clock,
    Share2,
    Bookmark,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  // Mock data - in a real app this would come from a page loader
  const resource = {
    title: "State of Cloud Infrastructure 2024",
    description:
      "This comprehensive report explores the shifting landscape of global cloud services, focusing on hybrid-cloud adoption, security trends, and cost optimization strategies for enterprise IT leaders. We analyze data from over 2,500 CTOs globally to bring you the most accurate continental insights.",
    author: "Jane Doe, Lead Analyst",
    date: "October 2023",
    size: "4.2 MB (PDF)",
    category: "Market Trends",
    readTime: "45 min read",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCCqsVw0RFrtA-sxavqhcLbhfKNpuQDDx5Pwnpsoh0lcjg0MM6DrV8h2AWltLZrAIkQs3-pox3d88-WEx1MZJisEXUy74aRefhrumVYVltln4fA1dtmxQ_aeS6P4jry3FQU0PCteO9fv9N5KstHNQE8MrWZwKH0UiONybv4x3ZVlG0tna5jr2cS7n66f8Gy2ye9DOCw0iUz1ExKr_3oXugUDo5jEl-l10Od0sh-p3fp_mpr1GaHi1mgUOcIPJ23YHPQjbla-g_6SQ",
    insights: [
      "Hybrid cloud adoption has grown by 34% among Fortune 500 companies in the last 12 months.",
      "Security remains the #1 priority for IT leaders, with 68% of budget increases allocated to zero-trust architectures.",
      "AI-driven automation is reducing infrastructure management costs by an average of 18%.",
      "Multi-vendor strategies are becoming the norm to mitigate regional outage risks and lock-in.",
    ],
  };
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950">
  <!-- Nav / Back Button -->
  <div
    class="sticky top-20 z-30 bg-background/80 backdrop-blur-md border-b border-border py-4"
  >
    <div class="container mx-auto px-4">
      <a
        href="/resources"
        class="inline-flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest group"
      >
        <ArrowLeft
          class="size-4 group-hover:-translate-x-1 transition-transform"
        />
        Back to Library
      </a>
    </div>
  </div>

  <main class="py-20">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-12 gap-16">
        <!-- Left Column: Preview & Metadata -->
        <div class="lg:col-span-5 space-y-10">
          <div
            class="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-border bg-card"
          >
            <img
              src={resource.image}
              alt={resource.title}
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
            ></div>
            <div class="absolute bottom-10 left-10 right-10">
              <Badge
                class="bg-primary text-primary-foreground border-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
              >
                Full Report Preview
              </Badge>
              <h2 class="text-3xl font-bold text-white leading-tight">
                {resource.title}
              </h2>
            </div>
          </div>

          <Card
            class="rounded-xl border-border/50 bg-card shadow-lg overflow-hidden"
          >
            <CardHeader class="bg-muted/50 border-b border-border py-6 px-8">
              <CardTitle
                class="text-lg font-bold uppercase tracking-tight text-foreground"
                >Document Metadata</CardTitle
              >
            </CardHeader>
            <CardContent class="p-8 space-y-6">
              <div
                class="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <span
                  class="flex items-center gap-2 text-muted-foreground font-bold text-sm"
                >
                  <User class="size-4" /> Author
                </span>
                <span class="font-bold text-sm text-foreground"
                  >{resource.author}</span
                >
              </div>
              <div
                class="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <span
                  class="flex items-center gap-2 text-muted-foreground font-bold text-sm"
                >
                  <Calendar class="size-4" /> Published
                </span>
                <span class="font-bold text-sm text-foreground"
                  >{resource.date}</span
                >
              </div>
              <div
                class="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <span
                  class="flex items-center gap-2 text-muted-foreground font-bold text-sm"
                >
                  <FileText class="size-4" /> Format
                </span>
                <span class="font-bold text-sm text-foreground"
                  >{resource.size}</span
                >
              </div>
              <div
                class="flex justify-between items-center py-2 border-b border-border last:border-0"
              >
                <span
                  class="flex items-center gap-1 text-muted-foreground font-bold text-sm"
                >
                  Category
                </span>
                <Badge
                  variant="secondary"
                  class="rounded-lg text-xs font-bold uppercase tracking-widest"
                  >{resource.category}</Badge
                >
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Content & Insights -->
        <div class="lg:col-span-7 space-y-12">
          <div class="space-y-6">
            <div class="flex flex-wrap gap-4 items-center">
              <Badge
                class="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest"
              >
                2024 Market Insights
              </Badge>
              <div
                class="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest"
              >
                <Clock class="size-4" />
                {resource.readTime}
              </div>
            </div>
            <h1
              class="text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground"
            >
              {resource.title}
            </h1>
            <p
              class="text-xl text-muted-foreground leading-relaxed font-medium"
            >
              {resource.description}
            </p>
          </div>

          <div class="space-y-8">
            <h3
              class="text-2xl font-bold uppercase tracking-tight flex items-center gap-3 text-foreground"
            >
              <ArrowRight class="size-6 text-primary" />
              Key Strategic Takeaways
            </h3>
            <div class="grid gap-6">
              {#each resource.insights as insight}
                <div
                  class="flex gap-4 p-6 rounded-xl bg-card border border-border shadow-sm group hover:border-primary/50 transition-colors"
                >
                  <CheckCircle2
                    class="size-6 text-primary shrink-0 transition-transform group-hover:scale-110"
                  />
                  <p
                    class="text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-300"
                  >
                    {insight}
                  </p>
                </div>
              {/each}
            </div>
          </div>

          <div
            class="bg-primary text-primary-foreground rounded-xl p-10 lg:p-16 space-y-8 relative overflow-hidden shadow-lg border border-primary-foreground/5"
          >
            <div
              class="absolute inset-0 bg-[radial-gradient(#135bec22_1px,transparent_1px)] [background-size:24px_24px] opacity-20"
            ></div>
            <div class="relative z-10 space-y-6">
              <div
                class="flex items-center gap-3 text-primary-foreground font-bold uppercase tracking-widest text-sm"
              >
                <Lock class="size-5" />
                Enterprise Member Access
              </div>
              <div class="space-y-4">
                <h3
                  class="text-3xl font-bold text-primary-foreground leading-tight"
                >
                  Secure Your Copy
                </h3>
                <p class="text-primary-foreground/80 font-medium">
                  This detailed framework and data set are available exclusively
                  for Bronze, Silver, and Platinum institutional members.
                </p>
              </div>
              <div class="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  class="font-bold shadow-lg transition-all h-12"
                >
                  <Download class="size-5" />
                  Download Report (4.2MB)
                </Button>
                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    class="size-12 rounded-xl border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 transition-all"
                  >
                    <Bookmark class="size-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    class="size-12 rounded-xl border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 transition-all"
                  >
                    <Share2 class="size-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
