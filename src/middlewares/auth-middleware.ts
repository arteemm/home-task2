import { NextFunction, Response, Request } from 'express';
import { jwtService } from '../application/jwt-service';
import { usersService } from '../domain/users-service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        const userId = await jwtService.getUserByToken(token);

        if (userId) {
            const user = await usersService.getUserById(userId);

            if (user) {
                req.userId = user.id as string;
                next();
                return;
            }
        }
    }

    

    return res.send(401);
};