import { Request, Response, Router } from 'express';
import { usersService } from '../domain/users-service';
import { body, validationResult, ResultFactory } from 'express-validator';
import { jwtService } from '../application/jwt-service';
import { authMiddleware } from '../middlewares/auth-middleware';
import { ObjectId } from 'mongodb';
import { authService } from '../domain/auth-service'
import { usersQueryRepository } from '../repositories/users-query-repository';

export const authRouter = Router({});

const myValidationResult: ResultFactory<{}> = validationResult.withDefaults({
    formatter: error => ({message: error.msg, field: error.path}) 
  });
  

authRouter.post('/login',
    body(['loginOrEmail', 'password']).isString().trim().notEmpty(),
    async(req: Request, res: Response) =>{
        const result = myValidationResult(req);
        if (result.isEmpty()) {
            const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password);

            if (!user) {
                return res.send(401)
            }

            const token = await jwtService.createJWT(user);
            return res.status(200).send({accessToken: token});
        }

        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
    }
)

authRouter.get('/me',
    authMiddleware,
    async(req: Request, res: Response) => {
        const result = myValidationResult(req);
        if (result.isEmpty() && req.userId) {
            const userId = new ObjectId(req.userId)
            const checkResult = await usersService.getUserById(userId);

            if (checkResult) {
                return res.send({email: checkResult.email, login: checkResult.login, userId: checkResult.id});
            }
            
            return res.send(401)
        }

        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
    }
)

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
    async (req: Request, res: Response) => {
        const result = myValidationResult(req);
        if (result.isEmpty()) {
            const user = await authService.createUser(req.body);
            return res.send(204);
        }
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
    }
);


authRouter.post('/registration-email-resending',
body('email').isString().trim().notEmpty(),
body('email').isLength({min: 3, max:1000}).matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('lal'),
// body('email').custom(async value => {
//     const isConfirmed = await usersQueryRepository.checkConfirmEmail(value);
//       if (isConfirmed) {
//         throw new Error('email has not found or if email is already confirmed');
//       }
//   }),
    async (req: Request, res: Response) => {
        const result = myValidationResult(req);
        if (result.isEmpty()) {
            const result = await authService.resendingEmail(req.body.email);
            if (!result) return res.status(400).send({ errorsMessages: [{ message: 'Invalid confirmation code', field: 'email' }] });
            return res.send(204);
        }
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
    }
);

authRouter.post('/registration-confirmation',
    body('code').isString().trim().notEmpty(),
    body('code').custom(async value => {
        const email = await authService.findUserEmailByCode(value) || '';
        const isConfirmed = await usersQueryRepository.checkConfirmEmail(email);
          if (isConfirmed) {
            throw new Error('email is already confirmed');
          }
      }),
    async (req: Request, res: Response) => {
        const result = myValidationResult(req);
        if (result.isEmpty()) {
            const result = await authService.confirmEmail(req.body.code);

            if (!result) {
                return res.status(400).send({ errorsMessages: [{ message: 'Invalid confirmation code', field: 'code' }] });
            }

            return res.send(204);
        }
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
    }
)