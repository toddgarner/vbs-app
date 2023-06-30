import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { toFile, toString } from "qrcode";
// import { log } from "~/models/log.server";
import { createHash } from "crypto";
import { readFile, unlink } from "fs/promises";

export const awsKey = process.env.AWS_KEY;
export const awsSecret = process.env.AWS_SECRET;
export const awsBucketName = process.env.AWS_BUCKET_NAME;

export const awsConfig = {
  region: "us-east-1",
  credentials: {
    accessKeyId: awsKey,
    secretAccessKey: awsSecret,
  },
};

const s3Client = new S3Client(awsConfig);
const snsClient = new SNSClient(awsConfig);
const sesClient = new SESClient(awsConfig);

export async function createQRCode(childId: string): Promise<string> {
  const id = childId;
  let fileName = `/tmp/${id}.png`;

  try {
    await toFile(fileName, id, {
      color: {
        dark: "#31aac1",
        light: "#fff",
      },
    });
  } catch (err) {
    // log.error(err);
    throw err;
  }

  try {
    const data = await readFile(fileName);
    const keyName = createHash("md5").update(id).digest("hex") + ".png";
    const params = {
      Bucket: awsBucketName,
      Body: data,
      Key: keyName,
      ACL: "public-read",
    };
    await s3Client.send(new PutObjectCommand(params));
    return `https://s3.us-east-1.amazonaws.com/${awsBucketName}/${keyName}`;
  } catch (err) {
    // log.error(err);
    throw err;
  } finally {
    try {
      await unlink(fileName);
    } catch (err) {}
  }
}

export async function createQRCodeSVGForAppToken(
  token: string,
  endpoint: string
): Promise<string> {
  let data = "";
  try {
    data = await toString(
      `reg:${encodeURIComponent(endpoint)}:${encodeURIComponent(token)}`,
      {
        type: "svg",
        color: {
          dark: "#31aac1",
          light: "#fff",
        },
      }
    );
  } catch (err) {
    // log.error(err);
    throw err;
  }
  return data;
}

// !!! This will be for SMS when available !!!
const vbsProvider = process.env.VBS_PROVIDER;

export async function textQrCode(
  phoneNumber: string,
  registrant: string
): Promise<void> {
  phoneNumber = "+1" + phoneNumber.replace(/\D/g, "");
  const message = `You have been registered for VBS at ${vbsProvider}. The link to ${registrant}'s QR code is here:`;
  try {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
    };
    await snsClient.send(new PublishCommand(params));
    console.log("sent!");
  } catch (err) {
    console.log(err);
    // log.error(err);
    throw err;
  }
}

export async function sendQrCode(
  toEmail: string,
  registrant: string,
  qrcode: string
): Promise<void> {
  const fromEmail = process.env.EMAIL_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO;
  const subject = process.env.EMAIL_SUBJECT || "";

  const message = `You have been registered for VBS at ${vbsProvider}. Below is ${registrant}'s QR code for check-in:
          ${qrcode}`;

  const htmlContent = `
          <html>
          <body>
          <p>You have been registered for VBS at ${vbsProvider}. Below is ${registrant}'s QR code for check-in:</p>
          <img src=${qrcode} alt="Embedded Image">
          </body>
          </html>
          `;

  try {
    const params = {
      Destination: {
        CcAddresses: [],
        ToAddresses: [toEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: htmlContent,
          },
          Text: {
            Charset: "UTF-8",
            Data: message,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: fromEmail,
      ReplyToAddresses: [replyTo],
    };
    await sesClient.send(new SendEmailCommand(params));
  } catch (err) {
    // log.error(err)
    throw err;
  }
}
