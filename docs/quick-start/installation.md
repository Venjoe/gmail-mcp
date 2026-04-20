# 2分钟快速安装指南

> **目标：**从零开始，2分钟内完成Gmail MCP Bridge的完整安装和配置

## 📋 安装前准备

**你需要：**
- Chrome 浏览器
- Node.js（版本18+）
- 5分钟时间

**检查Node.js版本：**
```bash
node --version
```
如果显示版本号（如 `v18.17.0`），说明已安装。如果提示"命令未找到"，请先[安装Node.js](https://nodejs.org/)。

---

## 🚀 第一步：下载和准备

### 0. 一键安装（推荐）
```bash
cd ~/gmail-mcp || git clone https://github.com/Venjoe/gmail-mcp.git && cd gmail-mcp
./bin/gmail-mcp install
```
若遇到问题或希望手动操作，请按以下步骤继续。

### 1.1 下载项目
```bash
cd ~
git clone https://github.com/Venjoe/gmail-mcp.git
cd gmail-mcp/gmail-mcp-extension
```

### 1.2 安装依赖
```bash
cd mcp-server
npm install
```

等待安装完成，看到"dependencies installed"即可。

---

## 🔌 第二步：安装Chrome扩展

### 2.1 打开Chrome扩展页面
1. 打开Chrome浏览器
2. 地址栏输入：`chrome://extensions/`
3. 按回车键

### 2.2 开启开发者模式
**在扩展页面右上角**，找到"开发者模式"，**点击开关开启**
> 📷 [需要截图：显示开发者模式开关的位置]

### 2.3 加载扩展
1. 点击**"加载已解压的扩展程序"**按钮
2. 选择文件夹：`~/gmail-mcp/gmail-mcp-extension/extension`
3. 点击**"选择"**

### 2.4 记录扩展ID
扩展安装成功后，你会看到类似这样的ID：
```
扩展ID：abcdefghijklmnopqrstuvwxyz123456
```
**把这个ID复制下来**，下一步需要用到。

---

## 🔗 第三步：启动服务

### 3.1 启动Bridge服务器
```bash
cd ~/gmail-mcp/gmail-mcp-extension/mcp-server
npm run bridge
```

看到以下信息表示启动成功：
```
Gmail Bridge Server running on http://localhost:3456
```

**保持这个终端窗口开着，不要关闭！**

### 3.2 测试连接
打开新的终端窗口，运行：
```bash
curl http://localhost:3456/health
```

如果返回类似这样的内容，说明服务正常：
```json
{"status":"ok","chromeConnected":true}
```

如果返回 `chromeConnected: false`，先不要继续排查 MCP 配置。优先检查：

1. Chrome 是否已经打开
2. 扩展是否已启用
3. 是否已打开 `https://mail.google.com/`
4. Gmail 页面是否已经完全加载
5. 刷新 Gmail 标签页后再测试一次

---

## ⚙️ 第四步：配置Claude Desktop

### 4.1 找到Claude Desktop配置文件

**Mac用户：**
```bash
open ~/Library/Application\ Support/Claude/
```

**Windows用户：**
按 `Win+R`，输入 `%APPDATA%\Claude`

**Linux用户：**
```bash
cd ~/.config/Claude/
```

### 4.2 编辑配置文件

找到或创建文件 `claude_desktop_config.json`，添加以下配置：

```json
{
  "mcpServers": {
    "gmail-mcp": {
      "command": "node",
      "args": ["$HOME/gmail-mcp/gmail-mcp-extension/mcp-server/index.js"]
    }
  }
}
```

**重要：**若你的仓库路径不同，请将 `$HOME/gmail-mcp` 改为你的实际路径。

### 4.3 重启Claude Desktop

完全退出Claude Desktop，然后重新打开。

---

## ✅ 第五步：验证安装

### 5.1 检查扩展状态
1. 点击Chrome工具栏中的Gmail MCP Bridge图标
2. 应该显示："Bridge server connected"
3. 状态为绿色

### 5.2 打开Gmail
在Chrome中打开：https://mail.google.com
确保已登录你的Gmail账户，并把 Gmail 页面完整加载出来。
第一次测试前，建议手动刷新一次 Gmail 标签页。

### 5.3 测试Claude集成
在Claude Desktop中输入：
```
"显示我的最近邮件"
```

如果Claude能返回你的邮件列表，恭喜！安装成功！

---

## 🚨 常见问题快速修复

### 问题1："Bridge server not connected"
**解决方案：**
```bash
# 重启Bridge服务器
cd ~/gmail-mcp/gmail-mcp-extension/mcp-server
npm run bridge
```

然后确认：
1. Chrome 仍然开着
2. Gmail 标签页仍然开着
3. 扩展图标显示正常

### 问题2："Chrome扩展无响应"
**解决方案：**
1. 打开 `chrome://extensions/`
2. 找到"Gmail MCP Bridge"
3. 点击"刷新"按钮
4. 切回 Gmail 标签页并手动刷新页面

### 问题3："获取账号列表超时" 或 "没有检测到账号"
**解决方案：**
1. 打开 `https://mail.google.com/`
2. 确认已经登录目标账号
3. 等待邮箱页面完全加载
4. 重新运行：

```bash
curl http://localhost:3456/health
npm run test:bridge
```

### 问题4："Claude中看不到Gmail工具"
**解决方案：**
1. 检查`claude_desktop_config.json`文件路径是否正确
2. 完全重启Claude Desktop
3. 确保Bridge服务器在运行

### 问题5："端口3456已被占用"
**解决方案：**
```bash
# 查找占用进程
lsof -i :3456
# 终止进程（替换PID为实际进程号）
kill -9 PID
# 重新启动Bridge服务器
npm run bridge
```

---

## 📞 获得帮助

如果按照以上步骤仍然无法正常工作：

1. **查看详细故障排除指南：**[../user-guide/troubleshooting.md](../user-guide/troubleshooting.md)
2. **提交问题：**[GitHub Issues](https://github.com/Venjoe/gmail-mcp/issues)
3. **加入讨论：**[GitHub Discussions](https://github.com/Venjoe/gmail-mcp/discussions)

---

## ✨ 下一步

安装完成后，学习如何使用Gmail MCP Bridge：
- [首次使用教程](first-use.md) - 学习基本操作
- [功能详解](../user-guide/features.md) - 了解所有功能
- [使用技巧](../user-guide/advanced-usage.md) - 高级用法

---

**🎉 欢迎使用Gmail MCP Bridge！**

这个安装指南有帮到你吗？如果有改进建议，请告诉我们！
