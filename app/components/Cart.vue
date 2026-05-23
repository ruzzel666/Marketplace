<template>
  <div class="overlay" :class="{ show: viewCart }" id="modal-cart">
    <div class="modal">
      <header class="modal-header">
        <h2 class="modal-title">Cart</h2>
        <button class="modal-close" @click="closeCart">x</button>
      </header>
      <table class="cart-table">
        <colgroup>
          <col class="col-goods" />
          <col class="col-price" />
          <col class="col-minus" />
          <col class="col-qty" />
          <col class="col-plus" />
          <col class="col-total-price" />
          <col class="col-delete" />
        </colgroup>
        <thead>
          <tr>
            <th>Good(s)</th>
            <th>Price</th>
            <th colspan="3">Qty.</th>
            <th colspan="2">Total</th>
          </tr>
        </thead>
        <tbody class="cart-table__goods">
          <tr v-if="cart.length === 0">
            <td colspan="7" style="text-align: center;">Корзина пуста</td>
          </tr>
          <tr v-else class="cart-item" v-for="item in cart" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.price }}$</td>
            <td>
              <button
                class="cart-btn-minus"
                :disabled="item.count <= 1"
                @click="decrease(item)"
              >
                -
              </button>
            </td>
            <td>{{ item.count }}</td>
            <td>
              <button class="cart-btn-plus" @click="increase(item)">+</button>
            </td>
            <td>{{ item.price * item.count }}$</td>
            <td>
              <button class="cart-btn-delete" @click="remove(item)">x</button>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="cart.length > 0">
          <tr>
            <th colspan=" 5">Total:</th>
            <th class="card-table__total" colspan="2">{{ total }}$</th>
          </tr>
        </tfoot>
      </table>
      <form class="modal-form" @submit.prevent="submitOrder">
        <input
          v-model="customerName"
          class="modal-input"
          type="text"
          placeholder="Имя"
          name="nameCustomer"
          required
        />
        <input
          v-model="customerPhone"
          class="modal-input"
          type="text"
          placeholder="Телефон"
          name="phoneCustomer"
          required
        />
        <button class="button cart-buy" type="submit" :disabled="cart.length === 0 || isSubmitting">
          <span class="button-text">{{ isSubmitting ? 'Sending...' : 'Checkout' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { CartItem } from "~/models/cart-item.model";

const viewCart = useViewCart();
const cart = useCart();
const total = computed(() =>
  cart.value.reduce((sum, item) => {
    return sum + item.price * item.count;
  }, 0),
);

const customerName = ref("");
const customerPhone = ref("");
const isSubmitting = ref(false);

const closeCart = () => {
  viewCart.value = false;
};

const increase = (item: CartItem) => {
  const findItem = cart.value.find((c) => c.id === item.id);

  if (findItem) {
    findItem.count++;
  }
};

const decrease = (item: CartItem) => {
  const findItem = cart.value.find((c) => c.id === item.id);

  if (findItem) {
    findItem.count--;
  }
};

const remove = (item: CartItem) => {
  const findItem = cart.value.find((c) => c.id === item.id);

  if (findItem) {
    cart.value = cart.value.filter((c) => c.id !== item.id);
  }
};

const submitOrder = async () => {
  if (cart.value.length === 0) {
    alert("Ваша корзина пуста!");
    return;
  }

  isSubmitting.value = true;
  try {
    const order = {
      customerName: customerName.value,
      customerPhone: customerPhone.value,
      items: cart.value.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        count: item.count,
      })),
      total: total.value,
      createdAt: new Date().toISOString(),
    };

    const response = await $fetch<any>(
      "https://marketplace-afea8-default-rtdb.firebaseio.com/orders.json",
      {
        method: "POST",
        body: order,
      }
    );

    if (response && response.name) {
      alert(`Заказ успешно оформлен! ID заказа: ${response.name}`);
      cart.value = [];
      customerName.value = "";
      customerPhone.value = "";
      closeCart();
    }
  } catch (error) {
    console.error("Ошибка при оформлении заказа:", error);
    alert("Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
