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

export type BlogsQueryParams = {
    searchNameTerm: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    pageNumber: number;
    pageSize: number;
};