import request from 'supertest';
import { app } from '../../src/app';
import dotenv from 'dotenv';
import { UserResponseType } from '../../src/types/usersTypes';
import { MongoClient, ObjectId } from 'mongodb';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { usersTestsUtils } from '../utils/usersTests.utils';
import { STATUS_CODES } from '../../src/constants/statusCodes';

dotenv.config();


const dbName = 'tests';
const mongoURI = `mongodb://0.0.0.0:27017/${dbName}` || process.env.MONGO_URL;

describe(ROUTERS_PATH_ENUM.USERS, () => {
    const userPassword = "string";
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    let newUser: UserResponseType | null = null;
    const client = new MongoClient(mongoURI);

    beforeAll(async () => {
        await client.connect();
        await request(app).delete(ROUTERS_PATH_ENUM.TESTING + '/all-data').expect(204);
    });

    afterAll(async () => {
       await client.close();
    });

    it('GET users = []', async () => {
        await request(app).
        get(ROUTERS_PATH_ENUM.USERS)
        .auth('admin', 'qwerty')
        .expect({ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })
    });

    it('- Shouldn\'t create user with incorrect data', async () => {
        const newUserRequestData = { login: "2", password: "s", email: "example" };
        const createdUser = await usersTestsUtils.createUser(newUserRequestData, STATUS_CODES.BAD_REQUEST);
        expect(createdUser.body).toEqual(usersTestsUtils.getUserResponseErrorObj());
        const users = await request(app)
        .get(ROUTERS_PATH_ENUM.USERS)
        .auth('admin', 'qwerty')
        .expect({ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });

    });

    it('- Shouldn\'t returned unauthorized code with incorrect auth', async () => {
        const newUserRequestData = { login: "2m1wFsZrBG", password: "string", email: "example@example.com" };
        const result = await request(app)
        .post(ROUTERS_PATH_ENUM.USERS)
        .auth('mom', 'dad')
        .send(newUserRequestData)
        .expect(STATUS_CODES.UNAUTHORIZED, {});
        const users = await request(app)
        .get(ROUTERS_PATH_ENUM.USERS)
        .auth('admin', 'qwerty')
        .expect({ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });

    });

    it('- Should create user with correct data', async () => {
        const newUserRequestData = { login: "2m1wFsZrBG", password: userPassword, email: "example@example.com" };
        const createdUser = await usersTestsUtils.createUser(newUserRequestData, STATUS_CODES.SUCCESS_CREATED);
        newUser = createdUser.body;
        expect(newUser).toEqual(usersTestsUtils.getUserResponseObj(newUserRequestData));
        const users = await request(app)
        .get(ROUTERS_PATH_ENUM.USERS)
        .auth('admin', 'qwerty');
        expect(users.body).toEqual({ pagesCount: 1, page: 1, pageSize: 10, totalCount: 1, items: [
            usersTestsUtils.getUserResponseObj(newUserRequestData),
        ]})

    });

    it('- Shouldn\'t login user with incorrect data', async () => {
        const loginUser = await usersTestsUtils.loginUser({loginOrEmail: 'bbb', password: 'aaa'}, STATUS_CODES.UNAUTHORIZED);
        expect(loginUser.body).toEqual({});
    });

    it('- Should return error model with incorrect data model', async () => {
        const loginUser = await usersTestsUtils.loginUser({loginOrEmail: 1, password: 'aaa'}, STATUS_CODES.BAD_REQUEST);
        expect(loginUser.body).toEqual({ errorsMessages: [ { message: expect.any(String), field: 'loginOrEmail' } ] });
    });

    it('- Should login user with correct data', async () => {
        const loginUser = await usersTestsUtils.loginUser({loginOrEmail: newUser!.login, password: userPassword}, STATUS_CODES.SUCCESS_RESPONSE);
        accessToken = loginUser.body;
        refreshToken = loginUser.headers['set-cookie'][0].split(' ')[0].slice(13);
        expect(accessToken).toEqual({accessToken: expect.any(String)});
        expect(refreshToken).toEqual(expect.any(String));
    });

    it('- Shouldn\'t login user with incorrect refreshToken', async () => {
        const loginUser = await usersTestsUtils.refreshTokenRequest('sssssss', STATUS_CODES.UNAUTHORIZED);
        expect(loginUser.body).toEqual({});
    });

    it('- Should return new pair accessToken and refreshToken with correct data', async () => {
        const loginUser = await usersTestsUtils.refreshTokenRequest(refreshToken, STATUS_CODES.SUCCESS_RESPONSE);
        accessToken = loginUser.body;
        refreshToken = loginUser.headers['set-cookie'][0].split(' ')[0].slice(13);
        expect(accessToken).toEqual({accessToken: expect.any(String)});
        expect(refreshToken).toEqual(expect.any(String));
    });


    it('- Shouldn\'t logout user with incorrect refreshToken', async () => {
        const loginUser = await usersTestsUtils.logoutUser('sssssss', STATUS_CODES.UNAUTHORIZED);
        expect(loginUser.body).toEqual({});
    });

    it('-  "/auth/logout": should make the refresh token invalid', async () => {
        const loginUser = await usersTestsUtils.logoutUser(refreshToken, STATUS_CODES.SUCCESS_NO_CONTENT);
        const checkRefreshToken = await usersTestsUtils.logoutUser(refreshToken, STATUS_CODES.UNAUTHORIZED);
        expect(checkRefreshToken.body).toEqual({});
    });
 
});