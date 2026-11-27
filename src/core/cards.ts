import type { CardDef, CharacterId } from './types'

export const CARD_DEFS: Record<string, CardDef> = {
  // —— 悟空起始 ——
  wukong_strike_bang: {
    card_id: 'wukong_strike_bang',
    name: '棒击',
    type: 'attack',
    cost_ling: 1,
    desc: '造成 6 点伤害。获得 1 气机。',
    effects: [
      { op: 'damage', value: 6 },
      { op: 'gain_qi', value: 1 },
    ],
  },
  wukong_guard_shanshen: {
    card_id: 'wukong_guard_shanshen',
    name: '闪身',
    type: 'defend',
    cost_ling: 1,
    desc: '获得 5 点护体。获得 1 气机。',
    effects: [
      { op: 'gain_block', value: 5 },
      { op: 'gain_qi', value: 1 },
    ],
  },
  wukong_skill_jindou_qi: {
    card_id: 'wukong_skill_jindou_qi',
    name: '筋斗起步',
    type: 'skill',
    cost_ling: 0,
    desc: '获得 2 气机。抽 1 张牌。',
    effects: [
      { op: 'gain_qi', value: 2 },
      { op: 'draw', value: 1 },
    ],
  },
  wukong_attack_lianbang: {
    card_id: 'wukong_attack_lianbang',
    name: '连棒',
    type: 'attack',
    cost_ling: 1,
    desc: '造成 4 点伤害。若气机 ≥2，再打一次。',
    effects: [
      { op: 'damage', value: 4 },
      { op: 'damage', value: 4, condition: 'qi_ge_2' },
    ],
  },
  // —— 唐僧起始 ——
  ts_starter_nianzhou: {
    card_id: 'ts_starter_nianzhou',
    name: '念咒',
    type: 'attack',
    cost_ling: 1,
    desc: '造成 6 点伤害，生诵 1。',
    effects: [
      { op: 'damage', value: 6 },
      { op: 'gain_qi', value: 1 },
    ],
  },
  ts_starter_heshi: {
    card_id: 'ts_starter_heshi',
    name: '合十',
    type: 'defend',
    cost_ling: 1,
    desc: '获得 5 点护体。',
    effects: [{ op: 'gain_block', value: 5 }],
  },
  ts_starter_fofa: {
    card_id: 'ts_starter_fofa',
    name: '佛号',
    type: 'skill',
    cost_ling: 0,
    desc: '生诵 1，抽 1 张牌。',
    effects: [
      { op: 'gain_qi', value: 1 },
      { op: 'draw', value: 1 },
    ],
  },
  ts_starter_jielu_chu: {
    card_id: 'ts_starter_jielu_chu',
    name: '戒律初',
    type: 'skill',
    cost_ling: 1,
    desc: '赋予 1 层「戒」（下次攻击伤害减少）。',
    effects: [{ op: 'apply_jie', value: 1 }],
  },
  // —— 收伏关键 ——
  card_yuefa_sanzhang: {
    card_id: 'card_yuefa_sanzhang',
    name: '约法三章',
    type: 'skill',
    cost_ling: 1,
    desc: '获得 4 护体。标记「约法」（收伏检定）。',
    effects: [
      { op: 'gain_block', value: 4 },
      { op: 'mark_subdue', tag: 'yuefa' },
    ],
    subdue_tag: 'yuefa',
  },
  card_duhou: {
    card_id: 'card_duhou',
    name: '度猴',
    type: 'skill',
    cost_ling: 1,
    desc: '造成 4 点伤害。标记「度」（收伏检定）。',
    effects: [
      { op: 'damage', value: 4 },
      { op: 'mark_subdue', tag: 'duhou' },
    ],
    subdue_tag: 'duhou',
  },
}

export function starterDeck(characterId: CharacterId): string[] {
  if (characterId === 'sun_wukong') {
    return [
      ...Array(4).fill('wukong_strike_bang'),
      ...Array(3).fill('wukong_guard_shanshen'),
      ...Array(2).fill('wukong_skill_jindou_qi'),
      'wukong_attack_lianbang',
    ]
  }
  if (characterId === 'tang_seng') {
    return [
      ...Array(4).fill('ts_starter_nianzhou'),
      ...Array(3).fill('ts_starter_heshi'),
      'ts_starter_fofa',
      'ts_starter_jielu_chu',
      'card_yuefa_sanzhang',
      'card_duhou',
    ]
  }
  return []
}

export function getCard(id: string): CardDef {
  const c = CARD_DEFS[id]
  if (!c) throw new Error(`unknown card ${id}`)
  return c
}
