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
  search: string;
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

export type UpdateRoomPayload = Omit<CreateRoomPayload, 'images'> & {
  existing_image_ids: number[];
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

export async function updateRoom(id: number | string, payload: UpdateRoomPayload): Promise<ApiRoom> {
  const formData = new FormData();
  formData.append('_method', 'PUT');
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

  payload.existing_image_ids.forEach((imageId) => {
    formData.append('existing_image_ids[]', String(imageId));
  });

  payload.images.forEach((image) => {
    formData.append('images[]', image);
  });

  const { data } = await apiClient.post<CreateRoomResponse>(`/rooms/${id}`, formData);

  if (!data.data) {
    throw new Error('Data kamar tidak ditemukan.');
  }

  return data.data;
}

export async function deleteRoom(id: number | string): Promise<void> {
  await apiClient.delete(`/rooms/${id}`);
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

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export async function changePassword(payload: ChangePasswordPayload): Promise<ApiEnvelope<null>> {
  const { data } = await apiClient.put<ApiEnvelope<null>>('/change-password', payload);

  return data;
}

export type RentalApplicationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'unpaid' | 'paid' | 'failed';

export type RentalApplication = {
  id: number;
  user_id: number;
  room_id: number | null;
  move_in_date?: string | null;
  duration: string;
  status: RentalApplicationStatus;
  payment_status?: PaymentStatus | null;
  approved_at?: string | null;
  paid_at?: string | null;
  owner_notes?: string | null;
  ktp_file?: string | null;
  ktp_file_url?: string | null;
  kk_file?: string | null;
  kk_file_url?: string | null;
  created_at: string;
  updated_at?: string;
  tenant?: AuthUser | null;
  room?: Partial<ApiRoom> | null;
  room_occupancy?: RoomOccupancySummary | null;
  payment?: RentalApplicationPayment | null;
};

export type RoomOccupancySummary = {
  id: number;
  room_occupancy_id?: number;
  user_id: number;
  room_id: number;
  rental_application_id: number;
  start_date?: string | null;
  end_date?: string | null;
  status: 'active' | string;
};

export type RentalApplicationPayment = {
  id: number;
  rental_application_id: number;
  order_id: string;
  transaction_id?: string | null;
  subtotal_amount?: number | null;
  discount_amount?: number | null;
  gross_amount: number;
  payment_type?: string | null;
  transaction_status: 'pending' | 'settlement' | 'capture' | 'expire' | 'cancel' | 'deny' | string;
  snap_token?: string | null;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateRentalApplicationPayload = {
  room_id: number;
  move_in_date: string;
  duration: string;
  ktp_file: File;
  kk_file: File;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export type Payment = {
  id: number;
  rental_application_id: number;
  order_id: string;
  transaction_id?: string | null;
  subtotal_amount?: number | null;
  discount_amount?: number | null;
  gross_amount: number;
  payment_type?: string | null;
  transaction_status: 'pending' | 'settlement' | 'capture' | 'expire' | 'cancel' | 'deny' | string;
  snap_token?: string | null;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
  rental_application?: RentalApplication | null;
};

type CreatePaymentResponse = {
  success?: boolean;
  snap_token?: string;
  order_id?: string;
  payment?: Payment;
  message?: string;
};

function unwrapData<T>(response: ApiEnvelope<T>, fallbackMessage: string): T {
  if (typeof response.data === 'undefined') {
    throw new Error(fallbackMessage);
  }

  return response.data;
}

export async function createRentalApplication(payload: CreateRentalApplicationPayload): Promise<RentalApplication> {
  const formData = new FormData();
  formData.append('room_id', String(payload.room_id));
  formData.append('move_in_date', payload.move_in_date);
  formData.append('duration', payload.duration);
  formData.append('ktp_file', payload.ktp_file);
  formData.append('kk_file', payload.kk_file);

  const { data } = await apiClient.post<ApiEnvelope<RentalApplication>>('/rental-applications', formData);

  return unwrapData(data, 'Data pengajuan sewa tidak ditemukan.');
}

export async function getMyRentalApplications(): Promise<RentalApplication[]> {
  const { data } = await apiClient.get<ApiEnvelope<RentalApplication[]>>('/my-rental-applications');

  return unwrapData(data, 'Data pengajuan sewa tidak ditemukan.');
}

export async function getMyRentalApplication(id: number | string): Promise<RentalApplication> {
  const { data } = await apiClient.get<ApiEnvelope<RentalApplication>>(`/my-rental-applications/${id}`);

  return unwrapData(data, 'Detail pengajuan sewa tidak ditemukan.');
}

export async function createPayment(rentalApplicationId: number): Promise<{ snap_token: string; order_id: string }> {
  const { data } = await apiClient.post<CreatePaymentResponse>('/payments/create', {
    rental_application_id: rentalApplicationId,
  });

  if (!data.snap_token || !data.order_id) {
    throw new Error(data.message ?? 'Token pembayaran tidak ditemukan.');
  }

  return {
    snap_token: data.snap_token,
    order_id: data.order_id,
  };
}

export async function getMyPayments(): Promise<Payment[]> {
  const { data } = await apiClient.get<ApiEnvelope<Payment[]>>('/my-payments');

  return unwrapData(data, 'Data tagihan tidak ditemukan.');
}

export async function getPayment(id: number | string): Promise<Payment> {
  const { data } = await apiClient.get<ApiEnvelope<Payment>>(`/payments/${id}`);

  return unwrapData(data, 'Detail pembayaran tidak ditemukan.');
}

export async function syncPaymentStatus(orderId: string): Promise<Payment> {
  const { data } = await apiClient.post<ApiEnvelope<Payment>>('/payments/sync-status', {
    order_id: orderId,
  });

  return unwrapData(data, 'Status pembayaran tidak ditemukan.');
}

export async function resendEmailVerification(): Promise<ApiEnvelope<null>> {
  const { data } = await apiClient.post<ApiEnvelope<null>>('/email/resend-verification');

  return data;
}

export async function getEmailVerificationStatus(): Promise<{ verified: boolean }> {
  const { data } = await apiClient.get<{ verified: boolean }>('/email/verification-status');

  return data;
}

export async function getOwnerRentalApplications(): Promise<RentalApplication[]> {
  const { data } = await apiClient.get<ApiEnvelope<RentalApplication[]>>('/owner/rental-applications');

  return unwrapData(data, 'Data pengajuan sewa tidak ditemukan.');
}

export async function getOwnerRentalApplication(id: number | string): Promise<RentalApplication> {
  const { data } = await apiClient.get<ApiEnvelope<RentalApplication>>(`/owner/rental-applications/${id}`);

  return unwrapData(data, 'Detail pengajuan sewa tidak ditemukan.');
}

export async function updateOwnerRentalApplication(
  id: number | string,
  payload: { status: Exclude<RentalApplicationStatus, 'pending'>; owner_notes?: string },
): Promise<RentalApplication> {
  const { data } = await apiClient.put<ApiEnvelope<RentalApplication>>(`/owner/rental-applications/${id}`, payload);

  return unwrapData(data, 'Data pengajuan sewa tidak ditemukan.');
}

export type OwnerDashboardStats = {
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  maintenance_rooms: number;
  active_tenants: number;
  pending_applications: number;
  successful_payments: number;
  paid_revenue: number;
  pending_payments: number;
};

export type OwnerPaymentOverview = {
  stats: {
    total_collected: number;
    paid_count: number;
    failed_count: number;
    pending_count: number;
    tenant_count: number;
  };
  payments: Array<Payment & {
    tenant?: AuthUser | null;
    room?: Pick<ApiRoom, 'id' | 'room_name'> & {
      branch?: Pick<ApiBranch, 'id' | 'branch_name'> | null;
    } | null;
  }>;
};

export type OwnerTenantOccupancy = {
  id: number;
  user_id: number;
  room_id: number;
  rental_application_id: number;
  tenant?: AuthUser | null;
  room?: Pick<ApiRoom, 'id' | 'room_name'> & {
    branch?: Pick<ApiBranch, 'id' | 'branch_name'> | null;
  } | null;
  start_date?: string | null;
  end_date?: string | null;
  status: 'active' | string;
  payment_status?: PaymentStatus | null;
  payment?: {
    order_id: string;
    subtotal_amount?: number | null;
    discount_amount?: number | null;
    gross_amount: number;
    transaction_status: string;
    paid_at?: string | null;
  } | null;
};

export async function getOwnerDashboardStats(): Promise<OwnerDashboardStats> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerDashboardStats>>('/owner/dashboard');

  return unwrapData(data, 'Data dashboard owner tidak ditemukan.');
}

export async function getOwnerPayments(): Promise<OwnerPaymentOverview> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerPaymentOverview>>('/owner/payments');

  return unwrapData(data, 'Data pembayaran owner tidak ditemukan.');
}

export async function getOwnerTenants(): Promise<OwnerTenantOccupancy[]> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerTenantOccupancy[]>>('/owner/tenants');

  return unwrapData(data, 'Data penyewa aktif tidak ditemukan.');
}
