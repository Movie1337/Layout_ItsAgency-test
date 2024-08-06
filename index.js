import axios from "axios";
import "./styles.css";

const API_URL =
  "https://66af8a89b05db47acc5a1eef.mockapi.io/api/v1/products/product-card";

let cart = [];
let products = [];

// Функция для загрузки данных
async function fetchProducts() {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Функция для сортировки продуктов
function sortProducts(products, sortBy) {
  switch (sortBy) {
    case "expensive":
      return products.sort((a, b) => b.price - a.price);
    case "cheap":
      return products.sort((a, b) => a.price - b.price);
    case "popular":
      return products.sort((a, b) => b.popularity - a.popularity);
    case "new":
      return products.sort(
        (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
      );
    default:
      return products;
  }
}

// Функция для отрисовки продуктов
function renderProducts(products) {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) {
    console.error('Element with class "products-grid" not found.');
    return;
  }

  productsGrid.innerHTML = "";

  products.forEach((product) => {
    console.log(
      `Rendering product: ${product.name}, Image URL: ${product.image}`
    ); // Логирование

    const img = new Image();
    img.onload = () => console.log(`Image loaded: ${product.image}`);
    img.onerror = () => console.error(`Failed to load image: ${product.image}`);
    img.src = product.image;

    const productElement = document.createElement("div");
    productElement.className = "product-card";
    productElement.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h4>${product.name}</h4>
        <div class="price-add">
          <span class="price">${product.price} Р</span>
          <button class="add-to-cart">+</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(productElement);
  });

  setupAddToCartButtons();
}

// Функция для настройки фильтров
function setupFilters() {
  const filterCheckboxes = document.querySelectorAll(
    '.filters input[type="checkbox"]'
  );
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters);
  });
}

// Функция для применения фильтров
function applyFilters() {
  const isNew = document.getElementById("new-products").checked;
  const inStock = document.getElementById("in-stock").checked;
  const contract = document.getElementById("contract").checked;
  const exclusive = document.getElementById("exclusive").checked;
  const sale = document.getElementById("sale").checked;

  const filteredProducts = products.filter(
    (product) =>
      (!isNew || product.type === "new") &&
      (!inStock || product.inStock) &&
      (!contract || product.contract) &&
      (!exclusive || product.exclusive) &&
      (!sale || product.sale)
  );

  renderProducts(filteredProducts);
}

