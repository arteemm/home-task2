import { PostItemType, RequestPostBody, BlogItemType, RequestBody } from '../types';
import { blogsCollection, postsCollection } from './db';

const options = {
    projection: {
        _id: 0,
    }
}

export const postRepository = {

    async getAllPosts (): Promise<PostItemType[]> {
        return postsCollection.find({}, options).toArray();
    },
    async getPostById (id: string): Promise<PostItemType | null> {
        const post: PostItemType | null = await postsCollection.findOne({id}, options);
        if (post) {
            return post;
        }
        return null;
    },
    async createPost (reqObj: RequestPostBody): Promise<RequestPostBody> {
        const date = new Date();
        const blog = await blogRepository.getBlogById(reqObj.blogId);
        const newPost = {
            ...reqObj,
            createdAt: date.toJSON(),
            blogName: blog?.name || '',
            id: `${+(date)}`,
        };
        const result = await postsCollection.insertOne({...newPost});
        return newPost;
    },
    async updatePost (id: string ,reqObj: RequestPostBody): Promise<boolean> {
        const result = await postsCollection.updateOne({id}, {$set: reqObj})
        return result.matchedCount === 1;
    },
    async deletePost (id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({id});
        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await postsCollection.deleteMany({});
    }
};

export const blogRepository = {
    async getAllBlogs (): Promise<BlogItemType[]> {
        return blogsCollection.find({}, options).toArray();
    },
    async getBlogById (id: string): Promise<BlogItemType | null> {
        const blog: BlogItemType | null = await blogsCollection.findOne({id}, options);
        if (blog) {
            return blog;
        }
        return null;
    },
    async createBlog (reqObj: RequestBody): Promise<RequestBody> {
        const date = new Date();
        const newBlog = {
            ...reqObj,
            createdAt: date.toJSON(),
            isMembership: false,
            id: `${+(date)}`,
        };
        const result = await blogsCollection.insertOne({...newBlog})
        return newBlog;
    },
    async updatePost (id: string ,reqObj: RequestBody): Promise<boolean> {
        const result = await blogsCollection.updateOne({id}, {$set: reqObj})
        return result.matchedCount === 1;
    },
    async deleteBlog (id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({id});
        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await blogsCollection.deleteMany({});
    }
};