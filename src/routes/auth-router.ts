import { Request, Response, Router } from 'express';
import { usersService } from '../domain/users-service';
import { body, validationResult, ResultFactory } from 'express-validator';
import { jwtService } from '../application/jwt-service';
import { authMiddleware } from '../middlewares/auth-middleware';
import { ObjectId } from 'mongodb';

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
            return res.status(200).send(token);
        }

        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
    }
)

authRouter.get('/me',
    authMiddleware,
    async(req: Request, res: Response) =>{
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