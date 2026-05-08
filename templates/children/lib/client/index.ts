import type { iProduct } from "../interface";

export const discount = (product: iProduct) => {
  return product.originalPrice - product.price;
}