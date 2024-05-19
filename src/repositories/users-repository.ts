import { ObjectId } from 'mongodb';
import { UserType, UserResponseType } from '../types';
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

export const userRepository = {

    async getUserById (_id: ObjectId): Promise<UserResponseType | null > {
        const user = await usersCollection.findOne({_id}, options) as UserResponseType | null;
        return user;
    },
    async createUser (newUser: UserType): Promise<ObjectId> {
        const result = await usersCollection.insertOne(newUser);
        return newUser._id
    },
    async deleteUser (id: ObjectId): Promise<boolean> {
        const idO = new ObjectId(id);
        const result = await usersCollection.deleteOne({ _id: idO });

        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await usersCollection.deleteMany({});
    },
    async findByLoginOrEmail (loginOrEmail: string) {
        const user = await usersCollection.findOne({$or: [ { email: loginOrEmail }, { login: loginOrEmail }]});
        return user;
    }
};