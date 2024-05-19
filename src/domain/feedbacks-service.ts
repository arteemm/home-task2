import { feedbacksRepository } from '../repositories/feedbacks-repository';
import { CommentRequestType, CommentType, CommentResponseType } from '../types';
import { ObjectId } from 'mongodb';
import { usersService } from './users-service';

export const feedbackService = {

    async getCommentById (id: string): Promise<CommentResponseType | null> {
        const commentId = new ObjectId(id);
        const comment: CommentResponseType | null = await feedbacksRepository.getCommentById(commentId);
        return comment;
    },
    async createComment (reqObj: CommentRequestType, userId: string, postId: string): Promise<CommentResponseType | null> {
        const date = new Date();
        const id = new ObjectId(userId);
        const user = await usersService.getUserById(id);

        const newComment: CommentType = {
            _id: new ObjectId(),
            content: reqObj.content,
            createdAt: date.toJSON(),
            commentatorInfo: {
                userId: user!.id,
                userLogin: user!.login,
            },
            postId,
        };

        const commentId =  await feedbacksRepository.createComment(newComment);
        return await feedbacksRepository.getCommentById(commentId);
    },
    async deleteComment (id: string): Promise<boolean> {
        const commentId = new ObjectId(id);
        return await feedbacksRepository.deleteComment(commentId);
        
    },
    async deleteAllData () {
        return await feedbacksRepository.deleteAllData();
    },
    async updateComment (reqObj: CommentRequestType, id: string):Promise<boolean> {
        const _id = new ObjectId(id);
        const isUpdated = await feedbacksRepository.updateComment(reqObj, _id);
        return isUpdated;
    },
    async checkOwnerComment (userIOwnerId: string, userId: string): Promise<boolean> {
        const userObjId = new ObjectId(userId);

        if (userObjId.equals(userIOwnerId)) {
            return true;
        }

        return false;
    }
};