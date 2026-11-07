/**
 * @file 用户主页
 */
(() => {
  var my_username = "";
  function __wx_insert_batch_download_btn() {
    const $operation = document.querySelector(".opr-area");
    if (!$operation) {
      return false;
    }
    const $btn = document.createElement("button");
    $btn.className = "button h-7 ml-2 weui-btn weui-btn_default weui-btn_mini";
    $btn.innerText = "批量下载";

    let is_running = false;
    let stop_signal = false;

    $btn.onclick = async () => {
      if (is_running) {
        stop_signal = true;
        $btn.innerText = "正在取消...";
        return;
      }
      is_running = true;
      stop_signal = false;

      $btn.innerText = "点击取消";
      $btn.classList.add("weui-btn_loading");
      // const $loading = document.createElement("i");
      // $loading.className = "weui-loading";
      // $btn.prepend($loading);

      const stop_loading = () => {
        $btn.classList.remove("weui-btn_loading");
        $btn.innerText = "批量下载";
        is_running = false;
      };

      try {
        if (!WXU.API.finderUserPage) {
          WXU.error({
            source: "channels.profile.js:41",
            msg: "API 未完成初始化",
          });
          return;
        }
        var { href } = window.location;
        if (!href) {
          WXU.error({ source: "channels.profile.js:48", msg: "当前 URL 为空" });
          return;
        }
        const queries = WXU.get_queries(href);
        WXU.log
          .Info()
          .Str("file", "channels.profile.js")
          .Str("href", href)
          .Msg("check has username in href");
        if (!queries.username) {
          WXU.error({
            source: "channels.profile.js:60",
            msg: "username 不能为空",
          });
          return;
        }
        const feeds = new Map();
        const seen_markers = new Set();
        let next_marker = "";
        while (!stop_signal) {
          const r = await WXU.API.finderUserPage({
            username: queries.username,
            finderUsername: my_username || queries.username,
            lastBuffer: next_marker,
            needFansCount: 0,
            objectId: "0",
          });
          if (r.errCode !== 0 || !Array.isArray(r.data?.object)) {
            throw new Error(r.errMsg || "未能读取账号作品");
          }
          for (const feed of r.data.object) {
            if (feed.id == null || feed.id === "") {
              throw new Error("作品缺少视频 ID，未提交批量下载");
            }
            feeds.set(String(feed.id), feed);
          }
          if (r.data.continueFlag === 0) {
            break;
          }
          const marker = r.data.lastBuffer;
          if (r.data.continueFlag !== 1 || !marker || seen_markers.has(marker)) {
            throw new Error("作品分页异常，未提交批量下载");
          }
          seen_markers.add(marker);
          next_marker = marker;
        }
        if (stop_signal) return;
        if (feeds.size === 0) {
          WXU.toast("该账号没有可下载的作品");
          return;
        }

        // Resolve conflicts once after scanning all pages. A page of already
        // downloaded videos says nothing about whether later pages exist.
        const [err, data] = await WXU.downloader.create([...feeds.values()], {
          platform: "wxchannels",
          ignore_live_feed: true,
        });
        if (data?.ids?.length) WXU.downloader.show();
        if (err) throw err;
        if (!data?.awaiting_conflicts) {
          WXU.toast(`已扫描 ${feeds.size} 条，创建 ${data?.ids?.length || 0} 个下载任务`);
        }
      } catch (error) {
        WXU.error({ source: "channels.profile.js", msg: error.message || String(error) });
      } finally {
        stop_loading();
      }
    };
    $operation.appendChild($btn);
    return true;
  }
  WXU.onInit((data) => {
    my_username = data.mainFinderUsername;
  });
  WXU.observe_node({
    selector: ".opr-area",
    container: "#app",
    onOk: () => {
      __wx_insert_batch_download_btn();
    },
  });
})();
