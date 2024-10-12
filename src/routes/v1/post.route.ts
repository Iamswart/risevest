import { celebrate } from "celebrate";
import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import PostController from "../../controllers/post.controller";
import { apiKeyAuthMiddleware, protect } from "../../middlewares/authenticate";
import { createCommentSchema, getPostCommentsSchema } from "../../utils/validation-schema";
import { JWTUser } from "../../utils/jwt-user";
import { PaginationOptions } from "../../interfaces/pagination.interface";

const postRoutes: Router = Router();
const postController = new PostController();

postRoutes.post(
  "/:postId/comments",
  apiKeyAuthMiddleware,
  protect,
  celebrate({ body: createCommentSchema }),
  asyncHandler(async (request: Request, response: Response) => {
    const { postId } = request.params;
    const user = response.locals.user as JWTUser;
    const userId = user.id
    const commentData = request.body;
    const data = await postController.createComment(userId, postId, commentData);

    response.status(201).json(data).end();
  })
);

postRoutes.get(
  "/:postId/comments",
  apiKeyAuthMiddleware,
  protect,
  celebrate({ query: getPostCommentsSchema }),
  asyncHandler(async (request: Request, response: Response) => {
    const { postId } = request.params;
    const options = request.query as PaginationOptions;
    const data = await postController.getPostComments(postId, options);

    response.status(200).json(data).end();
  })
);


postRoutes.get(
  "/top-users",
  apiKeyAuthMiddleware,
  protect,
  asyncHandler(async (request: Request, response: Response) => {
    const topUsers = await postController.getTopUsersWithLatestComment();
    response.status(200).json(topUsers).end();
  })
);


export { postRoutes };