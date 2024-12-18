import { CommentsItemsResponse, CommentResponseType } from '../types';
import { PostsQueryParams } from '../../posts/types';
import { CommentModel } from '../schemas';

const options = {
    projection: {
        _id: 0,
        id: '$_id',
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
        const totalCount = await CommentModel.countDocuments(condition);
        const pagesCount = Math.ceil(totalCount / pageSize);
        const comments = await (CommentModel
            .find(condition)
            .select('-__v')
            .sort({[sortBy]: direction})
            .skip( pageNumber > 0 ? ( ( pageNumber - 1 ) * pageSize ) : 0 )
            .limit( +pageSize )
            ) as unknown as CommentResponseType[];
        
        return { pagesCount: +pagesCount, page: +pageNumber, pageSize: +pageSize, totalCount, items: comments };
    },
};