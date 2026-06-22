import apiClient from './axios';
import type { AuthUser } from './auth';

export interface ApiRoom {
  id: number;
  room_name: string;
  name: string;
  branch_id: number | null;
  branch: ApiBranch | null;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown, fallback = 0) {
  const normalized = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(normalized) ? normalized : fallback;
}

function normalizeBranch(value: unknown): ApiBranch | null {
  if (!isRecord(value)) return null;

  const id = finiteNumber(value.id);
  if (id <= 0) return null;

  return {
    id,
    branch_name: typeof value.branch_name === 'string' && value.branch_name.trim()
      ? value.branch_name
      : `Cabang ${id}`,
    city: typeof value.city === 'string' ? value.city : null,
    address: typeof value.address === 'string' ? value.address : null,
    description: typeof value.description === 'string' ? value.description : null,
  };
}

export type RoomFilters = Partial<{
  search: string;
  branch_id: number | string;
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
  const { data } = await apiClient.get<unknown>('/branches');

  return Array.isArray(data)
    ? data.map(normalizeBranch).filter((branch): branch is ApiBranch => branch !== null)
    : [];
}

export type CreateRoomPayload = {
  room_name: string;
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

export type RentalApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
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
  payment_history?: Array<Pick<
    RentalApplicationPayment,
    'id' | 'payment_category' | 'order_id' | 'gross_amount' | 'transaction_status' | 'period_start' | 'period_end' | 'paid_at' | 'created_at'
  >>;
  status_history?: Array<{
    key: string;
    label: string;
    occurred_at: string;
    status: string;
  }>;
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
  room_occupancy_id?: number | null;
  payment_category?: 'initial_rent' | 'renewal' | string;
  order_id: string;
  transaction_id?: string | null;
  subtotal_amount?: number | null;
  discount_amount?: number | null;
  duration_months?: number | null;
  monthly_price?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  gross_amount: number;
  payment_type?: string | null;
  transaction_status: 'pending' | 'settlement' | 'capture' | 'expire' | 'cancel' | 'deny' | string;
  snap_token?: string | null;
  paid_at?: string | null;
  settlement_time?: string | null;
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
  room_occupancy_id?: number | null;
  payment_category?: 'initial_rent' | 'renewal' | string;
  order_id: string;
  transaction_id?: string | null;
  subtotal_amount?: number | null;
  discount_amount?: number | null;
  duration_months?: number | null;
  monthly_price?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  gross_amount: number;
  payment_type?: string | null;
  transaction_status: 'pending' | 'settlement' | 'capture' | 'expire' | 'cancel' | 'deny' | string;
  snap_token?: string | null;
  paid_at?: string | null;
  settlement_time?: string | null;
  created_at?: string;
  updated_at?: string;
  rental_application?: RentalApplication | null;
  room_occupancy?: RoomOccupancySummary | null;
};

export type RenewalDurationOption = {
  duration_months: number;
  label: string;
  subtotal_amount: number;
  discount_amount: number;
  gross_amount: number;
};

