import { NextFunction, Response, Request } from 'express';
import { usersService } from '../../users/services';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';
import { validationResult } from 'express-validator';

const attempts: {[keyof: string] : {
    countAttempts: number;
    timeFirstAttempt: number;
}} = {};

export const checkCredentialsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;

    if (result.isEmpty()) {
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password);
        if (!user) {
            if (!attempts[ip]?.countAttempts) {
                attempts[ip] = {
                    timeFirstAttempt: Date.now(),
                    countAttempts: 1,
                }
            } else {
                attempts[ip].countAttempts++
            }

            if (attempts[ip].countAttempts > 5 && (Date.now() - attempts[ip].timeFirstAttempt) < 10000) {
            
                return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
            }

            return res.send(HTTP_STATUS_CODES.UNAUTHORIZED)
        }
        attempts[ip].countAttempts = 0;
        req.userId = user._id.toString();
        next();
        return;
    }

    next();
    return;
};