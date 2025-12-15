// profile.js — логика страницы профиля
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof feather !== 'undefined') feather.replace();
  
  await initializeProfile();
  setupNavigation();
  setupSearch();
  setupHelp();
});

async function initializeProfile() {
  // 1. Получаем данные текущего пользователя через /auth/me
  await loadCurrentUser();
  
  // 2. Загружаем объявления пользователя
  await loadMyRents();
  
  // 3. Загружаем бронирования пользователя
  await loadMyBookings();
  
  // 4. Обновляем кнопку авторизации
  checkUserAuth();
}

// ---------- Получение текущего пользователя через API ----------
async function loadCurrentUser() {
  try {
    const response = await fetch('/auth/me', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const user = await response.json();
      // Сохраняем в localStorage для других страниц
      localStorage.setItem('ugol_user', JSON.stringify(user));
      
      // Обновляем профиль
      updateProfileInfo(user);
      return user;
    } else {
      // Пользователь не авторизован
      localStorage.removeItem('ugol_user');
      showAuthRequired();
    }
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    localStorage.removeItem('ugol_user');
    showAuthRequired();
  }
}

function updateProfileInfo(user) {
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  
  if (nameEl) nameEl.textContent = user.name || user.email || 'Пользователь';
  if (emailEl) emailEl.textContent = user.email || '—';
}

function showAuthRequired() {
  document.getElementById('profileInfo')?.remove();
  document.getElementById('myListingsWrap')?.style.display = 'none';
  document.getElementById('myBookingsWrap')?.style.display = 'none';
  
  const main = document.querySelector('main section');
  const authMsg = document.createElement('div');
  authMsg.className = 'card';
  authMsg.style.padding = '24px';
  authMsg.style.textAlign = 'center';
  authMsg.innerHTML = `
    <h2 style="margin:0 0 12px;color:var(--primary)">Авторизуйтесь</h2>
    <p style="color:var(--muted);margin:0 0 18px">
      Для просмотра профиля, объявлений и бронирований 
      необходимо войти в аккаунт.
    </p>
    <a href="/web/auth" class="btn primary" style="display:inline-block">
      Войти в аккаунт
    </a>
  `;
  main.appendChild(authMsg);
}

// ---------- Мои объявления ----------
async function loadMyRents() {
  try {
    const user = getUserFromStorage();
    if (!user?.id) return;
    
    const response = await fetch(`/rents/?id_user=${user.id}`);
    if (response.ok) {
      const rents = await response.json();
      renderMyRents(rents);
    }
  } catch (error) {
    console.error('Ошибка загрузки объявлений:', error);
  }
}

function renderMyRents(rents) {
  const container = document.getElementById('myListings');
  const emptyMsg = document.getElementById('myListingsEmpty');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!rents?.length) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  
  if (emptyMsg) emptyMsg.style.display = 'none';
  
  rents.forEach(rent => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:grid;grid-template-columns:80px 1fr auto;gap:12px;align-items:start">
        <img src="/static/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg" 
             alt="" style="width:80px;height:60px;object-fit:cover;border-radius:8px">
        <div>
          <h3 style="font-size:16px;margin:0 0 4px">${escapeHtml(rent.title)}</h3>
          <div style="color:var(--muted);font-size:14px">${escapeHtml(rent.city || rent.address)}</div>
          <div style="margin-top:8px">₽${rent.price}/ночь</div>
        </div>
        <div style="text-align:right">
          <span class="btn" style="font-size:12px;padding:4px 8px">Редактировать</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ---------- Мои бронирования ----------
async function loadMyBookings() {
  try {
    const user = getUserFromStorage();
    if (!user?.id) return;
    
    // Пока заглушка - в реальности будет /bookings/?id_user=${user.id}
    const bookings = [];
    renderMyBookings(bookings);
  } catch (error) {
    console.error('Ошибка загрузки бронирований:', error);
  }
}

function renderMyBookings(bookings) {
  const container = document.getElementById('myBookings');
  const emptyMsg = document.getElementById('myBookingsEmpty');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!bookings?.length) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  
  if (emptyMsg) emptyMsg.style.display = 'none';
  
  bookings.forEach(booking => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr auto;gap:16px">
        <div>
          <h3 style="font-size:16px;margin:0 0 4px">${escapeHtml(booking.rent_title)}</h3>
          <div style="color:var(--muted)">${booking.from} — ${booking.to}</div>
          <div>Гостей: ${booking.guests}</div>
        </div>
        <button class="cancel-booking btn" data-id="${booking.id}" 
                style="background:var(--danger);color:white">
          Отменить
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ---------- Кнопка "Выйти" ----------
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  
  if (!confirm('Вы уверены, что хотите выйти из аккаунта?')) return;
  
  try {
    const response = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      localStorage.removeItem('ugol_user');
      window.location.href = '/web/index';
    }
  } catch (error) {
    console.error('Ошибка выхода:', error);
    // Принудительно очищаем и перенаправляем
    localStorage.removeItem('ugol_user');
    window.location.href = '/web/index';
  }
});

// ---------- Навигация и авторизация ----------
function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('ugol_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function checkUserAuth() {
  const user = getUserFromStorage();
  const signupTab = document.querySelector('.tab[data-tab="signup"]');
  
  if (!signupTab) return;
  
  if (user) {
    signupTab.textContent = 'Профиль';
    signupTab.classList.remove('primary');
  } else {
    signupTab.textContent = 'Зарегистрироваться';
    signupTab.classList.add('primary');
  }
}

function setupNavigation() {
  document.querySelector('.logo-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/web/index';
  });

  document.querySelectorAll('.top-tabs .tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const type = tab.dataset.tab;
      if (!type || type === 'signup') return;
      
      e.preventDefault();
      switch (type) {
        case 'rent': window.location.href = '/web/rent'; break;
        case 'list': window.location.href = '/web/list'; break;
        case 'favorites': window.location.href = '/web/favorites'; break;
        case 'help': openHelpModal(); break;
      }
    });
  });
}

function setupSearch() {
  const form = document.getElementById('searchForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('q')?.value.trim();
    if (q) window.location.href = `/web/rent?q=${encodeURIComponent(q)}`;
  });
}

function setupHelp() {
  // Подключается из common.js
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function openHelpModal() {
  // Реализация из common.js
}
