import apiClient from './axios';
import type { AuthUser } from './auth';

export interface ApiRoom {
  id: number;
  room_name: string;
  name: string;
  room_type: 'single' | 'double' | 'suite';
  price: number;
  branch: string;
  description?: string | null;
  thumbnail?: string | null;
  max_guest: number;
  is_available: boolean;
  availability?: 'available' | 'occupied';
  image_url?: string | null;
  facilities: Array<{
    id: number;
    facility_name: string;
    name?: string;
  }>;
  images: Array<{
    id: number;
    image_url: string;
    is_primary: boolean;
  }>;
}

export async function getRooms(): Promise<ApiRoom[]> {
  const { data } = await apiClient.get<ApiRoom[]>('/rooms');

  return data;
}

export type CreateRoomPayload = {
  room_name: string;
  room_type: ApiRoom['room_type'];
  branch: string;
  price: number;
  description?: string;
  max_guest?: number;
  is_available?: boolean;
  facilities: string[];
  images: File[];
};

type CreateRoomResponse = {
  message?: string;
  data?: ApiRoom;
};

export async function createRoom(payload: CreateRoomPayload): Promise<ApiRoom> {
  const formData = new FormData();
  formData.append('room_name', payload.room_name);
  formData.append('room_type', payload.room_type);
  formData.append('branch', payload.branch);
  formData.append('price', String(payload.price));
  formData.append('max_guest', String(payload.max_guest ?? 1));
  formData.append('is_available', payload.is_available === false ? '0' : '1');

  if (payload.description) {
    formData.append('description', payload.description);
  }

  payload.facilities.forEach((facility) => {
    formData.append('facilities[]', facility);
  });

  payload.images.forEach((image) => {
    formData.append('images[]', image);
  });

  const { data } = await apiClient.post<CreateRoomResponse>('/rooms', formData);

  if (!data.data) {
    throw new Error('Data kamar tidak ditemukan.');
  }

  return data.data;
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
