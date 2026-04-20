#!/usr/bin/env node

import fetch from 'node-fetch';

const BRIDGE_URL = 'http://localhost:3456';

console.log('\n🚀 Gmail MCP Bridge 快速功能测试\n');
console.log('=' .repeat(60));

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  tests: []
};
let latestHealth = null;

async function testFunction(name, testFn) {
  process.stdout.write(`⏳ 测试: ${name}...`);
  try {
    const result = await testFn();
    if (result.success) {
      console.log(` ✅ 通过`);
      if (result.detail) {
        console.log(`   ${result.detail}`);
      }
      results.passed++;
      results.tests.push({ name, status: 'passed', detail: result.detail });
    } else {
      console.log(` ❌ 失败`);
      console.log(`   原因: ${result.error}`);
      results.failed++;
      results.tests.push({ name, status: 'failed', error: result.error });
    }
  } catch (error) {
    console.log(` ❌ 异常`);
    console.log(`   错误: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'error', error: error.message });
  }
}

async function makeRequest(action, params = {}) {
  const response = await fetch(`${BRIDGE_URL}/mcp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params })
  });
  return response.json();
}

// 测试函数
const tests = {
  // 1. 账号管理
  async testGetAccounts() {
    const result = await makeRequest('getAccounts');
    if (result.success && result.data?.accounts) {
      const count = result.data.accounts.length;
      return { 
        success: count > 0, 
        detail: `检测到 ${count} 个账号`,
        error: count === 0 ? '没有检测到账号' : null
      };
    }
    return { success: false, error: result.error || '获取账号失败' };
  },

  // 2. 邮件列表
  async testEmailList() {
    const result = await makeRequest('getEmails');
    if (result.success && result.data) {
      const count = result.data.emails?.length || 0;
      return { 
        success: true, 
        detail: `获取到 ${count} 封邮件`
      };
    }
    return { success: false, error: result.error || '获取邮件失败' };
  },

  // 3. 账号切换
  async testAccountSwitch() {
    // 先获取账号列表
    const accountsResult = await makeRequest('getAccounts');
    if (!accountsResult.success || !accountsResult.data?.accounts?.length) {
      return { success: false, error: '没有可用账号进行切换测试' };
    }

    const accounts = accountsResult.data.accounts;
    if (accounts.length < 2) {
      return { success: true, detail: '只有一个账号，跳过切换测试' };
    }

    // 切换到非活动账号
    const targetAccount = accounts.find(acc => !acc.isActive);
    if (!targetAccount) {
      return { success: true, detail: '所有账号状态相同，跳过' };
    }

    const switchResult = await makeRequest('setActiveAccount', {
      accountEmail: targetAccount.email
    });

    if (switchResult.success) {
      return { 
        success: true, 
        detail: `成功切换到 ${targetAccount.email}`
      };
    }
    return { success: false, error: switchResult.error || '切换失败' };
  },

  // 4. 邮件搜索
  async testEmailSearch() {
    const result = await makeRequest('searchEmails', {
      query: 'is:unread',
      options: { maxResults: 5 }
    });
    
    if (result.success && result.data) {
      const count = result.data.emails?.length || 0;
      return { 
        success: true, 
        detail: `搜索到 ${count} 封未读邮件`
      };
    }
    return { success: false, error: result.error || '搜索失败' };
  },

  // 5. 特定账号邮件
  async testSpecificAccount() {
    const accountsResult = await makeRequest('getAccounts');
    if (!accountsResult.success || !accountsResult.data?.accounts?.length) {
      return { success: false, error: '没有可用账号' };
    }

    const account = accountsResult.data.accounts[0];
    const result = await makeRequest('getEmails', {
      accountEmail: account.email
    });

    if (result.success && result.data) {
      const count = result.data.emails?.length || 0;
      return { 
        success: true, 
        detail: `${account.email}: ${count} 封邮件`
      };
    }
    return { success: false, error: result.error || '获取失败' };
  },

  // 6. 重复账号处理
  async testDuplicateAccounts() {
    const result = await makeRequest('getAccounts');
    if (result.success && result.data?.accounts) {
      const accounts = result.data.accounts;
      const emailCounts = {};
      accounts.forEach(acc => {
        emailCounts[acc.email] = (emailCounts[acc.email] || 0) + 1;
      });
      
      const duplicates = Object.entries(emailCounts)
        .filter(([_, count]) => count > 1)
        .map(([email, count]) => `${email}(${count})`);
      
      if (duplicates.length > 0) {
        return { 
          success: true, 
          detail: `检测到重复账号: ${duplicates.join(', ')}`
        };
      }
      return { 
        success: true, 
        detail: '没有重复账号'
      };
    }
    return { success: false, error: '无法检查重复账号' };
  }
};

