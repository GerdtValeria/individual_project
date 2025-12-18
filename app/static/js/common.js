// common.js - ОБНОВЛЕННАЯ ВЕРСИЯ С ЕДИНЫМ РОУТИНГОМ
// static/js/common.js
let commonCurrentUser = null;

/** Роутер для всех страниц */
const ROUTES = {
  home: '/web/',
  rents: '/web/rents',
  list: '/web/list',
  favorites: '/web/favorites',
  auth: '/web/auth',
  profile: '/web/profile',
  detail: (id) => `/web/rents/${id}`,
  admin: '/web/admin'
};

/** Универсальная навигация */
function goTo(route, param = null) {
  const url = typeof ROUTES[route] === 'function' 
    ? ROUTES[route](param) 
    : ROUTES[route];
  window.location.href = url;
}

/** Получение пользователя из localStorage */
function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('ugol_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Обновление кнопки авторизации/профиля */
function updateAuthButton() {
  const user = getUserFromStorage();
  const signupTab = document.querySelector('.tab[data-tab="signup"]');
  if (!signupTab) return;
  
  if (user) {
    signupTab.textContent = 'Профиль';
    signupTab.classList.remove('primary');
    signupTab.onclick = (e) => {
      e.preventDefault();
      goTo('profile');
    };
  } else {
    signupTab.textContent = 'Зарегистрироваться';
    signupTab.classList.add('primary');
    signupTab.onclick = (e) => {
      e.preventDefault();
      goTo('auth');
    };
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
  updateAuthButton();
  setupNavigation();
  setupSearch();
  setupHelp();
  checkAdminRights();
});

/** Настройка навигации */
function setupNavigation() {
  // Логотип → Главная
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      e.preventDefault();
      goTo('home');
    });
  }

  // Вкладки в шапке
  document.querySelectorAll('.top-tabs .tab').forEach((tab) => {
    const tabType = tab.dataset.tab;
    if (tabType === 'signup') return;
    
    tab.addEventListener('click', function (e) {
      if (this.classList.contains('active')) return;
      e.preventDefault();
      const user = getUserFromStorage();
      
      switch (tabType) {
        case 'rent':
          goTo('rents');
          break;
        case 'list':
          if (!user) {
            alert('Нужно войти в аккаунт');
            goTo('auth');
            return;
          }
          goTo('list');
          break;
        case 'favorites':
          if (!user) {
            alert('Нужно войти в аккаунт');
            goTo('auth');
            return;
          }
          goTo('favorites');
          break;
        case 'help':
  if (!user) {
    alert('Нужно войти в аккаунт');
      goTo('auth');
    return;
  }
  openHelpModal();
  break;
        case 'profile':
          if (!user) {
            goTo('auth');
            return;
          }
          goTo('profile');
          break;
      }
    });
  });

  // Навигация в футере
  document.querySelectorAll('footer a[data-nav]').forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const navType = this.dataset.nav;
      const user = getUserFromStorage();
      
      switch (navType) {
        case 'rent':
          goTo('rents');
          break;
        case 'list':
          if (!user) {
            alert('Нужно войти в аккаунт');
            goTo('auth');
            return;
          }
          goTo('list');
          break;
        case 'favorites':
          if (!user) {
            alert('Нужно войти в аккаунт');
            goTo('auth');
            return;
          }
          goTo('favorites');
          break;
        case 'help':
          openHelpModal();
          break;
        case 'home':
          goTo('home');
          break;
        case 'signup':
          goTo('auth');
          break;
      }
    });
  });
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

/** Настройка помощи */
function setupHelp() {
  const footerHelpLink = document.getElementById('footerHelpLink');
  if (footerHelpLink) {
    footerHelpLink.addEventListener('click', function (e) {
      e.preventDefault();
      openHelpModal();
    });
  }
  
  document.querySelectorAll('button, a').forEach((el) => {
    if (el.textContent.trim() === 'Помощь') {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openHelpModal();
      });
    }
  });
  
  if (!document.getElementById('helpModal')) {
    createHelpModal();
  }
}

function createHelpModal() {
  // ... (остается без изменений)
}

function openHelpModal() {
  const helpModal = document.getElementById('helpModal');
  if (helpModal) {
    helpModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeHelpModal() {
  const helpModal = document.getElementById('helpModal');
  if (helpModal) {
    helpModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

async function checkAdminRights() {
  try {
    const user = getUserFromStorage();
    if (user?.role === 'admin') {
      addAdminFeatures();
    }
  } catch (error) {
    console.error('Ошибка проверки прав:', error);
  }
}

function addAdminFeatures() {
  const navContainer = document.querySelector('.top-tabs');
  if (!navContainer) return;
  
  if (navContainer.querySelector('[data-tab="admin"]')) return;
  
  const adminTab = document.createElement('button');
  adminTab.className = 'tab';
  adminTab.dataset.tab = 'admin';
  adminTab.textContent = 'Админ';
  adminTab.style.background = '#ff6b35';
  adminTab.style.color = 'white';
  navContainer.appendChild(adminTab);
  
  adminTab.addEventListener('click', (e) => {
    e.preventDefault();
    goTo('admin');
  });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>\"']/g, m => map[m]);
}

window.CommonAPI = {
  getUserFromStorage,
  updateAuthButton,
  goTo,
  ROUTES,
  openHelpModal,
  closeHelpModal,
  escapeHtml
};
