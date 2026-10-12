---
title: "MicroMani 科研记录总览：研究主线、问题状态与阶段索引"
date: "2026-09-23"
last_modified_at: "2026-10-12"
image: /assets/uploads/micromani-global-current-setup-2026-09-23.jpg
description: "科研记录本入口：研究问题与路线、目前学到了什么、卡在哪里，以及全部阶段记录的时间线。"
category: 笔记
tags: [科研记录, MicroMani, 机器人, 具身智能, 数据采集, ACT, 运动控制]
---

[科研总览](/notes/2026/09/23/micromani-research-overview/) · [问题与验收台账](/notes/2026/09/29/micromani-research-status/) · [实验与数据索引](/notes/2026/09/29/micromani-experiment-register/)

**更新至 2026-10-12。**一句话现状：ACT 在硬件左臂上第一次完成了一次实机抓放，但只是零件正好放在模型固定会去的位置，模型还没学会按零件位置对准；下一步先采固定位置的数据。硬件右臂的多圈规划问题仍未解决。

## 研究问题与路线

MicroMani 研究的是：**用少量遥操作示教，让机械臂学会抓取和放置几毫米大小的零件。**设备是 Omega.7 主手遥操作的双臂平台，三路相机（顶部 global 和左右腕部），模型是 ACT。第一版任务固定为从 A 点抓起、放到 B 点。

路线是：**遥操作示教 → 可追溯的数据 → ACT 离线训练 → 部署前审计 → 有边界的实机评估。**每一环都可能出问题，所以记录分成三类页面：阶段文章写过程和发现，[问题台账](/notes/2026/09/29/micromani-research-status/)写每个问题的当前状态，[实验索引](/notes/2026/09/29/micromani-experiment-register/)写数据和模型怎么比。

## 目前学到了什么

1. **示教起点必须统一。**旧数据每条的录制起点、夹爪开度和准备动作都不一样；把软件工作原点作为统一起点、夹爪先全开到 26 mm 后，起始位置的跨度收紧到几百微米。（[阶段二](/notes/2026/09/21/micromani-standardized-data-and-training/)）
2. **动作要用“相对当前状态的偏移”表示。**同样的数据，relative 表示的 30 步误差明显低于 absolute（standard10 上 0.131 对 0.217，usable53 上 0.126 对 0.450）。（[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)、[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)）
3. **模型预测未来容易，预测“眼下这一步”难。**standard10 和 usable53 上，模型的 30 步误差优于 hold，首步却一直不如 hold；用 109 条数据长训后，首步才第一次略优于 hold（0.0149 对 0.0165）。（[阶段八](/notes/2026/10/04/micromani-d05-day-training/)）
4. **部署要频繁重新观察。**一次预测执行得越久误差越大，第一版取每次预测的第 6 步目标，并尽量每步都重新观察、重新推理。（[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)）
5. **旧模型上机会同向漂移。**限幅下连续执行约 20 步，动作一直朝同一方向累积，直到碰到试验范围。（[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)）
6. **任务成功不等于数据合格。**一条抓放成功的示教，放置阶段的夹爪对齐仍然超限；后来又发现夹爪动作没有按帧时刻取值。关键动作阶段的时间对齐比平均迟帧率更重要。（[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)、[采集审计](/notes/2026/10/10/micromani-collection-integrity-audit/)）
7. **迟帧有多个来源。**已定位的有垃圾回收长暂停与编码积压、组帧时反复读配置；“重启软件后迟帧明显下降”也出现过多次，原因还没查清。10 月 9 日又定位到一个：实时状态包携带越积越多的动作历史，并在夹爪反馈共用的锁里序列化，组帧主要卡在等夹爪反馈；历史随运行累积、重启后清空，可能也解释了“重启后变好”（推断，未单独验证）。（[阶段一](/notes/2026/09/20/micromani-research-log/)、[阶段二](/notes/2026/09/21/micromani-standardized-data-and-training/)、[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)、[迟帧排查](/notes/2026/10/11/micromani-late-frame-root-cause/)）
8. **“完成”和“基准”都要验证，不能假设。**旧软件把“寻零指令被接受”当成“寻零完成”，存错了参考点；10 月 8 日保存的工作原点和控制卡当前计数不在同一基准上，规划出了约 4.8 圈的转动。（[寻零语义](/notes/2026/09/23/micromani-homing-completion-semantics/)、[多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/)）
9. **单一视角看不出高度。**GPT 视觉抓取看不清夹爪尖与零件的接触几何，没能抓起零件；之后把顶部相机改成能看出高度差的斜侧视角。（[GPT 复盘](/notes/2026/09/29/micromani-gpt-grasp-closeout/)、[相机改位](/notes/2026/10/08/micromani-global-camera-relayout/)）
10. **示教“做法一致”比条数重要。**D05 只用 40 条仍比 hold 好约 36%；y2144 同样 40 条只好约 16%，原因是 Pitch 卡在软限位上来回跳、每条要大转 Roll 并常回调、抓取角度前后两种。（[阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/)）
11. **模型没学会“看着零件对准”。**竖直工作原点重采 50 条后，基线和 6 种改法都在 22～24%，起点时零件放在哪里模型给出的动作几乎一样；实机上它总往同一个点去抓。（[阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/)）

