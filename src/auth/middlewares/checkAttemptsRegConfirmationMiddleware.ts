import { NextFunction, Response, Request } from 'express';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';

let attempts: {
    url: string;
    expirationDate: number;
}[] = [];

export const checkAttemptsRegConfirmationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    const url = `${ip}`+`${req.originalUrl}`;

    attempts = attempts.filter((item)=> (item.expirationDate - Date.now()) > 0);
    attempts.push({
        url,
        expirationDate: Date.now() + 10000,
    });

    const result = attempts.filter(item => item.url === url);


    if (result.length > 5) {
        return res.send(HTTP_STATUS_CODES.RATE_LIMITING)
    }

    return next();
};
