export interface Person {
  id: number;
  first_name: string;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  is_client: boolean;
  became_client_at: string | null;
  company: Company | null;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  vat: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  is_client: boolean;
  became_client_at: string | null;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}
