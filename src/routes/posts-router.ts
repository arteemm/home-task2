import { Router, Request, Response, NextFunction } from 'express';
import { postsService } from '../domain/posts-service';
import { blogRepository } from '../repositories/db-repository';
import { body, validationResult, ResultFactory } from 'express-validator';
import { PostsQueryParams } from '../types';
import { authMiddleware } from '../middlewares/auth-middleware';
import { feedbackService } from '../domain/feedbacks-service';
import { feedbacksQueryRepository } from '../repositories/feedbacks-query-repository';

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
    return next();
  }

  res.status(401).send('Authentication required.')
});

postsRouter.get('/', async (req: Request<{}, {}, {}, PostsQueryParams>, res: Response) => {
  const postsQueryObj = req.query;
  const blogs = await postsService.getAllPosts(postsQueryObj);
  res.send(blogs);
});

postsRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const post = await postsService.getPostById(id);

  if (post) {
    return res.send(post);
  }

  return res.send(404);
});

postsRouter.get('/:id/comments', async (req: Request<{id: string}, {}, {}, PostsQueryParams>, res: Response) => {
  const id = req.params.id;
  const queryParam = req.query;
  const post = await postsService.getPostById(id);
  

  if (post) {
    const comments = await feedbacksQueryRepository.getAllComments(queryParam, id);
    return res.status(200).send(comments);
  }

  return res.send(404);
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
  async (req: Request, res: Response) => {
    const result = myValidationResult(req);
    if (result.isEmpty()) {
      const newPost = await postsService.createPost(req.body);
      return res.status(201).send(newPost);
    }
    return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

postsRouter.post('/:postsId/comments',
  authMiddleware,
  body(['content']).isString().trim().notEmpty(),
  body('content').isLength({min: 20, max:300}),
  async (req: Request, res: Response) => {
    const result = myValidationResult(req);
    if (result.isEmpty() && req.userId) {
      const postsId = req.params.postsId;
      const post = await postsService.getPostById(postsId);

      if (!post) {
        return res.send(404);
      }

      const newComment = await feedbackService.createComment(req.body, req.userId, postsId);
      return res.status(201).send(newComment);
    }
    return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});


postsRouter.put('/:id',
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
  async (req: Request, res: Response) => {
    const result = myValidationResult(req);
    const id = req.params.id;

    if (result.isEmpty()) {
      const post = await postsService.updatePost(id, req.body);

      if (!post) {
        return res.send(404);
      }
  
      return res.send(204);
    }

    return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

postsRouter.delete('/:id',
  validationAuth,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await postsService.deletePost(id);;

    if (!result) {
      res.send(404);
      return;
    }
 
    return res.send(204);
});