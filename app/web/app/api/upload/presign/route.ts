import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType, folder } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and contentType are required' },
        { status: 400 }
      );
    }

    // You could add authentication here using Supabase auth 
    // to ensure only logged-in users can generate upload URLs

    const bucketName = process.env.R2_BUCKET_NAME || 'bhavyam';
    
    // Create a safe, unique file path using the requested folder
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
    let objectKey = `${uniqueId}_${sanitizedFilename}`;
    
    if (folder) {
      // Ensure folder path doesn't start or end with a slash
      const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
      objectKey = `${cleanFolder}/${objectKey}`;
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    // Generate a pre-signed URL that expires in 5 minutes (300 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${objectKey}`;

    return NextResponse.json({ 
      signedUrl, 
      publicUrl,
      objectKey
    });

  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
