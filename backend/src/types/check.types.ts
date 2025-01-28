export interface CreateCheckDTO {
  title: string;
}

export interface CheckResponse {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  userId: string | null;
}

export interface UpdateCheckDTO {
  title?: string;
  isPublic?: boolean;
} 