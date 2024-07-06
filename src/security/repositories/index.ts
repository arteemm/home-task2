import { UserSessionDeviceType,  } from '../types/';
import { UserSessionByDeviceType, UserSessionsType  } from '../../auth/types';
import { authCollection } from '../../db';
import { ObjectId } from 'mongodb';

const options = {
    projection: {
        _id: 0,
        sessions: 1,
        // userId: 0,
        // ip: '$sessions[0].ip',
        // title: '$sessions[0].title',
        // lastActiveDate: '$sessions[0].lastActiveDate',
        // deviceId: '$sessions[0].deviceId'
    }
};

export const securityRepository = {

    async deleteUserDeviceById (userId: string, deviceId: string): Promise<boolean> {
        const result = await authCollection.updateOne({userId}, {$pull: {sessions: { deviceId }}});
        
        return result.matchedCount === 1;
    },

    async deleteUsersAllDevices (userId: string): Promise<boolean> {
        const result = await authCollection.updateOne({userId}, {$set: {sessions: []}});
        
        return result.matchedCount === 1;
    },
};