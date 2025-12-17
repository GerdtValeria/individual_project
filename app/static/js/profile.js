// profile.js — логика страницы профиля (только специфичная логика, навигация в common.js)

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof feather !== 'undefined') feather.replace();
  
  // common.js уже настроил навигацию, поиск и помощь
  await initializeProfile();
});

/**
 * Инициализация профиля (данные пользователя + объявления + бронирования)
 */
async function initializeProfile() {
  // 1. Загружаем данные текущего пользователя через /auth/me
  await loadCurrentUser();
  
  // 2. Загружаем объявления пользователя
  await loadMyRents();
  
  // 3. Загружаем бронирования пользователя
  await loadMyBookings();
}

/**
 * Получение текущего пользователя через API /auth/me
 */
async function loadCurrentUser() {
  try {
    const response = await fetch('/auth/me', {
      credentials: 'include',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      
      // Сохраняем в localStorage для других страниц (common.js)
      localStorage.setItem('ugol_user', JSON.stringify(user));
      
      // Обновляем информацию в профиле
      updateProfileInfo(user);
      
      // Обновляем кнопку авторизации (common.js использует localStorage)
      if (window.CommonAPI?.updateAuthButton) {
        window.CommonAPI.updateAuthButton();
      }
      
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

/**
 * Обновление информации о пользователе в профиле
 */
function updateProfileInfo(user) {
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  
  if (nameEl) {
    nameEl.textContent = user.name || user.email || 'Пользователь';
  }
  
  if (emailEl) {
    emailEl.textContent = user.email || '—';
  }
  
  // Показываем приватные секции
  document.getElementById('myListingsWrap')?.style.removeProperty('display');
  document.getElementById('myBookingsWrap')?.style.removeProperty('display');
  document.getElementById('profileInfo')?.style.removeProperty('display');
}

/**
 * Показать сообщение "нужно авторизоваться"
 */
function showAuthRequired() {
  // Скрываем приватные секции
  const privateSections = ['myListingsWrap', 'myBookingsWrap', 'profileInfo'];
  privateSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  // Показываем сообщение
  const mainSection = document.querySelector('main section');
  if (mainSection && !mainSection.querySelector('.auth-required')) {
    const authMsg = document.createElement('div');
    authMsg.className = 'card auth-required';
    authMsg.style.cssText = 'padding:24px;text-align:center;margin:24px 0';
    authMsg.innerHTML = `
      <h2 style="margin:0 0 12px;color:var(--primary);font-size:24px">Авторизуйтесь</h2>
      <p style="color:var(--muted);margin:0 0 24px;font-size:16px">
        Для просмотра профиля, объявлений и бронирований необходимо войти в аккаунт
      </p>
      <a href="/web/auth" class="btn primary" style="display:inline-block;padding:12px 24px">
        Войти в аккаунт
      </a>
    `;
    mainSection.appendChild(authMsg);
  }
}

/**
 * Загрузка объявлений пользователя
 */
async function loadMyRents() {
  try {
    const user = getUserFromStorage();
    if (!user?.id) return;
    
    const response = await fetch(`/rents/?id_user=${user.id}&active=true`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const rents = await response.json();
      renderMyRents(rents);
    }
  } catch (error) {
    console.error('Ошибка загрузки объявлений:', error);
  }
}

/**
 * Отображение объявлений пользователя
 */
function renderMyRents(rents) {
  const container = document.getElementById('myListings');
  const emptyMsg = document.getElementById('myListingsEmpty');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!rents || !Array.isArray(rents) || rents.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  
  if (emptyMsg) emptyMsg.style.display = 'none';
  
  rents.forEach(rent => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:grid;grid-template-columns:80px 1fr auto;gap:16px;align-items:start;padding:16px">
        <img src="/static/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg" 
             alt="${escapeHtml(rent.title || '')}" 
             style="width:80px;height:60px;object-fit:cover;border-radius:8px">
        <div style="flex:1">
          <h3 style="font-size:16px;margin:0 0 4px;line-height:1.3">${escapeHtml(rent.title || 'Без названия')}</h3>
          <div style="color:var(--muted);font-size:14px;margin-bottom:4px">
            ${escapeHtml(rent.city || rent.address || 'Не указан')}
          </div>
          <div style="font-weight:500;font-size:16px;color:var(--primary)">
            ₽${formatPrice(rent.price)}/ночь
          </div>
        </div>
        <div style="text-align:right">
          <a href="/web/list?edit=${rent.id}" class="btn" style="font-size:12px;padding:6px 12px">
            Редактировать
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Загрузка бронирований пользователя (заглушка)
 */
async function loadMyBookings() {
  try {
    const user = getUserFromStorage();
    if (!user?.id) return;
    
    // В реальности: fetch(`/bookings/?id_user=${user.id}`)
    // Пока заглушка
    const bookings = [];
    renderMyBookings(bookings);
  } catch (error) {
    console.error('Ошибка загрузки бронирований:', error);
  }
}

/**
 * Отображение бронирований
 */
function renderMyBookings(bookings) {
  const container = document.getElementById('myBookings');
  const emptyMsg = document.getElementById('myBookingsEmpty');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  
  if (emptyMsg) emptyMsg.style.display = 'none';
  
  bookings.forEach(booking => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;padding:16px">
        <div>
          <h3 style="font-size:16px;margin:0 0 8px">${escapeHtml(booking.rent_title || 'Жилье')}</h3>
          <div style="color:var(--muted);margin-bottom:4px">
            ${booking.from || ''} — ${booking.to || ''}
          </div>
          <div>Гостей: ${booking.guests || 1}</div>
        </div>
        <button class="btn cancel-booking" data-id="${booking.id || ''}" 
                style="background:var(--danger);color:white;padding:8px 16px">
          Отменить
        </button>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Обработчики отмены бронирования
  document.querySelectorAll('.cancel-booking').forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = this.dataset.id;
      if (bookingId && confirm('Отменить бронирование?')) {
        cancelBooking(bookingId);
      }
    });
  });
}

/**
 * Отмена бронирования (заглушка)
 */
async function cancelBooking(bookingId) {
  try {
    // В реальности: DELETE /bookings/${bookingId}
    alert('Бронирование отменено (демо)');
    await loadMyBookings(); // Перезагрузка списка
  } catch (error) {
    console.error('Ошибка отмены бронирования:', error);
  }
}

/**
 * Кнопка "Выйти" — использует роутер /auth/logout
 */
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (!confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      return;
    }
    
    try {
      // Вызов роутера logout из auth.py
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Очищаем localStorage в любом случае
      localStorage.removeItem('ugol_user');
      
      if (response.ok) {
        console.log('Успешный выход');
      }
      
      // Переход на главную
      window.location.href = '/web/';
    } catch (error) {
      console.error('Ошибка выхода:', error);
      // Принудительно очищаем и перенаправляем
      localStorage.removeItem('ugol_user');
      window.location.href = '/web/';
    }
  });
}

/**
 * Получение пользователя из localStorage (для совместимости с common.js)
 */
function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('ugol_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Форматирование цены
 */
function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(price || 0);
}

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Инициализация кнопки выхода при загрузке
setupLogout();

// Экспорт для common.js
window.ProfileAPI = {
  getUserFromStorage,
  loadCurrentUser,
  loadMyRents,
  renderMyRents
};
