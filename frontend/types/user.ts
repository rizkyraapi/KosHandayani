export type UserRole = 'tenant' | 'owner';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  whatsapp?: string | null;
  pekerjaan?: string | null;
  address?: string | null;
  profile_completed?: boolean;
  profile_photo?: string | null;
  profile_photo_url?: string | null;
}
