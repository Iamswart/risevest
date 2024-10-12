import { CreatePostInterface } from "../interfaces/post.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import db from "../database/models/";
import { badRequestError, unknownResourceError } from "../error";
import { Op, literal, fn, col } from "sequelize";
import { CreateCommentInterface } from "../interfaces/comment.interface";

const { Post, User, Comment } = db;

export default class PostService {
  async createPost(userId: string, input: CreatePostInterface) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw unknownResourceError("User not found");
    }

    const { title, content } = input;

    if (!title || !content) {
      throw badRequestError("Title and content are required");
    }

    const post = await Post.create({
      title,
      content,
      userId,
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      userId: post.userId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async getUserPosts(userId: string, options: PaginationOptions) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw unknownResourceError("User not found");
    }

    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    let whereClause: any = { userId };
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const { rows: posts, count } = await Post.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "content", "createdAt", "updatedAt"],
    });

    if (count === 0) {
      return {
        posts: [],
        totalPages: 0,
        currentPage: page,
        totalPosts: 0,
        message: "User has no posts",
      };
    }

    return {
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count,
    };
  }

  async getPostById(postId: string) {
    const post = await Post.findByPk(postId, {
      attributes: [
        "id",
        "title",
        "content",
        "userId",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!post) {
      throw unknownResourceError("Post not found");
    }

    return post;
  }

  async createComment(
    userId: string,
    postId: string,
    input: CreateCommentInterface
  ) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw unknownResourceError("User not found");
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      throw unknownResourceError("Post not found");
    }

    const { content, parentId } = input;

    if (!content) {
      throw badRequestError("Comment content is required");
    }

    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        throw unknownResourceError("Parent comment not found");
      }
    }

    const comment = await Comment.create({
      content,
      postId,
      userId,
      parentId,
    });

    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      userId: comment.userId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  async getPostComments(postId: string, options: PaginationOptions) {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw unknownResourceError("Post not found");
    }

    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { rows: comments, count } = await Comment.findAndCountAll({
      where: { postId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "content",
        "userId",
        "parentId",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
    });

    if (count === 0) {
      return {
        comments: [],
        totalPages: 0,
        currentPage: page,
        totalComments: 0,
        message: "Post has no comments",
      };
    }

    return {
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalComments: count,
    };
  }


  async getTopUsersWithLatestComment() {
    const topUsers = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        [fn('COUNT', col('posts.id')), 'postCount'],
        [literal(`(
          SELECT CONCAT_WS(':::', content, created_at)
          FROM comments
          WHERE comments.user_id = "User".id
          ORDER BY comments.created_at DESC
          LIMIT 1
        )`), 'latestComment'],
      ],
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: [],
          required: false,
        },
      ],
      group: ['"User".id'],
      order: [[fn('COUNT', col('posts.id')), 'DESC']],
      limit: 3,
      subQuery: false,
    });
  
    return topUsers.map((user: any) => {
      const [content, date] = (user.get('latestComment') || ':::').split(':::');
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        postCount: parseInt(user.get('postCount'), 10) || 0,
        latestCommentContent: content || null,
        latestCommentDate: date ? new Date(date) : null,
      };
    });
  }
}
