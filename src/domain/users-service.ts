import { userRepository } from '../repositories/users-repository';
import { UserQueryType, UserType, UserResponseType } from '../types';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export const usersService = {

    async getUserById (_id: ObjectId): Promise<UserResponseType | null> {
        const user: UserResponseType | null = await userRepository.getUserById(_id);
        return user;
    },
    async createUser (reqObj: UserQueryType): Promise<ObjectId> {
        const salt = await bcrypt.genSalt(10);
        const userHash = await this.getUserHash(reqObj.password, salt);
        const date = new Date();

        const newUser: UserType = {
            _id: new ObjectId(),
            login: reqObj.login,
            email: reqObj.email,
            createdAt: date.toJSON(),
            userSalt: salt,
            userHash,
        };

        return await userRepository.createUser(newUser);
    },
    async deleteUser (id: ObjectId): Promise<boolean> {
        return await userRepository.deleteUser(id);
    },
    async deleteAllData () {
        return await userRepository.deleteAllData();
    },
    async getUserHash (password: string, salt: string):Promise<string> {
        const userHash = await bcrypt.hash(password, salt);
        return userHash;
    },
    async checkCredentials (loginOrEmail: string, password: string): Promise<UserType | null> {
        const user: UserType | null = await userRepository.findByLoginOrEmail(loginOrEmail);
        if (!user) return null;
        const passwordHash = await this.getUserHash(password, user.userSalt);
        if (user.userHash !== passwordHash) {
            return null;
        }
        return user;
    }
};