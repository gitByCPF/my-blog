const { readFileSync, writeFileSync, readdirSync, statSync, existsSync } = require('fs')
const { join } = require('path')

// 配置选项
const CONFIG = {
  maxArticles: 6,
  docsPath: 'docs',
  indexPath: 'docs/index.md',
  excludeDirs: ['.vitepress', 'public'],
  excludeFiles: ['index.md'],
  jsonPath: 'latest-articles.json' // 存储最新文章信息的 JSON
}

// 自定义分类显示名称
const CUSTOM_CATEGORY_NAMES = {
  'java': 'Java',
  'javascript': 'JavaScript', 
  'react': 'React',
  'python': 'Python',
}

// 获取所有文章
function getAllArticles() {
  const docsPath = join(process.cwd(), CONFIG.docsPath)
  const articles = []

  const items = readdirSync(docsPath)
  for (const item of items) {
    const itemPath = join(docsPath, item)
    const stat = statSync(itemPath)
    if (stat.isDirectory() && !item.startsWith('.') && !CONFIG.excludeDirs.includes(item)) {
      const mdFiles = readdirSync(itemPath)
        .filter(file => file.endsWith('.md') && !CONFIG.excludeFiles.includes(file))
        .sort((a, b) => {
          const aNum = parseInt(a.match(/^\d+/)?.[0] || '0')
          const bNum = parseInt(b.match(/^\d+/)?.[0] || '0')
          return aNum - bNum
        })

      for (const file of mdFiles) {
        const filePath = join(itemPath, file)
        const content = readFileSync(filePath, 'utf-8')
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1].trim() : file.replace(/^\d+-/, '').replace('.md', '')
        articles.push({
          title,
          link: `/${item}/${file}`,
          category: CUSTOM_CATEGORY_NAMES[item] || item.charAt(0).toUpperCase() + item.slice(1),
          filePath
        })
      }
    }
  }

  return articles
}

// 更新 JSON 文件
function updateJSON() {
  const jsonFullPath = join(process.cwd(), CONFIG.jsonPath)
  let prevData = {}
  if (existsSync(jsonFullPath)) {
    prevData = JSON.parse(readFileSync(jsonFullPath, 'utf-8'))
  }

  const articles = getAllArticles()
  const timestamp = Date.now()

  // 更新每篇文章的时间戳，如果已有就保留旧时间
  const updatedArticles = articles.map(a => {
    const key = a.link
    return {
      ...a,
      mtime: prevData[key]?.mtime || timestamp
    }
  })

  // 保存 JSON
  writeFileSync(jsonFullPath, JSON.stringify(updatedArticles, null, 2), 'utf-8')
  return updatedArticles
}

// 根据 JSON 生成首页 Markdown
function updateIndex() {
  const indexPath = join(process.cwd(), CONFIG.indexPath)
  const content = readFileSync(indexPath, 'utf-8')

  const articles = updateJSON()
  // 按 mtime 排序，最新在前
  articles.sort((a, b) => b.mtime - a.mtime)
  const latestArticles = articles.slice(0, CONFIG.maxArticles)

  let latestMarkdown = '<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">\n\n### 📝 最近更新\n'
  latestArticles.forEach(a => {
    latestMarkdown += `- [**${a.title}**](${a.link}) - ${a.category}文章\n`
  })
  latestMarkdown += '\n</div>'

  const updatedContent = content.replace(
    /## 🎯 最新文章[\s\S]*?(?=## 🌟 项目展示)/,
    `## 🎯 最新文章\n\n${latestMarkdown}\n\n`
  )

  writeFileSync(indexPath, updatedContent, 'utf-8')
  console.log('✅ 主页最新文章已更新')
}

updateIndex()
