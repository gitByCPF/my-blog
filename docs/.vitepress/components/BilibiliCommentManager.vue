<script setup>
import { ref, computed, onMounted, nextTick } from "vue";

const API = {
  replyList: "/bili-api/x/msgfeed/reply",
  likeList: "/bili-api/x/msgfeed/like",
  deleteReply: "/bili-api/x/v2/reply/del",
  deleteMsg: "/bili-api/x/msgfeed/del",
};

// ---------- 状态 ----------
const cookieInput = ref("");
const isAuthed = ref(false);
const cookieStr = ref("");
const csrfToken = ref("");

const currentTab = ref("reply"); // reply 或 like
const replyItems = ref([]);
const likeItems = ref([]);
const replyCursor = ref({ id: 0, time: 0, is_end: false });
const likeCursor = ref({ id: 0, time: 0, is_end: false });
const replyLoading = ref(false);
const likeLoading = ref(false);
const replySelectedIds = ref(new Set());
const likeSelectedIds = ref(new Set());
const isLoading = ref(false);
const statusMessage = ref({ text: "", type: "" });
const deletedReplyCount = ref(0);
const deletedMsgCount = ref(0);
const progressInfo = ref({ current: 0, total: 0, text: "", type: "" });
const abortController = ref(null);
const replyAllLoaded = ref(false);
const likeAllLoaded = ref(false);
const isLoadingAll = ref(false);

// ---------- 滚动容器 ----------
const replyScrollContainer = ref(null);
const likeScrollContainer = ref(null);

// ---------- 工具 ----------
function showMessage(text, type = "success") {
  statusMessage.value = { text, type };
  setTimeout(() => (statusMessage.value = { text: "", type: "" }), 5000);
}

function updateProgress(current, total, text = "", type = "loading") {
  progressInfo.value = { current, total, text, type };
}

function clearProgress() {
  progressInfo.value = { current: 0, total: 0, text: "", type: "" };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uniqById(arr) {
  const map = new Map();
  for (const it of arr) if (!map.has(it.id)) map.set(it.id, it);
  return Array.from(map.values());
}

function formatTime(ts) {
  if (!ts) return "";
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------- API ----------
async function apiGet(url, params = {}) {
  const query = new URLSearchParams(params).toString();
  const final = url + (query ? `?${query}` : "");
  const res = await fetch(final, {
    method: "GET",
    headers: {
      "X-Bili-Cookie": cookieStr.value,
      "User-Agent": navigator.userAgent,
    },
    credentials: "include",
  });
  return await res.json().catch(() => null);
}

async function apiPostForm(url, formObj) {
  const body = new URLSearchParams(formObj).toString();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Bili-Cookie": cookieStr.value,
      "User-Agent": navigator.userAgent,
    },
    body,
    credentials: "include",
  });
  return await res.json().catch(() => null);
}

// ---------- 加载（并发优化版）----------
async function loadAllReplyFast() {
  const CONCURRENT = 3; // 并发数
  let currentCursor = { id: 0, time: 0 };
  
  abortController.value = new AbortController();
  
  // 实时更新到 replyItems，这样中断时数据已经在页面上了
  while (true) {
    if (abortController.value.signal.aborted) {
      // 中断时直接返回，数据已经在 replyItems 中
      return;
    }
    
    const tasks = [];
    
    // 创建并发任务
    for (let i = 0; i < CONCURRENT; i++) {
      const params = currentCursor.id
        ? { id: currentCursor.id, reply_time: currentCursor.time }
        : {};
      
      tasks.push(
        apiGet(API.replyList, params).then((res) => {
          const items = res?.data?.items || [];
          items.forEach((it) => (it._source = "reply"));
          return { items, cursor: res?.data?.cursor };
        })
      );
      
      // 更新光标（预估下一页）
      if (currentCursor.id) {
        currentCursor.id += 20;
        currentCursor.time -= 100;
      }
    }
    
    const batchResults = await Promise.all(tasks);
    let hasData = false;
    let isEnd = false;
    
    for (const result of batchResults) {
      if (result.items.length > 0) {
        hasData = true;
        // 实时添加到 replyItems
        replyItems.value.push(...result.items);
        replyItems.value = uniqById(replyItems.value);
      }
      if (result.cursor) {
        currentCursor.id = result.cursor.id || 0;
        currentCursor.time = result.cursor.time || result.cursor.reply_time || 0;
        isEnd = !!result.cursor.is_end;
      }
    }
    
    // 更新进度 - 显示已加载的消息数量
    updateProgress(replyItems.value.length, replyItems.value.length, `正在加载回复消息`, "loading");
    
    if (!hasData || isEnd) break;
    await sleep(100); // 避免请求过快
  }
}

