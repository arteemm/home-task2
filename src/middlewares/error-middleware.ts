import { NextFunction, Response, Request } from 'express';
import { validationResult } from 'express-validator';
import { STATUS_CODES } from '../constants/statusCodes';
import { ValidationResultError } from '../types/errorsTypes';


export const errorMiddleware = (req: Request<{}, {}, {}, {}>, res: Response, next: NextFunction) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        return next()
    }

    const validationErrors: ValidationResultError[] = [];
    result.array({ onlyFirstError: true }).forEach((error) => {
        if (error.type === 'field') {
            validationErrors.push({ message : error.msg, field: error.path});
        }
    });
    return res.status(STATUS_CODES.BAD_REQUEST).send({ errorsMessages: validationErrors });
}