// =============================================
//  SwiftDrop — app.js
// =============================================

// ── Data ─────────────────────────────────────

const CATEGORIES = [
  { emoji: '🍕', name: 'Pizza',    count: '230+ places' },
  { emoji: '🍔', name: 'Burgers',  count: '180+ places' },
  { emoji: '🍜', name: 'Noodles',  count: '140+ places' },
  { emoji: '🌮', name: 'Mexican',  count: '95+ places'  },
  { emoji: '🍱', name: 'Japanese', count: '120+ places' },
];

const RESTAURANTS = [
  {
    emoji: '🍕', bg: '#1a0f0f',
    name: 'Woodfire Pizzeria', cuisine: 'Italian • Pizza',
    rating: 4.8, time: '22 min', price: '$2.99', badge: 'popular',
    items: [
      { emoji: '🍕', name: 'Margherita',   price: 12.99 },
      { emoji: '🍕', name: 'Pepperoni',    price: 14.99 },
      { emoji: '🥗', name: 'Caesar Salad', price: 8.99  },
    ],
  },
  {
    emoji: '🍔', bg: '#0f130a',
    name: 'Smash Burgers', cuisine: 'American • Burgers',
    rating: 4.6, time: '18 min', price: '$1.99', badge: 'new',
    items: [
      { emoji: '🍔', name: 'Double Smash', price: 13.99 },
      { emoji: '🍟', name: 'Loaded Fries', price: 6.99  },
      { emoji: '🥤', name: 'Shake',        price: 5.99  },
    ],
  },
  {
    emoji: '🍜', bg: '#080f14',
    name: 'Ramen House', cuisine: 'Japanese • Ramen',
    rating: 4.9, time: '30 min', price: 'Free', badge: '',
    items: [
      { emoji: '🍜', name: 'Tonkotsu Ramen', price: 15.99 },
      { emoji: '🍱', name: 'Sushi Set',       price: 19.99 },
      { emoji: '🥟', name: 'Gyoza (6pc)',      price: 7.99  },
    ],
  },
  {
    emoji: '🌮', bg: '#130f06',
    name: 'Taco Cartel', cuisine: 'Mexican • Street Food',
    rating: 4.5, time: '20 min', price: '$1.49', badge: '',
    items: [
      { emoji: '🌮', name: 'Beef Tacos (3)',  price: 11.99 },
      { emoji: '🌯', name: 'Burrito Bowl',    price: 12.99 },
      { emoji: '🥑', name: 'Guacamole',       price: 4.99  },
    ],
  },
  {
    emoji: '🍛', bg: '#0f0e0a',
    name: 'Spice Garden', cuisine: 'Indian • Curry',
    rating: 4.7, time: '35 min', price: 'Free', badge: 'popular',
    items: [
      { emoji: '🍛', name: 'Butter Chicken', price: 14.99 },
      { emoji: '🫓', name: 'Garlic Naan',    price: 3.99  },
      { emoji: '🍚', name: 'Biryani',        price: 16.99 },
    ],
  },
  {
    emoji: '🍣', bg: '#080d12',
    name: 'Tokyo Express', cuisine: 'Japanese • Sushi',
    rating: 4.8, time: '25 min', price: '$2.49', badge: 'new',
    items: [
      { emoji: '🍣', name: 'Salmon Roll', price: 16.99 },
      { emoji: '🍱', name: 'Bento Box',   price: 18.99 },
      { emoji: '🍤', name: 'Tempura',     price: 12.99 },
    ],
  },
];

// ── State ─────────────────────────────────────

let cart           = {};   // { [itemName]: { name, price, emoji, qty } }
let cartOpen       = false;
let favorites      = new Set();
let activeCategory = null;
let toastTimer     = null;

// ── Init ──────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderRestaurants(RESTAURANTS);
});

// ── Categories ────────────────────────────────

function renderCategories() {
  const grid = document.getElementById('catGrid');
  grid.innerHTML = '';

  CATEGORIES.forEach((cat, index) => {
    const el = document.createElement('div');
    el.className = 'cat-card';
    el.innerHTML = `
      <span class="cat-emoji">${cat.emoji}</span>
      <div class="cat-name">${cat.name}</div>
      <div class="cat-count">${cat.count}</div>
    `;

    el.addEventListener('click', () => handleCategoryClick(cat, index, el));
    grid.appendChild(el);
  });
}

function handleCategoryClick(cat, index, el) {
  // Deselect if already active
  if (activeCategory === index) {
    activeCategory = null;
    el.classList.remove('active');
    renderRestaurants(RESTAURANTS);
    return;
  }

  // Select new category
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeCategory = index;

  const filtered = filterRestaurantsByCategory(cat.name);
  renderRestaurants(filtered.length ? filtered : RESTAURANTS);
}

function filterRestaurantsByCategory(categoryName) {
  const needle = categoryName.toLowerCase();
  return RESTAURANTS.filter(r =>
    r.cuisine.toLowerCase().includes(needle) ||
    r.items.some(item => item.name.toLowerCase().includes(needle))
  );
}

