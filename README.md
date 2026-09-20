# YoungShip 的个人小站

主页：https://youngship.github.io/

主页 + Markdown 笔记博客，使用 GitHub Pages 内置 Jekyll 构建。无外部字体、前端脚本或跟踪代码，不需要服务器、数据库或付费主题。

## 写文章（不用在电脑上安装软件）

1. 在 GitHub 打开本仓库的 `_posts` 文件夹。
2. 选择 **Add file → Create new file**。
3. 文件名写成 `YYYY-MM-DD-english-slug.md`（日期不要晚于当天）。
4. 复制下面的模板，修改内容，然后点击 **Commit changes**。
5. 等待仓库 **Actions** 中的 Pages 发布任务成功，再刷新网站。首页和记录页会自动更新。

```markdown
---
title: "文章标题"
description: "一句话摘要。"
category: 笔记
tags: [学习]
---

正文从这里开始。

## 小标题

可以写段落、列表、链接、图片和代码。
```

建议分类：笔记、踩坑、随想、生活记录。其他分类也会出现在记录页底部，不会丢失。

附带的「从这里开始，写下第一篇记录」是明确标注的示例/写作说明，可以编辑或删除。

## 修改资料

- `index.html`：首页介绍。
- `about.html`：关于我。
- `_config.yml`：站点标题、简介、网址。
- `assets/style.css`：统一外观。

当前昵称使用 GitHub 用户名 YoungShip，没有编造真实姓名、工作经历或联系方式。

## 发布配置

Settings → Pages → Deploy from a branch → main → / (root)。使用默认 HTTPS 地址，不要添加 `.nojekyll`，也不需要自定义 Actions 工作流。

本地如需完整预览，可安装 Ruby/Jekyll 后使用 GitHub Pages 支持的版本构建；日常写文章不需要本地构建。

## 隐私提醒

网站和源码仓库都公开。不要提交密码、密钥、个人隐私或未公开草稿；`published: false` 只能让网页不展示，不能让公开仓库里的文件变成私密。删除文件后 Git 历史中仍可能保留内容。

参考：[GitHub Pages 写文章](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-content-to-your-github-pages-site-using-jekyll)、[Jekyll 文章格式](https://jekyllrb.com/docs/posts/)。
