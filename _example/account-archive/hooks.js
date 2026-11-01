// 按视频号账号名创建子目录；扩展名由下载器添加。
function onFilename(meta) {
  return {
    directories: [meta.author || "未知账号"],
    name: [meta.title || meta.filename || meta.id, meta.spec, meta.idx]
      .filter(Boolean).join("_"),
  };
}
