export interface Chapter {
  id: string;
  name: string;
  slug: string | null;
  location: string | null;
  meetupUrl: string | null;
  discordUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    events: number;
  };
}

export interface ChapterFormData {
  name: string;
  slug?: string;
  location?: string;
  meetupUrl?: string;
  discordUrl?: string;
  isActive?: boolean;
}