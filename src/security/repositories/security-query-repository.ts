import { UserSessionDeviceType,  } from '../types/';
import { AuthModel } from '../../auth/schemas';


export const securityQueryRepository = {

    async getAllUserDevices (userId: string): Promise<UserSessionDeviceType[] | null> {
        const devices = await AuthModel.findOne({userId}).select('-_id -__v');
        
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

    async checkDeviceByData(userId: string, deviceId: string, lastActiveDate: string) {
        const device = await AuthModel.findOne({
            userId: userId,
            'sessions.deviceId': deviceId,
            'sessions.lastActiveDate': lastActiveDate,
        });
        return device ? true : false;
    },

    async getAllActiveSessions() {
        const devices = await AuthModel.find({});
        return devices;
    },

    async checkActiveDevice(userId: string, deviceId: string) {
        const device = await AuthModel.findOne({
            userId: userId, 'sessions.deviceId': deviceId,
        });

        return device ? true : false;
    },
};