export type RenewalContext = {
  occupancy: RoomOccupancySummary;
  room: Partial<ApiRoom> | null;
  rental_application: Pick<RentalApplication, 'id' | 'duration' | 'status' | 'payment_status'> | null;
  duration_options: RenewalDurationOption[];
  pending_renewal_payment?: Pick<Payment, 'id' | 'order_id' | 'gross_amount' | 'snap_token' | 'transaction_status' | 'period_start' | 'period_end'> | null;
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

export async function cancelMyRentalApplication(id: number | string): Promise<RentalApplication> {
  const { data } = await apiClient.post<ApiEnvelope<RentalApplication>>(`/my-rental-applications/${id}/cancel`);

  return unwrapData(data, 'Pengajuan sewa tidak ditemukan.');
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

export async function getRenewalContext(): Promise<RenewalContext> {
  const { data } = await apiClient.get<ApiEnvelope<RenewalContext>>('/payments/renewal-context');

  return unwrapData(data, 'Data perpanjangan sewa tidak ditemukan.');
}

export async function createRenewalPayment(durationMonths: number): Promise<{ snap_token: string; order_id: string; payment?: Payment }> {
  const { data } = await apiClient.post<CreatePaymentResponse>('/payments/renewal/create', {
    duration_months: durationMonths,
  });

  if (!data.snap_token || !data.order_id) {
    throw new Error(data.message ?? 'Token pembayaran perpanjangan tidak ditemukan.');
  }

  return {
    snap_token: data.snap_token,
    order_id: data.order_id,
    payment: data.payment,
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
  payload: { status: 'approved' | 'rejected'; owner_notes?: string },
): Promise<RentalApplication> {
  const { data } = await apiClient.put<ApiEnvelope<RentalApplication>>(`/owner/rental-applications/${id}`, payload);

  return unwrapData(data, 'Data pengajuan sewa tidak ditemukan.');
}

export type OwnerLifecycleStatus = 'active' | 'h30' | 'h7' | 'h1' | 'overdue';
export type OwnerRenewalStatus = 'none' | 'pending' | 'successful' | 'failed';

export type OwnerAttentionItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
  priority?: number;
};

export type OwnerActivity = {
  id: string;
  type: string;
  title: string;
  description: string;
  occurred_at: string;
  href: string;
};

export type OwnerBranchStatistic = {
  id: number;
  branch_name: string;
  room_count: number;
  occupied_units: number;
  occupancy_rate: number;
  revenue: number;
  expense: number;
  net_profit: number;
  active_tenants: number;
};

export type ExpenseCategory =
  | 'Perawatan'
  | 'Utilitas'
  | 'Internet'
  | 'Kebersihan'
  | 'Keamanan'
  | 'Perlengkapan'
  | 'Pajak'
  | 'Lainnya';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Perawatan',
  'Utilitas',
  'Internet',
  'Kebersihan',
  'Keamanan',
  'Perlengkapan',
  'Pajak',
  'Lainnya',
];

export type OwnerExpense = {
  id: number;
  branch_id: number;
  branch?: Pick<ApiBranch, 'id' | 'branch_name'> | null;
  category: ExpenseCategory;
  description?: string | null;
  amount: number;
  receipt_path?: string | null;
  receipt_url?: string | null;
  expense_date: string;
  created_by: number;
  creator?: { id: number; name: string } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ExpenseCategorySummary = {
  category: string;
  amount: number;
  transactions: number;
  percentage: number;
};

export type ExpenseBranchSummary = {
  id: number;
  branch_name: string;
  amount: number;
  transactions: number;
};

export type OwnerExpenseOverview = {
  filters: {
    branch_id?: number | null;
    year: number;
    month?: number | null;
    category?: string | null;
    years: number[];
    categories: ExpenseCategory[];
    branches: Array<Pick<ApiBranch, 'id' | 'branch_name'>>;
  };
  stats: {
    total_expense: number;
    transaction_count: number;
    largest_category?: { category: string; amount: number } | null;
    average_expense: number;
  };
  expense_by_category: ExpenseCategorySummary[];
  expense_by_branch: ExpenseBranchSummary[];
  monthly_expense_trend: Array<{
    month: number;
    label: string;
    expense: number;
  }>;
  expenses: OwnerExpense[];
};

function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return typeof value === 'string' && EXPENSE_CATEGORIES.includes(value as ExpenseCategory);
}

function normalizeOwnerExpense(value: unknown): OwnerExpense | null {
  if (!isRecord(value)) return null;

  const id = finiteNumber(value.id);
  const branchId = finiteNumber(value.branch_id);
  if (id <= 0 || branchId <= 0) return null;

  const branch = normalizeBranch(value.branch);
  const creator = isRecord(value.creator) && finiteNumber(value.creator.id) > 0
    ? {
        id: finiteNumber(value.creator.id),
        name: typeof value.creator.name === 'string' ? value.creator.name : 'Owner',
      }
    : null;

  return {
    id,
    branch_id: branchId,
    branch,
    category: isExpenseCategory(value.category) ? value.category : 'Lainnya',
    description: typeof value.description === 'string' ? value.description : null,
    amount: Math.max(0, finiteNumber(value.amount)),
    receipt_path: typeof value.receipt_path === 'string' ? value.receipt_path : null,
    receipt_url: typeof value.receipt_url === 'string' ? value.receipt_url : null,
    expense_date: typeof value.expense_date === 'string' ? value.expense_date : '',
    created_by: finiteNumber(value.created_by),
    creator,
    created_at: typeof value.created_at === 'string' ? value.created_at : null,
    updated_at: typeof value.updated_at === 'string' ? value.updated_at : null,
  };
}

export function createEmptyOwnerExpenseOverview(filters: OwnerExpenseFilters = {}): OwnerExpenseOverview {
  const currentYear = new Date().getFullYear();

  return {
    filters: {
      branch_id: filters.branch_id && filters.branch_id !== 'all' ? finiteNumber(filters.branch_id) : null,
      year: finiteNumber(filters.year, currentYear),
      month: filters.month ? finiteNumber(filters.month) : null,
      category: filters.category || null,
      years: [finiteNumber(filters.year, currentYear)],
      categories: [...EXPENSE_CATEGORIES],
      branches: [],
    },
    stats: {
      total_expense: 0,
      transaction_count: 0,
      largest_category: null,
      average_expense: 0,
    },
    expense_by_category: [],
    expense_by_branch: [],
    monthly_expense_trend: [],
    expenses: [],
  };
}

function normalizeOwnerExpenseOverview(
  value: unknown,
  filters: OwnerExpenseFilters = {},
): OwnerExpenseOverview {
  const fallback = createEmptyOwnerExpenseOverview(filters);
  if (!isRecord(value)) return fallback;

  const rawFilters = isRecord(value.filters) ? value.filters : {};
  const rawStats = isRecord(value.stats) ? value.stats : {};
  const categories = Array.isArray(rawFilters.categories)
    ? rawFilters.categories.filter(isExpenseCategory)
    : [];
  const years = Array.isArray(rawFilters.years)
    ? rawFilters.years.map((year) => finiteNumber(year)).filter((year) => year > 0)
    : [];
  const largestCategory = isRecord(rawStats.largest_category)
    ? {
        category: typeof rawStats.largest_category.category === 'string'
          ? rawStats.largest_category.category
          : 'Tidak diketahui',
        amount: Math.max(0, finiteNumber(rawStats.largest_category.amount)),
      }
    : null;

  return {
    filters: {
      branch_id: rawFilters.branch_id ? finiteNumber(rawFilters.branch_id) : null,
      year: finiteNumber(rawFilters.year, fallback.filters.year),
      month: rawFilters.month ? finiteNumber(rawFilters.month) : null,
      category: typeof rawFilters.category === 'string' ? rawFilters.category : null,
      years: years.length ? years : fallback.filters.years,
      categories: categories.length ? categories : fallback.filters.categories,
      branches: Array.isArray(rawFilters.branches)
        ? rawFilters.branches
            .map(normalizeBranch)
            .filter((branch): branch is ApiBranch => branch !== null)
        : [],
    },
    stats: {
      total_expense: Math.max(0, finiteNumber(rawStats.total_expense)),
      transaction_count: Math.max(0, finiteNumber(rawStats.transaction_count)),
      largest_category: largestCategory,
      average_expense: Math.max(0, finiteNumber(rawStats.average_expense)),
    },
    expense_by_category: Array.isArray(value.expense_by_category)
      ? value.expense_by_category.filter(isRecord).map((item) => ({
          category: typeof item.category === 'string' ? item.category : 'Tidak diketahui',
          amount: Math.max(0, finiteNumber(item.amount)),
          transactions: Math.max(0, finiteNumber(item.transactions)),
          percentage: Math.max(0, finiteNumber(item.percentage)),
        }))
      : [],
    expense_by_branch: Array.isArray(value.expense_by_branch)
      ? value.expense_by_branch.filter(isRecord).map((item) => ({
          id: finiteNumber(item.id),
          branch_name: typeof item.branch_name === 'string' ? item.branch_name : 'Cabang tidak diketahui',
          amount: Math.max(0, finiteNumber(item.amount)),
          transactions: Math.max(0, finiteNumber(item.transactions)),
        }))
      : [],
    monthly_expense_trend: Array.isArray(value.monthly_expense_trend)
      ? value.monthly_expense_trend.filter(isRecord).map((item) => ({
          month: finiteNumber(item.month),
          label: typeof item.label === 'string' ? item.label : '-',
          expense: Math.max(0, finiteNumber(item.expense)),
        }))
      : [],
    expenses: Array.isArray(value.expenses)
      ? value.expenses
          .map(normalizeOwnerExpense)
          .filter((expense): expense is OwnerExpense => expense !== null)
      : [],
  };
}

export type OwnerDashboardStats = {
  units: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance: number;
    occupancy_rate: number;
  };
  revenue: {
    this_month: number;
    total: number;
    renewal: number;
    initial: number;
  };
  expense: {
    this_month: number;
    transactions: number;
    largest_category?: { category: string; amount: number } | null;
    average: number;
  };
  financial: {
    revenue: number;
    expense: number;
    net_profit: number;
  };
  monthly_financial_trend: Array<{
    month: number;
    label: string;
    revenue: number;
    expense: number;
    net_profit: number;
  }>;
  tenants: {
    active: number;
    h30: number;
    h7: number;
    h1: number;
    overdue: number;
  };
  renewals: {
    pending: number;
    successful: number;
    failed: number;
  };
  applications: {
    pending_review: number;
    awaiting_payment: number;
  };
  activities: OwnerActivity[];
  branches: OwnerBranchStatistic[];
  attention: OwnerAttentionItem[];
  generated_at: string;
};

