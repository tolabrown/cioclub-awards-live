<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		child: childProp,
		children,
		...restProps
	}: TooltipPrimitive.TriggerProps = $props();
</script>

<TooltipPrimitive.Trigger bind:ref data-slot="tooltip-trigger" {...restProps}>
	{#snippet child({ props })}
		{#if childProp}
			{@render childProp({ props })}
		{:else if children}
			<button {...props}>
				{@render children()}
			</button>
		{/if}
	{/snippet}
</TooltipPrimitive.Trigger>
