import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes'
import { Request, Response, NextFunction } from 'express';

const auth = {
    login: 'admin',
    password: 'qwerty',
  };
  
export const validationAuthMiddleware = ((req: Request<{}, {}, {}, {}>, res: Response, next: NextFunction) => {
    const basic = (req.headers.authorization || '').split(' ')[0] || '';
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [ login, password ] = Buffer.from(b64auth, 'base64').toString().split(':')
  
    if (login && password && login === auth.login && password === auth.password && basic === 'Basic') {
      return next();
    }
  
    res.status(HTTP_STATUS_CODES.UNAUTHORIZED).send('Authentication required.')
});
  