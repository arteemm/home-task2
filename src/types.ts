export type BlogItemType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogItemsResponse = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogItemType [];
};

export type RequestBlogBody = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type PostItemType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type PostItemsResponse = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostItemType [];
};

export type RequestPostBody = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
};

export type BlogsQueryParams ={
  searchNameTerm: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};

export type PostsQueryParams ={
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};