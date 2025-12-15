// static/js/signup.js

const API_BASE = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
  // Элементы форм (переименуй под свои id, если нужно)
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  const regNameInput = document.getElementById('register-name');
  const regEmailInput = document.getElementById('register-email');
  const regPasswordInput = document.getElementById('register-password');
  const regPasswordConfirmInput = document.getElementById('register-password-confirm');

  const loginEmailInput = document.getElementById('login-email');
  const loginPasswordInput = document.getElementById('login-password');

  const errorBox = document.getElementById('auth-error');     // div для ошибок
  const successBox = document.getElementById('auth-success'); // div для успеха

  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = 'block';
    } else {
      alert(message);
    }
    if (successBox) successBox.style.display = 'none';
  }

  function showSuccess(message) {
    if (successBox) {
      successBox.textContent = message;
      successBox.style.display = 'block';
    }
    if (errorBox) errorBox.style.display = 'none';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ====== РЕГИСТРАЦИЯ ======
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = regNameInput?.value.trim();
      const email = regEmailInput?.value.trim();
      const password = regPasswordInput?.value;
      const passwordConfirm = regPasswordConfirmInput?.value;

      if (!name || !email || !password || !passwordConfirm) {
        showError('Заполните все поля');
        return;
      }

      if (name.length < 2) {
        showError('Имя должно быть не короче 2 символов');
        return;
      }

      if (!validateEmail(email)) {
        showError('Некорректный email');
        return;
      }

      if (password.length < 6) {
        showError('Пароль должен содержать не менее 6 символов');
        return;
      }

      if (password !== passwordConfirm) {
        showError('Пароли не совпадают');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const resp = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await resp.json().catch(() => ({}));

        if (resp.status === 200) {
          showSuccess('Регистрация успешна! Теперь вы можете войти.');
          // Можно автоматически переключить на форму логина
          const toLoginBtn = document.getElementById('toggle-login');
          if (toLoginBtn) toLoginBtn.click();
        } else if (resp.status === 409) {
          // detail: "Пользователь с таким email уже существует"
          showError(data.detail || 'Пользователь с таким email уже существует');
        } else {
          showError(data.detail || `Ошибка регистрации (код ${resp.status})`);
        }
      } catch (err) {
        showError('Ошибка сети. Проверьте подключение к серверу.');
        console.error(err);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ====== АВТОРИЗАЦИЯ ======
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = loginEmailInput?.value.trim();
      const password = loginPasswordInput?.value;

      if (!email || !password) {
        showError('Заполните все поля');
        return;
      }

      if (!validateEmail(email)) {
        showError('Некорректный email');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const resp = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
          // если бекенд ставит access_token в cookie — нужно отправлять credentials
          credentials: 'include',
        });

        const data = await resp.json().catch(() => ({}));

        if (resp.status === 200 && data.access_token) {
          // Успешная авторизация — редирект на /web
          showSuccess('Успешный вход, перенаправление...');
          window.location.href = '/web';
        } else if (resp.status === 401 || resp.status === 400) {
          showError(data.detail || 'Неверный email или пароль');
        } else {
          showError(data.detail || `Ошибка авторизации (код ${resp.status})`);
        }
      } catch (err) {
        showError('Ошибка сети. Проверьте подключение к серверу.');
        console.error(err);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ====== ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ФОРМАМИ (если сделано на одной странице) ======
  const toggleToRegister = document.getElementById('toggle-register');
  const toggleToLogin = document.getElementById('toggle-login');

  if (toggleToRegister && loginForm && registerForm) {
    toggleToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      if (errorBox) errorBox.style.display = 'none';
      if (successBox) successBox.style.display = 'none';
    });
  }

  if (toggleToLogin && loginForm && registerForm) {
    toggleToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
      if (errorBox) errorBox.style.display = 'none';
      if (successBox) successBox.style.display = 'none';
    });
  }
});
