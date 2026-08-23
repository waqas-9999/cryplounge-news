import { GoogleAuth } from "google-auth-library";

const credentials = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON!
);

export const googleAuth = new GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/cloud-platform",
  ],
});