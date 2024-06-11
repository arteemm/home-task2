import request from 'supertest';
import { app } from '../../src/app';
import dotenv from 'dotenv';
import { BlogItemType } from '../../src/types/blogsTypes';
import { MongoClient } from 'mongodb';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { blogsUtils } from '../utils/blogs.utils';
import { STATUS_CODES } from '../../src/constants/statusCodes';

dotenv.config();


const dbName = 'home-task';
const mongoURI = process.env.MONGO_URL || `mongodb://0.0.0.0:27017/${dbName}`;

describe(ROUTERS_PATH_ENUM.BLOGS, () => {
    let newVideo: BlogItemType | null = null    
    const client = new MongoClient(mongoURI)

    beforeAll(async () => {
        await client.connect()
        await request(app).delete(ROUTERS_PATH_ENUM.TESTING + '/all-data').expect(204)
    });

    afterAll(async () => {
       await client.close()
    });

    it('GET products = []', async () => {
        await request(app).get(ROUTERS_PATH_ENUM.BLOGS).expect({ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })
    });

    it('- POST does not create the video with incorrect data (no title, no author)', async function () {
        const incorrectEntity = {name: '', description: '', websiteUrl: ''};
        const errorsObj = {
            'errorsMessages': [
                { message: 'Invalid value', field: 'name' },
                { message: 'Invalid value', field: 'description' },
                { message: 'Invalid value', field: 'websiteUrl' }
        ]};

        await blogsUtils.createBlog(incorrectEntity, STATUS_CODES.BAD_REQUEST, errorsObj);

        const res = await request(app).get(ROUTERS_PATH_ENUM.BLOGS);
        expect(res.body).toEqual({ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })
    });

    // it('- GET product by ID with incorrect id', async () => {
    //     await request(app).get('/videos/helloWorld').expect(400)
    // })
    // it('+ GET product by ID with correct id', async () => {
    //     await request(app)
    //         .get('/videos/' + newVideo!.id)
    //         .expect(200, newVideo)
    // })

    // it('- PUT product by ID with incorrect data', async () => {
    //     await request(app)
    //         .put('/videos/' + 1223)
    //         .send({ title: 'title', author: 'title' })
    //         .expect(CodeResponsesEnum.Not_found_404)

    //     const res = await request(app).get('/videos/')
    //     expect(res.body[0]).toEqual(newVideo)
    // })
  
    // it('+ PUT product by ID with correct data', async () => {
    //     await request(app)
    //         .put('/videos/' + newVideo!.id)
    //         .send({
    //             title: 'hello title',
    //             author: 'hello author',
    //             publicationDate: '2023-01-12T08:12:39.261Z',
    //         })
    //         .expect(CodeResponsesEnum.Not_content_204)

    //     const res = await request(app).get('/videos/')
    //     expect(res.body[0]).toEqual({
    //         ...newVideo,
    //         title: 'hello title',
    //         author: 'hello author',
    //         publicationDate: '2023-01-12T08:12:39.261Z',
    //     })
    //     newVideo = res.body[0]
    // })

    // it('- DELETE product by incorrect ID', async () => {
    //     await request(app)
    //         .delete('/videos/876328')
    //         .expect(CodeResponsesEnum.Not_found_404)

    //     const res = await request(app).get('/videos/')
    //     expect(res.body[0]).toEqual(newVideo)
    // })
    // it('+ DELETE product by correct ID, auth', async () => {
    //     await request(app)
    //         .delete('/videos/' + newVideo!.id)
    //         .set('authorization', 'Basic YWRtaW46cXdlcnR5')
    //         .expect(CodeResponsesEnum.Not_content_204)

    //     const res = await request(app).get('/videos/')
    //     expect(res.body.length).toBe(0)
    // })
});