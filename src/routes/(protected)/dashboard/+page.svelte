<script lang="ts">
  import { page } from "$app/state";
  import { Role } from "$lib/constants";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import AdminDashboard from "$lib/components/dashboards/AdminDashboard.svelte";
  import EditorDashboard from "$lib/components/dashboards/EditorDashboard.svelte";
  import UserDashboard from "$lib/components/dashboards/UserDashboard.svelte";
  import MemberFreeDashboard from "$lib/components/dashboards/MemberFreeDashboard.svelte";
  import MemberIndividualDashboard from "$lib/components/dashboards/MemberIndividualDashboard.svelte";
  import MemberCorporateDashboard from "$lib/components/dashboards/MemberCorporateDashboard.svelte";
  import ExecutiveDashboard from "$lib/components/dashboards/ExecutiveDashboard.svelte";
  import SponsorDashboard from "$lib/components/dashboards/SponsorDashboard.svelte";
  import PartnerDashboard from "$lib/components/dashboards/PartnerDashboard.svelte";

  // Get user and data from page
  const user = $derived(page.data.user);
  const userRole = $derived(user?.role || "user");
  const data = $derived(page.data);
</script>

<svelte:head>
  <title>Dashboard | CIO Club Africa</title>
</svelte:head>

<div class="min-h-screen pb-20">
  <ScrollArea class="h-full">
    <main class="mx-auto py-8">
      {#if userRole === Role.ADMIN}
        <AdminDashboard
          stats={data.stats}
          adminData={data.adminData}
          upcomingEvents={data.upcomingEvents}
          recentNews={data.recentNews}
        />
      {:else if userRole === Role.EDITOR}
        <EditorDashboard
          stats={data.stats}
          editorData={data.editorData}
          recentNews={data.recentNews}
        />
      {:else if userRole === Role.MEMBER_FREE}
        <MemberFreeDashboard
          stats={data.stats}
          upcomingEvents={data.upcomingEvents}
          recentNews={data.recentNews}
        />
      {:else if userRole === Role.MEMBER_INDIVIDUAL}
        <MemberIndividualDashboard
          stats={data.stats}
          upcomingEvents={data.upcomingEvents}
          recentNews={data.recentNews}
        />
      {:else if userRole === Role.MEMBER_CORPORATE}
        <MemberCorporateDashboard
          stats={data.stats}
          upcomingEvents={data.upcomingEvents}
          recentNews={data.recentNews}
        />
      {:else if userRole === Role.EXECUTIVE}
        <ExecutiveDashboard
          stats={data.stats}
          upcomingEvents={data.upcomingEvents}
          recentNews={data.recentNews}
        />
      {:else if userRole === Role.SPONSOR}
        <SponsorDashboard
          stats={data.stats}
          sponsorData={data.sponsorData}
          upcomingEvents={data.upcomingEvents}
        />
      {:else if userRole === Role.PARTNER}
        <PartnerDashboard
          stats={data.stats}
          upcomingEvents={data.upcomingEvents}
          recentNews={data.recentNews}
        />
      {:else}
        <UserDashboard
          stats={data.stats}
          upcomingEvents={data.upcomingEvents}
          recentNews={data.recentNews}
        />
      {/if}
    </main>
  </ScrollArea>
</div>
