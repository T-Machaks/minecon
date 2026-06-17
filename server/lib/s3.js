import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'af-south-1' });
const BUCKET = 'minecon';

export async function createPresignedPut(key, contentType) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType, ACL: 'public-read' });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 });
  const publicUrl = `https://${BUCKET}.s3.af-south-1.amazonaws.com/${encodeURIComponent(key)}`;
  return { uploadUrl, publicUrl };
}

export async function deleteS3Object(key) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
    // best-effort delete — don't fail the request if cleanup fails
  }
}
