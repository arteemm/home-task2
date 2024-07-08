import { NextFunction, Response, Request } from 'express';
import { securityQueryRepository } from '../repositories/security-query-repository';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';
import { jwtService } from '../../auth/services/jwt-service';

export const checkOwnDeviceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId as string;
    const deviceId = req.params.deviceId;

    const hasUserDeviceId = await securityQueryRepository.checkActiveDevice(userId, deviceId);
    const activeSessions = await securityQueryRepository.getAllActiveSessions();
    let hasDeviceIdInActiveSessions = false;

    activeSessions.forEach(item => {
        item.sessions.forEach(i => {
            if (i.deviceId === deviceId) hasDeviceIdInActiveSessions = true;
        })
    });
    
    if (!hasUserDeviceId && hasDeviceIdInActiveSessions) {
        return res.send(HTTP_STATUS_CODES.FORBIDDEN);
    }

    if (!hasDeviceIdInActiveSessions) {
        return res.send(HTTP_STATUS_CODES.NOT_FOUND);
    }
    
    next();
    return;
};