// Функция для настройки мобильных фильтров
function setupMobileFilters() {
  const filtersToggle = document.querySelector(".filters-toggle");
  const filters = document.querySelector(".filters");
  const overlay = document.getElementById("overlay");

  if (!filtersToggle || !filters || !overlay) {
    console.error("One or more elements for mobile filters are missing.");
    return;
  }

  filtersToggle.addEventListener("click", () => {
    filters.classList.toggle("active");
    if (filters.classList.contains("active")) {
      overlay.style.display = "block";
      document.body.style.overflow = "hidden";
    } else {
      overlay.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  overlay.addEventListener("click", () => {
    filters.classList.remove("active");
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  });
}

// Функция для настройки сортировки
function setupSorting() {
  const sortOptions = document.getElementById("sort-options");

  sortOptions.addEventListener("change", (event) => {
    const sortBy = event.target.value;
    const sortedProducts = sortProducts(products, sortBy);
    renderProducts(sortedProducts);
  });
}

// Функция для настройки слайдера
function setupSwiper() {
  const swiper = new Swiper(".swiper-container", {
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    on: {
      init: function () {
        toggleNavigationButtons(this);
      },
      slideChange: function () {
        toggleNavigationButtons(this);
      },
    },
  });

  function toggleNavigationButtons(swiper) {
    const prevButton = document.querySelector(".swiper-button-prev");
    const nextButton = document.querySelector(".swiper-button-next");

    if (swiper.isBeginning) {
      prevButton.classList.add("swiper-button-disabled");
    } else {
      prevButton.classList.remove("swiper-button-disabled");
    }

    if (swiper.isEnd) {
      nextButton.classList.add("swiper-button-disabled");
    } else {
      nextButton.classList.remove("swiper-button-disabled");
    }
  }
}

// Обновление корзины
function updateCart() {
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartCount = document.querySelector(".cart-count");
  const cartItemsCount = document.querySelector(".cart-items-count");
  const totalAmount = document.querySelector(".total-amount");

  cartItemsContainer.innerHTML = "";
  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    if (item.hidden) cartItem.classList.add("hidden");
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>${item.price} Р</span>
      </div>
      <div class="cart-item-controls">
        <button class="decrease">-</button>
        <input type="number" value="${item.quantity}" readonly>
        <button class="increase">+</button>
      </div>
      <span class="cart-item-remove">&times;</span>
      <span class="cart-item-restore">&#8634;</span>
    `;
    cartItemsContainer.appendChild(cartItem);

    const decreaseButton = cartItem.querySelector(".decrease");
    const increaseButton = cartItem.querySelector(".increase");
    const removeButton = cartItem.querySelector(".cart-item-remove");
    const restoreButton = cartItem.querySelector(".cart-item-restore");

    decreaseButton.addEventListener("click", () => {
      item.quantity = Math.max(1, item.quantity - 1);
      updateCart();
      calculateTotal();
    });

    increaseButton.addEventListener("click", () => {
      item.quantity += 1;
      updateCart();
      calculateTotal();
    });

    removeButton.addEventListener("click", () => {
      item.hidden = true;
      updateCart();
      calculateTotal();
    });

    restoreButton.addEventListener("click", () => {
      item.hidden = false;
      updateCart();
      calculateTotal();
    });
  });
  updateCartCount();
  calculateTotal();
}

// Обновление количества товаров в корзине
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  const cartItemsCount = document.querySelector(".cart-items-count");

  const visibleItems = cart.filter((item) => !item.hidden);
  cartCount.textContent = visibleItems.length;
  cartItemsCount.textContent = `${visibleItems.length} товара`;
}

// Расчет общей суммы в корзине
function calculateTotal() {
  const totalAmount = document.querySelector(".total-amount");

  let total = 0;
  cart.forEach((item) => {
    if (!item.hidden) {
      total += item.price * item.quantity;
    }
  });
  totalAmount.textContent = `${total} Р`;
}

// Функция для настройки кнопок "добавить в корзину"
function setupAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-card");
      const name = productCard.querySelector("h4").textContent;
      const price = parseInt(
        productCard.querySelector(".price").textContent.replace(" Р", "")
      );
      const image = productCard.querySelector("img").src;

      const existingItem = cart.find((item) => item.name === name);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ name, price, image, quantity: 1, hidden: false });
      }

      updateCart();
      calculateTotal();
    });
  });
}

// Функция для настройки корзины
function setupCart() {
  const cartIcon = document.querySelector(".cart-icon");
  const cartModal = document.querySelector(".cart-modal");
  const cartClose = document.querySelector(".cart-close");
  const clearCartButton = document.querySelector(".clear-cart");
  const checkoutButton = document.querySelector(".checkout-btn");

  cartIcon.addEventListener("click", () => {
    cartModal.classList.toggle("hidden");
    if (!cartModal.classList.contains("hidden")) {
      setTimeout(() => cartModal.classList.add("open"), 0);
    } else {
      cartModal.classList.remove("open");
    }
  });

  cartClose.addEventListener("click", () => {
    cartModal.classList.remove("open");
    setTimeout(() => cartModal.classList.add("hidden"), 300);
  });

  clearCartButton.addEventListener("click", () => {
    cart = [];
    updateCart();
    calculateTotal();
  });

  checkoutButton.addEventListener("click", () => {
    alert("Checkout is not implemented yet.");
  });
}

// Инициализация страницы
document.addEventListener("DOMContentLoaded", async () => {
  products = await fetchProducts();
  renderProducts(products);
  setupFilters();
  setupMobileFilters();
  setupSorting();
  setupSwiper();
  setupAddToCartButtons();
  setupCart();
});
