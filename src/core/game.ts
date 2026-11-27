import {
  createCombat,
  createTangCombat,
  snapshotPlayer,
} from './combat'
import {
  formatLine,
  formatLines,
  HUNSHI_CLEAR_LINES,
  HUNSHI_FAIL_LINES,
  HUNSHI_PROLOGUE,
  HUNSHI_WAVE_BEATS,
  storyAside,
  TANG_CLEAR_LINES,
  TANG_OPEN_LINES,
} from './lore'
import {
  applyBuffsToMods,
  emptyOpeningMods,
  summarizeMods,
} from './opening'
import { getStage, WUKONG_STAGE_HUNSHI } from './stages'
import {
  defaultStoryBuffsFromCards,
  TANG_INTRO,
  WUKONG_STORY_CARDS,
} from './story'
import type { CharacterId, GameState, StoryBuff } from './types'

export function createInitialState(): GameState {
  return {
    screen: 'title',
    characterId: null,
    flags: new Set(),
    storyIndex: 0,
    openingMods: emptyOpeningMods(),
    stageId: null,
    waveIndex: 0,
    combat: null,
    runPlayer: null,
    pileView: null,
    resultTitle: '',
    resultBody: '',
    endingId: null,
    waveClearText: '',
    lastWhisper: '',
    pendingAside: null,
  }
}

export function selectCharacter(state: GameState, id: CharacterId): GameState {
  if (id !== 'tang_seng' && id !== 'sun_wukong') return state
  const next: GameState = {
    ...createInitialState(),
    characterId: id,
    flags: new Set(),
  }
  if (id === 'sun_wukong') {
    next.screen = 'story'
    next.storyIndex = 0
    next.stageId = WUKONG_STAGE_HUNSHI.stage_id
  } else {
    next.flags.add('tang_mvp_jump_ch05')
    next.combat = createTangCombat()
    next.lastWhisper = formatLine(TANG_OPEN_LINES[0])
    next.screen = 'combat'
  }
  return next
}

function mergeBuffs(state: GameState, buffs?: StoryBuff[]): GameState {
  return {
    ...state,
    openingMods: applyBuffsToMods(state.openingMods, buffs),
    flags: new Set(state.flags),
  }
}

export function applyStoryFlags(state: GameState, flags: string[]): GameState {
  const next = { ...state, flags: new Set(state.flags) }
  for (const f of flags) next.flags.add(f)
  return next
}

export function advanceStory(
  state: GameState,
  optionFlags?: string[],
  optionBuffs?: StoryBuff[],
  optionLabel?: string,
): GameState {
  if (state.characterId !== 'sun_wukong') return state
  const card = WUKONG_STORY_CARDS[state.storyIndex]
  const flags =
    optionFlags && optionFlags.length ? optionFlags : card.set_flags
  const buffs = optionBuffs ?? card.options?.[0]?.buffs ?? []

  let next = applyStoryFlags(mergeBuffs(state, buffs), flags)

  if (optionLabel) {
    const aside = storyAside(card.story_card_id, optionLabel)
    if (aside) {
      next = {
        ...next,
        pendingAside: formatLine(aside),
        lastWhisper: formatLine(aside),
      }
    }
  }

  const nextIndex = state.storyIndex + 1
  if (nextIndex >= WUKONG_STORY_CARDS.length) {
    next = {
      ...next,
      storyIndex: nextIndex,
      screen: 'stage_intro',
      waveIndex: 0,
    }
  } else {
    next = { ...next, storyIndex: nextIndex, screen: 'story' }
  }
  return next
}

export function clearPendingAside(state: GameState): GameState {
  return { ...state, pendingAside: null }
}

/** 跳过全部前置故事卡：默认 flag + 每卡第一选项增益 */
export function skipAllStories(state: GameState): GameState {
  if (state.characterId !== 'sun_wukong') return state
  let next = { ...state, flags: new Set(state.flags) }
  for (const card of WUKONG_STORY_CARDS) {
    for (const f of card.set_flags) next.flags.add(f)
    const opt = card.options?.[0]
    if (opt) {
      for (const f of opt.set_flags) next.flags.add(f)
    }
  }
  next.openingMods = applyBuffsToMods(
    emptyOpeningMods(),
    defaultStoryBuffsFromCards(WUKONG_STORY_CARDS),
  )
  next.storyIndex = WUKONG_STORY_CARDS.length
  next.stageId = WUKONG_STAGE_HUNSHI.stage_id
  next.waveIndex = 0
  next.screen = 'stage_intro'
  next.lastWhisper = formatLine(HUNSHI_PROLOGUE[0])
  next.pendingAside = null
  return next
}

