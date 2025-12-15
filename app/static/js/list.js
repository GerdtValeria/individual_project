// list.js — логика страницы "Сдать в аренду"

// Запускаем код ПОСЛЕ общего common.js
document.addEventListener('DOMContentLoaded', () => {
  // Здесь НЕТ повторного feather, навигации и поиска:
  // это уже сделано в common.js

  setupPostModal();   // только модалка объявления
});

// ---------- Отправка объявления ----------
async function handleAddRent(e) {
  e.preventDefault();
  console.log('SUBMIT WORKS');

  const form = e.target;
  const formData = new FormData(form);

  const title = (formData.get('title') || '').toString().trim();
  const city = (formData.get('city') || '').toString().trim();
  const description = (formData.get('description') || '').toString().trim();
  const categoryRaw = formData.get('category');
  const price = Number(formData.get('price')) || 0;
  const photo = formData.get('photo');

  if (!title || !city || !description || !categoryRaw || price <= 0) {
    alert('Заполните все поля формы и укажите корректную цену');
    return;
  }

  const user = CommonAPI.getUserFromStorage();
  if (!user) {
    alert('Для добавления объявления нужно войти');
    window.location.href = '/web/auth';
    return;
  }

  const idCategory = Number(categoryRaw);
  if (!Number.isInteger(idCategory)) {
    alert('Ошибка: категория должна быть числом (id категории)');
    return;
  }

  const rentPayload = {
    title,
    address: city,
    description,
    price,
    id_category: idCategory,
    id_user: user.id,
    active: true,
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Публикация...';

  try {
    // 1. Создаём объявление
    const rentRes = await fetch('/rents/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rentPayload),
    });

    if (!rentRes.ok) {
      const err = await rentRes.json().catch(() => ({}));
      console.error('Ошибка создания объявления:', err);
      alert('Ошибка создания объявления');
      return;
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
        const imgErr = await imgRes.json().catch(() => ({}));
        console.warn('Фото не загрузилось:', imgErr);
      }
    }

    alert('Объявление успешно добавлено!');
    form.reset();
    closePostModal();
    setTimeout(() => {
      window.location.href = '/web/rent';
    }, 800);
  } catch (err) {
    console.error(err);
    alert('Не удалось создать объявление');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
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
      const user = CommonAPI.getUserFromStorage();
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
