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
            console.log(result)
            return res.send(HTTP_STATUS_CODES.UNAUTHORIZED)
        }

        const userId = result.userId.toString() as string;
        const isActiveDevice = await securityQueryRepository.checkActiveDevice(userId, result?.deviceId)
        const aaaa = await securityQueryRepository.getAllDevices(userId);

        if (!isActiveDevice) {
            console.log(aaaa)
            console.log(1111111)
            console.log(result)
            return res.send(HTTP_STATUS_CODES.UNAUTHORIZED)
        }

        req.userId = userId
        next();
        return;
    }

    next();
    return;
};