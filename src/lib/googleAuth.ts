import { GoogleAuth } from "google-auth-library";

export const googleAuth = new GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: [
    "https://www.googleapis.com/auth/cloud-platform",
  ],
});