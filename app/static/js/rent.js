// rent-handler.js
document.addEventListener('DOMContentLoaded', function () {
// ==================== Глобальные переменные ====================
let currentUser = null;
let currentFavorites = new Set();
let allRentListings = [];
let categoriesCache = {};
let isLoading = false;

// ==================== Инициализация ====================
console.log('Rent handler initialized');
initPage();

async function initPage() {
  await checkAuth();
  await loadFavorites();
  await loadCategories();      // загружаем категории
  await loadAllRents();
  loadRecentlyViewed();
  setupEventHandlers();
  initCategoryCarousel();      // рисуем после загрузки категорий
}

// ==================== Загрузка категорий ====================
async function loadCategories() {
  try {
    console.log('loadCategories called');
    const res = await fetch('/categories/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('GET /categories status', res.status);
    if (!res.ok) return [];

    const categories = await res.json();
    console.log('categories raw', categories);

    // categories.forEach(cat => {
    //   categoriesCache[cat.id] = cat.name;   // SCategoriesGet: id, name
    // });
    categoriesCache = categories;

    console.log('categoriesCache', categoriesCache);
    return categories;
  } catch (e) {
    console.error('loadCategories error', e);
    return [];
  }
} // ← обязательно закрываем функцию ЗДЕСЬ

// ==================== Карусель категорий ====================
function initCategoryCarousel() {
  const scrollContainer = document.getElementById('categoriesScroll');
  console.log('initCategoryCarousel', { scrollContainer, categoriesCache });
  if (!scrollContainer) return;

  if (categoriesCache.length === 0) {
    scrollContainer.innerHTML =
      '<span style="color:var(--muted);font-size:13px">Категорий нет</span>';
    return;
  }

  const colors = [
    { bg: '#f1f9f7', text: '#044036' },
    { bg: '#fff6f0', text: '#7a3b2b' },
    { bg: '#eef7ff', text: '#084a7a' },
    { bg: '#f5fff8', text: '#0b6b45' },
    { bg: '#fffaf4', text: '#6b4a11' }
  ];

  let categoryHTML = '';
  for (let i = 0; i < categoriesCache.length; i++) {
    const category = categoriesCache[i];
    const color = colors[i % colors.length];
    categoryHTML += `
      <a class="category-card" data-category="${category.id}"
         style="min-width:160px;flex:0 0 auto;text-decoration:none;color:inherit;cursor:pointer">
        <div style="background:${color.bg};border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;align-items:flex-start;box-shadow:var(--card-shadow)">
          <strong style="font-size:15px;color:${color.text}">${category.name}</strong>
          <span style="color:var(--muted);font-size:13px">Популярные варианты</span>
        </div>
      </a>`;
  }
  scrollContainer.innerHTML = categoryHTML;
    console.log(categoriesCache)

  // обработчики кликов по категориям
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      const categoryId = card.dataset.category;
      loadRentsByCategory(categoryId);
    });
  });

  initCategoriesScroll();  // твоя функция прокрутки как есть
}

  // ==================== Прокрутка категорий ====================
  function initCategoriesScroll() {
    const feedWrap = document.querySelector('.feed-wrap');
    const scrollContainer = document.getElementById('categoriesScroll');
    const leftArrow = feedWrap?.querySelector('.feed-arrow.left');
    const rightArrow = feedWrap?.querySelector('.feed-arrow.right');

    if (!scrollContainer || !leftArrow || !rightArrow) return;

    const scrollAmount = 180;

    leftArrow.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    scrollContainer.addEventListener('scroll', () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      leftArrow.style.opacity = scrollLeft > 0 ? '1' : '0.5';
      rightArrow.style.opacity =
        scrollLeft < scrollWidth - clientWidth ? '1' : '0.5';
    });
  }

  // ==================== Навигация ====================
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', async function (e) {
      e.preventDefault();
      await navigateToHome();
    });
  }

  const navButtons = {
    rent: null,
    list: '/web/list',
    help: null,
    favorites: '/web/favorites',
    signup: '/web/auth'
  };

  document
    .querySelectorAll('.top-tabs .tab[data-tab]')
    .forEach(button => {
      button.addEventListener('click', async function (e) {
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
    favoritesLink.addEventListener('click', async function (e) {
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
        profileBtn.addEventListener('click', async function (e) {
          e.preventDefault();
          await navigateToProfile();
        });
      }
    } else {
      authDiv.innerHTML = `<button id="registerBtn">Зарегистрироваться</button>`;
      const registerBtn = document.getElementById('registerBtn');
      if (registerBtn) {
        registerBtn.addEventListener('click', async function (e) {
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
    const user = currentUser;
    if (!user) {
      lert('Нужно войти, чтобы добавлять в избранное');
      return;
    }

    const isFav = currentFavorites.has(rentId);

    if (!isFav) {
      await fetch('/comments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_rent: rentId, id_user: user.id })
      });
      currentFavorites.add(rentId);
    } else {
      await fetch(`/comments/${rentId}`, { method: 'DELETE' });
      currentFavorites.delete(rentId);
    }

    renderRentListings(allRentListings); // перерисовать карточки с актуальным состоянием
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
        console.log(`categoryRents:${categoryRents}`)
        renderRentListings(categoryRents);
      }
    } catch (error) {
      console.error('Ошибка при загрузке категории:', error);
    } finally {
      isLoading = false;
    }
  }

  // ==================== Рендер карточек ====================
  function renderRentListings(rents) {
    const container = document.getElementById('rentListings');
    if (!container) return;

    if (rents.length === 0) {
      container.innerHTML =
        '<div class="empty-state">Объявлений не найдено</div>';
      return;
    }

    container.innerHTML = rents.map(rent => renderRentCard(rent)).join('');

    rents.forEach(rent => {
      const detailsBtn = document.getElementById(`details_${rent.id}`);
      if (detailsBtn) {
        detailsBtn.addEventListener('click', () =>
          navigateToRentDetail(rent.id)
        );
      }
      const favoriteBtn = document.getElementById(`favorite_${rent.id}`);
      if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => toggleFavorite(rent.id));
      }
    });
  }

  function renderRentCard(rent) {
    // console.log(rent)
    const isFavorite = currentFavorites.has(rent.id);
    
    const mainPhoto =
      (rent.photos && rent.photos[0]) || rent.img || '/static/img/default.jpg';

    return `
      <article class="card">
        <img src="${mainPhoto}" alt="${rent.title}" class="thumb">
        <div class="card-body">
          <h3>${rent.title || 'Без названия'}</h3>
          <p class="desc-snippet">${rent.category.name} · ${rent.rooms || '1к'}</p>
          <div class="card-footer">
            <div class="price">₽${rent.price || 0}/ночь</div>
            <div class="actions">
              <button id="details_${rent.id}" class="btn small">Подробнее</button>
              <button id="favorite_${rent.id}" class="fav small-fav ${isFavorite ? 'active' : ''}"></button>
            </div>
          </div>
        </div>
      </article>
`;
  }

  function navigateToRentDetail(rentId) {
    window.location.href = `/web/rents/${id}`;
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
    const query = document.getElementById('searchInput')?.value || '';
    try {
      const response = await fetch(
        `/rents/?search=${encodeURIComponent(query)}`
      );
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
    const viewed = JSON.parse(
      localStorage.getItem('recentlyViewed') || '[]'
    );
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
