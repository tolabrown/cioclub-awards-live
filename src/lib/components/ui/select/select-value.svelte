<script lang="ts">
  import { cn } from "$lib/utils.js";

  let {
    class: className,
    placeholder = "Select an option",
    value,
    options = [],
    ...restProps
  }: {
    class?: string;
    placeholder?: string;
    value?: string;
    options?: { value: string; label: string }[];
    [key: string]: any;
  } = $props();

  const label = $derived(
    options.find((o) => o.value === value)?.label ?? placeholder,
  );
</script>

<span
  data-slot="select-value"
  class={cn("inline-block truncate", className)}
  {...restProps}
>
  {label}
</span>
