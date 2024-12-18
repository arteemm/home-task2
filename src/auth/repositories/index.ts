import { ObjectId } from 'mongodb';
import { UserSessionByDeviceType } from '../types';
import { AuthModel } from '../schemas';

export const authRepository = {

    async updateCurrencyDeviceEntity (userId: string, newEntity: UserSessionByDeviceType): Promise<boolean> {
        const result = await AuthModel.updateOne(
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
        const result = await AuthModel.updateOne({userId: userId},  {$push: {sessions : newEntity}});
        return result.matchedCount === 1;
    },

    async createEntity (userId: ObjectId): Promise<void> {
        const id = userId.toString();
        const result = await AuthModel.insertMany({ userId: id, sessions: [] });
    },

    async deleteAllData () {
        await AuthModel.deleteMany({});
    },
};