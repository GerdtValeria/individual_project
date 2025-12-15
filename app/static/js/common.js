// static/js/common.js

/**
 * Общие функции для всех страниц
 */
import { getCurrentUser, addHelp, isAdmin } from './api.js';

let commonCurrentUser = null;

document.addEventListener('DOMContentLoaded', async function () {
  try {
    commonCurrentUser = await getCurrentUser();
  } catch (e) {
    commonCurrentUser = null;
  }

  setupNavigation();
  setupSearch();
  setupHelp();

  if (typeof feather !== 'undefined') {
    feather.replace();
  }

  checkAdminRights();
});

// Настройка навигации
function setupNavigation() {
  // Логотип
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = '/web/index';
    });
  }

  // Вкладки в шапке
  document.querySelectorAll('.top-tabs .tab').forEach((tab) => {
    const tabType = tab.dataset.tab;

    // Скрываем "Мои объявления", если вдруг есть в верстке
    if (tabType === 'list') {
      tab.style.display = 'none';
      return;
    }

    // Скрываем "Профиль", если пользователь не авторизован
    if (tabType === 'profile' && !commonCurrentUser) {
      tab.style.display = 'none';
    }

    tab.addEventListener('click', function (e) {
      if (this.classList.contains('active')) return;
      e.preventDefault();

      switch (tabType) {
        case 'rent':
          window.location.href = '/web/rent';
          break;

        case 'favorites':
          if (!commonCurrentUser) {
            alert('Нужно войти в аккаунт');
            window.location.href = '/web/auth';
            return;
          }
          window.location.href = '/web/favorites';
          break;

        case 'help':
          openHelpModal();
          break;

        case 'signup':
          window.location.href = '/web/auth';
          break;

        case 'profile':
          if (!commonCurrentUser) {
            alert('Нужно войти в аккаунт');
            window.location.href = '/web/auth';
            return;
          }
          window.location.href = '/web/profile';
          break;
      }
    });
  });

  // Навигация в футере
  document.querySelectorAll('footer a[data-nav]').forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const tabType = this.dataset.nav;

      switch (tabType) {
        case 'rent':
          window.location.href = '/web/rent';
          break;

        case 'list':
          // "Мои объявления" ведут в профиль
          if (!commonCurrentUser) {
            alert('Нужно войти в аккаунт');
            window.location.href = '/web/auth';
            return;
          }
          window.location.href = '/web/profile';
          break;

        case 'favorites':
          if (!commonCurrentUser) {
            alert('Нужно войти в аккаунт');
            window.location.href = '/web/auth';
            return;
          }
          window.location.href = '/web/favorites';
          break;

        case 'help':
          openHelpModal();
          break;

        case 'home':
          window.location.href = '/web/index';
          break;

        case 'signup':
          window.location.href = '/web/auth';
          break;
      }
    });
  });
}

// Поиск (если есть форма с id="searchForm" и input id="q")
function setupSearch() {
  const searchForm = document.getElementById('searchForm');
  if (!searchForm) return;

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const query = document.getElementById('q')?.value.trim();
    if (query) {
      window.location.href = `/web/rent?q=${encodeURIComponent(query)}`;
    }
  });
}

// Настройка модального окна помощи (универсального)
function setupHelp() {
  // Создаем модальное окно, если его нет
  if (!document.getElementById('helpModal')) {
    createHelpModal();
  }

  // Кнопка помощи в футере
  const footerHelpLink = document.getElementById('footerHelpLink');
  if (footerHelpLink) {
    footerHelpLink.addEventListener('click', function (e) {
      e.preventDefault();
      openHelpModal();
    });
  }

  // Любая кнопка/ссылка с текстом "Помощь"
  document.querySelectorAll('button, a').forEach((el) => {
    if (el.textContent.trim() === 'Помощь') {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openHelpModal();
      });
    }
  });
}

// Создание универсального модального окна "Помощь"
function createHelpModal() {
  const modalHTML = `
    <div id="helpModal" class="modal-overlay" style="display:none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Помощь</h3>
          <button id="closeHelpModal" class="modal-close" aria-label="Закрыть">×</button>
        </div>
        <div class="modal-body">
          <div class="faq-section">
            <h4>Частые вопросы</h4>
            <ul>
              <li>Как забронировать жильё?</li>
              <li>Как отменить бронирование?</li>
              <li>Как связаться с хозяином?</li>
            </ul>
          </div>
          <form id="helpForm">
            <div class="form-group">
              <label for="helpMessage">Опишите ваш вопрос или проблему</label>
              <textarea id="helpMessage" rows="4" required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" id="cancelHelp" class="btn secondary">Отмена</button>
              <button type="submit" class="btn primary">Отправить</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const style = document.createElement('style');
  style.textContent = `
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-content {
      background: #fff;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 24px;
    }
    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
    .modal-body { padding: 20px; }
    .faq-section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .faq-section h4 { margin: 0 0 10px; }
    .faq-section ul { margin: 0; padding-left: 20px; }
    .faq-section li { margin-bottom: 6px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; }
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      resize: vertical;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
    }
    .btn {
      padding: 10px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }
    .btn.primary { background: #044036; color: #fff; }
    .btn.secondary { background: #f5f5f5; color: #333; }
  `;
  document.head.appendChild(style);

  const helpModal = document.getElementById('helpModal');
  const closeBtn = document.getElementById('closeHelpModal');
  const cancelBtn = document.getElementById('cancelHelp');
  const helpForm = document.getElementById('helpForm');

  if (closeBtn) closeBtn.addEventListener('click', closeHelpModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeHelpModal);
  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) closeHelpModal();
    });
  }

  if (helpForm) {
    helpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = document.getElementById('helpMessage').value.trim();
      if (!message) {
        alert('Введите текст сообщения');
        return;
      }
      try {
        await addHelp(message);
        alert('Ваш вопрос отправлен! Мы ответим вам в ближайшее время.');
        helpForm.reset();
        closeHelpModal();
      } catch (error) {
        console.error('Failed to submit help request:', error);
        alert('Ошибка при отправке вопроса. Попробуйте позже.');
      }
    });
  }
}

// Открытие/закрытие модалки помощи
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

// Проверка прав администратора
async function checkAdminRights() {
  try {
    const admin = await isAdmin();
    if (admin) addAdminFeatures();
  } catch (error) {
    console.error('Failed to check admin rights:', error);
  }
}

// Добавление пунктов меню для администратора
function addAdminFeatures() {
  const navContainer = document.querySelector('.top-tabs');
  if (!navContainer) return;

  const existingItems = navContainer.querySelectorAll('[data-tab]');
  const hasQuestions = Array.from(existingItems).some((i) => i.dataset.tab === 'questions');
  const hasUsers = Array.from(existingItems).some((i) => i.dataset.tab === 'users');

  if (!hasQuestions) {
    const questionsTab = document.createElement('button');
    questionsTab.className = 'tab';
    questionsTab.dataset.tab = 'questions';
    questionsTab.textContent = 'Вопросы';
    navContainer.appendChild(questionsTab);
    questionsTab.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/web/admin/questions';
    });
  }

  if (!hasUsers) {
    const usersTab = document.createElement('button');
    usersTab.className = 'tab';
    usersTab.dataset.tab = 'users';
    usersTab.textContent = 'Пользователи';
    navContainer.appendChild(usersTab);
    usersTab.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/web/admin/users';
    });
  }
}

// Глобальный объект при необходимости
window.Common = { openHelpModal, closeHelpModal, checkAdminRights };
