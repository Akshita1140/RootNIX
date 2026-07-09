import api from './api';

// payload: { name?, city?, pincode?, lat?, lng? }
export const updateProfile = (payload) => api.patch('/users/update-profile', payload);

// file: File object from an <input type="file" />
export const updateAvatar = (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
