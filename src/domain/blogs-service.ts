import { blogRepository } from '../repositories/db-repository';
import { BlogItemType, RequestBlogBody, BlogsQueryParams, BlogItemsResponse, PostsQueryParams, PostItemsResponse } from '../types';

export const blogsService = {

    async getAllBlogs (blogsQueryObj: BlogsQueryParams): Promise<BlogItemsResponse> {
        return await blogRepository.getAllBlogs(blogsQueryObj);
    },
    async getBlogById (id: string): Promise<BlogItemType | null> {
        return await blogRepository.getBlogById(id);
    },
    async getPostsByBlogId (id: string, blogsQueryObj: PostsQueryParams): Promise<PostItemsResponse> {
        return await blogRepository.getPostsByBlogId(id, blogsQueryObj);
    },
    async createBlog (reqObj: RequestBlogBody): Promise<RequestBlogBody> {
        const date = new Date();
        const newBlog = {
            ...reqObj,
            createdAt: date.toJSON(),
            isMembership: false,
            id: `${+(date)}`,
        };
        return await blogRepository.createBlog(newBlog);
    },
    async updateBlog (id: string ,reqObj: RequestBlogBody): Promise<boolean> {
        return await blogRepository.updateBlog(id, reqObj);
    },
    async deleteBlog (id: string): Promise<boolean> {
        return await blogRepository.deleteBlog(id);
    },
    async deleteAllData () {
        return await blogRepository.deleteAllData();
    }
};