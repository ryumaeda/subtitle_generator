// pages/api/check-fcpxml.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

interface CheckResponse {
  exists: boolean;
}

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY!,
  },
});

const checkFCPXML = async (
  req: NextApiRequest,
  res: NextApiResponse<CheckResponse>
) => {
  const { fileName } = req.query;

  if (!fileName || typeof fileName !== "string") {
    return res.status(400).json({ exists: false });
  }

  const params = {
    Bucket: process.env.NEXT_PUBLIC_FCPXML_BUCKET_NAME!,
    Key: fileName,
  };

  try {
    await s3Client.send(new HeadObjectCommand(params));
    return res.status(200).json({ exists: true });
  } catch (error) {
    if ((error as Error).name === "NotFound") {
      return res.status(200).json({ exists: false });
    }
    console.error("Error checking FCPXML file:", error);
    return res.status(500).json({ exists: false });
  }
};

export default checkFCPXML;
