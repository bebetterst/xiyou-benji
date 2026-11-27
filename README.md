# 西行：本纪（竖屏卡牌可玩原型）

Vite + TypeScript 竖屏切片：选角 → 故事卡 / 收伏战 → 战斗（灵力 / 气机 / 护体 / 本命 / 意图 /「渡」）。

对齐设计：`docs/design_doc` 01 / 02 / 03 / 05（本仓库 `design_doc/` 为同步说明占位；完整设计在 Project store）。

## 本地 / Mac mini

```bash
cd xiyou-benji   # 或 /Users/zhuning/nascode/xiyou-benji
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://127.0.0.1:5173/`）。

## 云端

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

构建：`npm run build` → `npm run preview`。

同步回 Mac mini 步骤见 Project：`docs/design_doc/06-cloud-mac-sync.md`。

## 本切片内容

| 入口 | 流程 |
|------|------|
| 孙悟空 | 前置故事卡 ×3（可跳过，默认 flag 仍写）→ **混世魔王** Boss |
| 唐僧 | 直入 **石压悟空·初醒** 收伏战（约法 / 度猴检定） |
| 八戒 / 沙僧 | 选角灰显 |

`src/core` 战斗与状态；`src/render` UI。
