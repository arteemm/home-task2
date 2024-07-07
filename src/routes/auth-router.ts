import { Request, Response, Router } from 'express';
import { usersService } from '../users/services/';
import { body } from 'express-validator';
import { jwtService } from '../auth/services/jwt-service';
import { authMiddleware } from '../middlewares/auth-middleware';
import { ObjectId } from 'mongodb';
import { authService } from '../auth/services';
import { usersQueryRepository } from '../users/repositories/users-query-repository';
import { errorMiddleware } from '../middlewares/error-middleware';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes';
import { checkCredentialsMiddleware } from '../auth/middlewares/checkCredentialsMiddleware';
import { checkRefreshTokenMiddleware } from '../auth/middlewares/checkRefreshTokenMiddleware';
import { securityRepository } from '../security/repositories';

export const authRouter = Router({});

authRouter.post('/login',
    body(['loginOrEmail', 'password']).isString().trim().notEmpty(),
    checkCredentialsMiddleware,
    errorMiddleware,
    async(req: Request, res: Response) =>{
        const {accessToken, refreshToken} = await jwtService.loginUser(req);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        return res.status(HTTP_STATUS_CODES.SUCCESS_RESPONSE).send({accessToken});
    }
);

authRouter.get('/me',
    authMiddleware,
    errorMiddleware,
    async(req: Request, res: Response) => {
        if (req.userId) {
            const userId = new ObjectId(req.userId)
            const checkResult = await usersService.getUserById(userId);

            if (checkResult) {
                return res.send({email: checkResult.email, login: checkResult.login, userId: checkResult.id});
            }
        }

        return res.send(HTTP_STATUS_CODES.UNAUTHORIZED)
    }
);

authRouter.post('/registration',
    body(['login', 'password', 'email']).isString().trim().notEmpty(),
    body('password').isLength({min: 6, max:20}),
    body('login').isLength({min: 3, max:10}).matches(/^[a-zA-Z0-9_-]*$/).withMessage('lal'),
    body('email').isLength({min: 3, max:1000}).matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('lal'),
    body('login').custom(async value => {
        const isUniqueLogin = await usersQueryRepository.checkLogin(value);
          if (!isUniqueLogin) {
            throw new Error('login must be unique');
          }
      }),
    body('email').custom(async value => {
        const isUniqueEmail = await usersQueryRepository.checkEmail(value);
          if (!isUniqueEmail) {
            throw new Error('email must be unique');
          }
      }),
    errorMiddleware,
    async (req: Request, res: Response) => {
        const user = await authService.createUser(req.body);
        return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);


authRouter.post('/registration-email-resending',
    body('email').isString().trim().notEmpty(),
    body('email').isLength({min: 3, max:1000}).matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('lal'),
    errorMiddleware,
    async (req: Request, res: Response) => {
        const result = await authService.resendingEmail(req.body.email);
        if (!result) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).send({ errorsMessages: [{ message: 'Invalid confirmation code', field: 'email' }] });
        return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);

authRouter.post('/registration-confirmation',
    body('code').isString().trim().notEmpty(),
    errorMiddleware,
    async (req: Request, res: Response) => {
        const result = await authService.confirmEmail(req.body.code);

        if (!result) {
            return res.status(HTTP_STATUS_CODES.BAD_REQUEST).send({ errorsMessages: [{ message: 'Invalid confirmation code', field: 'code' }] });
        }

        return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);

authRouter.post('/refresh-token',
    checkRefreshTokenMiddleware,
    errorMiddleware,
    async (req: Request, res: Response) => {
        const result = await jwtService.setNewToken(req);

        res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true })
        return res.status(HTTP_STATUS_CODES.SUCCESS_RESPONSE).send({accessToken: result.accessToken});
    }
);

authRouter.post('/logout',
    checkRefreshTokenMiddleware,
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken as string;
        const userId = req.userId as string;
        const result = await jwtService.getUserDataByToken(refreshToken);
        await securityRepository.deleteUserDeviceById(userId, result!.deviceId);

        return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);