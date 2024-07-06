import request from 'supertest';
import { app } from '../../src/app';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { RequestBlogBody } from '../../src/types/blogsTypes';
import { HTTP_STATUS_CODES } from '../../src/constants/httpStatusCodes';
import { ErrorObject } from '../../src/types/errorsTypes';


export const blogsUtils = {
    async createBlog (data: RequestBlogBody, statusCode: HTTP_STATUS_CODES, errorObj: ErrorObject) {
        const expectedResponseData = (Object.keys(errorObj).length === 0) ? data : errorObj;

        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.BLOGS)
        .send(data)
        .auth('admin', 'qwerty')
        .expect(statusCode, expectedResponseData);

        return result;
    }
};