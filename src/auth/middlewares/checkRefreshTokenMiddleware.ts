import { NextFunction, Response, Request } from 'express';
import { jwtService } from '../services/jwt-service';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';
import { validationResult } from 'express-validator';
import { securityQueryRepository } from '../../security/repositories/security-query-repository';


export const checkRefreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    const refreshToken = req.cookies.refreshToken as string;
    
    if (result.isEmpty()) {
        const result = await jwtService.getUserDataByToken(refreshToken);
        
        if (!result) {
            return res.send(HTTP_STATUS_CODES.UNAUTHORIZED)
        }
        const userId = result.userId.toString() as string;
        const isActiveDevice = await securityQueryRepository.checkDeviceByData(userId, result?.deviceId, new Date(result?.iat).toJSON())

        if (!isActiveDevice) {
            return res.send(HTTP_STATUS_CODES.UNAUTHORIZED)
        }

        req.userId = userId
        next();
        return;
    }

    next();
    return;
};

