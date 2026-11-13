(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const icon = (id, cls = '') => `<svg class="ic ${cls}"><use href="#i-${id}"/></svg>`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const CAPS = [
  ['Personalization', 'hotpot', 'A copper-pot hotpot shared with friends', 410, 6, 'Which familiar meal would you put first for my relaxed get-together?', 'Copper-pot hotpot with sliced meat'],
  ['Memory', 'desk', 'An office desk with a black helmet on it', 430, 4, 'What unusual item was on my office desk during my lunch break on August 13?', 'A black helmet'],
  ['Proactive', 'gym', 'A person leaving a gym in the evening', 264, 3, 'As I leave the gym at 8 p.m. on October 12, which reading message fits me best?', '“…The Art of War\'s five factors…”'],
  ['Grounding', 'fan', 'A desk with a laptop and a small white fan', 223, 3, 'In my September 21 office photo, what was beside the open black laptop?', 'A small white fan'],
];

const BOARD = [
  ['Kimi K3.1 Pro', 'moonshot', ['max', 74], null, 1],
  ['GPT-5.6 Sol', 'openai', ['medium', 70], ['max', 73], 0],
  ['Claude Opus 5.5', 'claude', ['medium', 52], ['max', 70], 0],
  ['GPT-6 Sol', 'openai', ['medium', 66], ['max', 70], 0],
  ['GPT-6.1 Terra', 'openai', ['medium', 51], ['max', 63], 0],
  ['Claude Sonnet 5.5', 'claude', ['medium', 62], ['max', 57], 0],
  ['Gemini 4 Argon', 'gemini', ['medium', 62], ['high', 58], 0],
  ['Qwen3.8-Max', 'qwen', null, ['xhigh', 62], 0],
  ['Gemini 3.8 Flash', 'gemini', ['medium', 59], ['high', 56], 0],
  ['GPT-5.6 Terra', 'openai', null, ['max', 59], 0],
  ['GPT-6 Luna', 'openai', null, ['xhigh', 57], 0],
  ['Muse Spark 1.3', 'meta', ['xhigh', 57], null, 0],
  ['DeepSeek-V4.1-Flash-1017', 'deepseek', ['high', 54], null, 1],
  ['Mistral Large 4', 'mistral', ['high', 52], null, 0],
  ['GLM-5.3-Flash', 'zai', null, ['max', 47], 1],
  ['Qwen3.8-Flash', 'qwen', null, ['xhigh', 46], 0],
  ['Grok 4.7', 'xai', ['high', 43], ['xhigh', 44], 0],
  ['MiMo V2.6 Pro', 'xiaomi', ['default', 43], null, 1],
  ['Claude Haiku 5.5', 'claude', ['medium', 30], ['max', 36], 0],
  ['MiMo V2.6 Flash', 'xiaomi', ['default', 30], null, 1],
  ['DeepSeek V4 Pro', 'deepseek', ['max', 26], null, 1],
  ['gpt-oss-120b', 'openai', ['medium', 9], ['high', 12], 1],
];

function chrome() {
  const header = $('.site-header'), bar = $('.progress i');
  const links = $$('.top-nav a[href^="#"]'), targets = links.map((a) => $(a.getAttribute('href')));
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', scrollY > 8);
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const cur = targets.reduce((best, t, i) => (t.getBoundingClientRect().top <= innerHeight * .45 ? i : best), -1);
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const tip = $('#tooltip');
  document.addEventListener('pointermove', (e) => {
    const t = e.target.closest ? e.target.closest('[data-tip]') : null;
    if (!t) { tip.hidden = true; return; }
    tip.innerHTML = t.dataset.tip;
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = clamp(e.clientX + 14, 8, innerWidth - r.width - 8) + 'px';
    tip.style.top = (e.clientY + 18 + r.height > innerHeight ? e.clientY - r.height - 12 : e.clientY + 18) + 'px';
  });

  const copy = $('.cite-copy');
  copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText($('.cite code').textContent);
    copy.classList.add('done');
    $('span', copy).textContent = 'Copied';
    setTimeout(() => { copy.classList.remove('done'); $('span', copy).textContent = 'Copy'; }, 1800);
  });
}

function trail() {
  const fig = $('#stage'), canvas = $('.canvas', fig), date = $('.anchor b', fig), future = $('.future', fig);
  const REST = .8;
  let p = 0, target = REST, raf = 0, intro = true;
  const label = (v) => new Date(Date.UTC(2026, 6, 15 + Math.round(v * 90))).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const set = (v) => {
    p = v;
    fig.style.setProperty('--p', v);
    date.textContent = label(v);
    future.classList.toggle('off', v > .86);
  };
  const tick = () => {
    const next = p + (target - p) * (intro ? .022 : .18);
    if (Math.abs(target - next) < .001) { set(target); intro = false; raf = 0; return; }
    set(next);
    raf = requestAnimationFrame(tick);
  };
  const go = (t) => { target = t; if (!raf) raf = requestAnimationFrame(tick); };
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    intro = false;
    go(clamp((e.clientX - r.left) / r.width, .03, 1));
  });
  canvas.addEventListener('pointerleave', () => go(REST));
  if (reduce) { set(REST); return; }
  set(0);
  setTimeout(() => go(REST), 900);
}

function count(el) {
  const to = +el.dataset.count, suffix = el.dataset.suffix || '';
  const show = (v) => { el.textContent = Math.round(v).toLocaleString('en-US') + suffix; };
  if (reduce) { show(to); return; }
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / 1500, 1);
    show(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function reveal() {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(count);
    io.unobserve(e.target);
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el) => io.observe(el));
}

function caps() {
  $('#caps').innerHTML = CAPS.map(([name, img, alt, n, tasks, q, a], i) => `<div class="cap rv" style="--d:${i}">
    <figure><img src="assets/art/${img}.webp" alt="${alt}" loading="lazy">${icon('bracket', 'focus f1')}${icon('bracket', 'focus f2')}</figure>
    <h3>${name}</h3><small>${n} questions · ${tasks} tasks</small>
    <p class="q">“${q}”</p><p class="a">${icon('check')}${a}</p></div>`).join('');
}

function board() {
  const fig = $('#fig-board'), more = $('.more', fig);
  const best = (m) => Math.max(m[2] ? m[2][1] : 0, m[3] ? m[3][1] : 0);
  const side = (label, s) => (s ? `${label} effort (${s[0]}): ${s[1]}%<br>` : '');
  $('.board-rows', fig).innerHTML = [...BOARD].sort((a, b) => best(b) - best(a)).map((m, i) => `<div class="row" data-tip="<b>${m[0]}</b>${side('default', m[2])}${side('highest', m[3])}${m[4] ? 'open-weight model' : ''}">
    <span class="rk">${i + 1}</span><span class="nm${m[4] ? ' open' : ''}"><img class="logo" src="assets/logos/${m[1]}.png" alt=""><span>${m[0]}</span></span>
    <span class="tk"><i style="--v:${best(m) / 80 * 100};--i:${i % 10}"></i></span><span class="v">${best(m)}</span></div>`).join('');
  more.addEventListener('click', () => {
    const all = fig.classList.toggle('all');
    more.textContent = all ? 'Show top 10' : 'Show all 22 models';
  });
}

chrome();
trail();
caps();
board();
reveal();
})();
