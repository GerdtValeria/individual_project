// detail-handler.js - Полная версия с похожими, комментариями и избранным

// ==================== Глобальные переменные ====================
let currentRentId = null;
let currentUser = null;
let categoriesCache = {};
let comments = [];

// ==================== Инициализация ====================
document.addEventListener('DOMContentLoaded', initPage);

async function initPage() {
  await checkAuth();
  await loadCategories();
  currentRentId = getRentIdFromUrl();
  
  if (!currentRentId) {
    showError('ID объявления не указан');
    return;
  }
  
  await Promise.all([
    loadRentData(currentRentId),
    loadComments(currentRentId)
  ]);
  
  setupEventHandlers();
  setupCommentForm();
  setupCommentActions();
  setupRentButton();
  updateAuthButtons();
}

function getRentIdFromUrl() {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1]; // /web/rents/123 -> 123
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
    } else {
      currentUser = null;
      console.log('Пользователь не авторизован');
    }
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    currentUser = null;
  }
}

function updateAuthButtons() {
  const authDiv = document.getElementById('authContainer');
  if (!authDiv) return;
  
  if (currentUser) {
    authDiv.innerHTML = `
      <span style="color:var(--muted);font-size:14px">Привет, ${currentUser.username || currentUser.email}</span>
      <button id="profileBtn" class="tab primary" style="margin-left:8px">Профиль</button>
    `;
    document.getElementById('profileBtn')?.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = '/web/profile';
    });
  } else {
    authDiv.innerHTML = `
      <button class="tab primary" data-tab="signup">Войти / Регистрация</button>
    `;
    authDiv.querySelector('[data-tab="signup"]')?.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = '/web/auth';
    });
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
      await loadSimilarRents(rentData.id_category, rentId);
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
  const imageSrc = rentData.id_image ? `/images/${rentData.id_image}` : '/static/rents/';
  console.log(`rentData.id_image${rentData.id_image}`)

  document.getElementById('mainImage').src = imageSrc;
  document.getElementById('rentInfo').innerHTML = `
    <h1 style="margin:0 0 8px;font-size:28px;color:#042018">${rentData.title}</h1>
    <p style="margin:0 0 4px;color:var(--muted);font-size:16px">${rentData.address}</p>
    <p style="margin:0 0 12px;font-size:14px;color:var(--muted)">${categoryName}</p>
    <div style="font-size: 32px; font-weight: 700; color: #044036; margin-bottom: 8px;">
      ${rentData.price} ₽ / ночь
    </div>
    <p style="margin:0;font-size:16px;line-height:1.5">${rentData.description || 'Описание отсутствует'}</p>
  `;
}

// ==================== Похожие объявления ====================
async function loadSimilarRents(categoryId, excludeRentId) {
  try {
    const params = new URLSearchParams({
      id_category: categoryId,
      active: true
    });
    const response = await fetch(`/rents/?${params.toString()}`);
    if (!response.ok) return;
    
    const allRents = await response.json();
    const similarRents = allRents.filter(rent => rent.id !== Number(excludeRentId)).slice(0, 4);
    renderSimilarRents(similarRents);
  } catch (error) {
    console.error('Ошибка загрузки похожих объявлений:', error);
  }
}

function renderSimilarRents(rents) {
  const container = document.getElementById('similarRents');
  if (!container) return;
  
  if (!rents.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;text-align:center;padding:40px 0">Похожих объявлений не найдено</p>';
    return;
  }
  
  container.innerHTML = rents.map(rent => {
    const imageSrc = rent.id_image ? `/images/?rent_id=${rent.id}` : '/static/rents/';
    return `
      <article class="rent-card" data-rent-id="${rent.id}">
        <img src="${imageSrc}" alt="${rent.title}" class="rent-card__img" loading="lazy">
        <div class="rent-card__body">
          <h3 style="margin:0 0 4px;font-size:18px">${rent.title}</h3>
          <p style="margin:0 0 4px;font-size:14px;color:var(--muted)">${rent.address}</p>
          <p style="margin:0 0 12px;font-weight:700;font-size:16px">${rent.price} ₽/ночь</p>
          <div class="card-actions">
            <button class="btn small rent-open-btn">Подробнее</button>
            <button class="favorite-btn" aria-label="Добавить в избранное">
              <img src="/static/img/love_4900029.png" alt="Избранное">
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ==================== Избранное ====================
async function checkFavoriteStatus(rentId) {
  if (!currentUser) return;
  
  try {
    // Пока без проверки статуса - просто показываем кнопку
    const mainBtn = document.getElementById('favoriteMainBtn');
    if (mainBtn) {
      mainBtn.style.opacity = '1';
    }
  } catch (e) {
    console.error('Ошибка проверки избранного:', e);
  }
}

async function addToFavorites(rentId) {
  if (!currentUser) {
    window.location.href = '/web/auth';
    return;
  }
  
  try {
    const response = await fetch('/comments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_rent: Number(rentId),
        id_user: currentUser.id
      })
    });
    
    if (!response.ok) throw new Error('HTTP ' + response.status);
    
    alert('Добавлено в избранное!');
  } catch (error) {
    console.error('Ошибка добавления в избранное:', error);
    alert('Не удалось добавить в избранное');
  }
}

// ==================== Комментарии ====================
async function loadComments(rentId) {
  try {
    const response = await fetch(`/rents/${rentId}/comments`);
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
  
  if (!comments.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:14px;text-align:center;padding:40px 0">Комментариев пока нет. Будьте первым!</p>';
    return;
  }
  
  container.innerHTML = comments.map(comment => `
    <article class="comment-item" data-comment-id="${comment.id}">
      <div class="comment-header">
        <span class="comment-author">
          ${comment.username}
        </span>
      </div>
      <p class="comment-content">${escapeHtml(comment.content)}</p>
      ${currentUser && currentUser.id === comment.id_user ? `
        <div class="comment-actions">
          <button class="btn small comment-edit">Редактировать</button>
          <button class="btn small danger comment-delete">Удалить</button>
        </div>
      ` : ''}
    </article>
  `).join('');
}

function setupCommentForm() {
  const form = document.getElementById('commentForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      window.location.href = '/web/auth';
      return;
    }
    
    const textarea = document.getElementById('commentContent');
    const content = textarea.value.trim();
    
    if (content.length < 10) {
      alert('Комментарий должен содержать минимум 10 символов');
      return;
    }
    
    try {
      const response = await fetch(`/rents/${currentRentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      const newComment = await response.json();
      comments.unshift(newComment); // добавляем в начало
      renderComments();
      textarea.value = '';
      alert('Комментарий добавлен!');
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      alert('Не удалось добавить комментарий');
    }
  });
}

