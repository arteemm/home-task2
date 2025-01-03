import request from 'supertest';
import { app } from '../../src/app';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { RequestBlogBody } from '../../src/blogs/types';
import { RequestPostBody } from '../../src/posts/types';
import { HTTP_STATUS_CODES } from '../../src/constants/httpStatusCodes';


export const blogsUtils = {
    async createBlog (data: RequestBlogBody, statusCode: HTTP_STATUS_CODES, credentials: {login: string, password: string}) {

        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.BLOGS)
        .send(data)
        .auth(credentials.login, credentials.password)
        .expect(statusCode);

        return result;
    },

    async createPost (id: string, data: Omit<RequestPostBody, 'blogId'>, statusCode: HTTP_STATUS_CODES, credentials: {login: string, password: string}) {

        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.BLOGS + `/${id}/posts`)
        .send(data)
        .auth(credentials.login, credentials.password)
        .expect(statusCode);

        return result;
    },

    async updateBlog (id: string, data: RequestBlogBody, statusCode: HTTP_STATUS_CODES, credentials: {login: string, password: string}) {

        const result = await request(app)
        .put(ROUTERS_PATH_ENUM.BLOGS + `/${id}`)
        .send(data)
        .auth(credentials.login, credentials.password)
        .expect(statusCode);

        return result;
    },

    async deleteBlog (id: string, statusCode: HTTP_STATUS_CODES, credentials: {login: string, password: string}) {

        const result = await request(app)
        .delete(ROUTERS_PATH_ENUM.BLOGS + `/${id}`)
        .auth(credentials.login, credentials.password)
        .expect(statusCode);

        return result;
    },
};