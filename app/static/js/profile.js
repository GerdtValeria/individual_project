// profile.js
document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация API
    const API_BASE_URL = 'http://localhost:8000'; // Измените на ваш адрес сервера
    const HEADERS = {
        'Content-Type': 'application/json',
    };

    // Получение токена авторизации
    function getAuthToken() {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }

    // Получение ID пользователя
    function getUserId() {
        const user = localStorage.getItem('ugol_user');
        if (user) {
            try {
                return JSON.parse(user).id;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Добавление заголовка авторизации
    function getAuthHeaders() {
        const token = getAuthToken();
        const headers = { ...HEADERS };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    // ====================
    // 1. НАВИГАЦИЯ И ССЫЛКИ
    // ====================

    // Логотип → Главная
    const logoLink = document.querySelector('.logo a');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/web/index';
        });
    }

    // Кнопка "Арендовать"
    const rentButton = document.querySelector('[data-tab="rent"]');
    if (rentButton) {
        rentButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/web/rent';
        });
    }

    // Кнопка "Сдать в аренду"
    const listButton = document.querySelector('[data-tab="list"]');
    if (listButton) {
        listButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/web/list';
        });
    }

    // Кнопка "Избранное"
    const favoritesLink = document.querySelector('a[href="/favorites.html"]');
    if (favoritesLink) {
        favoritesLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/web/favorites';
        });
    }

    // ====================
    // 2. БЛОК "ПОМОЩЬ"
    // ====================

    const helpButton = document.querySelector('[data-tab="help"]');
    const helpModal = document.getElementById('helpBlock');
    const helpForm = document.getElementById('helpForm');
    const closeHelpButton = document.getElementById('closeHelpBlock');
    const sendHelpButton = document.querySelector('#helpBlock button[type="submit"]');

    // Открытие блока "Помощь"
    if (helpButton && !helpModal) {
        // Создаем блок помощи, если его нет в HTML
        createHelpBlock();
    }

    function createHelpBlock() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay-block';
        overlay.id = 'helpBlock';
        overlay.setAttribute('aria-hidden', 'true');
        
        overlay.innerHTML = `
            <div class="overlay-dialog" role="dialog" aria-label="Блок помощи">
                <header class="modal-header">
                    <h3>Помощь</h3>
                    <button id="closeHelpBlock" aria-label="Закрыть">
                        <img src="/cancel_17767265.png" alt="Закрыть" style="width:22px;height:22px;">
                    </button>
                </header>
                <form id="helpForm" class="post-form">
                    <label>
                        Ваш вопрос
                        <textarea name="question" rows="4" placeholder="Опишите вашу проблему или вопрос..." required></textarea>
                    </label>
                    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
                        <button type="button" class="btn" id="cancelHelp">Отмена</button>
                        <button type="submit" class="btn primary">Отправить</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Инициализация событий для нового блока
        initHelpBlock();
    }

    function initHelpBlock() {
        const helpBlock = document.getElementById('helpBlock');
        const helpForm = document.getElementById('helpForm');
        const closeHelp = document.getElementById('closeHelpBlock');
        const cancelHelp = document.getElementById('cancelHelp');
        const helpButton = document.querySelector('[data-tab="help"]');

        // Открытие блока
        if (helpButton) {
            helpButton.addEventListener('click', function(e) {
                e.preventDefault();
                helpBlock.setAttribute('aria-hidden', 'false');
            });
        }

        // Закрытие блока через кнопку с иконкой
        if (closeHelp) {
            closeHelp.addEventListener('click', function(e) {
                e.preventDefault();
                helpBlock.setAttribute('aria-hidden', 'true');
                helpForm.reset();
            });
        }

        // Закрытие блока через кнопку "Отмена"
        if (cancelHelp) {
            cancelHelp.addEventListener('click', function() {
                helpBlock.setAttribute('aria-hidden', 'true');
                helpForm.reset();
            });
        }

        // Закрытие блока при клике вне области
        if (helpBlock) {
            helpBlock.addEventListener('click', function(e) {
                if (e.target === helpBlock) {
                    helpBlock.setAttribute('aria-hidden', 'true');
                    helpForm.reset();
                }
            });
        }

        // Отправка вопроса
        if (helpForm) {
            helpForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(helpForm);
                const question = formData.get('question');

                if (!question || question.trim().length === 0) {
                    alert('Пожалуйста, введите ваш вопрос');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/help/`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                            content: question.trim()
                        })
                    });

                    if (response.ok) {
                        alert('Ваш вопрос отправлен! Мы ответим вам в ближайшее время.');
                        helpForm.reset();
                        helpBlock.setAttribute('aria-hidden', 'true');
                    } else {
                        const error = await response.json();
                        throw new Error(error.detail || 'Ошибка при отправке вопроса');
                    }
                } catch (error) {
                    console.error('Ошибка отправки вопроса:', error);
                    alert('Не удалось отправить вопрос. Пожалуйста, попробуйте позже.');
                }
            });
        }
    }

    // Инициализация блока помощи (если уже есть в DOM)
    if (helpModal && helpForm) {
        initHelpBlock();
    }

    // ====================
    // 3. ВЫХОД ИЗ АККАУНТА
    // ====================

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!confirm('Вы уверены, что хотите выйти?')) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    // Очистка локальных данных
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('ugol_user');
                    sessionStorage.removeItem('auth_token');
                    
                    // Перенаправление на главную
                    window.location.href = '/web/index';
                } else {
                    // Даже если запрос не удался, очищаем локальные данные
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('ugol_user');
                    sessionStorage.removeItem('auth_token');
                    window.location.href = '/web/index';
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error);
                // Все равно очищаем данные и перенаправляем
                localStorage.removeItem('auth_token');
                localStorage.removeItem('ugol_user');
                sessionStorage.removeItem('auth_token');
                window.location.href = '/web/index';
            }
        });
    }

    // ====================
    // 4. МОИ ОБЪЯВЛЕНИЯ
    // ====================

    async function loadMyRents() {
        const userId = getUserId();
        if (!userId) {
            console.log('Пользователь не авторизован');
            return [];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/rents/?id_user=${userId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const rents = await response.json();
                return Array.isArray(rents) ? rents : [];
            } else {
                console.error('Ошибка загрузки объявлений:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Ошибка при загрузке объявлений:', error);
            return [];
        }
    }

    function renderMyRents(rents) {
        const myListings = document.getElementById('myListings');
        const emptyMsg = document.getElementById('myListingsEmpty');

        if (!myListings) return;

        myListings.innerHTML = '';

        if (!rents || rents.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';

        rents.forEach(rent => {
            const rentCard = document.createElement('article');
            rentCard.className = 'card';
            rentCard.innerHTML = `
                <img class="thumb" src="${rent.image_url || '/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg'}" alt="${rent.title || 'Объявление'}">
                <div class="card-body">
                    <div class="card-top">
                        <h3 class="title">${rent.title || 'Без названия'}</h3>
                    </div>
                    <p class="meta">${rent.address || 'Адрес не указан'}</p>
                    <p class="desc-snippet">${rent.description ? rent.description.substring(0, 100) + '...' : 'Нет описания'}</p>
                    <p class="price">₽${rent.price || 0}/ночь</p>
                    <div style="display:flex;gap:8px;margin-top:auto">
                        <button class="btn view-rent" data-id="${rent.id}">Подробнее</button>
                        <button class="btn edit-rent" data-id="${rent.id}">Редактировать</button>
                        <button class="btn delete-rent" data-id="${rent.id}">Удалить</button>
                    </div>
                </div>
            `;
            myListings.appendChild(rentCard);
        });

        // Обработчики для кнопок
        attachRentEventHandlers();
    }

    function attachRentEventHandlers() {
        // Кнопка "Подробнее"
        document.querySelectorAll('.view-rent').forEach(btn => {
            btn.addEventListener('click', function() {
                const rentId = this.getAttribute('data-id');
                window.location.href = `/web/detail?id=${rentId}`;
            });
        });

        // Кнопка "Редактировать"
        document.querySelectorAll('.edit-rent').forEach(btn => {
            btn.addEventListener('click', function() {
                const rentId = this.getAttribute('data-id');
                openEditRentModal(rentId);
            });
        });

        // Кнопка "Удалить"
        document.querySelectorAll('.delete-rent').forEach(btn => {
            btn.addEventListener('click', function() {
                const rentId = this.getAttribute('data-id');
                deleteRent(rentId);
            });
        });
    }

    // ====================
    // 5. РЕДАКТИРОВАНИЕ ОБЪЯВЛЕНИЯ
    // ====================

    async function openEditRentModal(rentId) {
        try {
            const response = await fetch(`${API_BASE_URL}/rents/${rentId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const rent = await response.json();
                showEditModal(rent);
            } else {
                alert('Не удалось загрузить данные объявления');
            }
        } catch (error) {
            console.error('Ошибка загрузки объявления:', error);
            alert('Ошибка загрузки данных');
        }
    }

    function showEditModal(rent) {
        // Создаем или находим модальное окно редактирования
        let editModal = document.getElementById('editRentModal');
        
        if (!editModal) {
            editModal = document.createElement('div');
            editModal.id = 'editRentModal';
            editModal.className = 'modal';
            editModal.setAttribute('aria-hidden', 'true');
            
            editModal.innerHTML = `
                <div class="modal-dialog" role="dialog" aria-label="Редактировать объявление">
                    <header class="modal-header">
                        <h3>Редактировать объявление</h3>
                        <button id="closeEditRentModal" aria-label="Закрыть">
                            <img src="/cancel_17767265.png" alt="Закрыть" style="width:22px;height:22px;">
                        </button>
                    </header>
                    <form id="editRentForm" class="post-form">
                        <input type="hidden" name="id" value="${rent.id}">
                        <label>Заголовок<input name="title" type="text" value="${rent.title || ''}" required></label>
                        <label>Адрес<input name="address" type="text" value="${rent.address || ''}" required></label>
                        <label>Описание<textarea name="description" rows="3" required>${rent.description || ''}</textarea></label>
                        <label>Цена (₽/ночь)<input name="price" type="number" min="0" value="${rent.price || 0}" required></label>
                        <label>Количество гостей<input name="guests" type="number" min="1" value="${rent.guests || 1}" required></label>
                        <label>Категория
                            <select name="id_category" required>
                                <option value="">— Выберите —</option>
                                <option value="1" ${rent.id_category === 1 ? 'selected' : ''}>Студия</option>
                                <option value="2" ${rent.id_category === 2 ? 'selected' : ''}>1-комнатная</option>
                                <option value="3" ${rent.id_category === 3 ? 'selected' : ''}>2-комнатная</option>
                                <option value="4" ${rent.id_category === 4 ? 'selected' : ''}>Дом</option>
                                <option value="5" ${rent.id_category === 5 ? 'selected' : ''}>С видом</option>
                            </select>
                        </label>
                        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
                            <button type="button" class="btn" id="cancelEditRent">Отмена</button>
                            <button type="submit" class="btn primary">Сохранить</button>
                        </div>
                    </form>
                </div>
            `;
            
            document.body.appendChild(editModal);
            
            // Инициализация событий модального окна
            initEditModal();
        } else {
            // Заполняем форму данными
            const form = document.getElementById('editRentForm');
            form.querySelector('[name="id"]').value = rent.id;
            form.querySelector('[name="title"]').value = rent.title || '';
            form.querySelector('[name="address"]').value = rent.address || '';
            form.querySelector('[name="description"]').value = rent.description || '';
            form.querySelector('[name="price"]').value = rent.price || 0;
            form.querySelector('[name="guests"]').value = rent.guests || 1;
            form.querySelector('[name="id_category"]').value = rent.id_category || '';
        }
        
        // Показываем модальное окно
        editModal.setAttribute('aria-hidden', 'false');
    }

    function initEditModal() {
        const editModal = document.getElementById('editRentModal');
        const closeBtn = document.getElementById('closeEditRentModal');
        const cancelBtn = document.getElementById('cancelEditRent');
        const form = document.getElementById('editRentForm');

        // Закрытие модального окна
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                editModal.setAttribute('aria-hidden', 'true');
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                editModal.setAttribute('aria-hidden', 'true');
            });
        }

        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.setAttribute('aria-hidden', 'true');
            }
        });

        // Отправка формы редактирования
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const rentId = formData.get('id');
                const rentData = {
                    title: formData.get('title'),
                    address: formData.get('address'),
                    description: formData.get('description'),
                    price: parseInt(formData.get('price')),
                    guests: parseInt(formData.get('guests')),
                    id_category: parseInt(formData.get('id_category'))
                };

                try {
                    const response = await fetch(`${API_BASE_URL}/rents/${rentId}`, {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify(rentData)
                    });

                    if (response.ok) {
                        alert('Объявление успешно обновлено!');
                        editModal.setAttribute('aria-hidden', 'true');
                        // Обновляем список объявлений
                        const rents = await loadMyRents();
                        renderMyRents(rents);
                    } else {
                        const error = await response.json();
                        throw new Error(error.detail || 'Ошибка при обновлении объявления');
                    }
                } catch (error) {
                    console.error('Ошибка обновления объявления:', error);
                    alert('Не удалось обновить объявление. Пожалуйста, попробуйте позже.');
                }
            });
        }
    }

    // ====================
    // 6. УДАЛЕНИЕ ОБЪЯВЛЕНИЯ
    // ====================

    async function deleteRent(rentId) {
        if (!confirm('Вы уверены, что хотите удалить это объявление? Это действие нельзя отменить.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/rents/${rentId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                alert('Объявление успешно удалено!');
                // Обновляем список объявлений
                const rents = await loadMyRents();
                renderMyRents(rents);
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка при удалении объявления');
            }
        } catch (error) {
            console.error('Ошибка удаления объявления:', error);
            alert('Не удалось удалить объявление. Пожалуйста, попробуйте позже.');
        }
    }

    // ====================
    // 7. МОИ БРОНИРОВАНИЯ
    // ====================

    async function loadMyBookings() {
        try {
            const response = await fetch(`${API_BASE_URL}/booking/me`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const bookings = await response.json();
                return Array.isArray(bookings) ? bookings : [];
            } else {
                console.error('Ошибка загрузки бронирований:', response.status);
                return [];
            }
        } catch (error) {
            console.error('Ошибка при загрузке бронирований:', error);
            return [];
        }
    }

    function renderMyBookings(bookings) {
        const bookingsContainer = document.getElementById('myBookings');
        const emptyBookingsMsg = document.getElementById('myBookingsEmpty');

        if (!bookingsContainer) {
            // Создаем секцию "Мои бронирования", если ее нет
            createBookingsSection();
            return;
        }

        bookingsContainer.innerHTML = '';

        if (!bookings || bookings.length === 0) {
            if (emptyBookingsMsg) emptyBookingsMsg.style.display = 'block';
            return;
        }

        if (emptyBookingsMsg) emptyBookingsMsg.style.display = 'none';

        bookings.forEach(booking => {
            const bookingCard = document.createElement('article');
            bookingCard.className = 'card';
            bookingCard.innerHTML = `
                <div class="card-body">
                    <div class="card-top">
                        <h3 class="title">Бронирование #${booking.id}</h3>
                    </div>
                    <p class="meta">Объявление ID: ${booking.rent_id}</p>
                    <p class="meta">Дата начала: ${new Date(booking.start_date).toLocaleDateString('ru-RU')}</p>
                    <p class="meta">Дата окончания: ${new Date(booking.end_date).toLocaleDateString('ru-RU')}</p>
                    <p class="price">Общая стоимость: ₽${booking.total_price || 0}</p>
                    <div style="display:flex;gap:8px;margin-top:auto">
                        <button class="btn view-booking" data-id="${booking.id}">Подробнее</button>
                        <button class="btn cancel-booking" data-id="${booking.id}">Отменить бронирование</button>
                    </div>
                </div>
            `;
            bookingsContainer.appendChild(bookingCard);
        });

        // Обработчики для кнопок бронирований
        attachBookingEventHandlers();
    }

    function createBookingsSection() {
        const profileSection = document.querySelector('section');
        if (!profileSection) return;

        const bookingsSection = document.createElement('section');
        bookingsSection.id = 'myBookingsWrap';
        bookingsSection.style.marginTop = '18px';
        bookingsSection.innerHTML = `
            <h2 style="margin:0 0 8px;color:#042018">Мои бронирования</h2>
            <p id="myBookingsEmpty" style="color:var(--muted);margin:0 0 12px">У вас пока нет активных бронирований.</p>
            <div id="myBookings" class="listings" style="margin-top:8px"></div>
        `;

        profileSection.appendChild(bookingsSection);
    }

    function attachBookingEventHandlers() {
        // Кнопка "Отменить бронирование"
        document.querySelectorAll('.cancel-booking').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookingId = this.getAttribute('data-id');
                cancelBooking(bookingId);
            });
        });
    }

    async function cancelBooking(bookingId) {
        if (!confirm('Вы уверены, что хотите отменить это бронирование?')) {
            return;
        }

        try {
            // Предполагаем, что есть эндпоинт для удаления бронирования
            // Если его нет, нужно будет создать в bookings.py
            const response = await fetch(`${API_BASE_URL}/booking/${bookingId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                alert('Бронирование успешно отменено!');
                // Обновляем список бронирований
                const bookings = await loadMyBookings();
                renderMyBookings(bookings);
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка при отмене бронирования');
            }
        } catch (error) {
            console.error('Ошибка отмены бронирования:', error);
            alert('Не удалось отменить бронирование. Пожалуйста, попробуйте позже.');
        }
    }

    // ====================
    // 8. ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ
    // ====================

    async function initializeProfile() {
        // Загружаем и отображаем данные пользователя
        updateProfileInfo();
        
        // Загружаем и отображаем мои объявления
        const rents = await loadMyRents();
        renderMyRents(rents);
        
        // Загружаем и отображаем мои бронирования
        const bookings = await loadMyBookings();
        renderMyBookings(bookings);
        
        // Проверяем авторизацию
        checkAuthStatus();
    }

    function updateProfileInfo() {
        const userName = document.getElementById('profileName');
        const userEmail = document.getElementById('profileEmail');
        const profileForm = document.getElementById('profileForm');

        try {
            const user = JSON.parse(localStorage.getItem('ugol_user') || '{}');
            
            if (userName) {
                userName.textContent = user.name || user.email || 'Гость';
            }
            
            if (userEmail) {
                userEmail.textContent = user.email || '—';
            }
            
            if (profileForm) {
                profileForm.querySelector('[name="name"]').value = user.name || '';
                profileForm.querySelector('[name="email"]').value = user.email || '';
            }
        } catch (e) {
            console.error('Ошибка загрузки данных пользователя:', e);
        }
    }

    function checkAuthStatus() {
        const token = getAuthToken();
        const userId = getUserId();
        
        if (!token || !userId) {
            // Если пользователь не авторизован, скрываем приватные секции
            document.getElementById('myListingsWrap')?.style.display = 'none';
            document.getElementById('myBookingsWrap')?.style.display = 'none';
            document.getElementById('logoutBtn')?.style.display = 'none';
            
            // Показываем сообщение о необходимости авторизации
            const profileContent = document.getElementById('profileContent');
            if (profileContent) {
                const authMessage = document.createElement('div');
                authMessage.className = 'card';
                authMessage.style.padding = '18px';
                authMessage.style.marginTop = '12px';
                authMessage.innerHTML = `
                    <h3 style="margin:0 0 8px;color:#042018">Требуется авторизация</h3>
                    <p style="color:var(--muted);margin:0 0 12px">Для просмотра ваших объявлений и бронирований необходимо войти в систему.</p>
                    <div style="display:flex;gap:8px">
                        <a href="/web/auth" class="btn primary">Войти</a>
                        <a href="/web/auth" class="btn">Зарегистрироваться</a>
                    </div>
                `;
                profileContent.appendChild(authMessage);
            }
        }
    }

    // Сохранение профиля (локальное демо)
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(profileForm);
            const userData = {
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                id: getUserId() || Date.now()
            };
            
            try {
                localStorage.setItem('ugol_user', JSON.stringify(userData));
                updateProfileInfo();
                alert('Данные профиля сохранены (локально, демо).');
            } catch (error) {
                console.error('Ошибка сохранения профиля:', error);
                alert('Не удалось сохранить профиль.');
            }
        });
    }

    // Запуск инициализации
    initializeProfile();
});