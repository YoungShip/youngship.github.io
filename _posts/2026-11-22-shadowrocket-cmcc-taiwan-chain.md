---
title: "移动 5G 连不上台湾节点：小火箭链式中转和懒人配置改法"
date: "2026-11-22"
description: "同一组台湾 SS2022 节点，实验室联通 WiFi 能用、中国移动 5G 不通；用香港节点做跳板解决，再顺手把懒人配置的 DNS、WebRTC 和分流调到全绿。"
category: 踩坑
tags: [iPhone, Shadowrocket]
---

手上有一组台湾落地节点（Shadowsocks 2022），实验室联通 WiFi 下一切正常，换成中国移动 5G 就全部超时。下面是排查过程和最后的配置。环境：iPhone、iOS 27、Shadowrocket（小火箭）。

## 现象

- 联通 WiFi：能用。
- 移动 5G：连接后 Google、YouTube 全部超时。
- 节点用的是域名，有两层 CNAME。

## 排查

1. **看解析。**用 iNetTools 在 5G 下查节点域名：移动 DNS 给的是台湾 HiNet 的地址，境外 DNS 给的是一台韩国云服务器。说明是按地区解析的，不是 DNS 坏了。
2. **测端口。**关掉代理，在 5G 下对台湾地址做端口扫描：端口是通的。
3. **看日志。**在小火箭里把服务器直接写成台湾 IP 再连，日志显示流量确实发往台湾地址，但请求全部超时。
4. **换入口。**把地址换成韩国那台，5G 下同样不通；两个入口切回 WiFi 都正常。

结论：TCP 能握手，但一传 SS2022 数据就断。我的推测是移动对这类全加密流量做了干扰，没有找到官方说明，只能算推断。

## 解决：先到香港，再到台湾

小火箭节点编辑页里有一项 **代理通过**，就是链式代理：手机先连一个移动能用的节点，再由它连台湾。

1. 台湾节点 ⓘ → **代理通过** → 选机场订阅里的香港节点 → 保存。
2. 5G 下重连：Google、YouTube 约 100 ms，Claude 看到的出口是台北中华电信。

单选一个香港节点，它挂了就得手动换，所以改成选一个 **url-test 分组**（自动测速、选最快的香港节点）。测速方式用 CONNECT，它是真实经节点访问网页，比 TCP 和 ICMP 准。

## 配置：懒人配置加几处改动

后来换成 LOWERTOP 的懒人配置 `lazy_group.conf`（Johnshall 仓库里的是同一个文件），它自带 AI 分组和香港分组。在「编辑纯文本」里改了这几处：

```ini
# 外网域名用 Google DoH，经当前选中的节点发出；ecs 让国内站仍解析到国内 IP
dns-server = https://dns.google/dns-query#proxy=proxy&ecs=120.76.0.0/14&ecs-override=true
# 命中国内直连规则的域名，用国内加密 DNS
direct-dns-server = https://doh.pub/dns-query, https://dns.alidns.com/dns-query
ipv6 = false
# 注释掉这两行，WebRTC 走代理，显示的就是台湾出口
#stun-response-ip = 1.1.1.1
#stun-response-ipv6 = ::1
# 香港跳板丢失时直接断开，不绕过跳板直连
close-if-proxy-chain-missing = true
```

- 香港分组：`interval=60,tolerance=50,timeout=5`。60 秒发现坏节点更快，50 ms 公差防止来回切。
- `[Rule]` 顶部加 `DOMAIN-SUFFIX,linux.do,PROXY` 和 viewer12 的 OverseasAI.list（策略 AI）。
- 末尾的国内、国外大列表原来是 Quantumult X 格式，换成 blackmatrix7 的 Shadowrocket 版：China.list + China_Domain.list 走 DIRECT，Global.list + Global_Domain.list 走 PROXY。
- 保留 `udp-policy-not-supported-behaviour = REJECT`：UDP 走不了代理时直接拒绝，注释 STUN 之后靠它兜底。
- 不要点这份配置的「更新」，会冲掉手改。

## 验证

用 ip.net.coffee 测：

- 网页出口、Claude 出口、WebRTC：都是台北。
- DNS：全是台湾的 Google 解析器。
- 中国出口：苏州移动。这是对的，说明国内网站在直连。

## 几个容易看错的地方

- **中国出口显示台湾反而不对。**这一项是访问 ip138 测的。旧的 QX 格式列表没认出它，落到兜底的 PROXY；换成小火箭版列表后才直连。
- **browserleaks 显示移动 IP 不是泄露。**China_Domain.list 收录了 browserleaks.com，它被当成国内站直连了。想用它测，就在规则顶部加一条 `DOMAIN-SUFFIX,browserleaks.com,PROXY`。
- **WebRTC 显示 1.1.1.1 也不是泄露。**那是 `stun-response-ip` 返回的假地址；只是它和出口对不上，有的检测站会标黄。
- **`proxy=` 后的节点名对不上会怎样。**按 LOWERTOP 使用手册，会回退到默认节点，不是回退到运营商 DNS。中文名需要 URL 编码，写成 `proxy=proxy` 就跟随首页选中的节点，省得管名字。
- **「商业」和「住宅」标签。**同是 HiNet 动态宽带，proxycheck.io 把一段标 Business、另一段标 Residential，ping0、ip.net.coffee 都判家庭宽带。各家数据库按段贴标签，不一致很正常。
- **切换配置要转很久。**几万条规则要重新加载，第一次还要下载，平时上网不受影响。

## 备忘

- 跳板依赖机场订阅，订阅到期前要换跳板。另一个办法是国内 BGP 机器用 realm 或 gost 转发，TCP 和 UDP 都要转。
