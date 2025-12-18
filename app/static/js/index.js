 // Кнопка "Арендовать" (используем роутер из web.py)
      const rentButton = document.querySelector('[data-tab="rent"]');
      if (rentButton) {
        rentButton.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = '/web/rent';
        });
      }
      
      // Кнопка "Сдать в аренду" (используем роутер из web.py)
      const listButton = document.querySelector('[data-tab="list"]');
      if (listButton) {
        listButton.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = '/web/list';
        });
      }
      
      // Кнопка "Избранное" уже имеет правильную ссылку /web/favorites
      
      // Кнопка "Зарегистрироваться" (используем роутер из web.py)
      const signupButton = document.querySelector('[data-tab="signup"]');
      if (signupButton) {
        signupButton.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = '/web/auth';
        });
      }
      
      // Кнопка "Перейти к предложениям"
      const toOffersButton = document.querySelector('a[href="/web/rent"]');
      if (toOffersButton) {
        toOffersButton.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = '/web/rent';
        });
      }
      
      // ====================
      // 2. ПОИСК
      // ====================
      
      const searchForm = document.getElementById('searchForm');
      if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const query = document.getElementById('q').value.trim();
          if (query) {
            // Используем роутер для поиска через аренду
            window.location.href = `/web/rent?q=${encodeURIComponent(query)}`;
          }
        });
      }
      
      const serviceFindForm = document.getElementById('serviceFindForm');
      if (serviceFindForm) {
        serviceFindForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const location = document.getElementById('serviceLocation').value.trim();
          const arrive = document.getElementById('serviceArrive').value;
          const depart = document.getElementById('serviceDepart').value;
          const guests = document.getElementById('serviceGuests').value;
          
          // Собираем параметры для поиска
          const params = new URLSearchParams();
          if (location) params.append('q', location);
          if (arrive) params.append('check_in', arrive);
          if (depart) params.append('check_out', depart);
          if (guests) params.append('guests', guests);
          
          // Перенаправляем на страницу аренды с параметрами
          window.location.href = `/web/rent?${params.toString()}`;
        });
      }
      
      // ====================
      // 3. БЛОК "ПОМОЩЬ"
      // ====================
      
      const helpButton = document.querySelector('[data-tab="help"]');
      const helpModal = document.getElementById('helpModal');
      const closeHelpButton = document.getElementById('closeHelp');
      const helpForm = document.getElementById('helpContactForm');
      
      // Открытие блока "Помощь"
      if (helpButton) {
        helpButton.addEventListener('click', function (e) {
            e.preventDefault();

            const userData = localStorage.getItem('ugol_user');
            if (!userData) {
                alert('Чтобы задать вопрос, нужно войти или зарегистрироваться');
                window.location.href = '/web/auth';
                return;
            }

            if (helpModal) {
                helpModal.setAttribute('aria-hidden', 'false');
                setTimeout(() => {
                    const firstInput = helpModal.querySelector('input[name="email"]');
                    if (firstInput) firstInput.focus();
                }, 100);
            }
        });
    }
      
      // Закрытие блока "Помощь"
      if (closeHelpButton) {
        closeHelpButton.addEventListener('click', function(e) {
          e.preventDefault();
          if (helpModal) {
            helpModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      // Закрытие при клике вне блока
      if (helpModal) {
        helpModal.addEventListener('click', function(e) {
          if (e.target === helpModal) {
            helpModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      // Отправка формы помощи (используем роутер из help.py)
      if (helpForm) {
        helpForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const userData = localStorage.getItem('ugol_user');
            if (!userData) {
                alert('Чтобы задать вопрос, нужно войти или зарегистрироваться');
                window.location.href = '/web/auth';
                return;
            }

          const formData = new FormData(helpForm);
          const email = formData.get('email');
          const message = formData.get('message');
          
          if (!email || !message) {
            alert('Пожалуйста, заполните все поля');
            return;
          }
          
          try {
            // Получаем токен авторизации
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            const API_BASE_URL = 'http://localhost:8000';
            
            const response = await fetch(`${API_BASE_URL}/help/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                content: `Email: ${email}\nСообщение: ${message}`
              })
            });
            
            if (response.ok) {
              alert('Ваше сообщение отправлено! Мы ответим вам в ближайшее время.');
              helpForm.reset();
              helpModal.setAttribute('aria-hidden', 'true');
            } else {
              const error = await response.json();
              throw new Error(error.detail || 'Ошибка при отправке сообщения');
            }
          } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            
            // Fallback: если API не доступен, отправляем через mailto
            const subject = 'Вопрос с сайта Угол Комфорта';
            const body = `Email: ${email}\n\nСообщение: ${message}`;
            window.location.href = `mailto:support@ugolkomforta.example?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            alert('Сообщение отправлено через почтовый клиент. Спасибо за обращение!');
            helpForm.reset();
            helpModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      // ====================
      // 4. МОДАЛЬНОЕ ОКНО ПРОСМОТРА
      // ====================
      
      const viewModal = document.getElementById('viewModal');
      const closeViewButton = document.getElementById('closeView');
      const closeViewBtn = document.getElementById('closeViewBtn');
      const bookNowButton = document.getElementById('bookNow');
      
      // Закрытие модального окна просмотра
      if (closeViewButton) {
        closeViewButton.addEventListener('click', function() {
          if (viewModal) {
            viewModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      if (closeViewBtn) {
        closeViewBtn.addEventListener('click', function() {
          if (viewModal) {
            viewModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      // Закрытие при клике вне модального окна
      if (viewModal) {
        viewModal.addEventListener('click', function(e) {
          if (e.target === viewModal) {
            viewModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      // Кнопка "Забронировать"
      if (bookNowButton) {
        bookNowButton.addEventListener('click', function() {
          // Получаем ID объявления из модального окна
          const rentId = viewModal.getAttribute('data-rent-id');
          if (rentId) {
            // Переходим на страницу бронирования
            window.location.href = `/web/booking?id=${encodeURIComponent(rentId)}`;
          } else {
            alert('Не удалось получить информацию об объявлении');
          }
        });
      }
      
      // ====================
      // 5. МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ
      // ====================
      
      const postModal = document.getElementById('postModal');
      const closePostButton = document.getElementById('closePost');
      const cancelPostButton = document.getElementById('cancelPost');
      const postForm = document.getElementById('postForm');
      
      // Закрытие модального окна добавления
      if (closePostButton) {
        closePostButton.addEventListener('click', function() {
          if (postModal) {
            postModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      if (cancelPostButton) {
        cancelPostButton.addEventListener('click', function() {
          if (postModal) {
            postModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      // Закрытие при клике вне модального окна
      if (postModal) {
        postModal.addEventListener('click', function(e) {
          if (e.target === postModal) {
            postModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
      
      // Отправка формы добавления объявления (используем роутер из rents.py)
      if (postForm) {
        postForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(postForm);
          const title = formData.get('title');
          const city = formData.get('city');
          const description = formData.get('description');
          const beds = formData.get('beds');
          const price = formData.get('price');
          const photos = formData.get('photos');
          const availFrom = formData.get('avail_from');
          const availTo = formData.get('avail_to');
          const pet = formData.get('pet') ? true : false;
          const parking = formData.get('parking') ? true : false;
          const wifi = formData.get('wifi') ? true : false;
          
          if (!title || !city || !description || !beds || !price || !photos) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
          }
          
          try {
            // Получаем токен авторизации
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            const API_BASE_URL = 'http://localhost:8000';
            
            // Получаем ID пользователя
            let userId = null;
            try {
              const user = JSON.parse(localStorage.getItem('ugol_user') || '{}');
              userId = user.id;
            } catch (error) {
              console.error('Ошибка получения ID пользователя:', error);
            }
            
            const response = await fetch(`${API_BASE_URL}/rents/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                title: title,
                address: city,
                description: description,
                guests: parseInt(beds),
                price: parseInt(price),
                photos: photos.split('\n').filter(url => url.trim()),
                available_from: availFrom || null,
                available_to: availTo || null,
                pet_friendly: pet,
                has_parking: parking,
                has_wifi: wifi,
                id_user: userId,
                active: true
              })
            });
            
            if (response.ok) {
              alert('Объявление успешно добавлено!');
              postForm.reset();
              postModal.setAttribute('aria-hidden', 'true');
              
              // Обновляем список объявлений
              loadRentals();
              
            } else {
              const error = await response.json();
              throw new Error(error.detail || 'Ошибка при добавлении объявления');
            }
          } catch (error) {
            console.error('Ошибка добавления объявления:', error);
            alert('Не удалось добавить объявление. Пожалуйста, попробуйте позже.');
          }
        });
      }
      
      // ====================
      // 6. ЗАГРУЗКА ОБЪЯВЛЕНИЙ
      // ====================

      
      function renderRentals(rentals) {
        const listingsContainer = document.getElementById('listings');
        const cardTemplate = document.getElementById('cardTpl');
        
        if (!listingsContainer || !cardTemplate) return;
        
        listingsContainer.innerHTML = '';
        
        if (!Array.isArray(rentals) || rentals.length === 0) {
          listingsContainer.innerHTML = '<p style="color:var(--muted);text-align:center;">Объявлений пока нет</p>';
          return;
        }
        
        // Ограничиваем количество отображаемых объявлений для главной страницы
        const displayRentals = rentals.slice(0, 6);
        
        displayRentals.forEach(rental => {
          const cardClone = cardTemplate.content.cloneNode(true);
          
          // Заполняем данные карточки
          const card = cardClone.querySelector('.card');
          const thumb = cardClone.querySelector('.thumb');
          const title = cardClone.querySelector('.title');
          const meta = cardClone.querySelector('.meta');
          const price = cardClone.querySelector('.price');
          const tags = cardClone.querySelector('.tags');
          const favButton = cardClone.querySelector('.fav');
          const detailsButton = cardClone.querySelector('.details');
          
          // Устанавливаем изображение
          const imageUrl = rental.photos && rental.photos.length > 0 
            ? rental.photos[0] 
            : '/static/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg';
          thumb.src = imageUrl;
          thumb.alt = rental.title || 'Объявление';
          
          // Устанавливаем заголовок
          title.textContent = rental.title || 'Без названия';
          
          // Устанавливаем мета-информацию
          const location = rental.address || rental.city || 'Город не указан';
          const guests = rental.guests || 1;
          meta.textContent = `${location} · ${guests === 0 ? 'Студия' : guests + 'к'}`;
          
          // Устанавливаем цену
          price.textContent = `₽${rental.price || 0}/ночь`;
          
          // Устанавливаем теги
          const tagItems = [];
          if (rental.pet_friendly) tagItems.push('Питомцы');
          if (rental.has_parking) tagItems.push('Парковка');
          if (rental.has_wifi) tagItems.push('Wi-Fi');
          
          if (tagItems.length > 0) {
            tagItems.forEach(tagText => {
              const tagSpan = document.createElement('span');
              tagSpan.className = 'tag-pill';
              tagSpan.textContent = tagText;
              tags.appendChild(tagSpan);
            });
          }
          
          // Проверяем, находится ли объявление в избранном
          try {
            const favorites = JSON.parse(localStorage.getItem('ugol_fav') || '[]');
            const isFavorite = favorites.some(fav => fav.id === rental.id);
            if (isFavorite) {
              favButton.setAttribute('aria-pressed', 'true');
              favButton.classList.add('active');
            }
          } catch (error) {
            console.error('Ошибка проверки избранного:', error);
          }
          
          // Обработчик для кнопки избранного
          favButton.addEventListener('click', function() {
            toggleFavorite(rental, favButton);
          });
          
          // Обработчик для кнопки "Подробнее"
          detailsButton.addEventListener('click', function() {
            openRentalDetails(rental);
          });
          
          // Обработчик для клика по карточке
          card.addEventListener('click', function(e) {
            if (!e.target.closest('.fav') && !e.target.closest('.details')) {
              openRentalDetails(rental);
            }
          });
          
          listingsContainer.appendChild(cardClone);
        });
      }

      // ====================
      // 7. ИЗБРАННОЕ
      // ====================
      
      function toggleFavorite(rental, favButton) {
        try {
          const favorites = JSON.parse(localStorage.getItem('ugol_fav') || '[]');
          const isCurrentlyFavorite = favButton.getAttribute('aria-pressed') === 'true';
          
          if (isCurrentlyFavorite) {
            // Удаляем из избранного
            const updatedFavorites = favorites.filter(fav => fav.id !== rental.id);
            localStorage.setItem('ugol_fav', JSON.stringify(updatedFavorites));
            favButton.setAttribute('aria-pressed', 'false');
            favButton.classList.remove('active');
          } else {
            // Добавляем в избранное
            const rentalData = {
              id: rental.id,
              title: rental.title,
              city: rental.address || rental.city,
              beds: rental.guests,
              price: rental.price,
              description: rental.description,
              photo: rental.photos && rental.photos.length > 0 ? rental.photos[0] : '',
              pet_friendly: rental.pet_friendly,
              has_parking: rental.has_parking,
              has_wifi: rental.has_wifi
            };
            
            favorites.push(rentalData);
            localStorage.setItem('ugol_fav', JSON.stringify(favorites));
            favButton.setAttribute('aria-pressed', 'true');
            favButton.classList.add('active');
          }
          
          // Оповещаем другие страницы об изменении избранного
          window.dispatchEvent(new CustomEvent('ugol:favorites-changed'));
          
        } catch (error) {
          console.error('Ошибка при работе с избранным:', error);
        }
      }
      
      // ====================
      // 8. ПРОСМОТР ДЕТАЛЕЙ
      // ====================
      
      function openRentalDetails(rental) {
        const viewModal = document.getElementById('viewModal');
        const viewTitle = document.getElementById('viewTitle');
        const viewImg = document.getElementById('viewImg');
        const viewDesc = document.getElementById('viewDesc');
        const viewMeta = document.getElementById('viewMeta');
        const viewTags = document.getElementById('viewTags');
        
        if (!viewModal || !viewTitle || !viewImg) return;
        
        // Заполняем данные модального окна
        viewTitle.textContent = rental.title || 'Объявление';
        viewImg.src = rental.photos && rental.photos.length > 0 
          ? rental.photos[0] 
          : '/static/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg';
        viewImg.alt = rental.title || 'Объявление';
        
        viewDesc.textContent = rental.description || 'Описание отсутствует';
        
        const location = rental.address || rental.city || 'Город не указан';
        const guests = rental.guests || 1;
        const price = rental.price || 0;
        viewMeta.textContent = `${location} · ${guests === 0 ? 'Студия' : guests + 'к'} · ₽${price}/ночь`;
        
        // Очищаем теги
        viewTags.innerHTML = '';
        
        // Добавляем теги
        if (rental.pet_friendly) {
          const tag = document.createElement('span');
          tag.className = 'tag-pill';
          tag.textContent = 'Питомцы';
          viewTags.appendChild(tag);
        }
        
        if (rental.has_parking) {
          const tag = document.createElement('span');
          tag.className = 'tag-pill';
          tag.textContent = 'Парковка';
          viewTags.appendChild(tag);
        }
        
        if (rental.has_wifi) {
          const tag = document.createElement('span');
          tag.className = 'tag-pill';
          tag.textContent = 'Wi-Fi';
          viewTags.appendChild(tag);
        }
        
        // Сохраняем ID объявления для бронирования
        viewModal.setAttribute('data-rent-id', rental.id);
        
        // Показываем модальное окно
        viewModal.setAttribute('aria-hidden', 'false');
      }
      
      // ====================
      // 9. ССЫЛКИ В ФУТЕРЕ
      // ====================
      
      // Обработчики для ссылок в футере
      document.querySelectorAll('.site-footer a[href]').forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          
          if (href === '#team' || href === '#history' || href === '#mission') {
            // Это якорные ссылки - обрабатываем плавную прокрутку
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
              targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }
          // Остальные ссылки обрабатываются стандартно
        });
      });
      
      // ====================
      // 10. ИНИЦИАЛИЗАЦИЯ
      // ====================
      
      // Устанавливаем даты по умолчанию для формы поиска
      function setDefaultDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };
        
        const arriveInput = document.getElementById('serviceArrive');
        const departInput = document.getElementById('serviceDepart');
        
        if (arriveInput) {
          arriveInput.value = formatDate(today);
          arriveInput.min = formatDate(today);
        }
        
        if (departInput) {
          departInput.value = formatDate(tomorrow);
          departInput.min = formatDate(tomorrow);
        }
        
        // Обновляем минимальную дату выезда при изменении даты заезда
        if (arriveInput && departInput) {
          arriveInput.addEventListener('change', function() {
            const arriveDate = new Date(this.value);
            const nextDay = new Date(arriveDate);
            nextDay.setDate(nextDay.getDate() + 1);
            departInput.min = formatDate(nextDay);
            
            if (new Date(departInput.value) < nextDay) {
              departInput.value = formatDate(nextDay);
            }
          });
        }
      }
      
      // Запускаем инициализацию
      setDefaultDates();
      loadRentals();
      
      // Инициализируем Feather icons
      if (typeof feather !== 'undefined') {
        feather.replace();
      }
    ;