# 06 密码学与 Web 安全

> 本章解决的问题：**看懂"信任"是怎么被建立、被利用、被摧毁的。**

密码学和 Web 安全是安全行业最常被问到、也最容易"会用不会懂"的两块。本章不追求成为密码学家，目标是：**能选对原语、看出误用、理解 Web 的信任边界，并能独立完成一次合法的 Web 应用测试。**

---

# 上半部分：密码学

## 一、先立三条规矩

1. **不要自己发明密码算法。** 用经过审查的库和协议。
2. **不要自己实现密码协议。** 除非你在做教学/研究，且明确标注" toy implementation, not for production"。
3. **密码学不是"加密一下"就安全。** 密钥管理、随机数、认证、重放、侧信道，任何一个环节错，整体就错。

---

## 二、核心概念

| 概念 | 一句话 | 安全目标 |
|---|---|---|
| 对称加密 | 同一密钥加解密 | 机密性 |
| 公钥加密 | 公钥加密、私钥解密 | 机密性、密钥交换 |
| 哈希 | 任意输入 → 固定长度摘要 | 完整性 |
| MAC | 带密钥的哈希 | 完整性与认证 |
| 数字签名 | 私钥签名、公钥验证 | 认证、完整性、不可否认 |
| KDF | 从弱秘密派生强密钥 | 抗暴力破解 |
| PRNG/CSPRNG | 伪随机/密码学安全随机 | 不可预测性 |
| PKI | 证书、CA、信任链 | 身份绑定 |
| TLS | 安全传输协议 | 机密性、完整性、认证 |

**安全定义（知道名字即可，不必背形式化）**：

- IND-CPA：选择明文攻击下的不可区分性。
- IND-CCA：选择密文攻击下的不可区分性。
- EUF-CMA：选择消息攻击下的存在性不可伪造。
- 认证加密（AEAD）：同时提供机密性和完整性，如 AES-GCM、ChaCha20-Poly1305。

---

## 三、对称加密

- **流密码**：RC4（已不安全）、ChaCha20；密钥流复用是致命错误。
- **块密码**：AES（128/192/256）、SM4；分组模式 ECB/CBC/CTR/GCM。
- **ECB**：相同明文块 → 相同密文块，泄露结构，禁止用于真实数据。
- **CBC**：需要随机 IV，存在填充 oracle 风险；MAC-then-Encrypt 容易出错。
- **CTR**：计数器不能重复； nonce 复用会直接泄露明文异或。
- **GCM**：AEAD，nonce 绝不能复用；复用会泄露认证密钥。
- **密钥管理**：KMS/HSM、密钥轮换、分离、最小权限、不要硬编码。

**常见误用**：

- 用 ECB 加密用户数据。
- 固定 IV/nonce。
- 用 `rand()` 生成密钥。
- 自己实现填充/去填充。
- 加密后不认证（malleability）。
- 把哈希当加密。

**实验**：

1. 用 OpenSSL 加密同一张图片，分别用 ECB/CBC/CTR，观察密文结构。
2. 在本地 toy 程序中复现 padding oracle（仅限自己写的代码）。
3. 用 Python `cryptography` 库实现 AES-GCM 加解密，测试篡改密文后的认证失败。

---

## 四、哈希、MAC 与密码存储

- **哈希**：SHA-256/SHA-3、BLAKE2/3；MD5/SHA-1 已不适合安全用途。
- **MAC**：HMAC-SHA256；不要用 `H(key || message)` 这种自制结构。
- **密码存储**：Argon2id（首选）、scrypt、bcrypt；加盐；调整成本参数。
- **KDF**：HKDF（密钥派生）、PBKDF2（兼容旧系统）。
- **常见攻击**：碰撞、长度扩展、彩虹表、离线爆破、GPU/ASIC 加速。

**实验**：

1. 比较 MD5/SHA-256/bcrypt/Argon2id 对同一密码的存储结果和验证时间。
2. 用 `hashcat` 在自己生成的哈希上做离线爆破，估算成本（仅限自己的数据）。
3. 复现 SHA-256 长度扩展攻击（教学用 toy 协议）。

---

## 五、公钥密码与协议

- **RSA**：密钥生成、OAEP 填充、签名（PSS）；不要用 textbook RSA。
- **Diffie-Hellman**：离散对数；需要认证，否则中间人。
- **ECDH/ECDSA/EdDSA**：椭圆曲线；曲线参数选择很重要。
- **ElGamal**：理解语义安全与随机性。
- **PKI**：X.509 证书、CA、CRL/OCSP、证书固定、CT 日志。
- **TLS 1.3**：1-RTT/0-RTT、前向保密、AEAD、证书认证；0-RTT 的重放风险。
- **SSH**：密钥认证、known_hosts、agent forwarding 风险。
- **OAuth 2.0/OIDC**：授权 vs 认证；PKCE；redirect_uri 校验；token 泄露。
- **JWT**：签名 vs 加密；`alg: none`、算法混淆、密钥混淆、过期/受众校验。

