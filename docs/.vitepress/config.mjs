import { readdirSync, statSync, readFileSync } from 'fs'
import { join } from 'path'
import { defineConfig } from 'vitepress'

// 自定义导航顺序配置
const CUSTOM_NAV_ORDER = [
  'java',
  'python',
  'tools',
  'react',
  'javascript',
]

// 自定义分类显示名称
const CUSTOM_CATEGORY_NAMES = {
  'java': 'Java',
  'javascript': 'JavaScript', 
  'react': 'React',
  'python': 'Python',
  'tools': 'Tools',
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
    const items = readdirSync(docsPath)
    const orderedItems = []
    
    for (const customOrder of CUSTOM_NAV_ORDER) {
      if (items.includes(customOrder)) {
        orderedItems.push(customOrder)
      }
    }
    
    const remainingItems = items
      .filter(item => !CUSTOM_NAV_ORDER.includes(item))
      .sort()
    
    orderedItems.push(...remainingItems)
    
    for (const item of orderedItems) {
      const itemPath = join(docsPath, item)
      const stat = statSync(itemPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'public') {
        const categoryName = CUSTOM_CATEGORY_NAMES[item] || item.charAt(0).toUpperCase() + item.slice(1)
        
        const mdFiles = readdirSync(itemPath)
          .filter(file => file.endsWith('.md'))
          .sort((a, b) => {
            const aNum = parseInt(a.match(/^\d+/)?.[0] || '0')
            const bNum = parseInt(b.match(/^\d+/)?.[0] || '0')
            return aNum - bNum
          })
        
        if (mdFiles.length > 0) {
          sidebar[`/${item}/`] = mdFiles.map(file => {
            const fileName = file.replace('.md', '')
            return {
              text: fileName,
              link: `/${item}/${file}`
            }
          })
          
          nav.push({
            text: categoryName,
            link: `/${item}/${mdFiles[0]}`
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

export default defineConfig({
  title: "崔鹏飞的技术博客",
  description: "分享技术笔记",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  ignoreDeadLinks: true,
  
  // Vite 配置 - B站 API 代理
  vite: {
    server: {
      proxy: {
        '/bili-api': {
          target: 'https://api.bilibili.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/bili-api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // 从自定义请求头获取 Cookie
              const biliCookie = req.headers['x-bili-cookie']
              
              console.log('代理请求:', req.url)
              console.log('收到的 Cookie 头:', biliCookie ? '有' : '无')
              
              if (biliCookie) {
                // 设置标准的 Cookie 请求头
                proxyReq.setHeader('Cookie', biliCookie)
                console.log('已设置 Cookie 到代理请求')
              }
              
              // 设置其他必要的请求头
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
              proxyReq.setHeader('Referer', 'https://www.bilibili.com')
              proxyReq.setHeader('Origin', 'https://www.bilibili.com')
            })
            
            // 监听响应
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('代理响应状态:', proxyRes.statusCode)
            })
            
            // 监听错误
            proxy.on('error', (err, req, res) => {
              console.error('代理错误:', err)
            })
          }
        }
      }
    }
  },
  
  themeConfig: {
    logo: "/logo.png",
    sidebar,
    nav: [
      ...nav,
      { text: "GitHub", link: "https://github.com/gitByCPF/my-blog" }
    ],
    latestArticles,
  }
})