// static/js/rent.js

import {
  getRents,
  getCategories,
  addHelp,
  addFavorite,
  getCurrentUser
} from './api.js';

let currentUser = null;

async function init() {
  try {
    currentUser = await getCurrentUser();
  } catch (e) {
    console.error('Auth error', e);
    currentUser = null;
  }

  await loadCategories();
  await loadRents();
  initHelpBlock();
}

// Категории карточками в контейнере #categories-container
async function loadCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  container.textContent = 'Загрузка категорий...';

  try {
    const cats = await getCategories();
    container.innerHTML = '';

    if (!cats || !cats.length) {
      container.textContent = 'Категорий не найдено';
      return;
    }

    cats.forEach((cat) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'category-card';
      card.textContent = cat.name;
      card.addEventListener('click', () => {
        loadRents({ id_category: cat.id });
      });
      container.appendChild(card);
    });
  } catch (e) {
    console.error('Ошибка загрузки категорий', e);
    container.textContent = 'Ошибка загрузки категорий';
  }
}

// Объявления карточками в контейнере #rents-list
async function loadRents(filter = {}) {
  const container = document.getElementById('rents-list');
  if (!container) return;

  container.textContent = 'Загрузка объявлений...';

  try {
    const rents = await getRents(filter);
    container.innerHTML = '';

    if (!rents || !rents.length) {
      container.textContent = 'Объявлений не найдено.';
      return;
    }

    rents.forEach((rent) => {
      const card = document.createElement('div');
      card.className = 'rent-card';

      card.innerHTML = `
        <div class="rent-card__body">
          <div class="rent-card__title">${rent.address || 'Адрес не указан'}</div>
          <div class="rent-card__desc">
            ${(rent.description || 'Описание отсутствует').substring(0, 80)}...
          </div>
          <div class="rent-card__meta">
            <span class="rent-card__price">${rent.price || 0} ₽/ночь</span>
            ${rent.city ? `<span class="rent-card__city">${rent.city}</span>` : ''}
          </div>
        </div>
        <div class="rent-card__actions">
          <button class="btn secondary btn-more">Подробнее</button>
          <button class="btn icon-btn btn-fav" aria-label="Добавить в избранное">❤</button>
        </div>
      `;

      const moreBtn = card.querySelector('.btn-more');
      moreBtn.addEventListener('click', () => {
        window.location.href = `/web/rents/${rentId}`;
      });

      const favBtn = card.querySelector('.btn-fav');
      favBtn.addEventListener('click', async () => {
        if (!currentUser) {
          alert('Нужно войти в аккаунт');
          window.location.href = '/web/auth';
          return;
        }
        try {
          await addFavorite(rent.id);
          favBtn.classList.add('active');
          alert('Добавлено в избранное');
        } catch (err) {
          console.error('Ошибка добавления в избранное', err);
          alert('Не удалось добавить в избранное');
        }
      });

      container.appendChild(card);
    });
  } catch (e) {
    console.error('Ошибка загрузки объявлений', e);
    container.textContent = `Ошибка загрузки: ${e.message}`;
  }
}

// Модальное окно помощи, использующее уже существующую разметку на странице
function initHelpBlock() {
  const helpBtn = document.querySelector('[data-tab="help"]');
  const helpBlock = document.getElementById('helpBlock');
  const closeHelpBtn = document.getElementById('closeHelpBlock');
  const cancelBtn = document.getElementById('cancelHelp');
  const helpForm = document.getElementById('helpContactFormRent');

  if (!helpBtn || !helpBlock || !helpForm) return;

  function openHelp() {
    if (!currentUser) {
      alert('Нужно войти в аккаунт');
      window.location.href = '/web/auth';
      return;
    }
    helpBlock.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeHelp() {
    helpBlock.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  helpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openHelp();
  });

  if (closeHelpBtn) closeHelpBtn.addEventListener('click', closeHelp);
  if (cancelBtn) cancelBtn.addEventListener('click', closeHelp);

  helpBlock.addEventListener('click', (e) => {
    if (e.target === helpBlock) closeHelp();
  });

  helpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = helpForm.querySelector('textarea[name="message"]')?.value.trim();
    if (!message) {
      alert('Введите текст вопроса');
      return;
    }
    try {
      await addHelp(message);
      alert('Вопрос отправлен администратору');
      helpForm.reset();
      closeHelp();
    } catch (err) {
      alert('Ошибка: ' + (err.detail || err.message || 'Неизвестная ошибка'));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
});
