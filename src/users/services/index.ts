import { userRepository } from '../repositories/users-repository';
import { UserQueryType, UserType, UserResponseType } from '../types';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { usersManager } from '../domain';
import { authRepository } from '../../auth/repositories';


export const usersService = {

    async getUserById (_id: ObjectId): Promise<UserResponseType | null> {
        const user: UserResponseType | null = await userRepository.getUserById(_id);
        return user;
    },

    async createUser (reqObj: UserQueryType): Promise<ObjectId> {
        const newUser = await usersManager.createUser(reqObj);
        await authRepository.createEntity(newUser._id);
        return await userRepository.createUser(newUser);
    },

    async deleteUser (id: ObjectId): Promise<boolean> {
        return await userRepository.deleteUser(id);
    },

    async deleteAllData () {
        return await userRepository.deleteAllData();
    },

    async checkCredentials (loginOrEmail: string, password: string): Promise<UserType | null> {
        const user: UserType | null = await userRepository.findByLoginOrEmail(loginOrEmail);
        if (!user) return null;
        const passwordHash = await usersManager.getUserHash(password, user.accountData.salt);
        if (user.accountData.passwordHash !== passwordHash) {
            return null;
        }
        return user;
    },

    async setNewConfirmationCode(email: string) {
        const confirmationCode = uuidv4();
        return await userRepository.updateConfirmationCode(email, confirmationCode);
    },

    async setNewRecoveryCode(email: string) {
        const recoveryCode = uuidv4();
        return await userRepository.updateRecoveryCode(email, recoveryCode);
    },
};