import apiClient from './axios';
import type { AuthUser } from './auth';

export interface ApiRoom {
  id: number;
  room_name: string;
  name: string;
  branch_id: number | null;
  branch: ApiBranch | null;
  room_type: 'single' | 'double' | 'suite';
  gender_type: 'male' | 'female' | 'mixed';
  price: number;
  description?: string | null;
  thumbnail?: string | null;
  max_guest: number;
  room_status: 'available' | 'occupied' | 'maintenance';
  is_available: boolean;
  availability?: 'available' | 'occupied' | 'maintenance';
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

export interface ApiBranch {
  id: number;
  branch_name: string;
  city?: string | null;
  address?: string | null;
  description?: string | null;
}

export type RoomFilters = Partial<{
  branch_id: number | string;
  room_type: ApiRoom['room_type'];
  gender_type: ApiRoom['gender_type'];
  room_status: ApiRoom['room_status'];
  price_min: number | string;
  price_max: number | string;
  exclude_id: number | string;
  limit: number | string;
}>;

export async function getRooms(filters?: RoomFilters): Promise<ApiRoom[]> {
  const { data } = await apiClient.get<ApiRoom[]>('/rooms', { params: filters });

  return data;
}

export async function getRoomById(id: number | string): Promise<ApiRoom> {
  const { data } = await apiClient.get<ApiRoom>(`/rooms/${id}`);

  return data;
}

export async function getBranches(): Promise<ApiBranch[]> {
  const { data } = await apiClient.get<ApiBranch[]>('/branches');

  return data;
}

export type CreateRoomPayload = {
  room_name: string;
  room_type: ApiRoom['room_type'];
  branch_id: number;
  gender_type: ApiRoom['gender_type'];
  room_status: ApiRoom['room_status'];
  price: number;
  description?: string;
  max_guest?: number;
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
  formData.append('branch_id', String(payload.branch_id));
  formData.append('room_type', payload.room_type);
  formData.append('gender_type', payload.gender_type);
  formData.append('room_status', payload.room_status);
  formData.append('price', String(payload.price));
  formData.append('max_guest', String(payload.max_guest ?? 1));

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
