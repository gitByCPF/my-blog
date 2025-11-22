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

// ---------- 滚动容器 ----------
const replyScrollContainer = ref(null);
const likeScrollContainer = ref(null);

// ---------- 工具 ----------
function showMessage(text, type = "success") {
  statusMessage.value = { text, type };
  setTimeout(() => (statusMessage.value = { text: "", type: "" }), 5000);
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

// ---------- 加载 ----------
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
  } else {
    replyCursor.value.is_end = true;
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
  }

  likeItems.value.push(...items);
  likeItems.value = uniqById(likeItems.value);

  const cursor = res?.data?.total?.cursor;
  if (cursor) {
    likeCursor.value.id = cursor.id || 0;
    likeCursor.value.time = cursor.time || cursor.like_time || 0;
    likeCursor.value.is_end = !!cursor.is_end;
  } else {
    likeCursor.value.is_end = true;
  }

  likeLoading.value = false;
}

// ---------- 当前 Tab 加载 ----------
async function loadMoreForTab(tab) {
  if (tab === "reply") await loadMoreReply();
  else await loadMoreLike();
}

// ---------- Cookie / 登录 ----------
function saveCookie() {
  const cookie = cookieInput.value.trim();
  if (!cookie) return showMessage("请输入 Cookie", "error");
  const match = cookie.match(/bili_jct=([^;]+)/);
  if (!match) return showMessage("Cookie 中缺少 bili_jct", "error");
  if (!cookie.includes("SESSDATA="))
    return showMessage("Cookie 中缺少 SESSDATA", "error");
  cookieStr.value = cookie;
  csrfToken.value = match[1];
  isAuthed.value = true;
  showMessage("Cookie 保存成功！", "success");
  replyItems.value = [];
  likeItems.value = [];
  replyCursor.value = { id: 0, time: 0, is_end: false };
  likeCursor.value = { id: 0, time: 0, is_end: false };
  nextTick(() => loadMoreForTab(currentTab.value));
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
}

