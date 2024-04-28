import { PostItemType, RequestPostBody } from '../types';
import { blogRepository } from  './blogs-repository';

let postId = 0;

const postItem: PostItemType = {
    id: postId.toString(),
    title: 'string',
    shortDescription: 'string',
    content: 'string',
    blogId: 'string',
    blogName: 'string',
};
  
const postItems: PostItemType[] = [postItem];

export const postRepository = {

    async getAllPosts (): Promise<PostItemType[]> {
        return postItems;
    },
    async getPostById (id: string): Promise<PostItemType | undefined> {
        const post = postItems.find(item => item.id === id);
        return post;
    },
    async createPost (reqObj: RequestPostBody): Promise<string> {
        const id = ++postId;
        const post = await blogRepository.getBlogById(reqObj.blogId);
        if (post) {
            postItems.push({...reqObj, id: id.toString(), blogName: post.name});
        }
        return id.toString();
    },
    async updatePost (id: string ,reqObj: RequestPostBody) {
        let post = postItems.find(item => item.id === id);
        if (post) {
            const realId = postItems.indexOf(post)
            postItems[realId] = {...postItems[realId], ...reqObj};
        }
    },
    async deletePost (id: number) {
        const post = postItems.find(item => item.id === id.toString());
        if (post) {
            const realId = postItems.indexOf(post)
            postItems.splice(realId, 1);
        }
    },
    async deleteAllData () {
        postItems.length = 0;
    }
}