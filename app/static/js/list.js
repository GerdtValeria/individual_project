// list-handler.js - обработчик событий для страницы list.html
document.addEventListener('DOMContentLoaded', function() {
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
  
  checkUserAuth();
  window.addEventListener('ugol:login', function() {
    updateAuthUI();
  });

  // ==================== НАВИГАЦИЯ ====================
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '/web/index';
    });
  }

  // Кнопки меню
  document.querySelectorAll('.top-tabs .tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const tabType = this.dataset.tab;
      
      switch(tabType) {
        case 'rent':
          window.location.href = '/web/rent';
          break;
        case 'favorites':
          window.location.href = '/web/favorites';
          break;
        case 'signup':
          const user = getUserFromStorage();
          if (user) {
            window.location.href = '/web/profile';
          } else {
            openSigninModal();
          }
          break;
        case 'help':
          openHelpModal();
          break;
      }
    });
  });

  // ==================== ПОИСК ====================
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchInput = document.getElementById('q');
      const searchQuery = searchInput ? searchInput.value.trim() : '';
      if (searchQuery) {
        window.location.href = `/web/rent?q=${encodeURIComponent(searchQuery)}`;
      }
    });
  }

  // ==================== МОДАЛЬНОЕ ОКНО "НОВОЕ ОБЪЯВЛЕНИЕ" ====================
  const openPostBtn = document.getElementById('openPostBtn');
  const postModal = document.getElementById('postModalLocal');
  const cancelPostBtn = document.getElementById('cancelPostLocal');
  const postForm = document.getElementById('postFormLocal');

  if (openPostBtn && postModal) {
    openPostBtn.addEventListener('click', function() {
      const user = getUserFromStorage();
      if (!user) {
        showNotification('Для добавления объявления необходимо авторизоваться', 'error');
        openSigninModal();
        return;
      }
      openModal(postModal);
    });
  }

  if (cancelPostBtn && postModal) {
    cancelPostBtn.addEventListener('click', function() {
      closeModal(postModal);
    });
  }

  if (postModal) {
    postModal.addEventListener('click', function(e) {
      if (e.target === postModal) {
        closeModal(postModal);
      }
    });
  }

  // ==================== ИСПРАВЛЕННАЯ ФОРМА ДОБАВЛЕНИЯ ОБЪЯВЛЕНИЯ ====================
  if (postForm) {
    postForm.addEventListener('submit', handleAddRent);
  }

  // ==================== БЛОК ПОМОЩИ ====================
  initHelpBlock();
});