async function loadAllLikeFast() {
  const CONCURRENT = 3;
  let currentCursor = { id: 0, time: 0 };
  
  abortController.value = new AbortController();
  
  // 实时更新到 likeItems，这样中断时数据已经在页面上了
  while (true) {
    if (abortController.value.signal.aborted) {
      // 中断时直接返回，数据已经在 likeItems 中
      return;
    }
    
    const tasks = [];
    
    for (let i = 0; i < CONCURRENT; i++) {
      const params = currentCursor.id
        ? { id: currentCursor.id, like_time: currentCursor.time }
        : {};
      
      tasks.push(
        apiGet(API.likeList, params).then((res) => {
          const items = res?.data?.total?.items || [];
          items.forEach((it) => {
            it._source = "like";
            it.title = it.item?.title || "(无标题)";
            it.counts = it.counts ?? 0;
            it.ctime = it.item?.ctime || 0;
            it.like_time = it.like_time || 0;
          });
          return { items, cursor: res?.data?.total?.cursor };
        })
      );
      
      if (currentCursor.id) {
        currentCursor.id += 20;
        currentCursor.time -= 100;
      }
    }
    
    const batchResults = await Promise.all(tasks);
    let hasData = false;
    let isEnd = false;
    
    for (const result of batchResults) {
      if (result.items.length > 0) {
        hasData = true;
        // 实时添加到 likeItems
        likeItems.value.push(...result.items);
        likeItems.value = uniqById(likeItems.value);
      }
      if (result.cursor) {
        currentCursor.id = result.cursor.id || 0;
        currentCursor.time = result.cursor.time || result.cursor.like_time || 0;
        isEnd = !!result.cursor.is_end;
      }
    }
    
    // 更新进度 - 显示已加载的消息数量
    updateProgress(likeItems.value.length, likeItems.value.length, `正在加载喜欢消息`, "loading");
    
    if (!hasData || isEnd) break;
    await sleep(100);
  }
}

async function loadMoreReply() {
  if (replyLoading.value || replyCursor.value.is_end) return;
  replyLoading.value = true;

  const params = replyCursor.value.id
    ? { id: replyCursor.value.id, reply_time: replyCursor.value.time }
    : {};

  const res = await apiGet(API.replyList, params);
  const items = res?.data?.items || [];

  for (const it of items) it._source = "reply";
  replyItems.value.push(...items);
  replyItems.value = uniqById(replyItems.value);

  if (res?.data?.cursor) {
    const c = res.data.cursor;
    replyCursor.value.id = c.id || 0;
    replyCursor.value.time = c.time || c.reply_time || 0;
    replyCursor.value.is_end = !!c.is_end;
    if (c.is_end) replyAllLoaded.value = true;
  } else {
    replyCursor.value.is_end = true;
    replyAllLoaded.value = true;
  }

  replyLoading.value = false;
}

