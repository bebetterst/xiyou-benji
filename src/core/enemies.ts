import type { EnemyDef } from './types'

export const ENEMIES: Record<string, EnemyDef> = {
  hunshi_minion: {
    enemy_id: 'hunshi_minion',
    name: '混世小妖',
    max_hp: 22,
    traits: ['部众'],
    moveset: [
      { move_id: 'mn_slash', intent_type: 'attack', value: 6, weight: 3 },
      { move_id: 'mn_guard', intent_type: 'defend', value: 4, weight: 2 },
      { move_id: 'mn_poke', intent_type: 'attack', value: 8, weight: 1 },
    ],
  },
  elite_hunshi_vanguard: {
    enemy_id: 'elite_hunshi_vanguard',
    name: '混世先锋',
    max_hp: 38,
    traits: ['精英', '妖气'],
    moveset: [
      { move_id: 'vg_thrust', intent_type: 'attack', value: 9, weight: 3 },
      { move_id: 'vg_brace', intent_type: 'defend', value: 7, weight: 2 },
      { move_id: 'vg_rally', intent_type: 'skill', value: 1, weight: 1 },
      { move_id: 'vg_heavy', intent_type: 'enrage', value: 13, weight: 1 },
    ],
  },
  boss_hunshi_mowang: {
    enemy_id: 'boss_hunshi_mowang',
    name: '混世魔王',
    max_hp: 78,
    traits: ['Boss', '妖气'],
    moveset: [
      { move_id: 'hs_slash', intent_type: 'attack', value: 12, weight: 3 },
      { move_id: 'hs_guard', intent_type: 'defend', value: 8, weight: 2 },
      { move_id: 'hs_roar', intent_type: 'enrage', value: 16, weight: 1 },
      { move_id: 'hs_hex', intent_type: 'skill', value: 2, weight: 1 },
    ],
  },
  boss_interface_wukong_shoufu: {
    enemy_id: 'boss_interface_wukong_shoufu',
    name: '石压悟空·初醒',
    max_hp: 60,
    traits: ['大圣', '封印'],
    require_subdue: true,
    moveset: [
      { move_id: 'wk_thrash', intent_type: 'attack', value: 10, weight: 3 },
      { move_id: 'wk_brace', intent_type: 'defend', value: 6, weight: 2 },
      { move_id: 'wk_rage', intent_type: 'enrage', value: 14, weight: 1 },
      { move_id: 'wk_escape', intent_type: 'escape', value: 0, weight: 0 },
    ],
  },
}

export function getEnemy(id: string): EnemyDef {
  const e = ENEMIES[id]
  if (!e) throw new Error(`unknown enemy ${id}`)
  return e
}
