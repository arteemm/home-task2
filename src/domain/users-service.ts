import { userRepository } from '../repositories/users-repository';
import { UserQueryType, UserType, UserResponseType } from '../types';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';


export const usersService = {

    async getUserById (_id: ObjectId): Promise<UserResponseType | null> {
        const user: UserResponseType | null = await userRepository.getUserById(_id);
        return user;
    },
    async createUser (reqObj: UserQueryType): Promise<ObjectId> {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await this.getUserHash(reqObj.password, salt)
        const newUser = {
            _id: new ObjectId(),
            accountData: {
                userName: reqObj.login,
                email: reqObj.email,
                passwordHash,
                salt,
                createdAt: new Date(),
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 3,
                }),
                isConfirmed: false,
            }
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
        const passwordHash = await this.getUserHash(password, user.accountData.salt);
        if (user.accountData.passwordHash !== passwordHash) {
            return null;
        }
        return user;
    },
    async setNewConfirmationCode(email: string) {
        const confirmationCode = uuidv4();
        return await userRepository.updateConfirmationCode(email, confirmationCode);
    },
};