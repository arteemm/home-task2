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
  
export type PostsQueryParams = {
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    pageNumber: number;
    pageSize: number;
};