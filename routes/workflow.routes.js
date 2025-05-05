import { Router } from "express";
import { sendReminders } from "../controllers/workflow.controller.js";

const workflowRouter = Router();

// Path: /api/v1/workflows
workflowRouter.post('/subscription/reminder', sendReminders);

export default workflowRouter;