// src/types/trail.ts

export interface TrailParticipant {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

export interface HostedSpark {
  _id: string;
  title: string;
  description: string;
  locationName?: string;
  geometry?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  startDate: string;
  endDate?: string;
  image?: Array<{ url: string; filename?: string; _id?: string }>;
  status: string;
  participants: TrailParticipant[];
}

export interface JoinedFootprint {
  _id: string;
  title: string;
  description: string;
  locationName?: string;
  geometry?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  startDate: string;
  endDate?: string;
  image?: Array<{ url: string; filename?: string; _id?: string }>;
  status: string;
  creator?: TrailParticipant;
}

export interface HostedSparksResponse {
  success: boolean;
  count: number;
  hostedVibes: HostedSpark[];
}

export interface JoinedFootprintsResponse {
  success: boolean;
  count: number;
  joinedVibes: JoinedFootprint[];
}