async function loadMoreLike() {
  if (likeLoading.value || likeCursor.value.is_end) return;
  likeLoading.value = true;

  const params = likeCursor.value.id
    ? { id: likeCursor.value.id, like_time: likeCursor.value.time }
    : {};

  const res = await apiGet(API.likeList, params);
  const items = res?.data?.total?.items || [];

  for (const it of items) {
    it._source = "like";
    it.title = it.item?.title || "(无标题)";
    it.counts = it.counts ?? 0;
    it.ctime = it.item?.ctime || 0;
    it.like_time = it.like_time || 0;
  }

  likeItems.value.push(...items);
  likeItems.value = uniqById(likeItems.value);

  const cursor = res?.data?.total?.cursor;
  if (cursor) {
    likeCursor.value.id = cursor.id || 0;
    likeCursor.value.time = cursor.time || cursor.like_time || 0;
    likeCursor.value.is_end = !!cursor.is_end;
    if (cursor.is_end) likeAllLoaded.value = true;
  } else {
    likeCursor.value.is_end = true;
    likeAllLoaded.value = true;
  }

  likeLoading.value = false;
}

// ---------- 当前 Tab 加载 ----------
async function loadMoreForTab(tab) {
  if (tab === "reply") await loadMoreReply();
  else await loadMoreLike();
}

// ---------- Cookie / 登录 ----------
async function saveCookie() {
  const cookie = cookieInput.value.trim();
  if (!cookie) return showMessage("请输入 Cookie", "error");
  const match = cookie.match(/bili_jct=([^;]+)/);
  if (!match) return showMessage("Cookie 中缺少 bili_jct", "error");
  if (!cookie.includes("SESSDATA="))
    return showMessage("Cookie 中缺少 SESSDATA", "error");
  
  // 临时保存 Cookie，用于验证
  cookieStr.value = cookie;
  csrfToken.value = match[1];
  
  // 验证 Cookie 是否有效
  showMessage("正在验证 Cookie...", "success");
  
  try {
    // 尝试加载第一页数据来验证 Cookie
    const res = await apiGet(API.replyList, {});
    
    // 检查响应状态
    if (!res) {
      cookieStr.value = "";
      csrfToken.value = "";
      return showMessage("网络请求失败，请检查网络连接", "error");
    }
    
    if (res.code !== 0) {
      // Cookie 无效
      cookieStr.value = "";
      csrfToken.value = "";
      const errorMsg = res.message || res.msg || "Cookie 验证失败";
      return showMessage(`验证失败：${errorMsg}`, "error");
    }
    
    // Cookie 有效，进入主界面
    isAuthed.value = true;
    showMessage("Cookie 验证成功！", "success");
    replyItems.value = [];
    likeItems.value = [];
    replyCursor.value = { id: 0, time: 0, is_end: false };
    likeCursor.value = { id: 0, time: 0, is_end: false };
    nextTick(() => loadMoreForTab(currentTab.value));
  } catch (e) {
    cookieStr.value = "";
    csrfToken.value = "";
    showMessage(`验证失败：${e.message}`, "error");
  }
}

function logout() {
  isAuthed.value = false;
  cookieInput.value = "";
  cookieStr.value = "";
  csrfToken.value = "";
  replyItems.value = [];
  likeItems.value = [];
  replySelectedIds.value = new Set();
  likeSelectedIds.value = new Set();
  deletedReplyCount.value = 0;
  deletedMsgCount.value = 0;
  replyAllLoaded.value = false;
  likeAllLoaded.value = false;
}

// ---------- 选择（优化版）----------
function toggleSelect(id, source = null) {
  if (source === "reply" || currentTab.value === "reply") {
    const s = replySelectedIds.value;
    if (s.has(id)) s.delete(id);
    else s.add(id);
    replySelectedIds.value = new Set(s);
  } else {
    const s = likeSelectedIds.value;
    if (s.has(id)) s.delete(id);
    else s.add(id);
    likeSelectedIds.value = new Set(s);
  }
}

