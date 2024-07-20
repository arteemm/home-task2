import { Request, Response, Router } from 'express';
import { checkRefreshTokenMiddleware } from '../security/middlewares/checkRefreshTokenMiddleware';
import { errorMiddleware } from '../middlewares/error-middleware';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes';
import { securityQueryRepository } from '../security/repositories/security-query-repository';
import { securityRepository } from '../security/repositories';
import { checkOwnDeviceMiddleware } from '../security/middlewares/checkOwnDeviceMiddleware';

export const securityRouter = Router({});

securityRouter.get('/devices',
    checkRefreshTokenMiddleware,
    errorMiddleware,
    async(req: Request, res: Response) =>{
        const devices = await securityQueryRepository.getAllUserDevices(req.userId as string);
        return res.status(HTTP_STATUS_CODES.SUCCESS_RESPONSE).send(devices);
    }
);

securityRouter.delete('/devices/:deviceId',
    checkRefreshTokenMiddleware,
    checkOwnDeviceMiddleware,
    errorMiddleware,
    async(req: Request, res: Response) =>{
        const deviceId = req.params.deviceId;
        const devices = await securityRepository.deleteUserDeviceById(req.userId as string, deviceId);

        return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);

securityRouter.delete('/devices',
    checkRefreshTokenMiddleware,
    errorMiddleware,
    async(req: Request, res: Response) =>{
        const devices = await securityRepository.deleteUsersAllDevices(req.userId as string);
        return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);