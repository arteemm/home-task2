import { postRepository } from '../repositories/db-repository';
import { PostItemType, RequestPostBody, PostItemsResponse,PostsQueryParams } from '../types';
import { blogRepository } from '../repositories/db-repository';

export const postsService = {

    async getAllPosts (postsQueryObj: PostsQueryParams): Promise<PostItemsResponse> {
        return  await postRepository.getAllPosts(postsQueryObj);
    },
    async getPostById (id: string): Promise<PostItemType | null> {
        return await postRepository.getPostById(id);
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

        return await postRepository.createPost(newPost);
    },
    async updatePost (id: string ,reqObj: RequestPostBody): Promise<boolean> {
        return await postRepository.updatePost(id, reqObj);
    },
    async deletePost (id: string): Promise<boolean> {
        return await postRepository.deletePost(id);
    },
    async deleteAllData () {
        return await postRepository.deleteAllData();
    }
};