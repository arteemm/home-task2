import bcrypt from 'bcryptjs';
import { usersService } from '../../users/services/';
import { userRepository } from '../../users/repositories/users-repository';
import { emailAdapter } from '../adapters/email-adapter';
import { UserQueryType } from '../../users/types/usersTypes';
import { authRepository } from '../repositories';


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
        if(user.emailConfirmation.isConfirmed) return false;

        const result = await userRepository.updateConfirmation(user._id);
        return result;
    },

    async resendingEmail(email: string) {
            await usersService.setNewConfirmationCode(email);
            const user = await userRepository.findByLoginOrEmail(email);
            if(!user || user.emailConfirmation.isConfirmed) return false;
            const message = `
                <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                    <a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>Try to complete registration</a>
                </p>
            `;
            const subject = 'confirm message again';
            await emailAdapter.sendEmail(email, subject, message);
            return true;
    },


    async deleteAllData () {
        return await authRepository.deleteAllData();
    }
};