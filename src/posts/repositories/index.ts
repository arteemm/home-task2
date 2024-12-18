import { PostItemType, RequestPostBody, PostsQueryParams, PostItemsResponse } from '../types';
import { PostModel } from '../schemas';

const setDirection = (sortDirection: 'asc' | 'desc') => {
    if (sortDirection === 'asc') {
        return 1;
    }
    
    return -1;
};

export const postRepository = {

    async getAllPosts (postsQueryObj: PostsQueryParams): Promise<PostItemsResponse> {
        const { sortBy = 'createdAt', sortDirection = 'desc', pageNumber = 1, pageSize = 10} = postsQueryObj;
        const direction = setDirection(sortDirection);
        const totalCount = await PostModel.countDocuments({});
        const pagesCount = Math.ceil(totalCount / pageSize);
        const posts = await (PostModel
            .find({})
            .select('-__v -_id')
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize ));
        
        return {pagesCount: +pagesCount, page: +pageNumber, pageSize: +pageSize, totalCount, items: posts};
    },
    async getPostById (id: string): Promise<PostItemType | null> {
        const post: PostItemType | null = await PostModel.findOne({id}).select('-__v -_id');
        return post;
    },
    async createPost (newPost: PostItemType): Promise<PostItemType> {
        const result = await PostModel.insertMany({...newPost});
        return newPost;
    },
    async updatePost (id: string ,reqObj: RequestPostBody): Promise<boolean> {
        const result = await PostModel.updateOne({id}, {$set: reqObj})
        return result.matchedCount === 1;
    },
    async deletePost (id: string): Promise<boolean> {
        const result = await PostModel.deleteOne({id});
        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await PostModel.deleteMany({});
    }
};