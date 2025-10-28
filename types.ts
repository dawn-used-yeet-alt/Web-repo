
export interface VnImage {
  id: string;
  url: string;
  dims: [number, number];
  sexual: number;
  violence: number;
  votecount: number;
  thumbnail: string;
  thumbnail_dims: [number, number];
}

export interface TagLink {
  id: string;
  rating: number;
  spoiler: number;
  name: string;
  category: string;
}

export interface Screenshot extends VnImage {
  release: {
    id: string;
    title: string;
  };
}

export interface VisualNovel {
  id: string;
  title: string;
  alttitle: string | null;
  image?: VnImage;
  description: string | null;
  rating: number | null;
  votecount: number;
  length_minutes: number | null;
  platforms: string[];
  languages: string[];
  tags: TagLink[];
  screenshots: Screenshot[];
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  aliases: string[];
  category: 'cont' | 'ero' | 'tech';
  vn_count: number;
}

export type SortOption = 'rating' | 'votecount' | 'released' | 'id';

export interface ApiRequest {
  filters: any[];
  fields: string;
  sort?: SortOption;
  reverse?: boolean;
  results?: number;
  page?: number;
  count?: boolean;
}

export interface ApiResponse<T> {
  results: T[];
  more: boolean;
  count?: number;
}
