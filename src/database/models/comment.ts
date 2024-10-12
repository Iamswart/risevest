import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

export interface CommentAttributes {
  id: string;
  content: string;
  postId: string;
  userId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment extends Model<CommentAttributes> implements CommentAttributes {
  public id!: string;
  public content!: string;
  public postId!: string;
  public userId!: string;
  public parentId!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static associate(models: {
    User: ModelStatic<Model<any, any>>;
    Post: ModelStatic<Model<any, any>>;
    Comment: ModelStatic<Model<any, any>>;
  }): void {
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Comment.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
    Comment.belongsTo(models.Comment, {
      foreignKey: 'parentId',
      as: 'parent',
    });
    Comment.hasMany(models.Comment, {
      foreignKey: 'parentId',
      as: 'replies',
    });
  }
}

export default (sequelize: Sequelize) => {
  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          fields: ['post_id'],
        },
        {
          fields: ['user_id'],
        },
        {
          fields: ['parent_id'],
        },
        {
          fields: ['created_at'],
        },
      ],
    }
  );
  return Comment;
};