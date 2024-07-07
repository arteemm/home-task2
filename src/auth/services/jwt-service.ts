import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { settings } from '../../settings';
import { jwtManager } from '../domain';
import { authRepository } from '../repositories';
import { Request } from 'express';
import { securityQueryRepository } from '../../security/repositories/security-query-repository';


export const jwtService = {
    async createJWT(id: string, deviceId: string, refreshTokenCreateTimestamp: number) {
        const { accessToken, refreshToken } = jwtManager.getNewTokens(id, refreshTokenCreateTimestamp, deviceId);
 
        return {
            accessToken,
            refreshToken,
        };
    },

    async loginUser(req: Request, ) {
        const id = req.userId as string;
        const platform = req.useragent?.platform || 'Windows';
        const refreshTokenCreateTimestamp = Date.now(); 
        const deviceId = await jwtManager.getDeviceHash(platform);
        const newEntity = jwtManager.createNewEntity(req, refreshTokenCreateTimestamp, deviceId);
        await authRepository.updateNewDeviceEntity(id, newEntity);
        const {accessToken, refreshToken} = await this.createJWT(id, deviceId, refreshTokenCreateTimestamp);

        return {
            accessToken,
            refreshToken,
        };
    },

    async getUserDataByToken(token: string) {
        try {
            const result = jwt.verify(token, settings.JWT_SECRET) as {userId: string; deviceId: string; iat: number};
            return {
                userId: new ObjectId(result.userId),
                deviceId: result.deviceId,
                iat: result.iat,
            };
        } catch(error) {
            return null;
        }
    },

    async setNewToken(req: Request) {
        const id = req.userId as string;
        const currentRefreshToken = req.cookies.refreshToken as string;
        const result = await this.getUserDataByToken(currentRefreshToken);
        const refreshTokenCreateTimestamp = Date.now(); 
        const {accessToken, refreshToken} = await this.createJWT(id, result!.deviceId, refreshTokenCreateTimestamp);
        const newEntity = jwtManager.createNewEntity(req, refreshTokenCreateTimestamp, result!.deviceId);
        await authRepository.updateCurrencyDeviceEntity(id, newEntity);
        return {accessToken, refreshToken};
    },
};