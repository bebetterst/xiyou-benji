import {
  canPlayCard,
  canUseDestiny,
  endTurn,
  enemyGlyph,
  intentLabel,
  playCard,
  selectTarget,
  useDestiny,
} from '../core/combat'
import { getCard } from '../core/cards'
import { CHARACTERS } from '../core/characters'
import {
  advanceStory,
  clearPendingAside,
  continueAfterWaveClear,
  createInitialState,
  enterCurrentWave,
  finishCombat,
  formatLine,
  goSelect,
  goTitle,
  HUNSHI_PROLOGUE,
  HUNSHI_WAVE_BEATS,
  selectCharacter,
  setPileView,
  skipAllStories,
  summarizeMods,
  TANG_INTRO,
  WUKONG_STAGE_HUNSHI,
  WUKONG_STORY_CARDS,
} from '../core/game'
import { storyAside } from '../core/lore'
import { getStage } from '../core/stages'
import type { CharacterId, GameState } from '../core/types'

export function mountApp(root: HTMLElement) {
  let state: GameState = createInitialState()
  let detailCardId: string | null = null
  let asideClearTimer: number | null = null

  const setState = (next: GameState) => {
    state = next
    render()
  }

  const render = () => {
    root.innerHTML = ''
    const stage = el('div', 'stage')
    switch (state.screen) {
      case 'title':
        stage.append(renderTitle())
        break
      case 'select':
        stage.append(renderSelect())
        break
      case 'story':
        stage.append(renderStory())
        break
      case 'stage_intro':
        stage.append(renderStageIntro())
        break
      case 'wave_clear':
        stage.append(renderWaveClear())
        break
      case 'combat':
        stage.append(renderCombat())
        break
      case 'result':
      case 'ending':
        stage.append(renderResult())
        break
    }
    if (state.pendingAside) {
      stage.append(renderAsideToast(state.pendingAside))
    }
    root.append(stage)
  }

  function renderAsideToast(text: string) {
    const toast = el('div', 'aside-toast')
    toast.textContent = text
    if (asideClearTimer == null) {
      asideClearTimer = window.setTimeout(() => {
        asideClearTimer = null
        if (state.pendingAside) setState(clearPendingAside(state))
      }, 2200)
    }
    return toast
  }

  function renderTitle() {
    const screen = el('div', 'screen')
    screen.innerHTML = `
      <div class="brand">西行：本纪</div>
      <p class="brand-sub">竖屏卡牌 · 悟空第一关可玩</p>
      <div class="cta-group"></div>
    `
    const group = screen.querySelector('.cta-group')!
    group.append(
      button('踏上本纪', 'btn btn-primary', () => setState(goSelect(state))),
      button('云端可玩原型', 'btn btn-ghost', () => {}, true),
    )
    return screen
  }

  function renderSelect() {
    const screen = el('div', 'screen')
    const bar = el('div', 'screen-title-bar')
    bar.innerHTML = `<h2>选择本纪</h2>`
    bar.append(button('返回', 'btn btn-ghost', () => setState(goTitle(state))))
    screen.append(bar)

    const list = el('div', 'char-list')
    for (const c of CHARACTERS) {
      const row = document.createElement('button')
      row.className = 'char-row' + (c.unlocked ? '' : ' is-locked')
      row.type = 'button'
      row.innerHTML = `
        <div class="char-avatar" style="--accent:${c.accent};background:${c.accent}">${c.name.slice(0, 1)}</div>
        <div class="char-meta">
          <strong>${c.name}</strong>
          <span>${c.unlocked ? c.title : c.lockHint ?? '未解锁'}</span>
        </div>
        <span>${c.unlocked ? '启程' : '锁'}</span>
      `
      if (c.unlocked) {
        row.addEventListener('click', () => {
          setState(selectCharacter(state, c.id as CharacterId))
        })
      }
      list.append(row)
    }
    screen.append(list)
    const hint = el('p', 'hint')
    hint.textContent =
      '悟空：前置 3 卡 → 混世三波｜唐僧：收伏检定（弱化）'
    screen.append(hint)
    return screen
  }

  function renderStory() {
    const card = WUKONG_STORY_CARDS[state.storyIndex]
    const screen = el('div', 'screen')
    const bar = el('div', 'screen-title-bar')
    bar.innerHTML = `<h2>前置 · ${state.storyIndex + 1}/3</h2>`
    bar.append(
      button('跳过全部', 'btn btn-ghost', () => setState(skipAllStories(state))),
    )
    screen.append(bar)

    const art = el('div', 'story-art')
    art.textContent = ['石', '王', '师'][state.storyIndex] ?? '石'
    screen.append(art)

    const body = el('div', 'story-body')
    body.innerHTML = `<h3>${card.name}</h3><p>${card.body}</p>`
    screen.append(body)

    if (card.options?.length) {
      const opts = el('div', 'options')
      for (const opt of card.options) {
        const wrap = el('div', 'option-wrap')
        const btn = button(opt.label, 'btn btn-ghost option-btn', () =>
          setState(
            advanceStory(state, opt.set_flags, opt.buffs, opt.label),
          ),
        )
        wrap.append(btn)
        const aside = storyAside(card.story_card_id, opt.label)
        if (aside) {
          const line = el('span', 'option-aside')
          line.textContent = `「${aside.text}」`
          wrap.append(line)
        }
        if (opt.hint) {
          const hint = el('span', 'option-hint')
          hint.textContent = opt.hint
          wrap.append(hint)
        }
        opts.append(wrap)
      }
      screen.append(opts)
    } else {
      screen.append(
        button('继续', 'btn btn-primary', () => setState(advanceStory(state))),
      )
    }
    return screen
  }

  function renderStageIntro() {
    const stageDef = getStage(state.stageId!)
    const wave = stageDef.waves[0]
    const beat = HUNSHI_WAVE_BEATS[0]
    const screen = el('div', 'screen')
    const bar = el('div', 'screen-title-bar')
    bar.innerHTML = `<h2>${stageDef.title}</h2>`
    screen.append(bar)

    const art = el('div', 'story-art stage-art')
    art.textContent = '战'
    screen.append(art)

    const body = el('div', 'story-body')
    const mods = summarizeMods(state.openingMods)
    const prologue = HUNSHI_PROLOGUE.map(
      (l) => `<p class="lore-line"><span class="lore-speaker">${l.speaker}</span>${l.text}</p>`,
    ).join('')
    const beatHtml = (beat?.lines ?? [])
      .map(
        (l) =>
          `<p class="lore-line tone-${l.tone ?? 'aside'}"><span class="lore-speaker">${l.speaker}</span>${l.text}</p>`,
      )
      .join('')
    body.innerHTML = `
      <h3>${beat?.title ?? '山门'} · ${wave.label}</h3>
      <div class="lore-block">${prologue}</div>
      <div class="lore-block lore-divider">${beatHtml}</div>
      <p class="mods-line">${mods.length ? `开局增益：${mods.join(' · ')}` : '开局增益：默认路径'}</p>
      <p class="mods-line">全关 ${stageDef.waves.length} 波：部众 → 先锋 → 魔王</p>
    `
    screen.append(body)
    screen.append(
      button('开战', 'btn btn-primary', () => setState(enterCurrentWave(state))),
    )
    return screen
  }

  function renderWaveClear() {
    const beat = HUNSHI_WAVE_BEATS[state.waveIndex]
    const screen = el('div', 'screen')
    const box = el('div', 'result-box lore-result')
    const title = beat?.title ? `转场 · ${beat.title}` : '波次肃清'
    const lines = state.waveClearText
      .split('\n')
      .map((t) => `<p class="lore-line">${escapeHtml(t)}</p>`)
      .join('')
    box.innerHTML = `<h2>${title}</h2><div class="lore-block">${lines}</div>`
    screen.append(box)
    screen.append(
      button('继续前进', 'btn btn-primary', () =>
        setState(continueAfterWaveClear(state)),
      ),
    )
    return screen
  }

  function renderCombat() {
    const combat = state.combat!
    const screen = el('div', 'screen combat')

    const top = el('div', 'combat-top')
    const waveTag =
      state.characterId === 'sun_wukong'
        ? `${combat.waveLabel || '战斗'} · ${combat.waveIndex + 1}/${WUKONG_STAGE_HUNSHI.waves.length}`
        : TANG_INTRO.title
    top.innerHTML = `<span class="wave-tag">${waveTag}</span><span class="turn-tag">第 ${combat.turn} 回合</span>`
    screen.append(top)

    // 战斗低语条（月圆式：一行，不挡意图）
    if (state.lastWhisper) {
      const whisper = el('div', 'combat-whisper')
      whisper.textContent = state.lastWhisper
      screen.append(whisper)
    }

    const enemyRow = el('div', 'enemy-row')
    combat.enemies.forEach((enemy, idx) => {
      const dead = enemy.hp <= 0
      const selected = !dead && combat.selectedTarget === idx
      const card = document.createElement('button')
      card.type = 'button'
      card.className =
        'enemy-card' +
        (selected ? ' is-selected' : '') +
        (dead ? ' is-dead' : '')
      const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100)
      const traits = enemy.traits.join('·')
      card.innerHTML = `
        <div class="intent">${dead ? '—' : intentLabel(enemy.intent)}</div>
        <div class="enemy-name">${enemy.name}</div>
        <div class="enemy-silhouette">${enemyGlyph(enemy.enemy_id)}</div>
        <div class="hp-bar"><i style="width:${hpPct}%"></i></div>
        <div class="hp-text">${enemy.hp}/${enemy.maxHp}${enemy.block ? ` ·盾${enemy.block}` : ''}</div>
        ${traits ? `<div class="enemy-traits">${traits}</div>` : ''}
      `
      if (!dead && combat.phase === 'player') {
        card.addEventListener('click', () => {
          const nextCombat = selectTarget(combat, idx)
          const aside =
            state.characterId === 'sun_wukong'
              ? formatLine({
                  speaker: '悟空',
                  text:
                    enemy.enemy_id === 'boss_hunshi_mowang'
                      ? '就你。还我兄弟。'
                      : enemy.enemy_id.includes('vanguard')
                        ? '矛先断。'
                        : '小的，先让开。',
                  tone: 'aside',
                })
              : state.lastWhisper
          setState({
            ...state,
            combat: nextCombat,
            lastWhisper: aside,
          })
        })
      }
      enemyRow.append(card)
    })
    screen.append(enemyRow)

    const mid = el('div', 'combat-mid')
    const php = Math.max(0, (combat.player.hp / combat.player.maxHp) * 100)
    const marks = [...combat.player.subdueMarks]
      .map((m) => (m === 'yuefa' ? '约法' : m === 'duhou' ? '度猴' : m))
      .join('·')
    mid.innerHTML = `
      <div class="hp-bar ally"><i style="width:${php}%"></i></div>
      <div class="hp-text">气血 ${combat.player.hp}/${combat.player.maxHp}${combat.player.block ? ` · 护体 ${combat.player.block}` : ''}</div>
      <div class="res-row">
        <span>灵力 <b>${combat.player.ling}</b>/${combat.player.lingMax}</span>
        <span>气机 <b>${combat.player.qi}</b>/${combat.player.qiMax}</span>
        ${marks ? `<span>收伏 <b>${marks}</b></span>` : ''}
      </div>
      <div class="log">${escapeHtml(combat.log[0] ?? '')}</div>
    `
    screen.append(mid)

    const dock = el('div', 'combat-dock')

    const hand = el('div', 'hand')
    combat.player.hand.forEach((cid, idx) => {
      const def = getCard(cid)
      const playable = canPlayCard(combat, idx)
      const cardBtn = document.createElement('button')
      cardBtn.type = 'button'
      cardBtn.className = 'card' + (playable ? '' : ' is-disabled')
      cardBtn.innerHTML = `
        <div class="card-top">
          <span class="card-cost">${def.cost_ling}${def.cost_qi ? `·气${def.cost_qi}` : ''}</span>
          <span class="card-type">${typeLabel(def.type)}</span>
        </div>
        <div class="card-name">${def.name}</div>
        <div class="card-desc">${def.desc}</div>
        <button type="button" class="card-info" aria-label="说明">详</button>
      `
      const infoBtn = cardBtn.querySelector('.card-info') as HTMLButtonElement
      infoBtn.addEventListener('click', (ev) => {
        ev.stopPropagation()
        detailCardId = cid
        render()
      })
      if (playable) {
        cardBtn.addEventListener('click', () => {
          const nextCombat = playCard(combat, idx)
          const whisper = nextCombat.log[0] ?? state.lastWhisper
          if (nextCombat.phase === 'won') {
            setState(
              finishCombat(
                { ...state, combat: nextCombat, lastWhisper: whisper },
                true,
              ),
            )
          } else if (nextCombat.phase === 'lost') {
            setState(
              finishCombat(
                { ...state, combat: nextCombat, lastWhisper: whisper },
                false,
              ),
            )
          } else {
            setState({
              ...state,
              combat: nextCombat,
              lastWhisper: whisper,
            })
          }
        })
      }
      hand.append(cardBtn)
    })
    dock.append(hand)

    const actions = el('div', 'combat-actions')
    const pileDraw = button(
      `抽 ${combat.player.drawPile.length}`,
      'btn btn-ghost pile-btn',
      () => setState(setPileView(state, 'draw')),
    )
    const pileDiscard = button(
      `弃 ${combat.player.discardPile.length}`,
      'btn btn-ghost pile-btn',
      () => setState(setPileView(state, 'discard')),
    )
    const destiny = button(
      combat.player.destinyActive ? `本命已亮` : `本命`,
      'btn btn-gold destiny-btn',
      () => {
        const nextCombat = useDestiny(combat)
        setState({
          ...state,
          combat: nextCombat,
          lastWhisper: nextCombat.log[0] ?? state.lastWhisper,
        })
      },
      !canUseDestiny(combat) || combat.player.destinyActive,
    )
    destiny.title = combat.player.destinyDesc
    const endBtn = button('渡', 'btn btn-primary end-turn-btn', () => {
      const nextCombat = endTurn(combat)
      if (nextCombat.phase === 'lost') {
        setState(
          finishCombat(
            { ...state, combat: nextCombat, lastWhisper: nextCombat.log[0] },
            false,
          ),
        )
      } else {
        setState({
          ...state,
          combat: nextCombat,
          lastWhisper: nextCombat.log[0] ?? state.lastWhisper,
        })
      }
    })
    actions.append(pileDraw, pileDiscard, destiny, endBtn)
    dock.append(actions)
    screen.append(dock)

    if (state.pileView) {
      screen.append(renderPileModal(state.pileView))
    }
    if (detailCardId) {
      screen.append(renderCardDetail(detailCardId))
    }

    return screen
  }

  function renderPileModal(kind: 'draw' | 'discard') {
    const combat = state.combat!
    const ids =
      kind === 'draw'
        ? [...combat.player.drawPile].reverse()
        : [...combat.player.discardPile]
    const overlay = el('div', 'modal-overlay')
    const panel = el('div', 'modal-panel')
    panel.innerHTML = `<h3>${kind === 'draw' ? '抽牌堆（未出）' : '弃牌堆（已出）'} · ${ids.length}</h3>`
    const list = el('div', 'pile-list')
    if (!ids.length) {
      list.innerHTML = `<p class="hint">空</p>`
    } else {
      for (const id of ids) {
        const def = getCard(id)
        const row = el('div', 'pile-row')
        row.innerHTML = `<strong>${def.name}</strong><span>${def.desc}</span>`
        list.append(row)
      }
    }
    panel.append(list)
    panel.append(
      button('关闭', 'btn btn-primary', () =>
        setState(setPileView(state, null)),
      ),
    )
    overlay.append(panel)
    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) setState(setPileView(state, null))
    })
    return overlay
  }

  function renderCardDetail(cardId: string) {
    const def = getCard(cardId)
    const overlay = el('div', 'modal-overlay')
    const panel = el('div', 'modal-panel card-detail')
    panel.innerHTML = `
      <div class="detail-type">${typeLabel(def.type)} · 灵力 ${def.cost_ling}${def.cost_qi ? ` · 耗气 ${def.cost_qi}` : ''}</div>
      <h3>${def.name}</h3>
      <p class="detail-desc">${def.desc}</p>
      <p class="detail-lore">${def.lore ?? '暂无更多说明。'}</p>
    `
    panel.append(
      button('关闭', 'btn btn-primary', () => {
        detailCardId = null
        render()
      }),
    )
    overlay.append(panel)
    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) {
        detailCardId = null
        render()
      }
    })
    return overlay
  }

  function renderResult() {
    const screen = el('div', 'screen')
    if (state.screen === 'ending') {
      const card = el('div', 'ending-card')
      card.innerHTML = `
        <div class="tag">结局收集卡</div>
        <h2>${state.resultTitle}</h2>
        <div class="lore-block ending-lore">${state.resultBody
          .split('\n')
          .filter(Boolean)
          .map((t) => `<p class="lore-line">${escapeHtml(t)}</p>`)
          .join('')}</div>
        <p style="margin-top:18px;font-size:.78rem;opacity:.55">${state.endingId ?? ''}</p>
      `
      screen.append(card)
    } else {
      const box = el('div', 'result-box lore-result')
      box.innerHTML = `<h2>${state.resultTitle}</h2><div class="lore-block">${state.resultBody
        .split('\n')
        .map((t) => `<p class="lore-line">${escapeHtml(t)}</p>`)
        .join('')}</div>`
      screen.append(box)
    }
    const group = el('div', 'cta-group')
    group.style.marginTop = '0'
    group.style.paddingBottom = '4vh'
    group.append(
      button('再选角色', 'btn btn-primary', () => setState(goSelect(state))),
      button('回标题', 'btn btn-ghost', () => setState(goTitle(state))),
    )
    screen.append(group)
    return screen
  }

  render()
}

function typeLabel(t: string) {
  return ({ attack: '攻', defend: '防', skill: '术' } as Record<string, string>)[
    t
  ] ?? t
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function el(tag: string, className?: string) {
  const node = document.createElement(tag)
  if (className) node.className = className
  return node
}

function button(
  label: string,
  className: string,
  onClick: () => void,
  disabled = false,
) {
  const b = document.createElement('button')
  b.type = 'button'
  b.className = className
  b.textContent = label
  b.disabled = disabled
  if (!disabled) b.addEventListener('click', onClick)
  return b
}
