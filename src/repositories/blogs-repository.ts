import { BlogItemType, RequestBlogBody, BlogsQueryParams, BlogItemsResponse } from '../types/blogsTypes';
import { PostsQueryParams, PostItemsResponse } from '../types/postsTypes';
import { blogsCollection, postsCollection } from './db';

const options = {
    projection: {
        _id: 0,
    }
};

const setDirection = (sortDirection: 'asc' | 'desc') => {
    if (sortDirection === 'asc') {
        return 1;
    }
    
    return -1;
};

export const blogRepository = {
    async getAllBlogs (blogsQueryObj: BlogsQueryParams): Promise<BlogItemsResponse> {
        const { searchNameTerm, sortBy = 'createdAt', sortDirection = 'desc', pageNumber = 1, pageSize = 10 } = blogsQueryObj;
        const condition = searchNameTerm ? { name: {$regex : `${searchNameTerm}`, $options: 'i'}} : {};
        const direction = setDirection(sortDirection);
        const totalCount = await blogsCollection.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize);
        const blogs = await (blogsCollection
            .find(condition, options)
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize )
            .toArray());
        
        return {pagesCount: +pagesCount, page: +pageNumber, pageSize: +pageSize, totalCount, items: blogs};
    },
    async getPostsByBlogId (id: string, blogsQueryObj: PostsQueryParams): Promise<PostItemsResponse> {
        const { sortBy = 'createdAt', sortDirection = 'desc', pageNumber = 1, pageSize = 10 } = blogsQueryObj;
        const condition = {blogId: id};
        const direction = setDirection(sortDirection);
        const totalCount = await postsCollection.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize);
        const blogs = await (postsCollection
            .find(condition, options)
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize )
            .toArray());
        
        return {pagesCount: +pagesCount, page: +pageNumber, pageSize: +pageSize, totalCount, items: blogs};
    },
    async getBlogById (id: string): Promise<BlogItemType | null> {
        const blog: BlogItemType | null = await blogsCollection.findOne({id}, options);
        return blog;
    },
    async createBlog (newBlog: BlogItemType): Promise<BlogItemType> {
        const result = await blogsCollection.insertOne({...newBlog})
        return newBlog;
    },
    async updateBlog (id: string ,reqObj: RequestBlogBody): Promise<boolean> {
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