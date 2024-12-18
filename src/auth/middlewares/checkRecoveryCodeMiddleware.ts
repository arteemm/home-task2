import { NextFunction, Response, Request } from 'express';
// import { jwtService } from '../services/jwt-service';
import { usersQueryRepository } from '../../users/repositories/users-query-repository';
import { HTTP_STATUS_CODES } from '../../constants/httpStatusCodes';
import { validationResult } from 'express-validator';
import { securityQueryRepository } from '../../security/repositories/security-query-repository';


export const checkRecoveryCodeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
       
    if (result.isEmpty()) {
        const code = req.body.recoveryCode;
        const result = await usersQueryRepository.getUserRecoveryToken(code);

        if (!result) {
            return res.send(HTTP_STATUS_CODES.BAD_REQUEST)
        }

        next();
        return;
    }

    next();
    return;
};
