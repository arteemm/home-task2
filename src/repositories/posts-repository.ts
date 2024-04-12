import { PostItemType, RequestBody } from '../types';

const postItem: PostItemType = {
    id: 'string',
    title: 'string',
    shortDescription: 'string',
    content: 'string',
    blogId: 'string',
    blogName: 'string',
}
  
const postItems: PostItemType[] = [postItem];

export const postRepository = {
    getAllPosts : () => {
        return postItems;
    },
    // getBlogById : (id: string) => {
    //     const blog = blogItems.find(item => item.id === id);
    //     return blog;
    // },
    // createBlog : (reqObj: RequestBody) => {
    //     const id = blogItems.length;
    //     blogItems.push({...reqObj, id: id.toString()});
    //     return id.toString();
    // },
    // updatePost: (id: string ,reqObj: RequestBody) => {
    //     blogItems[+id] = {...blogItems[+id], ...reqObj};
    // },
    // deleteBlog: (id: number) => {
    //     blogItems.splice(id, 1);
    // },
}