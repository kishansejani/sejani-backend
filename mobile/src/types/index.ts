export interface UserProfile {
  full_name_gu: string;
  full_name_en?: string | null;
  birth_date?: string | null;
  blood_group?: string | null;
  occupation_gu?: string | null;
  avatar?: string | null;
  bio_gu?: string | null;
  emergency_contact?: string | null;
}

export interface FamilyInfo {
  id: number;
  name_gu: string;
  family_code: string;
  relation_title_gu?: string;
  is_admin?: boolean;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: 'head' | 'admin' | 'member';
  status: 'active' | 'blocked';
  profile?: UserProfile;
  family?: FamilyInfo | null;
}

export interface PersonalRecord {
  id: number;
  user_id: number;
  record_type: 'note' | 'expense' | 'document' | 'reminder' | 'diary';
  title: string;
  content?: string | null;
  amount?: number | null;
  category: string;
  record_date: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FamilyMember {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email?: string | null;
  relation_title_gu: string;
  is_admin: boolean;
  profile?: UserProfile;
}