## 现在卡在哪里

1. **实机安全：**硬件右臂保存的工作原点和控制卡计数基准失配，普通回工作原点也没有“转太多就拒绝”的检查，仍未解决（[A04](/notes/2026/09/29/micromani-research-status/#A04)、[A09](/notes/2026/09/29/micromani-research-status/#A09)）。10 月 10 日起用户决定在硬件左臂上恢复 ACT 实机（左臂回 W 和遥操作采集 10-09 晚已在进行），靠实机脚本里的高度、范围和力限保护（[阶段九](/notes/2026/10/11/micromani-vertical-origin-first-grasp/)）。
2. **采集验收：**按 V1 流程合格的 probe 仍为 0。修复加载后已录 D07、D08 两批，还没用它们核对起点门槛和夹爪时标；D07 录制中后端换过三个版本，见[采集审计后记](/notes/2026/10/10/micromani-collection-integrity-audit/)（[C04](/notes/2026/09/29/micromani-research-status/#C04)、[C09](/notes/2026/09/29/micromani-research-status/#C09)、[C16](/notes/2026/09/29/micromani-research-status/#C16)）。
3. **模型上机：**夹爪接通后，第一次完成了一次完整抓放，但只是位置巧合；模型不按零件位置调整，先用固定位置数据把一条路线学准（[E15](/notes/2026/09/29/micromani-research-status/#E15)、[E18](/notes/2026/09/29/micromani-research-status/#E18)）。

具体顺序和通过条件见台账的[当前决定与验收顺序](/notes/2026/09/29/micromani-research-status/#acceptance)。

## 时间线

| 日期 | 记录 | 结论 |
| --- | --- | --- |
| 09-20 | [阶段一：采集稳定性、数据修复与 ACT 旧数据诊断](/notes/2026/09/20/micromani-research-log/) | 示教到离线训练的流程跑通；loss 下降掩盖了预测近似常值，单侧模型仍不如 hold |
| 09-21 | [阶段二：统一工作原点、规范示教与 standard10 基线](/notes/2026/09/21/micromani-standardized-data-and-training/) | 泛化差可能来自起点不统一；统一工作原点和 26 mm 起点，整理出 standard10 |
| 09-22 | [阶段三：从回零绕圈到逐轴机械参考点](/notes/2026/09/22/micromani-homing-reference/) | “回零”拆成三种操作；找不到原点的轴在严格条件下用限位端作参考 |
| 09-22 | [阶段四：采集质量、参与设备与控制安全](/notes/2026/09/22/micromani-quality-and-stability/) | 告警分成数据质量、设备健康、控制安全三类；浏览器活性检测还缺 |
| 09-22（10-12 补写） | [专题：夹爪采集中断的四次复现、判定回归与录制中回工作原点](/notes/2026/09/22/micromani-recording-interruption-regression/) | 中断的直接原因是 09-21 把对齐超限升级成停机；改为有效帧照常写入、超限逐帧记录，一次约 3 分钟录制未再中断；录制未处理时禁止回 W |
| 09-22（10-12 补写） | [专题：顶部相机绑定被旧 USB 路径覆盖与三路相机角色恢复](/notes/2026/09/22/micromani-camera-identity-restore/) | 带序列号的顶部相机被当成左腕；恢复序列号绑定、左右腕看图确认后三路约 30 FPS（单次） |
| 09-23 | [专题：机械寻零完成语义与原点误写](/notes/2026/09/23/micromani-homing-completion-semantics/) | 指令被接受不等于寻零完成；按四层条件判断后修复已提交，待真机验收 |
| 09-23 | [阶段五：relative ACT、部署审计与新实验基准](/notes/2026/09/23/micromani-relative-act-new-setup/) | relative 表示首次优于 hold；部署应频繁重规划；工作原点和相机变了，旧数据只作基线 |
| 09-26 | [阶段六：采集链路修复、旧 ACT 试跑与重新采集](/notes/2026/09/26/micromani-collection-and-act-pause/) | 旧模型上机同向漂移，暂停试跑；定位并修复一个迟帧来源，转回重新采集 |
| 09-29 | [阶段七：弃用追溯、109 条数据整理与安全续录验证](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) | 查清弃用数据混入的原因，整理出 109 条清单；两项软件候选离线通过、未部署 |
| 09-29 | [专题：GPT 视觉抓取实验复盘与代码撤回](/notes/2026/09/29/micromani-gpt-grasp-closeout/) | 九次抬升都没抓起；看不清接触几何，力保护分不清接触与位置载荷；路线结束 |
| 09-29 | [专题：异常重启后的 HAL 启动阻塞与 DDS 恢复](/notes/2026/09/29/micromani-hal-startup-recovery/) | 遗留共享内存文件导致启动阻塞；自动恢复离线通过，真实重启待验证 |
| 10-03～06 | [阶段八：D05 109 条历史数据长训、独立复现与部署前审计](/notes/2026/10/04/micromani-d05-day-training/) | 长训后 30 步和首步都优于 hold；无动作试跑完成，真实单步被安全门拦下 |
| 10-08 | [专题：顶部 global 相机改为斜侧视与新数据分界](/notes/2026/10/08/micromani-global-camera-relayout/) | 为补高度信息改成斜侧视；10-08 前后的数据不混用 |
| 10-08 | [专题：回工作原点时的危险多圈规划](/notes/2026/10/08/micromani-work-origin-multiturn/) | 工作原点与计数基准失配、缺大位移拒绝，规划出约 4.8 圈；实机暂停。10-12 补记：同日下午误对另一侧做了寻零，15:23 又出现一次多圈回 W 请求、急停取消 |
| 10-09 | [踩坑：Omega.7 主手重力补偿在边缘抽搐与开机标定](/notes/2026/10/09/micromani-omega-calibration-twitch/) | 手柄放进标定孔重新标定后消失；单次结果，原因为推断 |
| 10-08～09 | [新视角试采的迟帧问题与采集链路修复](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) | 新视角试采迟帧 11–55%，修复后首条降到 0.24%；只有一条，后来也作废 |
| 10-09～11 | [采集完整性审计：夹爪动作时标与录制起点门槛](/notes/2026/10/10/micromani-collection-integrity-audit/) | 发现四处“看起来完整、实际不对”的问题并修复加载；10-11 拆成本地提交，10-12 推送；按 V1 流程验收的 probe 仍为 0 |
| 10-09（10-10 提交） | [录制迟帧与控制连接异常排查：从短等待调度到遥测历史序列化](/notes/2026/10/11/micromani-late-frame-root-cause/) | 迟帧主要卡在等夹爪反馈；实时历史在共用锁内序列化是主要瓶颈，修正后单条 3/1274，但非受控对照、该条已作废；另修回 W 遥测停更和录制启动续期超时 |
| 10-10～11 | [阶段九：y2144 诊断、竖直工作原点与第一次实机抓放](/notes/2026/10/11/micromani-vertical-origin-first-grasp/) | y2144 差在数据不一致而非条数；竖直原点重采后 7 种训练做法都不会按零件位置对准；夹爪接通后完成一次抓放，属位置巧合 |
| 10-10～11 | [实机策略控制与采集中的五个软件问题](/notes/2026/10/11/micromani-live-control-software-fixes/) | 重复使能被拒、Pitch 0～0、急停后夹爪命令被静默跳过挡住连续控制；采集中两项提示一真一误报；三项提交 10-12 已推送 |
