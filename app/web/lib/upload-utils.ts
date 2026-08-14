/**
 * Helper utility to upload files directly from the browser to Cloudflare R2
 * via a secure pre-signed URL from our Next.js backend.
 */
export async function uploadToR2(file: File, folderName: string): Promise<string> {
  try {
    // 1. Ask the backend for a secure upload ticket (pre-signed URL)
    const res = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        folder: folderName,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to get upload URL');
    }

    const { signedUrl, publicUrl } = await res.json();

    // 2. Upload the file directly to Cloudflare R2 using the signed URL
    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file to Cloudflare R2');
    }

    // 3. Return the final public URL where the file can be accessed
    return publicUrl;
  } catch (error) {
    console.error('Upload to R2 error:', error);
    throw error;
  }
}
