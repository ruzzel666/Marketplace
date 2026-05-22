import { Product } from "~/models/products.models";

export interface Query {
  field: keyof Product;
  name: string;
}

const getFilteredProducts = (products: Product[], query: Partial<Query>) => {
  const { field, name } = query;
  if (field && name) {
    return products.filter((c) => {
      const val = c[field];
      if (typeof val === "string") {
        return val.toLowerCase() === name.toLowerCase();
      }
      return String(val) === name;
    });
  }
  return products;
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const field = query.field as keyof Product | undefined;
  const name = query.name as string | undefined;
  
  const products: Product[] = await $fetch(
    "https://marketplace-afea8-default-rtdb.firebaseio.com/db.json",
  );

  return getFilteredProducts(products, { field, name });
});

