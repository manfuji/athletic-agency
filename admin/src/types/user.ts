interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: 1 | 0;
  contact: string;
  created_at: string;
  updated_at: string;
}

export type { User };