export function enterCurrentWave(state: GameState): GameState {
  if (!state.stageId || state.characterId !== 'sun_wukong') return state
  const stage = getStage(state.stageId)
  const wave = stage.waves[state.waveIndex]
  if (!wave) return state

  const combat = createCombat({
    characterId: 'sun_wukong',
    enemyIds: wave.enemyIds,
    mods: state.openingMods,
    reusePlayer: state.runPlayer,
    waveIndex: state.waveIndex,
    waveLabel: wave.label,
  })

  const beat = HUNSHI_WAVE_BEATS[state.waveIndex]
  const opener = beat?.lines.find((l) => l.tone === 'threat') ?? beat?.lines[0]
  if (opener) {
    combat.log = [formatLine(opener), ...combat.log].slice(0, 10)
  }

  return {
    ...state,
    combat,
    screen: 'combat',
    pileView: null,
    waveClearText: '',
    lastWhisper: opener ? formatLine(opener) : state.lastWhisper,
    pendingAside: null,
  }
}

export function finishWave(state: GameState): GameState {
  if (!state.combat || !state.stageId) return state
  const stage = getStage(state.stageId)
  const snap = snapshotPlayer(state.combat)
  const nextWave = state.waveIndex + 1

  if (nextWave >= stage.waves.length) {
    return finishStage(state, true)
  }

  const next = stage.waves[nextWave]
  const beat = HUNSHI_WAVE_BEATS[nextWave]
  const lines = [
    formatLine({
      speaker: '旁白',
      text: `${stage.waves[state.waveIndex].label}已破。`,
      tone: 'aside',
    }),
    ...(beat?.lines.slice(0, 2).map(formatLine) ?? [
      `${next.label}：${next.intro}`,
    ]),
  ]

  return {
    ...state,
    flags: new Set(state.flags),
    runPlayer: snap,
    combat: null,
    waveIndex: nextWave,
    screen: 'wave_clear',
    waveClearText: lines.join('\n'),
    lastWhisper: lines[lines.length - 1] ?? '',
    pileView: null,
  }
}

export function continueAfterWaveClear(state: GameState): GameState {
  return enterCurrentWave(state)
}

export function finishCombat(state: GameState, won: boolean): GameState {
  const id = state.characterId
  if (!id) return state

  if (!won) {
    const failBody =
      id === 'sun_wukong'
        ? formatLines(HUNSHI_FAIL_LINES)
        : '气血归零。可重开本章，或返回选角。'
    return {
      ...state,
      flags: new Set(state.flags),
      combat: null,
      runPlayer: null,
      screen: 'result',
      resultTitle: '本纪受挫',
      resultBody: failBody,
      endingId: null,
      pileView: null,
      lastWhisper: formatLine(HUNSHI_FAIL_LINES[0]),
    }
  }

  if (id === 'sun_wukong' && state.stageId) {
    return finishWave(state)
  }

  const next = {
    ...state,
    flags: new Set(state.flags),
    combat: null,
    runPlayer: null,
    pileView: null,
  }
  next.flags.add('shoufu_success')
  next.flags.add('wukong_shoufu_done')
  next.screen = 'ending'
  next.endingId = 'ending_cibei_shi'
  next.resultTitle = '收伏成功'
  next.resultBody = formatLines(TANG_CLEAR_LINES)
  next.lastWhisper = formatLine(TANG_CLEAR_LINES[0])
  return next
}

function finishStage(state: GameState, won: boolean): GameState {
  if (!won || !state.stageId) {
    return finishCombat({ ...state, stageId: null }, false)
  }
  const stage = getStage(state.stageId)
  const next = {
    ...state,
    flags: new Set(state.flags),
    combat: null,
    runPlayer: null,
    pileView: null,
  }
  for (const f of stage.clearFlags) next.flags.add(f)
  next.screen = 'ending'
  next.endingId = stage.endingId
  next.resultTitle = stage.clearTitle
  const bonus = summarizeMods(state.openingMods)
  next.resultBody =
    formatLines(HUNSHI_CLEAR_LINES) +
    `\n\n${stage.clearBody}` +
    (bonus.length ? `\n本局前置增益：${bonus.join(' · ')}` : '')
  next.lastWhisper = formatLine(HUNSHI_CLEAR_LINES[1] ?? HUNSHI_CLEAR_LINES[0])
  return next
}

export function setPileView(
  state: GameState,
  view: GameState['pileView'],
): GameState {
  return { ...state, pileView: view }
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

export {
  WUKONG_STORY_CARDS,
  TANG_INTRO,
  WUKONG_STAGE_HUNSHI,
  summarizeMods,
  HUNSHI_PROLOGUE,
  HUNSHI_WAVE_BEATS,
  formatLine,
  formatLines,
}
