import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: filename and contentType' },
        { status: 400 }
      );
    }
    
    // 创建可上传的URL
    const blob = await put(filename, new Blob([]), {
      access: 'public',
      contentType,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Error creating blob URL:', error);
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge'; 