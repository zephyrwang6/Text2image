import { put, list, del } from '@vercel/blob';

// 定义内容结构
export interface StoredContent {
  id: string;
  content: string;
  type: "cover" | "card" | "diagram";
  createdAt: string;
  templateId: string;
  templateName: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 保存内容到Blob存储
export async function storeBlobContent(
  id: string,
  content: string,
  type: "cover" | "card" | "diagram",
  templateId: string,
  templateName: string,
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  },
): Promise<StoredContent> {
  // 创建内容对象
  const contentItem: StoredContent = {
    id,
    content,
    type,
    createdAt: new Date().toISOString(),
    templateId,
    templateName,
    tokenUsage,
  };
  
  // 将内容存储为JSON字符串
  const contentBlob = await put(`generated-content/${id}.json`, JSON.stringify(contentItem), {
    contentType: 'application/json',
    access: 'public',
  });
  
  // 存储内容记录
  await storeContentRecord(id);
  
  return contentItem;
}

// 从Blob存储中获取内容
export async function getBlobContent(id: string): Promise<StoredContent | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BLOB_URL}/generated-content/${id}.json`);
    if (!response.ok) {
      return null;
    }
    const contentItem = await response.json();
    return contentItem;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

// 最近生成内容的记录ID列表存储为单个文件
async function storeContentRecord(id: string): Promise<void> {
  try {
    // 获取现有记录
    const records = await getContentRecords();
    
    // 添加新ID到数组开头
    records.unshift(id);
    
    // 最多保存20个记录
    const limitedRecords = records.slice(0, 20);
    
    // 存储更新后的记录
    await put('content-records.json', JSON.stringify(limitedRecords), {
      contentType: 'application/json',
      access: 'public',
    });
  } catch (error) {
    console.error('Error storing content record:', error);
  }
}

// 获取内容记录
async function getContentRecords(): Promise<string[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BLOB_URL}/content-records.json`);
    if (!response.ok) {
      return [];
    }
    const records = await response.json();
    return records;
  } catch (error) {
    console.error('Error fetching content records:', error);
    return [];
  }
}

// 获取最近生成的内容
export async function getRecentBlobContents(limit = 4): Promise<StoredContent[]> {
  try {
    // 获取记录ID列表
    const records = await getContentRecords();
    const limitedRecords = records.slice(0, limit);
    
    // 并行获取所有内容
    const contentPromises = limitedRecords.map(id => getBlobContent(id));
    const contents = await Promise.all(contentPromises);
    
    // 过滤掉null值并返回
    return contents.filter(Boolean) as StoredContent[];
  } catch (error) {
    console.error('Error fetching recent contents:', error);
    return [];
  }
}

// 生成唯一ID
export function generateBlobId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 删除内容
export async function deleteBlobContent(id: string): Promise<boolean> {
  try {
    await del(`generated-content/${id}.json`);
    
    // 更新记录列表
    const records = await getContentRecords();
    const updatedRecords = records.filter(recordId => recordId !== id);
    
    await put('content-records.json', JSON.stringify(updatedRecords), {
      contentType: 'application/json',
      access: 'public',
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting content:', error);
    return false;
  }
} 