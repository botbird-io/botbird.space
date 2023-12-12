import { Router } from "express";
import { sendReply, test } from "../controllers/chat";

const chatRouter = Router()
chatRouter.get('/reply',sendReply)
chatRouter.get('/test',test)
export default chatRouter