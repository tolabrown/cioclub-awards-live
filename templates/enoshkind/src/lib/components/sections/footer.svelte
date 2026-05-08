<script lang="ts">
	import { Constants } from '$lib/constants';
	import { Mail, Phone, MapPin, Heart } from '@lucide/svelte';
	import BrandLink from '$lib/components/widgets/BrandLink.svelte';
</script>

<footer class="bg-muted/50 border-t">
	<div class="container mx-auto px-4 py-16">
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
			<!-- Brand -->
			<BrandLink />

			<!-- Features -->
			<div>
				<h3 class="font-semibold mb-4">Features</h3>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li>
						<a href="/dashboard" class="hover:text-foreground transition-colors">Health Dashboard</a
						>
					</li>
					<li>
						<a href="/features" class="hover:text-foreground transition-colors"
							>AI Health Assistant</a
						>
					</li>
					<li>
						<a href="/community" class="hover:text-foreground transition-colors"
							>Community Support</a
						>
					</li>
					<li>
						<a href="/providers" class="hover:text-foreground transition-colors">Local Healthcare</a
						>
					</li>
				</ul>
			</div>

			<!-- Company -->
			<div>
				<h3 class="font-semibold mb-4">Company</h3>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li><a href="/about" class="hover:text-foreground transition-colors">About Us</a></li>
					<li>
						<a href="/privacy" class="hover:text-foreground transition-colors">Privacy Policy</a>
					</li>
					<li>
						<a href="/terms" class="hover:text-foreground transition-colors">Terms of Service</a>
					</li>
					<li><a href="/contact" class="hover:text-foreground transition-colors">Contact</a></li>
				</ul>
			</div>

			<!-- Contact -->
			<div>
				<h3 class="font-semibold mb-4">Get in Touch</h3>
				<div class="space-y-3 text-sm text-muted-foreground">
					<div class="flex items-center space-x-2 group">
						<Mail class="w-4 h-4 text-primary" />
						<a
							href="mailto:{Constants.SUPPORTEMAIL}"
							class="hover:text-primary transition-all font-medium"
						>
							{Constants.SUPPORTEMAIL}
						</a>
					</div>
					<div class="flex items-center space-x-2 group">
						<Phone class="w-4 h-4 text-primary" />
						<a href="tel:+2347035278240" class="hover:text-primary transition-all font-medium">
							+234 703 527 8240
						</a>
					</div>
					<div class="flex items-center space-x-2">
						<MapPin class="w-4 h-4" />
						<span>Lagos, Nigeria</span>
					</div>
				</div>
			</div>
		</div>

		<div class="border-t mt-12 pt-8 text-center">
			<p class="text-muted-foreground text-sm">
				© {new Date().getFullYear()} EnoshKind Health. Made with ❤️ for Nigeria.
			</p>
		</div>
	</div>
</footer>
