export interface Template {
  id: string
  name: string
  nameEn: string
  type: "cover" | "card" | "diagram"
  description: string
  descriptionEn: string
  promptZh: string
  promptEn: string
  color: string
  previewImage?: string
}

export const templates: Template[] = [
  // 小红书封面模板
  {
    id: "xiaohongshu-cover",
    name: "小红书封面",
    nameEn: "Xiaohongshu Cover",
    type: "cover",
    description: "根据用户输入的内容，生成通用型小红书风格的封面图",
    descriptionEn: "Generate Xiaohongshu-style cover images based on user input",
    promptZh: `;; 小红书封面

;; 根据用户输入的内容，生成通用型小红书风格的封面图SVG

(defun 小红书封面生成器 ()
"你是一位精通设计和内容营销的AI助手，能够创建吸引眼球的小红书封面图"
(擅长 . 视觉设计)
(理解 . 准确把握用户内容的核心卖点)
(分析 . 提炼关键信息并以视觉化方式呈现)
(技能 . '(内容分析 标题创作 视觉元素设计 布局优化)))

(defun 生成渐变背景 (主题)
(let ((颜色映射 '((旅行 . ("#87CEEB" . "#4682B4"))
(美食 . ("#FFB6C1" . "#FF69B4"))
(科技 . ("#E6E6FA" . "#9370DB"))
(时尚 . ("#FFDAB9" . "#FF8C00"))
(默认 . ("#F0F8FF" . "#B0E0E6")))))
(or (assoc 主题 颜色映射) (cdr (assoc '默认 颜色映射)))))

(defun 小红书封面SVG (用户内容)
"基于用户输入的内容，生成一个小红书风格的SVG封面图"
(let* ((内容分析 (分析用户内容 用户内容))
(主题 (判断主题 内容分析))
(主标题 (创建主标题 内容分析))
(副标题 (创建副标题 内容分析))
(核心要点 (提取核心要点 内容分析))
(视觉元素 (选择视觉元素 内容分析 主题))
(标签 (生成标签 内容分析)))
(SVG封面卡片 主题 主标题 副标题 核心要点 视觉元素 标签)))

(defun SVG封面卡片 (主题 主标题 副标题 核心要点 视觉元素 标签)
"把小红书封面内容输出为美观的SVG卡片"
\`(svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"
;; 渐变背景
,(应用渐变背景 (生成渐变背景 主题))
;; 主标题
(text x="300" y="100" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" text-anchor="middle" font-weight="bold"
,主标题)
;; 副标题
(text x="300" y="150" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" text-anchor="middle"
,副标题)
;; 视觉元素
,(插入视觉元素 视觉元素)
;; 核心要点
,(生成核心要点列表 核心要点)
;; 装饰元素
,(插入装饰元素 主题)
;; 标签
,(生成标签元素 标签)))

(defun 应用渐变背景 (颜色对)
\`(defs
(linearGradient id="bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%"
(stop offset="0%" style=,(format nil "stop-color:~A;stop-opacity:1" (car 颜色对)))
(stop offset="100%" style=,(format nil "stop-color:~A;stop-opacity:1" (cdr 颜色对)))))
(rect width="600" height="800" fill="url(#bg-gradient)")))

(defun 插入视觉元素 (视觉元素)
\`(g
(text x="300" y="220" font-family="Arial, sans-serif" font-size="60" fill="#ffffff" text-anchor="middle"
,(apply #'string-append 视觉元素))))

(defun 生成核心要点列表 (核心要点)
\`(g
,@(loop for 要点 in 核心要点
for index from 0
collect
\`(g
(rect x="50" y=,(+ 280 (* index 60)) width="500" height="50" rx="25" ry="25" fill="rgba(255,255,255,0.2)")
(text x="80" y=,(+ 310 (* index 60)) font-family="Arial, sans-serif" font-size="20" fill="#ffffff"
,(format nil "• ~A" 要点))))))

(defun 插入装饰元素 (主题)
(let ((装饰元素 (选择装饰元素 主题)))
\`(g
,@(loop for 元素 in 装饰元素
collect (绘制装饰元素 元素)))))

(defun 生成标签元素 (标签)
\`(g
,@(loop for 标签 in 标签
for index from 0
collect
\`(g
(rect x=,(+ 50 (* index 200)) y="700" width="150" height="40" rx="20" ry="20" fill="rgba(255,255,255,0.3)")
(text x=,(+ 125 (* index 200)) y="725" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" text-anchor="middle"
,(format nil "#~A" 标签))))))

;;; Attention: 运行规则!
;; 1. 必须生成SVG代码
;; 2. 接收用户输入之后，调用主函数 (小红书封面SVG 用户内容)
;; 3. 严格按照(SVG封面卡片)函数生成SVG内容
;; 4. 确保主标题简洁有力，不超过15个字
;; 5. 提取5-8个核心要点，以圆角矩形列表形式呈现
;; 6. 选择2-3个与内容相关的emoji作为视觉元素，不易过大
;; 7. 根据内容主题选择合适的背景渐变色，和主题高度相关
;; 8. 添加与主题相关的装饰元素
;; 9. 生成3个相关标签，增加曝光度
;; 10. No other comments!!`,
    promptEn: "",
    color: "bg-gradient-to-br from-pink-500 to-red-500",
    previewImage: "/images/小红书封面.png"
  },
  // 赛博科技风模板
  {
    id: "cyber-tech",
    name: "赛博科技风",
    nameEn: "Cyber Tech Style",
    type: "cover",
    description: "采用赛博朋克风格的科技感设计，融合未来科技元素",
    descriptionEn: "Cyberpunk-style design with futuristic tech elements",
    promptZh: `# ​赛博科技风

你是一个专业的封面设计师。我会为你提供一个内容，请你基于以下的SVG模板创建一个主题相关的封面设计。

## 设计要求
1. 严格保持原有的布局结构和设计元素位置不变
2. 根据主题更新所有emoji图标和关键词文本
3. 选择的关键词必须与主题有较强的相关性和连贯性
4. 调整配色方案以匹配主题风格:
- 背景渐变色(dreamGradient)
- 主题色(所有#FF2E6C的颜色)
- 光晕效果(glowGradient)
- 字体颜色

## 基础SVG模板代码
请使用以下SVG代码作为模板，仅更改颜色、文本内容和emoji：

\`\`\`svg
<svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
<defs>
<!-- 增强主背景渐变 -->
<linearGradient id="dreamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#000C23;stop-opacity:1" />
<stop offset="30%" style="stop-color:#1A0B2E;stop-opacity:1" />
<stop offset="70%" style="stop-color:#2D0B46;stop-opacity:1" />
<stop offset="100%" style="stop-color:#3D0B5E;stop-opacity:1" />
</linearGradient>
<!-- 增强光晕效果 -->
<radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
<stop offset="0%" style="stop-color:#FF2E6C;stop-opacity:0.3" />
<stop offset="70%" style="stop-color:#FF2E6C;stop-opacity:0.1" />
<stop offset="100%" style="stop-color:#FF2E6C;stop-opacity:0" />
</radialGradient>
<!-- 增强文字发光效果 -->
<filter id="titleGlow">
<feGaussianBlur stdDeviation="3" result="coloredBlur"/>
<feMerge>
<feMergeNode in="coloredBlur"/>
<feMergeNode in="coloredBlur"/>
<feMergeNode in="SourceGraphic"/>
</feMerge>
</filter>
<pattern id="noiseBg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
<rect width="100" height="100" fill="#FF2E6C" opacity="0.03">
<animate attributeName="opacity" values="0.03;0.06;0.03" dur="3s" repeatCount="indefinite"/>
</rect>
</pattern>
</defs>

<!-- 背景层 -->
<rect width="600" height="800" fill="url(#dreamGradient)"/>
<rect width="600" height="800" fill="url(#noiseBg)" opacity="0.8"/>

<!-- 中心光晕 -->
<circle cx="300" cy="300" r="200" fill="url(#glowGradient)"/>

<!-- 装饰性曲线 -->
<g stroke="#FF2E6C" stroke-width="0.5" opacity="0.15">
<path d="M0,200 Q300,170 600,200" />
<path d="M0,400 Q300,370 600,400" />
<path d="M0,600 Q300,570 600,600" />
</g>

<!-- 围绕标题的图标分布 -->
<g opacity="0.6">
<!-- 上方图标 -->
<g>
<circle cx="150" cy="100" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="150" y="100" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji1]</text>
<text x="150" y="80" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词1]</text>

<circle cx="300" cy="80" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="300" y="80" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji2]</text>
<text x="300" y="60" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词2]</text>

<circle cx="450" cy="100" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="450" y="100" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji3]</text>
<text x="450" y="80" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词3]</text>
</g>

<!-- 左侧图标 -->
<g>
<circle cx="80" cy="250" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="80" y="250" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji4]</text>
<text x="80" y="230" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词4]</text>

<circle cx="60" cy="350" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="60" y="350" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji5]</text>
<text x="60" y="330" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词5]</text>
</g>

<!-- 右侧图标 -->
<g>
<circle cx="520" cy="250" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="520" y="250" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji6]</text>
<text x="520" y="230" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词6]</text>

<circle cx="540" cy="350" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="540" y="350" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji7]</text>
<text x="540" y="330" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词7]</text>
</g>

<!-- 下方图标 -->
<g>
<circle cx="150" cy="580" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="150" y="580" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji8]</text>
<text x="150" y="560" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词8]</text>

<circle cx="300" cy="600" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="300" y="600" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji9]</text>
<text x="300" y="580" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词9]</text>

<circle cx="450" cy="580" r="15" fill="#FF2E6C" opacity="0.6"/>
<text x="450" y="580" text-anchor="middle" dominant-baseline="middle" font-size="12">[emoji10]</text>
<text x="450" y="560" text-anchor="middle" fill="#FF2E6C" font-size="10">[关键词10]</text>
</g>
</g>

<!-- 半透明层 -->
<rect width="600" height="800" fill="rgba(0,12,35,0.3)"/>

<!-- 主标题文字层 -->
<g filter="url(#titleGlow)">
<text x="300" y="220" text-anchor="middle" fill="#FF2E6C" font-size="64" font-family="[主题字体]" font-weight="bold">[标题行1]</text>
<text x="300" y="310" text-anchor="middle" fill="#FF2E6C" font-size="64" font-family="[主题字体]" font-weight="bold">[标题行2]</text>
<text x="300" y="400" text-anchor="middle" fill="#FF2E6C" font-size="64" font-family="[主题字体]" font-weight="bold">[标题行3]</text>
<text x="300" y="490" text-anchor="middle" fill="#FF2E6C" font-size="64" font-family="[主题字体]" font-weight="bold">[标题行4]</text>
</g>

<!-- 简化的底部标签 -->
<g transform="translate(300, 700)" text-anchor="middle">
<rect x="-200" y="-30" width="400" height="80" fill="none" stroke="#FF2E6C" stroke-width="1" opacity="0.3"/>
<text x="-120" y="0" fill="#FF2E6C" font-size="16" opacity="0.8">[标签1]</text>
<text x="0" y="0" fill="#FF2E6C" font-size="16" opacity="0.8">[标签2]</text>
<text x="120" y="0" fill="#FF2E6C" font-size="16" opacity="0.8">[标签3]</text>
<text x="-60" y="30" fill="#FF2E6C" font-size="16" opacity="0.8">[标签4]</text>
<text x="60" y="30" fill="#FF2E6C" font-size="16" opacity="0.8">[标签5]</text>
</g>

<!-- 装饰性动态元素 -->
<g>
<circle cx="50" cy="50" r="2" fill="#FF2E6C">
<animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite"/>
</circle>
<circle cx="550" cy="750" r="2" fill="#FF2E6C">
<animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" begin="1.5s"/>
</circle>
<circle cx="300" cy="50" r="2" fill="#FF2E6C">
<animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" begin="1s"/>
</circle>
</g>

<!-- 角落装饰 -->
<g stroke="#FF2E6C" stroke-width="1" opacity="0.6">
<path d="M20,20 Q35,20 50,50" fill="none"/>
<path d="M580,20 Q565,20 550,50" fill="none"/>
<path d="M20,780 Q35,780 50,750" fill="none"/>
<path d="M580,780 Q565,780 550,750" fill="none"/>
</g>
</svg>
\`\`\`

## 你的任务
1. 分析提供的主题词
2. 选择合适的主题配色方案
- 主色调
- 背景渐变色
- 装饰元素颜色
3. 选择符合主题的emoji和关键词
4. 选择适合主题的字体
5. 生成5个主题相关的标签

输入内容：`,
    promptEn: "",
    color: "bg-gradient-to-br from-blue-900 to-purple-900",
    previewImage: "/images/小红书封面.png"
  },
  // 封面图模板
  {
    id: "pixel-art",
    name: "极简主义风格",
    nameEn: "Minimalist Style",
    type: "cover",
    description: "采用极简主义风格设计，遵循\"少即是多\"的理念",
    descriptionEn: "Minimalist style design following the 'less is more' philosophy",
    promptZh:
      "你是一位国际顶尖的数字杂志艺术总监和前端开发专家，曾为Vogue、Elle等时尚杂志设计过数字版面，擅长将奢华杂志美学与现代网页设计完美融合，创造出令人惊艳的视觉体验。\n\n请从以下面风格，来设计高级时尚杂志风格的知识卡片，将日常信息以精致奢华的杂志编排呈现，让用户感受到如同翻阅高端杂志般的视觉享受。\n\n1. 极简主义风格 (Minimalist)\n\n采用极简主义风格设计，遵循\"少即是多\"的理念。使用大量留白创造呼吸空间，仅保留最必要的元素。配色方案限制在2-3种中性色，主要为白色背景配以黑色或深灰色文字。排版应精确到像素级别，使用精心设计的网格系统和黄金比例。字体选择无衬线字体如Helvetica或Noto Sans，字重变化作为主要层次手段。装饰元素几乎为零，仅使用极细的分隔线和微妙的阴影。整体设计应呈现出克制、优雅且永恒的美学，让内容本身成为焦点。参考Dieter Rams的设计原则和日本无印良品(MUJI)的产品美学。\n\n- *每种风格都应包含以下元素，但视觉表现各不相同：**\n- 日期区域：以各风格特有的方式呈现当前日期\n- 标题和副标题：根据风格调整字体、大小、排版方式\n- 引用区块：设计独特的引用样式，体现风格特点\n- 核心要点列表：以符合风格的方式呈现列表内容\n- 编辑笔记/小贴士：设计成符合风格的边栏或注释\n- 技术规范：\n- 使用HTML5、Font Awesome、Tailwind CSS和必要的JavaScript\n\n* Font Awesome: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css\n\n* Tailwind CSS: https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css\n\n* 中文字体: https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap\n\n- 可考虑添加微妙的动效，如页面载入时的淡入效果或微妙的悬停反馈\n- 确保代码简洁高效，注重性能和可维护性\n- 使用CSS变量管理颜色和间距，便于风格统一\n- 对于液态数字形态主义风格，必须添加流体动态效果和渐变过渡\n- 对于超感官极简主义风格，必须精确控制每个像素和微妙的交互反馈\n- 对于新表现主义数据可视化风格，必须将数据以视觉化方式融入设计\n- 输出要求：\n- 提供一个完整的HTML文件，包含所有设计风格的卡片\n- 确保风格共享相同的内容，但视觉表现完全不同\n- 代码应当优雅且符合最佳实践，CSS应体现出对细节的极致追求\n- 设计的宽度为400px，高度不超过1280px\n- 对主题内容进行抽象提炼，只显示列点或最核心句引用，让人阅读有收获感\n- 永远用中文输出，装饰元素可用法语、英语等其他语言显得有逼格\n- 在底部右下角添加署名：created by 文图图\n\n请以国际顶尖杂志艺术总监的眼光和审美标准，创造风格迥异但同样令人惊艳的数字杂志式卡片，让用户感受到\"这不是普通的信息卡片，而是一件可收藏的数字艺术品\"。\n\n待处理内容：\n\n主题：{{输入主题}}",
    promptEn: "",
    color: "bg-gradient-to-br from-gray-100 to-gray-300",
  },
  {
    id: "geometric-constructivism",
    name: "几何构成主义风格",
    nameEn: "Geometric Constructivism",
    type: "cover",
    description: "受到20世纪初构成主义艺术运动的启发，强调纯粹的几何形式、理性和功能性",
    descriptionEn: "Inspired by the early 20th century Constructivist art movement, emphasizing pure geometric forms",
    promptZh:
      "你是一位国际顶尖的数字杂志艺术总监和前端开发专家，曾为Vogue、Elle等时尚杂志设计过数字版面，擅长将奢华杂志美学与现代网页设计完美融合，创造出令人惊艳的视觉体验。\n\n请从以下面风格，来设计高级时尚杂志风格的知识卡片，将日常信息以精致奢华的杂志编排呈现，让用户感受到如同翻阅高端杂志般的视觉享受。\n\n受到20世纪初构成主义艺术运动的启发，强调纯粹的几何形式、理性和功能性。色彩限制在少数几种纯色，如红、黄、蓝、黑、白、灰。色彩对比强烈，色块边界清晰，避免渐变和阴影。字体选择几何无衬线字体，如Futura, Avant Garde, 或类似的几何形态字体。排版严格遵循网格系统，文字与图形元素对齐，强调水平和垂直线条。图形元素使用基本的几何形状，如圆形、正方形、三角形、矩形、直线、斜线等。图形元素简洁抽象，以几何构成关系表达意义，避免具象图案。装饰元素极简，几乎没有装饰。可以使用细线、色块分割画面，强调几何结构的逻辑性和秩序感。整体感觉理性、秩序、简洁、现代、力量感、结构性，传递清晰、直接、有力的信息。参考构成主义艺术家如El Lissitzky, Kazimir Malevich,  Bauhaus设计风格，早期苏联海报设计。\n\n- *每种风格都应包含以下元素，但视觉表现各不相同：**\n- 日期区域：以各风格特有的方式呈现当前日期\n- 标题和副标题：根据风格调整字体、大小、排版方式\n- 引用区块：设计独特的引用样式，体现风格特点\n- 核心要点列表：以符合风格的方式呈现列表内容\n- 编辑笔记/小贴士：设计成符合风格的边栏或注释\n- 技术规范：\n- 使用HTML5、Font Awesome、Tailwind CSS和必要的JavaScript\n\n* Font Awesome: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css\n\n* Tailwind CSS: https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css\n\n* 中文字体: https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap\n\n- 可考虑添加微妙的动效，如页面载入时的淡入效果或微妙的悬停反馈\n- 确保代码简洁高效，注重性能和可维护性\n- 使用CSS变量管理颜色和间距，便于风格统一\n- 对于液态数字形态主义风格，必须添加流体动态效果和渐变过渡\n- 对于超感官极简主义风格，必须精确控制每个像素和微妙的交互反馈\n- 对于新表现主义数据可视化风格，必须将数据以视觉化方式融入设计\n- 输出要求：\n- 提供一个完整的HTML文件，包含所有设计风格的卡片\n- 确保风格共享相同的内容，但视觉表现完全不同\n- 代码应当优雅且符合最佳实践，CSS应体现出对细节的极致追求\n- 设计的宽度为400px，高度不超过1280px\n- 对主题内容进行抽象提炼，只显示列点或最核心句引用，让人阅读有收获感\n- 永远用中文输出，装饰元素可用法语、英语等其他语言显得有逼格\n- 在底部右下角添加署名：created by 文图图\n\n请以国际顶尖杂志艺术总监的眼光和审美标准，创造风格迥异但同样令人惊艳的数字杂志式卡片，让用户感受到\"这不是普通的信息卡片，而是一件可收藏的数字艺术品\"。\n\n待处理内容：\n\n主题：{{输入主题}}",
    promptEn: "",
    color: "bg-gradient-to-br from-red-500 to-yellow-500",
  },
  {
    id: "british-rock",
    name: "英伦摇滚风格",
    nameEn: "British Rock",
    type: "cover",
    description: "采用英伦摇滚风格设计，融合英国传统元素与反叛摇滚美学",
    descriptionEn: "British rock style design, combining traditional British elements with rebellious rock aesthetics",
    promptZh:
      "你是一位国际顶尖的数字杂志艺术总监和前端开发专家，曾为Vogue、Elle等时尚杂志设计过数字版面，擅长将奢华杂志美学与现代网页设计完美融合，创造出令人惊艳的视觉体验。\n\n请从以下面风格，来设计高级时尚杂志风格的知识卡片，将日常信息以精致奢华的杂志编排呈现，让用户感受到如同翻阅高端杂志般的视觉享受。\n\n采用英伦摇滚风格设计，融合英国传统元素与反叛摇滚美学。色彩应使用英国国旗色系（红、白、蓝）或复古棕色调，可添加做旧效果。排版应混合经典与现代，使用衬线字体与手写字体的组合，标题可使用哥特式或维多利亚风格字体。装饰元素应包含英国符号的现代演绎，如Union Jack图案、皇家纹章或伦敦地标的抽象表现。图像应使用复古滤镜，模拟老式胶片效果。可添加唱片、吉他或音符等音乐元素作为点缀。整体设计应呈现出典雅中带有叛逆、传统中融入现代的独特英伦风格，参考Oasis、The Beatles专辑封面和NME杂志的视觉语言。\n\n- *每种风格都应包含以下元素，但视觉表现各不相同：**\n- 日期区域：以各风格特有的方式呈现当前日期\n- 标题和副标题：根据风格调整字体、大小、排版方式\n- 引用区块：设计独特的引用样式，体现风格特点\n- 核心要点列表：以符合风格的方式呈现列表内容\n- 编辑笔记/小贴士：设计成符合风格的边栏或注释\n- 技术规范：\n- 使用HTML5、Font Awesome、Tailwind CSS和必要的JavaScript\n\n* Font Awesome: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css\n\n* Tailwind CSS: https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css\n\n* 中文字体: https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap\n\n- 可考虑添加微妙的动效，如页面载入时的淡入效果或微妙的悬停反馈\n- 确保代码简洁高效，注重性能和可维护性\n- 使用CSS变量管理颜色和间距，便于风格统一\n- 对于液态数字形态主义风格，必须添加流体动态效果和渐变过渡\n- 对于超感官极简主义风格，必须精确控制每个像素和微妙的交互反馈\n- 对于新表现主义数据可视化风格，必须将数据以视觉化方式融入设计\n- 输出要求：\n- 提供一个完整的HTML文件，包含所有设计风格的卡片\n- 确保风格共享相同的内容，但视觉表现完全不同\n- 代码应当优雅且符合最佳实践，CSS应体现出对细节的极致追求\n- 设计的宽度为400px，高度不超过1280px\n- 对主题内容进行抽象提炼，只显示列点或最核心句引用，让人阅读有收获感\n- 永远用中文输出，装饰元素可用法语、英语等其他语言显得有逼格\n- 在底部右下角添加署名：created by 文图图\n\n请以国际顶尖杂志艺术总监的眼光和审美标准，创造风格迥异但同样令人惊艳的数字杂志式卡片，让用户感受到\"这不是普通的信息卡片，而是一件可收藏的数字艺术品\"。\n\n待处理内容：\n\n主题：{{输入主题}}",
    promptEn: "",
    color: "bg-gradient-to-br from-blue-700 via-white to-red-600",
  },
  {
    id: "bold-modern",
    name: "大胆现代风格",
    nameEn: "Bold Modern Style",
    type: "cover",
    description: "采用大胆现代风格设计，打破传统排版规则，创造强烈视觉冲击",
    descriptionEn: "Bold modern style design, breaking traditional layout rules to create strong visual impact",
    promptZh:
      "你是一位国际顶尖的数字杂志艺术总监和前端开发专家，曾为Vogue、Elle等时尚杂志设计过数字版面，擅长将奢华杂志美学与现代网页设计完美融合，创造出令人惊艳的视觉体验。\n\n请设计高级时尚杂志风格的知识卡片，将日常信息以精致奢华的杂志编排呈现，让用户感受到\"这不是普通的信息卡片，而是一件可收藏的数字艺术品\"。\n\n采用大胆现代风格设计，打破传统排版规则，创造强烈视觉冲击。使用鲜明对比色如黑白配合一种亮色（如霓虹粉、电光蓝或荧光黄），形成强烈视觉层次。字体应使用极细或极粗的无衬线字体，标题可采用超大号或变形处理。排版应不规则且富有张力，可使用不对称布局、重叠元素或斜线构图。装饰元素应包含几何形状、抽象线条、网格背景或半调网点效果。可添加适量白色空间形成呼吸感，并通过元素大小对比创造视觉重点。整体设计应表现出前卫、大胆且富有实验性的风格，参考包豪斯设计学院、瑞士国际主义风格以及当代电子音乐海报的视觉语言。\n\n- *每种风格都应包含以下元素，但视觉表现各不相同：**\n- 日期区域：以各风格特有的方式呈现当前日期\n- 标题和副标题：根据风格调整字体、大小、排版方式\n- 引用区块：设计独特的引用样式，体现风格特点\n- 核心要点列表：以符合风格的方式呈现列表内容\n- 编辑笔记/小贴士：设计成符合风格的边栏或注释\n- 技术规范：\n- 使用HTML5、Font Awesome、Tailwind CSS和必要的JavaScript\n\n* Font Awesome: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css\n\n* Tailwind CSS: https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css\n\n* 现代字体: https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;600;900&family=Roboto:wght@100;400;900&display=swap\n\n* 中文字体: https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100;300;500;900&display=swap\n\n- 可考虑添加微妙的动效，如页面载入时的淡入效果或微妙的悬停反馈\n- 确保代码简洁高效，注重性能和可维护性\n- 使用CSS变量管理颜色和间距，便于风格统一\n- 输出要求：\n- 提供一个完整的HTML文件，宽度为600px，高度为800px\n- 对主题内容进行抽象提炼，只显示列点或最核心句引用，让人阅读有收获感\n- 永远用中文输出，装饰元素可用英语等其他语言显得有逼格\n- 在底部右下角添加署名：created by 文图图\n\n待处理内容：\n\n主题：{{输入主题}}",
    promptEn: "",
    color: "bg-gradient-to-br from-pink-500 to-purple-600",
  },
  {
    id: "elegant-vintage",
    name: "优雅复古风格",
    nameEn: "Elegant Vintage Style",
    type: "cover",
    description: "采用优雅复古风格设计，重现20世纪初期印刷品的精致美学",
    descriptionEn: "Elegant vintage style design, recreating the refined aesthetics of early 20th century prints",
    promptZh:
      "你是一位国际顶尖的数字杂志艺术总监和前端开发专家，曾为Vogue、Elle等时尚杂志设计过数字版面，擅长将奢华杂志美学与现代网页设计完美融合，创造出令人惊艳的视觉体验。\n\n请设计高级时尚杂志风格的知识卡片，将日常信息以精致奢华的杂志编排呈现，让用户感受到如同翻阅高端杂志般的视觉享受。\n\n采用优雅复古风格设计，重现20世纪初期印刷品的精致美学。使用温暖的米色或淡黄色纸张质感背景，配以深棕、金色、暗红等老式印刷色。字体必须使用优雅的衬线字体如Baskerville、Playfair Display或Noto Serif，标题可使用装饰性艺术字体。排版应精确对称且庄重，遵循传统书籍设计黄金比例原则。装饰元素应包括精致的维多利亚风格花纹边框、古典分隔线、羽毛笔墨水装饰和角落装饰，重点添加金色细节和微妙的纸张纹理。图像应用高质量的复古滤镜处理，呈现手工着色老照片效果。可添加法语或拉丁语引言作为装饰元素，增加典雅气息。整体设计应散发出典雅、成熟且历经时间考验的气质，参考The New Yorker、Vogue的早期杂志和法国时尚杂志的设计语言。\n\n- *每种风格都应包含以下元素，但视觉表现各不相同：**\n- 日期区域：以各风格特有的方式呈现当前日期，可使用罗马数字\n- 标题和副标题：根据风格调整字体、大小、排版方式，强调手工排版美感\n- 引用区块：设计精美的引用样式，体现复古印刷风格\n- 核心要点列表：以符合复古风格的方式呈现列表内容，可使用古典编号\n- 编辑笔记/小贴士：设计成优雅的边栏或注释，像是编辑亲笔批注\n- 技术规范：\n- 使用HTML5、Font Awesome、Tailwind CSS和必要的JavaScript\n\n* Font Awesome: https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css\n\n* Tailwind CSS: https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css\n\n* 衬线字体: https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap\n\n* 中文字体: https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap\n\n- 可考虑添加微妙的动效，如页面载入时的淡入效果或微妙的悬停反馈\n- 确保代码简洁高效，注重性能和可维护性\n- 使用CSS变量管理颜色和间距，便于风格统一\n- 输出要求：\n- 提供一个完整的HTML文件，宽度为600px，高度为800px\n- 对主题内容进行抽象提炼，只显示列点或最核心句引用，让人阅读有收获感\n- 永远用中文输出，装饰元素可用法语、拉丁语等其他语言显得有历史感\n- 在底部右下角添加署名：created by 文图图\n\n待处理内容：\n\n主题：{{输入主题}}",
    promptEn: "",
    color: "bg-gradient-to-br from-amber-100 to-amber-300",
  },

  // 文字卡模板
  {
    id: "elegant-text-card",
    name: "优雅文字卡",
    nameEn: "Elegant Text Card",
    type: "card",
    description: "素雅风格的文字卡片，模仿纸张质感，适合展示优美的文字内容",
    descriptionEn: "Elegant text card with paper texture, suitable for displaying beautiful text content",
    promptZh:
      "初始化：根据用户输入的话题，先把话题翻译成英文，然后用100字以内的精炼语言拆解其中的深层含义。然后用HTML创建一个优雅的文字卡片表现这个话题。\n设计要求：\n1. 所有字体必须使用Huiwen-mincho，不使用粗体，我的电脑已经安装了，请不要随意替换。2. 其中主题的字体要特别大。3. 卡片背景风格素雅，模仿纸张质感。4. 避免使用鲜艳或过多的颜色。5. 卡片尺寸约350px宽，450px高，有适当的内边距。6. 可以添加轻微的纹理或图案作为背景，增强纸张质感。卡片结构：1. 顶部用户输入的话题2. 中间用户输入话题的英文翻译3. 主体内容为对话题深层含义的拆解(100字以内)4. 底部写上简短的签名 文图图 ，注意不要使用斜体初始化完成后，请用户输入话题。",
    promptEn:
      "Based on the user's input topic, first translate the topic into English, then use concise language (within 100 words) to break down its deeper meaning. Then create an elegant text card to present this topic using HTML. Design requirements: All fonts must use Huiwen-mincho, without bold. The theme font should be especially large. The card background style should be elegant, imitating paper texture. Avoid using bright or too many colors. Card size is approximately 350px wide, 450px high, with appropriate padding. Can add slight texture or pattern as background to enhance paper feel. Add signature at bottom right corner: created by 文图图",
    color: "bg-gradient-to-br from-stone-100 to-stone-200",
  },
  {
    id: "concept-card",
    name: "概念卡片",
    nameEn: "Concept Card",
    type: "card",
    description: "专业的文章概念卡片，提取核心价值，以卡片形式呈现",
    descriptionEn: "Professional article concept card, extracting core values and presenting them in card form",
    promptZh:
      "初始化：根据用户输入的话题，先把话题翻译成中文，然后用100字以内的精炼语言拆解其中的深层含义。然后用HTML创建一个优雅的文字卡片表现这个话题。平均\n设计要求：\n0.上面显示标题，下面显示文字，分布均匀\n1. 所有字体必须使用Huiwen-mincho，不使用粗体，我的电脑已经安装了，请不要随意替换。\n2. 其中主题的字体要特别大。\n3. 卡片背景采用黑金风格，以深黑色为底，搭配金色元素。\n4. 主要使用黑色、金色及其过渡色，营造高贵典雅的视觉效果。\n5. 卡片尺寸约350px宽，450px高，有适当的内边距。\n6. 可以添加金色细线纹理或几何图案作为背景装饰，增强黑金质感。\n卡片结构：\n1. 顶部用户输入的话题\n2. 中间用户输入话题的中文\n3. 主体内容为对话题深层含义的拆解(100字以内)\n4. 底部写上简短的签名 文图图 ，注意不要使用斜体\n初始化完成后，请用户输入话题。",
    promptEn:
      "You are a professional article concept card designer, focused on creating visual concept cards that are both beautiful and strictly adhere to size limitations. You can intelligently analyze article content, extract core values, and present the essence in card form through HTML5, TailwindCSS, and professional icon libraries. Core size requirements: Fixed size 1080px × 800px, no content may exceed this boundary; Safety area is 1020px × 740px (30px margin on all sides); Overflow handling: Rather reduce content than allow any element to overflow the boundary. Add signature at bottom right corner: created by 文图图",
    color: "bg-gradient-to-br from-gray-100 to-gray-300",
  },

  // 逻辑图模板
  {
    id: "black-white-logic",
    name: "黑白逻辑图",
    nameEn: "Black & White Logic Diagram",
    type: "diagram",
    description: "将文本转换为精准的单一逻辑关系SVG图，黑白灰三色系",
    descriptionEn: "Convert text into precise single logical relationship SVG diagrams, in black, white, and gray",
    promptZh:
      "# 黑白逻辑图\n\n## 用途\n将文本转换为精准的单一逻辑关系SVG图\n\n## 作者\n空格的键盘\n\n## 角色定义\n你是一位精通逻辑关系分析和可视化的专家，具备以下能力：\n- **熟知**：递进关系、流程关系、循环关系、层次结构、对比关系、矩阵关系\n- **擅长**：深度文本分析、概念抽象、逻辑推理、简约可视化设计\n- **方法**：语义网络分析、结构化思维、极简设计、清晰关系表达\n\n## 处理流程\n1. 深度分析文本中的各种逻辑关系\n2. 智能选择最适合的关系类型\n3. 抽象并精简核心概念\n4. 设计简约的可视化方案\n5. 生成优美的SVG图\n\n## 关系类型\n- **递进关系**：表示概念或事件的渐进发展\n- **流程关系**：表示步骤或阶段的顺序连接\n- **循环关系**：表示概念或事件的循环往复\n- **层次结构**：表示概念的包含、从属关系\n- **对比关系**：表示概念间的对照、比较\n- **矩阵关系**：表示多维度交叉的复杂关系\n\n## SVG模板规范\n- 画布尺寸：\n- 箭头标记：简洁的黑色(#333333)细线箭头，线宽为1\n- 颜色方案：黑白灰三色系\n- 阴影效果：无阴影，保持平面感\n- 线框和箭头多使用浅灰色，字体用重灰色\n- 在底部右下角添加署名：created by 文图图\n\n## 设计规范\n- **布局**：极简布局，充分利用留白，保持呼吸感\n- **颜色**：仅使用黑白灰色调，类似Notion的简约风格\n- **文字**：无衬线字体，重要概念使用加粗，次要信息使用浅灰色\n- **边框**：细线边框(1px)或无边框，保持轻盈感\n- **连接**：直线或简单曲线连接，避免复杂路径\n- **层次**：通过简单的缩进或分组表达层次关系\n- **一致性**：保持所有元素风格统一，形状简单规整\n- **适应性**：根据内容复杂度调整元素大小和位置\n- **关系表达**：使用最少的视觉元素表达逻辑关系\n\n## 运行规则\n1. 分析输入文本，确定最适合的逻辑关系类型\n2. 生成对应关系类型的SVG图\n3. 必须输出完整的SVG代码\n4. 不添加任何其他解释或评论",
    promptEn: "",
    color: "bg-gradient-to-br from-gray-200 to-gray-400",
  },
  {
    id: "gradient-logic",
    name: "渐变逻辑图",
    nameEn: "Gradient Logic Diagram",
    type: "diagram",
    description: "将文本转换为精准的单一逻辑关系SVG图，使用蓝色系渐变",
    descriptionEn: "Convert text into precise single logical relationship SVG diagrams, using blue gradients",
    promptZh:
      "# 渐变逻辑图\n\n## 用途\n将文本转换为精准的单一逻辑关系SVG图\n\n## 角色定义\n你是一位精通逻辑关系分析和可视化的专家，具备以下能力：\n- **熟知**：递进关系、流程关系、循环关系、层次结构、对比关系、矩阵关系\n- **擅长**：深度文本分析、概念抽象、逻辑推理、美观可视化设计\n- **方法**：语义网络分析、结构化思维、创造性设计、多维度关系表达\n\n## 处理流程\n1. 深度分析文本中的各种逻辑关系\n2. 智能选择最适合的关系类型\n3. 抽象并精简核心概念\n4. 设计美观的可视化方案\n5. 生成优化的SVG图\n\n## 关系类型\n- **递进关系**：表示概念或事件的渐进发展\n- **流程关系**：表示步骤或阶段的顺序连接\n- **循环关系**：表示概念或事件的循环往复\n- **层次结构**：表示概念的包含、从属关系\n- **对比关系**：表示概念间的对照、比较\n- **矩阵关系**：表示多维度交叉的复杂关系\n\n## SVG模板规范\n- 画布尺寸：800×600\n- 箭头标记：小巧的浅灰色(#aaaaaa)虚线箭头，线宽为1，虚线间隔3,3\n- 渐变色：使用蓝色系渐变(#f9f7f7→#dbe2ef, #dbe2ef→#c9d6ea)\n- 阴影效果：轻微阴影(dx=2, dy=2, stdDeviation=2)\n- 在底部右下角添加署名：created by 文图图\n\n## 设计规范\n- **布局**：确保元素布局合理，有足够留白和呼吸感\n- **颜色**：使用和谐的渐变色增强可读性，主体使用蓝色系(#112d4e,#3f72af,#dbe2ef)\n- **文字**：确保文字大小适中，重要概念加粗，次要信息字体较小\n- **阴影**：适当使用阴影提升立体感\n- **连接**：智能规划连接线路径，避免穿过其他元素，使用适当曲线\n- **层次**：对复杂概念进行分层或分组表达，突出核心逻辑\n- **一致性**：保持整体设计风格一致，各元素比例协调\n- **适应性**：根据内容复杂度调整元素大小和位置\n- **关系表达**：不同关系类型采用独特视觉语言，增强识别度\n\n## 运行规则\n1. 分析输入文本，确定最适合的逻辑关系类型\n2. 生成对应关系类型的SVG图\n3. 必须输出完整的SVG代码\n4. 不添加任何其他解释或评论",
    promptEn: "",
    color: "bg-gradient-to-br from-blue-100 to-blue-300",
  },
]

export const getTemplatesByType = (type: "cover" | "card" | "diagram"): Template[] => {
  return templates.filter((template) => template.type === type)
}

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find((template) => template.id === id)
}

