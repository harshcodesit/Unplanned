import type { Vibe } from "./vibe";

export const DEFAULT_AVATAR_URL =
  "https://res.cloudinary.com/dzz15h9wq/image/upload/v1789508270/avatar-3814049_1280.webp";

export function getAvatarUrl(url?: string | null): string {
  if (!url || url.includes("default-avatar.png") || url.trim() === "") {
    return DEFAULT_AVATAR_URL;
  }
  return url;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  hostedVibes?: (Vibe | string)[];
  joinedVibes?: (Vibe | string)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}