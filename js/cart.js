const cart = function () {
  const cartBtn = document.querySelector(".button-cart");
  const cartModal = document.getElementById("modal-cart");

  if (!cartBtn || !cartModal) return;

  const closeBtn = cartModal.querySelector(".modal-close");
  const cartTable = document.querySelector(".cart-table__goods");
  const modalForm = document.querySelector(".modal-form");

  const updateCartCount = () => {
    const cartArray = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) {
      const totalCount = cartArray.reduce((sum, item) => sum + item.count, 0);
      cartCountElement.textContent = totalCount > 0 ? totalCount : "";
    }
  };

  const deleteCartItem = (id) => {
    const cartArray = JSON.parse(localStorage.getItem("cart")) || [];
    const newCart = cartArray.filter((good) => good.id !== id);
    localStorage.setItem("cart", JSON.stringify(newCart));
    renderCartGoods(newCart);
    updateCartCount();
  };

  const plusCartItem = (id) => {
    const cartArray = JSON.parse(localStorage.getItem("cart")) || [];
    const newCart = cartArray.map((good) => {
      if (good.id === id) {
        good.count++;
      }
      return good;
    });
    localStorage.setItem("cart", JSON.stringify(newCart));
    renderCartGoods(newCart);
    updateCartCount();
  };

  const minusCartItem = (id) => {
    const cartArray = JSON.parse(localStorage.getItem("cart")) || [];
    const newCart = cartArray
      .map((good) => {
        if (good.id === id) {
          if (good.count > 0) {
            good.count--;
          }
        }
        return good;
      })
      .filter((good) => good.count > 0);
    localStorage.setItem("cart", JSON.stringify(newCart));
    renderCartGoods(newCart);
    updateCartCount();
  };

  const addToCart = (id) => {
    const goods = JSON.parse(localStorage.getItem("goods")) || [];
    let clickedGood = goods.find((good) => good.id === id);

    const proceedAddToCart = (good) => {
      const cartArray = localStorage.getItem("cart")
        ? JSON.parse(localStorage.getItem("cart"))
        : [];

      if (cartArray.some((item) => item.id === good.id)) {
        cartArray.forEach((item) => {
          if (item.id === good.id) {
            item.count++;
          }
        });
      } else {
        const itemToAdd = { ...good, count: 1 };
        cartArray.push(itemToAdd);
      }

      localStorage.setItem("cart", JSON.stringify(cartArray));
      updateCartCount();
    };

    if (clickedGood) {
      proceedAddToCart(clickedGood);
    } else {
      fetch("db/db.json")
        .then((res) => res.json())
        .then((data) => {
          const allGoods = data.db || data;
          clickedGood = allGoods.find((good) => good.id === id);
          if (clickedGood) {
            proceedAddToCart(clickedGood);
          }
        })
        .catch(() => {
          fetch("http://localhost:3000/db")
            .then((res) => res.json())
            .then((data) => {
              const allGoods = data.db || data;
              clickedGood = allGoods.find((good) => good.id === id);
              if (clickedGood) {
                proceedAddToCart(clickedGood);
              }
            });
        });
    }
  };

  const renderCartGoods = (goods) => {
    cartTable.innerHTML = "";
    let total = 0;

    goods.forEach((good) => {
      const tr = document.createElement("tr");
      const subtotal = +good.price * +good.count;
      total += subtotal;

      tr.innerHTML = `
        <td>${good.name}</td>
        <td>${good.price}$</td>
        <td><button class="cart-btn-minus">-</button></td>
        <td>${good.count}</td>
        <td><button class="cart-btn-plus">+</button></td>
        <td>${subtotal}$</td>
        <td><button class="cart-btn-delete">x</button></td>
      `;

      cartTable.append(tr);

      tr.addEventListener("click", (e) => {
        if (e.target.classList.contains("cart-btn-minus")) {
          minusCartItem(good.id);
        } else if (e.target.classList.contains("cart-btn-plus")) {
          plusCartItem(good.id);
        } else if (e.target.classList.contains("cart-btn-delete")) {
          deleteCartItem(good.id);
        }
      });
    });

    const totalElement = document.querySelector(".card-table__total");
    if (totalElement) {
      totalElement.textContent = total + "$";
    }
  };

  const sendForm = () => {
    const cartArray = localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];

    if (cartArray.length === 0) {
      alert('Ваша корзина пуста!');
      return;
    }

    const nameInput = modalForm.querySelector('input[name="nameCustomer"]');
    const phoneInput = modalForm.querySelector('input[name="phoneCustomer"]');

    if (!nameInput.value.trim() || !phoneInput.value.trim()) {
      alert('Пожалуйста, заполните все поля формы!');
      return;
    }

    const orderData = {
      cart: cartArray,
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
    };

    const submitOrder = (url) => {
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
    };

    submitOrder('http://localhost:3000/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Local server error');
        return res.json();
      })
      .catch(() => {
        return submitOrder('https://jsonplaceholder.typicode.com/posts')
          .then((res) => {
            if (!res.ok) throw new Error('Remote server error');
            return res.json();
          });
      })
      .then(() => {
        localStorage.removeItem('cart');
        nameInput.value = '';
        phoneInput.value = '';
        updateCartCount();
        cartModal.style.display = '';
        alert('Заказ успешно оформлен!');
      })
      .catch((err) => {
        console.error(err);
        alert('Произошла ошибка при отправке заказа.');
      });
  };

  if (modalForm) {
    modalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      sendForm();
    });
  }

  cartBtn.addEventListener("click", () => {
    const cartArray = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
    renderCartGoods(cartArray);
    cartModal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    cartModal.style.display = "";
  });

  cartModal.addEventListener("click", (event) => {
    if (
      !event.target.closest(".modal") &&
      event.target.classList.contains("overlay")
    ) {
      cartModal.style.display = "";
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cartModal.style.display = "";
    }
  });

  document.addEventListener("click", (event) => {
    const addToCartBtn = event.target.closest(".add-to-cart");
    if (addToCartBtn) {
      const goodId = addToCartBtn.dataset.id;
      addToCart(goodId);
    }
  });

  updateCartCount();
};

cart();
