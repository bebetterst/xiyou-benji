import type { StageDef } from './types'

/** 悟空第一可玩关：混世来犯（前置故事后 → 多波多怪 → Boss） */
export const WUKONG_STAGE_HUNSHI: StageDef = {
  stage_id: 'wukong_stage_hunshi',
  title: '混世来犯',
  waves: [
    {
      id: 'wave_minions',
      label: '部众来袭',
      enemyIds: ['hunshi_minion', 'hunshi_minion'],
      intro: '山门锁链响。两骑小妖先到。',
    },
    {
      id: 'wave_vanguard',
      label: '混世先锋',
      enemyIds: ['elite_hunshi_vanguard', 'hunshi_minion'],
      intro: '矛横水帘。先锋要披挂，小妖接应。',
    },
    {
      id: 'wave_boss',
      label: '混世魔王',
      enemyIds: ['boss_hunshi_mowang'],
      intro: '鼓停。魔王独自来取山。',
    },
  ],
  clearTitle: '混世魔王已除',
  clearBody: '水帘仍旧，心事却新。东海的影子，在魔王临终一句里晃了一下。',
  endingId: 'ending_hunshi_slice',
  clearFlags: ['hunshi_cleared', 'brotherhood_proven'],
}

export function getStage(id: string): StageDef {
  if (id === WUKONG_STAGE_HUNSHI.stage_id) return WUKONG_STAGE_HUNSHI
  throw new Error(`unknown stage ${id}`)
}
