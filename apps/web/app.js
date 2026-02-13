const API_BASE = 'http://localhost:8080';
const deviceListEl = document.getElementById('deviceList');
const refreshBtn = document.getElementById('refreshBtn');
const sessionInfoEl = document.getElementById('sessionInfo');
const screenPlaceholder = document.getElementById('screenPlaceholder');

function statusClass(status) {
  return status === 'running' ? 'status-running' : 'status-stopped';
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
  screenPlaceholder.innerHTML = '<span>会话已创建：下一步将这里替换成 WebRTC 视频组件</span>';
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

refreshBtn.addEventListener('click', loadDevices);
loadDevices();
