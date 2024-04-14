import { Router, Request, Response, NextFunction } from 'express';
import { postRepository } from '../repositories/posts-repository';
import { body, validationResult, ResultFactory, param } from 'express-validator';
import { blogRepository } from '../repositories/blogs-repository';

export const postsRouter = Router({});

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

postsRouter.get('/', (req: Request, res: Response) => {
  const blogs = postRepository.getAllPosts();
  res.send(blogs);
});

postsRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const post = postRepository.getPostById(id);

  if (post) {
    res.send(post);
  }

  res.send(404);
});

postsRouter.post('/',
  validationAuth,
  body(['title', 'shortDescription', 'content', 'blogId']).isString().trim().notEmpty(),
  body('title').isLength({min: 1, max:30}),
  body('shortDescription').isLength({min: 1, max:100}),
  body('content').isLength({min: 1, max:1000}),
  body('blogId').custom(async value => {
    const blog = await blogRepository.getBlogById(value);
      if (!blog) {
        throw new Error('blog has not been found');
      }
  }),
 (req: Request, res: Response) => {
  const result = myValidationResult(req);
  if (result.isEmpty()) {
    const id = postRepository.createPost(req.body);
    const post = postRepository.getPostById(id);
    res.status(201).send(post);
  }
  res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

postsRouter.put('/:id',
  validationAuth,
  body(['title', 'shortDescription', 'content', 'blogId']).isString().trim().notEmpty(),
  body('title').isLength({min: 1, max:30}),
  body('shortDescription').isLength({min: 1, max:100}),
  body('content').isLength({min: 1, max:1000}),
 (req: Request, res: Response) => {
  const result = myValidationResult(req);
  const id = req.params.id;
  const post = postRepository.getPostById(id)
  if (!post) {
    res.send(404);
  }

  if (result.isEmpty()) {
    postRepository.updatePost(id, req.body);
    res.send(204);
  }
  res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

postsRouter.delete('/:id',
validationAuth,
(req: Request, res: Response) => {
  const id = req.params.id;
  const post = postRepository.getPostById(id);

  if (!post) {
    res.send(404);
    return;
  }

  postRepository.deletePost(+id);
  res.send(204);
});