// ==================== ОСНОВНАЯ ФУНКЦИЯ ДОБАВЛЕНИЯ ОБЪЯВЛЕНИЯ ====================
async function handleAddRent(form) {
  const formData = new FormData(form);
  const title = formData.get('title')?.trim() || '';
  const city = formData.get('city')?.trim() || '';
  const description = formData.get('description')?.trim() || '';
  const category = formData.get('category') || '';
  const price = parseInt(formData.get('price')) || 0;
  const imageFile = formData.get('photo');

  // Валидация
  if (!title) return showNotification('Введите заголовок объявления', 'error');
  if (!city) return showNotification('Введите город', 'error');
  if (!description) return showNotification('Введите описание', 'error');
  if (!category) return showNotification('Выберите категорию', 'error');
  if (price <= 0) return showNotification('Введите корректную цену', 'error');

  const user = getUserFromStorage();
  if (!user) {
    showNotification('Необходимо авторизоваться', 'error');
    openSigninModal();
    return;
  }

  const rentData = {
    title,
    city,
    description,
    category,
    price,
    user_id: user.id
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Публикация...';
  submitBtn.disabled = true;

  try {
    // 1. СОЗДАЕМ ОБЪЯВЛЕНИЕ ЧЕРЕЗ add_rent (rents.py)
    const rentResponse = await fetch('/rents/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rentData)
    });

    if (!rentResponse.ok) {
      const errorData = await rentResponse.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Ошибка при создании объявления');
    }

    const createdRent = await rentResponse.json();
    const rentId = createdRent.id;

    // 2. ЗАГРУЖАЕМ ИЗОБРАЖЕНИЕ ЧЕРЕЗ add_image (images.py)
    if (imageFile && imageFile.size > 0) {
      const imgFormData = new FormData();
      imgFormData.append('image', imageFile);
      imgFormData.append('rent_id', rentId);

      const imgResponse = await fetch('/images/', {
        method: 'POST',
        body: imgFormData
      });

      if (!imgResponse.ok) {
        const imgError = await imgResponse.json().catch(() => ({}));
        console.warn('Изображение не загружено:', imgError.detail);
        // Продолжаем без изображения
      } else {
        await imgResponse.json();
      }
    }

    // 3. УСПЕХ! НЕ ДОБАВЛЯЕМ КАРТОЧКУ НА СТРАНИЦУ
    showNotification('✅ Объявление успешно создано и сохранено в базе данных!', 'success');
    
    // Закрываем модалку и сбрасываем форму
    const modal = document.getElementById('postModalLocal');
    if (modal) closeModal(modal);
    form.reset();

    // Опционально: переход на страницу аренды через 2 секунды
    setTimeout(() => {
      window.location.href = '/web/rent';
    }, 2000);

  } catch (error) {
    console.error('Ошибка добавления объявления:', error);
    showNotification(`❌ ${error.message}`, 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function getUserFromStorage() {
  try {
    const userData = localStorage.getItem('ugol_user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
}

function checkUserAuth() {
  const user = getUserFromStorage();
  updateAuthUI(user);
}

function updateAuthUI(user = null) {
  if (!user) user = getUserFromStorage();
  const signupTab = document.querySelector('.tab[data-tab="signup"]');
  if (!signupTab) return;

  if (user) {
    signupTab.textContent = 'Профиль';
    signupTab.onclick = (e) => {
      e.preventDefault();
      window.location.href = '/web/profile';
    };
  } else {
    signupTab.textContent = 'Зарегистрироваться';
    signupTab.onclick = (e) => {
      e.preventDefault();
      openSigninModal();
    };
  }
}

function openModal(modal) {
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'grid';
}

function closeModal(modal) {
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
}

function openHelpModal() {
  let helpBlock = document.getElementById('helpBlock');
  if (!helpBlock) {
    helpBlock = createHelpBlock();
  }
  helpBlock.setAttribute('aria-hidden', 'false');
  helpBlock.style.display = 'grid';
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    padding: 16px 24px; border-radius: 8px; font-weight: 500;
    background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
    color: ${type === 'success' ? '#155724' : '#721c24'};
    border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

function openSigninModal() {
  // Реализация модалки авторизации
  alert('Авторизуйтесь для добавления объявлений');
  window.location.href = '/web/auth';
}

function initHelpBlock() {
  // Реализация помощи
  const helpBlock = document.getElementById('helpBlock');
  if (!helpBlock) return;
  
  const closeBtn = document.getElementById('closeHelpBlock');
  if (closeBtn) {
    closeBtn.onclick = () => {
      helpBlock.setAttribute('aria-hidden', 'true');
      helpBlock.style.display = 'none';
    };
  }
  
  helpBlock.onclick = (e) => {
    if (e.target === helpBlock) {
      closeBtn.click();
    }
  };
}

function createHelpBlock() {
  // Создание блока помощи динамически
  const helpBlock = document.createElement('div');
  helpBlock.id = 'helpBlock';
  helpBlock.className = 'overlay-block';
  helpBlock.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Помощь</h3>
        <button id="closeHelpBlock" aria-label="Закрыть">×</button>
      </div>
      <form id="helpContactFormList">
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Сообщение</label>
          <textarea name="message" rows="5" required></textarea>
        </div>
        <button type="submit">Отправить</button>
      </form>
    </div>
  `;
  document.body.appendChild(helpBlock);
  initHelpBlock();
  return helpBlock;
}