export type OwnerPaymentOverview = {
  stats: {
    total_collected: number;
    revenue_initial: number;
    revenue_renewal: number;
    pending_amount: number;
    failed_amount: number;
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
  days_remaining?: number | null;
  lifecycle_status: OwnerLifecycleStatus;
  lifecycle_label: string;
  lease_progress: number;
  renewal_status: {
    key: OwnerRenewalStatus;
    label: string;
    payment_id?: number | null;
  };
  latest_reminder?: {
    id: number;
    reminder_type: string;
    channel: string;
    sent_at?: string | null;
  } | null;
  payments: Array<Payment & {
    tenant?: AuthUser | null;
    room?: Pick<ApiRoom, 'id' | 'room_name'> & {
      branch?: Pick<ApiBranch, 'id' | 'branch_name'> | null;
    } | null;
  }>;
};

export type OwnerRoomOverview = {
  id: number;
  room_name: string;
  price: number;
  room_status: ApiRoom['room_status'];
  is_available: boolean;
  thumbnail?: string | null;
  branch?: Pick<ApiBranch, 'id' | 'branch_name' | 'city'> | null;
  occupancy?: OwnerTenantOccupancy | null;
};

export type OwnerApplicationMonitoring = {
  stats: {
    pending_review: number;
    awaiting_payment: number;
    payment_success: number;
    renewal_pending: number;
  };
  new_applications: OwnerApplicationMonitorItem[];
  renewals: OwnerPaymentOverview['payments'];
  cancelled: OwnerApplicationMonitorItem[];
  rejected: OwnerApplicationMonitorItem[];
  all_applications: OwnerApplicationMonitorItem[];
};

export type OwnerApplicationMonitorItem = {
  id: number;
  type: 'initial_rent';
  status: RentalApplicationStatus;
  payment_status?: PaymentStatus | null;
  created_at: string;
  updated_at?: string;
  move_in_date?: string | null;
  duration: string;
  tenant?: AuthUser | null;
  room?: Pick<ApiRoom, 'id' | 'room_name'> & {
    branch?: Pick<ApiBranch, 'id' | 'branch_name' | 'city'> | null;
  } | null;
  payment_count: number;
};

export type OwnerReport = {
  filters: {
    year: number;
    month?: number | null;
    branch_id?: number | null;
    years: number[];
    branches: Array<Pick<ApiBranch, 'id' | 'branch_name'>>;
  };
  summary: {
    total_revenue: number;
    initial_revenue: number;
    renewal_revenue: number;
    total_expense: number;
    net_profit: number;
    occupancy_rate: number;
    active_tenants: number;
    renewal_rate: number;
    average_revenue_per_room: number;
  };
  revenue_per_branch: Array<{
    id: number;
    branch_name: string;
    revenue: number;
    expense: number;
    net_profit: number;
    rooms: number;
    occupied_units: number;
    occupancy_rate: number;
  }>;
  monthly_trend: Array<{
    month: number;
    label: string;
    revenue: number;
    expense: number;
    net_profit: number;
    initial_revenue: number;
    renewal_revenue: number;
    occupied_units: number;
    occupancy_rate: number;
  }>;
  recent_transactions: OwnerPaymentOverview['payments'];
  expense_by_category: ExpenseCategorySummary[];
  expense_by_branch: ExpenseBranchSummary[];
  recent_expenses: OwnerExpense[];
};

export type OwnerBranchScope = 'all' | number | string;

function ownerBranchParams(branchId: OwnerBranchScope = 'all') {
  return { branch_id: branchId };
}

export async function getOwnerDashboardStats(branchId: OwnerBranchScope = 'all'): Promise<OwnerDashboardStats> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerDashboardStats>>('/owner/dashboard', {
    params: ownerBranchParams(branchId),
  });

  return unwrapData(data, 'Data dashboard owner tidak ditemukan.');
}

