import { Router, Request, Response, NextFunction } from 'express';
import { blogRepository } from '../repositories/db-repository';
import { body, validationResult, ResultFactory } from 'express-validator';

export const blogsRouter = Router({});

const auth = {
  login: 'admin',
  password: 'qwerty',
};

const myValidationResult: ResultFactory<{}> = validationResult.withDefaults({
  formatter: error => ({message: error.msg, field: error.path}) 
});

const validationAuth = ((req: Request, res: Response, next: NextFunction) => {
  const basic = (req.headers.authorization || '').split(' ')[0] || '';
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [ login, password ] = Buffer.from(b64auth, 'base64').toString().split(':')

  if (login && password && login === auth.login && password === auth.password && basic === 'Basic') {
    return next()
  }

  res.status(401).send('Authentication required.')
});

blogsRouter.get('/', async (req: Request, res: Response) => {
  const blogs = await blogRepository.getAllBlogs();
  res.send(blogs);
});

blogsRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const blog = await blogRepository.getBlogById(id);

  if (blog) {
    return res.send(blog);
  }

  return res.send(404);
});

blogsRouter.post('/',
  validationAuth,
  body(['name', 'description', 'websiteUrl']).isString().trim().notEmpty(),
  body('name').isLength({min: 1, max:15}),
  body('description').isLength({min: 1, max:500}),
  body('websiteUrl').isLength({min: 1, max:100}).matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage('lal'),
  async (req: Request, res: Response) => {
  const result = myValidationResult(req);
  if (result.isEmpty()) {
    const blog =  await blogRepository.createBlog(req.body);
    return res.status(201).send(blog);
  }
  return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

blogsRouter.put('/:id',
  validationAuth,
  body(['name','description', 'websiteUrl']).isString().trim().notEmpty(),
  body('name').isLength({min: 1, max:15}),
  body('description').isLength({min: 1, max:500}),
  body('websiteUrl').isLength({min: 1, max:100}).matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage('lal'),
  async (req: Request, res: Response) => {
  const result = myValidationResult(req);
  const id = req.params.id;

  if (result.isEmpty()) {
    const updatedResult = await blogRepository.updatePost(id, req.body);

    if (!updatedResult) {
      return res.send(404);
    }

    return res.send(204);
  }
  return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
})

blogsRouter.delete('/:id',
validationAuth,
async (req: Request, res: Response) => {
  const id = req.params.id;
  const result =  await blogRepository.deleteBlog(id);

  if (!result) {
    res.send(404);
    return;
  }
 
  return res.send(204);
});