// profile.js — логика страницы профиля (только специфичная логика, навигация в common.js)

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof feather !== 'undefined') feather.replace();
  await initializeProfile();
});

async function initializeProfile() {
  await loadCurrentUser();
  await loadMyRents();
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
  }
}

/**
 * Загрузка объявлений пользователя
 */
// Замени ВСЕ функции ниже в profile.js (остальное не трогай)

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
    card.dataset.rentId = rent.id;
    card.innerHTML = `
      <div style="display:grid;grid-template-columns:80px 1fr auto;gap:16px;align-items:start;padding:16px">
        <img src="${rent.images?.image_url || '/static/rents/default.jpg'}" 
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
        <div style="text-align:right;display:flex;gap:8px;flex-direction:column">
          <button class="btn edit-rent-btn" data-rent-id="${rent.id}" style="font-size:12px;padding:6px 12px">
            Редактировать
          </button>
          <button class="btn delete-rent-btn danger" data-rent-id="${rent.id}" style="font-size:12px;padding:6px 12px">
            Удалить
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // ✅ Обработчики кнопок (только здесь!)
  container.querySelectorAll('.edit-rent-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.rentId));
  });
  
  container.querySelectorAll('.delete-rent-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteRent(btn.dataset.rentId));
  });
}

/**
 * Удаление объявления
 */
async function deleteRent(rentId) {
  if (!confirm('Удалить объявление навсегда?')) return;
  
  try {
    const response = await fetch(`/rents/${rentId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      alert('Объявление удалено!');
      await loadMyRents();
    } else {
      const error = await response.text();
      alert('Ошибка удаления: ' + error);
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Ошибка сети');
  }
}

/**
 * Открытие модального окна редактирования
 */
let currentEditRent = null;

async function openEditModal(rentId) {
  try {
    // Загружаем данные объявления
    const response = await fetch(`/rents/${rentId}`);
    if (!response.ok) throw new Error('Объявление не найдено');
    
    const rent = await response.json();
    currentEditRent = rent;
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.5); display: flex; align-items: center; 
      justify-content: center; z-index: 10000; backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
      <div class="modal-dialog" style="background: white; border-radius: 16px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <div class="modal-header" style="padding: 24px 24px 0; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0; font-size: 20px;">Редактировать "${escapeHtml(rent.title)}"</h3>
          <button id="editCancelBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 8px; border-radius: 8px;">✕</button>
        </div>
        <form id="editRentForm" style="padding: 24px;">
          <input type="hidden" name="id_category" value="${rent.id_category}">
          <input type="hidden" name="id_user" value="${rent.id_user}">
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600;">Название</label>
            <input id="editTitle" name="title" value="${escapeHtml(rent.title)}" style="width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 16px;" required>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600;">Адрес</label>
            <input id="editAddress" name="address" value="${escapeHtml(rent.address)}" style="width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 16px;" required>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600;">Цена за ночь (₽)</label>
            <input id="editPrice" name="price" type="number" min="0" value="${rent.price}" style="width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 16px;" required>
          </div>
          
          <div style="margin-bottom: 24px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600;">Описание</label>
            <textarea id="editDescription" name="description" style="width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 16px; min-height: 100px; resize: vertical;">${escapeHtml(rent.description || '')}</textarea>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" id="editCancelBtn2" class="btn" style="padding: 12px 24px; background: #f0f0f0; color: #333;">Отмена</button>
            <button type="submit" class="btn primary" style="padding: 12px 24px;">Сохранить</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    


// ✅ ДОБАВЬ ЭТИ 5 СТРОК:
    const cancelBtns = modal.querySelectorAll('#editCancelBtn, #editCancelBtn2');
    cancelBtns.forEach(btn => btn.onclick = () => modal.remove());

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

// ✅ Закрытие по ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') modal.remove();
    });
    
    
    // Закрытие по клику на фон
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    
    // Сохранение
    modal.querySelector('#editRentForm').onsubmit = async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const payload = {
        id_category: Number(formData.get('id_category')),
        id_user: Number(formData.get('id_user')),
        title: formData.get('title'),
        address: formData.get('address'),
        price: Number(formData.get('price')),
        description: formData.get('description') || ''
      };
      
      try {
        const res = await fetch(`/rents/${rentId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          modal.remove();
          alert('Объявление обновлено!');
          await loadMyRents();
        } else {
          const error = await res.text();
          alert('Ошибка сохранения: ' + error);
        }
      } catch (error) {
        console.error(error);
        alert('Ошибка сети');
      }
    };
    
  } catch (error) {
    console.error('Ошибка загрузки объявления:', error);
    alert('Объявление не найдено');
  }
}


async function loadMyBookings() {
  const user = getUserFromStorage();
  if (!user?.id) return;

  try {
    const res = await fetch('/booking/me', { credentials: 'include' });
    console.log('booking status', res.status);
    if (!res.ok) return;

    const bookings = await res.json();
    console.log('bookings', bookings);

    // Маппим только нужные поля в удобный вид
    const viewBookings = bookings.map(b => ({
    id: b.id,
    rent_title: b.rent?.title || 'Без названия',
    price: b.rent?.price ?? b.cost,        // цена за ночь из объявления
    address: b.rent?.city || b.rent?.address || 'Не указан',
    from: b.date_start,
    to: b.date_end,
    guests: b.guests,
    cost: b.total_cost || b.cost
  }));

    renderMyBookings(viewBookings);
  } catch (e) {
    console.error('Ошибка загрузки бронирований:', e);
  }
}

// Отображение бронирований
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
    card.dataset.bookingId = booking.id;

    card.innerHTML = `
      <div class="card-body">
        <h4>${escapeHtml(booking.rent_title)}</h4>
        <p>Гостей: ${booking.guests} | ${booking.from} - ${booking.to}</p>
        <p>Стоимость: ${booking.cost ?? '—'} ₽</p>
        <div style="margin-top: 16px;">
          <button class="btn cancel-booking-btn" data-booking-id="${booking.id}">
            Отменить бронирование
          </button>
        </div>
      </div>
    `;

    const cancelBtn = card.querySelector('.cancel-booking-btn');
    cancelBtn.onclick = async e => {
      e.preventDefault();
      if (confirm('Отменить бронирование?')) {
        await cancelBooking(booking.id);
      }
    };

    container.appendChild(card);
  });
}
// Функция отмены бронирования
async function cancelBooking(bookingId) {
  try {
    const response = await fetch(`/booking/${bookingId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Бронирование отменено!');
      await loadMyBookings();
    } else {
      await loadMyBookings();
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Ошибка сети');
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

function closeEditModal() {
  const modal = document.getElementById('editRentModal');
  if (modal) modal.remove();
}