import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { settings } from '../../settings';
import { jwtManager } from '../domain';
import { authRepository } from '../repositories';
import { Request } from 'express';
import { securityQueryRepository } from '../../security/repositories/security-query-repository';


export const jwtService = {
    async createJWT(req: Request, currentDeviceId: string | null = null) {
        const platform = req.useragent?.platform || 'Windows';
        const refreshTokenCreateTimestamp= Date.now();
        const deviceId = currentDeviceId || await jwtManager.getDeviceHash(platform);
        const id = req.userId as string;
        const { accessToken, refreshToken } = jwtManager.getNewTokens(id, refreshTokenCreateTimestamp, deviceId);
        const newEntity = jwtManager.createNewEntity(req, refreshTokenCreateTimestamp, deviceId);

        const isActiveDevice = await securityQueryRepository.checkActiveDevice(id, deviceId);
        if (isActiveDevice) {
            await authRepository.updateCurrencyDeviceEntity(id, newEntity);
        } else {
            await authRepository.updateNewDeviceEntity(id, newEntity);
        }

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
        const currentRefreshToken = req.cookies.refreshToken as string;
        const result = await this.getUserDataByToken(currentRefreshToken);
        const {accessToken, refreshToken} = await this.createJWT(req, result?.deviceId);
        return {accessToken, refreshToken};
    },
};