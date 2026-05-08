<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { ShoppingCart, Star, User } from "@lucide/svelte";


</script>

  <nav
    class="lg:hidden fixed bottom-0 left-0 right-0 shadow-2xl z-50 bg-[#282828] dark:bg-secondary"
  >
    <div class="grid grid-cols-5">
      <Button variant="outline" class="flex flex-col items-center gap-1 py-2 h-auto rounded-none border-none bg-transparent">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
          ><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg
        >
        <span class="text-xs font-bold">Home</span>
      </Button>
      <Button variant="outline"
        class="flex flex-col items-center gap-1 text-muted-foreground py-2 h-auto rounded-none border-none bg-transparent"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
          ><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg
        >
        <span class="text-xs">Deals</span>
      </Button>
      <Button variant="outline"
        class="flex flex-col items-center gap-1 text-muted-foreground py-2 h-auto rounded-none border-none bg-transparent"
      >
        <Star class="w-6 h-6" />
        <span class="text-xs">5-Star</span>
      </Button>
      <Button variant="outline"
        class="flex flex-col items-center gap-1 text-muted-foreground py-2 h-auto rounded-none border-none bg-transparent relative"
      >
        <ShoppingCart class="w-6 h-6" />
        <span
          class="absolute top-1 right-3 bg-orange-500 text-white text-[10px] size-4 rounded-full flex items-center justify-center font-bold"
          >5</span
        >
        <span class="text-xs">Cart</span>
      </Button>
      <Button variant="outline"
        class="flex flex-col items-center gap-1 text-muted-foreground py-2 h-auto rounded-none border-none bg-transparent"
      >
        <User class="w-6 h-6" />
        <span class="text-xs">You</span>
      </Button>
    </div>
  </nav>