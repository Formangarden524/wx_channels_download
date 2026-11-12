// 按视频号账号名创建子目录，扩展名由下载器添加。
function onFilename(meta) {
  const author = String(meta.author || "").trim().replace(/[/:\\]/g, "_");
  const account = author && author !== "." && author !== ".."
    ? author
    : "未知账号";

  return {
    directories: [account],
    name: [meta.filename || meta.title || meta.id || "视频", meta.spec, meta.idx]
      .filter(value => value !== undefined && value !== null && value !== "")
      .join("_"),
  };
}
