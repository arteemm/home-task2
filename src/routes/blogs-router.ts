import { Router, Request, Response, NextFunction } from 'express';
import { blogsService } from '../blogs/domains';
import { postsService } from '../posts/domains';
import { body } from 'express-validator';
import { PostsQueryParams } from '../posts/types';
import { BlogsQueryParams } from '../blogs/types';
import { errorMiddleware } from '../middlewares/error-middleware';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes';
import { validationAuthMiddleware } from '../middlewares/validation-auth-middleware';

export const blogsRouter = Router({});

blogsRouter.get('/', async (req: Request<{}, {}, {}, BlogsQueryParams>, res: Response) => {
  const blogsQueryObj = req.query;
  const blogs = await blogsService.getAllBlogs(blogsQueryObj);
  
  res.send(blogs);
});

blogsRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const blog = await blogsService.getBlogById(id);

  if (blog) {
    return res.send(blog);
  }

  return res.send(HTTP_STATUS_CODES.NOT_FOUND);
});


blogsRouter.get('/:id/posts', async (req: Request<{id: string}, {}, {}, PostsQueryParams> , res: Response) => {
  const id = req.params.id;
  const blogsQueryObj = req.query;
  const blog = await blogsService.getBlogById(id);

  if (!blog) {
    return res.send(HTTP_STATUS_CODES.NOT_FOUND);
  }

  const posts = await blogsService.getPostsByBlogId(id, blogsQueryObj);

  return res.status(HTTP_STATUS_CODES.SUCCESS_RESPONSE).send(posts);
});

blogsRouter.post('/',
  validationAuthMiddleware,
  body(['name', 'description', 'websiteUrl']).isString().trim().notEmpty(),
  body('name').isLength({min: 1, max:15}),
  body('description').isLength({min: 1, max:500}),
  body('websiteUrl').isLength({min: 1, max:100}).matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage('lal'),
  errorMiddleware,
  async (req: Request, res: Response) => {
    const blog =  await blogsService.createBlog(req.body);
    return res.status(HTTP_STATUS_CODES.SUCCESS_CREATED).send(blog);
});

blogsRouter.post('/:id/posts',
  validationAuthMiddleware,
  body(['title', 'shortDescription', 'content',]).isString().trim().notEmpty(),
  body('title').isLength({min: 1, max:30}),
  body('shortDescription').isLength({min: 1, max:100}),
  body('content').isLength({min: 1, max:1000}),
  errorMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const blog = await blogsService.getBlogById(id);
    if (!blog) {
      return res.send(HTTP_STATUS_CODES.NOT_FOUND);
    }

    const post =  await postsService.createPost({...req.body, blogId: id});
    return res.status(HTTP_STATUS_CODES.SUCCESS_CREATED).send(post);
});

blogsRouter.put('/:id',
  validationAuthMiddleware,
  body(['name','description', 'websiteUrl']).isString().trim().notEmpty(),
  body('name').isLength({min: 1, max:15}),
  body('description').isLength({min: 1, max:500}),
  body('websiteUrl').isLength({min: 1, max:100}).matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage('lal'),
  errorMiddleware,
  async (req: Request, res: Response) => {
  const id = req.params.id;

  const updatedResult = await blogsService.updateBlog(id, req.body);

  if (!updatedResult) {
    return res.send(HTTP_STATUS_CODES.NOT_FOUND);
  }

  return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
})

blogsRouter.delete('/:id',
  validationAuthMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result =  await blogsService.deleteBlog(id);

    if (!result) {
      res.send(HTTP_STATUS_CODES.NOT_FOUND);
      return;
    }
  
    return res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
});