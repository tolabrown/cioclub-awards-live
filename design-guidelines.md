UI COMPONENT STANDARDS - CRITICAL:
All UI components MUST follow these strict guidelines:

1. Button Standards:
   - ALWAYS use Button component from $lib/components/ui/button
   - NEVER add custom size, height, padding, or className overrides
   - Use default button size (do not use size="lg" or size="sm" unless specifically needed)
   - Respect variant prop only: default, destructive, outline, secondary, ghost, link
   - Example: <Button variant="outline">Save</Button> NOT <Button class="h-12 px-6">Save</Button>

2. All shadcn/ui Components:
   - Use components from $lib/components/ui/* without modifications
   - NEVER add custom classes that override default styles
   - NEVER add custom padding, margin, height, width to shadcn components
   - NEVER wrap shadcn components in divs with custom styling unless absolutely necessary
   - Use component props only (variant, size if available)
   - Examples of correct usage:
     - <Input type="email" placeholder="Email" />
     - <Select>...</Select>
     - <Checkbox />
     - <Card>...</Card>
   - Examples of INCORRECT usage:
     - <Button class="h-14 px-8 bg-blue-500">Submit</Button> ❌
     - <Input class="h-12 px-4" /> ❌
     - <div class="p-4"><Card class="shadow-lg">...</Card></div> ❌

3. Color & Theme Standards:
   - NEVER use custom text colors (text-blue-500, text-gray-700, etc.)
   - NEVER use custom background colors (bg-white, bg-gray-100, etc.)
   - ONLY use semantic colors from app.css theme system:
     - background, foreground
     - card, card-foreground
     - popover, popover-foreground
     - primary, primary-foreground
     - secondary, secondary-foreground
     - muted, muted-foreground
     - accent, accent-foreground
     - destructive, destructive-foreground
     - border, input, ring
   - Apply colors via Tailwind utility classes that reference CSS variables:
     - bg-background, bg-card, bg-primary, etc.
     - text-foreground, text-muted-foreground, text-primary-foreground, etc.
     - border-border, ring-ring, etc.

4. Font Weight Restrictions:
   - MAXIMUM font weight allowed: font-bold
   - NEVER use: font-extrabold, font-black, or custom font-weight values
   - Allowed weights only:
     - font-normal (400)
     - font-medium (500)
     - font-semibold (600)
     - font-bold (700) - MAXIMUM
   - For emphasis, use font-bold as the strongest weight
   - Examples:
     - ✅ <h1 class="text-3xl font-bold">Title</h1>
     - ❌ <h1 class="text-3xl font-extrabold">Title</h1>
     - ❌ <h1 class="text-3xl font-black">Title</h1>

5. Border Radius Restrictions:
   - MAXIMUM border radius allowed: rounded-xl
   - NEVER use: rounded-2xl, rounded-3xl, or custom border-radius values
   - Allowed border radius classes only:
     - rounded-none (0px)
     - rounded-sm (0.125rem)
     - rounded (0.25rem)
     - rounded-md (0.375rem)
     - rounded-lg (0.5rem)
     - rounded-xl (0.75rem) - MAXIMUM
   - For directional radius: rounded-t-lg, rounded-b-xl, etc. (still max xl)
   - Examples:
     - ✅ <Card class="rounded-lg">...</Card>
     - ✅ <div class="rounded-xl">...</div>
     - ❌ <Card class="rounded-2xl">...</Card>
     - ❌ <div class="rounded-3xl">...</div>

6. Shadow Restrictions:
   - MAXIMUM shadow allowed: shadow-lg
   - NEVER use: shadow-xl, shadow-2xl, or custom box-shadow values
   - Allowed shadow classes only:
     - shadow-none
     - shadow-sm
     - shadow (default)
     - shadow-md
     - shadow-lg - MAXIMUM
   - For colored shadows, maintain the same restriction: shadow-lg shadow-primary/20
   - Examples:
     - ✅ <Card class="shadow-md">...</Card>
     - ✅ <div class="shadow-lg">...</div>
     - ❌ <Card class="shadow-xl">...</Card>
     - ❌ <div class="shadow-2xl">...</div>
   
7. Gradient & Highlight Exceptions:
   - Gradients are ONLY allowed for:
     - Hero sections
     - Feature highlights
     - Special promotional banners
     - Loading states or effects
   - When using gradients, ensure they work in BOTH light and dark modes:
     - Use from-primary/20 to-primary/5 (opacity-based)
     - Test visibility in both themes before implementing
     - Avoid hardcoded color gradients like from-blue-500 to-purple-600
   - Highlights must be subtle and theme-aware:
     - Use bg-accent with text-accent-foreground
     - Use border-accent for emphasis
     - Use opacity modifiers: bg-primary/10 for subtle highlights
   
8. Visual Consistency:
   - All cards use: <Card>, <CardHeader>, <CardTitle>, <CardContent>
   - All forms use: <Label>, <Input>, <Select>, <Textarea> without modifications
   - All tables use consistent structure with <Table>, <TableHeader>, <TableBody>, <TableRow>, <TableCell>
   - All dialogs use: <Dialog>, <DialogContent>, <DialogHeader>, <DialogTitle>, <DialogDescription>
   
9. Spacing Standards:
   - Use Tailwind spacing scale: space-y-4, gap-4, p-6, etc.
   - NEVER add custom padding/margins to shadcn components
   - Container spacing: p-6 for cards, p-4 for smaller elements
   - Consistent gap between elements: gap-4 or space-y-4
   
10. Typography Standards:
    - Respect default text sizes from shadcn components
    - Use semantic heading sizes: text-3xl, text-2xl, text-xl, text-lg
    - NEVER override font colors except via theme variables
    - Body text should use text-foreground or text-muted-foreground
    - Maximum font weight is font-bold (no extrabold or black)

EXAMPLES OF WORLD-CLASS VISUAL ENHANCEMENTS (THEME-AWARE):

CORRECT Gradient Usage:

<!-- Hero section with theme-aware gradient, proper radius and shadow -->
<div class="relative rounded-xl shadow-lg bg-gradient-to-br from-primary/10 via-background to-primary/5">
  <div class="absolute inset-0 bg-grid-pattern opacity-5 rounded-xl"></div>
  <div class="relative p-8">
    <h1 class="text-4xl font-bold text-foreground">Welcome</h1>
    <p class="text-lg font-medium text-muted-foreground">Discover amazing products</p>
  </div>
</div>

CORRECT Highlight Usage:

<!-- Featured product with proper constraints -->
<Card class="rounded-lg shadow-md border-accent">
  <CardContent class="bg-accent/5">
    <h3 class="font-bold text-foreground">Featured Item</h3>
    <p class="font-normal text-muted-foreground">Special offer</p>
  </CardContent>
</Card>

CORRECT Button & Component Usage:

<!-- Proper button usage -->
<Button variant="default">Add to Cart</Button>
<Button variant="outline">View Details</Button>

<!-- Proper card with constraints -->
<Card class="rounded-lg shadow">
  <CardHeader>
    <CardTitle class="font-bold">Product Name</CardTitle>
  </CardHeader>
  <CardContent>
    <p class="font-normal text-muted-foreground">Description here</p>
  </CardContent>
</Card>

INCORRECT Usage Examples (DO NOT DO THIS):

<!-- ❌ Custom button styling -->
<Button class="h-14 px-8 bg-blue-600 text-white hover:bg-blue-700">Submit</Button>

<!-- ❌ Excessive font weight -->
<h1 class="text-4xl font-extrabold">Title</h1>
<h2 class="text-2xl font-black">Subtitle</h2>

<!-- ❌ Excessive border radius -->
<Card class="rounded-2xl shadow-xl">...</Card>
<div class="rounded-3xl">...</div>

<!-- ❌ Excessive shadow -->
<Card class="shadow-xl">...</Card>
<div class="shadow-2xl">...</div>

<!-- ❌ Custom text colors -->
<p class="text-gray-700 dark:text-gray-300">Description</p>

<!-- ❌ Custom background colors -->
<Card class="bg-white dark:bg-gray-800 shadow-xl">...</Card>

<!-- ❌ Overriding component defaults -->
<Input class="h-12 px-4 border-2 border-blue-500" />

DESIGN CONSTRAINTS SUMMARY:
- ✅ Max font weight: font-bold (700)
- ✅ Max border radius: rounded-xl (0.75rem)
- ✅ Max shadow: shadow-lg
- ✅ Only theme colors from app.css
- ✅ No modifications to shadcn components
- ✅ Default button sizes (no custom heights/padding)