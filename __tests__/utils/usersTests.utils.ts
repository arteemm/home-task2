import request from 'supertest';
import { app } from '../../src/app';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { UserQueryType, UserResponseType } from '../../src/types/usersTypes';
import { STATUS_CODES } from '../../src/constants/statusCodes';
import { ErrorObject } from '../../src/types/errorsTypes';
import { ObjectId } from 'mongodb';


export const usersTestsUtils = {
    getUserResponseObj (data: UserQueryType): UserResponseType {
        const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return {
        id: expect.any(String),
        email: data.email,
        login: data.login,
        createdAt: expect.stringMatching(isoPattern),
        };
    },


    getUserResponseErrorObj (): ErrorObject {
        return {
            errorsMessages: [ { message: expect.any(String), field: 'login' }, { message: expect.any(String), field: 'password' }, { message: expect.any(String), field: 'email' } ]
        };
    },

    async createUser (data: UserQueryType, statusCode: STATUS_CODES) {
        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.USERS)
        .auth('admin', 'qwerty')
        .send(data)
        .expect(statusCode);

        return result;
    },

    async loginUser (data: { loginOrEmail: string | number, password: string }, statusCode: STATUS_CODES) {
        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.AUTH + '/login')
        .send(data)
        .expect(statusCode);

        return result;
    },

    async refreshTokenRequest (refreshToken: string | null, statusCode: STATUS_CODES) {
        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.AUTH + '/refresh-token')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(statusCode);

        return result;
    },
};