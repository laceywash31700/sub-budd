import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { createSubscription } from "../controllers/subscription.controller.js";

const subscriptionRoutes = Router();

subscriptionRoutes.get('/', (req,res) => res.send({title: 'GET all subscriptions'}));
subscriptionRoutes.get('/:id', (req,res) => res.send({title: 'GET subscription details'}));
subscriptionRoutes.get('/user/:id', (req,res) => res.send({title: 'GET all user subscriptions'}));
subscriptionRoutes.get('/upcoming-renewals', (req,res) => res.send({title: 'GET all subscription renewals'}));

subscriptionRoutes.post('/', authorize , createSubscription);

subscriptionRoutes.put('/:id', (req,res) => res.send({title: 'UPDATE subscription'}));
subscriptionRoutes.put('/:id/cancel', (req,res) => res.send({title: 'CANCEL subscription'}));

subscriptionRoutes.delete('/:id', (req,res) => res.send({title: 'DELETE subscription'}));


export default subscriptionRoutes;