import request from 'supertest';
import { app } from '../../src/app';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { RequestBlogBody } from '../../src/blogs/types';
import { RequestPostBody } from '../../src/posts/types';
import { HTTP_STATUS_CODES } from '../../src/constants/httpStatusCodes';
import { CommentRequestType } from '../../src/comments/types';


export const postsUtils = {
    async createPost (data: RequestPostBody, statusCode: HTTP_STATUS_CODES, credentials: {login: string, password: string}) {

        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.POSTS)
        .send(data)
        .auth(credentials.login, credentials.password)
        .expect(statusCode);

        return result;
    },

    async createComment (id: string, data: CommentRequestType, statusCode: HTTP_STATUS_CODES, token: string) {

        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.POSTS + `/${id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .expect(statusCode);

        return result;
    },

    async updatePost (id: string, data: CommentRequestType, statusCode: HTTP_STATUS_CODES, credentials: {login: string, password: string}) {

        const result = await request(app)
        .put(ROUTERS_PATH_ENUM.POSTS + `/${id}`)
        .send(data)
        .auth(credentials.login, credentials.password)
        .expect(statusCode);

        return result;
    },

    async deletePost (id: string, statusCode: HTTP_STATUS_CODES, credentials: {login: string, password: string}) {

        const result = await request(app)
        .delete(ROUTERS_PATH_ENUM.POSTS + `/${id}`)
        .auth(credentials.login, credentials.password)
        .expect(statusCode);

        return result;
    },
};