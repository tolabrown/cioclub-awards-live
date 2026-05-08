<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { Role } from "$lib/constants/index";
  import type { User } from "$lib/auth";
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Shield from "@lucide/svelte/icons/shield";

  const user = page.data.user as User;

  let {
    items,
    label = "Platform",
    collapsible = false,
  }: {
    items: {
      title: string;
      url: string;
      roles?: Role[];
      icon?: any;
      isActive?: boolean;
      items?: { title: string; url: string }[];
    }[];
    label?: string;
    collapsible?: boolean;
  } = $props();
</script>

<Sidebar.Group>
  {#if !collapsible}
    <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
    <Sidebar.Menu class="flex flex-col gap-1">
      {#each items as item (item.title)}
        {#if !item.roles || item.roles.includes(user.role as Role)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              onclick={() => {
                window.location.href = item.url;
              }}
              tooltipContent={item.title}
              isActive={item.isActive}
              class={cn(
                buttonVariants({
                  variant: item.isActive ? "outline" : "ghost",
                }),
                "justify-start cursor-pointer hover:text-current",
              )}
            >
              {#if item.icon}
                <item.icon />
              {/if}
              <span>{item.title}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/if}
      {/each}
    </Sidebar.Menu>
  {:else}
    <Sidebar.Menu>
      <Collapsible.Root open={true} class="group/collapsible">
        <Sidebar.MenuItem>
          <Collapsible.Trigger class={buttonVariants({ variant: "ghost" })}>
            {#snippet child({ props })}
              <Sidebar.MenuButton {...props} tooltipContent={label}>
                {#if label === "Admin"}
                  <Shield />
                {/if}
                <span>{label}</span>
                <ChevronRight
                  class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </Sidebar.MenuButton>
            {/snippet}
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Sidebar.MenuSub>
              {#each items as item (item.title)}
                <Sidebar.MenuSubItem>
                  <Sidebar.MenuSubButton
                    href={item.url}
                    isActive={item.isActive}
                  >
                    {#if item.icon}
                      <item.icon class="size-4" />
                    {/if}
                    <span>{item.title}</span>
                  </Sidebar.MenuSubButton>
                </Sidebar.MenuSubItem>
              {/each}
            </Sidebar.MenuSub>
          </Collapsible.Content>
        </Sidebar.MenuItem>
      </Collapsible.Root>
    </Sidebar.Menu>
  {/if}
</Sidebar.Group>
