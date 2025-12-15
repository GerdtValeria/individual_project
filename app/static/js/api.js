// static/js/api.js
// Полностью переработан под реальную структуру API проекта

const API_BASE_URL = '';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include', // Важно для cookies (access_token)
    ...options
  });

  // Обработка ошибок
  if (!response.ok) {
    const error = new Error('Request failed');
    error.status = response.status;
    try {
      const data = await response.json();
      error.detail = data.detail || JSON.stringify(data);
    } catch {
      error.detail = await response.text();
    }
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// ==================== AUTH ====================
// POST /auth/register
export function registerUser(name, email, password) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password
    })
  });
}

// POST /auth/login
export function loginUser(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password
    })
  });
}

// GET /auth/me
export async function getCurrentUser() {
  try {
    return await apiRequest('/auth/me');
  } catch (e) {
    if (e.status === 401) return null;
    throw e;
  }
}

// POST /auth/logout
export function logoutUser() {
  return apiRequest('/auth/logout', {
    method: 'POST'
  });
}

// ==================== RENTS ====================
// GET /rents - с фильтрацией
export function getRents(params = {}) {
  const searchParams = new URLSearchParams();
  
  if (params.q) searchParams.set('q', params.q);
  if (params.title) searchParams.set('title', params.title);
  if (params.address) searchParams.set('address', params.address);
  if (params.price !== undefined) searchParams.set('price', params.price);
  if (params.description) searchParams.set('description', params.description);
  if (params.id_category) searchParams.set('id_category', params.id_category);
  if (params.id_user !== undefined) searchParams.set('id_user', params.id_user);
  if (params.active !== undefined) searchParams.set('active', params.active);
  if (params.page) searchParams.set('page', params.page);
  if (params.size) searchParams.set('size', params.size);
  if (params.id) searchParams.set('id', params.id);

  const query = searchParams.toString();
  const path = query ? `/rents?${query}` : '/rents';
  return apiRequest(path);
}

// GET /rents/{id}
export function getRent(id) {
  return apiRequest(`/rents/${id}`);
}

// POST /rents
export function createRent(data) {
  return apiRequest('/rents', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// PUT /rents/{id}
export function updateRent(id, data) {
  return apiRequest(`/rents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// DELETE /rents/{id}
export function deleteRent(id) {
  return apiRequest(`/rents/${id}`, {
    method: 'DELETE'
  });
}

// ==================== BOOKINGS ====================
// GET /booking
export function getBookings() {
  return apiRequest('/booking');
}

// GET /booking/me
export function getMyBookings() {
  return apiRequest('/booking/me');
}

// POST /booking
export function createBooking(data) {
  return apiRequest('/booking', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ==================== COMMENTS ====================
// GET /rents/{rent_id}/comments
export function getComments(rentId) {
  return apiRequest(`/rents/${rentId}/comments`);
}

// POST /rents/{rent_id}/comments
export function addComment(rentId, content, rating = 5) {
  return apiRequest(`/rents/${rentId}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      content,
      rating: parseInt(rating)
    })
  });
}

// ==================== CATEGORIES ====================
// GET /categories
export function getCategories() {
  return apiRequest('/categories');
}

// GET /categories/{id}
export function getCategory(id) {
  return apiRequest(`/categories/${id}`);
}

// POST /categories (только для админа)
export function createCategory(name) {
  return apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
}

// PUT /categories/{id} (только для админа)
export function updateCategory(id, name) {
  return apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name })
  });
}

// DELETE /categories/{id} (только для админа)
export function deleteCategory(id) {
 return apiRequest(`/categories/${id}`, {
    method: 'DELETE'
  });
}

// ==================== HELP (ВОПРОСЫ) ====================
// GET /help (только для админа)
export function getHelpRequests() {
  return apiRequest('/help');
}

// POST /help
export function addHelp(content) {
  return apiRequest('/help', {
    method: 'POST',
    body: JSON.stringify({ content })
  });
}

// ==================== FAVORITES ====================
// GET /favorites
export function getFavorites() {
  return apiRequest('/favorites');
}

// POST /favorites (добавить в избранное)
export function addFavorite(rentId) {
  return apiRequest('/favorites', {
    method: 'POST',
    body: JSON.stringify({ id_rent: rentId })
  });
}

// DELETE /favorites/{id} (удалить избранного)
export function removeFavorite(rentId) {
  return apiRequest(`/favorites/${rentId}`, {
    method: 'DELETE'
  });
}

// ==================== USERS ====================
// GET /users (только для админа)
export function getUsers() {
  return apiRequest('/users');
}

// ==================== ROLES ====================
// GET /roles
export function getRoles() {
  return apiRequest('/roles');
}

// ==================== HELPER FUNCTIONS ====================
// Проверка на админа
export async function isAdmin() {
  try {
    const user = await getCurrentUser();
    return user && user.role_id === 2;
  } catch {
    return false;
  }
}

// Экспорт объекта API для обратной совместимости
export const API = {
  auth: {
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    me: getCurrentUser
  },
  rents: {
    getAll: getRents,
    getOne: getRent,
    create: createRent,
    update: updateRent,
    delete: deleteRent
  },
  categories: {
    getAll: getCategories,
    getOne: getCategory,
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory
  },
  favorites: {
    getAll: getFavorites,
    add: addFavorite,
    remove: removeFavorite
  },
  bookings: {
    getAll: getBookings,
    getMy: getMyBookings,
    create: createBooking
  },
  comments: {
    getAll: getComments,
    add: addComment
  },
  help: {
    getAll: getHelpRequests,
    add: addHelp
  },
  users: {
    getAll: getUsers
  },
  roles: {
    getAll: getRoles
  },
  utils: {
    isAdmin: isAdmin
  }
};