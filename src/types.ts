import { ObjectId } from 'mongodb';

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

export type BlogsQueryParams = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};

export type PostsQueryParams = {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};

export type UserQueryType = {
  login: string;
  password: string;
  email: string;
};

export type UserType = {
  _id: ObjectId;
  accountData: {
    userName: string;
    email: string;
    passwordHash: string;
    salt: string;
    createdAt: Date;
  };
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  }
};

export type UserResponseType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UsersQueryParams = {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};

export type UserItemsResponse = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserType [];
};

export type CommentRequestType = {
  content: string;
};

export type CommentType = {
  _id: ObjectId;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  },
  createdAt: string;
  postId: string;
};

export type CommentResponseType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  },
  createdAt: string;
};

export type CommentsItemsResponse = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentResponseType[];
};
