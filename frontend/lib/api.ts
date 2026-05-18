import apiClient from './axios';
import type { AuthUser } from './auth';

export interface ApiRoom {
  id: number;
  name: string;
  price: number;
  branch: string;
  is_available: boolean;
  image_url?: string | null;
}

export async function getRooms(): Promise<ApiRoom[]> {
  const { data } = await apiClient.get<ApiRoom[]>('/rooms');

  return data;
}

export type ProfilePayload = {
  full_name: string;
  whatsapp: string;
  pekerjaan: string;
  address: string;
  profile_photo?: File | null;
};

type ProfileResponse = {
  data?: AuthUser;
  user?: AuthUser;
};

function unwrapProfile(response: ProfileResponse) {
  const profile = response.data ?? response.user;

  if (!profile) {
    throw new Error('Data profil tidak ditemukan.');
  }

  return profile;
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<ProfileResponse>('/profile');

  return unwrapProfile(data);
}

export async function updateProfile(payload: ProfilePayload): Promise<AuthUser> {
  const formData = new FormData();
  formData.append('_method', 'PUT');
  formData.append('full_name', payload.full_name);
  formData.append('whatsapp', payload.whatsapp);
  formData.append('pekerjaan', payload.pekerjaan);
  formData.append('address', payload.address);

  if (payload.profile_photo) {
    formData.append('profile_photo', payload.profile_photo);
  }

  const { data } = await apiClient.post<ProfileResponse>('/profile', formData);

  return unwrapProfile(data);
}

export async function createRentalApplication(payload: { room_id?: number; duration?: string }) {
  const { data } = await apiClient.post('/rental-applications', payload);

  return data;
}