export async function getOwnerRoomsOverview(branchId: OwnerBranchScope = 'all'): Promise<OwnerRoomOverview[]> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerRoomOverview[]>>('/owner/rooms-overview', {
    params: ownerBranchParams(branchId),
  });

  return unwrapData(data, 'Data monitoring kamar owner tidak ditemukan.');
}

export async function getOwnerApplicationMonitoring(branchId: OwnerBranchScope = 'all'): Promise<OwnerApplicationMonitoring> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerApplicationMonitoring>>('/owner/application-monitoring', {
    params: ownerBranchParams(branchId),
  });

  return unwrapData(data, 'Data monitoring pengajuan owner tidak ditemukan.');
}

export async function getOwnerPayments(branchId: OwnerBranchScope = 'all'): Promise<OwnerPaymentOverview> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerPaymentOverview>>('/owner/payments', {
    params: ownerBranchParams(branchId),
  });

  return unwrapData(data, 'Data pembayaran owner tidak ditemukan.');
}

export async function getOwnerTenants(branchId: OwnerBranchScope = 'all'): Promise<OwnerTenantOccupancy[]> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerTenantOccupancy[]>>('/owner/tenants', {
    params: ownerBranchParams(branchId),
  });

  return unwrapData(data, 'Data penyewa aktif tidak ditemukan.');
}

