---
title: "客户端不支持 OAuth，怎么接上远程 MCP：手动走一遍动态注册 + PKCE"
date: "2026-10-14"
description: "GitHub 私有仓库用 PAT 走官方远程 MCP；Desktop Commander 远程 MCP 只认 OAuth，就手动注册客户端、拿授权码换令牌，再靠刷新令牌续期。"
category: 踩坑
tags: [MCP, OAuth, GitHub, Desktop Commander, AI Agent]
---

想让 AI 客户端（我用的是 Hark）同时做两件事：读我的私有仓库，和远程操作我的电脑。两个 MCP 服务器，接法完全不一样。

先说结论：**能填 Bearer 令牌的地方，就能接 OAuth 服务器**，只是授权流程得自己手动走一遍。

## GitHub：内置连接器只看得到公开仓库

客户端自带的 GitHub 连接器只能读公开仓库，私有仓库要换路子。

做法是用 GitHub 官方的远程 MCP（`https://api.githubcopilot.com/mcp/`），认证用一个细粒度 PAT（fine-grained personal access token），作为 Bearer 令牌注入请求头。接好后调 `get_me` 能返回自己的账号，私有仓库的目录和文件也都能读。

两个小坑：

- 新加的 MCP 服务器要到下一轮对话才生效，同一轮里调用会报“没有这个服务器”。
- 在我的客户端里调 `get_file_contents` 读文件，只回了一句“已下载”，正文没带回来（可能是客户端只取了第一段结果）；目录列表里每个文件带的 `download_url`（自带临时 token）可以直接下载原文。

## Desktop Commander：没令牌直接 401

Desktop Commander 的远程地址是 `https://mcp.desktopcommander.app/mcp`。不带认证直接请求，返回 401，响应头里写着去哪找授权信息：

```
www-authenticate: Bearer realm="mcp", resource_metadata="https://mcp.desktopcommander.app/.well-known/oauth-protected-resource/mcp"
```

顺着这个地址和 `/.well-known/oauth-authorization-server` 读下去，能拿到完整配置：

| 项目 | 值 |
| --- | --- |
| 授权 / 换令牌 / 注册端点 | `/authorize`、`/token`、`/register` |
| PKCE | 只支持 `S256` |
| 客户端认证方式 | `none`、`client_secret_post` |
| scope | `mcp:tools`、`desktop:auth` |

问题在于：我的客户端对自定义 MCP 只支持填一个固定的 Bearer 令牌，不会自己弹出 OAuth 登录。所以只能手动把令牌拿到手。

## 手动走 OAuth 的四步

**1. 动态注册客户端。** 向 `/register` 发一个 POST，声明回调地址 `http://localhost:8765/callback`。我申请的是 `token_endpoint_auth_method: none`，服务器回的却是 `client_secret_post`，还给了一个 client_secret，后面换令牌时要一起带上。

**2. 生成 PKCE 并拼授权链接。** 随机生成 code_verifier，SHA-256 后做 base64url 得到 code_challenge，再加上 client_id、回调地址、scope、state 和 `resource`，拼成 `/authorize?...` 的链接。

**3. 浏览器登录，复制地址栏。** 打开链接登录授权后，浏览器会跳到 `localhost:8765/callback?code=...&state=...`。本机没有服务在听，页面打不开，这是正常的。把地址栏整串网址复制回来，核对 state 一致，取出 code。

**4. 用 code 换令牌。** 向 `/token` 提交授权码、code_verifier、client_id、client_secret 和 resource，拿到 access_token 和 refresh_token。把 access_token 作为 Bearer 填进 MCP 配置，`list_devices` 就能列出我的两台电脑。

## 令牌一小时就过期，要不要每小时重新登录

不用。

换令牌的响应里写着 `expires_in: 3600`，令牌本身是 JWT，签发和过期时间也正好差 3600 秒；签发方是 Supabase 的认证服务，一小时是它的默认时长。

但同时拿到的还有 refresh_token。用它请求 `/token`（`grant_type=refresh_token`），就能换来新的一小时令牌。我实测了一次：刷新成功，而且 **refresh_token 每用一次就换新一个**，旧的要及时替换掉。

所以实际用法是：不用后台定时刷新，一般隔多久再用都行，用之前先拿 refresh_token 换一把新的。只有在 Desktop Commander 后台撤销授权，或者刷新令牌失效时，才需要重新走一遍登录。

## 安全上记住的几件事

- 令牌和 client_secret 不要发在聊天里，存进客户端的密钥库。授权码是一次性的，又有 PKCE 兜底，贴回给客户端问题不大。我这次把 GitHub PAT 直接贴进了对话，事后应该去 GitHub 重新生成一个。
- 细粒度 PAT 有自己设的到期日，到期要手动重新生成，这一点和 OAuth 的自动续期不同。
- Desktop Commander 能在电脑上执行命令，授权前想清楚，不用时可以在它的后台撤销设备。

## 补充（2026.10.15）：令牌存不进密钥库之后

第一天用下来，正文里“用之前先刷新、令牌存进客户端密钥库”这条路，在我的客户端上走不通了，记一下。

**1. 一小时真的会断。** 客户端没有在令牌过期前去刷新，到点后 Desktop Commander 直接回 401，表现上像“掉线”，其实设备都还在线，只是令牌过期了。

**2. 刷新成功了，但新令牌存不回去。** 用 refresh_token 换来的新 access_token 是一个 1063 个字符的 JWT。客户端密钥库拒收了它，重新走一遍授权拿到的令牌长度也一样，等于白走。奇怪的是当天晚上第一次存同样长度的令牌是成功的，为什么后来被拒，我没能查清，猜测是密钥库的长度检查变了。

**3. 最后的做法：自己写一个小客户端直连。** 不再把令牌交给客户端的 MCP 配置，而是在 AI 的工作区里放一个几十行的脚本：

- 本地保存 access_token、refresh_token 和动态注册得到的 client_id / client_secret；
- 每次调用前看一眼过期时间，离过期不到 10 分钟就先用 refresh_token 换新令牌；
- 新的 refresh_token 立刻写回文件（原子替换），因为旧的用一次就作废；
- 然后照常走 MCP 的 `initialize` → `tools/call`。

这样就不用每小时重新登录，也不受密钥库长度限制。

**代价要说清楚：** 令牌和 client_secret 不在加密密钥库里了，而是放在工作区的一个文件里（权限 600）。这和正文“存进密钥库”的建议相反，是在客户端限制下的折中。对应的补救：

- 不用的时候，去 Desktop Commander 后台撤销授权，令牌立刻作废；
- 如果客户端以后能存长令牌或原生支持 OAuth，就换回去，删掉本地文件。
