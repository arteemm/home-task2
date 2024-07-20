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
    const url = `${ip}`+`${req.originalUrl}`;

    if (result.isEmpty()) {
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password);
        if (!user) {
            if (!attempts[url]?.countAttempts) {
                attempts[url] = {
                    timeFirstAttempt: Date.now(),
                    countAttempts: 1,
                }
            } else {
                attempts[url].countAttempts++
            }
            if (attempts[url].countAttempts > 5 && (Date.now() - attempts[url].timeFirstAttempt) < 10000) {
                return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
            }

            return res.send(HTTP_STATUS_CODES.UNAUTHORIZED)
        }
        if (attempts[url].countAttempts > 5 && (Date.now() - attempts[url].timeFirstAttempt) < 10000) {
            return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
        }

        attempts[url] ? attempts[url].countAttempts = 0 : attempts[url];
        req.userId = user._id.toString();
        return next();
    }

    if (attempts[url].countAttempts > 5 && (Date.now() - attempts[url].timeFirstAttempt) < 10000) {
        return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
    }

    return next();
};