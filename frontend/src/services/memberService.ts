import { User } from '../types/user';
import { axiosInstance } from '../utils/axios';
import { isAxiosError } from 'axios';
import { API_ENDPOINTS } from '../config/api.config';
import i18n from '../i18n';

export const memberService = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE);
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET_BY_ID(id));
    return response.data;
  },

  createMember: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.CREATE_USER, data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('members.errors.createError'));
      }
      throw error;
    }
  },

  updateMember: async (userId: string, data: Partial<User>): Promise<User> => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.AUTH.UPDATE_USER(userId), data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('members.errors.updateError'));
      }
      throw error;
    }
  },

  deleteMember: async (userId: string): Promise<void> => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.AUTH.DELETE_USER(userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('members.errors.deleteError'));
      }
      throw error;
    }
  },

  getOrgAdmins: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE, {
        params: { userType: 'ORGADMIN' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching org admins:', error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('members.errors.fetchError'));
      }
      throw error;
    }
  }
}; 