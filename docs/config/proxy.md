---
title: 代理配置
---

# 代理配置

通过 `config.yaml` 控制是否设置系统代理与代理服务端口。

```yaml
proxy:
  system: true
  hostname: 127.0.0.1
  port: 2023
  tun: false
```

- `system` 是否设置系统代理
- `hostname` 代理主机名
- `port` 代理端口
- `tun` 是否启用 TUN 模式

## macOS 已有视频号转发规则时启动失败

如果 API 服务短暂启动后退出，终端出现「设置 HTTP 代理失败，exit status 14」，请检查下载器是否正在尝试修改 macOS 的系统代理。

如果你已通过 macOS 自动代理配置（PAC）或其他工具将视频号请求转发到 `127.0.0.1:2023`，请在**当前解压目录**的 `config.yaml` 中修改已有的 `proxy` 段：

```yaml
proxy:
  enabled: true
  system: false
  hostname: "127.0.0.1"
  port: 2023
  tun: false
```

保存后重新启动下载器，确认 API 服务和代理服务均已启动，再重新打开视频号页面。对于使用 iKuuu TUN 和 macOS PAC 的用户，由 PAC 将视频号请求发给下载器。其他请求沿用现有网络路由。仅关闭 `proxy.system` 不会自动建立转发规则。

## TUN 模式

TUN 模式在网络层截获流量，无需修改系统代理即可将目标域名的请求转发到代理服务。适用于不希望改动系统代理，或需要代理非 HTTP 流量的场景。

开启后会创建一个虚拟网卡，将匹配的流量路由到下载器代理进行处理。此时 `system` 设置将被忽略，不会修改系统代理。

> **注意**：TUN 模式会修改系统路由表，与 VPN 类软件（Clash、Surge 等）同时使用时会产生路由冲突，导致部分网站访问缓慢。建议不要同时开启 TUN 模式和 VPN，或使用 Clash 的 Script 方式（见下方）替代 TUN 模式。

## 与 Clash 协同

当不希望修改系统代理时，可将 `system` 设为 `false`，并在 Clash 中加入以下 `Global Extend Script`，将流量转发到下载器代理服务（端口默认 `2023`）：

```js
function main(config, profileName) {
  config["proxy-groups"].unshift({
    name: 'ChannelsDownload',
    type: 'fallback',
    proxies: ["channels_download", "DIRECT"],
    interval: 5
  });
  config["proxies"].unshift({
    name: "channels_download",
    type: 'http',
    server: '127.0.0.1',
    port: 2023,
  });
  config.rules.unshift(...[
    "PROCESS-NAME,wx_video_download.exe,DIRECT",
    "PROCESS-NAME,wx_video_download,DIRECT",
    "DOMAIN-SUFFIX,qq.com,ChannelsDownload"
  ]);
  return config;
}
```
