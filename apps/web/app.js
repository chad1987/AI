const API_BASE = 'http://localhost:8080';
const deviceListEl = document.getElementById('deviceList');
const refreshBtn = document.getElementById('refreshBtn');
const sessionInfoEl = document.getElementById('sessionInfo');

const homeScreen = document.getElementById('homeScreen');
const homeBtn = document.getElementById('homeBtn');
const clockEl = document.getElementById('clock');

const appScreens = {
  taobao: document.getElementById('taobaoScreen'),
  jd: document.getElementById('jdScreen'),
  notes: document.getElementById('notesScreen'),
  calculator: document.getElementById('calculatorScreen'),
};

const taobaoGoods = ['iPhone 手机壳', '蓝牙耳机', 'Type-C 充电线', '机械键盘', '运动手表'];
const jdGoods = ['65W 快充头', '无线鼠标', '移动硬盘 1TB', '路由器 AX3000', '显示器支架'];

function statusClass(status) {
  return status === 'running' ? 'status-running' : 'status-stopped';
}

function showApp(appName) {
  homeScreen.classList.add('hidden');
  Object.values(appScreens).forEach((el) => el.classList.add('hidden'));
  if (appScreens[appName]) {
    appScreens[appName].classList.remove('hidden');
  }
}

function goHome() {
  Object.values(appScreens).forEach((el) => el.classList.add('hidden'));
  homeScreen.classList.remove('hidden');
}

function renderList(el, items) {
  el.innerHTML = '';
  if (!items.length) {
    el.innerHTML = '<li>未找到相关商品</li>';
    return;
  }
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    el.appendChild(li);
  });
}

function safeEvalMath(expr) {
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
    throw new Error('仅支持数字和 + - * / ( )');
  }
  const result = Function(`"use strict"; return (${expr})`)();
  if (Number.isNaN(result) || !Number.isFinite(result)) {
    throw new Error('表达式无效');
  }
  return result;
}

async function createSession(deviceId) {
  const response = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '创建会话失败');
  }

  sessionInfoEl.textContent = JSON.stringify(data, null, 2);
}

function renderDevices(items) {
  deviceListEl.innerHTML = '';

  if (!items.length) {
    deviceListEl.innerHTML = '<div class="device-item">暂无设备</div>';
    return;
  }

  for (const device of items) {
    const wrap = document.createElement('div');
    wrap.className = 'device-item';
    wrap.innerHTML = `
      <div><strong>${device.name}</strong></div>
      <div class="device-meta">ID: ${device.id}</div>
      <div class="device-meta">Region: ${device.region}</div>
      <div class="device-meta">状态: <span class="${statusClass(device.status)}">${device.status}</span></div>
      <div style="margin-top:8px;">
        <button ${device.status !== 'running' ? 'disabled' : ''}>连接设备</button>
      </div>
    `;

    const btn = wrap.querySelector('button');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '连接中...';
      try {
        await createSession(device.id);
        btn.textContent = '已连接';
      } catch (error) {
        alert(error.message);
        btn.textContent = '连接设备';
        btn.disabled = false;
      }
    });

    deviceListEl.appendChild(wrap);
  }
}

async function loadDevices() {
  refreshBtn.disabled = true;
  refreshBtn.textContent = '刷新中...';
  try {
    const response = await fetch(`${API_BASE}/api/devices`);
    const data = await response.json();
    renderDevices(data.items || []);
  } catch (error) {
    deviceListEl.innerHTML = `<div class="device-item">加载失败: ${error.message}</div>`;
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = '刷新';
  }
}

function wirePreinstalledApps() {
  document.querySelectorAll('.app-icon').forEach((icon) => {
    icon.addEventListener('click', () => {
      showApp(icon.dataset.app);
    });
  });

  homeBtn.addEventListener('click', goHome);

  const tbKeyword = document.getElementById('tbKeyword');
  const tbSearchBtn = document.getElementById('tbSearchBtn');
  const tbList = document.getElementById('tbList');
  tbSearchBtn.addEventListener('click', () => {
    const keyword = tbKeyword.value.trim();
    const items = keyword ? taobaoGoods.filter((x) => x.includes(keyword)) : taobaoGoods;
    renderList(tbList, items);
  });
  renderList(tbList, taobaoGoods);

  const jdKeyword = document.getElementById('jdKeyword');
  const jdSearchBtn = document.getElementById('jdSearchBtn');
  const jdList = document.getElementById('jdList');
  jdSearchBtn.addEventListener('click', () => {
    const keyword = jdKeyword.value.trim();
    const items = keyword ? jdGoods.filter((x) => x.includes(keyword)) : jdGoods;
    renderList(jdList, items);
  });
  renderList(jdList, jdGoods);

  const notesInput = document.getElementById('notesInput');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const notesResult = document.getElementById('notesResult');
  notesInput.value = localStorage.getItem('cloudPhoneMemo') || '';
  saveNoteBtn.addEventListener('click', () => {
    localStorage.setItem('cloudPhoneMemo', notesInput.value);
    notesResult.textContent = `已保存 ${new Date().toLocaleTimeString()}`;
  });

  const calcExpr = document.getElementById('calcExpr');
  const calcBtn = document.getElementById('calcBtn');
  const calcResult = document.getElementById('calcResult');
  calcBtn.addEventListener('click', () => {
    try {
      const expr = calcExpr.value.trim();
      const value = safeEvalMath(expr);
      calcResult.textContent = `结果: ${value}`;
    } catch (error) {
      calcResult.textContent = `错误: ${error.message}`;
    }
  });

  setInterval(() => {
    clockEl.textContent = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, 1000);
}

refreshBtn.addEventListener('click', loadDevices);
wirePreinstalledApps();
loadDevices();
