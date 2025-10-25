<template>
  <div class="latest-articles">
    <h3>📝 最近更新</h3>
    <ul>
      <li v-for="article in articles" :key="article.link">
        <a :href="article.link">{{ article.title }}</a>
        <span class="category">{{ article.category }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'LatestArticles',
  computed: {
    articles() {
      // 从VitePress配置中获取最新文章
      return this.$site.themeConfig.latestArticles || []
    }
  }
}
</script>

<style scoped>
.latest-articles {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
}

.latest-articles h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.latest-articles ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.latest-articles li {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.latest-articles a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.latest-articles a:hover {
  text-decoration: underline;
}

.category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 1rem;
}
</style>
