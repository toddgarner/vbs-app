import { Buffer } from "buffer";
import sharp from "sharp";
import {
  // DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { awsBucketName, awsConfig } from "~/models/aws.server";
// import * as crypto from "crypto";

const s3Client = new S3Client(awsConfig);
const DefaultMaxWidth = 600;
const DefaultMaxHeight = 800;
const MaxUploadLength = 10 * 1024 * 1024;

export async function readImage(
  data: AsyncIterable<Uint8Array>
): Promise<Buffer> {
  let buffer = Buffer.alloc(0);
  for await (const chunk of data) {
    if (buffer.length + chunk.length > MaxUploadLength) {
      throw new Error("file too big");
    }
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

export async function readParameter(
  data: AsyncIterable<Uint8Array>
): Promise<string> {
  let value = "";
  for await (const chunk of data) {
    value += new TextDecoder().decode(chunk);
  }
  return value;
}

// export async function handlePackageImageUpload(
//   buffer: AsyncIterable<Uint8Array> | Buffer,
//   maxWidth?: number,
//   maxHeight?: number
// ): Promise<string> {
//   if (!Buffer.isBuffer(buffer)) {
//     buffer = await readImage(buffer as AsyncIterable<Uint8Array>);
//   }

//   const processedBuffer = await scaleImage(buffer, maxWidth, maxHeight);
//   const url = await saveImage(`images/${crypto.randomUUID()}.png`, processedBuffer);

//   return url;
// }

async function scaleImage(
  buffer: Buffer,
  maxWidth?: number,
  maxHeight?: number
): Promise<Buffer> {
  if (!maxWidth) {
    maxWidth = DefaultMaxWidth;
  }
  if (!maxWidth) {
    maxWidth = DefaultMaxWidth;
  }
  if (!maxHeight) {
    maxHeight = DefaultMaxHeight;
  }

  let image = await sharp(buffer);
  let metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("could not get image metadata");
  }
  let newWidth: number | null = null;
  let newHeight: number | null = null;
  if (metadata.width > maxWidth) {
    newWidth = maxWidth;
  } else if (metadata.height > maxHeight) {
    newHeight = maxHeight;
  }
  if (newWidth || newHeight) {
    image = await image.resize(newWidth, newHeight);
  }
  return await image.png().toBuffer();
}

export async function saveImage(name: string, buffer: Buffer): Promise<string> {
  const processedBuffer = await scaleImage(buffer);

  try {
    const params = {
      Bucket: awsBucketName,
      Body: processedBuffer,
      Key: name,
      ACL: "public-read",
      ContentType: "image/png",
    };
    await s3Client.send(new PutObjectCommand(params));
    return `https://s3.us-east-1.amazonaws.com/${awsBucketName}/${name}`;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// async function deleteImage(url: string): Promise<void> {
//   const [host, bucket, key] = url.substring(8).split('/')
//   try {
//     const params = {
//       Bucket: bucket,
//       Key: key
//     }
//     await s3Client.send(new DeleteObjectCommand(params))
//   } catch (err) {
//     console.error(err)
//   }
// }
