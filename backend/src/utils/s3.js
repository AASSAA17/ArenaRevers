import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if S3 is configured
const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );
};

// Configure AWS S3 (only if credentials are provided)
let s3 = null;
if (isS3Configured()) {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// Local uploads directory
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const PUBLIC_UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// Ensure uploads directories exist
const ensureUploadsDir = () => {
  [UPLOADS_DIR, PUBLIC_UPLOADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadsDir();

/**
 * Upload file to S3 or local storage
 */
export const uploadFile = async (file, key, contentType = 'image/jpeg') => {
  // If S3 is configured, use S3
  if (isS3Configured() && s3) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make file publicly accessible
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location; // URL of uploaded file
    } catch (error) {
      console.error('S3 upload failed, falling back to local storage:', error.message);
      // Fall through to local storage
    }
  }

  // Fallback to local storage
  try {
    ensureUploadsDir();
    
    // Create directory structure if needed
    const keyParts = key.split('/');
    const fileName = keyParts.pop();
    const dirPath = path.join(PUBLIC_UPLOADS_DIR, keyParts.join('/'));
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, file);
    
    // Return public URL (relative to /uploads)
    return `/uploads/${key}`;
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Delete file from S3 or local storage
 */
export const deleteFile = async (key) => {
  // If S3 is configured, try to delete from S3
  if (isS3Configured() && s3) {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('S3 delete failed, trying local storage:', error.message);
      // Fall through to local storage
    }
  }

  // Fallback to local storage
  try {
    const filePath = path.join(PUBLIC_UPLOADS_DIR, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`File delete failed: ${error.message}`);
  }
};

/**
 * Generate presigned URL for file upload
 */
export const getPresignedUploadUrl = (key, contentType = 'image/jpeg', expiresIn = 3600) => {
  if (!isS3Configured() || !s3) {
    // Return a local upload endpoint URL if S3 is not configured
    return `/api/arenas/upload/${key}`;
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Expires: expiresIn,
  };

  return s3.getSignedUrl('putObject', params);
};

