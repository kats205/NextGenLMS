export const getStoredUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : {};
    } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        return {};
    }
};