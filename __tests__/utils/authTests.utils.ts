import request from 'supertest';
import { app } from '../../src/app';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { UserQueryType, UserResponseType } from '../../src/users/types';
import { HTTP_STATUS_CODES } from '../../src/constants/httpStatusCodes';
import { ErrorObject } from '../../src/types/errorsTypes';
import useragent from 'express-useragent';


export const authTestsUtils = {

    async loginUser (data: { loginOrEmail: string | number, password: string }, statusCode: HTTP_STATUS_CODES, device: string = 'Linux') {
        
        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.AUTH + '/login')
        .set('User-agent',useragent.getPlatform(device))
        .send(data)
        .expect(statusCode);

        return result;
    },

    async refreshTokenRequest (refreshToken: string | null, statusCode: HTTP_STATUS_CODES) {
        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.AUTH + '/refresh-token')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(statusCode);

        return result;
    },

    async logoutUser (refreshToken: string | null, statusCode: HTTP_STATUS_CODES) {
        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.AUTH + '/logout')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(statusCode);

        return result;
    },

    async returnNewPairTokens(refreshToken: string) {
        const loginUser = await this.refreshTokenRequest(refreshToken, HTTP_STATUS_CODES.SUCCESS_RESPONSE);
        const response = loginUser.body;
        const newRefreshToken = loginUser.headers['set-cookie'][0].split(' ')[0].slice(13);
        expect(response).toEqual({accessToken: expect.any(String)});
        expect(newRefreshToken).toEqual(expect.any(String));

        return {
            accessToken: response.accessToken,
            newRefreshToken
        }
    },
};