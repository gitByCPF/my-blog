export default {
  title: "崔鹏飞的技术博客",
  description: "分享 Java、Python、AI 学习笔记",
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "Java", link: "/java/intro" },
      { text: "Python", link: "/python/basic" },
      { text: "GitHub", link: "https://github.com/你的用户名/你的仓库" },
    ],
    sidebar: {
      "/java/": [
        { text: "Java 入门", link: "/java/intro" },
        { text: "面向对象", link: "/java/oop" },
      ],
    },
  },
}