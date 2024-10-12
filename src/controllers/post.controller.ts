import { CreatePostInterface } from "../interfaces/post.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import logger from "../logger";
import PostService from "../services/post.service";
import { CreateCommentInterface } from "../interfaces/comment.interface";

export default class PostController {
  private postService = new PostService();

  async getPostById(postId: string) {
    try {
      return await this.postService.getPostById(postId);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async createComment(
    userId: string,
    postId: string,
    input: CreateCommentInterface
  ) {
    try {
      return await this.postService.createComment(userId, postId, input);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async getPostComments(postId: string, options: PaginationOptions) {
    try {
      return await this.postService.getPostComments(postId, options);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async getTopUsersWithLatestComment() {
    try {
      const topUsers = await this.postService.getTopUsersWithLatestComment();
      return topUsers;
    } catch (error) {
      logger.error("Error in getTopUsersWithLatestComment:", error);
      logger.error("Error stack:", error.stack);
      throw error;
    }
  }
}
