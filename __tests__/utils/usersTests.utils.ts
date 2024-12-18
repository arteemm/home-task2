import request from 'supertest';
import { app } from '../../src/app';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { UserQueryType, UserResponseType } from '../../src/users/types';
import { HTTP_STATUS_CODES } from '../../src/constants/httpStatusCodes';
import { ErrorObject } from '../../src/types/errorsTypes';
import useragent from 'express-useragent';


export const usersTestsUtils = {

    async createUser (data: UserQueryType, statusCode: HTTP_STATUS_CODES) {
        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.USERS)
        .auth('admin', 'qwerty')
        .send(data)
        .expect(statusCode);

        return result;
    },

    async deleteUser (id: string, statusCode: HTTP_STATUS_CODES, credentials: {login: string, password: string}) {

        const result = await request(app)
        .delete(ROUTERS_PATH_ENUM.USERS + `/${id}`)
        .auth(credentials.login, credentials.password)
        .expect(statusCode);

        return result;
    },

};