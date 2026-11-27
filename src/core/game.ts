import { createCombat } from './combat'
import { WUKONG_STORY_CARDS, TANG_INTRO } from './story'
import type { CharacterId, GameState } from './types'

export function createInitialState(): GameState {
  return {
    screen: 'title',
    characterId: null,
    flags: new Set(),
    storyIndex: 0,
    combat: null,
    resultTitle: '',
    resultBody: '',
    endingId: null,
  }
}

export function selectCharacter(state: GameState, id: CharacterId): GameState {
  if (id !== 'tang_seng' && id !== 'sun_wukong') return state
  const next = { ...state, characterId: id, flags: new Set(state.flags) }
  if (id === 'sun_wukong') {
    next.screen = 'story'
    next.storyIndex = 0
  } else {
    // 唐僧直入收伏战（MVP 切片：跳过前 4 章厚度）
    next.flags.add('tang_mvp_jump_ch05')
    next.combat = createCombat('tang_seng')
    next.screen = 'combat'
  }
  return next
}

export function applyStoryFlags(state: GameState, flags: string[]): GameState {
  const next = { ...state, flags: new Set(state.flags) }
  for (const f of flags) next.flags.add(f)
  return next
}

export function advanceStory(
  state: GameState,
  optionFlags?: string[],
): GameState {
  if (state.characterId !== 'sun_wukong') return state
  const card = WUKONG_STORY_CARDS[state.storyIndex]
  let next = applyStoryFlags(
    state,
    optionFlags && optionFlags.length ? optionFlags : card.set_flags,
  )
  const nextIndex = state.storyIndex + 1
  if (nextIndex >= WUKONG_STORY_CARDS.length) {
    next = {
      ...next,
      storyIndex: nextIndex,
      combat: createCombat('sun_wukong'),
      screen: 'combat',
    }
  } else {
    next = { ...next, storyIndex: nextIndex, screen: 'story' }
  }
  return next
}

/** 跳过全部前置故事卡，仍写入默认 flags */
export function skipAllStories(state: GameState): GameState {
  if (state.characterId !== 'sun_wukong') return state
  let next = { ...state, flags: new Set(state.flags) }
  for (const card of WUKONG_STORY_CARDS) {
    for (const f of card.set_flags) next.flags.add(f)
  }
  next.storyIndex = WUKONG_STORY_CARDS.length
  next.combat = createCombat('sun_wukong')
  next.screen = 'combat'
  return next
}

export function finishCombat(state: GameState, won: boolean): GameState {
  const id = state.characterId
  if (!id) return state
  const next = { ...state, flags: new Set(state.flags), combat: null }

  if (!won) {
    next.screen = 'result'
    next.resultTitle = '本纪受挫'
    next.resultBody = '气血归零。可重开本章，或返回选角。'
    next.endingId = null
    return next
  }

  if (id === 'sun_wukong') {
    next.flags.add('hunshi_cleared')
    next.flags.add('brotherhood_proven')
    next.screen = 'ending'
    next.endingId = 'ending_hunshi_slice'
    next.resultTitle = '混世魔王已除'
    next.resultBody =
      '水帘洞再无黑云。此为云端可玩切片：完整弧尚有归来教学、龙宫夺宝、地府销簿……同步回 Mac mini 后可继续扩章。'
  } else {
    next.flags.add('shoufu_success')
    next.flags.add('wukong_shoufu_done')
    next.screen = 'ending'
    next.endingId = 'ending_cibei_shi'
    next.resultTitle = '收伏成功'
    next.resultBody =
      '约法已立，心猿初驯。唐僧本纪切片通关——完整五章厚度可在后续迭代补全。'
  }
  return next
}

export function goTitle(_state: GameState): GameState {
  return createInitialState()
}

export function goSelect(_state: GameState): GameState {
  return {
    ...createInitialState(),
    screen: 'select',
  }
}

export { WUKONG_STORY_CARDS, TANG_INTRO }
