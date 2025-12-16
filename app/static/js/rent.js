// rent-handler.js
document.addEventListener('DOMContentLoaded', function() {
  // ==================== Глобальные переменные ====================
  let currentUser = null;
  let currentFavorites = new Set();
  let allRentListings = [];
  let categoriesCache = {};
  let isLoading = false;

  // ==================== Инициализация ====================
  initPage();

  async function initPage() {
    await checkAuth();
    await loadFavorites();
    await loadCategories();
    await loadAllRents();
    loadRecentlyViewed();
    setupEventHandlers();
    initCategoryCarousel();
  }

  // ==================== Загрузка категорий ====================
  async function loadCategories() {
    try {
      const response = await fetch('/categories/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const categories = await response.json();
        categoriesCache = {};
        categories.forEach(cat => {
          categoriesCache[cat.id] = cat.name;
        });
        console.log('Категории загружены:', categoriesCache);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  }

  // ==================== Навигация ====================
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', async function(e) {
      e.preventDefault();
      await navigateToHome();
    });
  }

  const navButtons = {
    'rent': null,
    'list': '/web/list',
    'help': null,
    'favorites': '/web/favorites',
    'signup': '/web/auth'
  };

  document.querySelectorAll('.top-tabs .tab[data-tab]').forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      const tab = this.dataset.tab;
      if (tab === 'help') {
        openHelpBlock();
        return;
      }
      if (navButtons[tab]) {
        try {
          window.location.href = navButtons[tab];
        } catch (error) {
          console.error('Ошибка сети:', error);
          fallbackNavigation(tab);
        }
      }
    });
  });

  const favoritesLink = document.querySelector('a[href="/favorites.html"]');
  if (favoritesLink) {
    favoritesLink.addEventListener('click', async function(e) {
      e.preventDefault();
      await navigateToFavorites();
    });
  }

  // ==================== Аутентификация ====================
  async function checkAuth() {
    try {
      const response = await fetch('/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        currentUser = await response.json();
        console.log('Пользователь авторизован:', currentUser);
        updateProfileButton();
      }
    } catch (error) {
      console.log('Пользователь не авторизован');
    }
  }

  function updateProfileButton() {
    const authDiv = document.querySelector('.auth');
    if (!authDiv) return;
    if (currentUser) {
      authDiv.innerHTML = `<button id="profileBtn">Профиль</button>`;
      const profileBtn = document.getElementById('profileBtn');
      if (profileBtn) {
        profileBtn.addEventListener('click', async function(e) {
          e.preventDefault();
          await navigateToProfile();
        });
      }
    } else {
      authDiv.innerHTML = `<button id="registerBtn">Зарегистрироваться</button>`;
      const registerBtn = document.getElementById('registerBtn');
      if (registerBtn) {
        registerBtn.addEventListener('click', async function(e) {
          e.preventDefault();
          await navigateToRegistration();
        });
      }
    }
  }

  async function navigateToProfile() {
    window.location.href = '/web/profile';
  }

  async function navigateToRegistration() {
    window.location.href = '/web/auth';
  }

  // ==================== Избранное ====================
  async function loadFavorites() {
    if (!currentUser) return;
    try {
      const response = await fetch('/favorites/', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const favorites = await response.json();
        currentFavorites = new Set(favorites.map(fav => fav.rent_id));
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранного:', error);
    }
  }

  async function toggleFavorite(rentId) {
    if (!currentUser) {
      showError('Войдите в аккаунт');
      return;
    }
    try {
      const method = currentFavorites.has(rentId) ? 'DELETE' : 'POST';
      const response = await fetch(`/favorites/${rentId}`, {
        method,
        credentials: 'include'
      });
      if (response.ok) {
        if (method === 'POST') {
          currentFavorites.add(rentId);
        } else {
          currentFavorites.delete(rentId);
        }
        renderRentListings(allRentListings);
      }
    } catch (error) {
      console.error('Ошибка избранного:', error);
    }
  }

  // ==================== Загрузка объявлений ====================
  async function loadAllRents() {
    if (isLoading) return;
    isLoading = true;
    try {
      const response = await fetch('/rents/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        allRentListings = await response.json();
        renderRentListings(allRentListings);
      } else {
        showError('Не удалось загрузить объявления');
      }
    } catch (error) {
      console.error('Ошибка при загрузке объявлений:', error);
      showError('Ошибка сети при загрузке объявлений');
    } finally {
      isLoading = false;
    }
  }

  async function loadRentsByCategory(categoryId) {
    if (isLoading) return;
    isLoading = true;
    try {
      const response = await fetch(`/rents/?id_category=${categoryId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const categoryRents = await response.json();
        renderRentListings(categoryRents);
      }
    } catch (error) {
      console.error('Ошибка при загрузке категории:', error);
    } finally {
      isLoading = false;
    }
  }

  // ==================== Карусель категорий ====================
  function initCategoryCarousel() {
    const categoriesContainer = document.querySelector('.categories-list');
    if (!categoriesContainer || Object.keys(categoriesCache).length === 0) {
      console.log('Категории не загружены');
      return;
    }

    categoriesContainer.innerHTML = Object.entries(categoriesCache)
      .map(([id, name]) => `
        <div class="category-item" data-category="${id}">
          ${name}
        </div>
      `).join('');

    document.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', () => {
        const categoryId = item.dataset.category;
        loadRentsByCategory(categoryId);
      });
    });
  }

  // ==================== Рендер карточек ====================
  function renderRentListings(rents) {
    const container = document.getElementById('rentListings');
    if (!container) return;

    if (rents.length === 0) {
      container.innerHTML = '<div class="empty-state">Объявлений не найдено</div>';
      return;
    }

    container.innerHTML = rents.map(rent => renderRentCard(rent)).join('');

    rents.forEach(rent => {
      const detailsBtn = document.getElementById(`details_${rent.id}`);
      if (detailsBtn) {
        detailsBtn.addEventListener('click', () => navigateToRentDetail(rent.id));
      }
      const favoriteBtn = document.getElementById(`favorite_${rent.id}`);
      if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => toggleFavorite(rent.id));
      }
    });
  }

  function renderRentCard(rent) {
    const isFavorite = currentFavorites.has(rent.id);
    const categoryName = categoriesCache[rent.id_category] || 'Неизвестно';
    const mainPhoto = rent.photos?.[0] || rent.img || '/static/default.jpg';

    return `
      <div class="rent-card" id="card_${rent.id}">
        <img src="${mainPhoto}" alt="${rent.title}">
        <div class="rent-info">
          <h3>${rent.title || 'Без названия'}</h3>
          <div class="rent-meta">
            <span class="category">${categoryName}</span> · ${rent.rooms || '1к'}
          </div>
          <div class="rent-price">₽${rent.price || 0}/ночь</div>
          <div class="rent-actions">
            <button id="details_${rent.id}" class="btn-primary">Подробнее</button>
            <button id="favorite_${rent.id}" class="favorite ${isFavorite ? 'active' : ''}">
              ${isFavorite ? '★' : '☆'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function navigateToRentDetail(rentId) {
    window.location.href = `/web/rent/${rentId}`;
  }

  // ==================== Поиск ====================
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      await performSearch();
    });
  }

  async function performSearch() {
    const query = document.getElementById('searchInput')?.value || '';
    try {
      const response = await fetch(`/rents/?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        renderRentListings(results);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
  }

  // ==================== Недавно просмотренные ====================
  function loadRecentlyViewed() {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    // Логика отображения
  }

  // ==================== Утилиты ====================
  function setupEventHandlers() {
    // Дополнительные обработчики
  }

  function showError(message) {
    const container = document.getElementById('errorContainer');
    if (container) {
      container.textContent = message;
      container.style.display = 'block';
    }
  }

  async function navigateToHome() {
    window.location.href = '/web/';
  }

  async function navigateToFavorites() {
    window.location.href = '/web/favorites';
  }

  function openHelpBlock() {
    // Логика помощи
  }

  function fallbackNavigation(tab) {
    window.location.href = navButtons[tab];
  }
});
