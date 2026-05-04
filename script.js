const WHATSAPP_NUMBER = '5532988445187'; // Troque pelo número real. Ex: 5532999999999
const STORE_ADDRESS = 'Av. Juiz de Fora 445, Granjas Betânia, Juiz de Fora, MG, Brasil';
const STORE_COORDS = { lat: -21.7044, lon: -43.3739 }; // fallback aproximado

const products = [
  { id: 'acai-200', category: 'acai', name: 'Ruivinho', size: '200ml', price: 10, desc: 'Ideal pra matar a vontade sem pesar no bolso.', icon: '🥤' },
  { id: 'acai-300', category: 'acai', name: 'Clássico', size: '300ml', price: 12, desc: 'O tamanho certo pra montar bem caprichado.', icon: '🍧' },
  { id: 'acai-400', category: 'acai', name: 'Granjas', size: '400ml', price: 14, desc: 'Mais espaço pra fruta, cobertura e crocância.', icon: '🫐' },
  { id: 'acai-500', category: 'acai', name: 'Betânia', size: '500ml', price: 17, desc: 'O copo forte da casa. Self-service liberado.', icon: '🍓' },
  { id: 'acai-750', category: 'acai', name: 'Ruivo Max', size: '750ml', price: 25, desc: 'Pra quem quer sair realmente satisfeito.', icon: '🍌' },
  { id: 'acai-1000', category: 'acai', name: 'Família', size: '1 litro', price: 32, desc: 'Pra dividir ou assumir a missão sozinho.', icon: '🏆' },
  { id: 'halls', category: 'extras', name: 'Halls', size: 'unidade', price: 2.5, desc: 'Extra rápido pra levar junto.', icon: '🍬' },
  { id: 'agua', category: 'bebidas', name: 'Água', size: 'garrafa', price: 2.5, desc: 'Gelada e direta ao ponto.', icon: '💧' },
  { id: 'agua-gas', category: 'bebidas', name: 'Água com gás', size: 'garrafa', price: 2.5, desc: 'Pra acompanhar o copão.', icon: '🫧' },
  { id: 'refri', category: 'bebidas', name: 'Refrigerante', size: 'lata/garrafa', price: 4, desc: 'Clássico do balcão.', icon: '🥫' },
  { id: 'monster', category: 'bebidas', name: 'Monster', size: 'lata', price: 10, desc: 'Energia pra seguir o rolê.', icon: '⚡' }
];

const groups = {
  freeAddons: ['leite em pó', 'paçoca', 'farinha de amendoim', 'granola', 'granulado de chocolate', 'disquete', 'aveia', 'Sucrilhos', 'Sucrilhos de milho', 'whey futuramente'],
  premiumAddons: ['Nutella', 'creme de ninho', 'recheio de morango', 'creme de maracujá'],
  syrups: ['calda de morango', 'calda de menta', 'calda de chocolate', 'calda de caramelo', 'calda de leite condensado', 'leite condensado'],
  fruits: ['morango', 'banana', 'uva', 'frutas frescas de época']
};

let cart = [];
let selectedCup = null;
let delivery = { km: 0, fee: 0, address: '' };

const brl = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function init() {
  setupHeader();
  setupReveal();
  setupCursorGlow();
  renderProducts('acai');
  renderIngredients();
  renderChecks();
  renderCart();
  bindEvents();
}

function setupHeader() {
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');

  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 30));

  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

