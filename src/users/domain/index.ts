import { UserQueryType, UserType } from '../types';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';


export const usersManager= {
    async createUser (reqObj: UserQueryType): Promise<UserType> {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await this.getUserHash(reqObj.password, salt)
        const newUser = {
            _id: new ObjectId(),
            accountData: {
                userName: reqObj.login,
                email: reqObj.email,
                passwordHash,
                salt,
                createdAt: new Date().toJSON(),
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 3,
                }),
                isConfirmed: false,
            },
            usedTokens: [],
            recoveryCode: '',
        };

        return newUser;
    },

    async getUserHash (password: string, salt: string):Promise<string> {
        const userHash = await bcrypt.hash(password, salt);
        return userHash;
    }
};