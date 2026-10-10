---
title: "MicroMani 问题与验收台账：状态、证据与后续门槛"
date: "2026-09-29"
last_modified_at: "2026-10-10"
description: "每个问题一行：当前状态、现状与下一步、出处。查某个问题解决没有、还差什么验收，从这里开始。"
category: 笔记
tags: [科研记录, MicroMani, 科研索引]
---

[科研总览](/notes/2026/09/23/micromani-research-overview/) · [问题与验收台账](/notes/2026/09/29/micromani-research-status/) · [实验与数据索引](/notes/2026/09/29/micromani-experiment-register/)

**更新至 2026-10-10。**每个问题占一行，只写现在的状态和下一步；过程、证据和历次补记在“出处”链接的原文里。编号固定不变，新问题接在各组末尾。

**当前最要紧的：**10 月 8 日回工作原点时出现危险的多圈规划（[A04](#A04)、[A09](#A09)），所有实机操作暂停，先查清计数基准并加上大位移拒绝。采集软件的完整性修复已加载但还没有新录制验证，合格 probe 仍为 0（[C04](#C04)、[C09](#C09)、[C16](#C16)）。

## 状态怎么读
{: #status-tags }

| 状态 | 含义 |
| --- | --- |
| 未解决 | 问题存在，根因或可靠修复还没闭环 |
| 已定位 | 机制已清楚，修复未做或只做了一部分 |
| 已修改待验收 | 有针对性的修改，还没有现场验收 |
| 离线通过 | 离线测试或仿真通过，还没部署或没上真机 |
| 现场通过（单次） | 现场正常过一次，没有重复验证 |
| 真机验收通过 | 在明确条件下重复实机验证通过 |
| 已解决 | 修复已完成，并在数据或设备上核验过 |
| 临时方案 | 暂时能绕过，不是最终设计 |
| 已完成 | 实验或数据整理已做完，结果见出处 |
| 已结束 | 这条路线已停止 |
| 待核 | 数据或口径有疑问，等核对 |

## A. 机械系统与运动控制
{: #A }

| 编号 | 问题 | 状态 | 现状与下一步 | 出处 |
| --- | --- | --- | --- | --- |
| <a id="A01"></a>**A01** | 工作原点作为统一任务起点 | 已定位 | 工作原点负责任务复位，与机械寻零、机械参考点是不同概念；已用于采集 | [阶段二](/notes/2026/09/21/micromani-standardized-data-and-training/)、[阶段三](/notes/2026/09/22/micromani-homing-reference/) |
| <a id="A02"></a>**A02** | 右臂软件工作原点重设（09-24） | 现场通过（单次） | 新原点数值核对正确，六轴读数为 0；机械参考点仍待确认，10-08 起该 W 与计数基准失配（见 A09） | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="A03"></a>**A03** | 已回 W 还要再点一次 | 已修改待验收 | 后端有限等待新鲜反馈，前端接受质量报告后保留复位结果；待现场重复验证 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="A04"></a>**A04** | 旋转轴绕圈 / 回 W 多圈规划 | 未解决 | 10-08 普通回 W 给 Roll 规划约 −1732°，现场急停；普通回 W 没有总转动量检查。关闭条件：大位移 fail-closed 拒绝、故障注入测试、现场安全验收 | [阶段三](/notes/2026/09/22/micromani-homing-reference/)、[多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/) |
| <a id="A05"></a>**A05** | 寻零中途的 pulse 被存成参考 | 已修改待验收 | 公开源码 `400cde0` 已按“接受、完成、停止、新鲜反馈”四层判断完成；待完整真机验收 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A06"></a>**A06** | X/Z 等轴找不到 HOME | 未解决 | 会一直走到端部或超时；需核对 HOME 输入、方向、限位逻辑和轴映射 | [阶段三](/notes/2026/09/22/micromani-homing-reference/)、[寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A07"></a>**A07** | 限位端作为机械参考 | 已修改待验收 | 已有显式正限位模式（起点 EL+ 无效、终点有效且停稳）；重复定位精度未测 | [阶段三](/notes/2026/09/22/micromani-homing-reference/)、[寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A08"></a>**A08** | 顺序寻零与参考实例绑定 | 离线通过 | `c0bfbb4` 起一轴完成再启动下一轴；实例绑定检测不到计数复位（见 A09）；待现场验收 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A09"></a>**A09** | 保存的 W 与控制卡计数基准失配 | 未解决 | 10-08 回 W 时当前计数为 0，W 仍是 09-24 的多圈计数；归零原因待核。实机暂停，禁止直接回 W、寻零或取模修正 | [多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/) |

## B. 遥操作与控制链路
{: #B }

| 编号 | 问题 | 状态 | 现状与下一步 | 出处 |
| --- | --- | --- | --- | --- |
| <a id="B01"></a>**B01** | GPT 视觉直接控制与力保护 | 已结束 | 没有抓起零件；接触停止和恒力未验收；代码已撤回，日志留档 | [GPT 复盘](/notes/2026/09/29/micromani-gpt-grasp-closeout/) |
| <a id="B02"></a>**B02** | 操作者侧与硬件侧映射 | 已定位 | 操作者左右与硬件左右相反；参与侧、数据契约和日志须用一致的侧别 | [阶段三](/notes/2026/09/22/micromani-homing-reference/)、[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="B03"></a>**B03** | 主手连接副作用与失败回滚 | 已修改待验收 | 连接前检查主手与反馈新鲜度，禁止隐式使能，失败撤销连接；待现场验收 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="B04"></a>**B04** | 运动反馈真实性与停止结果 | 已修改待验收 | 保留真实采样时间、提高脉冲 JSON 精度、停止失败显式报错；停止能力需现场核验 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/)、[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="B05"></a>**B05** | DDS 命令应答并发 | 离线通过 | 应答按 `request_id` 关联，未见租约请求抢走普通命令的应答 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="B06"></a>**B06** | DDS 应答超时与通道隔离 | 已修改待验收 | 去掉阻塞输出、按工作线程完成时刻判超时（10-08），读取线程复用已推送（10-10）；待持续现场验收 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)、[新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="B07"></a>**B07** | backend 代为续 HAL 租约 | 临时方案 | 减少界面抖动导致的误断控，但“连接还在”不代表界面还活着；需配合 B08 | [阶段四](/notes/2026/09/22/micromani-quality-and-stability/) |
| <a id="B08"></a>**B08** | 浏览器活性检测 | 未解决 | watchdog 仍按连接会话判健康，独立的浏览器心跳没有实现 | [阶段四](/notes/2026/09/22/micromani-quality-and-stability/)、[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="B09"></a>**B09** | 主从夹爪开度不一致 | 未解决 | 见过目标 26 mm、实际约 12 mm、半秒后才追上；漏跟随或标定偏差未排除 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="B10"></a>**B10** | 主手姿态与夹持输入间歇冻结 | 未解决 | XYZ 在变而姿态和夹持输入停住；设备、SDK 还是读取链路的问题未区分 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="B11"></a>**B11** | Omega 开度来源全链路记录 | 离线通过 | 开度来源随数据落盘；隔离候选未部署 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="B12"></a>**B12** | Gap 标定参数侧别 | 已定位 | 界面按操作者侧选参数，HAL 按硬件侧解析；旧工作区有候选修正，未集成 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="B13"></a>**B13** | 主手重力补偿在边缘抽搐 | 现场通过（单次） | 手柄放进标定孔重新标定后消失，原因为推断；开机前先把手柄放进标定孔 | [Omega 抽搐](/notes/2026/10/09/micromani-omega-calibration-twitch/) |
| <a id="B14"></a>**B14** | 双侧夹爪串口互相阻塞 | 已修改待验收 | 两侧调度分离、阻塞后只执行最新目标（`a5deb6a`）；用户反馈夹爪灵敏，未重复验收 | [新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) |

## C. 数据采集与系统稳定性
{: #C }

| 编号 | 问题 | 状态 | 现状与下一步 | 出处 |
| --- | --- | --- | --- | --- |
| <a id="C01"></a>**C01** | 三路相机 30 FPS 与设备绑定 | 真机验收通过 | 120 秒统计和后续录制均稳定约 30 FPS；更长时间、更高负载未覆盖 | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="C02"></a>**C02** | 保存的视频周期卡顿 | 现场通过（单次） | 原因是垃圾回收长暂停和编码积压；编码隔离后实机录制无可见卡顿 | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="C03"></a>**C03** | 结束、丢弃、复位竞态 | 已修改待验收 | 多处时序已修；10-09 改为尾帧排空后再停夹爪采样，已加载未提交，待实测 | [阶段一](/notes/2026/09/20/micromani-research-log/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C04"></a>**C04** | 夹爪反馈迟到与迟帧 | 未解决 | 9 月组帧修复后降到约 2.7%；10-09 新视角试采又升到 11–55%，修复后唯一一条 0.24% 也已作废，待新录制验证 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)、[新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C05"></a>**C05** | 录完后约 16.7 秒状态停顿 | 未解决 | 触发链路清楚（状态停顿→租约失效→急停），根因未知；后续 15 分钟监测未复发 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="C06"></a>**C06** | 成功的 767 帧示教 | 待核 | 抓放成功，但放置阶段有 3 个夹爪对齐超限点（50–63 ms），先不入训 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="C07"></a>**C07** | GPT 动作转训练标签 | 已结束 | GPT 动作未接入录制器的动作来源，随 GPT 路线结束 | [GPT 复盘](/notes/2026/09/29/micromani-gpt-grasp-closeout/) |
| <a id="C08"></a>**C08** | 录制开头保留静止画面 | 已修改待验收 | 操作规范：显示录制中后主手静止约 0.5 秒再开始；待数据验收 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="C09"></a>**C09** | 完整录制起点门槛 | 已修改待验收 | 10-09 源码补门槛：重验 W，夹爪 ±1 mm 内稳定 300 ms 才写第 0 帧；已加载未提交，待实测 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/)、[新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C10"></a>**C10** | 多人共用的采集规范 | 已定位 | 通用保护与按数据集保存的任务规范分开；待实现 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="C11"></a>**C11** | 质量检查按参与侧判断 | 已修改待验收 | 10-09 改为按显式参与侧，覆盖纯旋转和夹爪为主的动作；离线通过，待实测 | [阶段四](/notes/2026/09/22/micromani-quality-and-stability/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C12"></a>**C12** | HAL 异常重启后的启动阻塞 | 离线通过 | 手动隔离遗留文件后恢复；自动恢复离线通过，真实异常重启未验证 | [HAL 专题](/notes/2026/09/29/micromani-hal-startup-recovery/) |
| <a id="C13"></a>**C13** | global 相机改为斜侧视（10-08） | 已完成 | 位置定版、收尾已确认；只看两路画面的遥操作检验未做；10-08 前后数据不混用 | [相机改位](/notes/2026/10/08/micromani-global-camera-relayout/)、[新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) |
| <a id="C14"></a>**C14** | 首次录制冷启动导致断连 | 已修改待验收 | 前端等待上限 10→60 秒（`42cce5c`）；待现场验收 | [新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) |
| <a id="C15"></a>**C15** | 右力传感 watchdog 超时锁存 | 未解决 | 10-08 右力传感不健康、因 watchdog 超时锁存；原因待核，未发解锁或运动指令 | [多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/) |
| <a id="C16"></a>**C16** | 夹爪动作未按帧时刻取值 | 已修改待验收 | 较晚的夹爪目标可能写进较早的帧；改为按时标取值，离线复现与回归通过，已加载未提交，待实测 | [采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |

## D. 数据集与数据契约
{: #D }

| 编号 | 问题 | 状态 | 现状与下一步 | 出处 |
| --- | --- | --- | --- | --- |
| <a id="D01"></a>**D01** | 图像统计溢出 | 已解决 | 统计改为浮点计算；旧数据从视频重算统计，原视频不动 | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="D02"></a>**D02** | 末帧动作异常 | 已定位 | 采集端改为停止前保存动作快照；旧数据保留原值，训练时排除该 episode | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="D03"></a>**D03** | 删除、合并后的索引一致性 | 已定位 | 文件、元数据、统计和映射要一起维护；已按现存文件重建副本 | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="D04"></a>**D04** | 片段映射与弃用追溯 | 已修改待验收 | `44ba381` 起弃用记录保留、编号不回退；训练须按清单排除弃用项 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="D05"></a>**D05** | 已有数据集续录条件 | 已修改待验收 | 续录前核对契约、参与侧、W、相机和标定；检测不到相机被物理挪动 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)、[阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="D06"></a>**D06** | 文件完整性与安全续录 | 离线通过 | 全量文件检查、写锁、原子写入；隔离候选未部署 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="D07"></a>**D07** | 109 条历史数据清单 | 已完成 | 87 条训练 / 22 条验证，按 JSON 清单读取；10-03 起用于 M04、M05 长训 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/)、[阶段八](/notes/2026/10/04/micromani-d05-day-training/) |
| <a id="D08"></a>**D08** | standard10 规范筛选 | 已完成 | 10 条、7,361 帧的可追溯基线（旧 setup） | [阶段二](/notes/2026/09/21/micromani-standardized-data-and-training/) |
| <a id="D09"></a>**D09** | 原始双臂位置旁路记录 | 已修改待验收 | 保存时另写 12 维原始位置（10 ms 周期）；新数据已生成，内容未核对 | [新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) |

## E. 模型训练与评估
{: #E }

| 编号 | 问题 | 状态 | 现状与下一步 | 出处 |
| --- | --- | --- | --- | --- |
| <a id="E01"></a>**E01** | 早期低分辨率试训 | 已完成 | 只证明训练链路能跑通，不能说明视觉性能 | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="E02"></a>**E02** | 640×480 三视角 ACT 基线 | 已完成 | 单侧 absolute 模型仍弱于 hold | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="E03"></a>**E03** | standard10 relative ACT | 已完成 | 30 步 L1 0.1315，优于 hold 0.1453 和 absolute 0.2174；首步仍弱于 hold | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="E04"></a>**E04** | usable53 relative + 时序过滤 | 已完成 | 30 步 L1 0.1258→0.1238，首步仍弱于 hold；只有一次对照 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E05"></a>**E05** | strict23 与 usable53 对比 | 待核 | 两者验证集不同，不能直接比；需固定同一验证集重做 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E06"></a>**E06** | 109 条历史数据长训 | 已完成 | M05 30 步 0.0888、首步 0.0149，均优于 hold；无动作 Dry-Run 完成，真实单步未发送 | [阶段八](/notes/2026/10/04/micromani-d05-day-training/) |
| <a id="E07"></a>**E07** | chunk 执行与重规划 | 已完成 | 开环越长越差；取第 6 步（offset=5）作候选，时间平滑无收益 | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="E08"></a>**E08** | 7D→14D 部署适配 | 离线通过 | 单元测试 9/9、1,269 个窗口回放全部通过 | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="E09"></a>**E09** | standard10 无动作试跑 | 已完成 | 20 次不发送动作，完整一轮约 13.4 Hz | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="E10"></a>**E10** | severe-mask 无动作试跑 | 已完成 | 10 次不发送动作，三路相机各取到 10 个不同帧 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E11"></a>**E11** | 旧模型真实单步 | 现场通过（单次） | 20 μm、100 μm 限幅单步有位置反馈；不是抓放验收 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E12"></a>**E12** | 旧模型连续执行 | 已结束 | 约 6 步、约 20 步后同向漂移触到范围限制，已暂停 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E13"></a>**E13** | 旧模型完整请求耗时 | 已完成 | 四次 273–648 ms，含读图、推理和 dry-run，不是控制频率 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E14"></a>**E14** | 实验基准变化 | 已完成 | 09-23 工作原点和相机变化、10-08 global 再变；各批数据按视角分开使用 | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)、[相机改位](/notes/2026/10/08/micromani-global-camera-relayout/) |
| <a id="E15"></a>**E15** | 自主抓放实机验证 | 未解决 | 还没有一次自主抓放成功；10-08 起实机暂停（见 A09） | [阶段八](/notes/2026/10/04/micromani-d05-day-training/) |
| <a id="E16"></a>**E16** | standard10 hold 指标口径 | 待核 | 阶段二记 0.1543，阶段五记 0.145326，差异来源未查 | [口径待核](/notes/2026/09/29/micromani-experiment-register/#metric-caveats) |

## 当前决定与验收顺序
{: #acceptance }

**10 月 8 日起，所有实机步骤（回 W、机械寻零、ACT 试跑）都要等 [A09](#A09) 的计数基准查清、[A04](#A04) 的大位移拒绝加上之后再继续。**之后的常规采集 / ACT 路线是：

1. **补任务规范和完整起点门槛。**本次 ACT 用 W＋26 mm、连续稳定 300–500 ms；首条、下一条、重录和恢复统一检查，检查时不自动移动设备（[C09](#C09)、[C10](#C10)）。
2. **完成软件集成与无运动验收。**冻结运行版本；Omega 来源与安全续录候选、Gap 侧别修正分别审查后集成（[B11](#B11)、[B12](#B12)、[D06](#D06)）。
3. **采 5 条完整 probe。**重新确认 W、A/B、三路相机和非活动臂；逐条核对起点、开头静止段、迟帧（目标低于 5%）、关键夹取/释放时的对齐，以及保存、弃用、回 W 和断联恢复。如需力数据，先查清力列为零的原因。
4. **probe 通过后采正式 30～40 条，再训练。**用 relative ACT，严重时序过滤作对照，归一化只用对应训练集。109 条历史清单（[D07](#D07)）和它训出的 M05 是离线资产，不能代替新 V1 验收。
5. **新模型重新经过离线审计、无动作试跑和有边界的实机验收**，自主抓放的成败单独记录（[E15](#E15)）。

**GPT 视觉抓取**已结束。若以后重启，前提是：先建立可检验的接触高度观测，区分空载载荷与接触，统一执行保护和减载退出；验收以一次可靠抬升的多视角证据为准（[B01](#B01)）。

**排在 V1 之后的事：**师弟的 ALOHA / ACT-JEPA 路线保留为对照候选，正式比较时统一数据、划分、输入、动作定义、训练预算和评估方法（当时旧数据迟帧约 47.8%，没有独立验证集）；训练吞吐已有单机 batch 测量（见[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)），跨模型和 RTX 3090 / A6000 的公平对照未做。

## 版本与候选快照
{: #versions }

<details markdown="1">
<summary>展开：各工作区与提交的版本记录</summary>

| 对象 | 记录中的版本 | 已有证据与边界 |
| --- | --- | --- |
| 早期采集可靠性工作区 | `yxp/recording-reliability-20260923` / `b06842c`，14 个未提交文件 | 未完成对应回归和 C++ 编译；不能继承后期候选的测试结果 |
| 后期 Omega / 续录候选 | `codex/omega-source-safe-resume`，基于 `44ba381`，22 个未提交文件 | 已有隔离离线验证，尚未合并部署；不等于完整起点门槛和 Gap 端点界面已完成 |
| 工控机 MicroMani 主仓库 | 9 月 29 日此前核对到 `xie/c2f4a41` | 是源码快照；启动专题当时记为尚未推送，不能据此确认当前远端或运行二进制 |
| 工控机 MicroMani 主仓库（2026-10-09 补记） | `xie/42cce5c`（10-08），另有 33 个修改、18 个新增的未提交文件；HalServer 与后端 10-09 14:53 启动 | 只读查看提交与文件时间；未核对运行二进制对应哪份源码，未提交改动不算已验收，见[补记](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) |
| 工控机 MicroMani 主仓库（2026-10-10 补记） | 远端 `xie/2a99555`（10-10 推送五个拆分提交，父 `42cce5c`）；工作区另有 49 个改动 / 未跟踪文件，含 C03/C04/C09/C11/C16 完整性修复（10-09 21:06 后端已加载） | 远端分支 10-10 用 `git ls-remote` 核对；运行版本 = 已推送提交 + 未提交改动，正式采集前需冻结，见[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| 连接与寻零专题 | 公开 `xie/400cde0` 固定源码证据 | 是另一轮源码审计范围，不代表生产目录回退或正在运行该版本 |

版本出处见[数据续录记录](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/)、[寻零专题](/notes/2026/09/23/micromani-homing-completion-semantics/)和[HAL 专题](/notes/2026/09/29/micromani-hal-startup-recovery/)。本次只核对笔记仓库，没有重查上述机器人工作区、构建产物或设备。

</details>
