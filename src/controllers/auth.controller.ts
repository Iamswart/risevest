import { RegisterInterface, LoginInterface } from "../interfaces/auth.interface";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { CreatePostInterface } from "../interfaces/post.interface";
import logger from "../logger";
import AuthService from "../services/auth.service";
import PostService from "../services/post.service";

export default class AuthController {
  private authService = new AuthService();
  private postService = new PostService();
  
  async registerUser(input: RegisterInterface) {
    try {
      return await this.authService.register(input);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async loginUser(input: LoginInterface) {
    try {
      return await this.authService.login(input);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async getUsers(options: PaginationOptions) {
    try {
      return await this.authService.getUsers(options);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      return await this.authService.getUserById(id);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async createPost(userId: string, input: CreatePostInterface) {
    try {
      return await this.postService.createPost(userId, input);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async getUserPosts(userId: string, options: PaginationOptions) {
    try {
      return await this.postService.getUserPosts(userId, options);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}