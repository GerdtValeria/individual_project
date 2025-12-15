// static/js/common.js
// Общие функции для всех страниц сайта "Угол Комфорта"

let commonCurrentUser = null;

/**
 * Получение пользователя из localStorage
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
 * Обновление кнопки авторизации/профиля на всех страницах
 */
function updateAuthButton() {
  const user = getUserFromStorage();
  const signupTab = document.querySelector('.tab[data-tab="signup"]');
  
  if (!signupTab) return;
  
  if (user) {
    // Пользователь авторизован — показываем "Профиль"
    signupTab.textContent = 'Профиль';
    signupTab.classList.remove('primary');
    signupTab.onclick = (e) => {
      e.preventDefault();
      window.location.href = '/web/profile';
    };
  } else {
    // Пользователь не авторизован — показываем "Зарегистрироваться"
    signupTab.textContent = 'Зарегистрироваться';
    signupTab.classList.add('primary');
    signupTab.onclick = (e) => {
      e.preventDefault();
      window.location.href = '/web/auth';
    };
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  // Инициализация иконок
  if (typeof feather !== 'undefined') {
    feather.replace();
  }

  // Обновляем кнопку авторизации
  updateAuthButton();

  // Основная инициализация
  setupNavigation();
  setupSearch();
  setupHelp();
  checkAdminRights();
});

/**
 * Настройка навигации (единая для всех страниц)
 */
