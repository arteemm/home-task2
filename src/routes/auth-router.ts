import { Request, Response, Router } from 'express';
import { usersService } from '../domain/users-service';
import { body, validationResult, ResultFactory } from 'express-validator';

export const authRouter = Router({});

const myValidationResult: ResultFactory<{}> = validationResult.withDefaults({
    formatter: error => ({message: error.msg, field: error.path}) 
  });
  

authRouter.post('/login',
    body(['login', 'password', 'email']).isString().trim().notEmpty(),
    async(req: Request, res: Response) =>{
        const result = myValidationResult(req);
        if (result.isEmpty()) {
            const checkResult = await usersService.checkCredentials(req.body.email, req.body.password);

            if (!checkResult) {
                return res.send(401)
            }

            return res.send(204)
        }

        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
    }
)