// 加载全部数据
async function loadAllData() {
  if (currentTab.value === "reply") {
    isLoadingAll.value = true;
    showMessage("正在快速加载所有回复数据...", "success");
    try {
      await loadAllReplyFast();
      
      // 检查是否完整加载完成
      const wasAborted = abortController.value?.signal.aborted;
      if (wasAborted) {
        clearProgress();
        showMessage(`加载已中断，已加载 ${replyItems.value.length} 条回复`, "error");
      } else {
        replyAllLoaded.value = true;
        replyCursor.value.is_end = true;
        clearProgress();
        showMessage(`加载完成！共 ${replyItems.value.length} 条回复`, "success");
      }
    } catch (e) {
      clearProgress();
      showMessage("加载失败: " + e.message, "error");
    } finally {
      isLoadingAll.value = false;
      abortController.value = null;
    }
  } else {
    isLoadingAll.value = true;
    showMessage("正在快速加载所有喜欢数据...", "success");
    try {
      await loadAllLikeFast();
      
      // 检查是否完整加载完成
      const wasAborted = abortController.value?.signal.aborted;
      if (wasAborted) {
        clearProgress();
        showMessage(`加载已中断，已加载 ${likeItems.value.length} 条喜欢`, "error");
      } else {
        likeAllLoaded.value = true;
        likeCursor.value.is_end = true;
        clearProgress();
        showMessage(`加载完成！共 ${likeItems.value.length} 条喜欢`, "success");
      }
    } catch (e) {
      clearProgress();
      showMessage("加载失败: " + e.message, "error");
    } finally {
      isLoadingAll.value = false;
      abortController.value = null;
    }
  }
}

// 全选当前已加载的数据
function selectAll() {
  if (currentTab.value === "reply") {
    const arr = replyItems.value.map((c) => c.item?.subject_id || c.id);
    replySelectedIds.value = new Set(arr);
    showMessage(`已选中 ${arr.length} 条回复`, "success");
  } else {
    const arr = likeItems.value.map((c) => c.id);
    likeSelectedIds.value = new Set(arr);
    showMessage(`已选中 ${arr.length} 条喜欢`, "success");
  }
}

function deselectAll() {
  if (currentTab.value === "reply") {
    replySelectedIds.value = new Set();
  } else {
    likeSelectedIds.value = new Set();
  }
}

// ---------- 删除（并发优化版）----------
// helper: 找到分组 key（subject_id）对应的 items（reply）
function findReplyGroupBySubject(subjectId) {
  return replyItems.value.filter((it) => (it.item?.subject_id || it.id) === subjectId);
}

// 并发删除助手函数
async function batchProcess(tasks, concurrency = 5, onProgress) {
  const results = [];
  abortController.value = new AbortController();
  
  for (let i = 0; i < tasks.length; i += concurrency) {
    if (abortController.value.signal.aborted) {
      throw new Error("操作已取消");
    }
    
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((task) => task().catch((e) => ({ error: e })))
    );
    results.push(...batchResults);
    
    if (onProgress) {
      onProgress(Math.min(i + concurrency, tasks.length), tasks.length);
    }
    
    // 批次间短暂延迟，避免触发风控
    if (i + concurrency < tasks.length) {
      await sleep(200);
    }
  }
  
  return results;
}

function cancelOperation() {
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
  }
  isLoading.value = false;
  isLoadingAll.value = false;
  clearProgress();
  showMessage("操作已取消", "error");
}

