
export interface Recipe {
  id: string;
  name: string;
  sourceUrl: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  tips: string[];
  category: string;
  createdAt: number;
  imageUrl?: string;
}

export type AppView = 'list' | 'detail' | 'loading';
