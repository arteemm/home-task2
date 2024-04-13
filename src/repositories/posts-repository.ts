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
        const blog = postItems.find(item => item.id === id);
        return blog;
    },
    createPost : (reqObj: RequestPostBody) => {
        const id = ++postId;
        const blog = blogRepository.getBlogById(reqObj.blogId);
        if (blog) {
            postItems.push({...reqObj, id: id.toString(), blogName: blog.name});
        }
        return id.toString();
    },
    updatePost: (id: string ,reqObj: RequestPostBody) => {
        postItems[+id] = {...postItems[+id], ...reqObj};
    },
    deleteBlog: (id: number) => {
        postItems.splice(id, 1);
    },
    deleteAllData: () => {
        postItems.length = 0;
    }
}