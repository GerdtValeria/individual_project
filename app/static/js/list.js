// list.js — ПОЛНАЯ замена для работы с БД
document.addEventListener('DOMContentLoaded', function() {
  if (typeof feather !== 'undefined') feather.replace();
  
  setupNavigation();
  setupPostForm();
  setupHelp();
  checkUserAuth();
});

function setupNavigation() {
  // Логотип
  document.querySelector('.logo-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/web/index';
  });

  // Навигация
  document.querySelectorAll('.top-tabs .tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const type = tab.dataset.tab;
      const routes = {
        rent: '/web/rent',
        favorites: '/web/favorites',
        signup: getUserFromStorage()?.id ? '/web/profile' : null
      };
      if (routes[type]) window.location.href = routes[type];
      if (type === 'help') openHelpModal();
    });
  });

  // Поиск
  const searchForm = document.getElementById('searchForm');
  searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('q')?.value.trim();
    if (q) window.location.href = `/web/rent?q=${encodeURIComponent(q)}`;
  });
}

function setupPostForm() {
  const postForm = document.getElementById('postFormLocal');
  const postModal = document.getElementById('postModalLocal');
  const openBtn = document.getElementById('openPostBtn');

  // Открытие модалки
  openBtn?.addEventListener('click', () => {
    if (!getUserFromStorage()) {
      alert('Войдите в аккаунт');
      window.location.href = '/web/auth';
      return;
    }
    postModal.style.display = 'grid';
  });

  // Закрытие
  document.querySelector('#cancelPostLocal, #closePostLocal')?.addEventListener('click', () => {
    postModal.style.display = 'none';
    postForm.reset();
  });

  // ✅ ОСНОВНАЯ ФОРМА — РАБОТАЕТ С БД
  postForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = postForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Создание...';
    btn.disabled = true;

    try {
      // 1. Данные формы
      const fd = new FormData(postForm);
      const data = {
        title: fd.get('title'),
        city: fd.get('city'),
        description: fd.get('description'),
        category: fd.get('category'),
        price: parseInt(fd.get('price')),
        user_id: getUserFromStorage().id
      };
      
      if (!data.title?.trim() || !data.city?.trim() || !data.price || data.price <= 0) {
        throw new Error('Заполните все поля');
      }

      // 2. ✅ СОЗДАНИЕ ОБЪЯВЛЕНИЯ
      console.log('→ POST /rents/', data); // DEBUG
      const rentRes = await fetch('/rents/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      
      if (!rentRes.ok) {
        const err = await rentRes.json();
        throw new Error(err.detail || 'Ошибка сервера');
      }
      
      const rent = await rentRes.json();
      console.log('✅ Rent создан:', rent.id);

      // 3. ✅ ИЗОБРАЖЕНИЕ (если есть)
      const photo = fd.get('photo');
      if (photo?.size) {
        console.log('→ POST /images/', rent.id);
        const imgData = new FormData();
        imgData.append('rent_id', rent.id);
        imgData.append('image', photo);
        
        const imgRes = await fetch('/images/', {
          method: 'POST',
          body: imgData
        });
        
        if (!imgRes.ok) console.warn('Фото не загрузилось');
        else console.log('✅ Фото добавлено');
      }

      // 4. ✅ УСПЕХ — НЕ ДОБАВЛЯЕМ НА СТРАНИЦУ
      alert('✅ Объявление создано! Переходим к аренде...');
      postForm.reset();
      postModal.style.display = 'none';
      setTimeout(() => window.location.href = '/web/rent', 1000);

    } catch (err) {
      console.error(err);
      alert('❌ ' + err.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('ugol_user') || '{}');
  } catch {
    return null;
  }
}

function checkUserAuth() {
  const user = getUserFromStorage();
  const tab = document.querySelector('.tab[data-tab="signup"]');
  if (tab && user) tab.textContent = 'Профиль';
}

function openHelpModal() {
  alert('Помощь работает!');
}

function setupHelp() {
  document.querySelectorAll('[data-help]').forEach(el => {
    el.addEventListener('click', openHelpModal);
  });
}
