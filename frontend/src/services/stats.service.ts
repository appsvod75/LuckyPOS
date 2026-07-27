import api from './api';

export const statsApi = {
    getDashboardStats: (branchId?: number) => api.get('/stats/dashboard', { params: { branchId } })
};
