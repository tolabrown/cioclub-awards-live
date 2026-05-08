<script lang="ts">
	import { FileText, Gavel, Handshake, AlertTriangle, Scale } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Terms of Service | EnoshKind</title>
</svelte:head>

<div class="bg-muted/30 min-h-screen py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto bg-card rounded-lg border shadow-sm p-4">
			<div class="flex items-center gap-4 mb-8">
				<div class="p-3 rounded-2xl bg-primary/10 text-primary">
					<FileText class="w-8 h-8" />
				</div>
				<div>
					<h1 class="text-3xl md:text-5xl font-bold tracking-tight">Terms of Service</h1>
					<p class="text-muted-foreground mt-2">Effective Date: January 1, 2024</p>
				</div>
			</div>

			<div class="prose prose-slate dark:prose-invert max-w-none">
				<p class="lead text-xl text-muted-foreground mb-12">
					Welcome to EnoshKind. By using our platform, you agree to comply with and be bound by the
					following terms and conditions.
				</p>

				<section class="mb-12">
					<h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
						<Handshake class="text-primary w-6 h-6" />
						1. Acceptance of Terms
					</h2>
					<p class="text-muted-foreground leading-relaxed">
						By accessing or using the EnoshKind website or mobile application, you acknowledge that
						you have read, understood, and agree to be bound by these Terms of Service and our
						Privacy Policy.
					</p>
				</section>

				<section class="mb-12">
					<h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
						<AlertTriangle class="text-primary w-6 h-6" />
						2. Medical Disclaimer
					</h2>
					<div
						class="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-6 rounded-r-xl"
					>
						<p class="text-amber-800 dark:text-amber-200 font-medium mb-0">
							<strong>IMPORTANT:</strong> EnoshKind provides health information and tools for informational
							purposes. Our AI assistant and tracking tools do not constitute professional medical advice,
							diagnosis, or treatment. Always seek the advice of your physician or other qualified health
							provider with any questions you may have regarding a medical condition.
						</p>
					</div>
				</section>

				<section class="mb-12">
					<h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
						<Scale class="text-primary w-6 h-6" />
						3. User Responsibilities
					</h2>
					<p class="mb-4">You agree to use the platform responsibly and:</p>
					<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
						<li>Provide accurate and complete information about your health.</li>
						<li>Maintain the confidentiality of your account credentials.</li>
						<li>Refrain from using the platform for any illegal or unauthorized purposes.</li>
						<li>Not attempt to interfere with the proper working of the platform.</li>
					</ul>
				</section>

				<section class="mb-12">
					<h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
						<Gavel class="text-primary w-6 h-6" />
						4. Limitation of Liability
					</h2>
					<p class="text-muted-foreground leading-relaxed">
						EnoshKind and its affiliates shall not be liable for any indirect, incidental, special,
						consequential, or punitive damages resulting from your use of or inability to use the
						service.
					</p>
				</section>

				<div class="mt-16 pt-8 border-t text-sm text-muted-foreground">
					<p>
						For full legal details or disputes, please contact our legal department at <a
							href="mailto:legal@chanieldigitalhealth.com"
							class="text-primary hover:underline">legal@chanieldigitalhealth.com</a
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
