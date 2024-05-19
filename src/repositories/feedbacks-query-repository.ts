import { PostsQueryParams, CommentsItemsResponse, CommentResponseType } from '../types';
import { commentsCollection } from './db';

const options = {
    projection: {
        _id: 0,
        id: '$_id',
        content: 1,
        commentatorInfo: 1,
        createdAt: 1,
    }
};

const setDirection = (sortDirection: 'asc' | 'desc') => {
    if (sortDirection === 'asc') {
        return 1;
    }
    
    return -1;
};

export const feedbacksQueryRepository = {

    async getAllComments (postsQueryObj: PostsQueryParams, postId: string): Promise<CommentsItemsResponse> {
        const {
            sortBy = 'createdAt',
            sortDirection = 'desc',
            pageNumber = 1,
            pageSize = 10,
        } = postsQueryObj;
        const condition = {postId: postId};
        const direction = setDirection(sortDirection);
        const totalCount = await commentsCollection.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize);
        const comments = await (commentsCollection
            .find(condition, options)
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize )
            .toArray()) as unknown as CommentResponseType[];
        
        return { pagesCount: +pagesCount, page: +pageNumber, pageSize: +pageSize, totalCount, items: comments };
    },
};