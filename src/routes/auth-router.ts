import { Request, Response, Router } from 'express';
import { usersService } from '../domain/users-service';
import { body } from 'express-validator';
import { jwtService } from '../application/jwt-service';
import { authMiddleware } from '../middlewares/auth-middleware';
import { ObjectId } from 'mongodb';
import { authService } from '../domain/auth-service'
import { usersQueryRepository } from '../repositories/users-query-repository';
import { errorMiddleware } from '../middlewares/error-middleware';
import { STATUS_CODES } from '../constants/statusCodes';

export const authRouter = Router({});

authRouter.post('/login',
    body(['loginOrEmail', 'password']).isString().trim().notEmpty(),
    errorMiddleware,
    async(req: Request, res: Response) =>{
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password);

        if (!user) {
            return res.send(STATUS_CODES.UNAUTHORIZED)
        }

        const {token, refreshToken} = await jwtService.createJWT(user._id);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        return res.status(STATUS_CODES.SUCCESS_RESPONSE).send({accessToken: token});
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

        return res.send(STATUS_CODES.UNAUTHORIZED)
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
        return res.send(STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);


authRouter.post('/registration-email-resending',
    body('email').isString().trim().notEmpty(),
    body('email').isLength({min: 3, max:1000}).matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('lal'),
    errorMiddleware,
    async (req: Request, res: Response) => {
        const result = await authService.resendingEmail(req.body.email);
        if (!result) return res.status(STATUS_CODES.BAD_REQUEST).send({ errorsMessages: [{ message: 'Invalid confirmation code', field: 'email' }] });
        return res.send(STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);

authRouter.post('/registration-confirmation',
    body('code').isString().trim().notEmpty(),
    errorMiddleware,
    async (req: Request, res: Response) => {
        const result = await authService.confirmEmail(req.body.code);

        if (!result) {
            return res.status(STATUS_CODES.BAD_REQUEST).send({ errorsMessages: [{ message: 'Invalid confirmation code', field: 'code' }] });
        }

        return res.send(STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);

authRouter.post('/refresh-token',
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken as string;

        const result = await jwtService.setNewToken(refreshToken);

        if (!result) {
            return res.send(STATUS_CODES.UNAUTHORIZED);
        }

        res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true })
        return res.status(STATUS_CODES.SUCCESS_RESPONSE).send({accessToken: result.token});
    }
);

authRouter.post('/logout',
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken as string;
        const userId = await jwtService.getUserByToken(refreshToken) as ObjectId;
        const isExpired = await jwtService.checkTokenValid(userId, refreshToken);

        if (!isExpired || !userId) {
            return res.send(STATUS_CODES.UNAUTHORIZED);
        }

        const result = await jwtService.setTokenInvalid(userId, refreshToken);

        return res.send(STATUS_CODES.SUCCESS_NO_CONTENT);
    }
);