function setupReveal() {
  document.querySelectorAll('.reveal[data-delay]').forEach(el => {
    el.style.setProperty('--delay', `${el.dataset.delay}ms`);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function setupCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

function renderProducts(category) {
  const grid = document.getElementById('productGrid');

  if (!grid) {
    return;
  }

  grid.innerHTML = products
    .filter(product => product.category === category)
    .map(product => `
      <article class="product-card reveal visible">
        <div class="product-art" aria-hidden="true">${product.icon}</div>
        <h3>${product.name}</h3>
        <strong>${product.size}</strong>
        <p>${product.desc}</p>
        <div class="price">${brl(product.price)}</div>
        <button class="add-btn" data-id="${product.id}" type="button">Adicionar</button>
      </article>
    `).join('');
}

function renderIngredients() {
  const cloud = document.getElementById('ingredientCloud');
  const all = [...groups.freeAddons, ...groups.syrups, ...groups.fruits];
  cloud.innerHTML = all.map(item => `<span>${item}</span>`).join('');
}

function renderChecks() {
  Object.entries(groups).forEach(([id, items]) => {
    const container = document.getElementById(id);
    container.innerHTML = items.map(item => `
      <label class="check-pill">
        <input type="checkbox" value="${item}" data-group="${id}">
        ${item}
      </label>
    `).join('');
  });
}

function bindEvents() {
  const tabs = document.querySelector('.tabs');

  if (tabs) {
    tabs.addEventListener('click', event => {
      const btn = event.target.closest('.tab');

      if (!btn) {
        return;
      }

      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });

      btn.classList.add('active');

      renderProducts(btn.dataset.category);
    });
  }

  const productGrid = document.getElementById('productGrid');

  if (productGrid) {
    productGrid.addEventListener('click', event => {
      const btn = event.target.closest('.add-btn');

      if (!btn) {
        return;
      }

      addToCart(btn.dataset.id);
    });
  }

document.getElementById('clearCart').addEventListener('click', () => {
  cart = [];
  selectedCup = null;

  document.querySelectorAll('.cup-option').forEach(button => {
    button.classList.remove('active');
  });

  document.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.checked = false;
  });

  delivery = {
    km: 0,
    fee: 0,
    address: ''
  };

  renderCart();
});

  document.getElementById('cartItems').addEventListener('click', event => {
    const btn = event.target.closest('[data-action]');

    if (!btn) {
      return;
    }

    updateCart(btn.dataset.id, btn.dataset.action);
  });

  document.getElementById('calcDelivery').addEventListener('click', calculateDelivery);

  document.getElementById('whatsappBtn').addEventListener('click', sendWhatsApp);
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else {
    const product = products.find(p => p.id === id);
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  pulseSubtotal();
}

function updateCart(id, action) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  if (action === 'plus') item.qty += 1;
  if (action === 'minus') item.qty -= 1;
  if (action === 'remove' || item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}

function getPremiumTotal() {
  return [...document.querySelectorAll('input[data-group="premiumAddons"]:checked')].length * 3;
}

function getSubtotal() {
  const cupTotal = selectedCup ? selectedCup.price : 0;
  const productsTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return cupTotal + productsTotal + getPremiumTotal();
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const subtotal = document.getElementById('subtotal');

  if (!selectedCup && !cart.length) {
    cartItems.className = 'cart-items empty';
    cartItems.textContent = 'Seu carrinho está vazio.';
  } else {
    cartItems.className = 'cart-items';

    let html = '';

    if (selectedCup) {
      html += `
        <div class="cart-row">
          <div>
            <strong>Açaí ${selectedCup.size}</strong><br>
            <small>Self-service liberado</small>
          </div>
          <div>
            <strong>${brl(selectedCup.price)}</strong>
          </div>
        </div>
      `;
    }

    html += cart.map(item => `
      <div class="cart-row">
        <div>
          <strong>${item.name} ${item.size}</strong><br>
          <small>${brl(item.price)} cada</small>
          <div class="qty">
            <button data-id="${item.id}" data-action="minus" type="button">−</button>
            <span>${item.qty}</span>
            <button data-id="${item.id}" data-action="plus" type="button">+</button>
          </div>
        </div>
        <div>
          <strong>${brl(item.price * item.qty)}</strong><br>
          <button data-id="${item.id}" data-action="remove" type="button">remover</button>
        </div>
      </div>
    `).join('');

    cartItems.innerHTML = html;
  }

  subtotal.textContent = brl(getSubtotal());
}

function pulseSubtotal() {
  const subtotal = document.getElementById('subtotal');
  subtotal.animate([
    { transform: 'scale(1)', color: '#ffbc28' },
    { transform: 'scale(1.14)', color: '#ffffff' },
    { transform: 'scale(1)', color: '#ffbc28' }
  ], { duration: 380 });
}

