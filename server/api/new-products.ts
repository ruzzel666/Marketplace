import { Product } from "~/models/products.models";

const getNewProducts = (products: Product[]) => {
  return products.filter((c) => c.label && c.label.toLowerCase() === "new").slice(0, 4);
};

export default defineEventHandler(async (event) => {
  const products: Product[] = await $fetch(
    "https://marketplace-afea8-default-rtdb.firebaseio.com/db.json",
  );

  return getNewProducts(products);
});

