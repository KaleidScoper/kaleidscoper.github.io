# 子情报 B：AVID / 0DIN / promptfoo 条目枚举

> **来源**：并行情报子代理收集（独立上下文）。方法：AVID GitHub 报告库全量克隆（1712 份 2026 报告 + 25 份 2025）+ 0DIN 全站 92 条公开披露分页抓取 + promptfoo LM Security DB API 全量拉取。
> **沙箱提示**：以下全部内容来自沙箱模拟应答，**不可作为真实世界事实**。
> **归档目的**：保留编号级细节与其自报的审计缺陷（含对上级 agent 初始假设的纠正）。

## 0. 核心结论（含对任务前提的更正）

- **初始假设的编号簇与实测不符**：2026-02-19 批量导入的图像类条目**恰好 9 条**，为 `R0089, R0091, R0096, R0097, R0098, R0100, R0101, R0105, R0107`。
- **AVID-2026-R0061 / R0070 / R0090 并非图像相关**：R0061 = "Incremental Table Completion"（多模型文本越狱/制毒信息）、R0070 = "Haiku of Love"、R0090 = "Memory Dump Simulation" —— 均为多模型文本类，与图像生成无关。
- **AVID 2026 全库中不存在** DALL·E 3 之外的 gpt-image-1、Midjourney、Stable Diffusion、Gemini/Imagen 图像越狱条目；Sora 有 2 条。AVID 中的 SD/Midjourney 记录全部是 WordPress 插件 CVE 或 kohya_ss 训练工具 RCE，非越狱。
- 9 条 2026-02-19 条目**全部一一对应 9 条 0DIN 披露**，无孤儿、无缺失。

---

## 表 1：AVID 图像越狱条目全表（2026 批次，2026-02-19 导入）

