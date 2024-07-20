import jwt from 'jsonwebtoken';
import { settings } from '../../settings';
import { UserSessionByDeviceType } from '../types';
import { Request } from 'express';
import { createHash } from 'crypto';

export const jwtManager= {
    getNewTokens(id: string, timestamp: number, deviceId: string) {
        const accessToken = this.createAccessToken(id)
        const refreshToken = this.createRefreshToken(id, timestamp, deviceId);

        return {
            accessToken,
            refreshToken,
        };
    },

    createRefreshToken(id: string, timestamp: number, deviceId: string) {
        const refreshToken = jwt.sign({userId: id, iat: timestamp, deviceId}, settings.JWT_SECRET, {expiresIn: '20000'});

        return refreshToken;
    },

    createAccessToken(id: string) {
        const accessToken = jwt.sign({userId: id, date: Date.now()}, settings.JWT_SECRET, { expiresIn: '10000'});

        return accessToken;
    },

    async getDeviceHash (device: string):Promise<string> {
        const date = Date.now();
        const deviceHash = createHash('sha256').update(device + date).digest('hex');
        return deviceHash;
    },

    createNewEntity(req: Request, lastActiveDate: number, deviceId: string): UserSessionByDeviceType {
        const newEntity = {
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            title: req.useragent?.platform || 'Windows',
            lastActiveDate: new Date(lastActiveDate).toJSON(),
            deviceId,
            url: req.baseUrl,
            expirationDate: lastActiveDate - 20000,
        }

        return newEntity;
    }
}