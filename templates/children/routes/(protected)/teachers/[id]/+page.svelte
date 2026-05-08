<script lang="ts">
  import TeacherForm from "../components/TeacherForm.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const teacher = data.teacher;
</script>

<div class="py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold">Edit Teacher</h1>
    <p class="text-muted-foreground">Update teacher information</p>
  </div>

  <TeacherForm {teacher} />
</div>
