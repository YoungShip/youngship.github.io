---
title: "MicroMani 问题与验收台账：状态、证据与后续门槛"
date: "2026-09-29"
last_modified_at: "2026-10-17"
description: "每个问题一行：当前状态、现状与下一步、出处。查某个问题解决没有、还差什么验收，从这里开始。"
category: 笔记
tags: [科研记录, MicroMani, 科研索引]
---

[科研总览](/notes/2026/09/23/micromani-research-overview/) · [问题与验收台账](/notes/2026/09/29/micromani-research-status/) · [实验与数据索引](/notes/2026/09/29/micromani-experiment-register/)

**更新至 2026-10-17。**每个问题占一行，只写现在的状态和下一步；过程、证据和历次补记在“出处”链接的原文里。编号固定不变，新问题接在各组末尾。

**当前最要紧的：**五个基线的正式实机比较已完成（[E27](#E27)）：ACT 19/20、π0.5 15/20、DP 9/20、OFT 8/20、SmolVLA 7/20。接下来补测按官方配方重训的 SmolVLA 和 OFT（[E28](#E28)）、去掉重试示范的 ACT 和 DP（[E29](#E29)），补测前工作原点、相机和零件区域不动。夹爪实测反馈和固态硬盘运行目录只在部署分支上（[B24](#B24)、[B25](#B25)），未合入 `xie`。模型仍不会按零件位置对准（[E18](#E18)）。硬件右臂的多圈规划（[A04](#A04)、[A09](#A09)）仍未解决，只在硬件左臂上做实机。

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
| <a id="A04"></a>**A04** | 旋转轴绕圈 / 回 W 多圈规划 | 未解决 | 10-08 普通回 W 给 Roll 规划约 −1732°，现场急停；普通回 W 没有总转动量检查；同日 15:23 Card 0 又被请求回 W（规划 Roll 约 −1692°），约 2 s 后急停取消（用户在另一页面点的）。关闭条件：大位移 fail-closed 拒绝、故障注入测试、现场安全验收 | [阶段三](/notes/2026/09/22/micromani-homing-reference/)、[多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/) |
| <a id="A05"></a>**A05** | 寻零中途的 pulse 被存成参考 | 已修改待验收 | 公开源码 `400cde0` 已按“接受、完成、停止、新鲜反馈”四层判断完成；待完整真机验收 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A06"></a>**A06** | X/Z 等轴找不到 HOME | 未解决 | 会一直走到端部或超时；需核对 HOME 输入、方向、限位逻辑和轴映射 | [阶段三](/notes/2026/09/22/micromani-homing-reference/)、[寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A07"></a>**A07** | 限位端作为机械参考 | 已修改待验收 | 已有显式正限位模式（起点 EL+ 无效、终点有效且停稳）；重复定位精度未测 | [阶段三](/notes/2026/09/22/micromani-homing-reference/)、[寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A08"></a>**A08** | 顺序寻零与参考实例绑定 | 离线通过 | `c0bfbb4` 起一轴完成再启动下一轴；实例绑定检测不到计数复位（见 A09）；待现场验收 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A09"></a>**A09** | 保存的 W 与控制卡计数基准失配 | 未解决 | 10-08 硬件右臂回 W 时当前计数为 0，W 仍是 09-24 的多圈计数；归零原因待核，右臂禁止回 W、寻零或取模修正。10-10 起只在硬件左臂恢复实机 | [多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/)、[阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/) |
| <a id="A10"></a>**A10** | 硬件左臂竖直工作原点（10-11） | 现场通过（单次） | 竖直朝下、零件上方 5～10 mm，Roll 为机械原点 +93°；之后多次回 W 均为小幅移动。左臂计数基准是否连续未专门核对 | [阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/) |
| <a id="A11"></a>**A11** | 寻零已完成却被后端判失败 | 离线通过 | 完成后第一次读到无效采样就跳出 2 秒等待；改为只对这一种异常在期限内重读（`a093a8b`，10-12 已推送），4 个新场景离线通过；修复后的实机寻零还没做过 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="A12"></a>**A12** | 旋转软限位以机械参考点为基准 | 已定位 | 10-08 硬件左 Roll 在工作角度约 38° 处被拒（界面配置写 95°）：限位 = 机械软限位 ∩（`homeReference` ＋ 配置范围），不是相对工作原点；该轴参考在当前 HAL 实例未逐轴确认，限位计算也不检查这一点 | [D05 实机](/notes/2026/10/08/micromani-d05-act-live-empty-grasp/) |

## B. 遥操作与控制链路
{: #B }

| 编号 | 问题 | 状态 | 现状与下一步 | 出处 |
| --- | --- | --- | --- | --- |
| <a id="B01"></a>**B01** | GPT 视觉直接控制与力保护 | 已结束 | 没有抓起零件；接触停止和恒力未验收；代码已撤回，日志留档 | [GPT 复盘](/notes/2026/09/29/micromani-gpt-grasp-closeout/) |
| <a id="B02"></a>**B02** | 操作者侧与硬件侧映射 | 已定位 | 操作者左右与硬件左右相反；参与侧、数据契约和日志须用一致的侧别；平时“硬件左臂”指常用来抓取的 Card 1（操作者右臂），硬件右臂 Card 0 平时不用。10-08 要摆正的是 Card 0，说法却是“硬件左臂”，结果 Card 1 实际做了寻零；动作前要用卡号和现场指认确认 | [阶段三](/notes/2026/09/22/micromani-homing-reference/)、[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)、[多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/) |
| <a id="B03"></a>**B03** | 主手连接副作用与失败回滚 | 已修改待验收 | 连接前检查主手与反馈新鲜度，禁止隐式使能，失败撤销连接；待现场验收 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/) |
| <a id="B04"></a>**B04** | 运动反馈真实性与停止结果 | 已修改待验收 | 保留真实采样时间、提高脉冲 JSON 精度、停止失败显式报错；停止能力需现场核验 | [寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/)、[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="B05"></a>**B05** | DDS 命令应答并发 | 离线通过 | 应答按 `request_id` 关联，未见租约请求抢走普通命令的应答 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="B06"></a>**B06** | DDS 应答超时与通道隔离 | 已修改待验收 | 去掉阻塞输出、按完成时刻判超时、读取线程复用（10-08～10）；仍有少量通道忙告警，待持续现场验收 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)、[新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/)、[迟帧排查](/notes/2026/10/11/micromani-late-frame-root-cause/) |
| <a id="B07"></a>**B07** | backend 代为续 HAL 租约 | 临时方案 | 减少界面抖动导致的误断控，但“连接还在”不代表界面还活着；需配合 B08 | [阶段四](/notes/2026/09/22/micromani-quality-and-stability/) |
| <a id="B08"></a>**B08** | 浏览器活性检测 | 未解决 | watchdog 仍按连接会话判健康，独立的浏览器心跳没有实现 | [阶段四](/notes/2026/09/22/micromani-quality-and-stability/)、[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="B09"></a>**B09** | 主从夹爪开度不一致 | 未解决 | 见过目标 26 mm、实际约 12 mm、半秒后才追上；漏跟随或标定偏差未排除 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="B10"></a>**B10** | 主手姿态与夹持输入间歇冻结 | 未解决 | XYZ 在变而姿态和夹持输入停住；设备、SDK 还是读取链路的问题未区分 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="B11"></a>**B11** | Omega 开度来源全链路记录 | 离线通过 | 开度来源随数据落盘；隔离候选未部署 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="B12"></a>**B12** | Gap 标定参数侧别 | 已定位 | 界面按操作者侧选参数，HAL 按硬件侧解析；旧工作区有候选修正，未集成 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="B13"></a>**B13** | 主手重力补偿在边缘抽搐 | 现场通过（单次） | 手柄放进标定孔重新标定后消失，原因为推断；开机前先把手柄放进标定孔 | [Omega 抽搐](/notes/2026/10/09/micromani-omega-calibration-twitch/) |
| <a id="B14"></a>**B14** | 双侧夹爪串口互相阻塞 | 已修改待验收 | 两侧调度分离、阻塞后只执行最新目标（`a5deb6a`）；用户反馈夹爪灵敏，未重复验收 | [新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) |
| <a id="B15"></a>**B15** | 回 W 期间运动遥测停更 | 已修改待验收 | 锁内等待运动完成导致遥测停更、界面报“WS 不可用”；改为等待中读真实位置，当天部署，未做回 W 实机复验 | [迟帧排查](/notes/2026/10/11/micromani-late-frame-root-cause/) |
| <a id="B16"></a>**B16** | 策略接口重复使能导致连续动作被拒 | 现场通过（单次） | 已使能时不再重复使能（`d0ec8de`，10-12 已推送）；两天约 11 次实机运行正常，未做专门验收 | [实机软件专题](/notes/2026/10/11/micromani-live-control-software-fixes/) |
| <a id="B17"></a>**B17** | 策略接口在夹爪开关关闭时静默跳过夹爪 | 临时方案 | 急停会关掉夹爪使能，之后模型的夹爪目标不下发；实机脚本补发使能命令绕过，主程序未改 | [实机软件专题](/notes/2026/10/11/micromani-live-control-software-fixes/) |
| <a id="B18"></a>**B18** | Pitch 软限位 0～0 使 HAL 拒绝所有目标 | 临时方案 | HAL 要求最小值小于最大值；改为 ±0.1° 等效锁住 | [实机软件专题](/notes/2026/10/11/micromani-live-control-software-fixes/) |
| <a id="B19"></a>**B19** | 配置文件被占用致主手连接 / 断开失败 | 临时方案 | RDC 子进程占用 `config.json`，保存被拒、前端报 Failed to fetch；重启 RDC 恢复一次后复发；重试逻辑 10-13 已提交推送（`d45d421`）。10-08 ACT 实机时已出现同类 `WinError 5`（动作已下发后保存失败返回 500），替换重试和“动作可能已开始”的 503 是那时的前序 Codex 会话写的 | [采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/)、[D05 实机](/notes/2026/10/08/micromani-d05-act-live-empty-grasp/) |
| <a id="B20"></a>**B20** | DDS 应答返回约 300 ms | 未解决 | 10-08 执行循环里每步约 290 ms 等应答，HAL 约 17 ms 已回复；延长发现、关 OpenMP 忙等、换 Python、请求后等待、加大应答历史均无效；连续执行停在约 2.97 Hz | [D05 实机](/notes/2026/10/08/micromani-d05-act-live-empty-grasp/) |
| <a id="B21"></a>**B21** | Health 主题收不到 | 现场通过（单次） | 接收历史深度 1 改为 32 后三次只读连接都在 0.4 s 内收到；为何深度 1 收不到未从机制上查清 | [D05 实机](/notes/2026/10/08/micromani-d05-act-live-empty-grasp/) |
| <a id="B22"></a>**B22** | 策略动作请求被夹爪串口命令拖慢 | 现场通过（单次） | 一次请求约 120 ms、夹爪占约 93 ms；带 `gripperAsync` 时夹爪后台下发、只留最新目标（`4c98be4`），降到约 36 ms，15 次时间集成实机正常 | [迟帧与时延专题](/notes/2026/10/12/micromani-backend-stall-shm-capture/) |
| <a id="B23"></a>**B23** | 策略请求偶发 503“运动状态通道忙” | 临时方案 | 通道容量 2，忙时拒绝且未执行；实机脚本跳过该步、连续 5 次才停；触发条件未查 | [迟帧与时延专题](/notes/2026/10/12/micromani-backend-stall-shm-capture/) |
| <a id="B24"></a>**B24** | 夹爪“开度”用的是命令值而非实测 | 现场通过（单次） | 10-16 部署分支改为 HAL 单独线程只读采样实测开度，后端校验来源、有效性和时效（≤200 ms）；验收运行 226/226 观测为实测；正式 100 次中夹爪命令最长 254 ms，实测反馈有效率没有单独统计。只在部署分支（`49a64ad`），未合入 `xie`；关闭条件：合入主线并在主程序上重新验收 | [阶段十一](/notes/2026/10/13/micromani-dp-pi05-offset-data-faithful-baselines/)、[阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| <a id="B25"></a>**B25** | 夹爪命令偶发 1.2～2.6 秒停顿 | 临时方案 | 后端每条夹爪命令同步写配置（带 fsync）、HAL 同步写日志，在机械硬盘上出现秒级长尾（最长 1.5 s、0.7 s），底层原因未细分；运行目录换到固态硬盘后 p99 约 2 s→0.1 s，正式 100 次最长 254 ms。只换了目录，没改掉同步写盘；关闭条件：写盘移出命令路径并在主线验收 | [阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| <a id="B26"></a>**B26** | 结束时末端太低，下一次启动被力预警拦 | 临时方案 | 部署脚本在正常结束后交出策略控制权、抬高 5 mm、回原点再急停（`371c48e`、`acdb808`，部署分支）；正式实验仍有 5 次启动被拦，都在力超限停止（这类停止不做抬臂收尾）之后的一两次内（其中两次前一次已正常收尾，原因未明），去皮后重跑、不计入。主程序侧没有改 | [阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |

## C. 数据采集与系统稳定性
{: #C }

| 编号 | 问题 | 状态 | 现状与下一步 | 出处 |
| --- | --- | --- | --- | --- |
| <a id="C01"></a>**C01** | 三路相机 30 FPS 与设备绑定 | 真机验收通过 | 120 秒统计和后续录制均稳定约 30 FPS；更长时间、更高负载未覆盖；09-22 曾因默认绑定被覆盖失效（[C24](#C24)） | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="C02"></a>**C02** | 保存的视频周期卡顿 | 现场通过（单次） | 原因是垃圾回收长暂停和编码积压；编码隔离后实机录制无可见卡顿 | [阶段一](/notes/2026/09/20/micromani-research-log/) |
| <a id="C03"></a>**C03** | 结束、丢弃、复位竞态 | 已修改待验收 | 多处时序已修；10-09 改为尾帧排空后再停夹爪采样；10-11 提交、10-12 已推送，待实测 | [阶段一](/notes/2026/09/20/micromani-research-log/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C04"></a>**C04** | 夹爪反馈迟到与迟帧 | 已修改待验收 | 主要卡在等夹爪反馈，定位到实时历史在夹爪锁内序列化并已修正；修正后单条 3/1274（非受控、已作废），待多条录制验证。10-11 另查明对齐超限只来自夹爪和运动控制，夹爪线程串行发命令、读两侧，单轮近 50 ms（见 C25） | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)、[新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/)、[迟帧排查](/notes/2026/10/11/micromani-late-frame-root-cause/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/)、[采集中断专题](/notes/2026/09/22/micromani-recording-interruption-regression/)、[迟帧与时延专题](/notes/2026/10/12/micromani-backend-stall-shm-capture/) |
| <a id="C05"></a>**C05** | 录完后约 16.7 秒状态停顿 | 未解决 | 触发链路清楚（状态停顿→租约失效→急停），根因未知；后续 15 分钟监测未复发 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="C06"></a>**C06** | 成功的 767 帧示教 | 待核 | 抓放成功，但放置阶段有 3 个夹爪对齐超限点（50–63 ms），先不入训 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="C07"></a>**C07** | GPT 动作转训练标签 | 已结束 | GPT 动作未接入录制器的动作来源，随 GPT 路线结束 | [GPT 复盘](/notes/2026/09/29/micromani-gpt-grasp-closeout/) |
| <a id="C08"></a>**C08** | 录制开头保留静止画面 | 已修改待验收 | 操作规范：显示录制中后主手静止约 0.5 秒再开始；待数据验收 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="C09"></a>**C09** | 完整录制起点门槛 | 已修改待验收 | 10-09 源码补门槛：重验 W，夹爪 ±1 mm 内稳定 300 ms 才写第 0 帧；10-11 提交、10-12 已推送。10-11 采集中按设计拦下夹爪未张开的起点（单次） | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/)、[新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/)、[阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/) |
| <a id="C10"></a>**C10** | 多人共用的采集规范 | 已定位 | 通用保护与按数据集保存的任务规范分开；待实现 | [阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| <a id="C11"></a>**C11** | 质量检查按参与侧判断 | 已修改待验收 | 10-09 改为按显式参与侧，覆盖纯旋转和夹爪为主的动作；离线通过；10-11 提交、10-12 已推送，待实测 | [阶段四](/notes/2026/09/22/micromani-quality-and-stability/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C12"></a>**C12** | HAL 异常重启后的启动阻塞 | 离线通过 | 手动隔离遗留文件后恢复；自动恢复离线通过，真实异常重启未验证 | [HAL 专题](/notes/2026/09/29/micromani-hal-startup-recovery/) |
| <a id="C13"></a>**C13** | global 相机改为斜侧视（10-08） | 已完成 | 位置定版、收尾已确认；只看两路画面的遥操作检验未做；10-08 前后数据不混用 | [相机改位](/notes/2026/10/08/micromani-global-camera-relayout/)、[新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) |
| <a id="C14"></a>**C14** | 首次录制冷启动导致断连 | 已修改待验收 | 前端等待 10→60 秒；10-09 续期请求发出前过期致断连，依赖改为启动时预热，原超时未复现；待现场验收 | [新视角试采](/notes/2026/10/09/micromani-collection-fixes-trial-recording/)、[迟帧排查](/notes/2026/10/11/micromani-late-frame-root-cause/) |
| <a id="C15"></a>**C15** | 右力传感 watchdog 超时锁存 | 未解决 | 10-08 右力传感不健康、因 watchdog 超时锁存；原因待核；同日下午 COM14 端口在但无有效帧，重新插拔后恢复约 1000 Hz 并去皮通过一次，之后又因静置 Fx 抖动 0.055 N（门限 0.05）自检失败 | [多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/) |
| <a id="C16"></a>**C16** | 夹爪动作未按帧时刻取值 | 已修改待验收 | 较晚的夹爪目标可能写进较早的帧；改为按时标取值，离线通过；10-11 提交、10-12 已推送。D07 录于修复后，可回查，尚未核对 | [采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C17"></a>**C17** | 起点夹爪未张开要去遥操作页处理 | 已修改待验收 | 开始前低于 25 mm 弹窗、可一键张开（`4f41724`，10-12 已推送）；已打包，未在界面验证 | [实机软件专题](/notes/2026/10/11/micromani-live-control-software-fixes/) |
| <a id="C18"></a>**C18** | 复位间隙报“夹爪反馈过期” | 现场通过（单次） | HAL 只在遥操作运行时读夹爪，警告全部出在复位后重启时，录制中过期为 0；遥操作停止时不再告警（`e8d1e61`）。10-11 22:12 重启后端后复位间隙未再出现，未做长时间验证 | [实机软件专题](/notes/2026/10/11/micromani-live-control-software-fixes/) |
| <a id="C19"></a>**C19** | 安全中断后重试混入上一次尝试的帧 | 已修改待验收 | y2144 ep22 实际 763 帧、记录 636 帧；10-09 22:47 起保存前核对帧数，ep22 已隔离、未入训；10-13 提交推送（`2616188`） | [采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C20"></a>**C20** | 录制准备阶段主从运动未锁住 | 已修改待验收 | 10-09 22:11 起准备阶段 HAL 不放行运动与夹爪命令，就绪后放行；部署时未做实机运动测试；10-13 提交推送（`4473917`） | [采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| <a id="C21"></a>**C21** | 悬空静置时力 / 力矩超过解锁门槛 | 未解决 | 10-09 硬件左 Fy −2.005 N、Mx 0.0274 N·m 均超；零点、线缆、自重未区分；之后锁存曾解除。10-16 两次观察到参与侧侧向约 1.9 N、约 1.3～1.4 N 时解锁被拒，另一侧读数没有记录；阈值由 HAL 从 config.json 的 fxyWarnN 读取，实际加载值待核（见 [B26](#B26)） | [采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/)、[阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| <a id="C22"></a>**C22** | 对齐超限被升级成停机（09-21 `d18b523`） | 现场通过（单次） | 有效但超限的帧照常写入并逐帧记录，缺失或真正过期仍拒绝（`cd0e259`）；09-22 一次约 3 分钟录制未再中断，长时间与双侧未验证 | [采集中断专题](/notes/2026/09/22/micromani-recording-interruption-regression/) |
| <a id="C23"></a>**C23** | 录制未处理时回工作原点停掉夹爪反馈 | 已修改待验收 | 录制启动、进行、中断未处理、保存或丢弃中拒绝回 W（`0d21df3`，后端 409）；未做实机验证 | [采集中断专题](/notes/2026/09/22/micromani-recording-interruption-regression/) |
| <a id="C24"></a>**C24** | 顶部相机默认绑定被旧 USB 路径覆盖 | 现场通过（单次） | 恢复按序列号认顶部、左右腕按画面确认（`6dce89f`），三路约 30 FPS；配置为何退回旧路径未查清；换口、重插、缺设备未验证 | [相机绑定恢复](/notes/2026/09/22/micromani-camera-identity-restore/) |
| <a id="C25"></a>**C25** | 夹爪对齐上限 50 ms 常被踩线 | 临时方案 | 夹爪串口线程发命令约 28 ms、读两侧开口各约 15 ms，单轮中位约 48 ms；上限放宽到 70 ms（`6dca631`），只读参与侧才是根治，未做 | [迟帧与时延专题](/notes/2026/10/12/micromani-backend-stall-shm-capture/) |
| <a id="C26"></a>**C26** | 后端主进程周期停顿致迟帧 | 现场通过（单次） | 10-14 看门狗抓到根因：事件循环里同步写日志；改后台写入（`7593c75`）后每条迟帧 1～21→0～1、当晚不再中断；配置读写只要 1～4 ms，已排除。待几批数据无 0.6 s 以上停顿再关 | [迟帧与时延专题](/notes/2026/10/12/micromani-backend-stall-shm-capture/)、[同步写日志专题](/notes/2026/10/14/micromani-event-loop-logging-stall/) |
| <a id="C27"></a>**C27** | 相机共享内存独立进程采集 | 现场通过（单次） | 每相机一个子进程、共享内存传原始画面（`0e59d3c`），10-12 起默认启用（`d9315e9`）；上线后 3 条录制迟帧 0～1、一天实机正常，未做长时间采集验收 | [迟帧与时延专题](/notes/2026/10/12/micromani-backend-stall-shm-capture/) |
| <a id="C28"></a>**C28** | 页面刷新时 WebSocket 推送日志积压 | 已定位 | 连接时把最多 5000 条历史日志逐条压缩后发出，事件循环停 0.3～0.75 s；大 JSON 序列化同理；不在录制中，未改 | [同步写日志专题](/notes/2026/10/14/micromani-event-loop-logging-stall/) |
| <a id="C29"></a>**C29** | 跳过复位 / 开始会话失败时界面无反应 | 现场通过（单次） | 失败时显示原因和读数，并给“张开夹爪”按钮（`70c5ab6`、`40d4da6`）；准备阶段先锁夹爪再检查开度的顺序没改 | [同步写日志专题](/notes/2026/10/14/micromani-event-loop-logging-stall/) |
| <a id="C30"></a>**C30** | “参与设备反馈需复核”几乎每条都亮 | 现场通过（单次） | 复核规则改为超限帧 ≥1% 或单帧 ≥100 ms（`917513d`）；弹窗改按后端评估、保存后打开不再丢字段（`177e6fa`、`b5db872`） | [同步写日志专题](/notes/2026/10/14/micromani-event-loop-logging-stall/) |
| <a id="C31"></a>**C31** | 数据集列表接口 168.6 MB、52 s | 已解决 | 列表只带前 20 条告警和总数（`1a0736c`），实测 12.3 MB、1.5 s | [同步写日志专题](/notes/2026/10/14/micromani-event-loop-logging-stall/) |
| <a id="C32"></a>**C32** | 已在工作原点仍要求点“自动回工作原点” | 已定位 | 采集前硬件检查可改为只读核对是否在原点；排在正式评估之后 | [同步写日志专题](/notes/2026/10/14/micromani-event-loop-logging-stall/) |

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
| <a id="E06"></a>**E06** | 109 条历史数据长训 | 已完成 | M05 30 步 0.0888、首步 0.0149，均优于 hold；无动作 Dry-Run 完成，真实单步未发送；10-08 晚已连续上实机，见 [E19](#E19) | [阶段八](/notes/2026/10/04/micromani-d05-day-training/) |
| <a id="E07"></a>**E07** | chunk 执行与重规划 | 已完成 | 开环越长越差；取第 6 步（offset=5）作候选，时间平滑无收益 | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="E08"></a>**E08** | 7D→14D 部署适配 | 离线通过 | 单元测试 9/9、1,269 个窗口回放全部通过 | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="E09"></a>**E09** | standard10 无动作试跑 | 已完成 | 20 次不发送动作，完整一轮约 13.4 Hz | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| <a id="E10"></a>**E10** | severe-mask 无动作试跑 | 已完成 | 10 次不发送动作，三路相机各取到 10 个不同帧 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E11"></a>**E11** | 旧模型真实单步 | 现场通过（单次） | 20 μm、100 μm 限幅单步有位置反馈；不是抓放验收 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E12"></a>**E12** | 旧模型连续执行 | 已结束 | 约 6 步、约 20 步后同向漂移触到范围限制，已暂停 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E13"></a>**E13** | 旧模型完整请求耗时 | 已完成 | 四次 273–648 ms，含读图、推理和 dry-run，不是控制频率 | [阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| <a id="E14"></a>**E14** | 实验基准变化 | 已完成 | 09-23 工作原点和相机变化、10-08 global 再变；各批数据按视角分开使用 | [阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)、[相机改位](/notes/2026/10/08/micromani-global-camera-relayout/) |
| <a id="E15"></a>**E15** | 自主抓放实机验证 | 现场通过（单次） | 10-12 fixed2 固定位置：示范速度 7 次成功 6 次，时间集成 15 次成功 8 次；零件凭感觉放在格子中间，只在同一点附近，不能推广；10-11 时只有一次位置巧合的抓放 | [阶段八](/notes/2026/10/04/micromani-d05-day-training/)、[阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/)、[阶段十](/notes/2026/10/12/micromani-fixed-position-live-ensemble/) |
| <a id="E16"></a>**E16** | standard10 hold 指标口径 | 待核 | 阶段二记 0.1543，阶段五记 0.145326，差异来源未查 | [口径待核](/notes/2026/09/29/micromani-experiment-register/#metric-caveats) |
| <a id="E17"></a>**E17** | y2144 比 hold 只好约 16% | 已完成 | 不是条数问题（D05 抽 40 条约 36%）；原因是 Pitch 限位噪声、Roll 大转与回调、抓取角度两种做法 | [阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/) |
| <a id="E18"></a>**E18** | 模型不会按零件位置对准 | 未解决 | yxp_1011_v1 上基线与 6 种改法都在 22～24%，起点预测与零件位置无关；固定位置数据后合夹爪点仍成簇、不随零件移动；10-14 补采的重试 30 条（D10）、偏移 20 条（D11）已用于五基线训练。正式比较的 10 个位置在约 6×6 mm 内（3 mm 网格），示范主体只在约 4×6 mm 内，不能说明位置泛化；位置间成功率差别用“离示范中心多远”解释不了，每格 10 次可能只是波动 | [阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/)、[阶段十](/notes/2026/10/12/micromani-fixed-position-live-ensemble/)、[阶段十一](/notes/2026/10/13/micromani-dp-pi05-offset-data-faithful-baselines/)、[阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| <a id="E19"></a>**E19** | M05 连续实机闭环（10-08） | 已完成 | 硬件左臂 13 段运行；屏蔽 Z 下探后 132 个动作闭合到 1.12 mm、抬升约 1.1 mm，空抓；流式执行 910 次应答、稳态约 2.97 Hz。结果含 Z 单向约束、夹爪增量累积等执行改写，不是模型原始行为 | [D05 实机](/notes/2026/10/08/micromani-d05-act-live-empty-grasp/) |
| <a id="E20"></a>**E20** | 固定位置数据五个对比模型 | 已完成 | 第二轮 fixed2 / near2 整段约 31%、第 5 步约 16%、第 1 步 −24% / −30%；加位置相近旧数据无明显收益 | [阶段十](/notes/2026/10/12/micromani-fixed-position-live-ensemble/) |
| <a id="E21"></a>**E21** | 时间集成执行 | 已完成 | 直接缩短步长会因动作标签超前而越走越快；k = −0.01、提前 2 帧的时间集成每步约 80 ms，单次约 13 s，15 次成功 8 次；k > 0 未试 | [阶段十](/notes/2026/10/12/micromani-fixed-position-live-ensemble/) |
| <a id="E22"></a>**E22** | 失败集中在第二个固定落点 | 待核 | 失败多落在偏约 3 mm、高约 1.5 mm 的另一点；白色标记离线已排除，全局相机被碰歪是主要嫌疑但无对照 | [阶段十](/notes/2026/10/12/micromani-fixed-position-live-ensemble/) |
| <a id="E23"></a>**E23** | Diffusion Policy（改编配方）对比 | 已完成 | D08 上整段约 16～19%、D09 上约 25%，比同数据 ACT 低 5～8 个百分点；接近零件时步幅接近示范、与剩余距离相关 0.73 / 0.61 | [阶段十一](/notes/2026/10/13/micromani-dp-pi05-offset-data-faithful-baselines/) |
| <a id="E24"></a>**E24** | DP08 实机抓放 | 现场通过（单次） | 两轮 15 次完成 9 次；没夹到不会重试；零件位置未逐次核对，不能与 ACT 成功率直接比 | [阶段十一](/notes/2026/10/13/micromani-dp-pi05-offset-data-faithful-baselines/) |
| <a id="E25"></a>**E25** | π0.5 微调 | 已完成 | 按 openpi 默认 batch 32 × 3 万步训完，在官方示例范围内；正式比较 15/20，15 次成功全是第一次就抓住，失败为合空 3、挤出 2；在训练服务器上推理约 0.4 s（含往返） | [阶段十一](/notes/2026/10/13/micromani-dp-pi05-offset-data-faithful-baselines/)、[阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| <a id="E26"></a>**E26** | 按原版配方复现 DP、ACT 基线 | 已完成 | 按原配方训完（DP 600 轮取最后一轮 EMA、ACT 5000 轮按验证集选最好一轮，同一 131 / 18 划分）；正式比较 ACT 19/20、DP 9/20。部署偏差：实际发令约 5.7～8 次/秒（DP 约 5.7）低于官方频率，ACT 用异步整段执行而非时间集成 | [阶段十一](/notes/2026/10/13/micromani-dp-pi05-offset-data-faithful-baselines/)、[阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| <a id="E27"></a>**E27** | 五基线正式实机比较 | 已完成 | 10 个位置 × 2 次 × 5 模型，用户现场判定：ACT 19/20、π0.5 15/20、DP 9/20、OFT 8/20、SmolVLA 7/20；ACT 明显好于 DP、OFT、SmolVLA，与 π0.5 无明显差别；失败 32/42 为合空；程序“放下”判定不可信（91 次只 58 次成功）。非盲、每模型 20 次、托盘有白色参照点，均记为限制 | [阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| <a id="E28"></a>**E28** | SmolVLA、OFT 按官方配方重训 | 待核 | 原训练每步样本只有官方的 1/2、1/8（SmolVLA 的 batch 32 是 10-15 下午定的），原结果保留作对照；从头重训：SmolVLA batch 64 × 2 万步（约 10-17 下午完成），OFT 全局 batch 32 × 10 万步双卡（1/4 处约 10-18，训完约 10-22）；SmolVLA 已于 10-17 13:21 训完；完成后各补测 20 次，补测前部署程序要改为加载新检查点；OFT 1/4 处的中途存档先实测看方向，次数待定；OFT 只改了批量、步数和学习率，FiLM 等其余偏差不变 | [阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| <a id="E29"></a>**E29** | 去掉失败重试示范的对照 | 待核 | 131 条训练示范有 26 条带失败重试，首次合爪偏开中位 3.3 mm、多为 +y，推断教了“先偏开抓”；去掉后剩 105 条，ACT、DP 同配方重训后各测 20 次（DP 10-17 03:28 在服务器、ACT 10-17 14:02 在工控机开训）。第一次就抓住的比例明显提高、合空明显减少才支持推断；对照值：原版 ACT 首抓 15/20、合空共 7 次，原版 DP 首抓 5/20 | [阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |

## 当前决定与验收顺序
{: #acceptance }

> **2026-10-17 补记：**10-16 晚至 10-17 凌晨完成五基线正式实机比较（[E27](#E27)），比较前在部署分支上修了夹爪停顿和夹爪实测反馈（[B24](#B24)、[B25](#B25)）。中期暂按这五个基线（助手建议，用户未表态；以后要加首选 GR00T，换不换先问导师）；用户同意 SmolVLA、OFT 按官方配方从头重训后补测（[E28](#E28)），并做去掉重试示范的 ACT、DP 对照（[E29](#E29)）。补测沿用同一协议和位置（顺序待定），工作原点、相机和零件区域不动；部署分支合入 `xie` 需用户批准。中期报告的下一步方向建议按“精度和可靠性优先、泛化其次”，待与导师确认。见[阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/)。

> **2026-10-14 补记：**偏移和重试示范已补采（D10、D11）。中期报告改为在同一任务上比较 ACT、DP、π0.5、SmolVLA 四种动作头；DP 和 ACT 必须按原论文和开源代码的配方复现才作为基线，两组 10-14 已开训。10 月 16～18 日在同样 10 个固定零件位置上正式实机评估，结果按“对准、夹住、抬起、放置”分阶段记录；评估前工作原点、相机和零件区域不动。见[阶段十一](/notes/2026/10/13/micromani-dp-pi05-offset-data-faithful-baselines/)。

> **2026-10-13 补记：**固定位置采集、对比训练和实机测试已完成，结果见[阶段十](/notes/2026/10/12/micromani-fixed-position-live-ensemble/)。用户决定不再精确复位全局相机，下一步补采带偏差和重试的示范；实机仍只在硬件左臂，A04、A09 的关闭条件不变。

> **2026-10-11 补记：**10 月 10 日起用户决定在**硬件左臂**上恢复回 W 和 ACT 实机，重设了竖直工作原点并采了新数据，实机靠脚本里的高度、范围和力限保护；[A04](#A04)、[A09](#A09) 的关闭条件不变，硬件右臂仍不回 W、不寻零。下一步改为：固定位置采集 → 两个模型对比 → 固定位置实机 10 次（见[阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/)的“下一步”）。工控机日志显示 10-09 21:37 已有一次硬件左臂回 W，y2144 也在 10-09 晚录制，所以“10 月 10 日起”只对 ACT 实机成立，左臂的回 W 和遥操作采集 10-09 已在进行；何时决定恢复没有记录。

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
| 工控机 MicroMani 主仓库（2026-10-10 补记） | 远端 `xie/2a99555`（10-10 推送：以 `42cce5c` 为基线拆成五个连续提交，止于 `2a99555`）；工作区另有 49 个改动 / 未跟踪文件，含 C03/C04/C09/C11/C16 完整性修复（10-09 21:06 后端已加载） | 远端分支 10-10 用 `git ls-remote` 核对；运行版本 = 已推送提交 + 未提交改动，正式采集前需冻结，见[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| 工控机 MicroMani 主仓库（2026-10-11 补记） | 本地 `xie` 在 `2a99555` 之上新增 `e8d1e61`、`d0ec8de`、`4f41724`（按功能拆分，均未推送）；工作区仍有 32 个修改、17 个未跟踪文件，含 C03/C09/C11/C16 修复 | 三个提交各自在 HEAD 临时检出上验证；`e8d1e61` 需重启后端、`4f41724` 需刷新页面才生效，见[实机软件专题](/notes/2026/10/11/micromani-live-control-software-fixes/)。同日 18:00 又本地提交四项完整性修复（`d5c694c`、`8d566ca`、`2647e07`、`fb8e86c`），`xie` 领先远端 7 个提交；19:00 左右推送失败（SSH 连接被关闭），10-11 核对远端仍为 `2a99555`；10-09 晚部署的回 W 确认重试、录制起点保持（含 HAL）、录制进度、中断丢弃四处改动仍只在工作区并在运行，见[采集审计后记](/notes/2026/10/10/micromani-collection-integrity-audit/) |
| 工控机 MicroMani 主仓库（2026-10-12 补记） | 远端 `xie/d9315e9`（10-12 23:43 推送）：在 `2a99555` 之上 14 个提交，即 10-11 的七个，加上 `6dca631`（夹爪对齐上限 50→70 ms）、`a093a8b`（寻零完成后短暂缺样误报）、`f78026a`（连续策略目标约束与运动进展监测）、`26c9cf5`（手动观察模式入口）、`0e59d3c` / `d9315e9`（相机共享内存独立进程采集并默认启用）、`4c98be4`（策略接口夹爪目标后台下发、返回分段耗时）；09-22 的 `cd0e259`、`0d21df3`、`6dce89f`、`5f28fd3` 早已在远端 | 后七个提交只记了提交说明，内容和测试未核对。工作区仍有 32 个修改、15 个未跟踪文件，含 10-09 晚部署的（用户 10-12 说明：是当晚让 AI 改的，该会话已找不到）录制起点保持（`recordingPreparing` 只在工作区）、中断丢弃、录制进度、回 W 忙重试和 `config.json` 替换重试（[B19](#B19)、[C19](#C19)、[C20](#C20)），这些仍未提交；运行二进制对应哪份源码未核对。**10-13 补记：**上述工作区改动已按功能拆成 11 个提交（`d45d421`～`59045da`，00:19），00:21 推送，远端 `xie` 为 `59045da`，工作区干净；Codex 草稿目录未提交。运行二进制与源码的对应仍未核对 |
| 工控机 MicroMani 主仓库（2026-10-14 补记） | 远端 `xie/40d4da6`（10-14 04:04～04:05 推送）：在 `59045da` 之上 7 个提交 `70c5ab6`、`917513d`、`7593c75`、`1a0736c`、`177e6fa`、`b5db872`、`40d4da6`（停顿看门狗、日志后台写入、复核规则、界面与数据集接口） | 后端 10-14 03:40 带这些改动重启并在运行；推送前用户撤销了 Codex 的未提交改动。后端全量 1453 通过、1 个修改前就失败的力标定测试，见[同步写日志专题](/notes/2026/10/14/micromani-event-loop-logging-stall/) |
| 部署工作树（2026-10-17 补记） | 本地分支 `fix/gripper-feedback-20261016`：`49a64ad`、`a2e42db`、`80ebfb8`、`2f0b61d`、`371c48e`、`acdb808`、`fb1069e`，均未推送；运行目录在固态硬盘 | 五基线正式比较（[E27](#E27)）用的就是这一版；夹爪实测反馈等改动未合入 `xie`，合入需用户批准，见[阶段十二](/notes/2026/10/15/micromani-five-baselines-formal-eval/) |
| 连接与寻零专题 | 公开 `xie/400cde0` 固定源码证据 | 是另一轮源码审计范围，不代表生产目录回退或正在运行该版本 |

版本出处见[数据续录记录](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/)、[寻零专题](/notes/2026/09/23/micromani-homing-completion-semantics/)和[HAL 专题](/notes/2026/09/29/micromani-hal-startup-recovery/)。本次只核对笔记仓库，没有重查上述机器人工作区、构建产物或设备。

</details>
