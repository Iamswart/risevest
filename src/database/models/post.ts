import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

export interface PostAttributes {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Post extends Model<PostAttributes> implements PostAttributes {
  public id!: string;
  public title!: string;
  public content!: string;
  public userId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static associate(models: {
    User: ModelStatic<Model<any, any>>;
    Comment: ModelStatic<Model<any, any>>;
  }): void {
    Post.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author',
    });
    Post.hasMany(models.Comment, {
      foreignKey: 'postId',
      as: 'comments',
    });
  }
}

export default (sequelize: Sequelize) => {
  Post.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['created_at'],
        },
      ],
    }
  );
  return Post;
};