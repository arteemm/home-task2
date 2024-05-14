import { Router, Request, Response, NextFunction } from 'express';
import { usersService } from '../domain/users-service';
import { usersQueryRepository } from '../repositories/users-query-repository';
import { body, validationResult, ResultFactory } from 'express-validator';
import { UsersQueryParams, UserQueryType } from '../types';
import { ObjectId } from 'mongodb';

export const usersRouter = Router({});

const auth = {
  login: 'admin',
  password: 'qwerty',
};

const myValidationResult: ResultFactory<{}> = validationResult.withDefaults({
  formatter: error => ({message: error.msg, field: error.path}) 
});

const validationAuth = ((req: Request<{}, {}, {}, UsersQueryParams>, res: Response, next: NextFunction) => {
  const basic = (req.headers.authorization || '').split(' ')[0] || '';
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [ login, password ] = Buffer.from(b64auth, 'base64').toString().split(':')

  if (login && password && login === auth.login && password === auth.password && basic === 'Basic') {
    return next();
  }

  res.status(401).send('Authentication required.')
});

usersRouter.get('/',
  validationAuth,
  async (req: Request<{}, {}, {}, UsersQueryParams>, res: Response) => {
    const result = myValidationResult(req);
    if (result.isEmpty()) {
      const usersQueryObj = req.query;
      const users = await usersQueryRepository.getAllUsers(usersQueryObj);
      return res.send(users);
    }
    return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

usersRouter.post('/',
  validationAuth,
  body(['login', 'password', 'email']).isString().trim().notEmpty(),
  body('login').isLength({min: 3, max:10}).matches(/^[a-zA-Z0-9_-]*$/).withMessage('lal'),
  body('password').isLength({min: 6, max:20}),
  body('email').matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('lal'),
  async (req: Request<{}, {}, UserQueryType, UsersQueryParams>, res: Response) => {
    const result = myValidationResult(req);
    if (result.isEmpty()) {
      const id = await usersService.createUser(req.body);
      const newUser = await usersService.getUserById(id);
      return res.status(201).send(newUser);
    }
    return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

usersRouter.delete('/:id',
  validationAuth,
  async (req: Request<{id: ObjectId}, {}, UserQueryType, UsersQueryParams>, res: Response) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      res.send(404);
      return;
    }

    const result = await usersService.deleteUser(id);

    if (!result) {
      res.send(404);
      return;
    }
 
    return res.send(204);
});