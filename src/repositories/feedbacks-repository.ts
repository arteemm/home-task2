import { ObjectId } from 'mongodb';
import { CommentType, CommentResponseType, CommentRequestType } from '../types';
import { commentsCollection } from './db';

const options = {
    projection: {
        _id: 0,
        id: '$_id',
        content: 1,
        commentatorInfo: 1,
        createdAt: 1,
    }
};

export const feedbacksRepository = {

    async getCommentById (_id: ObjectId): Promise<CommentResponseType | null > {
        const comment = await commentsCollection.findOne({_id}, options) as CommentResponseType | null;
        return comment;
    },
    async createComment (newComment: CommentType): Promise<ObjectId> {
        const result = await commentsCollection.insertOne(newComment);
        return newComment._id;
    },
    async deleteComment (id: ObjectId): Promise<boolean> {
        const result = await commentsCollection.deleteOne({ _id: id });

        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await commentsCollection.deleteMany({});
    },
    async updateComment (reqObj: CommentRequestType, _id: ObjectId) {
        const result = await commentsCollection.updateOne({_id}, {$set: reqObj});
        return result.matchedCount === 1;
    }
};