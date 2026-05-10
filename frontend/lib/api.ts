import apiClient from './axios';

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