document.addEventListener('change', event => {
  if (event.target.matches('input[type="checkbox"]')) renderCart();
});

async function calculateDelivery() {
  const addressInput = document.getElementById('address');
  const manualKmInput = document.getElementById('manualKm');
  const result = document.getElementById('deliveryResult');
  const manualKm = Number(manualKmInput.value);

  result.textContent = 'Calculando entrega...';

  try {
    let km = 0;
    if (manualKm > 0) {
      km = manualKm;
    } else {
      const address = addressInput.value.trim();
      if (!address) throw new Error('Digite um endereço ou informe a distância manual.');
      const coords = await geocode(`${address}, Juiz de Fora, MG, Brasil`);
      km = haversineKm(STORE_COORDS, coords) * 1.25; // fator simples para aproximar rota de rua
    }

    const fee = calculateFee(km);
    delivery = { km, fee, address: addressInput.value.trim() };
    const total = getSubtotal() + fee;

    result.innerHTML = `
      <strong>Distância estimada:</strong> ${km.toFixed(1).replace('.', ',')} km<br>
      <strong>Entrega estimada:</strong> ${brl(fee)}<br>
      <strong>Total com pedido:</strong> ${brl(total)}<br>
      <small>Estimativa própria do site. Para produção, conecte uma API oficial de entregas.</small>
    `;
  } catch (error) {
    result.innerHTML = `Não consegui calcular automaticamente. ${error.message}<br>Use o campo de distância manual em km.`;
  }
}

function calculateFee(km) {
  if (km <= 1.5) return 5;
  return Math.ceil(5 + km * 2.2);
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) throw new Error('Serviço de mapa indisponível.');
  const data = await response.json();
  if (!data.length) throw new Error('Endereço não encontrado.');
  return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(value) {
  return value * Math.PI / 180;
}

function selectedValues(group) {
  return [...document.querySelectorAll(`input[data-group="${group}"]:checked`)].map(input => input.value);
}

function sendWhatsApp() {
  if (!selectedCup) {
    alert('Escolha o tamanho do copo antes de enviar o pedido.');
    return;
  }

  const name = document.getElementById('customerName').value.trim() || 'Cliente';
  const notes = document.getElementById('orderNotes').value.trim();
  const address = document.getElementById('address').value.trim();
  const items = cart.map(item => `• ${item.qty}x ${item.name} ${item.size} - ${brl(item.price * item.qty)}`).join('\n');
  const cup = selectedCup
  ? `• Açaí ${selectedCup.size} - ${brl(selectedCup.price)}`
  : '';
  const free = selectedValues('freeAddons');
  const premium = selectedValues('premiumAddons');
  const syrups = selectedValues('syrups');
  const fruits = selectedValues('fruits');
  const total = getSubtotal() + delivery.fee;

  const message = `Olá! Quero fazer um pedido no Açaí do Ruivo.\n\nNome: ${name}\n\nPedido:\n${cup}${items ? '\n' + items : ''}\n\nComplementos inclusos: ${free.length ? free.join(', ') : 'não selecionado'}\nPremium (+R$3): ${premium.length ? premium.join(', ') : 'nenhum'}\nCoberturas: ${syrups.length ? syrups.join(', ') : 'não selecionado'}\nFrutas: ${fruits.length ? fruits.join(', ') : 'não selecionado'}\n\nSubtotal: ${brl(getSubtotal())}\nEntrega: ${delivery.fee ? brl(delivery.fee) : 'a calcular'}\nTotal estimado: ${brl(total)}\n\nEndereço: ${address || 'retirada ou informar no WhatsApp'}\nObservações: ${notes || 'nenhuma'}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}


document.querySelectorAll(".cup-option").forEach(btn => {
  btn.addEventListener("click", () => {

    // remove seleção anterior
    document.querySelectorAll(".cup-option").forEach(b => {
      b.classList.remove("active");
    });

    // marca o clicado
    btn.classList.add("active");

    // salva o copo selecionado
    selectedCup = {
      size: btn.dataset.size,
      price: parseFloat(btn.dataset.price)
    };

    console.log("Copo selecionado:", selectedCup);

    renderCart();
    pulseSubtotal();
  });
});

init();
