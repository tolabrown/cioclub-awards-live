<script lang="ts" module>
export interface iSelect {
  label: string;
  value: string
}
</script>
<script lang="ts">
 import * as Select from "$lib/components/ui/select/index.js";
	import { cn } from "$lib/utils";

 interface Props {
  options: iSelect[];
  value?: any;
  placeholder: string;
  name: string;
  class?: string;
  disabled?: boolean;
  id?: string;
  onValueChange?: (val: string) => void;
 }

 let { options = $bindable([]), value=$bindable(''), placeholder, class: className, name, disabled=false, id, onValueChange }: Props = $props();
 
 const triggerContent = $derived(
  options.find((f) => f.value === value)?.label ?? placeholder
 );
 
</script>
 
<Select.Root type="single" {name} bind:value {disabled} {onValueChange}>
 <Select.Trigger {id} class={cn("w-[180px] capitalize", className)} aria-label={name}>
  {triggerContent}
 </Select.Trigger>
 <Select.Content>
  <Select.Group>
   {#each options as option (option.value)}
    <Select.Item
     value={option.value}
     label={option.label}
     class="capitalize"
    >
     {option.label}
    </Select.Item>
   {/each}
  </Select.Group>
 </Select.Content>
</Select.Root>