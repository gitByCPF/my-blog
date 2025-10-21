export default {
  title: "崔鹏飞的技术博客",
  description: "分享 Java、Python、AI 技术笔记",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]  // ✅ 显式指定
  ],
  themeConfig: {
    logo: "/logo.png", // 这里填你放在 public 目录下的 logo 文件路径
    sidebar: {
      "/java/": [
        { text: "intro", link: "/java/01-intro.md" },
        { text: "oop", link: "/java/02-oop.md" },
        { text: "反射", link: "/java/03-反射.md" },
      ],
      "/python/": [
        { text: "basic", link: "/python/01-python介绍.md" }
      ],
    },
    nav: [
      { text: "主页", link: "/" },
      { text: "Java", link: "/java/01-intro.md" },
      { text: "Python", link: "/python/01-python介绍.md" },
      { text: "GitHub", link: "https://github.com/gitByCPF/my-blog" },
    ],
  },
}