// 主删除函数：同时处理 reply 和 like 选中的项（并发优化版）
async function performDelete(deleteReplyOption, deleteMsgOption) {
  if (!csrfToken.value) return showMessage("未解析到 bili_jct", "error");

  const replySel = Array.from(replySelectedIds.value);
  const likeSel = Array.from(likeSelectedIds.value);

  if (replySel.length === 0 && likeSel.length === 0) {
    return showMessage("请先选择要删除的项", "error");
  }

  const actionText = deleteReplyOption && deleteMsgOption
    ? "删除评论和消息通知"
    : deleteReplyOption
      ? "删除评论"
      : "删除消息通知";

  if (!confirm(`确定要${actionText}选中的 ${replySel.length + likeSel.length} 项？\n\n将使用并发处理加速删除过程。`)) return;

  isLoading.value = true;
  let localDeletedReply = 0;
  let localDeletedMsg = 0;

  try {
    const allTasks = [];
    const itemsToRemove = { reply: [], like: [] };

    // ---- 构建 reply 任务 ----
    for (const subjectId of replySel) {
      const items = findReplyGroupBySubject(subjectId);
      if (!items || items.length === 0) continue;

      const root = items[0]?.item?.target_id ?? items[0]?.target_id ?? items[0]?.item?.target_id;
      const rpid = root || items[0]?.id;

      // 删除评论任务
      if (deleteReplyOption) {
        allTasks.push(async () => {
          try {
            const r = await apiPostForm(API.deleteReply, {
              rpid,
              type: 1,
              csrf: csrfToken.value,
            });
            if (r?.code === 0) {
              localDeletedReply++;
              return { success: true, type: "reply" };
            }
            return { success: false, type: "reply", error: r };
          } catch (e) {
            return { success: false, type: "reply", error: e };
          }
        });
      }

      // 删除消息任务
      if (deleteMsgOption) {
        for (const it of items) {
          allTasks.push(async () => {
            try {
              const m = await apiPostForm(API.deleteMsg, {
                id: it.id,
                tp: 1,
                csrf: csrfToken.value,
              });
              if (m?.code === 0) {
                localDeletedMsg++;
                return { success: true, type: "msg" };
              }
              return { success: false, type: "msg", error: m };
            } catch (e) {
              return { success: false, type: "msg", error: e };
            }
          });
        }
      }

      itemsToRemove.reply.push(subjectId);
    }

    // ---- 构建 like 任务 ----
    for (const likeId of likeSel) {
      const item = likeItems.value.find((i) => i.id === likeId);
      if (!item) continue;

      // 删除评论任务
      if (deleteReplyOption) {
        const likeRpid = item.item?.item_id ?? item.item_id ?? null;
        if (likeRpid) {
          allTasks.push(async () => {
            try {
              const r = await apiPostForm(API.deleteReply, {
                rpid: likeRpid,
                type: 1,
                csrf: csrfToken.value,
              });
              if (r?.code === 0) {
                localDeletedReply++;
                return { success: true, type: "reply" };
              }
              return { success: false, type: "reply", error: r };
            } catch (e) {
              return { success: false, type: "reply", error: e };
            }
          });
        }
      }

      // 删除消息任务
      if (deleteMsgOption) {
        allTasks.push(async () => {
          try {
            const m = await apiPostForm(API.deleteMsg, {
              id: item.id,
              tp: 0,
              csrf: csrfToken.value,
            });
            if (m?.code === 0) {
              localDeletedMsg++;
              return { success: true, type: "msg" };
            }
            return { success: false, type: "msg", error: m };
          } catch (e) {
            return { success: false, type: "msg", error: e };
          }
        });
      }

      itemsToRemove.like.push(likeId);
    }

    // 执行并发删除
    updateProgress(0, allTasks.length, `正在删除`, "deleting");
    await batchProcess(allTasks, 8, (current, total) => {
      updateProgress(current, total, `正在删除`, "deleting");
    });

    // 从列表中移除已删除项
    replyItems.value = replyItems.value.filter(
      (i) => !itemsToRemove.reply.includes(i.item?.subject_id || i.id)
    );
    likeItems.value = likeItems.value.filter(
      (i) => !itemsToRemove.like.includes(i.id)
    );
    
    itemsToRemove.reply.forEach((id) => replySelectedIds.value.delete(id));
    itemsToRemove.like.forEach((id) => likeSelectedIds.value.delete(id));

    deletedReplyCount.value += localDeletedReply;
    deletedMsgCount.value += localDeletedMsg;

    clearProgress();
    showMessage(`删除完成：已删评论 ${localDeletedReply} 条，已删消息 ${localDeletedMsg} 条`, "success");
  } catch (e) {
    clearProgress();
    if (e.message === "操作已取消") {
      showMessage("删除已取消", "error");
    } else {
      showMessage("删除过程出错: " + e.message, "error");
    }
  } finally {
    isLoading.value = false;
    abortController.value = null;
  }
}

