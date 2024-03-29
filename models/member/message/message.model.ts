import { InMessage, InMessageServer } from "./../in_message";
import { firestore } from "firebase-admin";
import CustomServerError from "../../../controllers/error/custom_server_error";
import FirebaseAdmin from "../../firebase_admin";

const MEMBER_COL = "members";
const MSG_COL = "messages";
const SCR_NAME_COL = "screen_names";

const Firestore = FirebaseAdmin.getInstance().Firestore;

async function post({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: { displayName: string; photoURL?: string };
}) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({
        statusCode: 400,
        message: "존재하지 않는 사용자",
      });
    }
    const newMessageRef = memberRef.collection(MSG_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = {
      message,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if (author !== undefined) {
      newMessageBody.author = author;
    }
    await transaction.set(newMessageRef, newMessageBody);
  });
}

async function list({ uid }: { uid: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({
        statusCode: 400,
        message: "존재하지 않는 사용자",
      });
    }
    const messageCol = memberRef
      .collection(MSG_COL)
      .orderBy("createAt", "desc");
    const messageColDoc = await transaction.get(messageCol);
    const data = messageColDoc.docs.map((mv) => {
      const docData = mv.data() as Omit<InMessageServer, "id">;
      const returnData = {
        ...docData,
        id: mv.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt
          ? docData.replyAt.toDate().toISOString()
          : undefined,
      } as InMessage;
      return returnData;
    });
    return data;
  });
  return listData;
}

async function get({ uid, messageId }: { uid: string; messageId: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL)
    .doc(uid)
    .collection(MSG_COL)
    .doc(messageId);

  const data = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({
        statusCode: 400,
        message: "존재하지 않는 사용자",
      });
    }

    if (messageDoc.exists === false) {
      throw new CustomServerError({
        statusCode: 400,
        message: "존재하지 않는 문서",
      });
    }
    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply !== undefined) {
      throw new CustomServerError({
        statusCode: 400,
        message: "이미 댓글을 입력했습니다",
      });
    }
    return {
      ...messageData,
      id: messageId,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt
        ? messageData.replyAt.toDate().toISOString()
        : undefined,
    };
  });
  return data;
}

async function postReply({
  uid,
  messageId,
  reply,
}: {
  uid: string;
  messageId: string;
  reply: string;
}) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL)
    .doc(uid)
    .collection(MSG_COL)
    .doc(messageId);

  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({
        statusCode: 400,
        message: "존재하지 않는 사용자",
      });
    }

    if (messageDoc.exists === false) {
      throw new CustomServerError({
        statusCode: 400,
        message: "존재하지 않는 문서",
      });
    }
    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply !== undefined) {
      throw new CustomServerError({
        statusCode: 400,
        message: "이미 댓글을 입력했습니다",
      });
    }
    await transaction.update(messageRef, {
      reply,
      replyAt: firestore.FieldValue.serverTimestamp(),
    });
  });
}

const MessageModel = {
  post,
  list,
  postReply,
  get,
};

export default MessageModel;
