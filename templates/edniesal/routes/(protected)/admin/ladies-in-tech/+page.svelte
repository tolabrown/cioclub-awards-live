<script lang="ts">
  import LadiesInTechEditor from "$lib/components/admin/LadiesInTechEditor.svelte";
  import { Heart, Users } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
</script>

<div class="space-y-6 pt-4">
  <div>
    <h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
      <Heart class="size-8 text-pink-500" />
      Ladies in Tech Management
    </h1>
    <p
      class="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1"
    >
      Schedule events, manage registrations, and track community engagement
    </p>
  </div>
  <div class="flex items-center gap-2">
    <Button
      variant="outline"
      href="/admin/ladies-in-tech/registrations"
      class="gap-2 font-bold shadow-sm rounded-xl border-pink-500/20 text-pink-600 hover:bg-pink-500/5"
    >
      <Users class="size-4" /> View Registrations
    </Button>
    <Button
      variant="outline"
      href="/admin/pages/edit/ladies-in-tech"
      class="gap-2 font-bold shadow-sm rounded-xl border-pink-500/20 text-pink-600 hover:bg-pink-500/5"
    >
      <Heart class="size-4" /> Edit Page & Brands
    </Button>
  </div>

  <LadiesInTechEditor />
</div>