// ---------- Tab ----------
const switchTab = (tab) => {
  if (currentTab.value === tab) return;
  currentTab.value = tab;
  nextTick(() => {
    if (tab === "reply" && replyItems.value.length === 0) {
      loadMoreReply();
    } else if (tab === "like" && likeItems.value.length === 0) {
      loadMoreLike();
    }
  });
};

// ---------- 滚动监听 ----------
function onReplyScroll(e) {
  const container = e.target;
  if (replyLoading.value) return;
  if (replyCursor.value.is_end) return;
  const threshold = 50;
  const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
  if (isAtBottom) {
    loadMoreReply();
  }
}

function onLikeScroll(e) {
  const container = e.target;
  if (likeLoading.value) return;
  if (likeCursor.value.is_end) return;
  const threshold = 50;
  const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
  if (isAtBottom) {
    loadMoreLike();
  }
}

// ---------- 计算属性 ----------
const comments = computed(() =>
  currentTab.value === "reply" ? replyItems.value : likeItems.value
);
const totalCount = computed(() => comments.value.length);
const selectedCount = computed(() => 
  currentTab.value === "reply" ? replySelectedIds.value.size : likeSelectedIds.value.size
);
const currentSelectedIds = computed(() =>
  currentTab.value === "reply" ? replySelectedIds.value : likeSelectedIds.value
);
const isCurrentTabAllLoaded = computed(() =>
  currentTab.value === "reply" ? replyAllLoaded.value : likeAllLoaded.value
);

// ---------- 初始化 ----------
onMounted(() => {
  if (isAuthed.value) {
    loadMoreForTab(currentTab.value);
  }
});
</script>

