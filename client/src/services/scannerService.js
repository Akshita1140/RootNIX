import api from './api';

// imageFile: File — single image from <input type="file"> or drag-drop
export const scanPlant = (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return api.post('/scanner/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Logged-in user's last 15 days of scans (older ones auto-delete server-side)
export const getScanHistory = () => api.get('/scanner/history');
