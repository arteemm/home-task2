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

export const securityQueryRepository = {

    async getAllDevices (userId: string): Promise<UserSessionDeviceType[] | null> {
        const devices = await authCollection.findOne({userId});
        
        let result: UserSessionDeviceType[] | null = null;
        if (devices) {
            result = devices.sessions.map(item => {
                return {
                    ip: item.ip as string,
                    title: item.title,
                    lastActiveDate: `${item.lastActiveDate}`,
                    deviceId: item.deviceId,
                };
            })
        }

        return result;
    },

    async checkActiveDevice(userId: string, deviceId: string) {
        const device = await authCollection.findOne({userId: userId, 'sessions.deviceId': deviceId});

        return device ? true : false;
    }
};