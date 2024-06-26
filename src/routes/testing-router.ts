import { Router, Request, Response } from 'express';
import { blogsService } from '../domain/blogs-service';
import { postsService } from '../domain/posts-service';
import { usersService } from '../domain/users-service';
import { feedbackService } from '../domain/feedbacks-service';
import { STATUS_CODES } from '../constants/statusCodes';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    await blogsService.deleteAllData();
    await postsService.deleteAllData();
    await usersService.deleteAllData();
    await feedbackService.deleteAllData();
    res.send(STATUS_CODES.SUCCESS_NO_CONTENT);
});