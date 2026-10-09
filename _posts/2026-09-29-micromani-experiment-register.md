---
title: "MicroMani 实验与数据索引：划分、模型结果与比较边界"
date: "2026-09-29"
description: "按数据集整理 ACT 实验与部署证据，明确窗口、归一化、hold 和任务验收的比较边界。"
category: 笔记
tags: [科研记录, MicroMani, 科研索引]
---

[科研总览](/notes/2026/09/23/micromani-research-overview/) · [问题与验收台账](/notes/2026/09/29/micromani-research-status/) · [实验与数据索引](/notes/2026/09/29/micromani-experiment-register/)

<details markdown="1">
<summary>展开本页目录</summary>

* 本页目录
{:toc}

</details>

**材料截至 2026-09-29；这是已有实验的检索入口，不是本次重新训练或重算的报告。** 每张表按自己的数据、划分和评估口径阅读；用于挑选 best 的 validation 不叫独立 test。下列 D / M 编号仅用于记录索引。

## 数据集索引
{: #datasets }

| 编号 / 数据 | 划分与窗口 | 用途、来源和限制 |
| --- | --- | --- |
| D01：旧合并 10 条 / 9,049 帧 | 7 train、2 validation、1 整段排除；训练 6,492 帧 / 6,289 个完整 30 帧窗口 | 早期 absolute 与固定样本诊断。episode 1 保留原始值，因末帧异常排除；固定评估为 218 个训练窗、58 个验证窗。[阶段一](/notes/2026/09/20/micromani-research-log/) |
| D02：standard10 / 7,361 帧 | 8 train、2 validation；训练 6,034 帧 / 5,802 窗；部署审计有 1,269 个合法验证窗 | 可追溯的规范起点诊断基线；旧场景，不与新 setup 无条件混合。[阶段二](/notes/2026/09/21/micromani-standardized-data-and-training/)和[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/) |
| D03：strict23 | 14 train / 9 validation；本索引不补猜总帧数 | 与 usable53 的验证集合不同，不能直接按模型误差判断数据筛选优劣。[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| D04：usable53 | 38 train / 15 validation；21,480 个训练窗、6,937 个验证窗；severe mask 后保留 21,145 个训练窗 | mask 只作用训练，验证不筛；归一化文件核对一致。81 个标记帧影响 335 个重叠窗口，不等于 335 个坏帧。[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/) |
| D05：历史 109 条 / 48,961 帧 | 87 train / 22 validation；训练窗 36,566→36,496，验证保留全部 9,234 窗 | 固定种子 20260927；五个副本未物理合并。按最终 JSON 清单读取，不能直接扫描目录；尚未启动基于此最终清单的新训练。[阶段七](/notes/2026/09/29/micromani-data-lineage-and-safe-resume/) |
| D06：新固定起点 V1 | 5 条完整 probe，随后正式约 30～40 条是计划，不是已验收数量 | 不用 D05 替代现场验收；W、相机布置、起点和关键阶段对齐需重新核验。[当前台账](/notes/2026/09/29/micromani-research-status/#acceptance)。2026-10-09 补记：新 global 视角下已试采 10 条，质量评估均建议重录，尚无合格 probe，见[试采记录](/notes/2026/10/09/micromani-collection-fixes-trial-recording/) |

D05 最终入口为 `combined-train-validation-split-20260927.json`。yxp v1 副本仍保留本轮排除项；取数需结合元数据与原生映射。归一化只用对应 87 条训练数据。**文件完整、任务成功、符合采集规范和选入某轮训练，是不同判定。**

## 动作与指标契约
{: #contracts }

本批单侧模型的活动侧是 `operator_right = hardware_left = 14D 的 7..13`；图像仍包含 global 和两只腕相机，不能把单侧动作模型说成单相机模型。训练契约中的平移、旋转与夹爪单位分别为 μm、mdeg、mm；1 mdeg = 0.001°，这些单位不等于设备精度。来源：[阶段一](/notes/2026/09/20/micromani-research-log/)、[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)、[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)。

relative target 是 `action(t+h) - observation.state(t)`，不是相邻帧增量或速度；部署还原尺度后加回当前状态。`normalized L1` 不是单一物理误差，比较时需核对归一化、动作维度、horizon、窗口集合和聚合方法。首步与 full-30 分开报告，各物理轴反归一化后再分析。

## 模型结果：按可比集合分组
{: #models }

### M01：旧合并数据上的 14D / 单侧对照

| D01 的同一活动侧 7D、58 个固定验证窗 | Validation best full-30 L1 | Best step |
| --- | ---: | ---: |
| baseline_003（14D 输入输出） | 0.4699 | 2000 |
| single_side_001（7D 输入输出） | 0.3823 | 3000 |
| 同一验证集的 hold | 0.1487 | — |

来源：[阶段一](/notes/2026/09/20/micromani-research-log/)。单侧模型同时移除闲置侧输入和预测损失，不能单独归因于其中一项。另一次固定 8 窗 C/D 拟合为约 0.0142 / 0.0165，优于本组最优常值 0.0910，但它使用训练样本；最优常值还使用未来真值，不是可部署基线，更不是泛化成绩。

### M02：standard10 的 absolute / relative

| D02 阶段五记录的评估口径 | Validation full-30 L1 | First-step L1 |
| --- | ---: | ---: |
| standard10_single_side_001，absolute | 0.217354 | 此处未摘录 |
| standard10_relative_side_001，best@3000 | 0.131497 | 0.034600 |
| 本轮 hold | 0.145326 | 0.027419 |

来源：[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)。训练选 checkpoint 的 46 个固定验证窗，与后续部署审计的全部 1,269 窗是不同评估范围。relative 的 full-30 优于本轮 hold，但首步仍较差。旧阶段二的 hold 0.1543 另列待核，见[口径待核项](#metric-caveats)；不能用后续全窗口审计分数直接替换这张表。

### M03：usable53 的 relative / severe-only mask

| D04，同一 15 条 validation、全部 6,937 窗 | Full-30 L1 | First-step L1 | Best step |
| --- | ---: | ---: | ---: |
| usable53 relative | 0.125818 | 0.039463 | 2685 |
| relative + severe-only timing mask | 0.123819 | 0.033492 | 2200 |
| 同一 validation 的 hold | 0.161556 | 0.021700 | — |

来源：[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)。训练侧 severe mask 使用夹爪绝对时间偏差 >100 ms（前后 3 帧）与 HAL >50 ms（前后 2 帧），validation 不使用 mask。这些是本实验设置，不是通用数据质量标准。full-30 约 1.59% 的改善是本轮对照结果，尚无跨随机种子或场景的稳定收益证据。

同文后补的 usable53 absolute 为 0.44959（best@1100，hold 0.16156）；strict23 relative 为 0.13643（best@500，hold 0.15656）。前者与 usable53 relative 同划分，后者只有 9 条验证 episode，不能与 15 条集合直接排名。两项后补结果来自历史会话汇总，不标为本次原始指标复算。激进过滤只算过排除比例，未据此训练。

## 部署和真实任务证据不能混写
{: #deployment }

| 对象 | 已有证据 | 尚不能推出 |
| --- | --- | --- |
| standard10 部署审计 | 全 1,269 窗；7D→14D 适配 9 项测试、1,269 窗回放通过；offset=5 为候选 | 167 ms 是真实动力学最优 lookahead；完整 30 步可安全开环执行 |
| standard10 Live Dry-Run | 20 次 sent=false，前后状态不变；完整链路约 13.4 Hz | 真实运动闭环达到相同频率，或已完成自主抓放 |
| severe-mask Live Dry-Run | 10 次接受、均 sent=false，三路各 10 个不同帧 | 与上面的 20 次是同一批、或可合并成一次性能测试 |
| severe-mask 单步与短段连续空载 | 有受限单步及约 6 步、约 20 步尝试；出现同向漂移并触及当次范围限制 | 已完成自主 A→B；临时试跑界面仍为当前正式功能 |
| GPT 视觉抓取 | 实验结束，未成功抓起，独立日志保留，实验代码撤回 | 形成了同步成功示教；真实接触停止或恒力控制已验收 |

ACT 证据见[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)和[阶段六](/notes/2026/09/26/micromani-collection-and-act-pause/)，GPT 见[专项复盘](/notes/2026/09/29/micromani-gpt-grasp-closeout/)。限幅后的实际运动与原始预测轨迹不同；软件保护测试、无动作试跑、空载运动和任务成功必须分开计数。

## 口径待核项与禁止直接比较的情形
{: #metric-caveats }

**E16：standard10 hold 0.1543 与 0.145326。** [阶段二](/notes/2026/09/21/micromani-standardized-data-and-training/)记录前者，[阶段五](/notes/2026/09/23/micromani-relative-act-new-setup/)记录后者。本次发现数值不一致，但没有重新读取两轮评估的窗口清单、normalization、指标代码与原始结果，不能确认是口径变化还是记录错误；保留两个数值并登记到[问题台账 E16](/notes/2026/09/29/micromani-research-status/#E16)。这项核对优先于跨文计算“改善百分比”。

不同 setup、不同验证 episode、不同窗口抽样、不同归一化，以及训练拟合 / best validation / 独立 test 不得合并排名。验证集筛掉难窗后得到的误差，也不能与未筛选结果直接比较。训练吞吐、GPU forward、完整 dry-run 请求和真实运动循环是不同指标。

## 复现时应一起取回什么
{: #reproduction }

`standard10_relative_side_001` 的历史实验目录在 `E:\micro_act_train\experiments\` 下。`newsetup_usable53_relative_severe_mask_001` 已记录 `best/model.safetensors`、`best/normalization.npz`、`model_config/config.json`、`config.json` 和 `best/metrics.json`。这些是历史本地证据标识，不是公开下载链接；本次没有重新验证文件是否仍在或哈希是否改变。

后续登记一轮实验时，记录数据清单及哈希、setup / W 与侧别契约、episode 划分、实际归一化来源、窗口 / mask 规则、代码提交与未提交差异、checkpoint 与训练配置、随机种子、训练预算、评估集合和执行命令。已有文章没有给出的字段标为“待复核”，不补猜。

研究产出仍需由独立任务成功 / 失败记录支撑。当前未建立已验收的自主抓放成功率，不能以离线 L1 或某次保护未触发替代。
