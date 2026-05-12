// ============================================================
// POYOS - cart.js  (Carrito de compras + Mapa de entrega)
// ============================================================

let cartKey = 'poyos_cart_' + (window.currentUserId || 'guest');
let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
let deliveryMap = null;
let deliveryMarker = null;
let deliverySearchTimeout;

// -- Inicializar al cargar la página --
document.addEventListener('DOMContentLoaded', function () {
  renderCart();
});

// -- Abrir / cerrar sidebar del carrito --
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');

  // Inicializar mapa de entrega si no existe aún
  if (sidebar.classList.contains('open') && !deliveryMap) {
    setTimeout(initDeliveryMap, 100);
  }
}

// -- Mapa de dirección de entrega --
function initDeliveryMap() {
  const mapDiv = document.getElementById('deliveryMap');
  if (!mapDiv || deliveryMap) return;
  mapDiv.style.display = 'block';
  deliveryMap = L.map('deliveryMap').setView([18.4861, -69.9312], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(deliveryMap);
  deliveryMap.on('click', function (e) {
    setDeliveryMarker(e.latlng.lat, e.latlng.lng);
  });
}

function setDeliveryMarker(lat, lng) {
  if (deliveryMarker) deliveryMap.removeLayer(deliveryMarker);
  deliveryMarker = L.marker([lat, lng], { draggable: true }).addTo(deliveryMap);
  deliveryMarker.bindPopup('📍 Tu dirección de entrega').openPopup();
}

function searchDeliveryAddress() {
  clearTimeout(deliverySearchTimeout);
  const q = document.getElementById('deliveryAddress').value;
  if (q.length < 5) return;

  deliverySearchTimeout = setTimeout(function () {
    const mapDiv = document.getElementById('deliveryMap');
    if (mapDiv) mapDiv.style.display = 'block';
    if (!deliveryMap) { initDeliveryMap(); }

    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(q) + '&limit=1')
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          deliveryMap.setView([lat, lng], 16);
          setDeliveryMarker(lat, lng);
        }
      });
  }, 600);
}

// -- Agregar al carrito --
function addToCart(item) {
  // Verificar que todos los items sean del mismo restaurante
  if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
    if (!confirm('⚠️ Tu carrito tiene items de otro restaurante. ¿Deseas vaciarlo y agregar este plato?')) {
      return;
    }
    cart = [];
  }

  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart();
  renderCart();
  showCartNotification(item.name);
}

// -- Mostrar notificación rápida --
function showCartNotification(name) {
  let notif = document.getElementById('cartNotif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'cartNotif';
    notif.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 22px;border-radius:8px;font-size:0.88rem;font-weight:600;z-index:5000;transition:opacity 0.3s;';
    document.body.appendChild(notif);
  }
  notif.innerHTML = '✅ ' + name + ' agregado al carrito <button onclick="this.parentElement.style.opacity=0" style="background:none;border:none;color:white;margin-left:15px;cursor:pointer;font-weight:bold;font-size:1.1rem;">✕</button>';
  notif.style.opacity = '1';
  clearTimeout(notif._timeout);
  notif._timeout = setTimeout(() => { notif.style.opacity = '0'; }, 2200);
}

// -- Cambiar cantidad --
function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }
  saveCart();
  renderCart();
}

// -- Renderizar carrito --
function renderCart() {
  const list = document.getElementById('cartItemsList');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');

  if (!list) return;

  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  if (countEl) countEl.textContent = totalItems;
  if (totalEl) totalEl.textContent = '$' + totalPrice.toFixed(2);

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍗</div>
        <p>Tu carrito está vacío</p>
      </div>`;
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="/uploads/${item.image}" onerror="this.src='/images/tenders.png'" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div style="font-size:0.78rem; color:var(--gris-texto);">${item.restaurantName}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

// -- Confirmar pedido --
function confirmOrder() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }
  const address = document.getElementById('deliveryAddress') ? document.getElementById('deliveryAddress').value : '';
  if (!address.trim()) {
    alert('Por favor ingresa una dirección de entrega.');
    document.getElementById('deliveryAddress').focus();
    return;
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const restaurantId = cart[0].restaurantId;
  const items = cart.map(c => ({ menuItemId: c.id, quantity: c.qty, price: c.price }));

  // Tiempos de entrega aleatorios
  const deliveryTimes = [20, 35, 45];
  const deliveryTime = deliveryTimes[Math.floor(Math.random() * deliveryTimes.length)];

  const btn = document.getElementById('confirmOrderBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurantId, total, deliveryTime, deliveryAddress: address, items })
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        cart = [];
        saveCart();
        renderCart();
        toggleCart();
        showOrderModal(deliveryTime);
      } else {
        alert('Error al procesar el pedido: ' + (data.message || 'Intenta de nuevo.'));
      }
    })
    .catch(() => alert('Error de conexión. Intenta de nuevo.'))
    .finally(() => {
      if (btn) { btn.disabled = false; btn.textContent = 'Confirmar pedido'; }
    });
}

// -- Modal de pedido confirmado --
function showOrderModal(time) {
  const modal = document.getElementById('orderModal');
  const timeMsg = document.getElementById('deliveryTimeMsg');
  if (!modal) return;

  const msgs = {
    20: '⏱ ¡Rapidísimo! Tu pedido llega en 20 min 🚀',
    35: '⏱ Tu pedido llega en aproximadamente 35 min 🛵',
    45: '⏱ Estamos ocupados, pero llega en 45 min 🍗'
  };
  if (timeMsg) timeMsg.textContent = msgs[time] || '⏱ ' + time + ' minutos';

  modal.classList.add('show');
}

function closeModal() {
  document.getElementById('orderModal').classList.remove('show');
}

// -- Guardar carrito en localStorage --
function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}
