<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import { cn } from "$lib/utils";
  import { Home } from "@lucide/svelte";
  import { buttonVariants } from "./ui/button";
  import BrandedLogo from "$lib/components/widgets/BrandedLogo.svelte";

  let { teams }: { teams: { name: string; logo: any; plan: string }[] } =
    $props();
  const sidebar = useSidebar();
  const activeTeam = $derived(teams[0]);
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <Sidebar.MenuButton
      size="lg"
      class="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      {#snippet child({ props })}
        <a href="/" {...props}>
          <div class={buttonVariants({ variant: "ghost", size: "icon" })}>
            <BrandedLogo class="size-8" />
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-medium">{activeTeam.name}</span>
            <span class="truncate text-xs">{activeTeam.plan}</span>
          </div>
          <Home class="ml-auto" />
        </a>
      {/snippet}
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
</Sidebar.Menu>
