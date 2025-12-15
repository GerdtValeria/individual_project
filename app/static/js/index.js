// static/js/index.js
import {
  getCurrentUser,
  getRents,
  getCategories,
  addHelp,
  logoutUser
} from './api.js';

let currentUser = null;

async function init() {
  try {
    currentUser = await getCurrentUser();
  } catch (e) {
    console.error('Auth error', e);
  }

  updateUserNav();
  initNavigation();
  initHelpBlock();
  loadPopularRents();
  loadCategories();
  initSearchForm();
}

function updateUserNav() {
  const userNav = document.getElementById('user-nav');
  if (!userNav) return;

  userNav.innerHTML = '';

  if (currentUser) {
    const profileBtn = document.createElement('a');
    profileBtn.href = '/web/profile';
    profileBtn.className = 'nav-link';
    profileBtn.textContent = `👤 ${currentUser.name}`;
    userNav.appendChild(profileBtn);

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Выход';
    logoutBtn.className = 'nav-link nav-btn';
    logoutBtn.addEventListener('click', async () => {
      try {
        await logoutUser();
        window.location.href = '/';
      } catch (e) {
        alert('Ошибка выхода: ' + e.message);
      }
    });
    userNav.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement('a');
    loginBtn.href = '/web/auth';
    loginBtn.className = 'nav-link';
    loginBtn.textContent = 'Вход / Регистрация';
    userNav.appendChild(loginBtn);
  }
}

function initNavigation() {
  // Кнопки навигации
  const rentBtn = document.getElementById('btn-rent');
  if (rentBtn) {
    rentBtn.addEventListener('click', () => window.location.href = '/web/rent');
  }

  const listBtn = document.getElementById('btn-list');
  if (listBtn) {
    listBtn.addEventListener('click', () => {
      if (!currentUser) {
        alert('Нужно войти в аккаунт');
        window.location.href = '/web/auth';
        return;
      }
      window.location.href = '/web/list';
    });
  }

  const favoritesBtn = document.getElementById('btn-favorites');
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', () => {
      if (!currentUser) {
        alert('Нужно войти в аккаунт');
        window.location.href = '/web/auth';
        return;
      }
      window.location.href = '/web/favorites';
    });
  }

  const seeAllBtn = document.getElementById('btn-see-all');
  if (seeAllBtn) {
    seeAllBtn.addEventListener('click', () => window.location.href = '/web/rent');
  }
}

function initHelpBlock() {
  const helpBtn = document.querySelector('[data-tab="help"]');
  const helpOverlay = document.getElementById('help-overlay');
  const helpCloseBtn = document.getElementById('help-close');
  const helpForm = document.getElementById('help-form');
  const cancelBtn = document.getElementById('cancelHelp');

  if (!helpBtn || !helpOverlay || !helpForm) return;

  helpBtn.addEventListener('click', () => {
    if (!currentUser) {
      alert('Нужно войти в аккаунт');
      window.location.href = '/web/auth';
      return;
    }
    helpOverlay.style.display = 'flex';
  });

  if (helpCloseBtn) {
    helpCloseBtn.addEventListener('click', () => {
      helpOverlay.style.display = 'none';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      helpOverlay.style.display = 'none';
    });
  }

  helpOverlay.addEventListener('click', (e) => {
    if (e.target === helpOverlay) {
      helpOverlay.style.display = 'none';
    }
  });

  helpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const textarea = document.getElementById('help-message');
    const content = textarea?.value.trim();

    if (!content) {
      alert('Введите текст вопроса');
      return;
    }

    try {
      await addHelp(content);
      alert('Вопрос отправлен администратору');
      textarea.value = '';
      helpOverlay.style.display = 'none';
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  });
}

async function loadPopularRents() {
  const container = document.getElementById('popular-rents');
  if (!container) return;

  container.innerHTML = '<div class="loading">Загрузка популярных предложений...</div>';

  try {
    const rents = await getRents({ size: 6 });
    container.innerHTML = '';

    if (!rents || !rents.length) {
      container.innerHTML = '<p>Популярных предложений пока нет</p>';
      return;
    }

    rents.forEach(rent => {
      const card = document.createElement('div');
      card.className = 'rent-card';
      card.innerHTML = `
        <h3>${rent.title}</h3>
        <p>${rent.address}</p>
        <p>${rent.description?.substring(0, 50) || 'Описание отсутствует'}...</p>
        <p><strong>${rent.price} ₽/ночь</strong></p>
        <button onclick="window.location.href='/web/detail?id=${rent.id}'">Подробнее</button>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = `<p>Ошибка загрузки: ${e.message}</p>`;
  }
}

async function loadCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  container.innerHTML = '<p>Загрузка...</p>';

  try {
    const cats = await getCategories();
    container.innerHTML = '';

    if (!cats || !cats.length) {
      container.innerHTML = '<p>Категорий не найдено</p>';
      return;
    }

    cats.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.innerHTML = `
        <h3>${cat.name}</h3>
        <button onclick="window.location.href='/web/rent?id_category=${cat.id}'">Смотреть</button>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = `<p>Ошибка загрузки: ${e.message}</p>`;
  }
}

function initSearchForm() {
  const searchForm = document.getElementById('search-form');
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    const q = document.getElementById('search-input')?.value;
    const category = document.getElementById('filter-category')?.value;
    const city = document.getElementById('filter-city')?.value;

    if (q) params.set('q', q);
    if (category) params.set('id_category', category);
    if (city) params.set('city', city);

    const query = params.toString();
    window.location.href = `/web/rent?${query}`;
  });
}

document.addEventListener('DOMContentLoaded', init);