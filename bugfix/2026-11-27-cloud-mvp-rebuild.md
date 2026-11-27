# 云端重建竖屏可玩原型

日期：2026-11-27（Asia/Shanghai）

## 背景

用户无法访问 Mac mini 本机 `127.0.0.1`；Mac 路径 `/Users/zhuning/nascode/xiyou-benji` 在云 VM 不可读。按 handoff 在云端重建等价 Vite+TS 切片。

## 对齐

- `01-core-gameplay.md`：灵力 / 气机 / 护体半衰 / 本命 / 意图数字 /「渡」
- `02` / `03`：唐僧收伏检定（约法·度猴）；悟空前置故事卡 ×3 + 混世魔王
- `05-mvp-scope.md`：选角仅唐僧 / 悟空可玩；八戒 / 沙僧灰显

## 实现

路径：`/agent/repos/xiyou-benji`

- `src/core`：牌、角色、敌人、战斗、故事、流程
- `src/render`：竖屏手机框 UI
- `npm run build` 通过；`npm run dev` → `http://127.0.0.1:5173/` 返回 200

## 已知简化（相对完整 MVP）

- 悟空未实装归来 / 龙宫 / 地府完整节点图，混世后给切片结局卡
- 唐僧直入第 5 章收伏接口战，未做前 4 章厚度
- 无云存档 / 商店 / 节点图

## 后续

- GitHub：`bebetterst/xiyou-benji` push，供 Mac mini `git pull`
- 同步说明：Project `docs/design_doc/06-cloud-mac-sync.md`
- 可玩预览：publish-app（需仓库挂载后）或云端 Try Live / 本机预览