export type OwnerExpenseFilters = {
  year?: number | string;
  month?: number | string;
  branch_id?: number | string;
  category?: string;
};

export async function getOwnerExpenses(filters?: OwnerExpenseFilters): Promise<OwnerExpenseOverview> {
  const { data } = await apiClient.get<ApiEnvelope<unknown>>('/owner/expenses', { params: filters });

  return normalizeOwnerExpenseOverview(
    unwrapData(data, 'Data pengeluaran owner tidak ditemukan.'),
    filters,
  );
}

export type CreateExpensePayload = {
  branch_id: number;
  category: ExpenseCategory;
  description?: string;
  amount: number;
  expense_date: string;
  receipt?: File | null;
};

function expensePayloadFormData(payload: CreateExpensePayload): FormData {
  if (!Number.isSafeInteger(payload.amount) || payload.amount <= 0) {
    throw new Error('Nominal pengeluaran harus berupa bilangan bulat lebih dari 0.');
  }

  const formData = new FormData();
  formData.append('branch_id', String(payload.branch_id));
  formData.append('category', payload.category);
  formData.append('description', payload.description || '');
  formData.append('amount', String(payload.amount));
  formData.append('expense_date', payload.expense_date);

  if (payload.receipt) {
    formData.append('receipt', payload.receipt);
  }

  return formData;
}

export async function createOwnerExpense(payload: CreateExpensePayload): Promise<OwnerExpense> {
  const { data } = await apiClient.post<ApiEnvelope<unknown>>(
    '/owner/expenses',
    expensePayloadFormData(payload),
  );
  const expense = normalizeOwnerExpense(unwrapData(data, 'Pengeluaran gagal disimpan.'));

  if (!expense) {
    throw new Error('Respons pengeluaran tidak valid.');
  }

  return expense;
}

export async function getOwnerExpense(id: number | string): Promise<OwnerExpense> {
  const { data } = await apiClient.get<ApiEnvelope<unknown>>(`/owner/expenses/${id}`);
  const expense = normalizeOwnerExpense(unwrapData(data, 'Detail pengeluaran tidak ditemukan.'));

  if (!expense) {
    throw new Error('Respons detail pengeluaran tidak valid.');
  }

  return expense;
}

export async function updateOwnerExpense(
  id: number | string,
  payload: CreateExpensePayload,
): Promise<OwnerExpense> {
  const formData = expensePayloadFormData(payload);
  formData.append('_method', 'PUT');

  const { data } = await apiClient.post<ApiEnvelope<unknown>>(`/owner/expenses/${id}`, formData);
  const expense = normalizeOwnerExpense(unwrapData(data, 'Pengeluaran gagal diperbarui.'));

  if (!expense) {
    throw new Error('Respons pengeluaran yang diperbarui tidak valid.');
  }

  return expense;
}

export async function deleteOwnerExpense(id: number | string): Promise<void> {
  await apiClient.delete(`/owner/expenses/${id}`);
}

export type OwnerReportFilters = {
  year?: number | string;
  month?: number | string;
  branch_id?: number | string;
};

export async function getOwnerReport(filters?: OwnerReportFilters): Promise<OwnerReport> {
  const { data } = await apiClient.get<ApiEnvelope<OwnerReport>>('/owner/reports', { params: filters });

  return unwrapData(data, 'Data laporan owner tidak ditemukan.');
}

export async function exportOwnerReportPdf(filters?: OwnerReportFilters): Promise<{
  blob: Blob;
  filename: string;
}> {
  const response = await apiClient.get<Blob>('/owner/reports/export-pdf', {
    params: filters,
    responseType: 'blob',
  });
  const disposition = response.headers['content-disposition'] as string | undefined;
  const encodedFilename = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainFilename = disposition?.match(/filename="?([^";]+)"?/i)?.[1];

  return {
    blob: response.data,
    filename: encodedFilename
      ? decodeURIComponent(encodedFilename)
      : plainFilename || 'laporan-keuangan-kos-handayani.pdf',
  };
}
