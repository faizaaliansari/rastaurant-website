// ================= ADMIN LOGIN =================
const ADMIN = { username: 'admin', password: 'admin123' };

function adminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPass').value;
  if (u === ADMIN.username && p === ADMIN.password) {
    localStorage.setItem('biryaniAdmin', 'true');
    showPanel();
  } else {
    alert('❌ Invalid credentials!\n\nUse: admin / admin123');
  }
}

function showPanel() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  renderOrders();
}

function adminLogout() {
  localStorage.removeItem('biryaniAdmin');
  location.reload();
}

// Auto-login if session exists
if (localStorage.getItem('biryaniAdmin') === 'true') showPanel();

// ================= DATA =================
function getOrders() {
  return JSON.parse(localStorage.getItem('biryaniOrders')) || [];
}
function saveOrders(orders) {
  localStorage.setItem('biryaniOrders', JSON.stringify(orders));
}

// ================= STATS =================
function renderStats() {
  const orders = getOrders();
  const total = orders.length;
  const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statRevenue').textContent = '₹' + revenue.toLocaleString();
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statDelivered').textContent = delivered;
}

// ================= RENDER ORDERS =================
function renderOrders() {
  const orders = getOrders();
  const search = (document.getElementById('orderSearch')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('statusFilter')?.value || '';

  const filtered = orders
    .filter(o => {
      const matchSearch = !search || 
        o.orderId.toLowerCase().includes(search) ||
        o.customer.name.toLowerCase().includes(search) ||
        o.customer.phone.includes(search);
      const matchStatus = !statusFilter || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const list = document.getElementById('ordersList');
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-orders"><i class="fas fa-inbox"></i><p>No orders found.</p></div>';
    renderStats();
    return;
  }

  list.innerHTML = filtered.map(o => `
    <div class="order-card">
      <div class="order-top">
        <div>
          <h3>Order #${o.orderId}</h3>
          <p class="order-date"><i class="fas fa-clock"></i> ${new Date(o.date).toLocaleString()}</p>
        </div>
        <span class="status-badge status-${o.status.replace(/ /g, '-').toLowerCase()}">${o.status}</span>
      </div>
      
      <div class="order-body">
        <div class="order-customer">
          <h4><i class="fas fa-user"></i> ${o.customer.name}</h4>
          <p><i class="fas fa-phone"></i> ${o.customer.phone}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${o.customer.address}</p>
          <p><i class="fas fa-credit-card"></i> ${o.customer.payment}</p>
        </div>
        <div class="order-items">
          <h4><i class="fas fa-utensils"></i> Items</h4>
          ${o.items.map(i => `<p>${i.name} × ${i.qty} = <strong>₹${i.subtotal}</strong></p>`).join('')}
          <div class="order-total-line">
            <span>Subtotal: ₹${o.subtotal}</span>
            <span>Delivery: ₹${o.delivery}</span>
            <strong>Total: ₹${o.total}</strong>
          </div>
        </div>
      </div>

      <div class="order-actions">
        <label>Update Status:</label>
        <select onchange="updateStatus('${o.orderId}', this.value)">
          ${['Pending','Preparing','Out for Delivery','Delivered','Cancelled'].map(s => 
            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
        <button class="btn-delete-order" onclick="deleteOrder('${o.orderId}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');

  renderStats();
}

// ================= UPDATE STATUS =================
function updateStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (order) {
    order.status = newStatus;
    saveOrders(orders);
    showToast(`✅ Order #${orderId} → ${newStatus}`);
    renderStats();
  }
}

// ================= DELETE ORDER =================
function deleteOrder(orderId) {
  if (!confirm(`Order #${orderId} delete karein?`)) return;
  const orders = getOrders().filter(o => o.orderId !== orderId);
  saveOrders(orders);
  renderOrders();
  showToast('🗑️ Order deleted');
}

// ================= CLEAR ALL =================
function clearAllOrders() {
  if (!confirm('⚠️ Saare orders permanently delete ho jayenge!\n\nKya aap sure hain?')) return;
  if (!confirm('Ye action undo nahi ho sakta. Confirm?')) return;
  saveOrders([]);
  renderOrders();
  showToast('🗑️ All orders cleared');
}

// ================= EXPORT CSV =================
function exportOrders() {
  const orders = getOrders();
  if (orders.length === 0) { alert('No orders to export!'); return; }

  let csv = 'OrderID,Date,Customer,Phone,Address,Payment,Items,Subtotal,Delivery,Total,Status\n';
  orders.forEach(o => {
    const items = o.items.map(i => `${i.name} x${i.qty}`).join('; ');
    csv += `"${o.orderId}","${new Date(o.date).toLocaleString()}","${o.customer.name}","${o.customer.phone}","${o.customer.address}","${o.customer.payment}","${items}",${o.subtotal},${o.delivery},${o.total},"${o.status}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `biryani-orders-${Date.now()}.csv`;
  a.click();
  showToast('📥 Export successful!');
}

// ================= TOAST =================
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

// Init
renderStats();