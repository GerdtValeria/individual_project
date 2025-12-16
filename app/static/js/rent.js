// rent-handler.js
document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;
  let currentFavorites = new Set();
  let allRentListings = [];
  let categoriesCache = {};
  let isLoading = false;

  console.log('Rent handler initialized');
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

  // ===== категории =====
  async function loadCategories() {
    try {
      const res = await fetch('/categories/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) return [];
      const categories = await res.json();
      categoriesCache = {};
      categories.forEach(c => (categoriesCache[c.id] = c.name));
      return categories;
    } catch (e) {
      console.error('loadCategories error', e);
      return [];
    }
  }

  function initCategoryCarousel() {
    const scrollContainer = document.getElementById('categoriesScroll');
    if (!scrollContainer) return;

    if (Object.keys(categoriesCache).length === 0) {
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

    scrollContainer.innerHTML = Object.entries(categoriesCache)
      .map(([id, name], index) => {
        const color = colors[index % colors.length];
        return `
          <a class="category-card" data-category="${id}"
             style="min-width:160px;flex:0 0 auto;text-decoration:none;color:inherit;cursor:pointer">
            <div style="background:${color.bg};border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;align-items:flex-start;box-shadow:var(--card-shadow)">
              <strong style="font-size:15px;color:${color.text}">${name}</strong>
              <span style="color:var(--muted);font-size:13px">Популярные варианты</span>
            </div>
          </a>`;
      })
      .join('');

    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', e => {
        e.preventDefault();
        loadRentsByCategory(card.dataset.category);
      });
    });

    initCategoriesScroll();
  }

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

  // ===== навигация =====
  const navButtons = {
    rent: '/web/rents',
    list: '/web/list',
    help: null,
    favorites: '/web/favorites',
    signup: '/web/auth'
  };

  document.querySelectorAll('.top-tabs .tab[data-tab]').forEach(button => {
    button.addEventListener('click', e => {
      const tab = button.dataset.tab;
      if (!tab) return;
      e.preventDefault();
      if (tab === 'help') {
        openHelpBlock();
        return;
      }
      if (navButtons[tab]) window.location.href = navButtons[tab];
    });
  });

  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', e => {
      e.preventDefault();
      navigateToHome();
    });
  }

  // ===== auth =====
  async function checkAuth() {
    try {
      const res = await fetch('/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      if (res.ok) {
        currentUser = await res.json();
        updateProfileButton();
      }
    } catch {
      currentUser = null;
    }
  }

  function updateProfileButton() {
    const authDiv = document.querySelector('.auth');
    if (!authDiv) return;
    if (currentUser) {
      authDiv.innerHTML = `<button id="profileBtn" class="tab primary">Профиль</button>`;
      document.getElementById('profileBtn')?.addEventListener('click', e => {
        e.preventDefault();
        navigateToProfile();
      });
    } else {
      authDiv.innerHTML = `<a class="tab primary" href="/web/auth" data-tab="signup">Зарегистрироваться</a>`;
    }
  }

  function navigateToProfile() {
    window.location.href = '/web/profile';
  }

  // ===== избранное =====
  async function loadFavorites() {
    if (!currentUser) return;
    try {
      const res = await fetch('/favorites/', {
        method: 'GET',
        credentials: 'include'
      });
      if (res.ok) {
        const favorites = await res.json();
        currentFavorites = new Set(favorites.map(f => f.rent_id));
      }
    } catch (e) {
      console.error('Ошибка при загрузке избранного:', e);
    }
  }

  async function toggleFavorite(rentId) {
    if (!currentUser) {
      showError('Войдите в аккаунт');
      return;
    }
    try {
      const method = currentFavorites.has(rentId) ? 'DELETE' : 'POST';
      const res = await fetch(`/favorites/${rentId}`, {
        method,
        credentials: 'include'
      });
      if (res.ok) {
        if (method === 'POST') currentFavorites.add(rentId);
        else currentFavorites.delete(rentId);
        renderRentListings(allRentListings);
      }
    } catch (e) {
      console.error('Ошибка избранного:', e);
    }
  }

  // ===== загрузка объявлений =====
  async function loadAllRents() {
    if (isLoading) return;
    isLoading = true;
    try {
      const res = await fetch('/rents/?active=true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        allRentListings = await res.json();
        renderRentListings(allRentListings);
      } else {
        showError('Не удалось загрузить объявления');
      }
    } catch (e) {
      console.error('Ошибка при загрузке объявлений:', e);
      showError('Ошибка сети при загрузке объявлений');
    } finally {
      isLoading = false;
    }
  }

  async function loadRentsByCategory(categoryId) {
    if (isLoading) return;
    isLoading = true;
    try {
      const res = await fetch(`/rents/?id_category=${categoryId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const rents = await res.json();
        renderRentListings(rents);
      }
    } catch (e) {
      console.error('Ошибка при загрузке категории:', e);
    } finally {
      isLoading = false;
    }
  }

  // ===== рендер карточек =====
  function renderRentListings(rents) {
    const container = document.getElementById('rentListings');
    if (!container) return;

    if (!rents || rents.length === 0) {
      container.innerHTML =
        '<div class="empty-state">Объявлений не найдено</div>';
      return;
    }

    container.innerHTML = rents.map(r => renderRentCard(r)).join('');

    rents.forEach(rent => {
      document
        .getElementById(`details_${rent.id}`)
        ?.addEventListener('click', () => navigateToRentDetail(rent.id));
      document
        .getElementById(`favorite_${rent.id}`)
        ?.addEventListener('click', () => toggleFavorite(rent.id));
    });
  }

  function renderRentCard(rent) {
    const isFavorite = currentFavorites.has(rent.id);
    const categoryName = categoriesCache[rent.id_category] || 'Неизвестно';
    const mainPhoto =
      (rent.photos && rent.photos[0]) || rent.img || '/static/default.jpg';

    return `
      <article class="card" id="card_${rent.id}">
        <img class="thumb" src="${mainPhoto}" alt="${rent.title}">
        <div class="card-body">
          <h3 style="margin:0 0 4px;font-size:18px">${rent.title || 'Без названия'}</h3>
          <p class="desc-snippet">${rent.address || 'Адрес не указан'}</p>
          <p style="margin:0 0 4px;color:var(--muted);font-size:14px">
            ${categoryName} · ${rent.rooms || '1к'}
          </p>
          <p style="margin:0 0 8px;font-weight:700;font-size:16px">
            ₽${rent.price || 0}/ночь
          </p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">
            <button id="details_${rent.id}" class="btn small">Подробнее</button>
            <button id="favorite_${rent.id}" class="fav small-fav ${
              isFavorite ? 'active' : ''
            }" aria-pressed="${isFavorite}"></button>
          </div>
        </div>
      </article>
    `;
  }

  function navigateToRentDetail(rentId) {
    window.location.href = `/web/rents/${rentId}`;
  }

  // ===== поиск =====
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      performSearch();
    });
  }

  async function performSearch() {
    const query = document.getElementById('q')?.value || '';
    try {
      const res = await fetch(`/rents/?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const results = await res.json();
        renderRentListings(results);
      }
    } catch (e) {
      console.error('Ошибка поиска:', e);
    }
  }

  // ===== прочее =====
  function loadRecentlyViewed() {
    const viewed = JSON.parse(
      localStorage.getItem('recentlyViewed') || '[]'
    );
    console.log('recently viewed:', viewed);
  }

  function setupEventHandlers() {
    const closeHelp = document.getElementById('closeHelpBlock');
    if (closeHelp) {
      closeHelp.addEventListener('click', e => {
        e.preventDefault();
        closeHelpBlock();
      });
    }
    document.getElementById('helpBlock')?.addEventListener('click', e => {
      if (e.target.id === 'helpBlock') closeHelpBlock();
    });
  }

  function showError(message) {
    const container = document.getElementById('errorContainer');
    if (!container) return;
    container.textContent = message;
    container.style.display = 'block';
  }

  function navigateToHome() {
    window.location.href = '/web/';
  }

  function openHelpBlock() {
    const block = document.getElementById('helpBlock');
    if (!block) return;
    block.setAttribute('aria-hidden', 'false');
  }

  function closeHelpBlock() {
    const block = document.getElementById('helpBlock');
    if (!block) return;
    block.setAttribute('aria-hidden', 'true');
  }
});
