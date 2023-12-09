import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { toFile, toString } from "qrcode";
// import { log } from "~/models/log.server";
import { createHash } from "crypto";
import { readFile, unlink } from "fs/promises";
import { prisma } from "~/db.server";
import type { Child } from "@prisma/client";

const awsKey = process.env.AWS_KEY || "";
const awsSecret = process.env.AWS_SECRET || "";
const awsBucketName = process.env.AWS_BUCKET_NAME || "";

const awsConfig = {
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
        dark: "#000",
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

export async function textQrCode(phoneNumber: string): Promise<void> {
  // Format phone number for AWS SMS
  const parentPhoneNumber = "+1" + phoneNumber.replace(/\D/g, "");
  try {
    // Query the database to get all registrants for the given parentPhoneNumber
    const registrants = await prisma.child.findMany({
      where: {
        phone: phoneNumber,
      },
    });

    if (registrants.length === 0) {
      console.log("No registrants found for", phoneNumber);
      return;
    }

    // Concatenate information for all registrants into a single message
    const message = `You have been registered for Children's Church at ${vbsProvider}.`;
    const registrantInfo = registrants
      .map(
        (registrant: Child) =>
          `${registrant.registrant}'s QR code: ${registrant.qrcode}`
      )
      .join(" ");

    const fullMessage = `${message}\n\n${registrantInfo}`;

    // Send the message to the parent phone number
    const params = {
      Message: fullMessage,
      PhoneNumber: parentPhoneNumber,
    };

    await snsClient.send(new PublishCommand(params));
    console.log("Sent QR code messages for", phoneNumber);

    console.log("All messages sent!");
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await prisma.$disconnect(); // Close the Prisma Client connection
  }
}

export async function sendQrCode(toEmail: string): Promise<void> {
  try {
    // Query the database to get all registrants for the given email
    const registrants = await prisma.child.findMany({
      where: {
        email: toEmail,
      },
    });

    if (registrants.length === 0) {
      console.log("No registrants found for", toEmail);
      return;
    }

    const fromEmail = process.env.EMAIL_FROM || "";
    const replyTo = process.env.EMAIL_REPLY_TO || "";
    const subject = process.env.EMAIL_SUBJECT || "";
    const personalizedSubject = `${subject}: Registrants for ${toEmail}`;

    // Concatenate information for all registrants into a single message
    const message = `You have been registered for Children's Church at ${vbsProvider}. Below are your QR codes for check-in:\n\n${registrants
      .map((registrant) => `${registrant.registrant}: ${registrant.qrcode}`)
      .join("\n")}`;

    const htmlContent = `
          <html>
          <body>
          <p>You have been registered for Children's Church at ${vbsProvider}. Below are your QR codes for check-in:</p>
          ${registrants
            .map(
              (registrant) =>
                `<p>${registrant.registrant}</p> 
                <p><img src=${registrant.qrcode} alt="${registrant.registrant} QR Code"></p>`
            )
            .join("")}
          </body>
          </html>
          `;

    const params = {
      Destination: {
        CcAddresses: [replyTo],
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
          Data: personalizedSubject,
        },
      },
      Source: fromEmail,
      ReplyToAddresses: [replyTo],
    };

    // Send the email to the parent's email address
    await sesClient.send(new SendEmailCommand(params));
    console.log("Sent QR code emails for", toEmail);

    console.log("All emails sent!");
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await prisma.$disconnect(); // Close the Prisma Client connection
  }
}
