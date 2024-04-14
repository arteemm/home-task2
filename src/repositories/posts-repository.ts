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

    getAllPosts : () => {
        return postItems;
    },
    getPostById : (id: string) => {
        const post = postItems.find(item => item.id === id);
        return post;
    },
    createPost : (reqObj: RequestPostBody) => {
        const id = ++postId;
        const post = blogRepository.getBlogById(reqObj.blogId);
        if (post) {
            postItems.push({...reqObj, id: id.toString(), blogName: post.name});
        }
        return id.toString();
    },
    updatePost: (id: string ,reqObj: RequestPostBody) => {
        let post = postItems.find(item => item.id === id);
        if (post) {
            const realId = postItems.indexOf(post)
            postItems[realId] = {...postItems[realId], ...reqObj};
        }
    },
    deletePost: (id: number) => {
        const post = postItems.find(item => item.id === id.toString());
        if (post) {
            const realId = postItems.indexOf(post)
            postItems.splice(realId, 1);
        }
    },
    deleteAllData: () => {
        postItems.length = 0;
    }
}