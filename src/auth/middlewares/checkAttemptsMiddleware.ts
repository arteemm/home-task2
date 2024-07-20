import { NextFunction, Response, Request } from 'express';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';
import { validationResult } from 'express-validator';

const attempts: {[keyof: string] : {
    countAttempts: number;
    timeFirstAttempt: number;
}} = {};

export const checkAttemptsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;

    if (!result.isEmpty()) {
            if (!attempts[ip+req.originalUrl]?.countAttempts) {
                attempts[ip+req.originalUrl] = {
                    timeFirstAttempt: Date.now(),
                    countAttempts: 1,
                }
            } else {
                attempts[ip+req.originalUrl].countAttempts++
            }
            if (attempts[ip+req.originalUrl].countAttempts > 5 && (Date.now() - attempts[ip+req.originalUrl].timeFirstAttempt) < 10000) {
                return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
            }

        if (attempts[ip+req.originalUrl].countAttempts > 5 && (Date.now() - attempts[ip+req.originalUrl].timeFirstAttempt) < 10000) {
            return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
        }

        
        return next();
    }

    if (attempts[ip+req.originalUrl].countAttempts > 5 && (Date.now() - attempts[ip+req.originalUrl].timeFirstAttempt) < 10000) {
        return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
    }
    attempts[ip+req.originalUrl] ? attempts[ip+req.originalUrl].countAttempts = 0 : attempts[ip+req.originalUrl];

    return next();
};