import { jwtService } from '../../auth/services/jwt-service';
import { securityQueryRepository } from './security-query-repository';
import { authCollection } from '../../db';

const options = {
    projection: {
        _id: 0,
        sessions: 1,
    }
};

export const securityRepository = {

    async deleteUserDeviceById (userId: string, deviceId: string): Promise<boolean> {
        const result = await authCollection.updateOne({userId}, {$pull: {sessions: { deviceId }}});
        
        return result.matchedCount === 1;
    },

    async deleteUsersAllDevices (userId: string, refreshToken: string): Promise<boolean> {
        const userData = await jwtService.getUserDataByToken(refreshToken);
        const activeSessions = await authCollection.findOne({
            userId: userId, 'sessions.deviceId': userData!.deviceId,
        });
        const activeSession = activeSessions!.sessions.filter(item => item.deviceId === userData!.deviceId);
        const result = await authCollection.updateOne({userId}, {$set: {sessions: [...activeSession]}});
        
        return result.matchedCount === 1;
    },
};