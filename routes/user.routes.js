import { Router } from "express";
import { getUser } from "../controllers/user.controller.js";
import { getUsers} from "../controllers/user.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

const userRouter = Router();

// Path: /api/v1/users
userRouter.get('/', getUsers );
userRouter.get('/:id', authorize, getUser);

userRouter.put('/:id', (req,res) => res.send({title: 'UPDATE user'}));
userRouter.delete('/:id', (req,res) => res.send({title: 'DELETE user'}));

export default userRouter;