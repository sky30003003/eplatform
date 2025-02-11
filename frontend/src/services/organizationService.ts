import axios, { isAxiosError } from 'axios';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '../types/organization';
import { User } from '../types/user';
import axiosInstance from '../utils/axios';
import { API_ENDPOINTS } from '../config/api.config';
import { generateTempPassword } from '../utils/password';
import i18n from '../i18n';

interface CreateOrgAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  personalCode: string;
  userType: string;
  organizationId: string;
}

export const organizationService = {
  getAll: async (): Promise<Organization[]> => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ORGANIZATIONS.BASE);
      return response.data;
    } catch (error) {
      console.error('Error in getAll organizations:', error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('organizations.messages.noData'));
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Organization> => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ORGANIZATIONS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error in getById organization ${id}:`, error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('organizations.messages.error'));
      }
      throw error;
    }
  },

  create: async (data: CreateOrganizationDto): Promise<Organization> => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.ORGANIZATIONS.BASE, data);
      return response.data;
    } catch (error) {
      console.error('Error in create organization:', error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('organizations.messages.error'));
      }
      throw error;
    }
  },

  update: async (id: string, data: UpdateOrganizationDto): Promise<Organization> => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.ORGANIZATIONS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      console.error(`Error in update organization ${id}:`, error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('organizations.messages.error'));
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.ORGANIZATIONS.DELETE(id));
    } catch (error) {
      console.error(`Error in delete organization ${id}:`, error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('organizations.messages.error'));
      }
      throw error;
    }
  },

  getOrgAdmin: async (organizationId: string): Promise<User | null> => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ORGANIZATIONS.GET_ADMIN(organizationId));
      return response.data;
    } catch (error) {
      console.error(`Error in getOrgAdmin for organization ${organizationId}:`, error);
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        throw new Error(error.response?.data?.message || i18n.t('orgAdmin.errors.generic'));
      }
      throw error;
    }
  },

  createOrgAdmin: async (organizationId: string, data: Omit<CreateOrgAdminDto, 'password' | 'userType' | 'organizationId'>): Promise<{ user: User; tempPassword: string }> => {
    try {
      const tempPassword = generateTempPassword();
      
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.CREATE_ORGADMIN, {
        ...data,
        organizationId,
        userType: 'ORGADMIN',
        password: tempPassword,
        personalCode: data.personalCode || undefined
      });

      return {
        user: response.data,
        tempPassword
      };
    } catch (error) {
      console.error('Error in createOrgAdmin:', error);
      if (isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
        
        // Mapăm codurile de eroare la mesaje specifice din i18n
        if (error.response?.status === 409) {
          throw new Error(i18n.t('orgAdmin.errors.emailExists'));
        }
        if (error.response?.status === 400) {
          throw new Error(i18n.t('orgAdmin.errors.invalidData'));
        }
        if (error.response?.status === 403) {
          throw new Error(i18n.t('orgAdmin.errors.noPermission'));
        }
        
        throw new Error(error.response?.data?.message || i18n.t('orgAdmin.errors.createError'));
      }
      throw error;
    }
  },

  updateOrgAdmin: async (userId: string, data: {
    firstName: string;
    lastName: string;
    phone: string;
    personalCode: string;
  }): Promise<User> => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.AUTH.UPDATE_USER(userId), data);
      return response.data;
    } catch (error) {
      console.error(`Error in updateOrgAdmin for user ${userId}:`, error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('orgAdmin.errors.updateError'));
      }
      throw error;
    }
  },

  deleteOrgAdmin: async (userId: string): Promise<void> => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.AUTH.DELETE_USER(userId));
    } catch (error) {
      console.error(`Error in deleteOrgAdmin for user ${userId}:`, error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('orgAdmin.errors.deleteError'));
      }
      throw error;
    }
  },
}; 