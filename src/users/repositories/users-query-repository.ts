import { UsersQueryParams, UserItemsResponse } from '../types/usersTypes';
import { usersCollection } from '../../db';
import { ObjectId } from 'mongodb';

const options = {
    projection: {
        _id: 0,
        id: '$_id',
        email: '$accountData.email',
        login: '$accountData.userName',
        createdAt: '$accountData.createdAt'
    }
};

const setDirection = (sortDirection: 'asc' | 'desc') => {
    if (sortDirection === 'asc') {
        return 1;
    }
    
    return -1;
};

const getCondition = (searchLoginTerm: string | null, searchEmailTerm: string | null) => {
    if (searchLoginTerm && searchEmailTerm) {
        return { $or: [
            { login: {$regex : `${searchLoginTerm}`, $options: 'i'} },
            { email: {$regex : `${searchEmailTerm}`, $options: 'i'} }
        ]};
    }
    if (searchLoginTerm) {
        return { login: {$regex : `${searchLoginTerm}`, $options: 'i'}};
    }
    if (searchEmailTerm) {
        return { email: {$regex : `${searchEmailTerm}`, $options: 'i'}};
    }
    return {};
};

export const usersQueryRepository = {

    async getAllUsers (postsQueryObj: UsersQueryParams): Promise<UserItemsResponse> {
        const {
            sortBy = 'createdAt',
            sortDirection = 'desc',
            pageNumber = 1,
            pageSize = 10,
            searchLoginTerm = null,
            searchEmailTerm = null,
        } = postsQueryObj;
        const condition = getCondition(searchLoginTerm, searchEmailTerm);
        const direction = setDirection(sortDirection);
        const totalCount = await usersCollection.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize);
        const users = await (usersCollection
            .find(condition, options)
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize )
            .toArray());
        
        return {pagesCount: +pagesCount, page: +pageNumber, pageSize: +pageSize, totalCount, items: users};
    },

    async checkEmail (email: string) {
        if (await usersCollection.findOne({'accountData.email': email})) {
            return false;
        }
        return true;
    },

    async checkLogin (login: string) {
        if (await usersCollection.findOne({'accountData.userName': login})) {
            return false;
        }
        return true;
    },

    async checkConfirmEmail(email: string) {
        const user = await usersCollection.findOne({'accountData.email': email});
        if (!user || user.emailConfirmation.isConfirmed) {
            return true;
        }
        return false;
    },
};