// ── Restaurants ───────────────────────────────

function renderRestaurants(list) {
  const grid = document.getElementById('restoGrid');
  grid.innerHTML = '';

  list.forEach((resto, i) => {
    const card = document.createElement('div');
    card.className = 'resto-card';
    card.style.animationDelay = `${i * 0.08}s`;

    const badgeHTML = resto.badge
      ? `<div class="resto-badge badge-${resto.badge}">${resto.badge === 'new' ? 'New' : '🔥 Popular'}</div>`
      : '';

    const isFav = favorites.has(resto.name);

    const menuHTML = resto.items.map(item => `
      <div class="menu-row">
        <span class="menu-row-name">${item.emoji} ${item.name}</span>
        <div class="menu-row-right">
          <span class="menu-row-price">$${item.price.toFixed(2)}</span>
          <button class="add-btn" data-name="${item.name}" data-price="${item.price}" data-emoji="${item.emoji}">
            + Add
          </button>
        </div>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="resto-img" style="background:${resto.bg}">
        ${badgeHTML}
        <div class="resto-fav ${isFav ? 'favorited' : ''}" data-resto="${resto.name}">
          ${isFav ? '❤️' : '🤍'}
        </div>
        <span style="font-size:3.5rem">${resto.emoji}</span>
      </div>
      <div class="resto-body">
        <div class="resto-name">${resto.name}</div>
        <div class="resto-cuisine">${resto.cuisine}</div>
        <div class="resto-meta">
          <div class="meta-item rating">⭐ ${resto.rating}</div>
          <div class="meta-item">⏱ ${resto.time}</div>
          <div class="meta-item">🛵 ${resto.price}</div>
        </div>
        <div class="resto-menu">${menuHTML}</div>
      </div>
    `;

    // Favorite button
    card.querySelector('.resto-fav').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(resto.name, e.currentTarget);
    });

    // Add-to-cart buttons
    card.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { name, price, emoji } = btn.dataset;
        addToCart(name, parseFloat(price), emoji);
      });
    });

    grid.appendChild(card);
  });
}

// ── Favorites ─────────────────────────────────

function toggleFavorite(restoName, el) {
  if (favorites.has(restoName)) {
    favorites.delete(restoName);
    el.innerHTML = '🤍';
    el.classList.remove('favorited');
  } else {
    favorites.add(restoName);
    el.innerHTML = '❤️';
    el.classList.add('favorited');
    showToast(`❤️ Added to favourites!`);
  }
}

// ── Cart ──────────────────────────────────────

function addToCart(name, price, emoji) {
  if (cart[name]) {
    cart[name].qty++;
  } else {
    cart[name] = { name, price, emoji, qty: 1 };
  }
  updateCartUI();
  showToast(`${emoji} ${name} added to cart!`);
}

function changeQty(name, delta) {
  if (!cart[name]) return;
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];
  updateCartUI();
}

function updateCartUI() {
  const items    = Object.values(cart);
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  // Update FAB badge
  document.getElementById('cartCount').textContent = totalQty;

  const cartItemsEl = document.getElementById('cartItems');
  const cartFootEl  = document.getElementById('cartFoot');

  if (!items.length) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div>Your cart is empty</div>
      </div>`;
    cartFootEl.style.display = 'none';
    return;
  }

  // Render items
  cartFootEl.style.display = 'block';
  cartItemsEl.innerHTML = items.map(item => `
    <div class="cart-item">
      <span class="cart-item-emoji">${item.emoji}</span>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${item.name}', -1)">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
      </div>
    </div>
  `).join('');

  // Totals
  const subtotal   = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 1.99;
  const grandTotal  = subtotal + deliveryFee;

  document.getElementById('subtotal').textContent  = `$${subtotal.toFixed(2)}`;
  document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

// ── Cart Panel ────────────────────────────────

function toggleCart() {
  cartOpen = !cartOpen;
  document.getElementById('cartPanel').classList.toggle('open', cartOpen);
  document.getElementById('cartOverlay').classList.toggle('open', cartOpen);
}

// ── Checkout ──────────────────────────────────

function checkout() {
  cart = {};
  updateCartUI();
  toggleCart();
  showToast('🎉 Order placed successfully!');
}

// ── Order Tracking ────────────────────────────

function trackOrder() {
  const input = document.getElementById('trackInput');
  const value = input.value.trim();

  if (!value) {
    showToast('⚠️ Please enter an order ID');
    return;
  }

  showToast(`📦 Tracking order ${value}…`);
  input.value = '';

  // Scroll to tracking card on desktop
  setTimeout(() => {
    const card = document.querySelector('.hero-visual');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 500);
}

// ── Scroll to Menu ────────────────────────────

function scrollToMenu() {
  document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

// ── Toast Notification ────────────────────────

function showToast(message) {
  clearTimeout(toastTimer);

  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  toastMsg.textContent = message;
  toast.classList.add('show');

  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}