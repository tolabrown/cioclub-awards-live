import ProductCard from "./ProductCard.svelte";
import ProductCardBox from "./ProductCardBox.svelte";
import ProductCardSkeleton from "./ProductCardSkeleton.svelte";
import ProductDetailsView from "./ProductDetailsView.svelte";
import ProductDetailsViewSkeleton from "./ProductDetailsViewSkeleton.svelte";
import ProductPageSkeleton from "./ProductPageSkeleton.svelte";
import FilterSidebar from "./FilterSidebar.svelte";
import FilterSidebarSkeleton from "./FilterSidebarSkeleton.svelte";

// Extend the component types with Skeleton property
const ProductCardWithSkeleton = Object.assign(ProductCard, {
  Skeleton: ProductCardSkeleton,
});

const ProductDetailsViewWithSkeleton = Object.assign(ProductDetailsView, {
  Skeleton: ProductDetailsViewSkeleton,
});

const ProductPage = {
  Skeleton: ProductPageSkeleton,
};

const FilterSidebarWithSkeleton = Object.assign(FilterSidebar, {
  Skeleton: FilterSidebarSkeleton,
});

export {
  ProductCardWithSkeleton as ProductCard,
  ProductCardBox,
  ProductDetailsViewWithSkeleton as ProductDetailsView,
  ProductPage,
  FilterSidebarWithSkeleton as FilterSidebar,
};
