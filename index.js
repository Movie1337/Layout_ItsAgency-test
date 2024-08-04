import axios from "axios";
import "./styles.css";

const API_URL =
  "https://66af8a89b05db47acc5a1eef.mockapi.io/api/v1/products/product-card";

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

  productsGrid.innerHTML = ""; // Очистите контейнер перед рендерингом

  products.forEach((product) => {
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
}

// Функция для настройки фильтров
function setupFilters(products) {
  const filterCheckboxes = document.querySelectorAll(
    '.filters input[type="checkbox"]'
  );
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => applyFilters(products));
  });
}

// Функция для применения фильтров
function applyFilters(products) {
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
    console.log("Filters toggle clicked");
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
    console.log("Overlay clicked");
    filters.classList.remove("active");
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  });
}

// Функция для настройки сортировки
function setupSorting() {
  const sortOptions = document.getElementById("sort-options");
  const productsGrid = document.querySelector(".products-grid");

  sortOptions.addEventListener("change", async (event) => {
    const sortBy = event.target.value;
    const products = await fetchProducts();
    const sortedProducts = sortProducts(products, sortBy);
    renderProducts(sortedProducts);
  });
}

// Функция для настройки слайдера (Swiper)
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

// Функция для настройки корзины
function setupCart() {
  const cartIcon = document.querySelector(".cart-icon");
  const cartModal = document.querySelector(".cart-modal");
  const cartClose = document.querySelector(".cart-close");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  const cartCount = document.querySelector(".cart-count");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartItemsCount = document.querySelector(".cart-items-count");
  const clearCartButton = document.querySelector(".clear-cart");
  const totalAmount = document.querySelector(".total-amount");
  const checkoutButton = document.querySelector(".checkout-btn");

  let cart = [];

  const updateCartCount = () => {
    const visibleItems = cart.filter((item) => !item.hidden);
    cartCount.textContent = visibleItems.length;
    cartItemsCount.textContent = `${visibleItems.length} товара`;
  };

  const calculateTotal = () => {
    let total = 0;
    cart.forEach((item) => {
      if (!item.hidden) {
        total += item.price * item.quantity;
      }
    });
    totalAmount.textContent = `${total} Р`;
  };

  const updateCart = () => {
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
  };

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
document.addEventListener("DOMContentLoaded", () => {
  async function init() {
    const products = await fetchProducts();
    renderProducts(products);
    setupFilters(products);
    setupMobileFilters();
    setupSorting();
    setupSwiper();
    setupCart();
  }

  init();
});
