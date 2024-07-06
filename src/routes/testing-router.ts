import { Router, Request, Response } from 'express';
import { blogsService } from '../domain/blogs-service';
import { postsService } from '../domain/posts-service';
import { usersService } from '../users/services';
import { feedbackService } from '../domain/feedbacks-service';
import { authService } from '../auth/services';
import { HTTP_STATUS_CODES } from '../constants/httpStatusCodes';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    await blogsService.deleteAllData();
    await postsService.deleteAllData();
    await usersService.deleteAllData();
    await feedbackService.deleteAllData();
    await authService.deleteAllData();
    res.send(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
});