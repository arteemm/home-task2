import { jwtService } from '../../auth/services/jwt-service';
import { AuthModel } from '../../auth/schemas';

export const securityRepository = {

    async deleteUserDeviceById (userId: string, deviceId: string): Promise<boolean> {
        const result = await AuthModel.updateOne({userId}, {$pull: {sessions: { deviceId }}});
        
        return result.matchedCount === 1;
    },

    async deleteUsersAllDevices (userId: string, refreshToken: string): Promise<boolean> {
        const userData = await jwtService.getUserDataByToken(refreshToken);
        const activeSessions = await AuthModel.findOne({
            userId: userId, 'sessions.deviceId': userData!.deviceId,
        });
        const activeSession = activeSessions?.sessions.filter(item => item.deviceId === userData!.deviceId);
        const result = await AuthModel.updateOne({userId}, {$set: {sessions: [...activeSession || []]}});
        
        return result.matchedCount === 1;
    },
};