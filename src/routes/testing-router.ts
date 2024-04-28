import { Router, Request, Response } from 'express';
import { blogRepository, postRepository } from '../repositories/db-repository';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    await blogRepository.deleteAllData();
    await postRepository.deleteAllData();
    res.send(204);
});