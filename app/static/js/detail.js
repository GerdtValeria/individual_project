// detail-handler.js
document.addEventListener('DOMContentLoaded', function() {
  // ==================== Глобальные переменные ====================
  let currentRentId = null;
  let currentUser = null;
  let categoriesCache = {};
  let comments = [];

  // ==================== Инициализация ====================
  initPage();

  function getRentIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[3];
  }

  async function initPage() {
    await checkAuth();
    await loadCategories();
    
    currentRentId = getRentIdFromUrl();
    if (!currentRentId) {
      showError('ID объявления не указан');
      return;
    }

    await loadRentData(currentRentId);
    await loadComments(currentRentId);
    setupEventHandlers();
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
        console.log('Категории для detail загружены');
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
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
        updateAuthButtons();
      }
    } catch (error) {
      console.log('Пользователь не авторизован');
    }
  }

  function updateAuthButtons() {
    const authDiv = document.querySelector('.auth');
    if (!authDiv) return;
    
    if (currentUser) {
      authDiv.innerHTML = `<button id="profileBtn">Профиль</button>`;
      const profileBtn = document.getElementById('profileBtn');
      if (profileBtn) {
        profileBtn.addEventListener('click', async function(e) {
          e.preventDefault();
          window.location.href = '/web/profile';
        });
      }
    } else {
      authDiv.innerHTML = `<button data-tab="signup">Зарегистрироваться</button>`;
    }
  }

  // ==================== Загрузка данных объявления ====================
  async function loadRentData(rentId) {
    try {
      const response = await fetch(`/rents/${rentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const rentData = await response.json();
        renderRentDetails(rentData);
        await checkFavoriteStatus(rentId);
      } else {
        showError('Не удалось загрузить данные объявления');
      }
    } catch (error) {
      console.error('Ошибка при загрузке объявления:', error);
      showError('Ошибка сети при загрузке объявления');
    }
  }

  function renderRentDetails(rentData) {
    const container = document.getElementById('detailCard');
    if (!container) return;

    const categoryName = categoriesCache[rentData.id_category] || 'Неизвестно';
    const imageSrc = rentData.id_image ? `/images/${rentData.id_image}` : '/static/default.jpg';

    container.innerHTML = `
      <div class="rent-detail-header">
        <img src="${imageSrc}" alt="${rentData.title}">
        <div class="rent-detail-info">
          <h1>${rentData.title || 'Без названия'}</h1>
          <div class="rent-meta">
            <span class="category">${categoryName}</span>
            <span class="address">${rentData.address || ''}</span>
          </div>
          <div class="rent-price-large">₽${rentData.price || 0}/ночь</div>
        </div>
      </div>
      <div class="rent-description">
        <p>${rentData.description || 'Описание отсутствует'}</p>
      </div>
      <div class="rent-actions">
        <button class="btn-primary">Забронировать</button>
        <button id="favoriteDetail_${rentData.id}" class="favorite">☆</button>
      </div>
    `;

    setupDetailEventHandlers(rentData);
  }

  // ==================== Комментарии ====================
  async function loadComments(rentId) {
    try {
      const response = await fetch(`/comments/?rent_id=${rentId}`);
      if (response.ok) {
        comments = await response.json();
        renderComments();
      }
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  }

  function renderComments() {
    const container = document.getElementById('commentsList');
    if (!container) return;

    if (comments.length === 0) {
      container.innerHTML = '<div class="empty-comments">Отзывов пока нет</div>';
      return;
    }

    container.innerHTML = comments.map(comment => renderCommentItem(comment)).join('');
    setupCommentHandlers();
  }

  // ==================== Избранное ====================
  async function checkFavoriteStatus(rentId) {
    if (!currentUser) return;
    try {
      const response = await fetch(`/favorites/${rentId}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const favoriteBtn = document.getElementById(`favoriteDetail_${rentId}`);
        if (favoriteBtn) {
          favoriteBtn.classList.add('active');
          favoriteBtn.textContent = '★';
        }
      }
    } catch (error) {
      console.error('Ошибка проверки избранного:', error);
    }
  }

  // ==================== Обработчики событий ====================
  function setupEventHandlers() {
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/web/';
      });
    }

    document.querySelectorAll('.top-tabs .tab[data-tab]').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const tab = this.dataset.tab;
        const navButtons = {
          'rent': '/web/rent',
          'list': '/web/list',
          'favorites': '/web/favorites'
        };
        if (navButtons[tab]) {
          window.location.href = navButtons[tab];
        }
      });
    });
  }

  function setupDetailEventHandlers(rentData) {
    const favoriteBtn = document.getElementById(`favoriteDetail_${rentData.id}`);
    if (favoriteBtn && currentUser) {
      favoriteBtn.addEventListener('click', () => toggleFavoriteDetail(rentData.id));
    }
  }

  async function toggleFavoriteDetail(rentId) {
    try {
      const method = document.getElementById(`favoriteDetail_${rentId}`).classList.contains('active') ? 'DELETE' : 'POST';
      const response = await fetch(`/favorites/${rentId}`, {
        method,
        credentials: 'include'
      });
      if (response.ok) {
        const btn = document.getElementById(`favoriteDetail_${rentId}`);
        if (method === 'POST') {
          btn.classList.add('active');
          btn.textContent = '★';
        } else {
          btn.classList.remove('active');
          btn.textContent = '☆';
        }
      }
    } catch (error) {
      console.error('Ошибка избранного:', error);
    }
  }

  function setupCommentHandlers() {
    comments.forEach(comment => {
      if (currentUser && currentUser.id === comment.user_id) {
        const editBtn = document.getElementById(`editComment_${comment.id}`);
        const deleteBtn = document.getElementById(`deleteComment_${comment.id}`);
        if (editBtn) editBtn.addEventListener('click', () => editComment(comment.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteComment(comment.id));
      }
    });

    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addNewComment();
      });
    }
  }

  function renderCommentItem(comment) {
    const isOwner = currentUser && currentUser.id === comment.user_id;
    return `
      <div class="comment-item" id="comment_${comment.id}">
        <div class="comment-header">
          <span class="comment-author">${comment.username}</span>
          <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
          ${isOwner ? `
            <div class="comment-actions">
              <button id="editComment_${comment.id}">Редактировать</button>
              <button id="deleteComment_${comment.id}">Удалить</button>
            </div>
          ` : ''}
        </div>
        <div class="comment-text">${comment.text}</div>
      </div>
    `;
  }

  async function addNewComment() {
    // Логика добавления комментария
  }

  async function editComment(commentId) {
    // Логика редактирования
  }

  async function deleteComment(commentId) {
    // Логика удаления
  }

  function showError(message) {
    const container = document.getElementById('errorContainer');
    if (container) {
      container.textContent = message;
      container.style.display = 'block';
    }
  }
});
