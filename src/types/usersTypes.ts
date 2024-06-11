import { ObjectId } from 'mongodb';

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
    };
    usedTokens: string[];
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