import {
  canPlayCard,
  canUseDestiny,
  endTurn,
  intentLabel,
  playCard,
  useDestiny,
} from '../core/combat'
import { getCard } from '../core/cards'
import { CHARACTERS } from '../core/characters'
import {
  advanceStory,
  createInitialState,
  finishCombat,
  goSelect,
  goTitle,
  selectCharacter,
  skipAllStories,
  TANG_INTRO,
  WUKONG_STORY_CARDS,
} from '../core/game'
import type { CharacterId, GameState } from '../core/types'

export function mountApp(root: HTMLElement) {
  let state: GameState = createInitialState()

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
      case 'combat':
        stage.append(renderCombat())
        break
      case 'result':
      case 'ending':
        stage.append(renderResult())
        break
    }
    root.append(stage)
  }

  function renderTitle() {
    const screen = el('div', 'screen')
    screen.innerHTML = `
      <div class="brand">西行：本纪</div>
      <p class="brand-sub">竖屏卡牌 · 角色本纪切片</p>
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
      '悟空：前置故事卡 → 混世魔王｜唐僧：五行山收伏检定'
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
    art.textContent = '石'
    screen.append(art)

    const body = el('div', 'story-body')
    body.innerHTML = `<h3>${card.name}</h3><p>${card.body}</p>`
    screen.append(body)

    if (card.options?.length) {
      const opts = el('div', 'options')
      for (const opt of card.options) {
        opts.append(
          button(opt.label, 'btn btn-ghost', () =>
            setState(advanceStory(state, opt.set_flags)),
          ),
        )
      }
      screen.append(opts)
    } else {
      screen.append(
        button('继续', 'btn btn-primary', () => setState(advanceStory(state))),
      )
    }
    return screen
  }

  function renderCombat() {
    const combat = state.combat!
    const screen = el('div', 'screen combat')

    if (state.characterId === 'tang_seng' && combat.turn === 1) {
      const tip = el('p', 'hint')
      tip.textContent = `${TANG_INTRO.title}：${TANG_INTRO.body.slice(0, 28)}… 需约法/度猴`
      screen.append(tip)
    }

    // Enemy
    const enemy = el('div', 'enemy-panel')
    const hpPct = Math.max(0, (combat.enemy.hp / combat.enemy.maxHp) * 100)
    enemy.innerHTML = `
      <div class="enemy-name">${combat.enemy.name}</div>
      <div class="intent">${intentLabel(combat.enemy.intent)}</div>
      <div class="hp-bar"><i style="width:${hpPct}%"></i></div>
      <div class="hp-text">${combat.enemy.hp} / ${combat.enemy.maxHp}${combat.enemy.block ? ` · 护体 ${combat.enemy.block}` : ''}</div>
      <div class="enemy-silhouette">${state.characterId === 'sun_wukong' ? '魔' : '猴'}</div>
    `
    screen.append(enemy)

    // Player
    const player = el('div', 'player-panel')
    const php = Math.max(0, (combat.player.hp / combat.player.maxHp) * 100)
    const marks = [...combat.player.subdueMarks]
      .map((m) => (m === 'yuefa' ? '约法' : m === 'duhou' ? '度猴' : m))
      .join('·')
    player.innerHTML = `
      <div class="hp-bar ally"><i style="width:${php}%"></i></div>
      <div class="hp-text">气血 ${combat.player.hp}/${combat.player.maxHp}${combat.player.block ? ` · 护体 ${combat.player.block}` : ''}</div>
      <div class="res-row">
        <span>灵力 <b>${combat.player.ling}</b>/${combat.player.lingMax}</span>
        <span>气机 <b>${combat.player.qi}</b>/${combat.player.qiMax}</span>
        <span>抽 ${combat.player.drawPile.length} · 弃 ${combat.player.discardPile.length}</span>
        ${marks ? `<span>收伏 <b>${marks}</b></span>` : ''}
      </div>
    `
    const destiny = button(
      combat.player.destinyActive
        ? `本命「${combat.player.destinyName}」已点亮`
        : `本命 · ${combat.player.destinyName}`,
      'btn btn-gold destiny-btn',
      () => setState({ ...state, combat: useDestiny(combat) }),
      !canUseDestiny(combat) || combat.player.destinyActive,
    )
    destiny.title = combat.player.destinyDesc
    player.append(destiny)
    screen.append(player)

    // Log
    const log = el('div', 'log')
    log.textContent = combat.log[0] ?? ''
    screen.append(log)

    // Hand
    const hand = el('div', 'hand')
    combat.player.hand.forEach((cid, idx) => {
      const def = getCard(cid)
      const playable = canPlayCard(combat, idx)
      const cardBtn = document.createElement('button')
      cardBtn.type = 'button'
      cardBtn.className = 'card' + (playable ? '' : ' is-disabled')
      cardBtn.innerHTML = `
        <div class="card-cost">灵力 ${def.cost_ling}${def.cost_qi ? ` · 气 ${def.cost_qi}` : ''}</div>
        <div class="card-name">${def.name}</div>
        <div class="card-desc">${def.desc}</div>
        <div class="card-type">${typeLabel(def.type)}</div>
      `
      if (playable) {
        cardBtn.addEventListener('click', () => {
          const nextCombat = playCard(combat, idx)
          if (nextCombat.phase === 'won') {
            setState(finishCombat({ ...state, combat: nextCombat }, true))
          } else if (nextCombat.phase === 'lost') {
            setState(finishCombat({ ...state, combat: nextCombat }, false))
          } else {
            setState({ ...state, combat: nextCombat })
          }
        })
      }
      hand.append(cardBtn)
    })
    screen.append(hand)

    const actions = el('div', 'combat-actions')
    actions.append(
      button('放弃', 'btn btn-ghost', () =>
        setState(finishCombat(state, false)),
      ),
      button('渡', 'btn btn-primary', () => {
        const nextCombat = endTurn(combat)
        if (nextCombat.phase === 'lost') {
          setState(finishCombat({ ...state, combat: nextCombat }, false))
        } else {
          setState({ ...state, combat: nextCombat })
        }
      }),
    )
    screen.append(actions)
    return screen
  }

  function renderResult() {
    const screen = el('div', 'screen')
    if (state.screen === 'ending') {
      const card = el('div', 'ending-card')
      card.innerHTML = `
        <div class="tag">结局收集卡</div>
        <h2>${state.resultTitle}</h2>
        <p style="margin-top:12px;opacity:.85">${state.resultBody}</p>
        <p style="margin-top:18px;font-size:.78rem;opacity:.55">${state.endingId ?? ''}</p>
      `
      screen.append(card)
    } else {
      const box = el('div', 'result-box')
      box.innerHTML = `<h2>${state.resultTitle}</h2><p>${state.resultBody}</p>`
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