**实验**：

1. 用 OpenSSL 生成 RSA/EC 密钥、自签证书、CSR，搭建本地 HTTPS。
2. 用 Wireshark 看 TLS 1.3 握手，标出 ClientHello、ServerHello、证书、Finished。
3. 在本地 toy 应用中复现 JWT `alg:none` 和弱密钥签名，再修复。
4. 用 `openssl s_client` 检查一个站点的证书链、协议版本、 cipher suite。

---

## 六、后量子密码（PQC）

- 量子计算对 RSA/ECC 的威胁（Shor 算法）；对对称密码的威胁较小（Grover）。
- NIST 已标准化：ML-KEM（FIPS 203）、ML-DSA（FIPS 204）、SLH-DSA（FIPS 205），2024 年发布。
- 迁移策略：先做密码资产清单（crypto inventory），再混合部署（hybrid），最后全面替换。
- 注意：PQC 不是"换个算法"那么简单，涉及证书、协议、硬件、性能、合规。

> 事实核对：FIPS 203/204/205 于 2024 年 8 月由 NIST 发布。执行前以 NIST 官网为准。

---

## 七、密码学自测

1. 解释对称加密、公钥加密、哈希、MAC、签名分别解决什么问题，不能解决什么问题。
2. 为什么 ECB 不安全？CBC 的 IV 应该满足什么条件？
3. GCM 的 nonce 复用会怎样？为什么？
4. 为什么密码不能用 SHA-256 直接存？Argon2id 比 bcrypt 好在哪？
5. TLS 1.3 如何实现前向保密？0-RTT 有什么风险？
6. 解释证书链验证过程；什么情况下浏览器会拒绝证书？
7. JWT 的 `alg` 字段为什么危险？如何正确验证？
8. 什么是 padding oracle？它依赖什么条件？
9. 量子计算对 RSA/ECC/AES 分别有什么影响？
10. 如果你要为一个新系统选加密方案，你会怎么选？

---

## 八、密码学资源

**必读**

- Boneh《Cryptography I》（Coursera）。
- Aumasson《Serious Cryptography》。
- Katz & Lindell《Introduction to Modern Cryptography》（选读）。
- Crypto101（免费）。
- Cryptopals（编程练习）。

**工具/文档**

- OpenSSL 官方文档。
- `cryptography`（Python）文档。
- NIST FIPS 203/204/205。
- RFC 8446（TLS 1.3）。

---

# 下半部分：Web 安全

## 九、Web 的信任边界

一个 Web 请求经过：浏览器 → DNS → TCP → TLS → 反向代理 → 应用服务器 → 框架 → 业务代码 → 数据库/缓存/消息队列 → 第三方 API。

每个箭头都是信任边界：

- 浏览器不可信（用户可改一切）。
- 请求头/参数/Cookie 不可信。
- 反向代理与应用对路径/编码的理解可能不一致。
- 应用与数据库的权限边界。
- 第三方 SDK/API 的供应链风险。

**Web 安全的本质**：在不可信输入进入系统、在系统内流动、最终到达敏感操作（SQL、Shell、文件系统、模板、反序列化、HTTP 客户端）的路径上，建立正确的校验、编码、授权和隔离。

---

## 十、HTTP 与浏览器安全基础

- HTTP 方法、状态码、头、Cookie、缓存、内容协商。
- 同源策略（SOP）、CORS、预检请求。
- Cookie 属性：`HttpOnly`、`Secure`、`SameSite`、`Domain`、`Path`。
- 会话管理：Session ID、JWT、刷新令牌、注销、固定会话。
- CSRF：原理、Token、SameSite、双重提交。
- CSP：指令、nonce/hash、`unsafe-inline` 的风险、报告模式。
- 安全响应头：HSTS、X-Content-Type-Options、X-Frame-Options、Referrer-Policy、Permissions-Policy。
- 浏览器存储：localStorage/sessionStorage/IndexedDB 的 XSS 风险。
- 缓存：CDN、代理、浏览器缓存导致的敏感数据泄露。

---

## 十一、OWASP Top 10:2025

以下是 2025 版官方列表（核对日期 2026-11-01）。注意它与 2021 版有变化，学习和报告都以新版为准。

