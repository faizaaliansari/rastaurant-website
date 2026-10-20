// ================= NAVBAR TOGGLE =================
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('active');
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href === '#' || href === '#cart') return;
    const target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ================= RENDER MENU =================
function renderMenu(filter = 'all') {
  const grid = document.getElementById('menuGrid');
  const items = filter === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === filter);

  grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <div class="menu-emoji">${item.emoji}</div>
      <div class="menu-body">
        <div class="menu-head">
          <h3>${item.name}</h3>
          <span class="price">₹${item.price}</span>
        </div>
        <p class="desc">${item.desc}</p>
        <button class="btn-order" onclick="addToCart(${item.id})">
          <i class="fas fa-plus"></i> Order Now
        </button>
      </div>
    </div>
  `).join('');
}

// Filter tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMenu(btn.dataset.filter);
  });
});

// ================= RENDER REVIEWS =================
function renderReviews() {
  document.getElementById('reviewsGrid').innerHTML = REVIEWS.map(r => `
    <div class="review-card">
      <div class="review-head">
        <div class="avatar">${r.avatar}</div>
        <div>
          <h4>${r.name}</h4>
          <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        </div>
      </div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-verified"><i class="fas fa-check-circle"></i> Verified Order</div>
    </div>
  `).join('');
}

// Initialize
renderMenu();
renderReviews();