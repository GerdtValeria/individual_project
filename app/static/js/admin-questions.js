// static/js/admin-questions.js
import { getCurrentUser, getHelpRequests } from './api.js';

async function init() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role_id !== 2) {
      alert('Доступ запрещен');
      window.location.href = '/';
      return;
    }
  } catch (e) {
    window.location.href = '/';
  }

  await loadQuestions();
}

async function loadQuestions() {
  const container = document.getElementById('questions-list');
  if (!container) return;

  container.innerHTML = '<p>Загрузка вопросов...</p>';

  try {
    const questions = await getHelpRequests();
    container.innerHTML = '';

    if (!questions || !questions.length) {
      container.innerHTML = '<p>Вопросов от пользователей пока нет</p>';
      return;
    }

    // Создаем таблицу
    const table = document.createElement('table');
    table.className = 'questions-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Пользователь ID</th>
          <th>Вопрос</th>
          <th>Дата создания</th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;

    const tbody = table.querySelector('tbody');

    questions.forEach(q => {
      const tr = document.createElement('tr');
      
      const idTd = document.createElement('td');
      idTd.textContent = q.id;
      
      const userTd = document.createElement('td');
      userTd.textContent = q.id_user || 'Неизвестно';
      
      const contentTd = document.createElement('td');
      contentTd.textContent = q.content || 'Без текста';
      
      const dateTd = document.createElement('td');
      dateTd.textContent = q.created_at ? new Date(q.created_at).toLocaleDateString('ru-RU') : 'Не указана';
      
      const statusTd = document.createElement('td');
      statusTd.textContent = q.status || 'Новый';
      statusTd.className = 'status-' + (q.status || 'new').toLowerCase();
      
      const actionsTd = document.createElement('td');
      actionsTd.innerHTML = `
        <button onclick="markAsRead(${q.id})" class="btn-small">Отметить как прочитанное</button>
      `;
      
      tr.appendChild(idTd);
      tr.appendChild(userTd);
      tr.appendChild(contentTd);
      tr.appendChild(dateTd);
      tr.appendChild(statusTd);
      tr.appendChild(actionsTd);
      
      tbody.appendChild(tr);
    });

    container.appendChild(table);

    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
      .questions-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .questions-table th {
        background: #f0f9f7;
        padding: 12px;
        text-align: left;
        color: #044036;
        font-weight: 600;
        border-bottom: 2px solid #e6f4f1;
      }
      
      .questions-table td {
        padding: 12px;
        border-bottom: 1px solid #eee;
        vertical-align: top;
      }
      
      .questions-table tr:hover {
        background: #f9f9f9;
      }
      
      .status-new {
        color: #ff9800;
        font-weight: 600;
      }
      
      .status-read {
        color: #4caf50;
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

window.markAsRead = (questionId) => {
  alert(`Отметить вопрос #${questionId} как прочитанное требует доработки бэкенда.`);
  // Для реализации нужен эндпоинт PUT /help/{id}
};

document.addEventListener('DOMContentLoaded', init);