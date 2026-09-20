# YoungShip 的个人小站

主页：https://youngship.github.io/

主页 + Markdown 笔记博客，使用 GitHub Pages 内置 Jekyll 构建。阅读页面无外部字体、前端脚本或跟踪代码，不需要服务器、数据库或付费主题。

## 直接在博客网页写作

- 后台：https://youngship.github.io/admin/
- 首次登录和写作说明：https://youngship.github.io/admin/help/

采用 Sveltia CMS 0.217.0，发行脚本与博客同站托管，版本固定，不依赖外部 CDN 加载编辑器。文章保存到现有 `_posts`，媒体保存到 `assets/uploads`；直接保存即公开，后台删除按钮关闭。只改文章无需手动构建。

首次登录由站主创建细粒度 GitHub 令牌，仅选择 `youngship.github.io` 仓库、Contents 读写权限和自动附带的 Metadata 只读权限，建议 90 天到期；不需要 Pull requests、Actions 或账户权限。请勿创建 classic 全仓库令牌。令牌只由用户输入后台，由 Sveltia 保存在本人设备的浏览器本地存储；不写入仓库，不经额外 OAuth 代理。管理界面是公开静态页面，实际读取/提交受 GitHub 服务端权限控制。

CMS 仍在 0.x 开发阶段；固定版本便于复现，但后续需要定期检查官方安全更新。第三方文件和许可见 `admin/lib`。后台需要可用的 GitHub API 网络连接；博客能访问不等于后台一定能连接。

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

## 在另一台电脑用 Codex 写作

仓库自带 `AGENTS.md` 协作规则和 `.agents/skills/blog-writing/` 写作技能，不依赖原电脑的文件路径。

1. 在新电脑安装 Git，并克隆本仓库到自己选择的目录：

   ```sh
   git clone https://github.com/YoungShip/youngship.github.io.git
   ```

2. 在 Codex 中打开克隆出的 `youngship.github.io` 文件夹，再从这个项目开始任务。
3. 对 Codex 说：`使用 $blog-writing，把以下素材整理成博客草稿，先不要发布。` 如果没有自动识别技能，让它先读取 `AGENTS.md` 和 `.agents/skills/blog-writing/SKILL.md`。
4. 审核后明确说“发布这篇”。发布需要在新电脑单独通过 Git 凭据管理器或平台连接流程登录具有该仓库写权限的 GitHub 账号；克隆公开仓库和写本地草稿本身不需要写入授权。

如果选择细粒度令牌，只授权本仓库的 Contents 读写和必需的 Metadata 只读，通过受信任的凭据输入界面配置；不要把令牌放进聊天、命令行参数、Git remote URL、文章或 Skill。浏览器后台登录与 Git 命令行认证是分开的，不会随仓库同步。

换电脑开始写作前，先检查本地改动并同步远端最新版本；无本地改动时可使用 `git pull --ff-only`。如提示分叉或冲突，先处理差异，不使用强推覆盖另一台电脑的内容。

默认草稿保存在被 Git 忽略的 `.local-drafts/`，不会上传，也不会自动跨电脑同步。这里的忽略和发布审批只是工作约定，不是加密或强制安全隔离。规则和 Skill 可在 GitHub 仓库中公开读取，但已从 Jekyll 网站输出中排除；公开文章仍在 `_posts/`。

## 修改资料

- `index.html`：首页介绍。
- `about.html`：关于我。
- `_config.yml`：站点标题、简介、网址。
- `assets/style.css`：统一外观。

当前昵称使用 GitHub 用户名 YoungShip，没有编造真实姓名、工作经历或联系方式。

## 发布配置

Settings → Pages → Deploy from a branch → main → / (root)。使用默认 HTTPS 地址，不要添加 `.nojekyll`，也不需要自定义 Actions 工作流。

本地如需完整预览，可安装 Ruby/Jekyll 后使用 GitHub Pages 支持的版本构建；日常写文章不需要本地构建。

## 搜索引擎发现

`jekyll-sitemap` 在每次 GitHub Pages 构建时自动生成 `/sitemap.xml`，`/robots.txt` 声明网站地图地址。公开文章可以被抓取；后台、写作帮助和 404 页不进入网站地图，后台与帮助/404 页面通过 `noindex` 提示搜索引擎不要收录。不要通过 robots.txt 禁止这些 HTML 页的抓取，否则爬虫可能看不到页面上的 `noindex`。

网站地图和提交抓取请求不保证收录或排名。Search Console 需要站主单独验证网站所有权，确认成功后才提交网站地图或请求文章收录。不要把“网站已发布”当作“搜索引擎已收录”。

首页通过 `_config.yml` 中的 `google_site_verification` 输出 Google 所有权验证标记；这是供公开验证的标记，不是登录密码。验证成功后仍需保留，避免失去验证状态。

## 隐私提醒

网站和源码仓库都公开。不要提交密码、密钥、个人隐私或未公开草稿；`published: false` 只能让网页不展示，不能让公开仓库里的文件变成私密。删除文件后 Git 历史中仍可能保留内容。

参考：[GitHub Pages 写文章](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-content-to-your-github-pages-site-using-jekyll)、[Jekyll 文章格式](https://jekyllrb.com/docs/posts/)。
