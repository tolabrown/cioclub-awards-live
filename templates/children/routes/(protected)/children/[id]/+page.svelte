<script lang="ts">
  import type { iChild } from "$lib/interface";
  import type { PageServerData } from "./$types";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import { AlertCircleIcon } from "@lucide/svelte";
  import ChildForm from "../components/ChildForm.svelte";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Separator } from "$lib/components/ui/separator";

  interface Props {
    data: PageServerData;
  }

  let { data }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-4">
  {#await data.promise}
    <div class="grid grid-cols-1 gap-2">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-10 w-full" />
    </div>
  {:then result}
    {@const child = result as iChild}
    <div class="flex flex-col justify-between">
      <h1 class="text-2xl font-bold sm:text-3xl">
        {child ? "Edit Child" : "Add New Child"}
      </h1>
      <p class="mt-2 text-muted-foreground">
        Fill the form below to manage child information
      </p>
    </div>
    <Separator />
    <ChildForm {child} />
  {:catch error}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>
        {error.name}</Alert.Title
      >
      <Alert.Description>
        {error.message}
      </Alert.Description>
    </Alert.Root>
  {/await}
</div>