// ---------- 选择 ----------
function toggleSelect(id, source = null) {
  // source 可以不传，template 已按 tab 调用
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

async function selectAll() {
  // 全选分别处理两个 tab（只针对当前 tab 的 selectAll 保持原来的行为）
  if (currentTab.value === "reply") {
    showMessage("正在加载所有回复数据，请稍候（可能需要几秒）...", "success");
    while (!replyCursor.value.is_end) {
      await loadMoreReply();
      // 为避免阻塞主线程太久，短暂让出 (微等待)
      await new Promise((r) => setTimeout(r, 50));
    }
    const arr = replyItems.value.map((c) => c.item?.subject_id || c.id);
    replySelectedIds.value = new Set(arr);
    showMessage(`已选择全部回复（${arr.length} 条组）`, "success");
  } else {
    showMessage("正在加载所有喜欢数据，请稍候（可能需要几秒）...", "success");
    while (!likeCursor.value.is_end) {
      await loadMoreLike();
      await new Promise((r) => setTimeout(r, 50));
    }
    const arr = likeItems.value.map((c) => c.id);
    likeSelectedIds.value = new Set(arr);
    showMessage(`已选择全部喜欢（${arr.length} 条）`, "success");
  }
}

function deselectAll() {
  if (currentTab.value === "reply") {
    replySelectedIds.value = new Set();
  } else {
    likeSelectedIds.value = new Set();
  }
}

// ---------- 删除 ----------
// helper: 找到分组 key（subject_id）对应的 items（reply）
function findReplyGroupBySubject(subjectId) {
  return replyItems.value.filter((it) => (it.item?.subject_id || it.id) === subjectId);
}

// 主删除函数：同时处理 reply 和 like 选中的项
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

  if (!confirm(`确定要${actionText}选中的 ${replySel.length + likeSel.length} 项？`)) return;

  isLoading.value = true;
  let totalToProcess = replySel.length + likeSel.length;
  let processed = 0;

  // 重置计数
  let localDeletedReply = 0;
  let localDeletedMsg = 0;

  // ---- 先处理 reply 组 ----
  for (const subjectId of replySel) {
    const items = findReplyGroupBySubject(subjectId);
    if (!items || items.length === 0) {
      // 如果没找到，跳过
      processed++;
      continue;
    }

    // 取 target_id（以 items[0] 为准）
    const root = items[0]?.item?.target_id ?? items[0]?.target_id ?? items[0]?.item?.target_id;
    // 如果没有 target_id，尝试用 items[0].id 作为回退 rpid（但这通常不对）
    const rpid = root || items[0]?.id;

    // 删除评论（reply）—— 对 reply 组：只调用一次 rpid
    if (deleteReplyOption) {
      try {
        const r = await apiPostForm(API.deleteReply, {
          rpid,
          type: 1, // B站删除评论接口一般需要 type（保留你原来写法）
          csrf: csrfToken.value,
        });
        if (r?.code === 0) {
          localDeletedReply++;
          console.log(`✓ (reply) 删除评论成功: rpid=${rpid}`);
        } else {
          console.warn(`✗ (reply) 删除评论失败: rpid=${rpid}`, r);
        }
      } catch (e) {
        console.error("删除评论请求异常", e);
      }
      // 小延迟避免触发风控
      await new Promise((r) => setTimeout(r, 180));
    }

    // 删除消息通知（message）—— 对 reply 组：需要循环删除组内每条 item.id，tp=1
    if (deleteMsgOption) {
      for (const it of items) {
        try {
          const m = await apiPostForm(API.deleteMsg, {
            id: it.id,
            tp: 1, // 修正：tp=1
            csrf: csrfToken.value,
          });
          if (m?.code === 0) {
            localDeletedMsg++;
            console.log(`✓ (reply) 删除消息成功: id=${it.id}`);
          } else {
            console.warn(`✗ (reply) 删除消息失败: id=${it.id}`, m);
          }
        } catch (e) {
          console.error("删除消息请求异常", e);
        }
        await new Promise((r) => setTimeout(r, 140));
      }
    }

    // 从 replyItems 中移除该组（按 subject_id）
    replyItems.value = replyItems.value.filter((i) => (i.item?.subject_id || i.id) !== subjectId);
    // 从选择集合中移除
    replySelectedIds.value.delete(subjectId);

    processed++;
  }

  // ---- 再处理 like ----
  for (const likeId of likeSel) {
    const item = likeItems.value.find((i) => i.id === likeId);
    if (!item) {
      processed++;
      continue;
    }

    // 删除评论（reply）—— like: 使用 item.item.item_id 作为 rpid
    if (deleteReplyOption) {
      const likeRpid = item.item?.item_id ?? item.item_id ?? null;
      if (likeRpid) {
        try {
          const r = await apiPostForm(API.deleteReply, {
            rpid: likeRpid,
            type: 1,
            csrf: csrfToken.value,
          });
          if (r?.code === 0) {
            localDeletedReply++;
            console.log(`✓ (like) 删除评论成功: rpid=${likeRpid}`);
          } else {
            console.warn(`✗ (like) 删除评论失败: rpid=${likeRpid}`, r);
          }
        } catch (e) {
          console.error("删除评论请求异常", e);
        }
        await new Promise((r) => setTimeout(r, 180));
      } else {
        console.warn("like 项没有 item_id, 跳过删除评论: ", item);
      }
    }

    // 删除消息通知（message）—— like: 使用 item.id，tp=0
    if (deleteMsgOption) {
      try {
        const m = await apiPostForm(API.deleteMsg, {
          id: item.id,
          tp: 0,
          csrf: csrfToken.value,
        });
        if (m?.code === 0) {
          localDeletedMsg++;
          console.log(`✓ (like) 删除消息成功: id=${item.id}`);
        } else {
          console.warn(`✗ (like) 删除消息失败: id=${item.id}`, m);
        }
      } catch (e) {
        console.error("删除消息请求异常", e);
      }
      await new Promise((r) => setTimeout(r, 140));
    }

    // 从 likeItems 中移除
    likeItems.value = likeItems.value.filter((i) => i.id !== likeId);
    likeSelectedIds.value.delete(likeId);

    processed++;
  }

  // 更新计数并结束
  deletedReplyCount.value += localDeletedReply;
  deletedMsgCount.value += localDeletedMsg;

  isLoading.value = false;
  showMessage(`删除完成：已删评论 ${localDeletedReply} 条，已删消息 ${localDeletedMsg} 条`, "success");
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

// ---------- 初始化 ----------
onMounted(() => {
  // 如果用户已经保存了 cookie，并刷新页面，尝试自动加载当前 tab
  if (isAuthed.value) {
    loadMoreForTab(currentTab.value);
  }
});
</script>

<template>
  <div class="bili-comment-manager">
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
          💬 回复与@
        </button>
        <button
          :class="['tab', { active: currentTab === 'like' }]"
          @click="switchTab('like')"
        >
          👍 收到喜欢
        </button>
      </div>

      <div class="actions-bar">
        <div class="select-actions">
          <button class="btn btn-secondary" @click="selectAll">全选</button>
          <button class="btn btn-secondary" @click="deselectAll">取消</button>
        </div>
        <div class="delete-actions">
          <button
            class="btn btn-warning"
            @click="performDelete(true, false)"
            :disabled="replySelectedIds.size===0 && likeSelectedIds.size===0"
          >
            🗑️ 删除评论
          </button>
          <button
            class="btn btn-danger"
            @click="performDelete(false, true)"
            :disabled="replySelectedIds.size===0 && likeSelectedIds.size===0"
          >
            📬 删除消息通知
          </button>
          <button
            class="btn btn-danger"
            @click="performDelete(true, true)"
            :disabled="replySelectedIds.size===0 && likeSelectedIds.size===0"
          >
            💣 删除评论&消息
          </button>
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
                {{ item.item?.title || "(无标题)" }}
              </div>
              <div class="comment-meta">👍 {{ item.counts || 0 }} 个赞</div>
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
.btn:hover {
  opacity: 0.85;
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
  margin-bottom: 8px;
}
.tab {
  padding: 6px 12px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  margin-right: 8px;
  background: none;
  border: none;
}
.tab.active {
  border-bottom-color: #007bff;
  font-weight: bold;
}
.actions-bar {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  gap: 8px;
  flex-wrap: wrap;
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
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.empty-state {
  text-align: center;
  padding: 16px;
  color: #999;
}
</style>