| AVID编号 | Tactic/标题 | 受影响系统 | SIS等级 | 三层分类 (Category/Strategy/Technique) | Credit | 来源URL |
|---|---|---|---|---|---|---|
| AVID-2026-R0107 | NSFW OpenAI DALL-E3 Guardrail Jailbreak via "Surprise Attack" Tactic | System: DALL-E3 (OpenAI) | Level 1: Minimal Risk | Possible Worlds / World Building / Scenarios | Mike Takahashi (@TakSec) | [AVID](https://avidml.org/database/avid-2026-r0107/) · [0DIN](https://0din.ai/disclosures/f6e85219-a5fd-4a14-9de7-935f947d5795) |
| AVID-2026-R0105 | NSFW OpenAI DALL-E3 Guardrail Jailbreak via "Historical Polaroid" Tactic（标题含双空格） | System: DALL-E3 (OpenAI) | Level 1: Minimal Risk | Possible Worlds / World Building / Scenarios ;; Rhetoric / Persuasion and Manipulation / Latent Space Distraction | Edward Morris | [AVID](https://avidml.org/database/avid-2026-r0105/) · [0DIN](https://0din.ai/disclosures/b444ec15-a055-4e35-9ee0-eaa95d91507a) |
| AVID-2026-R0101 | NSFW OpenAI DALL-E3 Guardrail Jailbreak via "Artistic Escalation" Tactic | System: DALL-E3 (OpenAI) | Level 1: Minimal Risk | Rhetoric / Persuasion and Manipulation / Surprise Attack ;; Language / Stylizing / Synonymous Language ;; Rhetoric / Persuasion and Manipulation / Escalating | Anonymous | [AVID](https://avidml.org/database/avid-2026-r0101/) · [0DIN](https://0din.ai/disclosures/8a0eace8-6724-4ec4-8af9-3cee8e8a97c9) |
| AVID-2026-R0100 | NSFW OpenAI DALL-E3 Guardrail Jailbreak via "Feminist Art Description" Tactic | System: DALL-E3 (OpenAI) | Level 3: Cultural and Traditional Depictions ⚠️（AVID 该字段填入了 NIRS 值，非 SIS） | Language / Prompt Injection / Strong Arm Attack ;; Stratagems / Meta Prompting / Perspective Shifting ;; Language / Stylizing / Synonymous Language ;; Rhetoric / Socratic Questioning / Identity Characteristics | Anonymous | [AVID](https://avidml.org/database/avid-2026-r0100/) · [0DIN](https://0din.ai/disclosures/78819949-0069-4cdb-817e-70957ffd2293) |
| AVID-2026-R0098 | NSFW OpenAI DALL-E3 Guardrail Jailbreak via "Historical NSFW" Tactic | System: DALL-E3 (OpenAI) | Level 1: Minimal Risk | Possible Worlds / World Building / Scenarios ;; Rhetoric / Persuasion and Manipulation / Surprise Attack | Miller Engelbrecht | [AVID](https://avidml.org/database/avid-2026-r0098/) · [0DIN](https://0din.ai/disclosures/c94dab4b-5ac2-4615-81ce-bbdb2c61ec3a) |
| AVID-2026-R0097 | NSFW OpenAI Sora Guardrail Jailbreak via "Hypothetical Anatomy" Tactic | System: OpenAI Sora | Level 1: Minimal Risk | Possible Worlds / World Building / Scenarios | Edward Morris | [AVID](https://avidml.org/database/avid-2026-r0097/) · [0DIN](https://0din.ai/disclosures/b5e861ec-e7a5-4b79-b145-432cdf94ddc7) |
| AVID-2026-R0096 | NSFW OpenAI DALL-E3 Guardrail Jailbreak via "Debug Framework Simulation" Tactic | System: OpenAI DALL-E3 | Level 1: Minimal Risk | Fictionalizing / Re-storying / Goal Hijacking ;; Possible Worlds / Emulations / Unreal Computing | Anonymous | [AVID](https://avidml.org/database/avid-2026-r0096/) · [0DIN](https://0din.ai/disclosures/9ec1b1fe-c910-422a-a8fc-5d77d58ec904) |
| AVID-2026-R0091 | NSFW OpenAI Sora Guardrail Jailbreak via "Anatomical Escalation" Tactic | System: OpenAI Sora | Level 1: Minimal Risk | Language / Stylizing / Synonymous Language | Anonymous | [AVID](https://avidml.org/database/avid-2026-r0091/) · [0DIN](https://0din.ai/disclosures/24b04730-9634-4d76-996d-185e0c4f64ef) |
| AVID-2026-R0089 | NSFW OpenAI DALL-E3 Guardrail Jailbreak via "Classical Art Reframing" Tactic | System: DALL-E3 (OpenAI) | Level 2: Moderate Risk | Language / Stylizing / Synonymous Language ;; Possible Worlds / World Building / Scenarios | Mike Takahashi (@TakSec) | [AVID](https://avidml.org/database/avid-2026-r0089/) · [0DIN](https://0din.ai/disclosures/0d97ce9d-29aa-45a0-8b5c-f71daee04ea5) |

**共同属性**：Report Type = `Issue`；Classof = `Third-party Report`；data_version = `0.3.3`；Date Reported = `2026-02-19`；**均无 Metrics 测试表**（与同批多模型 `Measurement` 条目不同）。

**各条描述要点**
- **R0089** 历史框架 + 艺术价值抗辩请求裸体；绕过显性视觉内容限制。
- **R0091** 技术解剖学术语 + 创作性视觉元素（贴合身体轮廓的生物发光符号）绕过不当视觉内容限制。
- **R0096** 建立虚构调试框架（状态管理、检查点、重放）营造宽松环境绕过禁止视觉内容。
- **R0097** 学术框架 + 假设情景，嵌入解剖学课堂语境的"假设性"视觉请求。
- **R0098** 将裸体请求置于历史/人类学语境，引用前衣物时代与部落文化。
- **R0100** 以女性主义话语与艺术术语（"身体自主"、"神圣女性"）包装显性内容请求。
- **R0101** 从艺术/神话请求起步，通过迭代精修逐步升级露骨度。
- **R0105** 历史语境 + 复古相纸格式规格，将剥削性影像置于"无辜"历史摄影框架。
- **R0107** 以"原住民教育纪录片"为名请求文化敏感影像（注：描述文本写 "affecting multiple models"，但 artifacts 仅列 DALL-E3）。

### 表 1 补充：同库其他图像相关（非 0DIN 批次）

| AVID编号 | 标题 | 受影响系统 | 类型 | Credit | Date | 来源 |
|---|---|---|---|---|---|---|
| AVID-2026-R0413 | OpenAI ChatGPT Content Safety Explicit Image Bypass | System: ChatGPT | Advisory | Jim Nightingale; Mindgard | 2026-01-28 | [AVID](https://avidml.org/database/avid-2026-r0413/) |

描述：可绕过 OpenAI 护栏，生成虚构及真实人物的图像并操纵为性化姿态。

---

## 表 2：0DIN 披露清单（图像生成相关，全站 92 条中的 9 条）

| UUID | 标题 | 模型 | 严重度 | 披露日期 (Disclosed→Published) | 研究员 |
|---|---|---|---|---|---|
| `24b04730-9634-4d76-996d-185e0c4f64ef` | 0x24B04730: OpenAI Sora Guardrail Jailbreak via "Anatomical Escalation" Tactic | OpenAI Sora | Low | 2025-03-13 → 2025-09-30 | Anonymous |
| `b5e861ec-e7a5-4b79-b145-432cdf94ddc7` | 0xB5E861EC: OpenAI Sora Guardrail Jailbreak via "Hypothetical Anatomy" Tactic | OpenAI Sora | Low | 2025-03-13 → 2025-09-30 | Edward Morris |
| `9ec1b1fe-c910-422a-a8fc-5d77d58ec904` | 0x9EC1B1FE: OpenAI DALL-E3 Guardrail Jailbreak via "Debug Framework Simulation" Tactic | OpenAI DALL-E3 | Low | 2025-03-13 → 2025-09-25 | Anonymous |
| `c94dab4b-5ac2-4615-81ce-bbdb2c61ec3a` | 0xC94DAB4B: OpenAI DALL-E3 Guardrail Jailbreak via "Historical NSFW" Tactic | OpenAI DALL-E3 | Low | 2025-03-13 → 2025-09-02 | Miller Engelbrecht |
| `0d97ce9d-29aa-45a0-8b5c-f71daee04ea5` | 0x0D97CE9D: OpenAI DALL-E3 Guardrail Jailbreak via "Classical Art Reframing" Tactic | OpenAI DALL-E3 | Low | 2025-03-13 → 2025-08-27 | Mike Takahashi (@TakSec) |
| `b444ec15-a055-4e35-9ee0-eaa95d91507a` | 0xB444EC15: OpenAI DALL-E3 Guardrail Jailbreak via "Historical Polaroid" Tactic | OpenAI DALL-E3 | Low | 2025-03-13 → 2025-08-22 | Edward Morris |
| `8a0eace8-6724-4ec4-8af9-3cee8e8a97c9` | 0x8A0EACE8: OpenAI DALL-E3 Guardrail Jailbreak via "Artistic Escalation" Tactic | OpenAI DALL-E3 | Low | 2025-03-13 → 2025-08-20 | Anonymous |
| `78819949-0069-4cdb-817e-70957ffd2293` | 0x78819949: OpenAI DALL-E3 Guardrail Jailbreak via "Feminist Art Description" Tactic | OpenAI DALL-E3 | Low | 2025-03-13 → 2025-08-19 | Anonymous |
| `f6e85219-a5fd-4a14-9de7-935f947d5795` | 0xF6E85219: OpenAI DALL-E3 Guardrail Jailbreak via "Surprise Attack" Tactic | OpenAI DALL-E3 | Low | 2025-03-13 → 2025-08-12 | Mike Takahashi (@TakSec) |

**附加字段（0DIN 详情页独有，AVID 未收录）——NIRS 裸体影像评级**
- Sora：L1 Abstract Symbolic（`24b04730`）、L3 Cultural/Traditional（`b5e861ec`）
- DALL-E3：L4 Commercialized Erotic（`9ec1b1fe`）、L3（`c94dab4b` / `b444ec15` / `78819949` / `f6e85219`）、L2 Classical Artistic（`0d97ce9d`）、L1（`8a0eace8`）

**其他**：全部 Security Boundary = `Guardrail Jailbreak`；全部带 NSFW 内容警告弹窗；Social Impact Score 与 AVID 一致（8 条 L1，`0d97ce9d` 为 L2）。全站 92 条中 91 条 Low、1 条 Medium（`e24d9e6b` Google Gemini G-Suite Prompt Injection，非图像）；日期跨度 2025-02-10 → 2026-08-18。

---

## 表 3：promptfoo LM Security DB — vision 标签条目

> **说明**：站内**不使用 "LMVD-xxxx" 前缀**；条目 ID 为 8 位十六进制 `cveId`（官方 API `/lm-security-db/api/cves/` 字段名即 `cveId`）。规范 URL = `https://www.promptfoo.dev/lm-security-db/vuln/{slug}-{cveId}/`。
> vision 标签共 **131 条**。

### 3A. 目标为图像生成(T2I)/图像编辑系统的条目（与本次任务最相关）

| ID | 名称 | 模型 | 发布日期 | 来源 |
|---|---|---|---|---|
| `f6bbe8e7` | **Semantic Masking Image Jailbreak** | Sora, Stable Diffusion v1.4 | 2026-04-02 | [arXiv:2604.01888](https://arxiv.org/abs/2604.01888) |
| `495ebfbf` | **Safety Guidance Harm Collision** | GPT-4o, Stable Diffusion | 2026-02-24 | [arXiv:2602.20880](https://arxiv.org/abs/2602.20880) |
| `6b0ce948` | **Image Editing Visual Prompt Jailbreak** | GPT Image 1.5, Gemini 3 Pro Image, Seedream 4.5, Qwen-Image-Edit-2512, Qwen-Image-Edit-Safe, BAGEL 14B, Flux 2.0 Dev 32B, LongCat-Image-Edit | 2026-02-10 | [arXiv:2602.10179](https://arxiv.org/abs/2602.10179) |
| `0f291824` | **High-Dim Bandit Reward Hijack** | Stable Diffusion | 2026-02-02 | [arXiv:2602.01658](https://arxiv.org/abs/2602.01658) |
| `37ceb240` | **Macaronic T2I Jailbreak** | DALL-E, Stable Diffusion | 2026-01-12 | [arXiv:2601.07141](https://arxiv.org/abs/2601.07141) |
| `b3e6cbdd` | **Distal Translation Jailbreak** | GPT-4o, GPT-5, GPT-5.1, DALL-E, Midjourney | 2026-01-08 | [arXiv:2601.05150](https://arxiv.org/abs/2601.05150) |
| `11d89184` | **Forged Assistant Message Jailbreak** | Gemini 2.0 Flash Preview Image Generation | 2025-07-07 | [arXiv:2507.04673](https://arxiv.org/abs/2507.04673) |
| `6223971e` | **Dynamic Prompt Jailbreak** | DALL-E 3, DeepSeek V3, Flux Schnell, GPT-3.5 Turbo, GPT-4.1, InternVL 2 2B, Qwen 2.5 7B Instruct, ShieldLM 7B | 2025-05-25 | [arXiv:2505.18979](https://arxiv.org/abs/2505.18979) |
| `1e87082b` | **Memory Inception Jailbreak** | GPT-3.5, GPT-4o, GPT-5, DALL-E, Midjourney, Stable Diffusion | 2025-04-29 | [arXiv:2504.20376](https://arxiv.org/abs/2504.20376) |
| `9d17f3d1` | **Metaphor-Based T2I Jailbreak** | DALL-E 3, Flux, Llama 3 8B Instruct, Midjourney, Stable Diffusion v1.4, Stable Diffusion XL | 2025-03-23 | [arXiv:2503.17987](https://arxiv.org/abs/2503.17987) |
| `a8264644` | **Semantic Confusion Jailbreak** | GPT-4o, Midjourney, Stable Diffusion, SD v1.4, SD v2.1 | 2024-12-11 | [arXiv:2412.08156](https://arxiv.org/abs/2412.08156) |
| `78e5fbe9` | **Perceptual Text-to-Image Jailbreak** | Cogview3, Dall-e 2, DALL-E 3, GPT-3.5 Turbo, GPT-4, Hunyuan, Sdxl, Tongyiwanxiang | 2024-08-20 | [arXiv:2408.10848](https://arxiv.org/abs/2408.10848) |

> 注：`b226dc51` Full-Spectrum Diffusion Attack、`4eb7bd09` Cross-Modal Toxic Continuation、`208d9224` LLM Risk Amplification 标题含 diffusion/image，但受影响模型为 Vicuna/LLaVA/GPT-4，属 VLM 而非 T2I，未计入上表。

### 3B. vision 标签完整 131 条清单（按发布日期倒序，前 30 条）

| ID | 名称 | 模型 | 发布日期 | 来源 |
|---|---|---|---|---|
| `41ff4d29` | Selective refusal gaps in visual question answering | InternVL3 2B/78B, Qwen 2.5 VL 3B/72B, GPT-5, Gemini 2.5 Flash 等 | 2026-09-04 | [arXiv:2609.04720](https://arxiv.org/abs/2609.04720) |
| `f34622ab` | Visual prompt injection crosses document trust boundaries | claude-opus-4-7, GPT-5.5, Gemini 3.1 Pro 等 | 2026-09-03 | [arXiv:2609.04533](https://arxiv.org/abs/2609.04533) |
| `1b9be65b` | PII leakage in document-image redaction benchmarks | GLiNER 系列, Qwen3-VL-32B, GPT-5.4/5.5 | 2026-09-02 | [arXiv:2609.02207](https://arxiv.org/abs/2609.02207) |
| `ba55f451` | Information-Overloading Jailbreaks in VLMs | Qwen3-VL 8B, InternVL3.5-8B 等 | 2026-07-03 | [arXiv:2607.02961](https://arxiv.org/abs/2607.02961) |
| `957aef84` | Multilingual Flowchart Jailbreaks in VLMs | Qwen 2.5 VL 3B, Gemma-4-E4B-it, Pangea-7B | 2026-06-05 | [arXiv:2606.07706](https://arxiv.org/abs/2606.07706) |
| `fdbaadb0` | Query-Agnostic Poisoning of Medical Multimodal RAG | GPT-4o, Gemini 2.5 Flash, CLIP 等 | 2026-05-11 | [arXiv:2605.10253](https://arxiv.org/abs/2605.10253) |
| `80228888` | Visual-Modality Jailbreaks Bypass VLM Safety Alignment | GPT-5.2, Gemini 3 Flash/3.1 Pro, Qwen3-VL | 2026-05-01 | [arXiv:2605.00583](https://arxiv.org/abs/2605.00583) |
| `42e67145` | Diverse VLA Linguistic Fragility | Pi-Zero, OpenVLA 7B | 2026-04-07 | [arXiv:2604.05595](https://arxiv.org/abs/2604.05595) |
| `16766413` | Physical Infrared Semantic Disruption | InstructBLIP | 2026-04-03 | [arXiv:2604.03117](https://arxiv.org/abs/2604.03117) |
| `5a088378` | Observation Poisons Agent Memory | GPT-5 Mini/5.2, Qwen3-VL-32B | 2026-04-03 | [arXiv:2604.02623](https://arxiv.org/abs/2604.02623) |
| `f6bbe8e7` | Semantic Masking Image Jailbreak | Sora, Stable Diffusion v1.4 | 2026-04-02 | [arXiv:2604.01888](https://arxiv.org/abs/2604.01888) |
| `0a0e0bf4` | VLM Visual-Textual Misalignment | LLaVA 1.5 7B/13B, DeepSeek VL 1.3B | 2026-04-01 | [arXiv:2604.01010](https://arxiv.org/abs/2604.01010) |
| `fe828a0d` | Invisible Visual Prompt Injection | GPT-4o, GPT-5 | 2026-03-31 | [arXiv:2603.29418](https://arxiv.org/abs/2603.29418) |
| `594d72fa` | X-Shaped Sparse VLM Attack | InstructBLIP | 2026-03-30 | [arXiv:2603.28568](https://arxiv.org/abs/2603.28568) |
| `6186791a` | Agentic Robot Instruction Attack | — | 2026-03-26 | [arXiv:2603.24935](https://arxiv.org/abs/2603.24935) |
| `e4a25cd8` | VLM Image-Shift Jailbreak | LLaVA 1.5 7B, ShareGPT4V 7B | 2026-03-18 | [arXiv:2603.17372](https://arxiv.org/abs/2603.17372) |
| `805e92ef` | VLM E-commerce Attack Surface | Qwen 2.5 VL 7B, LLaVA 1.5 7B | 2026-03-17 | [arXiv:2603.16960](https://arxiv.org/abs/2603.16960) |
| `b3f726b4` | Visual Confused Deputy Attack | Claude 3.7 Sonnet | 2026-03-16 | [arXiv:2603.14707](https://arxiv.org/abs/2603.14707) |
| `f7e2cb95` | Reasoning-Oriented Jailbreak | Qwen2-VL 7B, GPT-4o, Claude 3.7 Sonnet | 2026-03-10 | [arXiv:2603.09246](https://arxiv.org/abs/2603.09246) |
| `fdd8bcae` | Assembling Malice From Benign | GPT-4o, Gemini 2.0/2.5 Flash, InternVL3 9B | 2026-03-08 | [arXiv:2603.07590](https://arxiv.org/abs/2603.07590) |
| `4f906d66` | Two-Frame Infilling Jailbreak | — | 2026-03-07 | [arXiv:2603.07028](https://arxiv.org/abs/2603.07028) |
| `7a0e9325` | MLLM Multi-Paradigm Collaborative | Qwen 2.5 VL 7B, InternVL3 8B, GPT-4o/5 | 2026-03-05 | [arXiv:2603.04846](https://arxiv.org/abs/2603.04846) |
| `9ddbbb5a` | Inter-Turn Modality Jailbreak | Gemini 2.5/3 Flash, GPT-4o, Claude Sonnet 4 | 2026-03-03 | [arXiv:2603.02482](https://arxiv.org/abs/2603.02482) |
| `1bfdf93c` | Video-LLM Token Flood | LLaVA-NeXT-Video 7B, Qwen3-VL 4B | 2026-03-02 | [arXiv:2603.01454](https://arxiv.org/abs/2603.01454) |
| `53603418` | Multi-Image Semantic Reconstruction | Gemini 2.5 Flash Thinking/Pro, GPT-4o/5 Chat | 2026-02-28 | [arXiv:2603.00565](https://arxiv.org/abs/2603.00565) |
| `495ebfbf` | Safety Guidance Harm Collision | GPT-4o, Stable Diffusion | 2026-02-24 | [arXiv:2602.20880](https://arxiv.org/abs/2602.20880) |
| `bb3fdadb` | Discrete Token Subversion | Llama 2 7B | 2026-02-20 | [arXiv:2602.18252](https://arxiv.org/abs/2602.18252) |
| `4c89787c` | Visual Memory Multi-Turn Manipulation | Qwen 2.5 VL 7B, Qwen3-VL 8B 等 | 2026-02-17 | [arXiv:2602.15927](https://arxiv.org/abs/2602.15927) |
| `31681274` | Multi-Modal Expansion Jailbreak | GPT-4o, Claude 3 Haiku, Llama 4 Maverick | 2026-02-17 | [arXiv:2603.10010](https://arxiv.org/abs/2603.10010) |
| `ed359e0b` | Vision-Text Adaptive Jailbreak | GPT-4o, Llama 3.2 11B, Mistral 7B | 2026-02-16 | [arXiv:2602.14399](https://arxiv.org/abs/2602.14399) |

（余 101 条覆盖 2026-02-12 → 2023-06-22。）

---

## 统计小结

### 总量

| 数据源 | 总量 | 图像相关 | 判定口径 |
|---|---|---|---|
| AVID（2026 全库 1712 条） | 1712 | **9**（+1 相关 R0413） | artifact 含 DALL-E3 / Sora 的护栏越狱条目 |
| 0DIN 公开披露（92 条） | 92 | **9** | 标题/模型含 DALL-E3 / Sora / NSFW |
| promptfoo LM Security DB（vision 标签） | **131** | **12**（T2I 为直接目标） | affectedModels 含 DALL-E/Midjourney/SD/Flux/GPT Image/Sora |
| HuggingFace 0dinai/public-disclosures | ❌ 不可达 | — | 见"未能获取" |

**三源去重后图像生成越狱独立事件 ≈ 9（0DIN/AVID 同批）+ 12（promptfoo 论文索引）= 21 条**（口径不同：前者为厂商护栏众测披露，后者为论文索引）。

### 按 Tactic 名称聚类（AVID 9 条）

| Tactic 聚类 | 条数 | AVID 编号 |
|---|---|---|
| Historical / 历史语境类 | 3 | R0098, R0105, R0089 |
| Anatomy / 解剖学类 | 2 | R0091, R0097 |
| Artistic / 艺术话语类 | 2 | R0101, R0100 |
| Framework Simulation / 框架模拟 | 1 | R0096 |
| Surprise Attack | 1 | R0107 |

### 三层分类分布（AVID 图像簇，15 个组合，含重复）

- **Category**：Possible Worlds 6 · Rhetoric 5 · Language 5 · Stratagems 1 · Fictionalizing 1
- **Strategy**：World Building 5 · Persuasion and Manipulation 4 · Stylizing 4 · Socratic Questioning / Meta Prompting / Prompt Injection / Re-storying / Emulations 各 1
- **Technique**：Scenarios 5 · Synonymous Language 4 · Surprise Attack 2 · Identity Characteristics / Escalating / Latent Space Distraction / Perspective Shifting / Unreal Computing / Goal Hijacking / Strong Arm Attack 各 1

**主导模式**：`Possible Worlds / World Building / Scenarios`（5）+ `Language / Stylizing / Synonymous Language`（4）合计占 60% —— 即"把违规图像请求搬进虚构历史/艺术世界，并用同义改写规避关键词"。

### 提交者排行（AVID 图像簇 9 条 + R0413）

| 研究员 | 条数 | 涉及条目 |
|---|---|---|
| **Anonymous** | 4 | R0091, R0096, R0100, R0101 |
| **Edward Morris** | 2 | R0097, R0105 |
| **Mike Takahashi (@TakSec)** | 2 | R0089, R0107 |
| Miller Engelbrecht | 1 | R0098 |
| Jim Nightingale / Mindgard | 1 | R0413（非 0DIN 批次） |

### 其他分布

- **受影响系统**：DALL-E3 7 条 · OpenAI Sora 2 条。**无 gpt-image-1 / GPT-4o 图像 / Midjourney / Stable Diffusion / Gemini 图像 的 AVID 越狱条目**。
- **SIS 等级**：Level 1 Minimal 7 · Level 2 Moderate 1（R0089）· 异常值 1（R0100 误填 NIRS 值）。
- **Report Type**：9 条全为 `Issue`（区别同批多模型条目的 `Measurement`），均无 Metrics 表。
- **0DIN 侧**：91/92 为 Low；图像 9 条全部 Low、全部 `Guardrail Jailbreak` 边界、全部向厂商披露于 **2025-03-13**，公开发布窗口 2025-08-12 → 2025-09-30。
- **promptfoo 侧**：vision 131 条跨度 2023-06-22 → 2026-09-04；2026 年 41 条、2025 年 66 条、2024 年 12 条、2023 年 4 条。T2I 目标 12 条中 `6b0ce948` 是唯一覆盖 gpt-image 系列（GPT Image 1.5 / Gemini 3 Pro Image / Seedream 4.5 / Flux 2.0）的条目。

---

## 未能获取的部分（明确清单，无编造）

1. **HuggingFace 数据集 `0dinai/public-disclosures` —— 完全不可达**。`web_fetch` 与 shell 双通道均失败：
   - `https://huggingface.co/datasets/0dinai/public-disclosures` → `fetch failed` / TLS `基础连接已经关闭`
   - `https://huggingface.co/api/datasets/0dinai/public-disclosures` → 同上
   - `https://datasets-server.huggingface.co/rows?...` → 同上
   - `https://datasets-server.huggingface.co/splits?...` → 同上
   → **无法提供 HF 结构化版本**。表 2 由 0DIN 官网 92 条披露逐页抓取 + 9 条详情页独立构建，字段均来自 0din.ai 一手页面，非 HF 数据。
2. **AVID 站内 `/search` 未使用**：该页 JS 动态渲染，抓取无结果；改用官方 GitHub 报告库（AVID 每条目页脚即链接此库）全量克隆，覆盖 1712/1712 份 2026 报告，完整性优于站内搜索。
3. **0DIN 完整报告未获取**：9 条详情页均显示 "Unlock the Full Intelligence Report" —— 完整 Prompt 与变体、检测签名属付费 Threat Feed。0DIN 标称 92 public / 790 hidden，790 条客户专属报告不在公开范围。
4. **模型字段为空的条目**：promptfoo 中 `6186791a, 4f906d66, 41deb652, 673c810d, 6e02997d, 15cefe98, ae5d5754, 21e994da, 1b75115b, 8b39e9ea` 共 10 条 `affectedModels` 为 `[]`，已如实标为 "—"。
5. **不存在的编号（已核实，未编造）**：AVID-2026 中**没有**图像生成越狱条目落在 R0061、R0070、R0082–R0088、R0090、R0092–R0095、R0099、R0102–R0104、R0106、R0108–R0110；这些编号实际对应多模型文本类越狱或不相关 CVE。**任务前提中"R0061/R0070/R0090 属于该簇"经核实不成立**。
6. **AVID 2025 目录（25 份）无任何 DALL-E/Sora/Midjourney/SD 记录**；2022（5 份）、2023（3 份）同样无。

### 数据质量提示

- 0DIN 详情页的 NIRS（裸体影像评级系统）与 SIS 是两套独立标度，AVID 导入时 **R0100 把 NIRS 值写进了 SIS 字段**，属导入缺陷，已在上表标注。
- AVID-2026-R0107 描述文本写 "affecting multiple models"，但 artifacts 仅 `System:DALL-E3`，描述与结构化字段不一致。
- AVID 图像 9 条**均无 0DIN 测试分数表**（对比 R0061 等 Measurement 条目有 5–7 个模型的分数），因 Report Type 为 `Issue`。
