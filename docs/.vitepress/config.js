import { readdirSync, statSync, readFileSync } from 'fs'
import { join } from 'path'

// 自定义导航顺序配置
const CUSTOM_NAV_ORDER = [
  'java',        // Java 排在第一位
  'python',      // Python 排在第二位
  'react',       // React 排在第三位
  'javascript',  // JavaScript 排在第四位
  // 可以继续添加其他分类...
]

// 自定义分类显示名称
const CUSTOM_CATEGORY_NAMES = {
  'java': 'Java',
  'javascript': 'JavaScript', 
  'react': 'React',
  'python': 'Python',
  // 可以继续添加其他分类的显示名称...
}

// 获取最新文章的函数
function getLatestArticles(maxCount = 6) {
  const docsPath = join(process.cwd(), 'docs')
  const articles = []
  
  try {
    const items = readdirSync(docsPath)
    
    for (const item of items) {
      const itemPath = join(docsPath, item)
      const stat = statSync(itemPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'public') {
        const mdFiles = readdirSync(itemPath)
          .filter(file => file.endsWith('.md'))
          .sort((a, b) => {
            const aNum = parseInt(a.match(/^\d+/)?.[0] || '0')
            const bNum = parseInt(b.match(/^\d+/)?.[0] || '0')
            return aNum - bNum
          })
        
        for (const file of mdFiles) {
          const filePath = join(itemPath, file)
          const fileStat = statSync(filePath)
          const content = readFileSync(filePath, 'utf-8')
          
          // 提取标题
          const titleMatch = content.match(/^#\s+(.+)$/m)
          const title = titleMatch ? titleMatch[1].replace(/^[🎯🚀📊🔧⚠️📁🏗️🐍]/g, '').trim() : file.replace(/^\d+-/, '').replace('.md', '')
          
          articles.push({
            title,
            link: `/${item}/${file}`,
            category: CUSTOM_CATEGORY_NAMES[item] || item.charAt(0).toUpperCase() + item.slice(1),
            mtime: fileStat.mtime,
            fileName: file
          })
        }
      }
    }
    
    // 按修改时间排序，最新的在前
    articles.sort((a, b) => b.mtime - a.mtime)
    
    return articles.slice(0, maxCount)
  } catch (error) {
    console.warn('获取最新文章时出错:', error.message)
    return []
  }
}

// 生成最新文章的Markdown内容
function generateLatestArticlesMarkdown() {
  const articles = getLatestArticles(6)
  
  if (articles.length === 0) {
    return '<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">\n\n### 📝 最近更新\n- 暂无文章\n\n</div>'
  }
  
  let markdown = '<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">\n\n### 📝 最近更新\n'
  
  articles.forEach(article => {
    markdown += `- [**${article.title}**](${article.link}) - ${article.category}文章\n`
  })
  
  markdown += '\n</div>'
  
  return markdown
}

// 自动生成导航配置的函数
function generateNavConfig() {
  const docsPath = join(process.cwd(), 'docs')
  const nav = [{ text: "主页", link: "/" }]
  const sidebar = {}
  
  try {
    // 读取 docs 目录下的所有文件夹
    const items = readdirSync(docsPath)
    
    // 按照自定义顺序处理文件夹
    const orderedItems = []
    
    // 首先添加自定义顺序中的文件夹
    for (const customOrder of CUSTOM_NAV_ORDER) {
      if (items.includes(customOrder)) {
        orderedItems.push(customOrder)
      }
    }
    
    // 然后添加其他未在自定义顺序中的文件夹（按字母顺序）
    const remainingItems = items
      .filter(item => !CUSTOM_NAV_ORDER.includes(item))
      .sort()
    
    orderedItems.push(...remainingItems)
    
    for (const item of orderedItems) {
      const itemPath = join(docsPath, item)
      const stat = statSync(itemPath)
      
      // 只处理文件夹，且排除 .vitepress 和 public 文件夹
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'public') {
        // 使用自定义名称，如果没有则使用首字母大写
        const categoryName = CUSTOM_CATEGORY_NAMES[item] || item.charAt(0).toUpperCase() + item.slice(1)
        
        // 读取该文件夹下的所有 .md 文件
        const mdFiles = readdirSync(itemPath)
          .filter(file => file.endsWith('.md'))
          .sort((a, b) => {
            // 按文件名中的数字序号排序
            const aNum = parseInt(a.match(/^\d+/)?.[0] || '0')
            const bNum = parseInt(b.match(/^\d+/)?.[0] || '0')
            return aNum - bNum
          })
        
        if (mdFiles.length > 0) {
          // 生成侧边栏配置
          sidebar[`/${item}/`] = mdFiles.map(file => {
            const fileName = file.replace(/^\d+-/, '').replace('.md', '') // 移除序号前缀
            return {
              text: fileName,
              link: `/${item}/${file}`
            }
          })
          
          // 生成导航配置
          nav.push({
            text: categoryName,
            link: `/${item}/${mdFiles[0]}` // 链接到第一个文件
          })
        }
      }
    }
  } catch (error) {
    console.warn('自动生成导航配置时出错:', error.message)
  }
  
  return { nav, sidebar }
}

const { nav, sidebar } = generateNavConfig()
const latestArticles = getLatestArticles(6)

export default {
  title: "崔鹏飞的技术博客",
  description: "分享技术笔记",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    logo: "/logo.png",
    sidebar,
    nav: [
      ...nav,
      { text: "GitHub", link: "https://github.com/gitByCPF/my-blog" }
    ],
    // 导出最新文章数据供主题使用
    latestArticles,
  },
}