import { Joi } from "celebrate";

export const registerAccountSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
    .message(
      '"password" must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
});

export const getUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
});

export const getUserByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const loginSchema = Joi.object().keys({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
});

export const createPostSchema = Joi.object({
  title: Joi.string().trim().required(),
  content: Joi.string().trim().required(),
});

export const getUserPostsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
});

export const getPostByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createCommentSchema = Joi.object({
  content: Joi.string().trim().required(),
  parentId: Joi.string().uuid().allow(null).optional(),
});

export const getPostCommentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});