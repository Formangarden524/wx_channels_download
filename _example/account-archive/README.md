# 按视频号账号名归档下载

使用下载器的 `onFilename` Hook，将新下载的视频保存到“下载根目录/账号名/”中，无需修改程序本体。本示例已在 macOS arm64 的 v260907 程序上实际验证；其他版本需确认支持 `download.hooksScript` 和 `onFilename`。

## 使用方法

1. 备份现有 `config.yaml`，将本目录的 `hooks.js` 复制到下载器目录。如果已有 hooks.js，请合并 `onFilename`，不要覆盖其他 Hook，也不要重复定义该函数。
2. 在现有配置中合并下面的字段，保留其他配置；不要重复添加 `download` 或 `channels` 节点。

```yaml
download:
  hooksScript: "/absolute/path/to/downloader/hooks.js"
  filenameTemplate: "{{filename}}_{{spec}}"
  dir: "/Users/YOUR_USERNAME/Movies"

channels:
  download:
    frontend: false
```

将 `hooksScript` 改为脚本的实际绝对路径，将 `dir` 改为需要保存的根目录。macOS 的“影片”通常对应 `/Users/你的用户名/Movies`。以上只是配置片段，不是完整配置文件。

3. 完全退出并重启下载器。
4. 手动打开目标视频号主页，使用原程序的批量下载按钮。建议先新下载一条视频检查结果。

## 保存效果

```text
影片/
└── 视频号账号名/
    └── 视频标题_清晰度.mp4
```

`directories` 设置相对于下载根目录的账号子目录；`name` 按标题、清晰度和可用的资源序号生成文件名。扩展名由下载器添加。作者信息为空时使用“未知账号”。

此示例适用于后台下载。它只影响新创建的下载资源，不会自动移动已下载文件，也不增加账号搜索或视频收集功能。按昵称归档时，同名账号会使用同一目录，账号改名后会使用新的目录。

如果只出现“账号名_标题.mp4”而没有子目录，请检查 Hook 路径是否正确、重启后是否加载，以及程序版本是否支持结构化的 `directories` 返回值；不要只依赖文件名模板中的斜杠。
