import { Router, Request, Response, NextFunction } from 'express';
import { blogsService } from '../domain/blogs-service';
import { postsService } from '../domain/posts-service';
import { body, validationResult, ResultFactory } from 'express-validator';
import { BlogsQueryParams, PostsQueryParams } from '../types';

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

  return res.send(404);
});


blogsRouter.get('/:id/posts', async (req: Request<{id: string}, {}, {}, PostsQueryParams> , res: Response) => {
  const id = req.params.id;
  const blogsQueryObj = req.query;
  const blog = await blogsService.getBlogById(id);

  if (!blog) {
    return res.send(404);
  }

  const posts = await blogsService.getPostsByBlogId(id, blogsQueryObj);

  return res.status(200).send(posts);
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
    const blog =  await blogsService.createBlog(req.body);
    return res.status(201).send(blog);
  }
  return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

blogsRouter.post('/:id/posts',
  validationAuth,
  body(['title', 'shortDescription', 'content',]).isString().trim().notEmpty(),
  body('title').isLength({min: 1, max:30}),
  body('shortDescription').isLength({min: 1, max:100}),
  body('content').isLength({min: 1, max:1000}),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const blog = await blogsService.getBlogById(id);
    if (!blog) {
      return res.send(404);
    }

    const result = myValidationResult(req);
    if (result.isEmpty()) {
      const post =  await postsService.createPost({...req.body, blogId: id});
      return res.status(201).send(post);
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
    const updatedResult = await blogsService.updateBlog(id, req.body);

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
  const result =  await blogsService.deleteBlog(id);

  if (!result) {
    res.send(404);
    return;
  }
 
  return res.send(204);
});