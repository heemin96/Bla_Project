import { getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

const FirebaseCredentials = {
  apiKey: publicRuntimeConfig.publicApiKey,
  authDomain: publicRuntimeConfig.authDomain,
  projectId: publicRuntimeConfig.projectId,
};

export default class FirebaseClient {
  private static instance: FirebaseClient;

  private auth: Auth;

  //객체 생성하고 초기화
  public constructor() {
    const apps = getApps();
    if (apps.length === 0) {
      console.info("firebase client init start");
      initializeApp(FirebaseCredentials);
    }
    this.auth = getAuth();
    console.info("firebase auth");
  }

  public static getInstance(): FirebaseClient {
    if (
      FirebaseClient.instance === undefined ||
      FirebaseClient.instance === null
    ) {
      FirebaseClient.instance = new FirebaseClient();
    }
    return FirebaseClient.instance;
  }

  public get Auth(): Auth {
    return this.auth;
  }
}
