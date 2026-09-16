

export interface VibeUserRef {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

export interface VibeImage {
  url: string;
  filename?: string;
  _id?: string;
}

export interface VibeGeometry {
  type: "Point";
  coordinates: [number, number];
}

export type VibeStatus = "Open" | "Full" | "Completed" | "Cancelled" | "Closed" | "closed";

export interface Vibe {
  _id: string;
  title: string;
  description: string;
  locationName?: string;
  geometry: VibeGeometry;
  displayLatitude?: number;
  displayLongitude?: number;
  startDate: string;
  endDate?: string;
  status: VibeStatus;
  creator: VibeUserRef;
  participants: VibeUserRef[];
  image: VibeImage[];
  createdAt: string;
  updatedAt: string;
}

export interface VibesListResponse {
  success: boolean;
  count: number;
  vibes: Vibe[];
}

export interface SingleVibeResponse {
  success: boolean;
  vibe: Vibe;
  isCreator?: boolean;
  isParticipant?: boolean;
  message?: string;
}

export interface JoinRequestResponse {
  success: boolean;
  message: string;
  request: {
    _id: string;
    vibe: string;
    requester: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
  };
}
