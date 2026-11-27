# 云端 → Mac mini 同步步骤

> 文档状态：运维说明（v1.0）  
> 场景：可玩原型在 Cursor 云端迭代；阶段性成果同步回 Mac mini 本机仓库。  
> 目标仓库：`https://github.com/bebetterst/xiyou-benji`  
> Mac 路径：`/Users/zhuning/nascode/xiyou-benji`

---

## 1. 原则

1. **云端先改、先跑通**；不要在远程生产机上直接改业务代码。  
2. 云端提交并 **push 到 GitHub** 后，Mac mini 只用 `git pull` 拉取。  
3. 过程记录放仓库 `bugfix/`；设计文档以 Project store `docs/design_doc/` 为准，可按需拷贝进仓库 `design_doc/`。

---

## 2. 云端（Cursor Cloud Agent）

```bash
cd /agent/repos/xiyou-benji
npm install
npm run build          # 出门前至少过构建
git checkout -b cursor/<descriptive-name>-e5e3   # 若走 PR 流程
# …改代码…
git add -A
git commit -m "描述本次切片改动"
git push -u origin HEAD
```

若仓库尚未创建：

```bash
gh auth login          # 一次性；或 export GH_TOKEN=…
gh repo create bebetterst/xiyou-benji --public --source=. --remote=origin --push
```

云端可玩：

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

- 本机环回冒烟：`curl -I http://127.0.0.1:5173/`  
- 对外预览：在已挂载 GitHub 仓库的 Cloud Agent 上使用 **publish-app**（用户在 Cursor 确认可见性）；或打开 Agent 的 **[Try Live](bc-id#desktop)** 桌面。  
- 用户无法访问 Mac mini 的 `127.0.0.1` 时，**不要**依赖 Mac 本机 Vite 给外网演示。

---

## 3. Mac mini 首次接入

若本机已有旧目录且尚未关联远程：

```bash
cd /Users/zhuning/nascode/xiyou-benji
git remote -v
# 若无 origin：
git remote add origin https://github.com/bebetterst/xiyou-benji.git
git fetch origin
git checkout -B main origin/main   # 或先备份再合并
npm install
npm run dev
```

若本机目录可丢弃、愿干净克隆：

```bash
# 先备份旧目录
mv /Users/zhuning/nascode/xiyou-benji /Users/zhuning/nascode/xiyou-benji.bak-$(date +%Y%m%d)
cd /Users/zhuning/nascode
git clone https://github.com/bebetterst/xiyou-benji.git
cd xiyou-benji
npm install
npm run dev
```

浏览器打开：`http://127.0.0.1:5173/`（仅本机或局域网可达时使用）。

---

## 4. Mac mini 日常同步

```bash
cd /Users/zhuning/nascode/xiyou-benji
git pull origin main
npm install            # lockfile 有变时
npm run build          # 可选冒烟
npm run dev
```

有未提交本机改动时：

```bash
git stash -u
git pull origin main
git stash pop          # 解决冲突后再决定是否 push 回远程
```

---

## 5. 冲突与双端同时改

| 情况 | 建议 |
|------|------|
| 只在云端改 | Mac 只 `pull`，勿在本机大改同一文件 |
| 只在 Mac 改 | 本机 commit → push → 云端 `pull` 后再继续 |
| 两边都改了 | 以 Git 合并为准；战斗核心优先保留 `src/core` 较新一方，UI 可手合 `src/render` |

**禁止**：在未询问的情况下直接 SSH 改 Mac / 远程服务器上的业务源码覆盖 Git 历史。

---

## 6. 验收清单（同步后）

- [ ] `npm run build` 通过  
- [ ] 选角可见唐僧 / 悟空；八戒 / 沙僧灰显  
- [ ] 悟空：3 张故事卡可跳过，仍进混世战  
- [ ] 唐僧：收伏战需约法或度猴，非纯普攻碾  
- [ ] 战斗 HUD 可读：气血、护体、灵力、气机、意图数字、「渡」、本命  

---

## 7. 修订记录

| 版本 | 说明 |
|------|------|
| v1.0 | 初稿：云端重建后同步回 Mac mini 流程 |

*仓库 URL 或 Mac 路径变更时请升版。*
