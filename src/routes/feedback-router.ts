import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware';
import { feedbackService } from '../domain/feedbacks-service';
import { body, validationResult, ResultFactory } from 'express-validator';
import { ObjectId } from 'mongodb';

export const feedbackRouter = Router({});

const myValidationResult: ResultFactory<{}> = validationResult.withDefaults({
  formatter: error => ({message: error.msg, field: error.path}) 
});

feedbackRouter.get('/:id',
  async (req: Request<{id: string}, {}, {}, {}>, res: Response) => {
    const commentId = req.params.id;

    if (!ObjectId.isValid(commentId)) {
      res.send(404);
      return;
    }

    const comment = await feedbackService.getCommentById(commentId);

    if (!comment) {
      return res.send(404);
    }

    return res.status(200).send(comment);
});

feedbackRouter.put('/:id',
    authMiddleware,
    body(['content']).isString().trim().notEmpty(),
    body('content').isLength({min: 20, max:300}),
    async (req: Request, res: Response) => {
      const result = myValidationResult(req);
      if (result.isEmpty() && req.userId) {
        const idComment = req.params.id;
        if (!ObjectId.isValid(idComment)) {
          res.send(404);
          return;
        }
    
        if (req.userId) {
        const comment = await feedbackService.getCommentById(idComment);
        const isOwner = await feedbackService.checkOwnerComment(comment!.commentatorInfo.userId, req.userId);
          if (!isOwner) {
            return res.send(403);
          }
        }
  
        const result = await feedbackService.updateComment(req.body, idComment);

        if (!result) {
          res.send(404);
          return;
        }

      return res.send(204);
      }
      return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }) });
});

feedbackRouter.delete('/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      res.send(404);
      return;
    }

    if (req.userId) {
    const comment = await feedbackService.getCommentById(id);
    const isOwner = await feedbackService.checkOwnerComment(comment!.commentatorInfo.userId, req.userId);
      if (!isOwner) {
        return res.send(403);
      }
    }
    
    const result = await feedbackService.deleteComment(id);

      if (!result) {
        res.send(404);
        return;
      }
    

    return res.send(204);
});