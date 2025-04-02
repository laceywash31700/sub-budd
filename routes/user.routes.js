import { Router } from "express";
import { getUser } from "../controllers/user.controller.js";
import { getUsers} from "../controllers/user.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

const userRouter = Router();

// GET /users ->
userRouter.get('/', getUsers );

userRouter.get('/:id', authorize, getUser);

userRouter.post('/', (req,res) => res.send({title: 'CREATE new users'}));

userRouter.put('/:id', (req,res) => res.send({title: 'UPDATE user'}));

userRouter.delete('/:id', (req,res) => res.send({title: 'DELETE user'}));

export default userRouter;