// 运行测试
async function runTests() {
  console.log('\n📋 开始测试...\n');

  // 检查连接
  try {
    const healthResponse = await fetch(`${BRIDGE_URL}/health`);
    const health = await healthResponse.json();
    latestHealth = health;
    if (health.status === 'ok') {
      console.log('✅ Bridge Server 连接正常');
      console.log(`   Chrome扩展: ${health.chromeConnected ? '已连接' : '未连接'}`);
      console.log();

      if (!health.chromeConnected) {
        console.log('⚠️  Chrome 扩展还没有连接到桥接服务。');
        console.log('   请先确认以下几项:');
        console.log('   1. Chrome 已打开并启用了 Gmail MCP Bridge 扩展');
        console.log('   2. 已打开 https://mail.google.com/ 并保持目标账号登录');
        console.log('   3. Gmail 标签页已经完全加载，必要时手动刷新一次');
        console.log('   4. 返回后重新运行 npm run test:bridge');
        return;
      }
    }
  } catch (error) {
    console.log('❌ 无法连接到 Bridge Server');
    console.log('   请确保 Bridge Server 正在运行: npm start');
    return;
  }

  // 运行测试
  await testFunction('获取账号列表', tests.testGetAccounts);
  await testFunction('获取邮件列表', tests.testEmailList);
  await testFunction('账号切换功能', tests.testAccountSwitch);
  await testFunction('邮件搜索功能', tests.testEmailSearch);
  await testFunction('特定账号邮件', tests.testSpecificAccount);
  await testFunction('重复账号处理', tests.testDuplicateAccounts);

  // 显示结果
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 测试结果汇总\n');
  
  const total = results.passed + results.failed;
  const passRate = total > 0 ? (results.passed / total * 100).toFixed(1) : 0;
  
  console.log(`✅ 通过: ${results.passed} 个测试`);
  console.log(`❌ 失败: ${results.failed} 个测试`);
  console.log(`📈 通过率: ${passRate}%`);

  if (results.failed > 0) {
    console.log('\n⚠️  失败的测试:');
    results.tests.filter(t => t.status !== 'passed').forEach(test => {
      console.log(`   • ${test.name}: ${test.error}`);
    });

    const accountErrors = results.tests.filter(
      t => t.name === '获取账号列表' && /timeout|没有检测到账号/i.test(t.error || '')
    );
    if (accountErrors.length > 0) {
      console.log('\n🔎 账号检测失败时，最常见原因是 Gmail 页面还没有准备好:');
      console.log('   • Chrome 里没有打开 Gmail 标签页');
      console.log('   • Gmail 标签页没登录目标账号');
      console.log('   • Gmail 标签页还没完全加载完成');
      console.log('   • 扩展已安装，但 Gmail 页面需要手动刷新一次');
    }

    if (latestHealth?.chromeConnected) {
      console.log('\n💡 当前桥接层已连接，问题更可能在 Gmail 页面状态，而不是 MCP 配置。');
    }
  }

  // 建议
  console.log('\n💡 Claude Desktop 测试建议:\n');
  
  if (results.passed === total) {
    console.log('所有功能测试通过！可以在 Claude Desktop 中使用以下命令:');
  } else {
    console.log('部分功能可能受限，但你仍可以尝试:');
  }
  
  console.log(`
  1. "列出所有Gmail账号"
  2. "显示我的邮件列表"
  3. "搜索未读邮件"
  4. "切换到 [你的邮箱]"
  5. "写邮件给 test@example.com"
  `);

  console.log('\n详细安装说明: docs/quick-start/codex.md');
}

// 执行
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
