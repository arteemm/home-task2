import { BlogItemType, RequestBody } from '../types';

const blogItem: BlogItemType = {
    id: '0',
    name: "string",
    description: "string",
    websiteUrl: 'false',
}
  
const blogItems: BlogItemType[] = [blogItem];

export const blogRepository = {
    getAllBlogs : () => {
        return blogItems;
    },
    getBlogById : (id: string) => {
        const blog = blogItems.find(item => item.id === id);
        return blog;
    },
    createBlog : (reqObj: RequestBody) => {
        const id = blogItems.length;
        blogItems.push({...reqObj, id: id.toString()});
        return id.toString();
    },
    updatePost: (id: string ,reqObj: RequestBody) => {
        blogItems[+id] = {...blogItems[+id], ...reqObj};
    },
    deleteBlog: (id: number) => {
        blogItems.splice(id, 1);
    },
}