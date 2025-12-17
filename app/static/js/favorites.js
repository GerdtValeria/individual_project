// favorites.js - ПОЛНОСТЬЮ ИСПРАВЛЕНА НАВИГАЦИЯ ПО НОВЫМ РОУТЕРАМ
// Все window.location.href заменены на правильные роуты из web.py

document.addEventListener('DOMContentLoaded', function() {
  checkUserAuth();
  window.addEventListener('ugol:login', function() {
    updateAuthUI();
  });
  loadFavorites();
  initHelpBlock();
});

// ==================== НАВИГАЦИЯ ====================
const logoLink = document.querySelector('.logo-link');
if (logoLink) {
  logoLink.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = '/web/';  // get_index_html
  });
}

const backToListBtn = document.querySelector('a.btn[href="/rent.html"]');
if (backToListBtn) {
  backToListBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = '/web/rents';  // get_rent_html
  });
}

// ==================== АВТОРИЗАЦИЯ ====================
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
    signupTab.onclick = function(e) {
      e.preventDefault();
      window.location.href = '/web/profile';  // get_profile_html
    };
  } else {
    signupTab.textContent = 'Зарегистрироваться';
    signupTab.classList.add('primary');
    signupTab.onclick = function(e) {
      e.preventDefault();
      window.location.href = '/web/auth';  // get_registration_html
    };
  }
}

// ==================== ПОИСК ====================
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchInput = document.getElementById('q');
    const searchQuery = searchInput ? searchInput.value.trim() : '';
    if (searchQuery) {
      window.location.href = `/web/rents?q=${encodeURIComponent(searchQuery)}`;  // get_rent_html + query
    }
  });
}

// ==================== ФУНКЦИИ ДЛЯ РАБОТЫ С API ====================
async function loadFavorites() {
  try {
    const response = await fetch('/comments/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      const favorites = await response.json();
      console.log('Получены избранные объявления:', favorites);
      displayFavorites(favorites);
    } else {
      console.error('Ошибка при получении избранных объявлений');
      loadFavoritesFromLocalStorage();
    }
  } catch (error) {
    console.error('Ошибка сети:', error);
    loadFavoritesFromLocalStorage();
  }
}

async function removeFavorite(id) {
  try {
    const response = await fetch(`/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      const result = await response.json();
      console.log('Объявление удалено из избранного:', result);
      showNotification('Объявление удалено из избранного', 'success');
      loadFavorites();
    } else {
      throw new Error('Ошибка при удалении из избранного');
    }
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    removeFavoriteFromLocalStorage(id);
    showNotification('Объявление удалено из избранного (демо)', 'success');
    loadFavorites();
  }
}

async function searchRents(query) {
  try {
    const response = await fetch(`/rents/?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      const rents = await response.json();
      console.log('Найдены объявления по запросу:', query, rents);
      window.location.href = `/web/rents?q=${encodeURIComponent(query)}`;  // get_rent_html
    } else {
      console.error('Ошибка при поиске объявлений');
      window.location.href = '/web/rents';  // get_rent_html
    }
  } catch (error) {
    console.error('Ошибка сети:', error);
    window.location.href = '/web/rents';  // get_rent_html
  }
}

async function sendHelpQuestion(helpData) {
  try {
    const response = await fetch('/help/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(helpData)
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

// ==================== МОДАЛЬНЫЕ ОКНА ====================
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
    closeHelpBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeHelpModal();
    });
  }
  
  helpBlock.addEventListener('click', function(e) {
    if (e.target === helpBlock) {
      closeHelpModal();
    }
  });
  
  const helpForm = document.getElementById('helpContactFormFavorites');
  if (helpForm) {
    helpForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(helpForm);
      const email = formData.get('email') || '';
      const message = formData.get('message') || '';
      const user = getUserFromStorage();
      const userName = user ? user.name : 'Гость';
      
      const helpData = {
        email: email,
        message: message,
        user_name: userName,
        page: 'favorites',
        timestamp: new Date().toISOString()
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

function displayFavorites(favorites) {
  const container = document.getElementById('favoritesList');
  const emptyMsg = document.getElementById('favoritesEmptyMsg');
  if (!container) return;
  
  container.innerHTML = '';
  if (!favorites || favorites.length === 0) {
    if (emptyMsg) {
      emptyMsg.style.display = 'block';
      emptyMsg.textContent = 'У вас пока нет сохранённых объявлений.';
    }
    return;
  }
  
  if (emptyMsg) emptyMsg.style.display = 'none';
  
  favorites.forEach(favorite => {
    const card = createFavoriteCard(favorite);
    container.appendChild(card);
  });
}

function createFavoriteCard(favorite) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = favorite.id;

  const rentId = favorite.id_rent;
  const photoUrl = favorite.photo_url || '/static/img/default.jpg';

  card.innerHTML = `
    <div class="card-image">
      <img src="${photoUrl}" alt="Квартира">
    </div>
    <div class="card-body">
      <h3 class="card-title">${favorite.title || 'Квартира'}</h3>
      <p class="card-subtitle">Квартиры · ${favorite.rooms || '1к'}</p>
      <p class="card-price">₽${favorite.price || 0}/ночь</p>
      <div class="card-actions">
        <button class="btn primary details-btn" data-rent-id="${rentId}">Подробнее</button>
        <button class="favorite-btn" data-fav-id="${favorite.id}">
          <img src="/app/static/img/love_4900029.png" alt="Удалить из избранного">
        </button>
      </div>
    </div>
  `;

  // кнопка "Подробнее"
  const detailsBtn = card.querySelector('.details-btn');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', () => {
      window.location.href = `/web/rents/${rentId}`;
    });
  }

  // кнопка-сердечко
  const favBtn = card.querySelector('.favorite-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      removeFavorite(favorite.id); // дергает DELETE /comments/{id}
    });
  }

  return card;
}

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

function showNotification(message, type = 'info') {
  // Простое уведомление (реализация зависит от HTML)
  alert(message);
}

function loadFavoritesFromLocalStorage() {
  // Загрузка из localStorage как fallback
  console.log('Загрузка избранного из localStorage');
}

function removeFavoriteFromLocalStorage(id) {
  // Удаление из localStorage
  console.log('Удаление из localStorage:', id);
}
