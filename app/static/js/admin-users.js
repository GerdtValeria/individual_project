// static/js/admin-users.js
import { getCurrentUser, getUsers } from './api.js';

async function init() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_id !== 2) {
      alert('Доступ запрещен');
      window.location.href = '/';
      return;
    }
    
    await loadUsers();
  } catch (e) {
    console.error('Auth error:', e);
    window.location.href = '/';
  }
}

async function loadUsers() {
  const container = document.getElementById('users-list');
  if (!container) return;
  
  container.innerHTML = '<p>Загрузка пользователей...</p>';
  
  try {
    const users = await getUsers();
    container.innerHTML = '';
    
    if (!users || !users.length) {
      container.innerHTML = '<p>Пользователей не найдено</p>';
      return;
    }
    
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Имя</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody id="users-tbody">
      </tbody>
    `;
    
    const tbody = table.querySelector('#users-tbody');
    
    users.forEach(user => {
      const tr = document.createElement('tr');
      
      const idTd = document.createElement('td');
      idTd.textContent = user.id;
      
      const nameTd = document.createElement('td');
      nameTd.textContent = user.name;
      
      const emailTd = document.createElement('td');
      emailTd.textContent = user.email;
      
      const roleTd = document.createElement('td');
      roleTd.textContent = user.role_id === 2 ? 'Администратор' : 'Пользователь';
      
      const actionsTd = document.createElement('td');
      actionsTd.innerHTML = `
        <button onclick="editUser(${user.id})" class="btn-small">Изменить роль</button>
      `;
      
      tr.appendChild(idTd);
      tr.appendChild(nameTd);
      tr.appendChild(emailTd);
      tr.appendChild(roleTd);
      tr.appendChild(actionsTd);
      
      tbody.appendChild(tr);
    });
    
    container.appendChild(table);
    
    // Добавляем стили для таблицы
    const style = document.createElement('style');
    style.textContent = `
      .admin-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .admin-table th {
        background: #f0f9f7;
        padding: 12px;
        text-align: left;
        color: #044036;
        font-weight: 600;
        border-bottom: 2px solid #e6f4f1;
      }
      
      .admin-table td {
        padding: 12px;
        border-bottom: 1px solid #eee;
      }
      
      .admin-table tr:hover {
        background: #f9f9f9;
      }
      
      .btn-small {
        padding: 6px 12px;
        background: #044036;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .btn-small:hover {
        background: #033028;
      }
    `;
    
    document.head.appendChild(style);
  } catch (e) {
    container.innerHTML = `<p>Ошибка загрузки: ${e.message}</p>`;
  }
}

window.editUser = (userId) => {
  if (confirm('Изменение ролей пользователей требует доработки бэкенда. Продолжить?')) {
    alert('Функция изменения роли пользователя требует реализации эндпоинта PUT /users/{id} на бэкенде');
  }
};

document.addEventListener('DOMContentLoaded', init);