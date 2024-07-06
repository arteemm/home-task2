import { NextFunction, Response, Request } from 'express';
import { jwtService } from '../auth/services/jwt-service';
import { usersService } from '../users/services';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        const result = await jwtService.getUserDataByToken(token);
        
        if (result) {
            const user = await usersService.getUserById(result.userId);
            if (user) {
                req.userId = user.id.toString();
                next();
                return;
            }
        }
    }

    

    return res.send(HTTP_STATUS_CODES.UNAUTHORIZED);
};