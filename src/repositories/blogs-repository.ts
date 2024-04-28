import { BlogItemType, RequestBody } from '../types';

let blogId = 0;

const blogItem: BlogItemType = {
    id: blogId.toString(),
    name: "lalalala",
    description: "string",
    websiteUrl: 'false',
}
  
const blogItems: BlogItemType[] = [blogItem];

export const blogRepository = {
    async getAllBlogs (): Promise<BlogItemType[]> {
        return blogItems;
    },
    async getBlogById (id: string): Promise<BlogItemType | undefined> {
        const blog = blogItems.find(item => item.id === id);
        return blog;
    },
    async createBlog (reqObj: RequestBody): Promise<string> {
        const id = ++blogId;
        blogItems.push({...reqObj, id: id.toString()});
        return id.toString();
    },
    async updatePost (id: string ,reqObj: RequestBody) {
        let blog = blogItems.find(item => item.id === id);
        if (blog) {
            const realId = blogItems.indexOf(blog);
            blogItems[realId] = Object.assign(blogItems[realId], reqObj);
        }
    },
    async deleteBlog (id: number) {
        const blog = blogItems.find(item => item.id === id.toString());
        if (blog) {
            const realId = blogItems.indexOf(blog)
            blogItems.splice(realId, 1);
        }
    },
    async deleteAllData () {
        blogItems.length = 0;
    }
}