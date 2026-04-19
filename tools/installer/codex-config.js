import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * Codex MCP configuration manager.
 *
 * Codex reads MCP servers from ~/.codex/config.toml using tables like:
 * [mcp_servers.gmail-mcp]
 * command = "node"
 * args = [".../mcp-server/index.js"]
 */
export class CodexConfigManager {
    constructor() {
        this.serverName = 'gmail-mcp';
        this.configPath = path.join(os.homedir(), '.codex', 'config.toml');
    }

    async updateConfig(installPath) {
        if (!installPath) {
            throw new Error('安装路径不能为空');
        }

        const serverScript = path.join(installPath, 'mcp-server', 'index.js');
        await fs.access(serverScript);

        await fs.mkdir(path.dirname(this.configPath), { recursive: true });

        const existing = await this._readConfigText();
        const block = this._buildServerBlock(serverScript);
        const content = this._upsertServerBlock(existing, block);

        await this._writeConfigText(content);

        return {
            configPath: this.configPath,
            serverScript
        };
    }

    async verify() {
        try {
            const content = await this._readConfigText();
            const block = this._findServerBlock(content);

            if (!block) {
                throw new Error('Codex Gmail MCP 配置未找到');
            }

            const commandMatch = block.match(/^\s*command\s*=\s*"([^"]+)"/m);
            const argsMatch = block.match(/^\s*args\s*=\s*\[\s*"([^"]+)"/m);

            if (!commandMatch || commandMatch[1] !== 'node') {
                throw new Error('Codex Gmail MCP command 配置无效');
            }

            if (!argsMatch) {
                throw new Error('Codex Gmail MCP args 配置无效');
            }

            const serverScript = this._unescapeTomlString(argsMatch[1]);
            await fs.access(serverScript);

            return {
                valid: true,
                configPath: this.configPath,
                serverScript
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message,
                configPath: this.configPath
            };
        }
    }

    async removeConfig() {
        const content = await this._readConfigText();
        const updated = this._removeServerBlock(content);
        if (updated !== content) {
            await this._writeConfigText(updated);
        }
        return true;
    }

    async getStatus() {
        const verification = await this.verify();

        if (verification.valid) {
            return {
                status: 'configured',
                message: 'Codex MCP 配置正常',
                details: {
                    configPath: verification.configPath,
                    serverScript: verification.serverScript
                }
            };
        }

        return {
            status: 'error',
            message: `Codex 配置问题: ${verification.error}`,
            details: {
                configPath: verification.configPath
            }
        };
    }

    _buildServerBlock(serverScript) {
        return [
            `[mcp_servers.${this.serverName}]`,
            'command = "node"',
            `args = ["${this._escapeTomlString(serverScript)}"]`,
            'env = { NODE_ENV = "production" }',
            ''
        ].join('\n');
    }

    async _readConfigText() {
        try {
            return await fs.readFile(this.configPath, 'utf-8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                return '';
            }
            throw error;
        }
    }

    async _writeConfigText(content) {
        const normalized = content.endsWith('\n') ? content : `${content}\n`;
        const tempPath = `${this.configPath}.tmp`;
        await fs.writeFile(tempPath, normalized, 'utf-8');
        await fs.rename(tempPath, this.configPath);
    }

    _upsertServerBlock(content, block) {
        const withoutExisting = this._removeServerBlock(content).trimEnd();
        return withoutExisting ? `${withoutExisting}\n\n${block}` : block;
    }

    _removeServerBlock(content) {
        const pattern = new RegExp(
            `(^|\\n)\\[mcp_servers\\.${this._escapeRegExp(this.serverName)}\\][\\s\\S]*?(?=\\n\\[[^\\n]+\\]|$)`,
            ''
        );
        return content.replace(pattern, (match, prefix) => prefix || '').trimEnd();
    }

    _findServerBlock(content) {
        const pattern = new RegExp(
            `(^|\\n)(\\[mcp_servers\\.${this._escapeRegExp(this.serverName)}\\][\\s\\S]*?)(?=\\n\\[[^\\n]+\\]|$)`,
            ''
        );
        const match = content.match(pattern);
        return match ? match[2] : null;
    }

    _escapeTomlString(value) {
        return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    _unescapeTomlString(value) {
        return value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    _escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
