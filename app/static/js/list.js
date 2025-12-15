// list.js — логика страницы "Сдать в аренду"
document.addEventListener('DOMContentLoaded', () => {
  if (typeof feather !== 'undefined') feather.replace();

  setupNavigation();
  setupPostModal();
  setupSearch();
  checkUserAuth();
  initHelpBlock();
});

// ---------- Навигация ----------
function setupNavigation() {
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/web/index';
    });
  }

  document.querySelectorAll('.top-tabs .tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const type = tab.dataset.tab;
      if (!type) return;

      e.preventDefault();
      const user = getUserFromStorage();

      switch (type) {
        case 'rent':
          window.location.href = '/web/rent';
          break;
        case 'list':
          window.location.href = '/web/list';
          break;
        case 'favorites':
          window.location.href = '/web/favorites';
          break;
        case 'signup':
          if (user) window.location.href = '/web/profile';
          else window.location.href = '/web/auth';
          break;
        case 'help':
          openHelpModal();
          break;
      }
    });
  });
}

// ---------- Поиск ----------
function setupSearch() {
  const form = document.getElementById('searchForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('q')?.value.trim();
    if (q) window.location.href = `/web/rent?q=${encodeURIComponent(q)}`;
  });
}

// ---------- Модалка объявления ----------
function setupPostModal() {
  const openBtn = document.getElementById('openPostBtn');
  const cancelBtn = document.getElementById('cancelPostLocal');
  const modal = document.getElementById('postModalLocal');
  const form = document.getElementById('postFormLocal');

  if (!modal || !form) return;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      const user = getUserFromStorage();
      if (!user) {
        alert('Для добавления объявления нужно войти в аккаунт');
        window.location.href = '/web/auth';
        return;
      }
      modal.style.display = 'grid';
      modal.setAttribute('aria-hidden', 'false');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => closePostModal());
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePostModal();
  });

  form.addEventListener('submit', handleAddRent);
}

function closePostModal() {
  const modal = document.getElementById('postModalLocal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

// ---------- Отправка объявления ----------
async function handleAddRent(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const title = formData.get('title')?.toString().trim() || '';
  const city = formData.get('city')?.toString().trim() || '';
  const description = formData.get('description')?.toString().trim() || '';
  const category = formData.get('category')?.toString() || '';
  const price = parseInt(formData.get('price'), 10) || 0;
  const photo = formData.get('photo');

  if (!title || !city || !description || !category || price <= 0) {
    alert('Заполните все поля формы и укажите корректную цену');
    return;
  }

  const user = getUserFromStorage();
  if (!user) {
    alert('Для добавления объявления нужно войти');
    window.location.href = '/web/auth';
    return;
  }

  const rentPayload = {
  title,
  address: city,               // или переименуй поле во что‑то более подходящее
  description,
  price,
  id_category: Number(category),
  id_user: user.id,
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Публикация...';
  
  if (!rentRes.ok) {
  const err = await rentRes.json().catch(() => ({}));
  console.error('Ошибка создания объявления:', err);
  alert('Ошибка: ' + JSON.stringify(err));
  return;
}

  try {
    // 1. Создаём объявление
    const rentRes = await fetch('/rents/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rentPayload),
    });

    if (!rentRes.ok) {
      const err = await rentRes.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка при создании объявления');
    }

    const rent = await rentRes.json();
    const rentId = rent.id;

    // 2. Загружаем фото (если есть)
    if (photo && photo.size > 0) {
      const imgForm = new FormData();
      imgForm.append('rent_id', rentId);
      imgForm.append('image', photo);

      const imgRes = await fetch('/images/', {
        method: 'POST',
        body: imgForm,
      });

      if (!imgRes.ok) {
        console.warn('Фото не загрузилось');
      }
    }

    alert('Объявление успешно добавлено!');
    form.reset();
    closePostModal();
    setTimeout(() => {
      window.location.href = '/web/rent';
    }, 1000);
  } catch (err) {
    console.error(err);
    alert('Ошибка: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ---------- Авторизация ----------
function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('ugol_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function checkUserAuth() {
  const user = getUserFromStorage();
  const signupTab = document.querySelector('.tab[data-tab="signup"]');
  if (!signupTab) return;

  if (user) {
    signupTab.textContent = 'Профиль';
  } else {
    signupTab.textContent = 'Зарегистрироваться';
  }
}

// ---------- Помощь (простейший заглушечный вариант) ----------
function openHelpModal() {
  alert('Напишите нам, если нужна помощь по размещению объявления.');
}

function initHelpBlock() {
  const footerHelpLink = document.getElementById('footerHelpLink');
  if (footerHelpLink) {
    footerHelpLink.addEventListener('click', (e) => {
      e.preventDefault();
      openHelpModal();
    });
  }
}
