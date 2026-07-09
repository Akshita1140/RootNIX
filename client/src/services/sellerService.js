import api from './api'

export const createSellerProfile = (payload) => api.post('/sellers/profile', payload)
export const getMySellerProfile = () => api.get('/sellers/me')
export const updateSellerProfile = (payload) => api.patch('/sellers/profile', payload)
export const deleteSellerProfile = () => api.delete('/sellers/profile')
export const getSellerDashboardStats = () => api.get('/sellers/dashboard/stats')
