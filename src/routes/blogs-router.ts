import { Router, Request, Response, NextFunction } from 'express';
import { blogRepository } from '../repositories/blogs-repository';
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
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [ login, password ] = Buffer.from(b64auth, 'base64').toString().split(':')

  if (login && password && login === auth.login && password === auth.password) {
    return next()
  }

  res.status(401).send('Authentication required.')
});

blogsRouter.get('/', (req: Request, res: Response) => {
  const blogs = blogRepository.getAllBlogs();
  res.send(blogs);
});

blogsRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const blog = blogRepository.getBlogById(id);

  if (!blog) {
    res.send(404);
    return;
  }

  res.send(blog);
});

blogsRouter.post('/',
  validationAuth,
  body(['name', 'description', 'websiteUrl']).isString().trim().notEmpty(),
  body('name').isLength({min: 1, max:15}),
  body('description').isLength({min: 1, max:500}),
  body('websiteUrl').isLength({min: 1, max:100}).matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage('lal'),
 (req: Request, res: Response) => {
  const result = myValidationResult(req);
  if (result.isEmpty()) {
    const id = blogRepository.createBlog(req.body);
    const blog = blogRepository.getBlogById(id);
    res.status(201).send(blog);
  }
  res.status(400).send({ errors: result.array() });
});

blogsRouter.put('/:id',
  validationAuth,
  body(['name','description', 'websiteUrl']).optional({ nullable: true }).isString().trim().notEmpty(),
  body('name').optional({ nullable: true }).isLength({min: 1, max:15}),
  body('description').optional({ nullable: true }).isLength({min: 1, max:500}),
  body('websiteUrl').optional({ nullable: true }).isLength({min: 1, max:100}).matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage('lal'),
 (req: Request, res: Response) => {
  const result = myValidationResult(req);
  const id = req.params.id;
  if (!blogRepository.getBlogById(id)) {
    res.send(404);
  }

  if (result.isEmpty()) {
    blogRepository.updatePost(id, req.body);
    res.send(204);
  }
  res.status(400).send({ errors: result.array() });
})

blogsRouter.delete('/:id',
validationAuth,
(req: Request, res: Response) => {
  const id = req.params.id;
  const blog = blogRepository.getBlogById(id);

  if (!blog) {
    res.send(404);
    return;
  }

  res.send(204);
});