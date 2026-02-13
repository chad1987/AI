# Cloud Phone Web (Starter)

这是网页版云手机项目的第一阶段开发脚手架，包含：

- `apps/api`: 基础控制平面 API（Python 标准库实现，无第三方依赖）
- `apps/web`: 浏览器控制台原型（设备列表 + 会话创建 + iPhone 原型界面）

## 快速启动

### 1) 启动 API

```bash
python3 apps/api/server.py
```

默认监听 `http://localhost:8080`。

### 2) 启动 Web

```bash
python3 -m http.server 5173 --directory apps/web
```

打开 `http://localhost:5173`。

## 当前已实现

- 健康检查：`GET /health`
- 设备列表：`GET /api/devices`
- 创建会话：`POST /api/sessions`
- 前端支持：
  - 设备列表加载与连接
  - iPhone 原型外观（状态栏、主屏、Home）
  - 预装 APP 且可运行：
    - 淘宝（商品搜索与列表）
    - 京东（商品搜索与列表）
    - 备忘录（本地保存）
    - 计算器（四则运算表达式）


## 下一步（建议）

- 接入 WebRTC 信令与媒体通道
- 增加登录鉴权（JWT/OIDC）
- 引入设备生命周期管理（开机/关机/重启）
- 增加审计日志与指标采集
