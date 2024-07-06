import { Router, Request, Response } from 'express';
import { usersService } from '../users/services';
import { usersQueryRepository } from '../users/repositories/users-query-repository';
import { body } from 'express-validator';
import { UsersQueryParams, UserQueryType } from '../users/types/usersTypes';
import { ObjectId } from 'mongodb';
import { errorMiddleware } from '../middlewares/error-middleware';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes';
import { validationAuthMiddleware } from '../middlewares/validation-auth-middleware';

export const usersRouter = Router({});

usersRouter.get('/',
  validationAuthMiddleware,
  errorMiddleware,
  async (req: Request<{}, {}, {}, UsersQueryParams>, res: Response) => {
    const usersQueryObj = req.query;
    const users = await usersQueryRepository.getAllUsers(usersQueryObj);
    return res.send(users);
});

usersRouter.post('/',
  validationAuthMiddleware,
  body(['login', 'password', 'email']).isString().trim().notEmpty(),
  body('login').isLength({min: 3, max:10}).matches(/^[a-zA-Z0-9_-]*$/).withMessage('lal'),
  body('password').isLength({min: 6, max:20}),
  body('email').matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('lal'),
  errorMiddleware,
  async (req: Request<{}, {}, UserQueryType, UsersQueryParams>, res: Response) => {
    const id = await usersService.createUser(req.body);
    const newUser = await usersService.getUserById(id);
    return res.status(HTTP_STATUS_CODES.SUCCESS_CREATED).send(newUser);
});

usersRouter.delete('/:id',
  validationAuthMiddleware,
  async (req: Request<{id: ObjectId}, {}, UserQueryType, UsersQueryParams>, res: Response) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      res.send(HTTP_STATUS_CODES.NOT_FOUND);
      return;
    }

    const result = await usersService.deleteUser(id);

    if (!result) {
      res.send(HTTP_STATUS_CODES.NOT_FOUND);
      return;
    }
 
    return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
});