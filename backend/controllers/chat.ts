import { Request, Response } from "express";
import langchainExport from "../langChain/index"
export function prepStream(res:Response) :void {
    if (!res) {
        return;
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Transfer-Encoding', 'chunked')
    res.flushHeaders();
    
    res.on('close', () => {
        res.end();
    });
}

export const sendReply = async (req:Request, res:Response) => {
    prepStream(res)
    console.log('send reply')
    const langchain = await langchainExport
    const {message} = req.query
    const id = req.session.id
    const data = await langchain.reply(message,id,res)
}

export const test = async (req: Request, res: Response): Promise<Object> => {
    return res.send({
        'hello':"world",
    })
}