// detail-handler.js
document.addEventListener('DOMContentLoaded', function() {
    // ==================== Глобальные переменные ====================
    let currentRentId = null;
    let currentUser = null;
    let comments = [];

    // ==================== Инициализация ====================
    initPage();

    async function initPage() {
        // Проверка авторизации
        await checkAuth();
        
        // Получение ID объявления из URL
        const urlParams = new URLSearchParams(window.location.search);
        currentRentId = urlParams.get('id');
        
        if (!currentRentId) {
            showError('ID объявления не указан');
            return;
        }

        // Загрузка данных объявления
        await loadRentData(currentRentId);
        
        // Загрузка комментариев
        await loadComments(currentRentId);
        
        // Настройка обработчиков событий
        setupEventHandlers();
    }

    // ==================== Навигация ====================
    
    // Обработка клика на логотип
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', async function(e) {
            e.preventDefault();
            await navigateToHome();
        });
    }

    // Обработка навигационных кнопок в шапке
    const navButtons = {
        'rent': '/web/', // роутер get_rent_html
        'list': '/web/', // роутер get_list_html
        'help': null,    // открытие модального окна
        'favorites': '/web/', // роутер get_favorites_html
        'signup': '/web/auth' // роутер get_registration_html
    };

    // Обработка кликов по кнопкам в top-tabs
    document.querySelectorAll('.top-tabs .tab[data-tab]').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            
            if (tab === 'help') {
                openHelpBlock();
                return;
            }
            
            if (navButtons[tab]) {
                try {
                    const response = await fetch(navButtons[tab], {
                        method: 'GET'
                    });
                    if (response.ok) {
                        window.location.href = navButtons[tab];
                    } else {
                        console.error(`Ошибка при переходе на ${tab}`);
                        fallbackNavigation(tab);
                    }
                } catch (error) {
                    console.error('Ошибка сети:', error);
                    fallbackNavigation(tab);
                }
            }
        });
    });

    // Обработка кнопки "Избранное" (ссылка)
    const favoritesLink = document.querySelector('a[href="/favorites.html"]');
    if (favoritesLink) {
        favoritesLink.addEventListener('click', async function(e) {
            e.preventDefault();
            await navigateToFavorites();
        });
    }

    // Обработка поиска
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await performSearch();
        });
    }

    // ==================== Основные функции ====================

    async function checkAuth() {
        try {
            const response = await fetch('/auth/me', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                currentUser = await response.json();
                console.log('Пользователь авторизован:', currentUser);
            }
        } catch (error) {
            console.log('Пользователь не авторизован');
        }
    }

    async function loadRentData(rentId) {
        try {
            // Используем роутер get_rent из rents.py
            const response = await fetch(`/rents/${rentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const rentData = await response.json();
                renderRentDetails(rentData);
                
                // Проверяем, добавлено ли объявление в избранное
                await checkFavoriteStatus(rentId);
            } else {
                showError('Не удалось загрузить данные объявления');
            }
        } catch (error) {
            console.error('Ошибка при загрузке объявления:', error);
            showError('Ошибка сети при загрузке объявления');
        }
    }

    function renderRentDetails(rentData) {
        const container = document.getElementById('detailCard');
        if (!container) return;

        const photos = rentData.photos || [rentData.img || '/default-image.jpg'];
        const firstPhoto = photos[0];
        
        container.innerHTML = `
            <div style="display:flex;gap:18px;flex-direction:row;align-items:flex-start;">
                <div style="flex:0 0 48%;display:flex;flex-direction:column;gap:8px">
                    <div style="border-radius:12px;overflow:hidden;box-shadow:var(--card-shadow)">
                        <img src="${firstPhoto}" alt="${rentData.title || 'Объявление'}" 
                             style="width:100%;height:280px;object-fit:cover;border-radius:8px;">
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
                        ${photos.map((photo, index) => `
                            <button class="thumbNav" data-src="${photo}" 
                                    aria-label="Показать фото ${index + 1}"
                                    style="min-width:60px;height:60px;border-radius:8px;
                                           border:1px solid rgba(0,0,0,0.06);
                                           background-image:url('${photo}');
                                           background-size:cover;background-position:center">
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;gap:8px">
                    <h2 style="margin:0">${rentData.title || 'Без названия'}</h2>
                    <div style="color:var(--muted);font-weight:700">
                        ${rentData.city || ''} · ${rentData.beds === 0 ? 'Студия' : rentData.beds + ' спальни'}
                    </div>
                    <div style="display:flex;gap:12px;align-items:center;margin-top:6px">
                        <div style="font-size:20px;font-weight:800;color:#044036">
                            ₽${rentData.price || 0}/ночь
                        </div>
                    </div>
                    <div id="detailDescription" style="margin-top:8px;color:var(--muted)">
                        ${rentData.description || ''}
                    </div>
                    <div style="margin-top:10px">
                        ${rentData.category ? `<span class="tag-pill">${rentData.category}</span>` : ''}
                    </div>

                    <!-- Действия -->
                    <div style="display:flex;gap:8px;margin-top:auto;align-items:center">
                        <button id="bookBtn" class="btn cta">Арендовать</button>
                        <button id="favoriteBtn" class="fav" aria-pressed="false" title="Добавить в избранное">
                            <i></i>
                        </button>
                        <a href="/rent.html" class="btn" style="background:transparent">К списку</a>
                    </div>

                    <div id="availability" style="margin-top:12px;background:#fbfffe;padding:10px;border-radius:8px;border:1px solid #eef7f4">
                        Доступность: с ${rentData.avail_from || '—'} до ${rentData.avail_to || '—'}
                    </div>
                </div>
            </div>
        `;

        // Обработчики для галереи
        container.querySelectorAll('.thumbNav').forEach(btn => {
            btn.addEventListener('click', () => {
                const mainImg = container.querySelector('img');
                if (mainImg) {
                    mainImg.src = btn.dataset.src;
                }
            });
        });

        // Обработчик для кнопки "Арендовать"
        const bookBtn = document.getElementById('bookBtn');
        if (bookBtn) {
            bookBtn.addEventListener('click', async () => {
                await navigateToBooking(rentData.id);
            });
        }

        // Обработчик для кнопки избранного
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', async () => {
                await toggleFavorite(rentData.id);
            });
        }
    }

    async function checkFavoriteStatus(rentId) {
        if (!currentUser) return;
        
        try {
            // Здесь нужно получить список избранных пользователя
            // Предполагаем, что есть эндпоинт для проверки
            const response = await fetch(`/comments/${rentId}/favorite`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const isFavorite = await response.json();
                const favoriteBtn = document.getElementById('favoriteBtn');
                if (favoriteBtn) {
                    favoriteBtn.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
                    if (isFavorite) favoriteBtn.classList.add('active');
                    else favoriteBtn.classList.remove('active');
                }
            }
        } catch (error) {
            console.error('Ошибка при проверке избранного:', error);
        }
    }

    async function toggleFavorite(rentId) {
        if (!currentUser) {
            alert('Для добавления в избранное необходимо войти в систему');
            return;
        }

        const favoriteBtn = document.getElementById('favoriteBtn');
        const isFavorite = favoriteBtn.getAttribute('aria-pressed') === 'true';

        try {
            if (isFavorite) {
                // Удаление из избранного - роутер delete_rent из favorites.py
                const response = await fetch(`/comments/${rentId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    favoriteBtn.setAttribute('aria-pressed', 'false');
                    favoriteBtn.classList.remove('active');
                    console.log('Удалено из избранного');
                } else {
                    showError('Не удалось удалить из избранного');
                }
            } else {
                // Добавление в избранное - роутер add_rent из favorites.py
                const favoriteData = {
                    rent_id: rentId,
                    user_id: currentUser.id
                };
                
                const response = await fetch('/comments/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(favoriteData)
                });
                
                if (response.ok) {
                    favoriteBtn.setAttribute('aria-pressed', 'true');
                    favoriteBtn.classList.add('active');
                    console.log('Добавлено в избранное');
                } else {
                    showError('Не удалось добавить в избранное');
                }
            }
        } catch (error) {
            console.error('Ошибка при работе с избранным:', error);
            showError('Ошибка сети');
        }
    }

    async function loadComments(rentId) {
        try {
            // Используем роутер get_comments из comments.py
            const response = await fetch(`/rents/${rentId}/comments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                comments = await response.json();
                renderComments(comments);
            }
        } catch (error) {
            console.error('Ошибка при загрузке комментариев:', error);
        }
    }

    function renderComments(commentsList) {
        const commentsContainer = document.getElementById('commentsSection');
        if (!commentsContainer) return;

        commentsContainer.innerHTML = `
            <h3 style="margin:0 0 8px;color:#042018">Отзывы</h3>
            <div id="commentsList" style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px">
                ${commentsList.length > 0 ? 
                    commentsList.map(comment => renderCommentItem(comment)).join('') :
                    '<p style="color:var(--muted)">Отзывов пока нет. Будьте первым!</p>'
                }
            </div>
            ${currentUser ? renderCommentForm() : '<p>Войдите, чтобы оставить отзыв</p>'}
        `;

        // Добавляем обработчики для кнопок редактирования и удаления
        commentsList.forEach(comment => {
            if (currentUser && currentUser.id === comment.user_id) {
                const editBtn = document.getElementById(`editComment_${comment.id}`);
                const deleteBtn = document.getElementById(`deleteComment_${comment.id}`);
                
                if (editBtn) {
                    editBtn.addEventListener('click', () => editComment(comment.id));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => deleteComment(comment.id));
                }
            }
        });

        // Обработчик формы добавления комментария
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await addNewComment();
            });
        }
    }

    function renderCommentItem(comment) {
        const isOwner = currentUser && currentUser.id === comment.user_id;
        return `
            <div class="comment-item" style="background:#fbfffe;padding:10px;border-radius:8px;border:1px solid #eef7f4">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <strong style="font-size:14px">${comment.author_name || 'Аноним'}</strong>
                    <span style="font-size:12px;color:var(--muted)">${new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <div style="color:var(--muted);margin-top:6px">${comment.content}</div>
                ${isOwner ? `
                    <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
                        <button id="editComment_${comment.id}" class="btn small" style="padding:4px 8px;font-size:12px">Ред.</button>
                        <button id="deleteComment_${comment.id}" class="btn small" style="padding:4px 8px;font-size:12px;background:#ffeded">Удал.</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderCommentForm() {
        return `
            <form id="commentForm" style="display:flex;flex-direction:column;gap:8px;max-width:560px">
                <label style="font-size:13px">
                    Ваш отзыв
                    <textarea id="commentText" name="text" rows="3" 
                              placeholder="Расскажите о вашем опыте"
                              style="padding:8px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);width:100%"></textarea>
                </label>
                <div style="display:flex;justify-content:flex-end;gap:8px">
                    <button type="submit" class="btn">Добавить отзыв</button>
                </div>
            </form>
        `;
    }

    async function addNewComment() {
        if (!currentUser) {
            alert('Для добавления отзыва необходимо войти в систему');
            return;
        }

        const commentText = document.getElementById('commentText')?.value;
        if (!commentText || commentText.trim().length === 0) {
            alert('Введите текст отзыва');
            return;
        }

        try {
            // Используем роутер add_comment из comments.py
            const response = await fetch(`/rents/${currentRentId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: commentText.trim(),
                    rent_id: currentRentId
                })
            });

            if (response.ok) {
                const newComment = await response.json();
                comments.unshift(newComment);
                renderComments(comments);
                document.getElementById('commentText').value = '';
            } else {
                showError('Не удалось добавить отзыв');
            }
        } catch (error) {
            console.error('Ошибка при добавлении отзыва:', error);
            showError('Ошибка сети');
        }
    }

    async function editComment(commentId) {
        const newText = prompt('Введите новый текст отзыва:');
        if (!newText || newText.trim().length === 0) return;

        try {
            // Используем роутер edit_comment из comments.py
            const response = await fetch(`/rents/${currentRentId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: newText.trim()
                })
            });

            if (response.ok) {
                // Обновляем локальные данные
                const commentIndex = comments.findIndex(c => c.id === commentId);
                if (commentIndex !== -1) {
                    comments[commentIndex].content = newText.trim();
                    renderComments(comments);
                }
            } else {
                showError('Не удалось обновить отзыв');
            }
        } catch (error) {
            console.error('Ошибка при редактировании отзыва:', error);
            showError('Ошибка сети');
        }
    }

    async function deleteComment(commentId) {
        if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

        try {
            // Используем роутер delete_comment из comments.py
            const response = await fetch(`/rents/${currentRentId}/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                // Удаляем из локальных данных
                comments = comments.filter(c => c.id !== commentId);
                renderComments(comments);
            } else {
                showError('Не удалось удалить отзыв');
            }
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            showError('Ошибка сети');
        }
    }

    // ==================== Функции навигации ====================

    async function navigateToHome() {
        try {
            const response = await fetch('/web/', {
                method: 'GET'
            });
            if (response.ok) {
                window.location.href = '/web/';
            } else {
                fallbackNavigation('home');
            }
        } catch (error) {
            fallbackNavigation('home');
        }
    }

    async function navigateToFavorites() {
        try {
            const response = await fetch('/web/', { // роутер get_favorites_html
                method: 'GET'
            });
            if (response.ok) {
                window.location.href = '/web/';
            } else {
                fallbackNavigation('favorites');
            }
        } catch (error) {
            fallbackNavigation('favorites');
        }
    }

    async function navigateToBooking(rentId) {
        try {
            // Используем роутер get_booking_html из web.py
            const response = await fetch('/web/', {
                method: 'GET'
            });
            if (response.ok) {
                window.location.href = `/web/?id=${rentId}`;
            } else {
                window.location.href = `/booking.html?id=${rentId}`;
            }
        } catch (error) {
            window.location.href = `/booking.html?id=${rentId}`;
        }
    }

    async function performSearch() {
        const searchInput = document.getElementById('q');
        const query = searchInput ? searchInput.value.trim() : '';
        
        if (!query) {
            alert('Введите поисковый запрос');
            return;
        }

        try {
            // Используем роутер get_rents из rents.py с параметром поиска
            const response = await fetch(`/rents/?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const searchResults = await response.json();
                // Здесь можно отобразить результаты поиска
                // Например, перейти на страницу rent.html с результатами
                window.location.href = `/rent.html?q=${encodeURIComponent(query)}`;
            } else {
                showError('Ошибка при поиске');
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
            showError('Ошибка сети при поиске');
        }
    }

    // ==================== Вспомогательные функции ====================

    function setupEventHandlers() {
        // Обработчик для кнопок "Подробнее" в похожих вариантах
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('similar-open')) {
                e.preventDefault();
                const rentId = e.target.dataset.id;
                if (rentId) {
                    await navigateToRentDetail(rentId);
                }
            }
        });
    }

    async function navigateToRentDetail(rentId) {
        try {
            // Используем роутер get_detail_html из web.py
            const response = await fetch('/web/', {
                method: 'GET'
            });
            if (response.ok) {
                window.location.href = `/detail.html?id=${rentId}`;
            } else {
                window.location.href = `/detail.html?id=${rentId}`;
            }
        } catch (error) {
            window.location.href = `/detail.html?id=${rentId}`;
        }
    }

    function openHelpBlock() {
        // Создаем блок помощи
        let helpBlock = document.getElementById('helpBlock');
        if (!helpBlock) {
            helpBlock = document.createElement('div');
            helpBlock.id = 'helpBlock';
            helpBlock.className = 'overlay-block';
            helpBlock.setAttribute('aria-hidden', 'true');
            helpBlock.innerHTML = `
                <div class="overlay-dialog" role="dialog" aria-label="Помощь">
                    <button class="help-close" id="closeHelpBlock" aria-label="Закрыть">
                        <i></i>
                    </button>
                    <header class="modal-header">
                        <h3>Помощь</h3>
                    </header>
                    <div class="post-form" style="padding:20px; max-width:500px;">
                        <p>Здесь будет информация о помощи пользователям.</p>
                        <p>В демонстрационной версии этот блок показывает макет окна помощи.</p>
                    </div>
                </div>
            `;
            document.body.appendChild(helpBlock);
            
            // Обработчик закрытия
            const closeBtn = document.getElementById('closeHelpBlock');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    helpBlock.setAttribute('aria-hidden', 'true');
                });
            }
            
            // Закрытие по клику на фон
            helpBlock.addEventListener('click', (e) => {
                if (e.target === helpBlock) {
                    helpBlock.setAttribute('aria-hidden', 'true');
                }
            });
        }
        
        helpBlock.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            const closeBtn = document.getElementById('closeHelpBlock');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    function fallbackNavigation(tab) {
        const routes = {
            'rent': '/web/',
            'list': '/web/',
            'favorites': '/web/',
            'signup': '/web/auth',
            'home': '/web/'
        };
        
        if (routes[tab]) {
            window.location.href = routes[tab];
        } else {
            window.location.href = '/web/';
        }
    }

    function showError(message) {
        console.error(message);
        // Можно добавить более красивый вывод ошибки
        alert(message);
    }

    // ==================== Инициализация Feather Icons ====================
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    console.log('Detail handler initialized');
});