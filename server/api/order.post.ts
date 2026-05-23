export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.name || !body.phone || !body.items || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid order data",
    });
  }

  const order = {
    customerName: body.name,
    customerPhone: body.phone,
    items: body.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      count: item.count,
    })),
    total: body.total,
    createdAt: new Date().toISOString(),
  };

  // Save the order in Firebase
  const response = await $fetch(
    "https://marketplace-afea8-default-rtdb.firebaseio.com/orders.json",
    {
      method: "POST",
      body: order,
    }
  );

  return { success: true, orderId: (response as any).name };
});
