// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';

interface UploadResponse {
  message: string;
}

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY!,
  },
});

const upload = async (req: NextApiRequest, res: NextApiResponse<UploadResponse>) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fileName, fileData, fileType } = req.body;

  if (!fileName || !fileData || !fileType) {
    return res.status(400).json({ message: '必要なデータが不足しています。' });
  }

  const buffer = Buffer.from(fileData, 'base64');

  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: fileType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return res.status(200).json({ message: 'ファイルのアップロードに成功しました。' });
  } catch (error) {
    console.error('S3 upload error:', error);
    return res.status(500).json({ message: 'S3へのアップロード中にエラーが発生しました。' });
  }
};

export default upload;