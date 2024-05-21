import { feedbacksRepository } from '../repositories/feedbacks-repository';
import { CommentRequestType, CommentType, CommentResponseType } from '../types';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { usersService } from './users-service';

import { userRepository } from '../repositories/users-repository';
import { emailAdapter } from '../adapters/email-adapter';
import { UserQueryType } from '../types';


export const authService = {
    async createUser(reqObj: UserQueryType) {
        const id = await usersService.createUser(reqObj);
        const user = await userRepository.getFullUserById(id);
        const message = `
            <h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${user?.emailConfirmation.confirmationCode}'>complete registration</a>
            </p>
        `;
        const subject = 'confirm message';
        await emailAdapter.sendEmail(reqObj.email, subject, message);
    },
    async getUserHash (password: string, salt: string):Promise<string> {
        const userHash = await bcrypt.hash(password, salt);
        return userHash;
    },

    async findUserEmailByCode(code: string) {
        const user = await userRepository.findUserByCode(code);
        return user?.accountData.email;
    },

    async confirmEmail(code: string) {
        const user = await userRepository.findUserByCode(code);
        if (!user) return false;

        const result = await userRepository.updateConfirmation(user._id);
        return result;
    },

    async resendingEmail(email: string) {
            // await usersService.setNewConfirmationCode(email);
            const user = await userRepository.findByLoginOrEmail(email);
            const message = `
                <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                    <a href='https://somesite.com/confirm-email?code=${user?.emailConfirmation.confirmationCode}'>complete registration</a>
                </p>
            `;
            const subject = 'confirm message';
            await emailAdapter.sendEmail(email, subject, message);
    }
    // async getCommentById (id: string): Promise<CommentResponseType | null> {
    //     const commentId = new ObjectId(id);
    //     const comment: CommentResponseType | null = await feedbacksRepository.getCommentById(commentId);
    //     return comment;
    // },
    // async createComment (reqObj: CommentRequestType, userId: string, postId: string): Promise<CommentResponseType | null> {
    //     const date = new Date();
    //     const id = new ObjectId(userId);
    //     const user = await usersService.getUserById(id);

    //     const newComment: CommentType = {
    //         _id: new ObjectId(),
    //         content: reqObj.content,
    //         createdAt: date.toJSON(),
    //         commentatorInfo: {
    //             userId: user!.id,
    //             userLogin: user!.login,
    //         },
    //         postId,
    //     };

    //     const commentId =  await feedbacksRepository.createComment(newComment);
    //     return await feedbacksRepository.getCommentById(commentId);
    // },
    // async deleteComment (id: string): Promise<boolean> {
    //     const commentId = new ObjectId(id);
    //     return await feedbacksRepository.deleteComment(commentId);
        
    // },
    // async deleteAllData () {
    //     return await feedbacksRepository.deleteAllData();
    // },
    // async updateComment (reqObj: CommentRequestType, id: string):Promise<boolean> {
    //     const _id = new ObjectId(id);
    //     const isUpdated = await feedbacksRepository.updateComment(reqObj, _id);
    //     return isUpdated;
    // },
    // async checkOwnerComment (userIOwnerId: string, userId: string): Promise<boolean> {
    //     const userObjId = new ObjectId(userId);

    //     if (userObjId.equals(userIOwnerId)) {
    //         return true;
    //     }

    //     return false;
    // }
};