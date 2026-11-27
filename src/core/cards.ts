import type { CardDef, CharacterId } from './types'

export const CARD_DEFS: Record<string, CardDef> = {
  // —— 悟空起始 ——
  wukong_strike_bang: {
    card_id: 'wukong_strike_bang',
    name: '棒击',
    type: 'attack',
    cost_ling: 1,
    desc: '造成 6 点伤害。获得 1 气机。',
    lore: '树枝也好、铁棒也罢——先抡出去再说。产气主力。',
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
    lore: '筋斗未成云时，先学会躲开。护体兼攒气。',
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
    lore: '零费引擎。先翻个筋斗，气机上来再连打。',
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
    lore: '气机 ≥2 时连打两段。攒气后的收割牌。',
    effects: [
      { op: 'damage', value: 4 },
      { op: 'damage', value: 4, condition: 'qi_ge_2' },
    ],
  },
  wukong_attack_maohao: {
    card_id: 'wukong_attack_maohao',
    name: '毫毛一戳',
    type: 'attack',
    cost_ling: 0,
    cost_qi: 1,
    desc: '耗气 1。造成 5 点伤害。',
    lore: '师门所学：拔毫毛化针。零费耗气，补刀与连招好手。',
    effects: [{ op: 'damage', value: 5 }],
  },
  // —— 唐僧起始 ——
  ts_starter_nianzhou: {
    card_id: 'ts_starter_nianzhou',
    name: '念咒',
    type: 'attack',
    cost_ling: 1,
    desc: '造成 6 点伤害，生诵 1。',
    lore: '经文作刃。伤害并积累生诵（气机）。',
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
    lore: '双手合十，心定则护体生。',
    effects: [{ op: 'gain_block', value: 5 }],
  },
  ts_starter_fofa: {
    card_id: 'ts_starter_fofa',
    name: '佛号',
    type: 'skill',
    cost_ling: 0,
    desc: '生诵 1，抽 1 张牌。',
    lore: '零费抽牌兼产气，收伏战节拍器。',
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
    lore: '以戒制怒。敌下次攻伤害减少。',
    effects: [{ op: 'apply_jie', value: 1 }],
  },
  // —— 收伏关键 ——
  card_yuefa_sanzhang: {
    card_id: 'card_yuefa_sanzhang',
    name: '约法三章',
    type: 'skill',
    cost_ling: 1,
    desc: '获得 4 护体。标记「约法」（收伏检定）。',
    lore: '收伏关键：打出后标记约法，气血击破时可过检定。',
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
    lore: '收伏关键：伤害并标记度化，与约法二选一即可过检。',
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
