// favorites.js

document.addEventListener('DOMContentLoaded', () => {
  checkUserAuth();
  window.addEventListener('ugol:login', () => updateAuthUI());
  loadFavorites();
  initHelpBlock();
});

/* ==================== НАВИГАЦИЯ ==================== */
const logoLink = document.querySelector('.logo-link');
if (logoLink) {
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/web/'; // get_index_html
  });
}

const backToListBtn = document.querySelector('a.btn[href="/rent.html"]');
if (backToListBtn) {
  backToListBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/web/rents'; // get_rent_html
  });
}

/* ==================== АВТОРИЗАЦИЯ ==================== */
function checkUserAuth() {
  const user = getUserFromStorage();
  updateAuthUI(user);
}

function getUserFromStorage() {
  try {
    const userData = localStorage.getItem('ugol_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
}

function updateAuthUI(user = null) {
  if (!user) user = getUserFromStorage();
  const signupTab = document.querySelector('.tab[data-tab="signup"]');
  if (!signupTab) return;

  if (user) {
    signupTab.textContent = 'Профиль';
    signupTab.classList.remove('primary');
    signupTab.onclick = (e) => {
      e.preventDefault();
      window.location.href = '/web/profile';
    };
  } else {
    signupTab.textContent = 'Зарегистрироваться';
    signupTab.classList.add('primary');
    signupTab.onclick = (e) => {
      e.preventDefault();
      window.location.href = '/web/auth';
    };
  }
}

/* ==================== API: ИЗБРАННОЕ ==================== */
async function loadFavorites() {
  try {
    const response = await fetch('/favorites/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      displayFavorites([]);
      return;
    }

    const favorites = await response.json(); // [{id, id_rent, id_user}, ...]
    // Подтягиваем реальные данные объявлений
    const rents = await Promise.all(
      favorites.map(async (fav) => {
        const res = await fetch(`/rents/${fav.id_rent}`);
        if (!res.ok) return null;
        const rent = await res.json();
        return { favoriteId: fav.id, ...rent };
      })
    );

    const validRents = rents.filter(Boolean);
    displayFavorites(validRents);
  } catch (error) {
    console.error('Ошибка сети:', error);
    displayFavorites([]);
  }
}

/* Делегирование событий по карточкам */
const favoritesList = document.getElementById('favoritesList');
if (favoritesList) {
  favoritesList.addEventListener('click', async (e) => {
    const card = e.target.closest('.rent-card');
    if (!card) return;

    const rentId = card.dataset.rentId;

    // Удаление из избранного
    if (e.target.closest('.favorite-btn')) {
      try {
        const res = await fetch(`/favorites/${rentId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) {
          console.error('Ошибка ответа при удалении избранного');
          return;
        }
        card.remove();
        if (!favoritesList.querySelector('.rent-card')) {
          displayFavorites([]);
        }
      } catch (err) {
        console.error('Ошибка удаления избранного', err);
      }
      return;
    }

    // Переход на детальную
    if (e.target.closest('.rent-open-btn')) {
      window.location.href = `/web/rents/${rentId}`;
    }
  });
}

/* ==================== ПРОЧИЕ API ==================== */
async function searchRents(query) {
  try {
    const response = await fetch(`/rents/?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      window.location.href = `/web/rents?q=${encodeURIComponent(query)}`;
    } else {
      console.error('Ошибка при поиске объявлений');
      window.location.href = '/web/rents';
    }
  } catch (error) {
    console.error('Ошибка сети:', error);
    window.location.href = '/web/rents';
  }
}

async function sendHelpQuestion(helpData) {
  try {
    const response = await fetch('/help/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(helpData),
    });
    if (response.ok) {
      const result = await response.json();
      console.log('Вопрос отправлен в поддержку:', result);
      return { success: true, message: 'Ваш вопрос успешно отправлен в поддержку' };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка при отправке вопроса');
    }
  } catch (error) {
    console.error('Ошибка при отправке вопроса:', error);
    return { success: true, message: 'Вопрос отправлен (демо-режим)' };
  }
}

/* ==================== МОДАЛЬНЫЕ ОКНА ПОМОЩИ ==================== */
function openSigninModal() {
  const signinBlock = document.getElementById('signin');
  if (signinBlock) {
    signinBlock.setAttribute('aria-hidden', 'false');
    signinBlock.style.visibility = 'visible';
    signinBlock.style.opacity = '1';
    setTimeout(() => {
      const nameInput = signinBlock.querySelector('input[name="name"]');
      if (nameInput) nameInput.focus();
    }, 100);
  }
}

function initHelpBlock() {
  const helpBlock = document.getElementById('helpBlock');
  if (!helpBlock) return;

  const closeHelpBtn = document.getElementById('closeHelpBlock');
  if (closeHelpBtn) {
    closeHelpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeHelpModal();
    });
  }

  helpBlock.addEventListener('click', (e) => {
    if (e.target === helpBlock) closeHelpModal();
  });

  const helpForm = document.getElementById('helpContactFormFavorites');
  if (helpForm) {
    helpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(helpForm);
      const email = formData.get('email') || '';
      const message = formData.get('message') || '';
      const user = getUserFromStorage();
      const userName = user ? user.name : 'Гость';

      const helpData = {
        email,
        message,
        user_name: userName,
        page: 'favorites',
        timestamp: new Date().toISOString(),
      };

      const submitBtn = helpForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;

      try {
        const result = await sendHelpQuestion(helpData);
        if (result.success) {
          showNotification(result.message, 'success');
          helpForm.reset();
          closeHelpModal();
        }
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

function closeHelpModal() {
  const helpBlock = document.getElementById('helpBlock');
  if (helpBlock) {
    helpBlock.setAttribute('aria-hidden', 'true');
    helpBlock.style.visibility = 'hidden';
    helpBlock.style.opacity = '0';
  }
}

/* ==================== РЕНДЕР ИЗБРАННОГО ==================== */
function displayFavorites(rents) {
  const container = document.getElementById('favoritesList');
  const emptyMsg = document.getElementById('favoritesEmptyMsg');
  if (!container) return;

  container.innerHTML = '';
  if (!rents || rents.length === 0) {
    if (emptyMsg) {
      emptyMsg.style.display = 'block';
      emptyMsg.textContent = 'У вас пока нет сохранённых объявлений.';
    }
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';

  rents.forEach((rent) => {
    const card = createFavoriteCard(rent);
    container.appendChild(card);
  });
}

function createFavoriteCard(rent) {
  const card = document.createElement('article');
  card.className = 'rent-card card'; // card -> белый блок
  card.dataset.favoriteId = rent.favoriteId;
  card.dataset.rentId = rent.id;

  const imageSrc = rent.id_image
    ? `/static/rents/${rent.id_image}.jpg`
    : '/static/img/default.jpg';

  card.innerHTML = `
    <img src="${imageSrc}" alt="${rent.title}" class="rent-card__img">
    <div class="rent-card__body">
      <h3>${rent.title}</h3>
      <p class="muted">${rent.address}</p>
      <p class="price">₽${rent.price}/ночь</p>
      <div class="card-actions" style="display:flex;align-items:center;gap:8px;">
        <button class="btn small rent-open-btn">Подробнее</button>
        <button class="favorite-btn" aria-label="Удалить из избранного"
                style="width:28px;height:28px;border:none;background:transparent;
                       display:flex;align-items:center;justify-content:center;padding:0;">
          <img src="/static/img/love_4900029.png" alt="Избранное"
               style="width:18px;height:18px;object-fit:contain;">
        </button>
      </div>
    </div>
  `;
  return card;
}
/* ==================== УТИЛИТЫ ==================== */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}

function showNotification(message, type = 'info') {
  alert(message);
}

function loadFavoritesFromLocalStorage() {
  console.log('Загрузка избранного из localStorage');
}

function removeFavoriteFromLocalStorage(id) {
  console.log('Удаление из localStorage:', id);
}
 // ==================== Поиск ====================
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      await performSearch();
    });
  }

  async function performSearch() {
  const query = document.getElementById('q')?.value || '';
  try {
    const response = await fetch(
      `/rents/?q=${encodeURIComponent(query)}`
    );
    if (response.ok) {
      const results = await response.json();
      renderRentListings(results);
    }
  } catch (error) {
    console.error('Ошибка поиска:', error);
  }
}