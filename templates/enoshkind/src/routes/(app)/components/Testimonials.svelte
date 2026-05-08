<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Star, Quote } from '@lucide/svelte';

	const testimonials = [
		{
			name: 'Chidi Okafor',
			role: 'Business Owner',
			location: 'Lagos',
			quote:
				"EnoshKind helped me understand my family's hypertension risk. The AI insights are incredibly accurate."
		},
		{
			name: 'Emeka Nwosu',
			role: 'IT Professional',
			location: 'Abuja',
			quote:
				'Finally, healthcare that respects our culture while using modern medicine. Life-changing.'
		},
		{
			name: 'Kemi Adebayo',
			role: 'Father of 3',
			location: 'Ibadan',
			quote:
				'The community aspect is amazing. Connecting with other Nigerian men has given me motivation.'
		}
	];
</script>

<section class="py-24 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="text-center mb-16 max-w-2xl mx-auto">
			<Badge variant="secondary" class="mb-4">Testimonials</Badge>
			<h2 class="font-bold mb-4">
				What Our Users <span class="text-primary">Say</span>
			</h2>
			<p class=" text-muted-foreground">
				Real stories from Nigerian men who've transformed their health.
			</p>
		</div>

		<div class="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
			{#each testimonials as testimonial}
				<Card class="border-border/50">
					<CardContent class="pt-6 space-y-4">
						<div class="flex gap-0.5">
							{#each [1, 2, 3, 4, 5] as _}
								<Star class="w-4 h-4 fill-amber-400 text-amber-400" />
							{/each}
						</div>

						<div class="relative">
							<Quote class="w-8 h-8 text-muted/20 absolute -top-2 -left-1" />
							<p class="text-muted-foreground leading-relaxed pl-6">
								"{testimonial.quote}"
							</p>
						</div>

						<div class="pt-4 border-t border-border/50">
							<p class="font-semibold">{testimonial.name}</p>
							<p class="text-muted-foreground">
								{testimonial.role} • {testimonial.location}
							</p>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>
