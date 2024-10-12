import { celebrate } from "celebrate";
import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import AuthController from "../../controllers/auth.controller";
import {
  apiKeyAuthMiddleware,
  protect,
} from "../../middlewares/authenticate";

import {
  loginSchema,
  registerAccountSchema,
  getUsersSchema,
  getUserByIdSchema,
  createPostSchema,
  getUserPostsSchema,
} from "../../utils/validation-schema";

const authRoutes: Router = Router();
const authController = new AuthController();

authRoutes.post(
  "/",
  apiKeyAuthMiddleware,
  celebrate({ body: registerAccountSchema }),
  asyncHandler(async (request: Request, response: Response) => {
    const userData = request.body;
    const data = await authController.registerUser(userData);

    response.status(201).json(data).end();
  })
);

authRoutes.post(
  "/login",
  apiKeyAuthMiddleware,
  celebrate({ body: loginSchema }),
  asyncHandler(async (request: Request, response: Response) => {
    const loginData = request.body;
    const data = await authController.loginUser(loginData);

    response.status(200).json(data).end();
  })
);

authRoutes.get(
  "/",
  apiKeyAuthMiddleware,
  protect,
  celebrate({ query: getUsersSchema }),
  asyncHandler(async (request: Request, response: Response) => {
    const options = request.query;
    const data = await authController.getUsers(options);

    response.status(200).json(data).end();
  })
);

authRoutes.get(
  "/:id",
  apiKeyAuthMiddleware,
  protect,
  celebrate({ params: getUserByIdSchema }),
  asyncHandler(async (request: Request, response: Response) => {
    const { id } = request.params;
    const data = await authController.getUserById(id);

    response.status(200).json(data).end();
  })
);

authRoutes.post(
  "/:userId/posts",
  apiKeyAuthMiddleware,
  protect,
  celebrate({ body: createPostSchema }),
  asyncHandler(async (request: Request, response: Response) => {
    const { userId } = request.params;
    const postData = request.body;
    const data = await authController.createPost(userId, postData);

    response.status(201).json(data).end();
  })
);

authRoutes.get(
  "/:userId/posts",
  apiKeyAuthMiddleware,
  protect,
  celebrate({ query: getUserPostsSchema }),
  asyncHandler(async (request: Request, response: Response) => {
    const { userId } = request.params;
    const query = request.query;
    const data = await authController.getUserPosts(userId, query);

    response.status(200).json(data).end();
  })
);


export { authRoutes };
