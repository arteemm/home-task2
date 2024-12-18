import request from 'supertest';
import { app } from '../../src/app';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { UserQueryType, UserResponseType } from '../../src/users/types';
import { HTTP_STATUS_CODES } from '../../src/constants/httpStatusCodes';
import { ErrorObject } from '../../src/types/errorsTypes';
import useragent from 'express-useragent';


export const securityTestsUtils = {

    async deleteUserDevice(deviceId: string, refreshToken: string, status: number) {
        const result = await request(app)
        .delete(ROUTERS_PATH_ENUM.SECURITY + `/devices/${deviceId}`)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(status);

        return result;
    },

    async getUserDevices(refreshToken: string) {
        const devices = await request(app).
        get(ROUTERS_PATH_ENUM.SECURITY + '/devices')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HTTP_STATUS_CODES.SUCCESS_RESPONSE);

        return devices;
    },


    async deleteUserAllDevices(refreshToken: string) {
        const result = await request(app)
        .delete(ROUTERS_PATH_ENUM.SECURITY + `/devices`)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);

        return result;
    },
};