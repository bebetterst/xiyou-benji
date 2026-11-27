# 西行：本纪（竖屏卡牌可玩原型）

Vite + TypeScript 竖屏切片。悟空第一关完整可玩：前置故事卡增益 → 混世三波多怪 → Boss 结算；月圆之夜式署名短句。

对齐设计：`docs/design_doc` 01 / 03 / 05（完整设计在 Project store）。

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

## 如何玩悟空第一关

1. **踏上本纪 → 孙悟空**
2. **前置 3 张故事卡**（可跳过；默认仍写 flag + 每卡第一选项增益）  
   - 每卡二选一，选项下有机械增益提示 + 「」旁白线索  
3. **关卡序章**短对白 → 开战  
4. **三波战斗**  
   - 部众（2 小妖）→ 先锋+小妖 → 混世魔王  
   - 点选敌人锁定目标；各自显示意图  
   - 底栏：手牌 / 抽牌堆 / 弃牌堆 / 本命 /「渡」  
   - 卡面点「详」看专属说明  
5. **结算**结局收集卡（魔王临终埋东海伏笔）

唐僧：直入收伏检定（弱化保留）。八戒 / 沙僧灰显。

## 本切片内容

| 入口 | 流程 |
|------|------|
| 孙悟空 | 前置 ×3（选项增益）→ 混世三波多怪 → Boss → 结局卡 |
| 唐僧 | 石压悟空·初醒收伏（约法 / 度猴） |
| 八戒 / 沙僧 | 选角灰显 |

过程记录：`bugfix/2026-11-27-wukong-ch1-complete.md`。
