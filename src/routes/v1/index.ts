import { Router } from "express";
import { authRoutes } from "./auth.route";
import { postRoutes } from "./post.route";


const v1Routes: Router = Router();

v1Routes.use("/users", authRoutes);
v1Routes.use("/posts", postRoutes);


export { v1Routes };
