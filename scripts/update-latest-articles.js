const { readFileSync, writeFileSync, readdirSync, statSync, watch } = require('fs')
const { join } = require('path')

// 配置选项
const CONFIG = {
  maxArticles: 6, // 显示的最新文章数量
  docsPath: 'docs', // 文档目录
  indexPath: 'docs/index.md', // 主页文件路径
  excludeDirs: ['.vitepress', 'public'], // 排除的目录
  excludeFiles: ['index.md'], // 排除的文件
}

// 自定义分类显示名称
const CUSTOM_CATEGORY_NAMES = {
  'java': 'Java',
  'javascript': 'JavaScript', 
  'react': 'React',
  'python': 'Python',
}

// 获取最新文章的函数
function getLatestArticles(maxCount = CONFIG.maxArticles) {
  const docsPath = join(process.cwd(), CONFIG.docsPath)
  const articles = []
  
  try {
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
          try {
            const filePath = join(itemPath, file)
            const fileStat = statSync(filePath)
            const content = readFileSync(filePath, 'utf-8')
            
            // 提取标题
            const titleMatch = content.match(/^#\s+(.+)$/m)
            let title = titleMatch ? titleMatch[1] : file.replace(/^\d+-/, '').replace('.md', '')
            
            // 移除emoji但保留文字部分 - 简单方法
            // title = title.replace(/^[^\u0000-\u007F\u4e00-\u9fff]\s*/, '').trim()
            title = title.trim()
            
            articles.push({
              title,
              link: `/${item}/${file}`,
              category: CUSTOM_CATEGORY_NAMES[item] || item.charAt(0).toUpperCase() + item.slice(1),
              mtime: fileStat.mtime,
              fileName: file,
              fullPath: filePath
            })
          } catch (fileError) {
            console.warn(`处理文件 ${file} 时出错:`, fileError.message)
          }
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

// 更新主页的最新文章部分
function updateLatestArticles() {
  const indexPath = join(process.cwd(), CONFIG.indexPath)
  
  try {
    const content = readFileSync(indexPath, 'utf-8')
    const articles = getLatestArticles()
    
    if (articles.length === 0) {
      console.log('没有找到文章')
      return false
    }
    
    // 生成最新文章的Markdown内容
    let latestArticlesMarkdown = '<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">\n\n### 📝 最近更新\n'
    
    articles.forEach(article => {
      latestArticlesMarkdown += `- [**${article.title}**](${article.link}) - ${article.category}文章\n`
    })
    
    latestArticlesMarkdown += '\n</div>'
    
    // 替换主页中的最新文章部分
    const updatedContent = content.replace(
      /## 🎯 最新文章[\s\S]*?(?=## 🌟 项目展示)/,
      `## 🎯 最新文章\n\n${latestArticlesMarkdown}\n\n`
    )
    
    writeFileSync(indexPath, updatedContent, 'utf-8')
    console.log('✅ 主页最新文章已更新')
    console.log('📝 最新文章:')
    articles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title} (${article.category})`)
    })
    
    return true
  } catch (error) {
    console.error('❌ 更新主页时出错:', error.message)
    return false
  }
}

// 监听文件变化
function watchFiles() {
  const docsPath = join(process.cwd(), CONFIG.docsPath)
  console.log('👀 开始监听文件变化...')
  
  watch(docsPath, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md') && !filename.includes('index.md')) {
      console.log(`📝 检测到文件变化: ${filename}`)
      setTimeout(() => {
        updateLatestArticles()
      }, 1000) // 延迟1秒执行，避免文件正在写入
    }
  })
}

// 显示帮助信息
function showHelp() {
  console.log(`
📚 自动更新最新文章脚本

使用方法:
  node scripts/update-latest-articles.js          # 手动更新一次
  node scripts/update-latest-articles.js --watch  # 监听模式
  node scripts/update-latest-articles.js --help    # 显示帮助

配置选项:
  - 最大文章数: ${CONFIG.maxArticles}
  - 文档目录: ${CONFIG.docsPath}
  - 排除目录: ${CONFIG.excludeDirs.join(', ')}
  - 排除文件: ${CONFIG.excludeFiles.join(', ')}
`)
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help')) {
    showHelp()
    return
  }
  
  if (args.includes('--watch')) {
    updateLatestArticles()
    watchFiles()
  } else {
    updateLatestArticles()
  }
}

// 运行主函数
main()