import { Router, Request, Response } from 'express';
import { blogsService } from '../blogs/domains';
import { postsService } from '../posts/domains';
import { usersService } from '../users/services';
import { feedbackService } from '../comments/domains';
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