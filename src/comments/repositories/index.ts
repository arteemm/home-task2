import { ObjectId } from 'mongodb';
import { CommentType, CommentResponseType, CommentRequestType } from '../types';
import { CommentModel } from '../schemas';

export const feedbacksRepository = {

    async getCommentById (_id: ObjectId): Promise<CommentResponseType | null > {
        const comment = await CommentModel.findOne({_id}).select('-__v -postId') as CommentResponseType | null;
        return comment;
    },
    async createComment (newComment: CommentType): Promise<ObjectId> {
        const result = await CommentModel.insertMany(newComment);
        return newComment._id;
    },
    async deleteComment (id: ObjectId): Promise<boolean> {
        const result = await CommentModel.deleteOne({ _id: id });
        
        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await CommentModel.deleteMany({});
    },
    async updateComment (reqObj: CommentRequestType, _id: ObjectId) {
        const result = await CommentModel.updateOne({_id}, {$set: reqObj});
        return result.matchedCount === 1;
    }
};