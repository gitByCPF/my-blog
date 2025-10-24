import { readdirSync, statSync } from 'fs'
import { join } from 'path'

// 自动生成导航配置的函数
function generateNavConfig() {
  const docsPath = join(process.cwd(), 'docs')
  const nav = [{ text: "主页", link: "/" }]
  const sidebar = {}
  
  try {
    // 读取 docs 目录下的所有文件夹
    const items = readdirSync(docsPath)
    
    for (const item of items) {
      const itemPath = join(docsPath, item)
      const stat = statSync(itemPath)
      
      // 只处理文件夹，且排除 .vitepress 和 public 文件夹
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'public') {
        const categoryName = item.charAt(0).toUpperCase() + item.slice(1) // 首字母大写
        
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
  },
}