function setupNavigation() {
  // Логотип → Главная
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
    
    // Пропускаем кнопку signup (обрабатывается updateAuthButton)
    if (tabType === 'signup') return;
    
    tab.addEventListener('click', function (e) {
      if (this.classList.contains('active')) return;
      
      e.preventDefault();
      
      const user = getUserFromStorage();
      
      switch (tabType) {
        case 'rent':
          window.location.href = '/web/rent';
          break;
        case 'list':
          if (!user) {
            alert('Нужно войти в аккаунт');
            window.location.href = '/web/auth';
            return;
          }
          window.location.href = '/web/list';
          break;
        case 'favorites':
          if (!user) {
            alert('Нужно войти в аккаунт');
            window.location.href = '/web/auth';
            return;
          }
          window.location.href = '/web/favorites';
          break;
        case 'help':
          openHelpModal();
          break;
        case 'profile':
          if (!user) {
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
      const navType = this.dataset.nav;
      const user = getUserFromStorage();
      
      switch (navType) {
        case 'rent':
          window.location.href = '/web/rent';
          break;
        case 'list':
          if (!user) {
            alert('Нужно войти в аккаунт');
            window.location.href = '/web/auth';
            return;
          }
          window.location.href = '/web/profile';
          break;
        case 'favorites':
          if (!user) {
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

/**
 * Настройка поиска (единая для всех страниц)
 */
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

/**
 * Универсальное модальное окно "Помощь"
 */
function setupHelp() {
  // Кнопка помощи в футере
  const footerHelpLink = document.getElementById('footerHelpLink');
  if (footerHelpLink) {
    footerHelpLink.addEventListener('click', function (e) {
      e.preventDefault();
      openHelpModal();
    });
  }

  // Любые кнопки/ссылки с текстом "Помощь"
  document.querySelectorAll('button, a').forEach((el) => {
    if (el.textContent.trim() === 'Помощь') {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openHelpModal();
      });
    }
  });

  // Создаем модалку, если её нет
  if (!document.getElementById('helpModal')) {
    createHelpModal();
  }
}

function createHelpModal() {
  const modalHTML = `
    <div id="helpModal" class="modal-overlay" style="display:none">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Нужна помощь?</h3>
          <button id="closeHelpModal" class="modal-close" aria-label="Закрыть">×</button>
        </div>
        <div class="modal-body">
          <div class="faq-section">
            <h4>Часто задаваемые вопросы</h4>
            <ul>
              <li>Как разместить объявление? → Перейдите в раздел "Сдать в аренду"</li>
              <li>Как забронировать жилье? → Выберите объявление и заполните форму</li>
              <li>Как связаться с арендодателем? → Через чат в профиле</li>
            </ul>
          </div>
          <form id="helpForm">
            <div class="form-group">
              <label>Ваш вопрос</label>
              <textarea id="helpMessage" name="message" rows="4" 
                        placeholder="Опишите вашу проблему или вопрос..." required></textarea>
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

  // Стили
  if (!document.getElementById('help-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'help-modal-styles';
    style.textContent = `
      .modal-overlay { 
        position: fixed; inset: 0; background: rgba(0,0,0,0.5); 
        display: flex; align-items: center; justify-content: center; 
        z-index: 1000; padding: 20px; 
      }
      .modal-content { 
        background: #fff; border-radius: 12px; max-width: 500px; 
        width: 100%; max-height: 90vh; overflow-y: auto; 
      }
      .modal-header { 
        display: flex; justify-content: space-between; align-items: center; 
        padding: 20px; border-bottom: 1px solid #eee; 
      }
      .modal-header h3 { margin: 0; font-size: 24px; }
      .modal-close { 
        background: none; border: none; font-size: 24px; 
        cursor: pointer; width: 32px; height: 32px; 
        display: flex; align-items: center; justify-content: center;
      }
      .modal-body { padding: 20px; }
      .form-group { margin-bottom: 16px; }
      .form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
      .form-group textarea { 
        width: 100%; padding: 12px; border: 1px solid #ddd; 
        border-radius: 8px; resize: vertical; font-family: inherit;
      }
      .form-actions { 
        display: flex; justify-content: flex-end; gap: 12px; 
        margin-top: 20px; 
      }
      .btn { 
        padding: 10px 20px; border-radius: 8px; border: none; 
        cursor: pointer; font-size: 14px; font-weight: 500; 
        transition: all 0.2s; 
      }
      .btn.primary { background: #042018; color: white; }
      .btn.primary:hover { background: #031513; }
      .btn.secondary { 
        background: #f8f9fa; color: #666; 
      }
      .btn.secondary:hover { background: #e9ecef; }
    `;
    document.head.appendChild(style);
  }

  // Обработчики событий
  const helpModal = document.getElementById('helpModal');
  const closeBtn = document.getElementById('closeHelpModal');
  const cancelBtn = document.getElementById('cancelHelp');
  const helpForm = document.getElementById('helpForm');

  closeBtn?.addEventListener('click', closeHelpModal);
  cancelBtn?.addEventListener('click', closeHelpModal);
  
  helpModal?.addEventListener('click', (e) => {
    if (e.target === helpModal) closeHelpModal();
  });

  helpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = document.getElementById('helpMessage').value.trim();
    
    if (!message) {
      alert('Введите текст сообщения');
      return;
    }

    const submitBtn = helpForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    try {
      // Попытка отправить через API
      const user = getUserFromStorage();
      const helpData = {
        message: message,
        user_id: user?.id || null,
        page: window.location.pathname
      };

      const response = await fetch('/help/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(helpData)
      });

      if (response.ok) {
        alert('Ваш вопрос отправлен! Мы ответим вам в ближайшее время.');
      } else {
        // Fallback на email
        const subject = encodeURIComponent('Поддержка — Угол Комфорта');
        const body = encodeURIComponent(`Сообщение: ${message}\nСтраница: ${window.location.href}`);
        window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
        return;
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      // Fallback на email
      const subject = encodeURIComponent('Поддержка — Угол Комфорта');
      const body = encodeURIComponent(`Сообщение: ${message}\nСтраница: ${window.location.href}`);
      window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
      return;
    } finally {
      helpForm.reset();
      closeHelpModal();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function openHelpModal() {
  const helpModal = document.getElementById('helpModal');
  if (helpModal) {
    helpModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Фокус на textarea
    setTimeout(() => {
      const textarea = document.getElementById('helpMessage');
      textarea?.focus();
    }, 100);
  }
}

function closeHelpModal() {
  const helpModal = document.getElementById('helpModal');
  if (helpModal) {
    helpModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

/**
 * Проверка прав администратора
 */
async function checkAdminRights() {
  try {
    // Заглушка для проверки админ-прав
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

  // Проверяем, нет ли уже админских кнопок
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
    window.location.href = '/web/admin';
  });
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

// Глобальный API для других скриптов
window.CommonAPI = {
  getUserFromStorage,
  updateAuthButton,
  openHelpModal,
  closeHelpModal,
  escapeHtml
};
