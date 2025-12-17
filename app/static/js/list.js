// list.js — логика страницы "Сдать в аренду"
document.addEventListener('DOMContentLoaded', () => {
  setupPostModal();
});

// Загрузка категорий из БД
async function loadCategories() {
  const select = document.getElementById('categorySelect');
  if (!select) return;

  try {
    const res = await fetch('/categories/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      console.error('Не удалось загрузить категории');
      return;
    }

    const categories = await res.json();

    select.innerHTML = '<option value="">Выберите категорию</option>';

    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;        // id категории из БД
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Ошибка загрузки категорий:', err);
  }
}

// Отправка объявления
async function handleAddRent(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const title = (formData.get('title') || '').toString().trim();
  const city = (formData.get('city') || '').toString().trim();
  const description = (formData.get('description') || '').toString().trim();
  const categoryRaw = (formData.get('category') || '').toString().trim();
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
  if (!Number.isInteger(idCategory) || idCategory <= 0) {
    alert('Ошибка: выберите корректную категорию');
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
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Публикация...';
  }

  try {
    // 1. создаём объявление в БД
    const rentRes = await fetch('/rents/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(rentPayload),
    });

    if (!rentRes.ok) {
      console.error('Ошибка создания объявления:', await rentRes.text());
      alert('Ошибка создания объявления');
      return;
    }

    const rent = await rentRes.json();
    const rentId = rent.id;

    // 2. загружаем фото, если выбрано
    if (photo && photo.size > 0) {
      const imgForm = new FormData();
      imgForm.append('rent_id', rentId);
      imgForm.append('image', photo);

      const imgRes = await fetch('/images/', {
        method: 'POST',
        credentials: 'include',
        body: imgForm,
      });

      if (!imgRes.ok) {
        console.warn('Фото не загрузилось:', await imgRes.text());
      }
    }

    alert('Объявление успешно добавлено!');
    form.reset();
    closePostModal();
    setTimeout(() => {
      window.location.href = '/web/rents';
    }, 800);
  } catch (err) {
    console.error('Не удалось создать объявление:', err);
    alert('Не удалось создать объявление');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

// Модалка
function setupPostModal() {
  const openBtn = document.getElementById('openPostBtn');
  const cancelBtn = document.getElementById('cancelPostLocal');
  const modal = document.getElementById('postModalLocal');
  const form = document.getElementById('postFormLocal');

  if (!modal || !form) return;

  if (openBtn) {
    openBtn.addEventListener('click', async () => {
      const user = CommonAPI.getUserFromStorage();
      if (!user) {
        alert('Для добавления объявления нужно войти в аккаунт');
        window.location.href = '/web/auth';
        return;
      }

      await loadCategories(); // подгружаем категории перед показом

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
