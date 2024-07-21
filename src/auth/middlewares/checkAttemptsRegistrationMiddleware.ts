import { NextFunction, Response, Request } from 'express';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';

const attempts: {[keyof: string] : {
    countAttempts: number;
    timeFirstAttempt: number;
}} = {};

export const checkAttemptsRegistrationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    const url = `${ip}`+`${req.originalUrl}`;

    for (let attempt in attempts) {
        if ((Date.now() - attempts[attempt]?.timeFirstAttempt) < 20000) {
            delete attempts[attempt];
        }
    }

    if (!attempts[url]?.countAttempts) {
        attempts[url] = {
            timeFirstAttempt: Date.now(),
            countAttempts: 1,
        }
    } else {
        attempts[url].countAttempts++
    }

    if (attempts[url].countAttempts > 5 && (Date.now() - attempts[url]?.timeFirstAttempt) < 10000) {
        return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
    }

    return next();
};