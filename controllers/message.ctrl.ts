import { NextApiResponse } from "next";
import { NextApiRequest } from "next";
import MessageModel from "../models/member/message/message.model";
import BadReqError from "./error/bad_req_error";
async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author } = req.body;
  if (uid === undefined) {
    throw new BadReqError("uid 누락");
  }
  if (message === undefined) {
    throw new BadReqError("message 누락");
  }
  await MessageModel.post({ uid, message, author });
  return res.status(201).end();
}

const MessageCtrl = {
  post,
};

export default MessageCtrl;
