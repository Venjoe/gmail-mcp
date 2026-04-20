import readline from 'readline';
import { promisify } from 'util';

/**
 * 用户界面管理器
 * 
 * Linus 风格设计:
 * 1. 简洁明了 - 用户应该清楚地知道正在发生什么
 * 2. 零歧义 - 每个状态都有明确的视觉反馈
 * 3. 实用主义 - 不要花哨的动画，要实用的信息
 */
export class UserInterface {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        // 颜色代码 - 用数据而非函数
        this.COLORS = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            bold: '\x1b[1m',
            dim: '\x1b[2m'
        };
        
        // 符号 - 统一的视觉语言
        this.SYMBOLS = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            progress: '⏳',
            arrow: '→',
            bullet: '•'
        };
    }

    /**
     * 显示欢迎信息
     */
    showWelcome() {
        const banner = [
            this._colorize('bold', '🚀 Gmail MCP Bridge 自动安装器'),
            '',
            '这个安装器将自动配置以下组件:',
            `${this.SYMBOLS.bullet} MCP 服务器`,
            `${this.SYMBOLS.bullet} Claude Desktop 配置`,
            `${this.SYMBOLS.bullet} Chrome 扩展设置`,
            '',
            '安装过程大约需要 2 分钟...',
            ''
        ];
        
        console.log(banner.join('\n'));
    }

    /**
     * 显示进度条
     * 简单有效，没有复杂的动画
     */
    showProgress(percentage, message) {
        const width = 40;
        const filled = Math.round(width * percentage);
        const empty = width - filled;
        
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        const percent = Math.round(percentage * 100);
        const progressText = `${this.SYMBOLS.progress} [${this._colorize('cyan', bar)}] ${percent}% - ${message}`;
        
        // 在非交互终端里退化成普通输出，避免 clearLine/cursorTo 崩溃
        if (this._canRewriteLine()) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(progressText);
        } else {
            console.log(progressText);
        }
        
        if (percentage >= 1) {
            process.stdout.write('\n');
        }
    }

    /**
     * 显示成功信息
     */
    showSuccess(message) {
        console.log(`${this.SYMBOLS.success} ${this._colorize('green', message)}`);
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        console.log(`${this.SYMBOLS.error} ${this._colorize('red', message)}`);
    }

    /**
     * 显示警告信息
     */
    showWarning(message) {
        console.log(`${this.SYMBOLS.warning} ${this._colorize('yellow', message)}`);
    }

    /**
     * 显示信息
     */
    showInfo(message) {
        console.log(`${this.SYMBOLS.info} ${this._colorize('blue', message)}`);
    }

    /**
     * 用户确认对话框
     */
    async confirm(question) {
        return new Promise((resolve) => {
            this.rl.question(
                `${this.SYMBOLS.arrow} ${question} (y/N): `,
                (answer) => {
                    resolve(answer.toLowerCase().startsWith('y'));
                }
            );
        });
    }

    /**
     * 用户输入
     */
    async prompt(question, defaultValue = '') {
        return new Promise((resolve) => {
            const promptText = defaultValue 
                ? `${this.SYMBOLS.arrow} ${question} [${defaultValue}]: `
                : `${this.SYMBOLS.arrow} ${question}: `;
                
            this.rl.question(promptText, (answer) => {
                resolve(answer.trim() || defaultValue);
            });
        });
    }

    /**
     * 显示系统诊断结果
     */
    showDiagnosisResult(diagnosis) {
        console.log('\n' + this._colorize('bold', '🔍 系统诊断结果'));
        console.log('─'.repeat(50));
        
        if (diagnosis.overall === 'ready') {
            this.showSuccess('系统已准备就绪，可以开始安装！');
        } else {
            this.showWarning(`发现 ${diagnosis.issues} 个问题需要解决:`);
        }
        
        console.log();
        
        // 显示详细检查结果
        for (const check of diagnosis.details) {
            const status = check.satisfied ? this.SYMBOLS.success : this.SYMBOLS.error;
            const color = check.satisfied ? 'green' : 'red';
            
            console.log(`${status} ${check.name}: ${this._colorize(color, check.current || '未检测到')}`);
            
            if (check.issue) {
                console.log(`   ${this._colorize('dim', check.issue)}`);
            }
            
            if (check.satisfied && !check.isRecommended && check.name.includes('Node')) {
                console.log(`   ${this._colorize('yellow', '建议升级到推荐版本以获得最佳体验')}`);
            }
        }
        
        console.log();
    }

    /**
     * 显示安装步骤开始
     */
    showStepStart(stepName, stepNumber, totalSteps) {
        console.log(`\n${this._colorize('bold', `步骤 ${stepNumber}/${totalSteps}`)} ${this.SYMBOLS.arrow} ${stepName}`);
    }

    /**
     * 显示安装步骤完成
     */
    showStepComplete(stepName) {
        this.showSuccess(`已完成: ${stepName}`);
    }

    /**
     * 显示错误详情和建议
     */
    showErrorWithSuggestion(error, suggestion) {
        this.showError(`错误: ${error.message}`);
        
        if (error.step) {
            console.log(`   ${this._colorize('dim', `失败步骤: ${error.step}`)}`);
        }
        
        if (suggestion) {
            console.log(`   ${this.SYMBOLS.info} ${this._colorize('blue', `建议: ${suggestion}`)}`);
        }
        
        if (error.originalError && error.originalError.code) {
            console.log(`   ${this._colorize('dim', `错误代码: ${error.originalError.code}`)}`);
        }
    }

    /**
     * 显示配置备份信息
     */
    showBackupInfo(backups) {
        if (backups.length === 0) {
            this.showInfo('没有需要备份的现有配置');
            return;
        }
        
        console.log(`\n${this._colorize('bold', '📁 配置备份')}`);
        for (const backup of backups) {
            console.log(`${this.SYMBOLS.bullet} ${backup.name}: ${this._colorize('dim', backup.backup)}`);
        }
    }

    /**
     * 显示安装完成摘要
     */
    showInstallSummary(summary) {
        console.log('\n' + this._colorize('bold', '🎉 安装完成摘要'));
        console.log('─'.repeat(50));
        
        console.log(`${this.SYMBOLS.success} MCP 服务器: ${this._colorize('green', summary.serverPath)}`);
        console.log(`${this.SYMBOLS.success} Claude 配置: ${this._colorize('green', '已更新')}`);
        console.log(`${this.SYMBOLS.success} 扩展配置: ${this._colorize('green', '已配置')}`);
        
        if (summary.backupsCreated > 0) {
            console.log(`${this.SYMBOLS.info} 配置备份: ${summary.backupsCreated} 个文件已备份`);
        }
        
        console.log();
    }

    /**
     * 显示命令使用帮助
     */
    showHelp() {
        const help = [
            this._colorize('bold', '📖 Gmail MCP Bridge 命令帮助'),
            '',
            this._colorize('bold', '基本命令:'),
            '  gmail-mcp install    安装和配置所有组件',
            '  gmail-mcp status     检查当前安装状态',
            '  gmail-mcp doctor     诊断系统问题',
            '  gmail-mcp fix        尝试自动修复问题',
            '  gmail-mcp test       测试功能是否正常',
            '  gmail-mcp uninstall  完全卸载',
            '',
            this._colorize('bold', '高级命令:'),
            '  gmail-mcp config     管理配置文件',
            '  gmail-mcp logs       查看日志文件',
            '  gmail-mcp backup     手动备份配置',
            '  gmail-mcp restore    恢复备份配置',
            '',
            this._colorize('bold', '选项:'),
            '  --verbose, -v        显示详细输出',
            '  --force, -f          强制执行（跳过确认）',
            '  --dry-run           仅显示将要执行的操作',
            '  --help, -h          显示此帮助信息',
            ''
        ];
        
        console.log(help.join('\n'));
    }

    /**
     * 显示测试结果
     */
    showTestResults(results) {
        console.log('\n' + this._colorize('bold', '🧪 功能测试结果'));
        console.log('─'.repeat(50));
        
        for (const test of results.tests) {
            const status = test.passed ? this.SYMBOLS.success : this.SYMBOLS.error;
            const color = test.passed ? 'green' : 'red';
            
            console.log(`${status} ${test.name}: ${this._colorize(color, test.status)}`);
            
            if (test.details) {
                console.log(`   ${this._colorize('dim', test.details)}`);
            }
            
            if (!test.passed && test.suggestion) {
                console.log(`   ${this.SYMBOLS.info} ${this._colorize('blue', test.suggestion)}`);
            }
        }
        
        console.log();
        
        if (results.overall === 'success') {
            this.showSuccess('所有测试通过！系统运行正常。');
        } else {
            this.showError(`${results.failed}/${results.total} 个测试失败`);
        }
    }

    /**
     * 颜色化文本
     */
    _colorize(color, text) {
        if (!this.COLORS[color]) {
            return text;
        }
        return `${this.COLORS[color]}${text}${this.COLORS.reset}`;
    }

    /**
     * 清理资源
     */
    close() {
        this.rl.close();
    }

    /**
     * 等待用户按键继续
     */
    async waitForKey(message = '按任意键继续...') {
        return new Promise((resolve) => {
            this.rl.question(
                `${this.SYMBOLS.arrow} ${this._colorize('dim', message)}`,
                () => resolve()
            );
        });
    }

    /**
     * 显示加载动画
     */
    showSpinner(message) {
        const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let i = 0;
        
        const interval = setInterval(() => {
            if (this._canRewriteLine()) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`${spinnerChars[i]} ${message}`);
            } else {
                // Fallback for older Node.js versions or non-TTY environments
                process.stdout.write(`\r${spinnerChars[i]} ${message}`);
            }
            i = (i + 1) % spinnerChars.length;
        }, 100);
        
        return {
            stop: () => {
                clearInterval(interval);
                if (this._canRewriteLine()) {
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                } else {
                    process.stdout.write('\r' + ' '.repeat(message.length + 2) + '\r');
                }
            }
        };
    }

    /**
     * 显示选择菜单
     */
    async showMenu(title, options) {
        console.log('\n' + this._colorize('bold', title));
        console.log('─'.repeat(title.length));
        
        for (let i = 0; i < options.length; i++) {
            console.log(`  ${i + 1}) ${options[i].label}`);
            if (options[i].description) {
                console.log(`     ${this._colorize('dim', options[i].description)}`);
            }
        }
        
        console.log(`  0) 退出`);
        
        while (true) {
            const choice = await this.prompt('\n请选择');
            const index = parseInt(choice) - 1;
            
            if (choice === '0') {
                return null; // 退出
            }
            
            if (index >= 0 && index < options.length) {
                return options[index];
            }
            
            this.showError('无效选择，请重试');
        }
    }

    _canRewriteLine() {
        return Boolean(
            process.stdout &&
            process.stdout.isTTY &&
            typeof process.stdout.clearLine === 'function' &&
            typeof process.stdout.cursorTo === 'function'
        );
    }
}
