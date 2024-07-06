import { ObjectId } from 'mongodb';
import { UserSessionByDeviceType, UserSessionsType } from '../types';
import { authCollection } from '../../db';

const options = {
    projection: {
        _id: 0,
        id: '$_id',
        email: '$accountData.email',
        login: '$accountData.userName',
        createdAt: '$accountData.createdAt'
    }
};

export const authRepository = {

    // async getUserById (_id: ObjectId): Promise<UserResponseType | null > {
    //     const user = await usersCollection.findOne({_id}, options) as UserResponseType | null;
    //     return user;
    // },
    // async getFullUserById (_id: ObjectId): Promise<UserType | null > {
    //     const user = await usersCollection.findOne({_id});
    //     return user;
    // },
    async updateCurrencyDeviceEntity (userId: string, newEntity: UserSessionByDeviceType): Promise<boolean> {
        const result = await authCollection.updateOne(
            {userId: userId, 'sessions.deviceId': newEntity.deviceId} , { $set: { 
                'sessions.$.ip': newEntity.ip,
                'sessions.$.expirationDate': newEntity.expirationDate,
                'sessions.$.lastActiveDate': newEntity.lastActiveDate,
                'sessions.$.url': newEntity.url,
            } }
        );

        return result.matchedCount === 1;
    },

    async updateNewDeviceEntity (userId: string, newEntity: UserSessionByDeviceType): Promise<boolean> {
        const result = await authCollection.updateOne({userId: userId},  {$push: {sessions : newEntity}});
        return result.matchedCount === 1;
    },

    async createEntity (userId: ObjectId): Promise<void> {
        const id = userId.toString();
        const result = await authCollection.insertOne({ userId: id, sessions: [] });
    },
    // async deleteUser (id: ObjectId): Promise<boolean> {
    //     const idO = new ObjectId(id);
    //     const result = await usersCollection.deleteOne({ _id: idO });

    //     return result.deletedCount === 1;
    // },
    async deleteAllData () {
        await authCollection.deleteMany({});
    },
    // async findByLoginOrEmail (loginOrEmail: string) {
    //     const user = await usersCollection.findOne({$or: [ { 'accountData.email': loginOrEmail }, { 'accountData.userName': loginOrEmail }]});
    //     return user;
    // },

    // async findUserByCode(code: string) {
    //     const user = await usersCollection.findOne({'emailConfirmation.confirmationCode': code});
    //     return user;
    // },

    // async updateConfirmation(_id: ObjectId) {
    //     const result = await usersCollection.updateOne({ _id }, {$set: {'emailConfirmation.isConfirmed': true}});

    //     return result.matchedCount === 1;
    // },

    // async updateConfirmationCode(email: string, confirmationCode: string) {
    //     const result = await usersCollection.updateOne({'accountData.email':  email}, {$set: {'emailConfirmation.confirmationCode': confirmationCode}});

    //     return result.matchedCount === 1;
    // },

    // async addTokenToUsedList(userId: ObjectId, refreshToken: string) {
    //     usersCollection.updateOne({_id: userId}, {$push: {usedTokens: refreshToken}});
    // },
};