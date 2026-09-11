export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  hostedVibes?: string[];
  joinedVibes?: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}