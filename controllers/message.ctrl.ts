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

async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid } = req.query;
  if (uid === undefined) {
    throw new BadReqError("uid 누락");
  }
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const listResp = await MessageModel.list({ uid: uidToStr });
  return res.status(200).json(listResp);
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId } = req.query;
  if (uid === undefined) {
    throw new BadReqError("uid 누락");
  }
  if (messageId === undefined) {
    throw new BadReqError("messageId 누락");
  }
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const messageIdStr = Array.isArray(messageId) ? messageId[0] : messageId;
  const data = await MessageModel.get({
    uid: uidToStr,
    messageId: messageIdStr,
  });
  return res.status(200).json(data);
}

async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const { uid, reply, messageId } = req.body;
  if (uid === undefined) {
    throw new BadReqError("uid 누락");
  }
  if (messageId === undefined) {
    throw new BadReqError("messageId 누락");
  }
  if (reply === undefined) {
    throw new BadReqError("reply 누락");
  }
  await MessageModel.postReply({ uid, messageId, reply });
  return res.status(201).end();
}

const MessageCtrl = {
  post,
  list,
  postReply,
  get,
};

export default MessageCtrl;
