// ================= CART STATE =================
let cart = JSON.parse(localStorage.getItem('biryaniCart')) || [];

function saveCart() {
  localStorage.setItem('biryaniCart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id) {
  const item = MENU_ITEMS.find(i => i.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart();
  // Show toast
  showToast(`✅ ${item.name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

// ================= CART UI =================
function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const cartCount = document.getElementById('cartCount');
  if (cartCount) cartCount.textContent = count;

  const itemsDiv = document.getElementById('cartItems');
  if (!itemsDiv) return;

  if (cart.length === 0) {
    itemsDiv.innerHTML = '<p class="empty-cart"><i class="fas fa-shopping-cart"></i><br>Your cart is empty</p>';
  } else {
    itemsDiv.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span class="ci-emoji">${item.emoji}</span>
        <div class="ci-info">
          <h4>${item.name}</h4>
          <p>₹${item.price} × ${item.qty} = <strong>₹${item.price * item.qty}</strong></p>
        </div>
        <div class="ci-qty">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <button class="ci-remove" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = cart.length > 0 ? 50 : 0;
  if (document.getElementById('subtotal')) {
    document.getElementById('subtotal').textContent = '₹' + subtotal;
    document.getElementById('grandTotal').textContent = '₹' + (subtotal + delivery);
  }
}

// ================= MODAL HELPERS =================
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Cart button
document.getElementById('cartBtn').addEventListener('click', (e) => {
  e.preventDefault();
  if (cart.length === 0) {
    showToast('🛒 Cart is empty! Add items first.');
    return;
  }
  openModal('cartModal');
});

// Close on outside click
window.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) e.target.classList.remove('active');
});

// ================= PLACE ORDER =================
function placeOrder(e) {
  e.preventDefault();
  if (cart.length === 0) { alert('Cart is empty!'); return; }

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const payment = document.getElementById('paymentMode').value;

  if (phone.length !== 10) {
    alert('Phone number 10 digit ka hona chahiye!');
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = 50;
  const total = subtotal + delivery;

  const order = {
    orderId: 'BM' + Date.now().toString().slice(-6),
    customer: { name, phone, address, payment },
    items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price, subtotal: i.price * i.qty })),
    subtotal, delivery, total,
    status: 'Pending',
    date: new Date().toISOString()
  };

  // Save to orders backup
  const orders = JSON.parse(localStorage.getItem('biryaniOrders')) || [];
  orders.push(order);
  localStorage.setItem('biryaniOrders', JSON.stringify(orders));

  // Show success
  document.getElementById('successOrderId').textContent = '#' + order.orderId;
  closeModal('cartModal');
  openModal('successModal');

  // Clear cart
  cart = [];
  saveCart();
  document.getElementById('checkoutForm').reset();
}

// ================= TOAST =================
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Init
updateCartUI();