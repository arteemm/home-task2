import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { feedbackService } from '../domain/feedbacks-service';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { errorMiddleware } from '../middlewares/error-middleware';
import { STATUS_CODES } from '../constants/statusCodes';
import { validationAuthMiddleware } from '../middlewares/validation-auth-middleware';

export const feedbackRouter = Router({});

feedbackRouter.get('/:id',
  async (req: Request<{id: string}, {}, {}, {}>, res: Response) => {
    const commentId = req.params.id;

    if (!ObjectId.isValid(commentId)) {
      res.send(STATUS_CODES.NOT_FOUND);
      return;
    }

    const comment = await feedbackService.getCommentById(commentId);

    if (!comment) {
      return res.send(STATUS_CODES.NOT_FOUND);
    }

    return res.status(STATUS_CODES.SUCCESS_RESPONSE).send(comment);
});

feedbackRouter.put('/:id',
    authMiddleware,
    body(['content']).isString().trim().notEmpty(),
    body('content').isLength({min: 20, max:300}),
    errorMiddleware,
    async (req: Request, res: Response) => {
      if (req.userId) {
        const idComment = req.params.id;
        if (!ObjectId.isValid(idComment)) {
          res.send(STATUS_CODES.NOT_FOUND);
          return;
        }
    
        if (req.userId) {
        const comment = await feedbackService.getCommentById(idComment);
        const isOwner = await feedbackService.checkOwnerComment(comment!.commentatorInfo.userId, req.userId);
          if (!isOwner) {
            return res.send(STATUS_CODES.FORBIDDEN);
          }
        }
  
        const result = await feedbackService.updateComment(req.body, idComment);

        if (!result) {
          res.send(STATUS_CODES.NOT_FOUND);
          return;
        }

      return res.send(STATUS_CODES.SUCCESS_NO_CONTENT);
      }

      return res.send(STATUS_CODES.NOT_FOUND);
});

feedbackRouter.delete('/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      res.send(STATUS_CODES.NOT_FOUND);
      return;
    }

    if (req.userId) {
    const comment = await feedbackService.getCommentById(id);
    const isOwner = await feedbackService.checkOwnerComment(comment!.commentatorInfo.userId, req.userId);
      if (!isOwner) {
        return res.send(STATUS_CODES.FORBIDDEN);
      }
    }
    
    const result = await feedbackService.deleteComment(id);

      if (!result) {
        res.send(STATUS_CODES.NOT_FOUND);
        return;
      }
    

    return res.send(STATUS_CODES.SUCCESS_NO_CONTENT);
});