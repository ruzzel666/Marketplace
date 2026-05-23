import { Product } from "~/models/products.models";

export interface Query {
  field: keyof Product;
  name: string;
  search: string;
}

const getFilteredProducts = (products: Product[], query: Partial<Query>) => {
  const { field, name, search } = query;
  let filtered = products;

  if (field && name) {
    filtered = filtered.filter((c) => {
      const val = c[field];
      if (typeof val === "string") {
        return val.toLowerCase() === name.toLowerCase();
      }
      return String(val) === name;
    });
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((c) => {
      return (
        (c.name && c.name.toLowerCase().includes(searchLower)) ||
        (c.description && c.description.toLowerCase().includes(searchLower)) ||
        (c.category && c.category.toLowerCase().includes(searchLower))
      );
    });
  }

  return filtered;
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const field = query.field as keyof Product | undefined;
  const name = query.name as string | undefined;
  const search = query.search as string | undefined;
  
  const products: Product[] = await $fetch(
    "https://marketplace-afea8-default-rtdb.firebaseio.com/db.json",
  );

  return getFilteredProducts(products, { field, name, search });
});

