import { isAxiosError } from 'axios';
import { User, UserType } from '../types/user';
import axiosInstance from '../utils/axios';
import { API_ENDPOINTS } from '../config/api.config';
import i18n from '../i18n';
import { organizationService } from './organizationService';

export const memberService = {
  getOrgAdmins: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USERS.BASE, {
        params: {
          userType: UserType.ORGADMIN
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching org admins:', error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || i18n.t('members.errors.fetchError'));
      }
      throw error;
    }
  },

  updateMember: organizationService.updateOrgAdmin,
  deleteMember: organizationService.deleteOrgAdmin
}; 