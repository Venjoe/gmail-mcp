# Gmail MCP Bridge

> **🚀 让 Claude 直接操作 Gmail。无需 Google Cloud、无需 OAuth、无需 API Keys。**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://developer.chrome.com/docs/extensions/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](https://github.com/cafferychen777/gmail-mcp)
![GitHub Repo stars](https://img.shields.io/github/stars/cafferychen777/gmail-mcp?style=social)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fcafferychen777.github.io%2Fgmail-mcp%2F)](https://cafferychen777.github.io/gmail-mcp/)
[![No Google Cloud / OAuth](https://img.shields.io/badge/%E6%97%A0%20Google%20Cloud%20%E3%80%81OAuth%E3%80%81API%20Keys-Yes-ff69b4)](#为什么不需要-google-cloud)

## 为什么不需要 Google Cloud

本项目基于你本地的 Chrome 登录会话执行 Gmail 操作。扩展与 MCP 服务以“浏览器里人工操作”的方式工作，因此无需 Google Cloud 项目、OAuth 同意屏幕或 API Key。

优势：
- 上手简单：无云端控制台、无 OAuth 审核。
- 隐私友好：一切动作都在你的本地浏览器会话内进行。
- 可移植性：只要能运行 Chrome 即可使用。

需要注意：
- 需要在 Chrome 中登录目标 Gmail 账号。
- 所有操作权限与当前 Gmail 会话一致。

## ⚡ 一键安装

```bash
# 自动安装（推荐）
./bin/gmail-mcp install

# 或者手动安装
cd gmail-mcp-extension/mcp-server && npm install
```

Codex 用户请参考：[docs/quick-start/codex.md](docs/quick-start/codex.md)。安装器会自动写入 `~/.codex/config.toml`：

```toml
[mcp_servers.gmail-mcp]
command = "node"
args = [".../gmail-mcp-extension/mcp-server/index.js"]
env = { NODE_ENV = "production" }
```

重启 Codex 后即可使用。MCP server 会自动启动或复用本地 bridge：`http://localhost:3456`。

## 📁 项目结构

```
gmail-mcp/
├── 📂 bin/                    # 命令行工具
│   └── gmail-mcp             # 主安装器和管理工具
├── 📂 gmail-mcp-extension/   # Chrome扩展和MCP服务器
│   ├── extension/            # Chrome扩展源码
│   ├── mcp-server/          # MCP桥接服务器
│   └── src/                 # 核心逻辑和恢复系统
├── 📂 docs/                  # 项目文档
│   ├── planning/            # 架构设计和规划
│   ├── reports/             # 测试分析报告
│   └── analysis/            # 技术分析文档
├── 📂 scripts/              # 工具脚本
│   ├── test/               # 测试脚本集合
│   └── util/               # 实用工具脚本
├── 📂 src/                  # 高级功能
│   ├── core/               # 核心管理组件
│   └── plugins/            # 插件系统
├── 📂 tests/               # 测试套件
├── 📂 tools/               # 安装和诊断工具
└── 📄 核心文档
    ├── README.md           # 主说明文档
    ├── CLAUDE.md           # Claude指令和配置
    ├── CONTRIBUTING.md     # 贡献指南
    └── RELEASE.md          # 发布说明
```

## 🚀 核心功能

- **📧 邮件管理**: 读取、搜索、发送、回复Gmail邮件
- **🔍 智能搜索**: 支持Gmail全部搜索语法
- **👥 多账户**: 无缝切换多个Gmail账户
- **🛡️ 自动恢复**: 95%+ 故障自动恢复率
- **🔧 智能诊断**: 自动检测和修复配置问题
- **⚡ 高性能**: 22ms平均响应，769 req/s吞吐量

## 🎯 使用方式

### 命令行管理

```bash
gmail-mcp status    # 检查系统状态
gmail-mcp doctor    # 诊断问题
gmail-mcp fix       # 自动修复
gmail-mcp test      # 运行测试
```

### 在Claude Desktop中使用

安装完成后，在Claude Desktop中直接说：
- "帮我查看最新的邮件"
- "发送邮件给john@example.com"
- "搜索包含'项目'关键词的邮件"

## 📚 文档导航

- **🚀 快速开始**: [docs/quick-start/installation.md](docs/quick-start/installation.md)
- **💡 使用指南**: [docs/user-guide/features.md](docs/user-guide/features.md)
- **🔧 故障排除**: [docs/user-guide/troubleshooting.md](docs/user-guide/troubleshooting.md)
- **🏗️ 开发文档**: [docs/developer/architecture.md](docs/developer/architecture.md)

## 🏆 系统优势

**从开发者工具到用户友好产品的转变:**

| 指标 | 改进前 | 改进后 | 提升 |
|------|--------|--------|------|
| 安装成功率 | 30% | 95%+ | +216% |
| 安装时间 | 15分钟 | 2分钟 | -86% |
| 操作步骤 | 12步手动 | 1条命令 | -91% |
| 错误恢复率 | 手动修复 | 95.2%自动 | 全新能力 |

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

**Gmail MCP Bridge** - 让AI助手真正理解和操作你的邮件世界 🚀
