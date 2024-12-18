import { Router, Request, Response, NextFunction } from 'express';
import { postsService } from '../posts/domains';
import { blogRepository } from '../blogs/repositories';
import { body } from 'express-validator';
import { PostsQueryParams } from '../posts/types';
import { authMiddleware } from '../middlewares/auth-middleware';
import { feedbackService } from '../comments/domains';
import { feedbacksQueryRepository } from '../comments/repositories/feedbacks-query-repository';
import { errorMiddleware } from '../middlewares/error-middleware';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes';
import { validationAuthMiddleware } from '../middlewares/validation-auth-middleware';

export const postsRouter = Router({});

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

  return res.send(HTTP_STATUS_CODES.NOT_FOUND);
});

postsRouter.get('/:id/comments', async (req: Request<{id: string}, {}, {}, PostsQueryParams>, res: Response) => {
  const id = req.params.id;
  const queryParam = req.query;
  const post = await postsService.getPostById(id);
  

  if (post) {
    const comments = await feedbacksQueryRepository.getAllComments(queryParam, id);
    return res.status(HTTP_STATUS_CODES.SUCCESS_RESPONSE).send(comments);
  }

  return res.send(HTTP_STATUS_CODES.NOT_FOUND);
});

postsRouter.post('/',
  validationAuthMiddleware,
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
  errorMiddleware,
  async (req: Request, res: Response) => {
    const newPost = await postsService.createPost(req.body);
    return res.status(HTTP_STATUS_CODES.SUCCESS_CREATED).send(newPost);
});

postsRouter.post('/:postsId/comments',
  authMiddleware,
  body(['content']).isString().trim().notEmpty(),
  body('content').isLength({min: 20, max:300}),
  errorMiddleware,
  async (req: Request, res: Response) => {
    if (req.userId) {
      const postsId = req.params.postsId;
      const post = await postsService.getPostById(postsId);

      if (!post) {
        return res.send(HTTP_STATUS_CODES.NOT_FOUND);
      }
      const newComment = await feedbackService.createComment(req.body, req.userId, postsId);
      return res.status(HTTP_STATUS_CODES.SUCCESS_CREATED).send(newComment);
    }

    return res.send(HTTP_STATUS_CODES.NOT_FOUND);
});


postsRouter.put('/:id',
  validationAuthMiddleware,
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
  errorMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const post = await postsService.updatePost(id, req.body);

    if (!post) {
      return res.send(HTTP_STATUS_CODES.NOT_FOUND);
    }

    return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
});

postsRouter.delete('/:id',
  validationAuthMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await postsService.deletePost(id);;

    if (!result) {
      res.send(HTTP_STATUS_CODES.NOT_FOUND);
      return;
    }
 
    return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
});