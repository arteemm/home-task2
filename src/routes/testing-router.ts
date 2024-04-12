import { Router, Request, Response } from 'express';
import { blogRepository } from '../repositories/blogs-repository';
import { postRepository } from '../repositories/posts-repository';

export const testingRouter = Router({});

testingRouter.delete('/all-data', (req: Request, res: Response) => {
    blogRepository.deleteAllData();
    postRepository.deleteAllData();
    res.send(204);
});