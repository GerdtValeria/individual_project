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
            // Используем роутер get_index_html
            window.location.href = '/web/';
        });
    }

    // ==================== ОБРАБОТЧИКИ ВКЛАДОК ВЕРХНЕГО МЕНЮ ====================
    const tabs = document.querySelectorAll('.top-tabs .tab');
    
    // Кнопка "Сдать в аренду"
    const listTab = document.querySelector('.tab[data-tab="list"]');
    if (listTab) {
        listTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Используем роутер get_list_html (хотя мы уже на этой странице)
            // Можем просто обновить активную вкладку
            this.classList.add('active');
            window.location.href = '/web/';
        });
    }

    // Кнопка "Арендовать"
    const rentTab = document.querySelector('.tab[data-tab="rent"]');
    if (rentTab) {
        rentTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Используем роутер get_rent_html
            window.location.href = '/web/';
        });
    }

    // Кнопка "Избранное"
    const favoritesTab = document.querySelector('.tab[href="/favorites.html"]');
    if (favoritesTab) {
        favoritesTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Используем роутер get_favorites_html
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
            // Используем роутер get_registration_html
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
            postModal.setAttribute('aria-hidden', 'false');
            postModal.style.visibility = 'visible';
            postModal.style.opacity = '1';
            
            // Фокус на первое поле
            setTimeout(() => {
                const titleInput = postModal.querySelector('input[name="title"]');
                if (titleInput) titleInput.focus();
            }, 100);
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
                // В реальном приложении здесь была бы обработка загрузки фото
                photo: null
            };

            // Используем роутер add_rent из rents.py
            addNewRent(rentData);
        });
    }

    // ==================== ФУНКЦИИ ДЛЯ РАБОТЫ С API ====================

    /**
     * Поиск объявлений по запросу
     * @param {string} query - Поисковый запрос
     */
    async function fetchRentsBySearch(query) {
        try {
            // Используем роутер get_rents из rents.py
            const response = await fetch(`/rents/?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const rents = await response.json();
                console.log('Найдены объявления:', rents);
                // В реальном приложении здесь была бы обработка отображения результатов
                alert(`Найдено ${rents.length} объявлений по запросу: "${query}"`);
            } else {
                console.error('Ошибка при поиске объявлений');
                // Для демо-версии: показать имитацию поиска
                showDemoSearchResults(query);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            // Для демо-версии: показать имитацию поиска
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
                throw new Error('Ошибка при добавлении объявления');
            }
        } catch (error) {
            console.error('Ошибка при добавлении объявления:', error);
            
            // Для демо-версии: имитируем успешное добавление
            if (postModal) {
                closeModal(postModal);
            }
            
            if (postForm) {
                postForm.reset();
            }
            
            showNotification('Объявление успешно добавлено (демо)!', 'success');
            addDemoRentCard(rentData);
        }
    }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

    /**
     * Закрытие модального окна
     * @param {HTMLElement} modal - Элемент модального окна
     */
    function closeModal(modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
    }

    /**
     * Открытие модального окна помощи
     */
    function openHelpModal() {
        // Проверяем, существует ли уже блок помощи
        let helpBlock = document.getElementById('helpBlock');
        
        if (!helpBlock) {
            // Создаем блок помощи
            helpBlock = document.createElement('div');
            helpBlock.id = 'helpBlock';
            helpBlock.className = 'overlay-block';
            helpBlock.setAttribute('aria-hidden', 'false');
            helpBlock.innerHTML = `
                <div class="overlay-dialog" role="dialog" aria-label="Помощь">
                    <header class="modal-header">
                        <h3>Помощь</h3>
                        <button id="closeHelpBlock" class="help-close" aria-label="Закрыть"></button>
                    </header>
                    <div class="post-form" style="max-width:520px; padding:20px;">
                        <p style="margin:0 0 15px; color:var(--muted)">
                            Здесь вы найдёте ответы на частые вопросы, инструкции по бронированию и контакты службы поддержки.
                        </p>
                        <ul style="margin:0 0 20px; color:var(--muted); line-height:1.5; padding-left:20px;">
                            <li>Как забронировать жильё?</li>
                            <li>Как отменить бронирование?</li>
                            <li>Как разместить объявление?</li>
                            <li>Как связаться с арендодателем?</li>
                            <li>Какие документы нужны для аренды?</li>
                        </ul>
                        <div style="margin-top:20px; padding-top:15px; border-top:1px solid rgba(0,0,0,0.1)">
                            <p style="margin:0 0 10px; font-weight:600; color:#042018">Служба поддержки</p>
                            <p style="margin:0 0 15px; color:var(--muted); font-size:14px">
                                Email: support@ugolkomforta.ru<br>
                                Телефон: 8-800-123-45-67<br>
                                Часы работы: 9:00-21:00 ежедневно
                            </p>
                            <div style="display:flex; justify-content:flex-end;">
                                <button id="closeHelpBtn" class="btn">Закрыть</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(helpBlock);
            
            // Добавляем обработчики для кнопок закрытия
            const closeHelpBlock = document.getElementById('closeHelpBlock');
            const closeHelpBtn = document.getElementById('closeHelpBtn');
            
            if (closeHelpBlock) {
                closeHelpBlock.addEventListener('click', function() {
                    helpBlock.setAttribute('aria-hidden', 'true');
                    helpBlock.style.visibility = 'hidden';
                    helpBlock.style.opacity = '0';
                });
            }
            
            if (closeHelpBtn) {
                closeHelpBtn.addEventListener('click', function() {
                    helpBlock.setAttribute('aria-hidden', 'true');
                    helpBlock.style.visibility = 'hidden';
                    helpBlock.style.opacity = '0';
                });
            }
            
            // Закрытие при клике вне блока
            helpBlock.addEventListener('click', function(e) {
                if (e.target === helpBlock) {
                    helpBlock.setAttribute('aria-hidden', 'true');
                    helpBlock.style.visibility = 'hidden';
                    helpBlock.style.opacity = '0';
                }
            });
            
            // Показываем блок
            helpBlock.style.visibility = 'visible';
            helpBlock.style.opacity = '1';
        } else {
            // Если блок уже существует, просто показываем его
            helpBlock.setAttribute('aria-hidden', 'false');
            helpBlock.style.visibility = 'visible';
            helpBlock.style.opacity = '1';
        }
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
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
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
        
        // Формируем HTML карточки
        card.innerHTML = `
            <img class="thumb" src="/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg" alt="${rentData.title}">
            <div class="card-body">
                <div class="card-top">
                    <h3 class="title">${escapeHtml(rentData.title)}</h3>
                </div>
                <p class="meta">${escapeHtml(rentData.city)} · ${escapeHtml(rentData.category)}</p>
                <p class="desc-snippet">${escapeHtml(rentData.description)}</p>
                <p class="price">₽${rentData.price}/ночь</p>
                <div style="margin-top:10px; font-size:12px; color:var(--muted);">
                    <span style="background:#f1f9f7; padding:4px 8px; border-radius:6px;">Демо-объявление</span>
                </div>
            </div>
        `;
        
        // Вставляем карточку в начало списка
        const container = document.querySelector('main section');
        if (container) {
            // Находим карточку с инструкциями
            const instructionCard = container.querySelector('.card');
            if (instructionCard && instructionCard.nextSibling) {
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
        // В реальном приложении здесь была бы загрузка данных
        showNotification(`Поиск выполнен (демо): "${query}"`, 'info');
    }

    /**
     * Экранирование HTML-символов
     * @param {string} text - Текст для экранирования
     * @returns {string} Экранированный текст
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== ДОБАВЛЕНИЕ СТИЛЕЙ ДЛЯ АНИМАЦИЙ ====================
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);

    console.log('Обработчик событий для страницы "Сдать в аренду" загружен');
});