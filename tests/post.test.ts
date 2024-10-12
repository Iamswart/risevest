import PostService from '../src/services/post.service';
import { CreatePostInterface } from '../src/interfaces/post.interface';
import { CreateCommentInterface } from '../src/interfaces/comment.interface';
import { PaginationOptions } from '../src/interfaces/pagination.interface';
import { badRequestError, unknownResourceError } from '../src/error';
import { Op } from 'sequelize';

// Mock the database models
jest.mock('../src/database/models', () => ({
  User: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  Post: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Comment: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

const mockUser = {
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
};

const mockPost = {
  id: '456',
  title: 'Test Post',
  content: 'This is a test post',
  userId: '123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockComment = {
  id: '789',
  content: 'Test comment',
  postId: '456',
  userId: '123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PostService', () => {
  let postService: PostService;
  const db = require('../src/database/models');

  beforeEach(() => {
    postService = new PostService();
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      db.User.findByPk.mockResolvedValue(mockUser);
      db.Post.create.mockResolvedValue(mockPost);

      const input: CreatePostInterface = {
        title: 'Test Post',
        content: 'This is a test post',
      };

      const result = await postService.createPost('123', input);

      expect(db.User.findByPk).toHaveBeenCalledWith('123');
      expect(db.Post.create).toHaveBeenCalledWith({
        title: 'Test Post',
        content: 'This is a test post',
        userId: '123',
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw an error if user is not found', async () => {
      db.User.findByPk.mockResolvedValue(null);

      const input: CreatePostInterface = {
        title: 'Test Post',
        content: 'This is a test post',
      };

      await expect(postService.createPost('123', input)).rejects.toThrow(unknownResourceError('User not found'));
    });

    it('should throw an error if title or content is missing', async () => {
      db.User.findByPk.mockResolvedValue(mockUser);

      const input: CreatePostInterface = {
        title: '',
        content: '',
      };

      await expect(postService.createPost('123', input)).rejects.toThrow(badRequestError('Title and content are required'));
    });
  });

  describe('getUserPosts', () => {
    it('should get user posts with pagination', async () => {
      db.User.findByPk.mockResolvedValue(mockUser);
      db.Post.findAndCountAll.mockResolvedValue({
        rows: [mockPost],
        count: 1,
      });

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const result = await postService.getUserPosts('123', options);

      expect(db.User.findByPk).toHaveBeenCalledWith('123');
      expect(db.Post.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: '123' },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual({
        posts: [mockPost],
        totalPages: 1,
        currentPage: 1,
        totalPosts: 1,
      });
    });

    it('should return empty result if user has no posts', async () => {
      db.User.findByPk.mockResolvedValue(mockUser);
      db.Post.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const result = await postService.getUserPosts('123', options);

      expect(result).toEqual({
        posts: [],
        totalPages: 0,
        currentPage: 1,
        totalPosts: 0,
        message: 'User has no posts',
      });
    });

    it('should apply search filter if provided', async () => {
      db.User.findByPk.mockResolvedValue(mockUser);
      db.Post.findAndCountAll.mockResolvedValue({
        rows: [mockPost],
        count: 1,
      });

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
        search: 'test',
      };

      await postService.getUserPosts('123', options);

      expect(db.Post.findAndCountAll).toHaveBeenCalledWith({
        where: {
          userId: '123',
          [Op.or]: [
            { title: { [Op.iLike]: '%test%' } },
            { content: { [Op.iLike]: '%test%' } },
          ],
        },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
      });
    });
  });

  describe('getPostById', () => {
    it('should get a post by id', async () => {
      db.Post.findByPk.mockResolvedValue({
        ...mockPost,
        author: mockUser,
      });

      const result = await postService.getPostById('456');

      expect(db.Post.findByPk).toHaveBeenCalledWith('456', {
        attributes: ['id', 'title', 'content', 'userId', 'createdAt', 'updatedAt'],
        include: [
          {
            model: db.User,
            as: 'author',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });
      expect(result).toEqual({
        ...mockPost,
        author: mockUser,
      });
    });

    it('should throw an error if post is not found', async () => {
      db.Post.findByPk.mockResolvedValue(null);

      await expect(postService.getPostById('456')).rejects.toThrow(unknownResourceError('Post not found'));
    });
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      db.User.findByPk.mockResolvedValue(mockUser);
      db.Post.findByPk.mockResolvedValue(mockPost);
      db.Comment.create.mockResolvedValue(mockComment);

      const input: CreateCommentInterface = {
        content: 'Test comment',
      };

      const result = await postService.createComment('123', '456', input);

      expect(db.User.findByPk).toHaveBeenCalledWith('123');
      expect(db.Post.findByPk).toHaveBeenCalledWith('456');
      expect(db.Comment.create).toHaveBeenCalledWith({
        content: 'Test comment',
        postId: '456',
        userId: '123',
        parentId: undefined,
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw an error if user is not found', async () => {
      db.User.findByPk.mockResolvedValue(null);

      const input: CreateCommentInterface = {
        content: 'Test comment',
      };

      await expect(postService.createComment('123', '456', input)).rejects.toThrow(unknownResourceError('User not found'));
    });

    it('should throw an error if post is not found', async () => {
      db.User.findByPk.mockResolvedValue(mockUser);
      db.Post.findByPk.mockResolvedValue(null);

      const input: CreateCommentInterface = {
        content: 'Test comment',
      };

      await expect(postService.createComment('123', '456', input)).rejects.toThrow(unknownResourceError('Post not found'));
    });

    it('should throw an error if content is missing', async () => {
      db.User.findByPk.mockResolvedValue(mockUser);
      db.Post.findByPk.mockResolvedValue(mockPost);

      const input: CreateCommentInterface = {
        content: '',
      };

      await expect(postService.createComment('123', '456', input)).rejects.toThrow(badRequestError('Comment content is required'));
    });
  });

  describe('getPostComments', () => {
    it('should get post comments with pagination', async () => {
      db.Post.findByPk.mockResolvedValue(mockPost);
      db.Comment.findAndCountAll.mockResolvedValue({
        rows: [{ ...mockComment, user: mockUser }],
        count: 1,
      });

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const result = await postService.getPostComments('456', options);

      expect(db.Post.findByPk).toHaveBeenCalledWith('456');
      expect(db.Comment.findAndCountAll).toHaveBeenCalledWith({
        where: { postId: '456' },
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'content', 'userId', 'parentId', 'createdAt', 'updatedAt'],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        ],
      });
      expect(result).toEqual({
        comments: [{ ...mockComment, user: mockUser }],
        totalPages: 1,
        currentPage: 1,
        totalComments: 1,
      });
    });

    it('should return empty result if post has no comments', async () => {
      db.Post.findByPk.mockResolvedValue(mockPost);
      db.Comment.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const result = await postService.getPostComments('456', options);

      expect(result).toEqual({
        comments: [],
        totalPages: 0,
        currentPage: 1,
        totalComments: 0,
        message: 'Post has no comments',
      });
    });

    it('should throw an error if post is not found', async () => {
      db.Post.findByPk.mockResolvedValue(null);

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      await expect(postService.getPostComments('456', options)).rejects.toThrow(unknownResourceError('Post not found'));
    });
  });

  describe('getTopUsersWithLatestComment', () => {
    it('should get top users with latest comments', async () => {
      const mockTopUsers = [
        {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          get: jest.fn().mockReturnValue('10'),
          latestComment: 'Latest comment:::2023-05-01T12:00:00Z',
        },
      ];

      db.User.findAll.mockResolvedValue(mockTopUsers);

      const result = await postService.getTopUsersWithLatestComment();

      expect(db.User.findAll).toHaveBeenCalledWith({
        attributes: expect.arrayContaining([
          'id',
          'name',
          'email',
          [expect.any(Function), 'postCount'],
          [expect.any(Object), 'latestComment'],
        ]),
        include: [expect.any(Object)],
        group: ['"User".id'],
        order: [[expect.any(Function), 'DESC']],
        limit: 3,
        subQuery: false,
      });

      expect(result).toEqual([
        {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          postCount: 10,
          latestCommentContent: 'Latest comment',
          latestCommentDate: new Date('2023-05-01T12:00:00Z'),
        },
      ]);
    });

    it('should handle users without comments', async () => {
      const mockTopUsers = [
        {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          get: jest.fn().mockReturnValue('5'),
          latestComment: null,
        },
      ];

      db.User.findAll.mockResolvedValue(mockTopUsers);

      const result = await postService.getTopUsersWithLatestComment();

      expect(result).toEqual([
        {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          postCount: 5,
          latestCommentContent: null,
          latestCommentDate: null,
        },
      ]);
    });
  });
});