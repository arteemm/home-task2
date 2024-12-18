import { ObjectId } from 'mongodb';

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