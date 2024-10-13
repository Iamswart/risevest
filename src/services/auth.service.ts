import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { RegisterInterface, LoginInterface } from "../interfaces/auth.interface";
import db from "../database/models/";
import { badRequestError, unknownResourceError } from "../error";

import sqs from "../utils/sqs-consumer";

import logger from "../logger";
import config from "../config";
import emailTemplates from "../emailTemplates/emailTemplate";
import { Op } from "sequelize";
import { PaginationOptions } from "../interfaces/pagination.interface";
import { CreatePostInterface } from "../interfaces/post.interface";

const { User, Post } = db;

export default class AuthService {
  async register(input: RegisterInterface) {
    const { email, name, password } = input;

    const emailExist = await User.findOne({ where: { email } });
    if (emailExist) {
      throw badRequestError(
        "Email address already exist, please login to continue"
      );
    }

    const user = await User.create({
      email,
      name,
      password,
    });

    // Welcome Message
    const welcomeMsgData = {
      notifyBy: ["email"],
      email: user.email,
      subject: "Welcome",
      data: {
        name: `${user.name}`,
      },
      template: emailTemplates.welcome,
    };

    const welcomeSqsOrderData = {
      MessageAttributes: {
        type: {
          DataType: "String",
          StringValue: "email",
        },
      },
      MessageBody: JSON.stringify(welcomeMsgData),
      QueueUrl: process.env.SQS_QUEUE_URL as string,
    };

    const welcomeSqsMessagePromise = sqs
      .sendMessage(welcomeSqsOrderData)
      .promise();
    welcomeSqsMessagePromise
      .then((data) => {
        logger.info(`Welcome Email sent | SUCCESS: ${data.MessageId}`);
      })
      .catch((error) => {
        logger.error(`Error sending Welcome email: ${error}`);
      });

    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      config.auth.secretToken,
      {
        expiresIn: config.auth.tokenExpiration,
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      config.auth.secretRefreshToken,
      {
        expiresIn: config.auth.tokenRefreshExpiration,
      }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInterface) {
    const { email, password } = input;

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw badRequestError("Email Or Password Incorrect");
    }

    if (user.status === "inactive") {
      throw badRequestError(
        "Your account has been disabled please contact support for further details"
      );
    }

    const verifyCredentials = bcrypt.compareSync(password, user.password);

    if (!verifyCredentials) {
      throw badRequestError("Email Or Password Incorrect");
    }

    const accessToken = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, config.auth.secretToken, {
      expiresIn: config.auth.tokenExpiration,
    });

    const refreshToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      config.auth.secretRefreshToken,

      {
        expiresIn: config.auth.tokenRefreshExpiration,
      }
    );

    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },

      accessToken,
      refreshToken,
    };
  }

  async getUsers(options: PaginationOptions) {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const { rows: users, count } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt', 'updatedAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    };
  }

  async getUserById(id: string) {
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw unknownResourceError("User not found");
    }

    return user;
  }

}
