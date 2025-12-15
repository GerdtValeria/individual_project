// static/js/admin-categories.js
import { 
  getCurrentUser, 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from './api.js';

async function init() {
  let user;
  try {
    user = await getCurrentUser();
    if (!user || user.role_id !== 2) {
      alert('Доступ запрещен');
      window.location.href = '/';
      return;
    }
  } catch (e) {
    window.location.href = '/';
  }

  await loadCategories();
  initAddForm();
}

async function loadCategories() {
  const tbody = document.getElementById('categories-tbody');
  if (!tbody) {
    console.error('Element #categories-tbody not found');
    return;
  }

  try {
    const categories = await getCategories();
    tbody.innerHTML = '';

    if (!categories || !categories.length) {
      tbody.innerHTML = '<tr><td colspan="3">Категорий пока нет</td></tr>';
      return;
    }

    categories.forEach(cat => {
      const tr = document.createElement('tr');

      const idTd = document.createElement('td');
      idTd.textContent = cat.id;

      const nameTd = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'text';
      input.value = cat.name || '';
      input.className = 'category-input';
      nameTd.appendChild(input);

      const actionsTd = document.createElement('td');
      actionsTd.className = 'actions-cell';
      
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Сохранить';
      saveBtn.className = 'btn-small btn-save';
      saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        try {
          await updateCategory(cat.id, input.value);
          alert('Категория обновлена');
          await loadCategories();
        } catch (e) {
          alert('Ошибка: ' + (e.detail || e.message || 'Неизвестная ошибка'));
        } finally {
          saveBtn.disabled = false;
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Удалить';
      deleteBtn.className = 'btn-small btn-danger';
      deleteBtn.addEventListener('click', async () => {
        if (!confirm('Удалить категорию? Это действие нельзя отменить.')) return;
        deleteBtn.disabled = true;
        try {
          await deleteCategory(cat.id);
          await loadCategories();
        } catch (e) {
          alert('Ошибка: ' + (e.detail || e.message || 'Неизвестная ошибка'));
        } finally {
          deleteBtn.disabled = false;
        }
      });

      actionsTd.appendChild(saveBtn);
      actionsTd.appendChild(deleteBtn);

      tr.appendChild(idTd);
      tr.appendChild(nameTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="3">Ошибка загрузки: ${e.message}</td></tr>`;
  }
}

function initAddForm() {
  const form = document.getElementById('add-category-form');
  const input = document.getElementById('new-category-name');
  const btn = document.getElementById('add-category-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await addNewCategory();
    });
  }

  if (btn) {
    btn.addEventListener('click', async () => {
      await addNewCategory();
    });
  }
}

async function addNewCategory() {
  const input = document.getElementById('new-category-name');
  const name = input?.value.trim();
  
  if (!name) {
    alert('Введите название категории');
    return;
  }

  try {
    await createCategory(name);
    input.value = '';
    alert('Категория добавлена');
    await loadCategories();
  } catch (e) {
    alert('Ошибка: ' + (e.detail || e.message || 'Неизвестная ошибка'));
  }
}

// Добавляем стили
const style = document.createElement('style');
style.textContent = `
  .category-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .actions-cell {
    display: flex;
    gap: 8px;
  }
  
  .btn-small {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }
  
  .btn-save {
    background: #044036;
    color: white;
  }
  
  .btn-save:hover {
    background: #033028;
  }
  
  .btn-save:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .btn-danger {
    background: #dc3545;
    color: white;
  }
  
  .btn-danger:hover {
    background: #c82333;
  }
  
  .btn-danger:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background: #f0f9f7;
    color: #044036;
    font-weight: 600;
  }
  
  tr:hover {
    background: #f9f9f9;
  }
`;

document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', init);