| 编号 | 名称 | 一句话 | 防御要点 |
|---|---|---|---|
| A01 | Broken Access Control | 该看的不该看的、该做的不该做的没管住 | 服务端强制授权、默认拒绝、对象级权限、避免 IDOR |
| A02 | Security Misconfiguration | 配置错误导致暴露 | 最小化、关闭默认账号/目录、分离环境、自动化基线 |
| A03 | Software Supply Chain Failures | 依赖/构建/分发链条被攻破 | SBOM、锁定版本、签名、可信源、CI 隔离 |
| A04 | Cryptographic Failures | 加密用错或没用 | 强算法、正确随机、密钥管理、全链路 TLS |
| A05 | Injection | 不可信数据被当成代码/命令 | 参数化、上下文编码、白名单、最小权限 |
| A06 | Insecure Design | 设计阶段就没考虑滥用 | 威胁建模、滥用案例、业务逻辑校验、限流 |
| A07 | Authentication Failures | 认证被绕过/撞库/弱口令 | MFA、抗枚举、限速、会话管理、密码策略 |
| A08 | Software or Data Integrity Failures | 更新/反序列化/CI 产物被篡改 | 签名验证、可信源、安全反序列化、完整性校验 |
| A09 | Security Logging and Alerting Failures | 出事了看不见 | 关键事件日志、集中化、告警、保留、防篡改 |
| A10 | Mishandling of Exceptional Conditions | 异常路径处理错误导致绕过/泄露 | 统一错误处理、失败默认拒绝、资源清理、边界测试 |

> 官方页面：<https://top10.owasp.org/2025/>。ASVS 5.0.0 于 2025 年 5 月发布，作为验证要求的参考：<https://asvs.dev/>。

### A01 访问控制

- 水平越权（IDOR）、垂直越权、上下文相关权限。
- 常见错误：只在前端隐藏按钮、只校验"是否登录"不校验"是否有权"、可预测 ID、批量接口漏校验。
- 测试：改 ID、改角色、改租户、改 HTTP 方法、直接访问 API、强制浏览。
- 防御：服务端统一授权中间件、对象级权限、默认拒绝、审计日志。

### A02 安全配置错误

- 默认账号/密码、暴露的管理面板、目录列表、调试模式、详细错误、未使用的端口/服务。
- 云存储公开、CORS 过宽、TLS 弱配置、缺失安全头。
- 防御：基础设施即代码基线、CIS Benchmark、配置扫描、环境隔离。

### A03 软件供应链

- 依赖混淆、 typosquatting、恶意包、被接管的维护者账号、CI 凭证泄露、构建产物篡改。
- 防御：SBOM、锁定文件、私有 registry、依赖审核、签名（Sigstore/cosign）、SLSA、最小权限 CI。

### A04 密码学失败

- 明文传输、弱算法、硬编码密钥、固定 IV、错误模式、证书校验关闭。
- 防御：TLS 全站、HSTS、强算法、KMS、密钥轮换、代码扫描。

### A05 注入

- SQLi、NoSQLi、OS command、LDAP、XPath、模板注入、表达式注入、日志注入。
- 根因：数据与代码未分离。
- 防御：参数化查询、ORM 正确使用、上下文编码、白名单、禁用危险函数、最小权限。

### A06 不安全设计

- 业务逻辑漏洞：负数金额、重复领取、竞态、绕过流程、无限试用。
- 防御：滥用案例、状态机、服务端校验、幂等、限流、风控。

### A07 认证失败

- 弱口令、撞库、 credential stuffing、会话固定、JWT 校验缺失、MFA 绕过、密码重置漏洞。
- 防御：MFA、抗枚举、限速、强密码策略、安全会话、重置令牌一次性。

### A08 完整性与反序列化

- 不安全的反序列化（Java/PHP/Python/.NET）、CI/CD 产物未签名、自动更新未校验。
- 防御：避免原生反序列化、白名单、签名验证、可信源、完整性监控。

### A09 日志与告警

- 登录失败、权限变更、敏感操作、异常输入没有日志；日志可被篡改；告警无人处理。
- 防御：结构化日志、集中化、保留策略、防篡改、告警分级、演练。

### A10 异常条件

- 异常路径返回默认允许、资源未释放、错误信息泄露、超时/部分失败导致状态不一致。
- 防御：统一异常处理、fail closed、资源清理、混沌测试、边界用例。

---

## 十二、Top 10 之外的常见 Web 漏洞

