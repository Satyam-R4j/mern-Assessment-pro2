export type ChangelogCategory = 'New' | 'Improved' | 'Fixed';

export interface ChangelogItem {
  _id: string;
  title: string;
  slug: string;
  contentMarkdown: string;
  category: ChangelogCategory;
  coverImage?: string;
  publishedAt: string;
  status: 'Draft' | 'Published';
  reactions: {
    redHeart: string[];
    partyPopper: string[];
    rocket: string[];
  };
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type ReactionType = 'redHeart' | 'partyPopper' | 'rocket';
