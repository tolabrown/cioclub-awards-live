<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import type { Role } from "$lib/constants";
  import type { User } from "$lib/auth";
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import { buttonVariants } from "$lib/components/ui/button";
  import { ChevronRight } from "@lucide/svelte";

  const user = page.data.user as User;

  let {
    items,
  }: {
    items: {
      title: string;
      url: string;
      roles: Role[];
      icon?: any;
      isActive?: boolean;
      items?: { title: string; url: string; isActive?: boolean }[];
    }[];
  } = $props();
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
  <Sidebar.Menu class="flex flex-col gap-1">
    {#each items as item (item.title)}
      {#if item.roles.includes(user.role as Role)}
        {#if item.items && item.items.length > 0}
          <!-- Collapsible group with sub-items -->
          <Collapsible.Root open={item.isActive} class="group/collapsible">
            <Sidebar.MenuItem>
              <Collapsible.Trigger class="w-full">
                {#snippet child({ props })}
                  <Sidebar.MenuButton
                    class={cn(
                      buttonVariants({
                        variant: item.isActive ? "outline" : "ghost",
                      }),
                      "justify-start cursor-pointer hover:text-current w-full",
                    )}
                  >
                    {#snippet child({ props: btnProps })}
                      <div {...props} {...btnProps}>
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight
                          class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                        />
                      </div>
                    {/snippet}
                  </Sidebar.MenuButton>
                {/snippet}
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Sidebar.MenuSub>
                  {#each item.items as subItem (subItem.title)}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton
                        href={subItem.url}
                        class={cn(
                          "cursor-pointer",
                          subItem.isActive && "text-primary font-bold",
                        )}
                      >
                        <span>{subItem.title}</span>
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  {/each}
                </Sidebar.MenuSub>
              </Collapsible.Content>
            </Sidebar.MenuItem>
          </Collapsible.Root>
        {:else}
          <!-- Direct link item -->
          <a class="cursor-pointer" href={item.url}>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                class={cn(
                  buttonVariants({
                    variant: item.isActive ? "outline" : "ghost",
                  }),
                  "justify-start cursor-pointer hover:text-current",
                )}
              >
                <item.icon />
                <span>{item.title}</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </a>
        {/if}
      {/if}
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
