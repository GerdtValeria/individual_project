// list-handler.js - обработчик событий для страницы list.html

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // ==================== ПЕРЕХОД ПО ЛОГОТИПУ ====================
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Используем роутер get_index_html из web.py
            window.location.href = '/web/';
        });
    }

    // ==================== ОБРАБОТЧИКИ ВКЛАДОК ВЕРХНЕГО МЕНЮ ====================
    const tabs = document.querySelectorAll('.top-tabs .tab');
    
    // Кнопка "Сдать в аренду" - уже активна на этой странице
    const listTab = document.querySelector('.tab[data-tab="list"]');
    if (listTab) {
        listTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Мы уже на странице "Сдать в аренду"
            this.classList.add('active');
        });
    }

    // Кнопка "Арендовать"
    const rentTab = document.querySelector('.tab[data-tab="rent"]');
    if (rentTab) {
        rentTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Используем роутер get_rent_html из web.py
            window.location.href = '/web/';
        });
    }

    // Кнопка "Избранное" (ссылка)
    const favoritesTab = document.querySelector('a.tab[href="/favorites.html"]');
    if (favoritesTab) {
        favoritesTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Используем роутер get_favorites_html из web.py
            window.location.href = '/web/';
        });
    }

    // Кнопка "Помощь"
    const helpTab = document.querySelector('.tab[data-tab="help"]');
    if (helpTab) {
        helpTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Открываем блок "Помощь" поверх всей страницы
            openHelpModal();
        });
    }

    // Кнопка "Зарегистрироваться"
    const signupTab = document.querySelector('.tab[data-tab="signup"]');
    if (signupTab) {
        signupTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Используем роутер get_registration_html из web.py
            window.location.href = '/web/auth';
        });
    }

    // ==================== ПОИСКОВЫЙ ЗАПРОС ====================
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('q');
            const searchQuery = searchInput ? searchInput.value.trim() : '';
            
            if (searchQuery) {
                // Используем роутер get_rents из rents.py
                fetchRentsBySearch(searchQuery);
            } else {
                // Если запрос пустой, получаем все объявления
                fetchAllRents();
            }
        });
    }

    // ==================== МОДАЛЬНОЕ ОКНО "НОВОЕ ОБЪЯВЛЕНИЕ" ====================
    const openPostBtn = document.getElementById('openPostBtn');
    const postModal = document.getElementById('postModalLocal');
    const cancelPostBtn = document.getElementById('cancelPostLocal');
    const postForm = document.getElementById('postFormLocal');

    if (openPostBtn && postModal) {
        openPostBtn.addEventListener('click', function() {
            // Открываем модальное окно
            openModal(postModal);
        });
    }

    if (cancelPostBtn && postModal) {
        cancelPostBtn.addEventListener('click', function() {
            closeModal(postModal);
        });
    }

    // Закрытие модального окна при клике вне его
    if (postModal) {
        postModal.addEventListener('click', function(e) {
            if (e.target === postModal) {
                closeModal(postModal);
            }
        });
    }

    // ==================== ФОРМА ДОБАВЛЕНИЯ ОБЪЯВЛЕНИЯ ====================
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Собираем данные формы
            const formData = new FormData(postForm);
            const rentData = {
                title: formData.get('title'),
                city: formData.get('city'),
                description: formData.get('description'),
                category: formData.get('category'),
                price: parseInt(formData.get('price')) || 0,
                district: '', // По умолчанию пустое
                id_category: getCategoryId(formData.get('category')),
                active: true
            };

            // Используем роутер add_rent из rents.py
            addNewRent(rentData);
        });
    }

    // ==================== ФУНКЦИИ ДЛЯ РАБОТЫ С API ====================

    /**
     * Получение всех объявлений
     */
    async function fetchAllRents() {
        try {
            // Используем роутер get_rents из rents.py без параметров
            const response = await fetch('/rents/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const rents = await response.json();
                console.log('Получены все объявления:', rents);
                // В реальном приложении здесь была бы обработка отображения результатов
                showNotification(`Загружено ${rents.length} объявлений`, 'success');
            } else {
                console.error('Ошибка при получении объявлений');
                showDemoSearchResults('all');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            showDemoSearchResults('all');
        }
    }

    /**
     * Поиск объявлений по запросу
     * @param {string} query - Поисковый запрос
     */
    async function fetchRentsBySearch(query) {
        try {
            // Используем роутер get_rents из rents.py с параметром поиска
            const response = await fetch(`/rents/?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const rents = await response.json();
                console.log('Найдены объявления по запросу:', query, rents);
                showNotification(`Найдено ${rents.length} объявлений по запросу: "${query}"`, 'success');
            } else {
                console.error('Ошибка при поиске объявлений');
                showDemoSearchResults(query);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            showDemoSearchResults(query);
        }
    }

    /**
     * Добавление нового объявления
     * @param {Object} rentData - Данные объявления
     */
    async function addNewRent(rentData) {
        try {
            // Используем роутер add_rent из rents.py
            const response = await fetch('/rents/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Объявление успешно добавлено:', result);
                
                // Закрываем модальное окно
                if (postModal) {
                    closeModal(postModal);
                }
                
                // Сбрасываем форму
                if (postForm) {
                    postForm.reset();
                }
                
                // Показываем уведомление
                showNotification('Объявление успешно добавлено!', 'success');
                
                // В демо-версии: добавляем карточку на страницу
                addDemoRentCard(rentData);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка при добавлении объявления');
            }
        } catch (error) {
            console.error('Ошибка при добавлении объявления:', error);
            
            // Для демо-версии: имитируем успешное добавление
            showNotification('Объявление успешно добавлено (демо-режим)!', 'success');
            addDemoRentCard(rentData);
            
            // Закрываем модальное окно и сбрасываем форму
            if (postModal) {
                closeModal(postModal);
            }
            if (postForm) {
                postForm.reset();
            }
        }
    }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

    /**
     * Открытие модального окна
     * @param {HTMLElement} modal - Элемент модального окна
     */
    function openModal(modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.display = 'grid';
        
        // Фокус на первое поле
        setTimeout(() => {
            const titleInput = modal.querySelector('input[name="title"]');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    /**
     * Закрытие модального окна
     * @param {HTMLElement} modal - Элемент модального окна
     */
    function closeModal(modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    /**
     * Открытие модального окна помощи
     */
    function openHelpModal() {
        // Проверяем, существует ли уже блок помощи в HTML
        let helpBlock = document.getElementById('helpBlock');
        
        if (helpBlock) {
            // Если блок уже есть в HTML (добавлен сервером), просто показываем его
            helpBlock.setAttribute('aria-hidden', 'false');
            helpBlock.style.visibility = 'visible';
            helpBlock.style.opacity = '1';
            helpBlock.style.display = 'grid';
            
            // Фокус на кнопку закрытия для доступности
            setTimeout(() => {
                const closeBtn = helpBlock.querySelector('#closeHelpBlock');
                if (closeBtn) closeBtn.focus();
            }, 100);
        } else {
            // Создаем блок помощи динамически
            helpBlock = document.createElement('div');
            helpBlock.id = 'helpBlock';
            helpBlock.className = 'overlay-block';
            helpBlock.setAttribute('aria-hidden', 'false');
            helpBlock.innerHTML = `
                <div class="overlay-dialog" role="dialog" aria-label="Помощь">
                    <header class="modal-header">
                        <h3>Помощь и поддержка</h3>
                        <button id="closeHelpBlock" class="help-close" aria-label="Закрыть"></button>
                    </header>
                    <div class="post-form" style="max-width:520px; padding:20px;">
                        <p style="margin:0 0 15px; color:var(--muted)">
                            На этой странице вы можете разместить объявление о сдаче жилья в аренду. 
                            Заполните форму "Новое объявление" и ваше предложение станет доступным для арендаторов.
                        </p>
                        
                        <h4 style="margin:20px 0 10px; color:#042018">Часто задаваемые вопросы:</h4>
                        <ul style="margin:0 0 20px; color:var(--muted); line-height:1.5; padding-left:20px;">
                            <li><strong>Как правильно заполнить объявление?</strong><br>Укажите точный адрес, описание, цену и загрузите качественные фото.</li>
                            <li><strong>Как общаться с арендаторами?</strong><br>Используйте встроенный чат или укажите контакты в описании.</li>
                            <li><strong>Как изменить или удалить объявление?</strong><br>В личном кабинете во вкладке "Мои объявления".</li>
                            <li><strong>Какие документы нужны для сдачи?</strong><br>Договор аренды и документы, подтверждающие право собственности.</li>
                        </ul>
                        
                        <div style="margin-top:25px; padding-top:15px; border-top:1px solid rgba(0,0,0,0.1)">
                            <h4 style="margin:0 0 10px; color:#042018">Техническая поддержка</h4>
                            <p style="margin:0 0 15px; color:var(--muted); font-size:14px">
                                <strong>Email:</strong> support@ugolkomforta.ru<br>
                                <strong>Телефон:</strong> 8-800-123-45-67<br>
                                <strong>Часы работы:</strong> 9:00-21:00 ежедневно
                            </p>
                            <div style="display:flex; justify-content:flex-end; gap:10px;">
                                <button id="contactSupportBtn" class="btn">Написать в поддержку</button>
                                <button id="closeHelpBtn" class="btn primary">Закрыть</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(helpBlock);
            
            // Показываем блок
            helpBlock.style.visibility = 'visible';
            helpBlock.style.opacity = '1';
            helpBlock.style.display = 'grid';
            
            // Добавляем обработчики для кнопок
            const closeHelpBlock = document.getElementById('closeHelpBlock');
            const closeHelpBtn = document.getElementById('closeHelpBtn');
            const contactSupportBtn = document.getElementById('contactSupportBtn');
            
            if (closeHelpBlock) {
                closeHelpBlock.addEventListener('click', function() {
                    closeModal(helpBlock);
                });
            }
            
            if (closeHelpBtn) {
                closeHelpBtn.addEventListener('click', function() {
                    closeModal(helpBlock);
                });
            }
            
            if (contactSupportBtn) {
                contactSupportBtn.addEventListener('click', function() {
                    window.location.href = 'mailto:support@ugolkomforta.ru?subject=Вопрос по размещению объявления';
                });
            }
            
            // Закрытие при клике вне блока
            helpBlock.addEventListener('click', function(e) {
                if (e.target === helpBlock) {
                    closeModal(helpBlock);
                }
            });
            
            // Фокус на кнопку закрытия для доступности
            setTimeout(() => {
                if (closeHelpBlock) closeHelpBlock.focus();
            }, 100);
        }
    }

    /**
     * Получение ID категории по названию
     * @param {string} categoryName - Название категории
     * @returns {number} ID категории
     */
    function getCategoryId(categoryName) {
        const categoryMap = {
            'Студия': 1,
            '1‑комнатная': 2,
            '2‑комнатная': 3,
            'Дом': 4,
            'Апартаменты с видом': 5
        };
        return categoryMap[categoryName] || 0;
    }

    /**
     * Показ уведомления
     * @param {string} message - Текст уведомления
     * @param {string} type - Тип уведомления (success, error, info)
     */
    function showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#cdebd4' : type === 'error' ? '#f8d7da' : '#fff3cd'};
            color: ${type === 'success' ? '#042018' : type === 'error' ? '#721c24' : '#856404'};
            border: 1px solid ${type === 'success' ? '#b8e0c4' : type === 'error' ? '#f5c6cb' : '#ffeaa7'};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
            font-family: 'Noto Sans', sans-serif;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Добавление демо-карточки объявления
     * @param {Object} rentData - Данные объявления
     */
    function addDemoRentCard(rentData) {
        const card = document.createElement('article');
        card.className = 'card';
        card.style.cssText = `
            animation: fadeIn 0.5s ease;
            margin: 12px auto;
            max-width: 900px;
        `;
        
        // Формируем HTML карточки
        card.innerHTML = `
            <img class="thumb" src="/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg" alt="${rentData.title}">
            <div class="card-body">
                <div class="card-top">
                    <h3 class="title">${escapeHtml(rentData.title)}</h3>
                </div>
                <p class="meta">${escapeHtml(rentData.city)} · ${escapeHtml(rentData.category)}</p>
                <p class="desc-snippet">${escapeHtml(rentData.description)}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                    <p class="price" style="margin: 0; font-weight: 700; color: #042018;">₽${rentData.price}/ночь</p>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn" style="padding: 6px 12px; font-size: 13px;">Редактировать</button>
                        <button class="btn primary" style="padding: 6px 12px; font-size: 13px;">Скрыть</button>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: var(--muted);">
                    <span style="background: #f1f9f7; padding: 4px 8px; border-radius: 6px;">Добавлено только что</span>
                </div>
            </div>
        `;
        
        // Вставляем карточку после инструкций
        const container = document.querySelector('main section');
        if (container) {
            // Находим карточку с инструкциями
            const instructionCard = container.querySelector('.card');
            if (instructionCard) {
                container.insertBefore(card, instructionCard.nextSibling);
            } else {
                container.appendChild(card);
            }
        }
    }

    /**
     * Показ демо-результатов поиска
     * @param {string} query - Поисковый запрос
     */
    function showDemoSearchResults(query) {
        console.log(`Демо-поиск: "${query}"`);
        const message = query === 'all' 
            ? 'Загружены демо-объявления (в демо-режиме)' 
            : `Показаны демо-результаты по запросу: "${query}"`;
        showNotification(message, 'info');
    }

    /**
     * Экранирование HTML-символов
     * @param {string} text - Текст для экранирования
     * @returns {string} Экранированный текст
     */
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // ==================== ДОБАВЛЕНИЕ СТИЛЕЙ ДЛЯ АНИМАЦИЙ ====================
    if (!document.querySelector('#list-handler-styles')) {
        const style = document.createElement('style');
        style.id = 'list-handler-styles';
        style.textContent = `
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification {
                transition: all 0.3s ease;
            }
            
            .modal[aria-hidden="true"] {
                display: none !important;
            }
            
            .modal[aria-hidden="false"] {
                display: grid !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==================== ИНИЦИАЛИЗАЦИЯ ПО УМОЛЧАНИЮ ====================
    console.log('Обработчик событий для страницы "Сдать в аренду" загружен');
    
    // Автоматически загружаем все объявления при загрузке страницы
    setTimeout(() => {
        fetchAllRents();
    }, 500);
});