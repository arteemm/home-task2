import { PostItemType,
    RequestPostBody,
    BlogItemType,
    RequestBlogBody,
    BlogsQueryParams,
    BlogItemsResponse,
    PostsQueryParams,
    PostItemsResponse,
} from '../types';
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

export const postRepository = {

    async getAllPosts (postsQueryObj: PostsQueryParams): Promise<PostItemsResponse> {
        const { sortBy, sortDirection, pageNumber, pageSize} = postsQueryObj;
        const direction = setDirection(sortDirection);
        const totalCount = await postsCollection.countDocuments({});
        const pagesCount = Math.ceil(totalCount / pageSize) || 1;
        const posts = await (postsCollection
            .find({}, options)
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize )
            .toArray());
        
        return {pagesCount, page: pageNumber || 1, pageSize: pageSize || 10, totalCount, items: posts};
    },
    async getPostById (id: string): Promise<PostItemType | null> {
        const post: PostItemType | null = await postsCollection.findOne({id}, options);
        return post;
    },
    async createPost (newPost: PostItemType): Promise<PostItemType> {
        const result = await postsCollection.insertOne({...newPost});
        return newPost;
    },
    async updatePost (id: string ,reqObj: RequestPostBody): Promise<boolean> {
        const result = await postsCollection.updateOne({id}, {$set: reqObj})
        return result.matchedCount === 1;
    },
    async deletePost (id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({id});
        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await postsCollection.deleteMany({});
    }
};

export const blogRepository = {
    async getAllBlogs (blogsQueryObj: BlogsQueryParams): Promise<BlogItemsResponse> {
        const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = blogsQueryObj;
        const condition = searchNameTerm ? { name: {$regex : `${searchNameTerm}`, $options: 'i'}} : {};
        const direction = setDirection(sortDirection);
        const totalCount = await blogsCollection.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize) || 1;
        const blogs = await (blogsCollection
            .find(condition, options)
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize )
            .toArray());
        
        return {pagesCount, page: pageNumber || 1, pageSize: pageSize || 10, totalCount, items: blogs};
    },
    async getPostsByBlogId (id: string, blogsQueryObj: PostsQueryParams): Promise<PostItemsResponse> {
        const { sortBy, sortDirection, pageNumber, pageSize} = blogsQueryObj;
        const condition = {blogId: id};
        const direction = setDirection(sortDirection);
        const totalCount = await postsCollection.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize) || 1;
        const blogs = await (postsCollection
            .find(condition, options)
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize )
            .toArray());
        
        return {pagesCount, page: pageNumber || 1, pageSize: pageSize || 10, totalCount, items: blogs};
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