- SSRF：服务端请求伪造，打内网/云 metadata；防御：白名单、禁用危险协议、隔离网络。
- XXE：XML 外部实体；防御：禁用 DTD/外部实体。
- 反序列化：gadget 链；防御：避免原生反序列化、白名单、隔离。
- 请求走私：前后端对 `Content-Length`/`Transfer-Encoding` 解析不一致；防御：统一解析、禁用歧义、升级组件。
- 缓存投毒：未keyed 输入影响缓存；防御：正确 Vary、缓存键设计、不要缓存敏感响应。
- 竞态条件：并发下的 TOCTOU、重复兑换；防御：原子操作、锁、幂等。
- GraphQL： introspection、批量查询、深度递归、授权缺失。
- WebSocket：跨站劫持、消息注入、授权。
- OAuth/OIDC：redirect_uri、state、PKCE、token 泄露。
- 文件上传：类型绕过、路径穿越、解析器漏洞、存储型 XSS。
- 路径穿越：编码、双重编码、规范化差异。
- 开放重定向：钓鱼链、token 泄露。
- 子域接管： dangling DNS、过期云资源。
- 依赖混淆：内部包名被公共仓库抢注。

---

## 十三、Web 测试方法

1. **范围与授权**：书面 scope、时间窗、禁止项、应急联系人。
2. **信息收集**：域名、子域、端口、技术栈、公开代码、历史漏洞。
3. **映射**：爬虫 + 手工浏览 + API 文档 + 参数发现。
4. **认证/会话**：注册、登录、找回、MFA、注销、会话固定。
5. **授权**：角色矩阵、对象级、租户隔离。
6. **输入**：所有参数/头/Cookie/文件/JSON/XML。
7. **业务逻辑**：流程绕过、竞态、限额、优惠券、支付。
8. **客户端**：DOM XSS、CSP、postMessage、原型污染。
9. **验证与利用**：最小化 PoC，证明影响，不扩大破坏。
10. **报告**：标题、严重性、复现步骤、影响、证据、修复建议、参考。

**严重性**：用 CVSS 作为参考，但不要机械套分；结合业务影响、可利用性、数据敏感度。

---

## 十四、防御与工程化

- 威胁建模（STRIDE）：资产、信任边界、威胁、控制。
- 安全需求：认证、授权、输入校验、日志、加密、限流。
- 代码审计：source → sink 追踪；框架安全特性；第三方组件。
- SAST/DAST/SCA/IAST：知道它们能发现什么、漏什么。
- WAF：缓解，不是修复；规则会被绕过。
- 安全头/CSP：纵深防御，不是万能。
- 日志与监控：关键事件、异常、告警。
- 应急：漏洞披露、补丁、回滚、通知。

---

## 十五、Web 实验与交付

**必做靶场**：

- PortSwigger Web Security Academy（免费，首选）：Apprentice → Practitioner。
- OWASP Juice Shop（本地）。
- DVWA（本地）。
- WebGoat（本地）。
- HTB/TryHackMe 的 Web 路径（可选）。

**阶段 2 交付**：

- [ ] 50 个 PortSwigger lab 的简短 writeup（每篇：漏洞、利用、根因、修复）。
- [ ] 1 个自己写的漏洞应用 + 修复 diff。
- [ ] 1 份完整 Web 测试报告（含执行摘要、技术细节、修复建议）。
- [ ] 1 份代码审计报告（选一个开源小项目，找 3 个问题或证明没有）。
- [ ] 1 页"OWASP Top 10:2025 对我所在项目的映射"。

**自测**：

1. 水平越权和垂直越权的区别？如何在代码里定位？
2. XSS 的三种类型？CSP 能防哪一种、不能防哪一种？
3. CSRF 为什么在 SameSite 之后仍然存在？
4. SSRF 如何打云 metadata？如何防御？
5. SQLi 的根因是什么？预编译为什么有效？
6. 反序列化漏洞的利用条件是什么？
7. 请求走私的原理？如何检测和修复？
8. JWT 的常见错误有哪些？
9. 如何设计一个安全的密码重置流程？
10. 给你一个 Web 应用，你如何在 4 小时内完成一次基线测试？

---

## 十六、Web 资源

**必读**

- OWASP Top 10:2025。
- OWASP ASVS 5.0。
- OWASP Web Security Testing Guide（WSTG）。
- OWASP Cheat Sheet Series。
- PortSwigger Web Security Academy。

**书**

- 《The Web Application Hacker's Handbook》（经典，部分内容较旧）。
- 《Real-World Bug Hunting》。
- 《Bug Bounty Bootcamp》。
- 《白帽子讲 Web 安全》。
- 《Web 安全深度剖析》。

**实践**

- PortSwigger Academy。
- OWASP Juice Shop。
- DVWA/WebGoat。
- HackerOne/Bugcrowd 的公开报告（只读，不测试未授权目标）。
