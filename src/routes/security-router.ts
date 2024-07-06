import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { errorMiddleware } from '../middlewares/error-middleware';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes';
import { securityQueryRepository } from '../security/repositories/security-query-repository';
import { securityRepository } from '../security/repositories';
import { checkOwnDeviceMiddleware } from '../security/middlewares/checkOwnDeviceMiddleware';

export const securityRouter = Router({});

securityRouter.get('/devices',
    authMiddleware,
    errorMiddleware,
    async(req: Request, res: Response) =>{
        const devices = await securityQueryRepository.getAllDevices(req.userId as string);
        return res.status(HTTP_STATUS_CODES.SUCCESS_RESPONSE).send(devices);
    }
);

securityRouter.delete('/devices/:deviceId',
    authMiddleware,
    checkOwnDeviceMiddleware,
    errorMiddleware,
    async(req: Request, res: Response) =>{
        const deviceId = req.params.deviceId;
        const devices = await securityRepository.deleteUserDeviceById(req.userId as string, deviceId);

        if (!devices) {
            return res.send(HTTP_STATUS_CODES.NOT_FOUND);
        }

        return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);

securityRouter.delete('/devices',
    authMiddleware,
    errorMiddleware,
    async(req: Request, res: Response) =>{
        const devices = await securityRepository.deleteUsersAllDevices(req.userId as string);
        return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);