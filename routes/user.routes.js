import { Router } from "express";

const userRouter = Router();

// GET /users ->
userRouter.get('/', (req,res) => res.send({title: 'GET all users'}));

userRouter.get('/:id', (req,res) => res.send({title: 'GET user detail'}));

userRouter.post('/', (req,res) => res.send({title: 'CREATE new users'}));

userRouter.put('/:id', (req,res) => res.send({title: 'UPDATE user'}));

userRouter.delete('/:id', (req,res) => res.send({title: 'DELETE user'}));

export default userRouter;