function setupCommentActions() {
  const container = document.getElementById('commentsList');
  if (!container) return;
  
  container.addEventListener('click', async (e) => {
    const item = e.target.closest('.comment-item');
    if (!item) return;
    
    const commentId = item.dataset.commentId;
    
    // Удаление
    if (e.target.classList.contains('comment-delete')) {
      if (!currentUser) {
        window.location.href = '/web/auth';
        return;
      }
      
      if (!confirm('Вы уверены, что хотите удалить комментарий?')) return;
      
      try {
        const response = await fetch(`/rents/${currentRentId}/comments/${commentId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('HTTP ' + response.status);
        
        comments = comments.filter(c => c.id !== Number(commentId));
        renderComments();
        alert('Комментарий удалён');
      } catch (error) {
        console.error('Ошибка удаления комментария:', error);
        alert('Не удалось удалить комментарий');
      }
      return;
    }
    
    // Редактирование
    if (e.target.classList.contains('comment-edit')) {
      if (!currentUser) {
        window.location.href = '/web/auth';
        return;
      }
      
      const existing = comments.find(c => c.id === Number(commentId));
      if (!existing) return;
      
      const newContent = prompt('Редактировать комментарий:', existing.content);
      if (!newContent || newContent.length < 10 || newContent === existing.content) return;
      
      try {
        const response = await fetch(`/rents/${currentRentId}/comments/${commentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent })
        });
        
        if (!response.ok) throw new Error('HTTP ' + response.status);
        
        existing.content = newContent;
        renderComments();
        alert('Комментарий обновлён');
      } catch (error) {
        console.error('Ошибка редактирования комментария:', error);
        alert('Не удалось обновить комментарий');
      }
    }
  });
}

// ==================== Кнопка Арендовать ====================
function setupRentButton() {
  const button = document.getElementById('rentButton');
  if (!button) return;
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      window.location.href = '/web/auth';
      return;
    }
    
    window.location.href = `/web/booking?id=${currentRentId}`;
  });
}

// ==================== Обработчики событий ====================
function setupEventHandlers() {
  // Навигация в хедере
  document.querySelectorAll('.top-tabs .tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabType = e.currentTarget.dataset.tab;
      e.preventDefault();
      
      switch(tabType) {
        case 'rent': window.location.href = '/web/rent'; break;
        case 'list': window.location.href = '/web/list'; break;
        case 'favorites': window.location.href = '/web/favorites'; break;
        case 'help': window.location.href = '/'; break;
      }
    });
  });
  
  // Логотип
  document.querySelector('.logo-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/';
  });
  
  // Похожие объявления + главное избранное
  const similarContainer = document.getElementById('similarRents');
  if (similarContainer) {
    similarContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.rent-card');
      if (!card) return;
      
      const rentId = card.dataset.rentId;
      
      if (e.target.closest('.favorite-btn')) {
        addToFavorites(rentId);
        return;
      }
      
      if (e.target.closest('.rent-open-btn')) {
        window.location.href = `/web/rents/${rentId}`;
      }
    });
  }
  
  // Главное избранное
  document.getElementById('favoriteMainBtn')?.addEventListener('click', () => {
    addToFavorites(currentRentId);
  });
}

// ==================== Вспомогательные функции ====================
function showError(message) {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `<div class="card" style="max-width:600px;margin:0 auto;padding:40px;text-align:center">
      <h2 style="color:#d32f2f">Ошибка</h2>
      <p style="color:var(--muted);font-size:16px">${message}</p>
      <a href="/web/rent" class="btn primary" style="margin-top:20px">К списку объявлений</a>
    </div>`;
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
