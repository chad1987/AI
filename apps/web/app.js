const API_BASE = 'http://localhost:8080';
const deviceListEl = document.getElementById('deviceList');
const refreshBtn = document.getElementById('refreshBtn');
const sessionInfoEl = document.getElementById('sessionInfo');

const homeScreen = document.getElementById('homeScreen');
const appScreens = {
  phone: document.getElementById('phoneScreen'),
  messages: document.getElementById('messagesScreen'),
  camera: document.getElementById('cameraScreen'),
  settings: document.getElementById('settingsScreen'),
};

const callBtn = document.getElementById('callBtn');
const dialInput = document.getElementById('dialInput');
const callResult = document.getElementById('callResult');

const sendMsgBtn = document.getElementById('sendMsgBtn');
const messageInput = document.getElementById('messageInput');
const messageResult = document.getElementById('messageResult');

const snapBtn = document.getElementById('snapBtn');
const cameraResult = document.getElementById('cameraResult');

const airplaneMode = document.getElementById('airplaneMode');
const silentMode = document.getElementById('silentMode');
const settingsResult = document.getElementById('settingsResult');

const homeBtn = document.getElementById('homeBtn');
const clockEl = document.getElementById('clock');

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

function wirePhoneApps() {
  document.querySelectorAll('.app-icon').forEach((icon) => {
    icon.addEventListener('click', () => {
      showApp(icon.dataset.app);
    });
  });

  homeBtn.addEventListener('click', goHome);

  callBtn.addEventListener('click', () => {
    const number = dialInput.value.trim();
    callResult.textContent = number ? `正在呼叫 ${number}...` : '请输入有效号码';
  });

  sendMsgBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    messageResult.textContent = text ? '短信已发送（模拟）' : '请输入短信内容';
  });

  snapBtn.addEventListener('click', () => {
    cameraResult.textContent = `拍照成功（模拟） ${new Date().toLocaleTimeString()}`;
  });

  function updateSettings() {
    settingsResult.textContent = `飞行模式: ${airplaneMode.checked ? '开' : '关'}，静音: ${silentMode.checked ? '开' : '关'}`;
  }

  airplaneMode.addEventListener('change', updateSettings);
  silentMode.addEventListener('change', updateSettings);

  setInterval(() => {
    clockEl.textContent = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, 1000);
}

refreshBtn.addEventListener('click', loadDevices);
wirePhoneApps();
loadDevices();
