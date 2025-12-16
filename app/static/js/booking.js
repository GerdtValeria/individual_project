// booking-handler.js

const API_BASE_URL = window.location.origin;

// элементы
const elements = {
  logo: document.querySelector('.logo-link'),
  rentBtn: document.querySelector('[data-tab="rent"]'),
  listBtn: document.querySelector('[data-tab="list"]'),
  favoritesBtn: document.querySelector('a[href="/favorites.html"]'),
  helpBtn: document.querySelector('[data-tab="help"]'),
  profileBtn: document.querySelector('[data-tab="profile"]'),
  confirmBookingBtn: document.querySelector('#bookingForm button[type="submit"]'),
  cancelBtn: document.querySelector('a[href="/web/rent"]'),
  helpBlock: document.getElementById('helpBlock'),
  closeHelpIconBtn: document.getElementById('closeHelpBlock'),
  closeHelpBtn: document.getElementById('closeHelpBtn'),
  helpSubmitBtn: document.querySelector('#helpContactFormBooking button[type="submit"]')
};

// навигация по web-роутерам
async function navigateToRoute(route, params = {}) {
  try {
    switch (route) {
      case 'get_index_html':
        window.location.href = '/web/index';
        break;
      case 'get_rent_html':
        window.location.href = '/web/rent';
        break;
      case 'get_list_html':
        window.location.href = '/web/list';
        break;
      case 'get_favorites_html':
        window.location.href = '/web/favorites';
        break;
      case 'get_profile_html':
        window.location.href = '/web/profile';
        break;
      case 'get_detail_html':
        window.location.href = '/web/detail' + (params.id ? `?id=${params.id}` : '');
        break;
      case 'get_booking_html':
        window.location.href = '/web/booking';
        break;
      default:
        console.warn('Неизвестный роутер:', route);
    }
  } catch (e) {
    console.error('Ошибка навигации:', e);
    alert('Навигация временно недоступна. Обновите страницу.');
  }
}

// отправка бронирования в add_booking (POST /booking/)
async function submitBooking(bookingData) {
  try {
    const res = await fetch(`${API_BASE_URL}/booking/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    await res.json();
    alert('Бронирование создано!');
    await navigateToRoute('get_profile_html');
  } catch (e) {
    console.error('Ошибка при бронировании:', e);
    alert('Не удалось создать бронирование');
  }
}

// помощь
async function submitHelpQuestion(questionData) {
  try {
    const res = await fetch(`${API_BASE_URL}/help/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(questionData)
    });
    if (!res.ok) throw new Error();
    alert('Ваш вопрос отправлен!');
  } catch {
    const subject = encodeURIComponent('Поддержка — Угол Комфорта');
    const body = encodeURIComponent(`От: ${questionData.email}\n\n${questionData.message}`);
    window.location.href = `mailto:support@ugolkomforta.example?subject=${subject}&body=${body}`;
  }
}

// индикатор оплаты
async function showPaymentProcessing() {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.id = 'payment-processing-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.5);
      display:grid;place-items:center;z-index:1000;
    `;
    overlay.innerHTML = `
      <div style="background:#fff;padding:24px;border-radius:10px;box-shadow:var(--card-shadow);text-align:center">
        <h3 style="margin-bottom:8px">Обработка платежа…</h3>
        <p style="color:var(--muted);font-size:14px">В демо-версии платеж не выполняется</p>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      resolve();
    }, 1500);
  });
}

// расчёт цены в реальном времени
function setupPriceCalculator() {
  const fromInput = document.getElementById('bookingFrom');
  const toInput = document.getElementById('bookingTo');
  const ppEl = document.getElementById('pricePerNight');
  const nightsEl = document.getElementById('nightsCount');
  const totalEl = document.getElementById('totalPrice');
  const hiddenPrice = document.getElementById('pricePerNightInput');

  if (!fromInput || !toInput || !ppEl || !nightsEl || !totalEl || !hiddenPrice) return;

  // получаем цену из localStorage (записана на странице объявления) или используем дефолт
  let pricePerNight = 3000;
  const urlParams = new URLSearchParams(window.location.search);
  const rentId = urlParams.get('id');
  if (rentId) {
    try {
      const stored = JSON.parse(localStorage.getItem(`rent_${rentId}`) || 'null');
      if (stored && stored.price) pricePerNight = Number(stored.price);
    } catch {}
  }
  hiddenPrice.value = pricePerNight;

  function parseDate(v) {
    if (!v) return null;
    const d = new Date(v + 'T00:00:00');
    return isNaN(d) ? null : d;
  }

  function updatePrice() {
    const from = parseDate(fromInput.value);
    const to = parseDate(toInput.value);
    let nights = 0;
    if (from && to) {
      nights = Math.max(0, Math.round((to - from) / (1000 * 60 * 60 * 24)));
    }
    const total = nights > 0 ? pricePerNight * nights : 0;

    ppEl.textContent = `Цена: ₽${pricePerNight}/ночь`;
    nightsEl.textContent = `Ночей: ${nights || '—'}`;
    totalEl.textContent = `Итого: ${total ? '₽' + total : '— ₽'}`;
  }

  fromInput.addEventListener('change', updatePrice);
  toInput.addEventListener('change', updatePrice);
  updatePrice();
}

