import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { settings } from '../settings';
import { usersQueryRepository } from '../repositories/users-query-repository';
import { userRepository } from '../repositories/users-repository';

export const jwtService = {
    async createJWT(id: ObjectId ) {
        const token = jwt.sign({userId: id}, settings.JWT_SECRET, {expiresIn: '10000'});
        const refreshToken = jwt.sign({userId: id}, settings.JWT_SECRET, {expiresIn: '20000'});
        return {
            token,
            refreshToken,
        };
    },

    async getUserByToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET);
            return new ObjectId(result.userId);
        } catch(error) {
            return null;
        }
    },

    verifyExpiration (token: string) {
        const isExpired = jwt.verify(token, settings.JWT_SECRET, (err) => {
            if(err) {
                return true;
            }
            return false;
        });

        return Boolean(isExpired);
    },

    async setTokenInvalid(userId: ObjectId, currentRefreshToken: string) {
        await userRepository.addTokenToUsedList(userId, currentRefreshToken);
    },

    async setNewToken(currentRefreshToken: string) {
        const isExpired = this.verifyExpiration(currentRefreshToken);
        if (isExpired) return false;
        const userId = await this.getUserByToken(currentRefreshToken);
        if(!userId) return false;
        const iskUsedToken = await usersQueryRepository.checkRefreshToken(userId, currentRefreshToken);
        if (iskUsedToken) return false;
        await this.setTokenInvalid(userId, currentRefreshToken);
        const {token, refreshToken} = await this.createJWT(userId);
        return {token, refreshToken};
    },
};