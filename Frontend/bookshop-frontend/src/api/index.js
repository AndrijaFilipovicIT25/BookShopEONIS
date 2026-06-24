import axios from 'axios'

const token = () => localStorage.getItem('token')

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${token()}` }
})

// ─── Clients ──────────────────────────────────────────────────────────────────

export const booksClient = axios.create({
  baseURL: 'http://localhost:5003/api/books'
})

export const usersClient = axios.create({
  baseURL: 'http://localhost:5002'
})

export const ordersClient = axios.create({
  baseURL: 'http://localhost:5004'
})

// ─── Books API ────────────────────────────────────────────────────────────────

export const booksApi = {
  getAll: (page = 1, size = 12) => booksClient.get(`?pageNumber=${page}&pageSize=${size}`),
  getById: (id) => booksClient.get(`/${id}`),
  create: (data) => booksClient.post('/', data, authHeaders()),
  update: (id, data) => booksClient.put(`/${id}`, data, authHeaders()),
  delete: (id) => booksClient.delete(`/${id}`, authHeaders()),
  uploadFrontImage: (id, file) => {
    const form = new FormData()
    form.append('image', file)
    return booksClient.post(`/${id}/upload-front-image`, form, authHeaders())
  },uploadBackImage: (id, file) => {
  const form = new FormData()
  form.append('image', file)
  return booksClient.post(`/${id}/upload-back-image`, form, authHeaders())
},
uploadSpineImage: (id, file) => {
  const form = new FormData()
  form.append('image', file)
  return booksClient.post(`/${id}/upload-spine-image`, form, authHeaders())
},

  // Categories
  getCategories: () => booksClient.get('/categories'),
  createCategory: (data) => booksClient.post('/categories', data, authHeaders()),
  updateCategory: (id, data) => booksClient.put(`/categories/${id}`, data, authHeaders()),
  deleteCategory: (id) => booksClient.delete(`/categories/${id}`, authHeaders()),

  // Authors
  getAuthors: () => booksClient.get('/authors'),
  getAuthorById: (id) => booksClient.get(`/authors/${id}`),
  createAuthor: (data) => booksClient.post('/authors', data, authHeaders()),
  updateAuthor: (id, data) => booksClient.put(`/authors/${id}`, data, authHeaders()),
  deleteAuthor: (id) => booksClient.delete(`/authors/${id}`, authHeaders()),

  // Collections
  getCollections: () => booksClient.get('/collections'),
  getCollectionById: (id) => booksClient.get(`/collections/${id}`),
  createCollection: (data) => booksClient.post('/collections', data, authHeaders()),
  updateCollection: (id, data) => booksClient.put(`/collections/${id}`, data, authHeaders()),
  deleteCollection: (id) => booksClient.delete(`/collections/${id}`, authHeaders()),
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => usersClient.post('/auth/register', data),
  login: (data) => usersClient.post('/auth/login', data),
  refresh: (refreshToken) => usersClient.post('/auth/refresh', { refreshToken }),
}

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  getMe: () => usersClient.get('/users/me', authHeaders()),
  updateMe: (data) => usersClient.put('/users/me', data, authHeaders()),
}

// ─── Orders API ───────────────────────────────────────────────────────────────

export const ordersApi = {
  // Cart
  getCart: () => ordersClient.get('/cart', authHeaders()),
  addToCart: (data) => ordersClient.post('/cart/items', data, authHeaders()),
  updateCartItem: (itemId, data) => ordersClient.put(`/cart/items/${itemId}`, data, authHeaders()),
  removeCartItem: (itemId) => ordersClient.delete(`/cart/items/${itemId}`, authHeaders()),
  clearCart: () => ordersClient.delete('/cart', authHeaders()),

  // Orders
  checkout: (data) => ordersClient.post('/orders/checkout', data, token() ? authHeaders() : {}),
  getMyOrders: () => ordersClient.get('/orders/my', authHeaders()),
  getOrderById: (id) => ordersClient.get(`/orders/${id}`, authHeaders()),
  getAllOrders: () => ordersClient.get('/orders', authHeaders()),
}
