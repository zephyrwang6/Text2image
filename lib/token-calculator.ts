// 简单的token计算函数
// 这里使用一个简单的估算方法：每个中文字符算2个token，每个英文字符算1个token
export function calculateTokens(text: string): number {
  if (!text) return 0
  
  // 计算中文字符数量
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
  const chineseTokenCount = chineseChars.length * 2
  
  // 计算英文字符数量
  const englishChars = text.match(/[a-zA-Z]/g) || []
  const englishTokenCount = englishChars.length
  
  // 计算标点符号和空格
  const punctuationAndSpaces = text.match(/[\s\p{P}]/gu) || []
  const punctuationTokenCount = punctuationAndSpaces.length
  
  return chineseTokenCount + englishTokenCount + punctuationTokenCount
} 