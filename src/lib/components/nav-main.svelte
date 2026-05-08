<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { Role } from "$lib/constants";
  import type { User } from "$lib/auth";
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import { buttonVariants } from "$lib/components/ui/button";

  const user = page.data.user as User;

  let {
    platformItems,
    adminItems,
  }: {
    platformItems: {
      title: string;
      url: string;
      roles: Role[];
      icon?: any;
      isActive?: boolean;
    }[];
    adminItems: {
      title: string;
      url: string;
      roles: Role[];
      icon?: any;
      isActive?: boolean;
    }[];
  } = $props();

  const visibleAdminItems = $derived(adminItems.filter(item => item.roles.includes(user.role as Role)));
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
  <Sidebar.Menu class="flex flex-col gap-1">
    {#each platformItems as item (item.title)}
      {@const Icon = item.icon}
      {#if item.roles.includes(user.role as Role)}
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
              {#if Icon}
                <Icon />
              {/if}
              <span>{item.title}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </a>
      {/if}
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>

{#if visibleAdminItems.length > 0}
  <Sidebar.Group>
    <Sidebar.GroupLabel>Admin Panel</Sidebar.GroupLabel>
    <Sidebar.Menu class="flex flex-col gap-1">
      {#each visibleAdminItems as item (item.title)}
        {@const Icon = item.icon}
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
              {#if Icon}
                <Icon />
              {/if}
              <span>{item.title}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </a>
      {/each}
    </Sidebar.Menu>
  </Sidebar.Group>
{/if}
