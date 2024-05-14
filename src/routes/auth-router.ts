import { Request, Response, Router } from 'express';
import { usersService } from '../domain/users-service';

export const authRouter = Router({});

authRouter.post('/login',
    async(req: Request, res: Response) =>{
        const checkResult = await usersService.checkCredentials(req.body.email, req.body.password);
    }
)