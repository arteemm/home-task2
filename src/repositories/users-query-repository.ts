import { UsersQueryParams, UserItemsResponse } from '../types';
import { usersCollection } from './db';

const options = {
    projection: {
        _id: 0,
        id: '$_id',
        login: 1,
        email: 1,
        createdAt: 1,
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
        return { $and: [
            {login: {$regex : `${searchLoginTerm}`, $options: 'i'}},
            { email: {$regex : `${searchEmailTerm}`, $options: 'i'}}
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
};