<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
  } from "$lib/components/ui/tabs";
  import {
    Save,
    ArrowLeft,
    Info,
    FileJson,
    FileText,
    Loader2,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import JSONForm from "$lib/components/widgets/JSONForm.svelte";

  let { data, form } = $props();

  let submitting = $state(false);
  let jsonError = $state("");
  let beautifiedData = $state("");
  let structuredData = $state<any>(null);
  let activeTab = $state("visual");

  $effect(() => {
    try {
      const parsed = JSON.parse(data.pageContent.data);
      structuredData = parsed;
      beautifiedData = JSON.stringify(parsed, null, 2);
      jsonError = "";
    } catch (e) {
      beautifiedData = data.pageContent.data;
      structuredData = null;
      jsonError = "Invalid JSON structure in database";
    }
  });

  // Keep beautifiedData (JSON) in sync with structuredData changes in Visual tab
  $effect(() => {
    if (activeTab === "visual" && structuredData) {
      beautifiedData = JSON.stringify(structuredData, null, 2);
    }
  });

  // Keep structuredData in sync with beautifiedData changes in JSON tab
  function handleJsonChange(e: Event) {
    const value = (e.target as HTMLTextAreaElement).value;
    beautifiedData = value;
    try {
      structuredData = JSON.parse(value);
      jsonError = "";
    } catch (err: any) {
      jsonError = err.message;
    }
  }

  $effect(() => {
    if (form?.success) {
      toast.success("Content saved successfully");
      submitting = false;
    } else if (form?.message) {
      toast.error(form.message);
      submitting = false;
    }
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button variant="outline" size="icon" href="/admin/pages">
        <ArrowLeft class="size-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Edit Page: {data.path}
        </h1>
        <p class="text-muted-foreground">
          Modify the structure and meta-data for this page.
        </p>
      </div>
    </div>
  </div>

  <form
    method="POST"
    action="?/update"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
  >
    <input type="hidden" name="path" value={data.path} />

    <div class="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>SEO & Meta Data</CardTitle>
          <CardDescription
            >Control how this page appears in search results and browser tabs.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="title">Page Title</Label>
            <Input
              id="title"
              name="title"
              value={data.pageContent.title}
              placeholder="e.g., Awards - CIO Club Africa"
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Meta Description</Label>
            <Textarea
              id="description"
              name="description"
              value={data.pageContent.description}
              placeholder="Enter a brief summary for SEO..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            Page Content
            {#if jsonError}
              <Badge variant="destructive" class="text-[10px]"
                >{jsonError}</Badge
              >
            {/if}
          </CardTitle>
          <CardDescription>
            Edit the structured content for this page using the visual editor or
            raw JSON.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Tabs bind:value={activeTab} class="w-full">
            <TabsList class="w-full">
              <TabsTrigger value="visual" class="flex-1 gap-2">
                <FileText class="size-4" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value="json" class="flex-1 gap-2">
                <FileJson class="size-4" />
                JSON Editor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visual" class="mt-4">
              <JSONForm bind:data={structuredData} />
            </TabsContent>
            <TabsContent value="json" class="mt-4">
              <Textarea
                id="data"
                name="data"
                bind:value={beautifiedData}
                oninput={handleJsonChange}
                class="font-mono text-sm h-[500px] resize-y"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter class="flex justify-between border-t p-4">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Info class="size-4" />
            <span
              >Ensure the JSON structure matches what the frontend expects.</span
            >
          </div>
          <Button
            type="submit"
            disabled={!!jsonError || submitting}
            class="gap-2 min-w-[140px]"
          >
            {#if submitting}
              <Loader2 class="size-4 animate-spin" /> Saving...
            {:else}
              <Save class="size-4" /> Save Changes
            {/if}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </form>
</div>
