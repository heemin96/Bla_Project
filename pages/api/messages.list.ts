// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import checkSupportMethod from "../../controllers/error/check_request_err";
import handleError from "../../controllers/error/handle_error";
import MessageCtrl from "../../controllers/message.ctrl";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const supportMethod = ["GET"];
  try {
    checkSupportMethod(supportMethod, method);
    await MessageCtrl.list(req, res);
  } catch (err) {
    console.error(err);
    //에러처리
    handleError(err, res);
  }
}