<template>
  <div class="bili-comment-manager">
    <!-- 消息提示框 -->
    <div v-if="statusMessage.text" :class="['message-toast', `message-${statusMessage.type}`]">
      {{ statusMessage.text }}
    </div>

    <div v-if="!isAuthed" class="auth-section">
      <h2>🔑 输入 B站 Cookie</h2>
      <textarea
        v-model="cookieInput"
        rows="6"
        placeholder="SESSDATA=xxx; bili_jct=xxx; DedeUserID=xxx;"
      ></textarea>
      <button class="btn btn-primary btn-large" @click="saveCookie">
        ✓ 开始使用
      </button>
    </div>

    <div v-else class="comment-section">
      <div class="top-bar">
        <div class="stats-compact">
          <span>📝 当前页: {{ totalCount }} 条</span>
          <span>✓ 已选: {{ selectedCount }} 条</span>
          <span>🗑️ 已删评论: {{ deletedReplyCount }} 条</span>
          <span>📬 已删消息: {{ deletedMsgCount }} 条</span>
        </div>
        <button class="btn btn-logout" @click="logout">退出</button>
      </div>

      <div class="tab-container">
        <button
          :class="['tab', { active: currentTab === 'reply' }]"
          @click="switchTab('reply')"
        >
          <span class="tab-icon tab-icon-reply">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M15 2H3C2.4 2 2 2.4 2 3v8c0 .6.4 1 1 1h2v3c0 .4.3.7.7.7.2 0 .3-.1.4-.2l4.2-3.5H15c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1z"/>
            </svg>
          </span>
          <span class="tab-label">回复与@</span>
        </button>
        <button
          :class="['tab', { active: currentTab === 'like' }]"
          @click="switchTab('like')"
        >
          <span class="tab-icon tab-icon-like">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M9 3.5l-.9-.9C6.2 1.2 3.1 1.7 2 3.8c-.5 1-.7 2.5.3 4.4 1 2 3 4.3 6.7 7 3.7-2.7 5.7-5 6.7-7 1-1.9.8-3.4.3-4.4-1.1-2.1-4.2-2.6-6.1-1.2l-.9.9z"/>
            </svg>
          </span>
          <span class="tab-label">收到喜欢</span>
        </button>
      </div>

      <div class="actions-bar">
        <div class="load-action">
          <button 
            class="btn btn-primary" 
            @click="loadAllData" 
            :disabled="isLoadingAll || isLoading"
          >
            📥 加载全部数据
          </button>
        </div>
        <div class="select-actions">
          <button class="btn btn-secondary" @click="selectAll" :disabled="isLoading || isLoadingAll || totalCount === 0">
            全选当前 ({{ totalCount }})
          </button>
          <button class="btn btn-secondary" @click="deselectAll" :disabled="isLoading || isLoadingAll">取消选择</button>
        </div>
        <div class="delete-actions">
          <button
            class="btn btn-warning"
            @click="performDelete(true, false)"
            :disabled="(replySelectedIds.size===0 && likeSelectedIds.size===0) || isLoading || isLoadingAll"
          >
            🗑️ 删除评论
          </button>
          <button
            class="btn btn-danger"
            @click="performDelete(false, true)"
            :disabled="(replySelectedIds.size===0 && likeSelectedIds.size===0) || isLoading || isLoadingAll"
          >
            📬 删除消息通知
          </button>
          <button
            class="btn btn-danger"
            @click="performDelete(true, true)"
            :disabled="(replySelectedIds.size===0 && likeSelectedIds.size===0) || isLoading || isLoadingAll"
          >
            💣 删除评论&消息
          </button>
        </div>
      </div>

      <!-- 进度提示 -->
      <div v-if="progressInfo.total > 0" class="progress-container">
        <div class="progress-info-box">
          <div class="progress-header">
            <div class="progress-text">
              <span v-if="progressInfo.type === 'loading'">
                <span class="loading-spinner"></span>
                {{ progressInfo.text }}：已加载 <strong>{{ progressInfo.current }}</strong> 条
              </span>
              <span v-else-if="progressInfo.type === 'deleting'">
                {{ progressInfo.text }}：{{ progressInfo.current }}/{{ progressInfo.total }}
              </span>
            </div>
            <button class="btn btn-cancel-small" @click="cancelOperation">
              ❌ 中断
            </button>
          </div>
          <div v-if="progressInfo.type === 'deleting'" class="progress-track">
            <div 
              class="progress-fill" 
              :style="{ width: (progressInfo.current / progressInfo.total * 100) + '%' }"
            >
              <span class="progress-percent">
                {{ Math.round(progressInfo.current / progressInfo.total * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="comment-list-container">
        <!-- 回复列表 -->
        <div
          v-show="currentTab === 'reply'"
          class="comment-list"
          ref="replyScrollContainer"
          @scroll="onReplyScroll"
        >
          <div
            v-if="replyItems.length === 0 && !replyLoading"
            class="empty-state"
          >
            暂无数据
          </div>

          <div
            v-for="group in replyItems.reduce((acc, it) => {
              const key = it.item?.subject_id || it.id;
              let g = acc.find((g) => g.subject_id === key);
              if (!g) {
                g = {
                  subject_id: key,
                  title: it.item?.title || '(无标题)',
                  items: [],
                };
                acc.push(g);
              }
              g.items.push(it);
              return acc;
            }, [])"
            :key="group.subject_id"
            :class="[
              'comment-item',
              { selected: currentSelectedIds.has(group.subject_id) },
            ]"
          >
            <input
              type="checkbox"
              :checked="currentSelectedIds.has(group.subject_id)"
              @change="toggleSelect(group.subject_id, 'reply')"
            />
            <div class="comment-body">
              <div class="comment-content">{{ group.title }}</div>
              <div
                v-for="item in group.items.sort(
                  (a, b) => b.reply_time - a.reply_time
                )"
                :key="item.id"
                class="comment-meta"
              >
                <span>{{ formatTime(item.reply_time) }}</span
                >{{ item.item?.source_content }}
              </div>
            </div>
          </div>

          <div v-if="replyLoading" class="loading">
            <div class="spinner"></div>
            <p>正在加载更多...</p>
          </div>
        </div>

        <!-- 喜欢列表 -->
        <div
          v-show="currentTab === 'like'"
          class="comment-list"
          ref="likeScrollContainer"
          @scroll="onLikeScroll"
        >
          <div
            v-if="likeItems.length === 0 && !likeLoading"
            class="empty-state"
          >
            暂无数据
          </div>
          <div v-for="item in likeItems" :key="item.id" class="comment-item"
            :class="{ selected: currentSelectedIds.has(item.id) }"
          >
            <input
              type="checkbox"
              :checked="currentSelectedIds.has(item.id)"
              @change="toggleSelect(item.id, 'like')"
            />
            <div class="comment-body">
              <div class="comment-content">
                {{ item.title }}
              </div>
              <div class="comment-meta">
                <span class="meta-item">
                  <span class="meta-label">评论时间:</span>
                  <span class="meta-value">{{ formatTime(item.ctime) }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">收到喜欢:</span>
                  <span class="meta-value">{{ formatTime(item.like_time) }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">👍</span>
                  <span class="meta-value">{{ item.counts }} 个赞</span>
                </span>
              </div>
            </div>
          </div>
          <div v-if="likeLoading" class="loading">
            <div class="spinner"></div>
            <p>正在加载更多...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bili-comment-manager {
  max-width: 900px;
  margin: 0 auto;
  padding: 10px;
  font-family: "Microsoft YaHei", sans-serif;
  color: #333;
  position: relative;
}
.message-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease;
  max-width: 500px;
  word-wrap: break-word;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
.message-success {
  background-color: #52c41a;
  color: #fff;
}
.message-error {
  background-color: #ff4d4f;
  color: #fff;
}
textarea {
  width: 100%;
  font-family: monospace;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.btn {
  padding: 6px 12px;
  margin: 0 4px 4px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background-color: #007bff;
  color: #fff;
}
.btn-secondary {
  background-color: #6c757d;
  color: #fff;
}
.btn-warning {
  background-color: #ffc107;
  color: #212529;
}
.btn-danger {
  background-color: #dc3545;
  color: #fff;
}
.btn-logout {
  background-color: #e0e0e0;
  color: #333;
  float: right;
}
.btn-cancel {
  background-color: #6c757d;
  color: #fff;
}
.btn:hover {
  opacity: 0.85;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.stats-compact span {
  margin-right: 12px;
}
.tab-container {
  display: flex;
  margin-bottom: 12px;
  border-bottom: 1px solid #e3e5e7;
  background: #fff;
}
.tab {
  padding: 10px 24px;
  border: none;
  background: none;
  cursor: pointer;
  margin-right: 8px;
  font-size: 14px;
  color: #61666d;
  position: relative;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.tab:hover {
  color: #18191c;
}
.tab.active {
  color: #18191c;
  font-weight: 500;
  border-bottom-color: #00a1d6;
}
.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
.tab-icon-reply {
  background-color: #52c41a;
  color: #fff;
}
.tab-icon-like {
  background-color: #ff6699;
  color: #fff;
}
.tab-label {
  font-size: 13px;
  line-height: 1;
}
.actions-bar {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.load-action {
  display: flex;
  gap: 4px;
}
.select-actions {
  display: flex;
  gap: 4px;
}
.delete-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.progress-container {
  margin: 12px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}
.progress-info-box {
  width: 100%;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.progress-text {
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-text strong {
  color: #00a1d6;
  font-size: 16px;
}
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e9ecef;
  border-top-color: #00a1d6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.btn-cancel-small {
  padding: 4px 12px;
  font-size: 13px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel-small:hover {
  background-color: #c82333;
}
.progress-track {
  height: 24px;
  background: #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a1d6, #0082b3);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 600;
}
.progress-percent {
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.comment-list-container {
  height: 500px;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  position: relative;
}
.comment-list {
  height: 100%;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.comment-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  transition: background-color 0.2s;
}
.comment-item.selected {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}
.comment-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.comment-content {
  font-weight: bold;
  margin-bottom: 4px;
}
.comment-meta {
  font-size: 13px;
  color: #555;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.meta-label {
  color: #888;
  font-size: 12px;
}
.meta-value {
  color: #333;
  font-weight: 500;
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  margin: 12px 0;
}
.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}
.empty-state {
  text-align: center;
  padding: 16px;
  color: #999;
}
</style>