// обработчики
function setupEventListeners() {
  // хедер
  if (elements.logo) {
    elements.logo.addEventListener('click', e => {
      e.preventDefault();
      navigateToRoute('get_index_html');
    });
  }
  if (elements.rentBtn) {
    elements.rentBtn.addEventListener('click', e => {
      e.preventDefault();
      navigateToRoute('get_rent_html');
    });
  }
  if (elements.listBtn) {
    elements.listBtn.addEventListener('click', e => {
      e.preventDefault();
      navigateToRoute('get_list_html');
    });
  }

  // помощь
  if (elements.helpBtn && elements.helpBlock) {
    elements.helpBtn.addEventListener('click', e => {
      e.preventDefault();
      elements.helpBlock.setAttribute('aria-hidden', 'false');
      const emailInput = elements.helpBlock.querySelector('input[name="email"]');
      if (emailInput) emailInput.focus();
    });
  }
  const closeHelp = () => elements.helpBlock?.setAttribute('aria-hidden', 'true');
  if (elements.closeHelpIconBtn) {
    elements.closeHelpIconBtn.addEventListener('click', e => {
      e.preventDefault();
      closeHelp();
    });
  }
  if (elements.closeHelpBtn) {
    elements.closeHelpBtn.addEventListener('click', e => {
      e.preventDefault();
      closeHelp();
    });
  }
  if (elements.helpBlock) {
    elements.helpBlock.addEventListener('click', e => {
      if (e.target === elements.helpBlock) closeHelp();
    });
  }
  if (elements.helpSubmitBtn) {
    elements.helpSubmitBtn.addEventListener('click', async e => {
      e.preventDefault();
      const form = document.getElementById('helpContactFormBooking');
      if (!form) return;
      const fd = new FormData(form);
      const email = fd.get('email');
      const message = fd.get('message');
      if (!email || !message) {
        alert('Пожалуйста, заполните все поля');
        return;
      }
      await submitHelpQuestion({ email, message, timestamp: new Date().toISOString() });
      closeHelp();
      form.reset();
    });
  }

  // подтверждение бронирования
  if (elements.confirmBookingBtn) {
    elements.confirmBookingBtn.addEventListener('click', async e => {
      e.preventDefault();
      const form = document.getElementById('bookingForm');
      if (!form) return;
      const fd = new FormData(form);

      const from = fd.get('from');
      const to = fd.get('to');
      const guests = parseInt(fd.get('guests')) || 1;
      const pricePerNight = parseInt(fd.get('price_per_night')) || 0;

      if (!from || !to) {
        alert('Пожалуйста, выберите даты заезда и выезда');
        return;
      }
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (fromDate >= toDate) {
        alert('Дата выезда должна быть позже даты заезда');
        return;
      }

      const days = Math.max(
        1,
        Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24))
      );
      const urlParams = new URLSearchParams(window.location.search);
      const rentId = parseInt(urlParams.get('id') || '0', 10);

      // данные под SBookingAdd
      const bookingData = {
        id_rents: rentId,
        id_user: 1, // пока захардкожен; позже возьми из /auth/me
        guests,
        date_start: from,
        date_end: to,
        cost: pricePerNight * days
      };

      const originalText = elements.confirmBookingBtn.textContent;
      elements.confirmBookingBtn.textContent = 'Обработка...';
      elements.confirmBookingBtn.disabled = true;

      try {
        const paymentMethod = fd.get('payment_method');
        if (paymentMethod === 'card' || paymentMethod === 'yoomoney') {
          await showPaymentProcessing();
        }
        await submitBooking(bookingData);
      } finally {
        elements.confirmBookingBtn.textContent = originalText;
        elements.confirmBookingBtn.disabled = false;
      }
    });
  }

  // отмена
  if (elements.cancelBtn) {
    elements.cancelBtn.addEventListener('click', e => {
      e.preventDefault();
      navigateToRoute('get_rent_html');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Booking handler initialized');
  setupEventListeners();
  setupPriceCalculator();

  // автозаполнение дат завтра/послезавтра
  const fromInput = document.getElementById('bookingFrom');
  const toInput = document.getElementById('bookingTo');
  if (fromInput && toInput && !fromInput.value && !toInput.value) {
    const today = new Date();
    const tomorrow = new Date(today);
    const after = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    after.setDate(today.getDate() + 3);
    const fmt = d => d.toISOString().split('T')[0];
    fromInput.value = fmt(tomorrow);
    toInput.value = fmt(after);
  }
});

export { submitBooking };
