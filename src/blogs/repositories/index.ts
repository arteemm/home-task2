import { BlogItemType, RequestBlogBody, BlogsQueryParams, BlogItemsResponse } from '../types';
import { PostsQueryParams, PostItemsResponse } from '../../posts/types';
import { PostModel } from '../../posts/schemas';
import { BlogModel } from '../schemas';

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
        const totalCount = await BlogModel.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize);
        const blogs = await (BlogModel
            .find(condition, options)
            .select('-__v -_id')
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize ));
        
        return {pagesCount: +pagesCount, page: +pageNumber, pageSize: +pageSize, totalCount, items: blogs};
    },
    async getPostsByBlogId (id: string, blogsQueryObj: PostsQueryParams): Promise<PostItemsResponse> {
        const { sortBy = 'createdAt', sortDirection = 'desc', pageNumber = 1, pageSize = 10 } = blogsQueryObj;
        const condition = {blogId: id};
        const direction = setDirection(sortDirection);
        const totalCount = await PostModel.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize);
        const blogs = await (PostModel
            .find(condition, options)
            .select('-__v -_id')
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize ));
        
        return {pagesCount: +pagesCount, page: +pageNumber, pageSize: +pageSize, totalCount, items: blogs};
    },
    async getBlogById (id: string): Promise<BlogItemType | null> {
        const blog: BlogItemType | null = await BlogModel.findOne({id}).select('-__v -_id');
        return blog;
    },
    async createBlog (newBlog: BlogItemType): Promise<BlogItemType> {
        const result = await BlogModel.insertMany({...newBlog})
        return newBlog;
    },
    async updateBlog (id: string ,reqObj: RequestBlogBody): Promise<boolean> {
        const result = await BlogModel.updateOne({id}, {$set: reqObj})
        return result.matchedCount === 1;
    },
    async deleteBlog (id: string): Promise<boolean> {
        const result = await BlogModel.deleteOne({id});
        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await BlogModel.deleteMany({});
    }
};