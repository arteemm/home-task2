import { NextFunction, Response, Request } from 'express';
import { securityQueryRepository } from '../repositories/security-query-repository';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';
import { jwtService } from '../../auth/services/jwt-service';

export const checkOwnDeviceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId as string;
    const deviceId = req.params.deviceId;

    const hasUserDeviceId = await securityQueryRepository.checkActiveDevice(userId, deviceId);
    
    if (!hasUserDeviceId) {
        return res.send(HTTP_STATUS_CODES.FORBIDDEN);
    }
    
    next();
    return;
};