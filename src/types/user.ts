// User type
export interface UserType {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStoreType {
  user: UserType | null;
  loading: boolean;
  error: string | null;
  setUser: (user: UserType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<UserType>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
} 