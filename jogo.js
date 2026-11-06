/* =====================================================================
   MATHEUS: HOMECOMING · LÓGICA DO JOGO (v2: mapa + 6 fases)
   Motor do protótipo aprovado (Pub) preservado e estendido.
   Para trocar textos, roupas, posições e mídias, use dados.js.
   ===================================================================== */
(function () {
  'use strict';
  const D = window.DADOS;
  const P = D.personagens;
  const C = D.cenario;
  const $ = (id) => document.getElementById(id);
  const cv = $('tela');
  let ctx = cv.getContext('2d');

  const CHAO = 300;
  const VEL = 175;
  const ALCANCE = 70;
  let LARG = C.largura;
  const INICIO_PALCO = C.porta + 30;

  let W = 0, H = 0, DPR = 1, esc = 1, offY = 0, camX = 0;

  /* -------------------- PROGRESSO (salvo no navegador, se possível) -------------------- */
  const modoTeste = /[?&]pub\b/.test(location.search);
  function progressoVazio() { return { concluidas: [], cenaAtual: {}, conquistas: {}, fotos: [], poderes: 0, poderesLib: [], viuFinal: false }; }
  let progresso = progressoVazio();
  if (!modoTeste) {
    try {
      const s = localStorage.getItem(D.chaveSalvamento);
      if (s) progresso = Object.assign(progressoVazio(), JSON.parse(s));
    } catch (e) { /* sem salvamento: o jogo segue normalmente */ }
  }
  function salvar() {
    if (modoTeste) return;
    try { localStorage.setItem(D.chaveSalvamento, JSON.stringify(progresso)); } catch (e) { /* ignora */ }
  }
  const conquistas = progresso.conquistas;
  function faseLiberada(id) { return id === 1 || progresso.concluidas.includes(id - 1) || progresso.concluidas.includes(id) || todasConcluidas(); }
  function todasConcluidas() { return D.fases.every((f) => progresso.concluidas.includes(f.id)); }
  function faseAtualMapa() { const f = D.fases.find((f) => !progresso.concluidas.includes(f.id)); return f ? f.id : null; }

  /* -------------------- ESTADO -------------------- */
  const m = { id: 'matheus', x: C.inicioMatheus, dir: 1, andando: false, semCamisa: false, visual: null, capaAte: 0 };
  const npcs = {
    jean: { id: 'jean', x: C.jean, dir: -1 },
    luiz: { id: 'luiz', x: C.luiz, dir: -1 },
    joao: { id: 'joao', x: C.joao, dir: -1 },
    leo:  { id: 'leo',  x: C.leo,  dir: -1 },
    giu:  { id: 'giu',  x: LARG + 80, dir: -1, oculto: true }
  };
  const objetos = {
    mesa: { x: C.mesa }, cabo: { x: C.cabo, visivel: true },
    caseMic: { x: C.caseMic }, pedestal: { x: C.pedestal }
  };
  let etapa = 0;
  let carregando = null;
  let micNoPedestal = false;
  let prontos = { luiz: false, joao: false, leo: false };
  let modo = 'titulo';           // titulo | mapa | jogo | dialogo | modal | show | fim
  let tirouNaPreparacao = false, vezesTirou = 0;
  const bolhas = [];
  let efeitos = [];
  let fade = 0, fadeAlvo = 0, fadeAoFim = null;
  let tempo = 0;
  const teclas = { esq: false, dir: false };
  let faseAtual = null;          // objeto de D.fases
  let cena = null;               // cena genérica em andamento (null = Pub)
  let flashTela = 0;

  const show = { fase: null, t: 0, notas: [], acertos: 0, hype: 0, giuChegou: false };

  /* -------------------- IMAGENS -------------------- */
  const imgs = {};
  function carregarImg(chave, src) {
    if (!src) return;
    const i = new Image();
    i.onload = () => { imgs[chave] = i; };
    i.src = src;
  }
  carregarImg('logo', D.midia.logoVolgan);
  carregarImg('cartaz', D.midia.cartazPub);
  carregarImg('telao', D.midia.telaoPub);
  carregarImg('gen2k', D.midia.gen2k);
  carregarImg('foto1', 'familia_4_2020.jpg');
  carregarImg('foto2', 'lys_1ano.jpg');

  /* -------------------- ÁUDIO -------------------- */
  let ac = null, master = null, somLigado = true, musicaTimer = null, passoMusica = 0, audioEl = null;
  let trilhaCfg = null, volTrilha = 0.5;
  let desbloqueado = false;
  function iniciarAudio() {
    if (!desbloqueado) { desbloqueado = true; try { const a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='); a.play().catch(() => {}); } catch (e) { /* ok */ } }
    try {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { ac = null; }
  }
  function tom(freq, dur, tipo, vol, atraso) {
    if (!ac || !somLigado) return;
    const t0 = ac.currentTime + (atraso || 0);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo || 'square'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol || 0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function ruido(dur, vol, freqFiltro, atraso) {
    if (!ac || !somLigado) return;
    const t0 = ac.currentTime + (atraso || 0);
    const n = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freqFiltro || 1000; f.Q.value = 0.7;
    const g = ac.createGain(); g.gain.value = vol || 0.2;
    s.connect(f); f.connect(g); g.connect(master); s.start(t0);
  }
  function som(nome) {
    switch (nome) {
      case 'blip': tom(660, 0.06, 'square', 0.05); break;
      case 'pega': tom(523, 0.08, 'square', 0.08); tom(784, 0.12, 'square', 0.08, 0.08); break;
      case 'ok': tom(523, 0.1, 'triangle', 0.12); tom(659, 0.1, 'triangle', 0.12, 0.1); tom(784, 0.2, 'triangle', 0.12, 0.2); break;
      case 'erro': tom(180, 0.15, 'sawtooth', 0.07); break;
      case 'tira': tom(300, 0.08, 'square', 0.07); tom(500, 0.12, 'square', 0.07, 0.07); break;
      case 'bota': tom(500, 0.08, 'square', 0.07); tom(300, 0.12, 'square', 0.07, 0.07); break;
      case 'nota': tom(988, 0.08, 'square', 0.07); break;
      case 'plateia': ruido(1.4, 0.35, 1400); ruido(1.0, 0.2, 700, 0.2); break;
      case 'poder': [523, 659, 784, 1047, 1319].forEach((f, i) => tom(f, 0.16, 'triangle', 0.1, i * 0.06)); ruido(0.5, 0.08, 5000, 0.1); break;
      case 'acorde': [196, 247, 294, 392, 494].forEach((f, i) => tom(f, 0.9, 'triangle', 0.06, i * 0.03)); break;
      case 'click': ruido(0.05, 0.3, 3000); tom(1800, 0.03, 'square', 0.04); break;
      case 'whoosh': ruido(1.1, 0.25, 600); ruido(0.8, 0.12, 2400, 0.3); break;
      case 'thud': tom(70, 0.2, 'sine', 0.35); ruido(0.15, 0.15, 400); break;
      case 'sino': [1047, 1319, 1568].forEach((f, i) => tom(f, 0.6, 'sine', 0.08, i * 0.12)); break;
      case 'riff': [82.41, 82.41, 98, 110, 82.41, 123.47, 110].forEach((f, i) => { tom(f, 0.14, 'sawtooth', 0.09, i * 0.13); tom(f * 1.5, 0.14, 'sawtooth', 0.05, i * 0.13); }); break;
    }
  }
  /* trilha própria: rock instrumental gerado em tempo real */
  function iniciarTrilha(cfg, vol) {
    pararMusica();
    trilhaCfg = cfg || { bpm: 120, acordes: [82.41, 65.41, 98.0, 73.42] };
    volTrilha = vol == null ? 0.5 : vol;
    passoMusica = 0;
    const ms = 60000 / trilhaCfg.bpm / 4;
    musicaTimer = setInterval(() => {
      if (!ac || !somLigado) { passoMusica++; return; }
      const p = passoMusica % 16, A = trilhaCfg.acordes, v = volTrilha;
      const f = A[Math.floor(passoMusica / 16) % A.length];
      if (trilhaCfg.calma) {
        if (p === 0) { tom(f * 2, 1.6, 'triangle', 0.05 * v); tom(f * 3, 1.6, 'sine', 0.03 * v); }
        if (p === 8) tom(f * 4, 0.9, 'sine', 0.025 * v);
      } else {
        if (p === 0 || p === 8 || p === 10) tom(60, 0.18, 'sine', 0.35 * v);
        if (p === 4 || p === 12) ruido(0.12, 0.22 * v, 1800);
        if (p % 2 === 0) ruido(0.03, 0.06 * v, 7000);
        if (p % 2 === 0) { tom(f, 0.2, 'sawtooth', 0.05 * v); tom(f * 1.5, 0.2, 'sawtooth', 0.035 * v); }
        if (p === 3 || p === 6 || p === 11 || p === 14) tom(f * (p === 11 ? 6 : 4), 0.12, 'square', 0.022 * v);
      }
      passoMusica++;
    }, ms);
  }
  function iniciarMusicaShow() {
    if (D.midia.audioShow) {
      pararMusica();
      audioEl = new Audio(D.midia.audioShow);
      audioEl.loop = true; audioEl.muted = !somLigado;
      audioEl.play().catch(() => { audioEl = null; iniciarTrilha(faseAtual.trilha, 1); });
      return;
    }
    iniciarTrilha(faseAtual ? faseAtual.trilha : null, 1);
  }
  function pararMusica() {
    if (musicaTimer) { clearInterval(musicaTimer); musicaTimer = null; }
    if (audioEl) { audioEl.pause(); audioEl = null; }
  }
  const trilhaMapa = { bpm: 96, acordes: [130.81, 98.0, 110, 87.31] };
  /* som ambiente de cada lugar */
  let ambTimer = null;
  function pararAmbiente() { if (ambTimer) { clearInterval(ambTimer); ambTimer = null; } }
  function iniciarAmbiente(nome) {
    pararAmbiente(); if (!nome) return;
    ambTimer = setInterval(() => {
      if (!ac || !somLigado) return;
      const r = Math.random();
      switch (nome) {
        case 'passaros': if (r < 0.35) { const f = 2000 + Math.random() * 1500; tom(f, 0.07, 'sine', 0.035); tom(f * 1.2, 0.06, 'sine', 0.03, 0.08); } break;
        case 'cidade': if (r < 0.5) ruido(0.6, 0.03, 400); if (r < 0.04) { tom(440, 0.25, 'square', 0.025); tom(554, 0.25, 'square', 0.025, 0.28); } break;
        case 'torcida': ruido(0.9, 0.03 + (cena && cena.torcida ? cena.torcida * 0.14 : 0), 900); break;
        case 'noite': if (r < 0.6) { tom(4200, 0.03, 'sine', 0.014); tom(4200, 0.03, 'sine', 0.014, 0.06); } break;
        case 'neve': ruido(1, 0.025, 300); break;
        case 'piscina': if (r < 0.4) ruido(0.25, 0.06, 2500); if (r < 0.1) tom(2200, 0.05, 'sine', 0.02); break;
        case 'cafe': if (r < 0.2) tom(2600 + Math.random() * 800, 0.05, 'triangle', 0.025); ruido(0.6, 0.018, 700); break;
        case 'estudio': if (r < 0.15) tom(60, 0.4, 'sine', 0.03); break;
        case 'aeroporto': if (r < 0.05) { tom(660, 0.4, 'sine', 0.06); tom(880, 0.6, 'sine', 0.06, 0.35); } ruido(0.6, 0.02, 500); break;
        case 'aviao': ruido(0.9, 0.06, 250); break;
        case 'casa': if (r < 0.1) tom(1800, 0.05, 'triangle', 0.02); break;
      }
    }, 600);
  }

  /* -------------------- UI -------------------- */
  let avisoTimer = null;
  function aviso(txt, dur) {
    const a = $('aviso'); a.textContent = txt; a.classList.add('on');
    const hud = $('hud').getBoundingClientRect();
    a.style.top = (hud.bottom > 0 ? hud.bottom + 10 : 20) + 'px';
    clearTimeout(avisoTimer); avisoTimer = setTimeout(() => a.classList.remove('on'), dur || 2600);
  }
  function bolha(quem, texto, dur) {
    for (let i = bolhas.length - 1; i >= 0; i--) if (bolhas[i].quem === quem) bolhas.splice(i, 1);
    bolhas.push({ quem, texto, ate: tempo + (dur || 2.8) });
  }
  function objetivoAtual() {
    if (['show', 'fim', 'mapa', 'album', 'cinema'].includes(modo)) return;
    const rot = faseAtual ? 'Fase ' + faseAtual.id + ' · ' + faseAtual.nome : 'Objetivo';
    if (cena) {
      const p = cena.def.passos[cena.passo];
      $('objRot').textContent = rot;
      $('objTexto').textContent = p ? p.obj : '';
      return;
    }
    const e = ETAPAS[etapa];
    $('objRot').textContent = rot + ' · ' + (etapa + 1) + '/' + ETAPAS.length;
    $('objTexto').textContent = D.objetivos[e.id].texto;
  }
  function conquista(id) {
    if (conquistas[id]) return;
    conquistas[id] = true; salvar();
    som('ok');
    setTimeout(() => aviso('🏆 ' + D.conquistas[id].nome), 300);
  }

  /* -------------------- DIÁLOGO -------------------- */
  let filaDlg = null, idxDlg = 0, aoFimDlg = null;
  function dialogo(falas, aoFim) {
    filaDlg = falas; idxDlg = 0; aoFimDlg = aoFim || null;
    modo = 'dialogo';
    $('controles').classList.add('oculto');
    $('dialogo').classList.add('on');
    teclas.esq = teclas.dir = false;
    mostrarFala();
  }
  function mostrarFala() {
    const f = filaDlg[idxDlg];
    const r = $('dlgRetrato');
    if (f.quem === 'citacao') {
      $('dlgNome').innerHTML = 'Nas palavras dele<span id="dlgPapel"></span>'; $('dlgPapel').textContent = f.autor || '';
      r.style.background = '#0f5c63'; r.style.backgroundImage = ''; r.textContent = '❝'; r.style.color = '#fff';
    } else if (f.quem === 'narrador') {
      $('dlgNome').innerHTML = 'Narração';
      r.style.background = '#111'; r.style.backgroundImage = ''; r.textContent = '★'; r.style.color = '#f6b826';
    } else {
      const p = P[f.quem];
      $('dlgNome').innerHTML = p.nome + '<span id="dlgPapel">' + p.papel + '</span>';
      r.style.color = '#111';
      if (p.retrato) {
        r.textContent = ''; r.style.background = '#ddd'; r.style.backgroundImage = 'url("' + p.retrato + '")';
      } else {
        r.style.backgroundImage = ''; r.style.background = p.corEtiqueta; r.textContent = p.nome[0];
      }
    }
    $('dlgTexto').textContent = f.texto;
    $('dlgSeg').textContent = idxDlg < filaDlg.length - 1 ? 'toque para continuar ▸' : 'toque para fechar ✓';
  }
  function avancarDialogo() {
    if (modo !== 'dialogo') return;
    som('blip');
    idxDlg++;
    if (idxDlg >= filaDlg.length) {
      $('dialogo').classList.remove('on');
      modo = 'jogo';
      $('controles').classList.remove('oculto');
      const cb = aoFimDlg; aoFimDlg = null;
      if (cb) cb();
      atualizarBotoes();
    } else mostrarFala();
  }
  $('dialogo').addEventListener('pointerdown', (e) => { e.preventDefault(); avancarDialogo(); });

  /* -------------------- PUB: ETAPAS DA MISSÃO -------------------- */
  function avancar() {
    etapa = Math.min(etapa + 1, ETAPAS.length - 1);
    objetivoAtual();
    atualizarBotoes();
  }
  const ETAPAS = [
    { id: 'falarJean', alvo: 'jean', fazer() { dialogo(D.dialogos.jeanInicio, avancar); } },
    { id: 'falarLuiz', alvo: 'luiz', fazer() { dialogo(D.dialogos.luizPedido, avancar); } },
    { id: 'setlist', alvo: 'mesa', fazer() { abrirSetlist(); } },
    { id: 'falarJoao', alvo: 'joao', fazer() { dialogo(D.dialogos.joaoPedido, avancar); } },
    { id: 'pegarCabo', alvo: 'cabo', fazer() { carregando = 'cabo'; objetos.cabo.visivel = false; som('pega'); avancar(); } },
    { id: 'entregarCabo', alvo: 'joao', fazer() { carregando = null; prontos.joao = true; dialogo(D.dialogos.joaoOk, avancar); } },
    { id: 'falarLeo', alvo: 'leo', fazer() { dialogo(D.dialogos.leoPedido, avancar); } },
    { id: 'pegarMic', alvo: 'caseMic', fazer() { carregando = 'mic'; som('pega'); avancar(); } },
    { id: 'colocarMic', alvo: 'pedestal', fazer() {
        carregando = null; micNoPedestal = true; prontos.leo = true; som('ok');
        aviso(D.falas.micOk);
        npcs.jean.x = INICIO_PALCO + 40; npcs.jean.dir = 1;   // Jean vem até o palco: menos ida e volta
        dialogo(D.dialogos.jeanPronto, avancar); } },
    { id: 'irPalco', alvo: 'pedestal', fazer() { iniciarShow(); } }
  ];

  function posDe(id) { return npcs[id] ? npcs[id].x : objetos[id].x; }

  function interacaoProxima() {
    if (modo !== 'jogo') return null;
    if (cena) return interacaoCena();
    const e = ETAPAS[etapa];
    const alvoX = posDe(e.alvo);
    if (Math.abs(m.x - alvoX) < ALCANCE) return { tipo: 'missao', rotulo: D.objetivos[e.id].botao };
    let melhor = null, dist = ALCANCE;
    for (const id of ['jean', 'luiz', 'joao', 'leo']) {
      const d = Math.abs(m.x - npcs[id].x);
      if (d < dist) { dist = d; melhor = id; }
    }
    if (melhor) return { tipo: 'conversa', id: melhor, rotulo: 'Falar' };
    return null;
  }
  function interagir() {
    if (modo === 'dialogo') { avancarDialogo(); return; }
    if (modo === 'show') { tocarNota(); return; }
    const it = interacaoProxima();
    if (!it) return;
    if (it.tipo === 'missao') { ETAPAS[etapa].fazer(); }
    else if (it.tipo === 'conversa') {
      som('blip');
      const txt = prontos[it.id] ? D.falas.pronto : D.falas.ocioso[it.id];
      bolha(it.id, txt);
    }
    else if (it.tipo === 'passo') executarPasso(cena.def.passos[cena.passo]);
    else if (it.tipo === 'extra') abrirExtra(it.e);
    else if (it.tipo === 'acenar') { som('blip'); bolha(it.a.chave, ['👋', '♥', '🤘', '😄'][Math.floor(Math.random() * 4)], 1.6); }
    atualizarBotoes();
  }
  function atualizarBotoes() {
    const b = $('acao');
    if (modo === 'show') {
      b.disabled = show.fase !== 'ritmo'; b.textContent = '♪ Tocar'; return;
    }
    const it = interacaoProxima();
    b.disabled = !it;
    b.textContent = it ? it.rotulo : 'Interagir';
    const c = $('camisa');
    c.classList.toggle('sem', m.semCamisa);
    c.classList.toggle('oculto', !!cena && !(cena.def && cena.def.camisa));
    c.setAttribute('aria-label', m.semCamisa ? 'Botar a camisa' : 'Tirar a camisa');
  }

  /* -------------------- SEQUÊNCIA (setlist e afins) -------------------- */
  const SEQUENCIAS = {
    pedido: { etiqueta: 'Balcão', titulo: 'Pedido nº 22', instr: 'Monte na ordem do cupom: 1. Lanche · 2. Batata · 3. Bebida.',
      itens: ['🍔 Lanche', '🍟 Batata', '🥤 Bebida'], dica: 'Siga o cupom: primeiro o lanche.' }
  };
  function abrirSequencia(cfg, aoFim) {
    modo = 'modal'; teclas.esq = teclas.dir = false;
    let proxima = 0, erros = 0;
    $('seqEtiqueta').textContent = cfg.etiqueta; $('seqTitulo').textContent = cfg.titulo; $('seqInstr').textContent = cfg.instr;
    const lista = $('listaMusicas'); lista.innerHTML = '';
    const ordem = cfg.itens.map((t, i) => i);
    do { ordem.sort(() => Math.random() - 0.5); } while (ordem.length > 1 && ordem.every((v, i) => v === i));
    const botoes = [];
    const fechar = () => { $('modalSetlist').classList.remove('on'); modo = 'jogo'; som('ok'); aoFim(); atualizarBotoes(); };
    const acertar = (b, i) => {
      proxima++; b.classList.add('feita'); b.querySelector('.n').textContent = proxima + '.'; som('nota');
      if (proxima === cfg.itens.length) setTimeout(fechar, 500);
    };
    ordem.forEach((i) => {
      const b = document.createElement('button');
      b.className = 'musica';
      b.innerHTML = '<span class="n">·</span>';
      b.appendChild(document.createTextNode(cfg.itens[i]));
      b.dataset.i = i;
      b.onclick = () => {
        if (b.classList.contains('feita')) return;
        if (i === proxima) acertar(b, i);
        else {
          erros++;
          som('erro'); b.classList.remove('treme'); void b.offsetWidth; b.classList.add('treme');
          $('setDica').textContent = cfg.dica;
          if (erros >= 3) $('seqAjuda').classList.remove('oculto');
        }
      };
      botoes.push(b); lista.appendChild(b);
    });
    $('seqAjuda').classList.add('oculto');
    $('seqAjuda').onclick = () => { const b = botoes.find((x) => +x.dataset.i === proxima); if (b) acertar(b, proxima); };
    $('setDica').textContent = '';
    $('modalSetlist').classList.add('on');
  }
  function abrirSetlist() {
    abrirSequencia({ etiqueta: 'Missão do Luis', titulo: 'Setlist · Bloco 1', instr: 'Toque nas músicas na ordem do show.',
      itens: D.setlistBloco1, dica: D.setlistDica }, () => {
      prontos.luiz = true; bolha('luiz', D.falas.luizSetlistOk); avancar();
    });
  }

  /* -------------------- CAMISA -------------------- */
  function alternarCamisa() {
    if (modo !== 'jogo' && modo !== 'show') return;
    if (cena && !cena.def.camisa) return;
    m.semCamisa = !m.semCamisa;
    som(m.semCamisa ? 'tira' : 'bota');
    if (modo === 'show') {
      if (m.semCamisa) {
        show.hype = Math.min(100, show.hype + 35);
        som('plateia'); aviso(D.falas.plateiaCamisa); conquista('tradicao');
        for (let i = 0; i < 14; i++) efeitos.push({ x: m.x + (Math.random() - 0.5) * 80, y: CHAO - 110, vx: (Math.random() - 0.5) * 120, vy: -80 - Math.random() * 120, vida: 1.2, txt: ['★', '♪', '♥'][i % 3] });
      }
    } else if (cena) {
      if (m.semCamisa) bolha('jean', D.falas.botaACamisa, 3);
      else aviso(D.falas.camisaDeVolta, 2000);
    } else {
      if (m.semCamisa) {
        tirouNaPreparacao = true; vezesTirou++;
        bolha('jean', D.falas.botaACamisa, 3);
        if (Math.abs(m.x - npcs.jean.x) > 420) aviso('Jean, lá do camarim: “' + D.falas.botaACamisa + '”');
        if (vezesTirou >= 3) conquista('teimoso');
      } else {
        aviso(D.falas.camisaDeVolta, 2000);
      }
    }
    atualizarBotoes();
  }

  /* -------------------- SHOW (Pub) -------------------- */
  function transicao(cb) { fadeAlvo = 1; fadeAoFim = () => { cb(); if (!fadeAoFim) fadeAlvo = 0; }; }
  function iniciarShow() {
    if (!tirouNaPreparacao) conquista('vestido');
    modo = 'show'; teclas.esq = teclas.dir = false;
    $('objRot').textContent = 'Fase 5 · Show';
    $('objTexto').textContent = D.textos.showComeca;
    $('camisa').classList.remove('oculto');
    transicao(() => {
      m.x = C.pedestal; m.dir = 1;
      show.alvos = { joao: C.pedestal + 330, luiz: C.pedestal - 150, leo: C.bateria, jean: INICIO_PALCO + 10 };
      ['joao', 'luiz', 'leo'].forEach((id, i) => { npcs[id].x = INICIO_PALCO - 40 - i * 50; });
      npcs.jean.x = INICIO_PALCO + 10; npcs.jean.dir = 1;
      show.fase = 'entrada'; show.t = 0;
      iniciarMusicaShow(); som('plateia');
      aviso(D.textos.showComeca, 2400);
      atualizarBotoes();
    });
  }
  function comecarRitmo() {
    show.fase = 'ritmo'; show.t = 0; show.notas = [];
    for (let i = 0; i < 12; i++) show.notas.push({ t: 1.6 + i * 0.75, estado: 0 });
    $('objTexto').textContent = D.textos.ritmoDica;
    $('pular').classList.remove('oculto'); $('pular').textContent = 'Só curtir ▸';
    atualizarBotoes();
  }
  function tocarNota() {
    if (show.fase !== 'ritmo') return;
    let melhor = null, dmin = 0.22;
    for (const n of show.notas) {
      if (n.estado) continue;
      const d = Math.abs(n.t - show.t);
      if (d < dmin) { dmin = d; melhor = n; }
    }
    if (melhor) {
      melhor.estado = 1; show.acertos++; show.hype = Math.min(100, show.hype + 7);
      som('nota');
      efeitos.push({ x: m.x, y: CHAO - 150, vx: 0, vy: -60, vida: 0.7, txt: 'Boa!' });
      if (show.acertos >= 8) conquista('ritmo');
    }
  }
  function terminarRitmo() {
    $('pular').classList.add('oculto');
    show.fase = 'giu'; show.t = 0;
    npcs.giu.oculto = false; npcs.giu.x = LARG + 60;
    $('objTexto').textContent = D.textos.surpresa;
    aviso(D.textos.surpresa, 2600);
    atualizarBotoes();
  }
  function abrirMidiaGiu() {
    show.fase = 'midia';
    som('plateia');
    $('midiaEtiqueta').textContent = 'No palco';
    $('midiaTitulo').textContent = D.textos.giuTitulo;
    $('midiaTexto').textContent = D.textos.giuTexto;
    const cont = $('midiaConteudo'); cont.innerHTML = '';
    const fallback = () => { cont.innerHTML = ''; cont.appendChild(ilustracaoProvisoria()); };
    if (D.midia.videoGiu) {
      const v = document.createElement('video');
      v.src = D.midia.videoGiu; v.controls = true; v.playsInline = true; v.setAttribute('playsinline', '');
      v.onerror = fallback; cont.appendChild(v);
      v.play().catch(() => {});
    } else if (D.midia.imagemGiu) {
      const i = document.createElement('img');
      i.src = D.midia.imagemGiu; i.alt = 'Giu no palco'; i.onerror = fallback; cont.appendChild(i);
    } else fallback();
    midiaAoFechar = () => { show.fase = 'final'; show.t = 0; som('plateia'); };
    $('modalMidia').classList.add('on');
  }
  function ilustracaoProvisoria() {
    const d = document.createElement('div'); d.className = 'prov';
    d.innerHTML =
      '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração: duas pessoas no palco sob um holofote">' +
      '<rect width="400" height="220" fill="#1b0f2e"/>' +
      '<rect x="70" y="18" width="260" height="70" rx="6" fill="#f6b826"/>' +
      '<text x="200" y="66" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="40" fill="#111">VOLGAN</text>' +
      '<polygon points="200,0 120,200 280,200" fill="#fff" opacity=".12"/>' +
      '<rect x="0" y="180" width="400" height="40" fill="#3a2a4a"/>' +
      '<g fill="#111"><circle cx="165" cy="118" r="13"/><rect x="151" y="132" width="28" height="48" rx="8"/>' +
      '<circle cx="235" cy="118" r="13"/><path d="M220 112 q15 -22 30 0 v30 h-30z"/><rect x="221" y="132" width="28" height="48" rx="8"/></g>' +
      '</svg>' +
      (D.mostrarMarcadores ? '<div class="rot">[PROVISÓRIO] vídeo/foto da Giu no palco → dados.js › midia.videoGiu ou midia.imagemGiu</div>' : '');
    return d;
  }
  let midiaAoFechar = null;
  $('midiaContinuar').addEventListener('click', () => {
    const v = $('midiaConteudo').querySelector('video'); if (v) v.pause();
    $('modalMidia').classList.remove('on');
    const cb = midiaAoFechar; midiaAoFechar = null;
    if (cb) cb();
  });
  function listaConquistas(el) {
    el.innerHTML = '<div class="etiqueta" style="color:#111;margin-top:8px">Conquistas</div>';
    for (const id in D.conquistas) {
      const ok = !!conquistas[id];
      const c = document.createElement('div'); c.className = 'conq' + (ok ? ' ok' : '');
      c.innerHTML = '<div class="ico">' + (ok ? '🏆' : '?') + '</div><div><b></b><span></span></div>';
      c.querySelector('b').textContent = D.conquistas[id].nome;
      c.querySelector('span').textContent = D.conquistas[id].desc;
      el.appendChild(c);
    }
  }
  function fimDoPub() {
    modo = 'fim'; $('controles').classList.add('oculto');
    if (faseAtual && faseAtual.video) abrirVideo(faseAtual.video, () => { modo = 'fim'; concluirFase(); }); else concluirFase();
  }
  function abrirFinalPub() {
    modo = 'fim';
    $('controles').classList.add('oculto');
    $('finalEtiqueta').textContent = 'Fase 5 concluída';
    $('finalTitulo').textContent = D.textos.pubFimTitulo;
    $('finalTexto').textContent = D.textos.pubFimTexto;
    $('finalTrecho').textContent = '';
    const ff = $('finalFoto'); ff.innerHTML = '';
    if (D.midia.fotoFinal) {
      const i = document.createElement('img'); i.className = 'foto'; i.alt = D.textos.finalFotoLegenda;
      i.src = D.midia.fotoFinal; i.onerror = () => { ff.innerHTML = ''; };
      ff.appendChild(i);
    }
    listaConquistas($('finalConq'));
    $('finalBotao').textContent = 'Voltar ao mapa ▸';
    finalAoFechar = () => concluirFase();
    $('modalFinal').classList.add('on');
  }
  let finalAoFechar = null;
  $('finalBotao').addEventListener('click', () => {
    $('modalFinal').classList.remove('on');
    const cb = finalAoFechar; finalAoFechar = null; if (cb) cb();
  });
  $('pular').addEventListener('click', () => { if (cinema) { fimCinematica(); return; } if (show.fase === 'ritmo') terminarRitmo(); });

  function atualizarShow(dt) {
    show.t += dt;
    show.hype = Math.max(0, show.hype - dt * 2);
    if (show.fase === 'entrada') {
      for (const id in show.alvos) { const n = npcs[id], d = show.alvos[id] - n.x; if (Math.abs(d) > 3) { n.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt); n.andando = true; n.dir = Math.sign(d); } else { n.andando = false; } }
      if (show.t > 3.2) { for (const id in show.alvos) { npcs[id].x = show.alvos[id]; npcs[id].andando = false; } npcs.joao.dir = -1; npcs.luiz.dir = 1; npcs.leo.dir = 1; comecarRitmo(); }
    }
    else if (show.fase === 'ritmo') {
      for (const n of show.notas) if (!n.estado && show.t - n.t > 0.25) n.estado = 2;
      const ultima = show.notas[show.notas.length - 1];
      if (show.t > ultima.t + 1.0) terminarRitmo();
    } else if (show.fase === 'giu') {
      const alvo = m.x + 85;
      const g = npcs.giu;
      if (g.x > alvo) { g.x = Math.max(alvo, g.x - 150 * dt); g.andando = true; }
      else { g.andando = false; if (!show.giuChegou) { show.giuChegou = true; show.t = 0; } }
      if (show.giuChegou && show.t > 0.9) abrirMidiaGiu();
    } else if (show.fase === 'final' && show.t > 1.6) {
      show.fase = 'fim'; fimDoPub();
    }
  }
  function resetPub() {
    LARG = C.largura;
    m.x = C.inicioMatheus; m.dir = 1; m.semCamisa = false; m.visual = Object.assign({}, D.visuaisPub.matheus || {}); m.oculto = false;
    npcs.jean.x = C.jean; npcs.luiz.x = C.luiz; npcs.joao.x = C.joao; npcs.leo.x = C.leo;
    npcs.giu.x = LARG + 80; npcs.giu.oculto = true; npcs.giu.andando = false;
    objetos.cabo.visivel = true; etapa = 0; carregando = null; micNoPedestal = false;
    prontos = { luiz: false, joao: false, leo: false };
    tirouNaPreparacao = false; vezesTirou = 0;
    Object.assign(show, { fase: null, t: 0, notas: [], acertos: 0, hype: 0, giuChegou: false });
    efeitos = []; bolhas.length = 0;
  }

  /* ==================== CENAS GENÉRICAS (capítulos) ==================== */
  function defCena(id) { for (const f of D.fases) for (const c of (f.cenas || [])) if (c.id === id) return c; return null; }
  function montarAtores(def) {
    const lista = [];
    const fonte = def.herdaAtores ? defCena(def.herdaAtores).atores : (def.atores || []);
    fonte.forEach((a, i) => lista.push({
      chave: 'a' + i, id: a.id, x: a.x, dir: a.dir || -1, fixo: !!a.dir && !a.segue, visual: a.visual || null, grupo: a.grupo || null,
      oculto: (!!a.revela && !def.herdaAtores) || !!a.oculto, revela: !!a.revela, segue: !!a.segue, andando: false, brilho: 0,
      acao: a.acao || null, alvoX: null, ordem: i
    }));
    return lista;
  }
  function entrarCena(idx) {
    const def = faseAtual.cenas[idx];
    if (def.cinematica) { iniciarCinematica(idx, def); return; }
    cena = {
      idx, def, passo: 0, atores: montarAtores(def), objetos: {}, pendente: null, ocupadoAte: 0,
      raios: [], aviao: -1, flashAte: def.flashback ? tempo + 3.2 : 0, viagem: null, torcida: 0
    };
    (def.objetos || []).forEach((o) => { cena.objetos[o.id] = Object.assign({ ativo: false, t: 0, oculto: false, n: 0 }, o); });
    LARG = def.largura;
    m.x = 80; m.dir = 1; m.semCamisa = false; m.capaAte = 0; m.oculto = false;
    const seguem = cena.atores.filter((a) => a.segue && !a.oculto);
    if (seguem.length) { m.x = 90 + seguem.length * 40; seguem.forEach((a, i) => { a.x = m.x - 48 - i * 34; }); }
    m.visual = Object.assign({}, def.matheus || {});
    carregando = m.visual.carrega || null;
    efeitos = []; bolhas.length = 0;
    camX = 0;
    progresso.cenaAtual[faseAtual.id] = idx; salvar();
    modo = 'jogo';
    $('controles').classList.remove('oculto'); $('pular').classList.add('oculto');
    iniciarAmbiente(def.ambiente);
    objetivoAtual(); atualizarBotoes();
    if (def.flashback) som('sino');
    if (def.intro) setTimeout(() => { if (cena && cena.def === def && modo === 'jogo') dialogo(def.intro); }, def.flashback ? 3000 : 450);
  }
  function proximaCena() {
    const prox = (cena ? cena.idx : cinema ? cinema.idx : -1) + 1;
    if (prox < faseAtual.cenas.length) {
      const mesma = faseAtual.cenas[prox].mesmaCena;
      if (mesma) entrarCena(prox); else { modo = 'transicao'; transicao(() => entrarCena(prox)); }
    } else concluirFase();
  }
  function atorPorId(id) { return cena.atores.find((a) => a.id === id && !a.oculto); }
  function atorQualquer(id) { return cena.atores.find((a) => a.id === id); }
  function xAlvo(p) {
    const a = atorPorId(p.alvo); if (a) return a.x;
    const o = cena.objetos[p.alvo]; return o ? o.x : 0;
  }
  function interacaoCena() {
    if (tempo < cena.ocupadoAte || cena.viagem) return null;
    const p = cena.def.passos[cena.passo];
    if (p && !p.auto && Math.abs(m.x - xAlvo(p)) < ALCANCE) {
      let r = p.rotulo || 'Interagir';
      if (p.repetir) { const o = cena.objetos[p.repetir.objeto]; r += ' ' + ((o ? o.n : 0) + 1) + '/' + p.repetir.n; }
      return { tipo: 'passo', rotulo: r };
    }
    for (const e of (cena.def.extras || [])) if (Math.abs(m.x - e.x) < 46) return { tipo: 'extra', e, rotulo: e.tipo === 'album' ? '📷 Ver foto' : '✉ Ler' };
    let melhor = null, dist = 46;
    for (const a of cena.atores) { if (a.oculto || P[a.id].semEtiqueta) continue; const d = Math.abs(m.x - a.x); if (d < dist) { dist = d; melhor = a; } }
    if (melhor) return { tipo: 'acenar', a: melhor, rotulo: 'Acenar 👋' };
    return null;
  }
  /* executa um passo como uma pequena sequência de etapas */
  function executarPasso(p) {
    if (p.repetir) {
      const o = cena.objetos[p.repetir.objeto];
      o.n = (o.n || 0) + 1; o.t = tempo; o.ativo = true;
      som(p.repetir.som || 'pega'); estrelas(o.x, CHAO - 90, 5, ['✦', '★']);
      if (o.n < p.repetir.n) { cena.ocupadoAte = tempo + 0.25; atualizarBotoes(); return; }
    }
    const etapas = [];
    let opcao = null;
    if (p.escolha) etapas.push((prox) => abrirEscolha(p.escolha, (op) => { opcao = op; prox(); }));
    etapas.push((prox) => {
      const ax = xAlvo(p);
      if (p.carrega) { carregando = p.carrega; const o = cena.objetos[p.alvo]; if (o) o.oculto = true; som('pega'); }
      if (p.solta) carregando = null;
      if (p.vestir) m.visual = Object.assign({}, m.visual, p.vestir);
      if (p.ativa) { const o = cena.objetos[p.ativa]; if (o) { o.ativo = true; o.t = tempo; if (opcao && opcao.estilo) o.estilo = opcao.estilo; } }
      [].concat(p.segue || []).forEach((id) => { const a = atorQualquer(id); if (a) { a.segue = true; a.fixo = false; } });
      chegar(p.chegam, p.posicoes);
      if (p.mover) for (const id in p.mover) { const a = atorQualquer(id); if (a) { a.alvoX = p.mover[id]; a.segue = false; a.fixo = false; } }
      if (opcao) chegar(opcao.chegam);
      if (p.revelar) cena.atores.forEach((a) => { if (a.revela) { a.oculto = false; a.brilho = tempo; } });
      if (p.poder) desbloquearPoder(p.poder);
      efeito(p.efeito, ax);
      if (p.aviso) aviso(p.aviso);
      prox();
    });
    if (p.sequencia) etapas.push((prox) => abrirSequencia(SEQUENCIAS[p.sequencia], prox));
    if (p.timing) etapas.push((prox) => abrirTiming(p.timing, prox));
    if (p.viagem) etapas.push((prox) => iniciarViagem(p.viagem, prox));
    etapas.push((prox) => { cena.ocupadoAte = tempo + (p.efeito === 'equipe' ? 2.0 : p.efeito ? 0.9 : 0.2); cena.pendente = prox; });
    etapas.push((prox) => {
      const bs = (opcao && opcao.bolhas) || p.bolhas;
      if (bs) { bs.forEach((b, i) => setTimeout(() => { const a = b.quem === 'matheus' ? null : atorPorId(b.quem); bolha(a ? a.chave : b.quem, b.texto, 2.6); }, i * 500)); cena.ocupadoAte = tempo + 0.6 + bs.length * 0.5; cena.pendente = prox; }
      else prox();
    });
    if (p.video) etapas.push((prox) => abrirVideo(p.video, prox));
    if (p.galeria) etapas.push((prox) => abrirGaleria(p.galeria.map((f) => ({ foto: '' + f + '.jpg' })), 'Fotos', prox));
    if (p.bordado) etapas.push((prox) => abrirBordado(prox));
    if (p.mensagem) etapas.push(() => abrirHomenagem());
    if (p.falas) etapas.push((prox) => dialogo(p.falas, prox));
    etapas.push(() => proximoPasso());
    let i = 0;
    const seguir = () => { const f = etapas[i++]; if (f) f(seguir); };
    seguir();
    atualizarBotoes();
  }
  function chegar(ids, posicoes) {
    if (!ids) return;
    const vw = W / esc;
    ids.forEach((id, i) => {
      const a = atorQualquer(id); if (!a || !a.oculto) return;
      a.oculto = false; a.brilho = tempo;
      a.x = Math.min(LARG + 40, camX + vw + 40 + i * 40);
      a.alvoX = posicoes && posicoes[i] != null ? posicoes[i] : (a.segue ? null : Math.max(60, m.x + 90 + i * 60));
      if (a.alvoX == null) a.alvoX = m.x - 60;
    });
  }
  function proximoPasso() {
    if (!cena) return;
    cena.passo++;
    if (cena.passo >= cena.def.passos.length) { proximaCena(); return; }
    objetivoAtual(); atualizarBotoes();
  }

  /* ---------- viagens de ônibus ---------- */
  function iniciarViagem(v, fim) {
    cena.viagem = { de: m.x, ate: v.ate, t: 0, dur: v.dur || 3.2, veiculo: v.veiculo, fim };
    m.oculto = true; som('whoosh'); modo = 'viagem';
    $('controles').classList.add('oculto');
  }
  function atualizarViagem(dt) {
    const v = cena.viagem; v.t += dt;
    const k = Math.min(1, v.t / v.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    m.x = v.de + (v.ate - v.de) * e;
    if (k >= 1) {
      cena.viagem = null; m.oculto = false; modo = 'jogo';
      $('controles').classList.remove('oculto');
      cena.atores.forEach((a) => { if (a.segue) a.x = m.x - 50; });
      v.fim();
    }
  }

  /* ---------- cinemáticas (voo de ida e de volta) ---------- */
  let cinema = null;
  function iniciarCinematica(idx, def) {
    cena = null; cinema = { idx, def, t: 0 };
    modo = 'cinema';
    $('controles').classList.add('oculto');
    $('pular').classList.remove('oculto'); $('pular').textContent = 'Pular ▸';
    $('objRot').textContent = 'Fase ' + faseAtual.id + ' · ' + faseAtual.nome; $('objTexto').textContent = def.texto || '';
    som('whoosh'); iniciarAmbiente('aviao');
  }
  function fimCinematica() {
    if (!cinema) return;
    $('pular').classList.add('oculto');
    modo = 'transicao';
    transicao(() => { const c = cinema; cinema = null; cena = null; const prox = c.idx + 1; if (prox < faseAtual.cenas.length) entrarCena(prox); else concluirFase(); });
  }
  function desenharCinematica() {
    const c = cinema, t = c.t;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (c.def.cinematica === 'voo') {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a7bd5'); g.addColorStop(1, '#ffd6a8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (t > 2.6) { // Paris surgindo lá embaixo
        const a = Math.min(1, (t - 2.6) / 1.5); ctx.globalAlpha = a; ctx.fillStyle = '#4a5a7a';
        const bx = W * 0.62, by = H * 0.92, s = Math.min(W, H) / 260;
        ctx.beginPath(); ctx.moveTo(bx, by - 120 * s); ctx.lineTo(bx + 30 * s, by); ctx.lineTo(bx - 30 * s, by); ctx.fill();
        ctx.fillRect(bx - 26 * s, by - 44 * s, 52 * s, 4 * s); ctx.globalAlpha = 1;
      }
      for (let camada = 0; camada < 3; camada++) {
        const vel = 60 + camada * 90, y = H * (0.2 + camada * 0.28), r = 30 + camada * 18;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.55 - camada * 0.12) + ')';
        for (let i = 0; i < 6; i++) { const x = ((i * 260 - t * vel) % (W + 300) + W + 300) % (W + 300) - 150; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.arc(x + r, y - r * 0.4, r * 0.8, 0, 7); ctx.arc(x + r * 2, y, r * 0.9, 0, 7); ctx.fill(); }
      }
      aviaoLateral(W * 0.5 + Math.sin(t * 1.2) * 10, H * 0.58 + Math.sin(t * 2) * 6, Math.min(W / 520, H / 300));
      tituloTela(c.def.texto, t);
      if (t > 6.5) fimCinematica();
    } else {
      // mapa: França → Brasil, com a família no avião
      ctx.fillStyle = '#1d5f8a'; ctx.fillRect(0, 0, W, H);
      const deitado = W >= H, pt = (u, v) => deitado ? [u * W, v * H] : [(1 - v) * W, u * H];
      const terra = (lista, cor) => { ctx.fillStyle = cor; ctx.beginPath(); lista.forEach(([u, v], i) => { const [x, y] = pt(u, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.fill(); };
      terra([[0, 0.5], [0.3, 0.48], [0.5, 0.62], [0.42, 1], [0, 1]], '#3f9a4f');
      terra([[0.55, 0], [1, 0], [1, 0.3], [0.7, 0.36], [0.58, 0.2]], '#8fb35a');
      const [x0, y0] = pt(0.8, 0.18), [x1, y1] = pt(0.2, 0.75);
      const k = Math.min(1, t / 5), cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - H * 0.1;
      ctx.strokeStyle = '#fff3d6'; ctx.setLineDash([6, 10]); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke(); ctx.setLineDash([]);
      const q = (a, b, c2, s) => (1 - s) * (1 - s) * a + 2 * (1 - s) * s * b + s * s * c2;
      const px = q(x0, cx, x1, k), py = q(y0, cy, y1, k);
      ctx.font = '900 ' + Math.round(Math.min(W, H) / 9) + 'px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
      ctx.save(); ctx.translate(px, py); ctx.scale(-1, 1); ctx.fillText('✈', 0, 14); ctx.restore();
      ctx.font = '900 ' + Math.round(Math.min(W, H) / 22) + 'px Arial Black, Arial'; ctx.fillStyle = '#fff';
      ctx.fillText('FRANÇA', x0, y0 - 24); ctx.fillText('BRASIL', x1, y1 + 46);
      ctx.font = '700 ' + Math.round(Math.min(W, H) / 30) + 'px system-ui, Arial'; ctx.fillStyle = '#fff3d6';
      ctx.fillText('Matheus · Giu · Lys · Luca', px, py + 40);
      tituloTela(c.def.texto, t);
      if (t > 6.5) fimCinematica();
    }
  }
  function tituloTela(txt, t) {
    if (!txt) return;
    ctx.globalAlpha = Math.min(1, t, (6.5 - t)); ctx.textAlign = 'center';
    ctx.font = '900 ' + Math.round(Math.min(46, W / 12)) + 'px Arial Black, Arial';
    ctx.lineWidth = 6; ctx.strokeStyle = '#111'; ctx.fillStyle = '#f6b826';
    const ty = Math.max(120, H * 0.24); ctx.strokeText(txt, W / 2, ty); ctx.fillText(txt, W / 2, ty); ctx.globalAlpha = 1;
  }
  function aviaoLateral(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#f4f6f8'; rr(-150, -24, 300, 48, 24); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-150, -10); ctx.lineTo(-190, -70); ctx.lineTo(-160, -70); ctx.lineTo(-110, -20); ctx.fill();
    ctx.fillStyle = '#d0d6dc'; ctx.beginPath(); ctx.moveTo(-20, 10); ctx.lineTo(40, 70); ctx.lineTo(70, 70); ctx.lineTo(40, 10); ctx.fill();
    ctx.fillStyle = '#1d3c78'; ctx.fillRect(-150, 6, 300, 6);
    ctx.fillStyle = '#9fd0f0'; for (let i = 0; i < 7; i++) { rr(-110 + i * 30, -12, 18, 14, 6); ctx.fill(); }
    // Matheus e Giu na janela
    const caras = [[-20, '#d2a07a', '#17110e'], [10, '#ecc4a2', '#e2c48a']];
    for (const [cx, pele, cab] of caras) { ctx.fillStyle = pele; ctx.beginPath(); ctx.arc(cx + 9, -4, 5, 0, 7); ctx.fill(); ctx.fillStyle = cab; ctx.beginPath(); ctx.arc(cx + 9, -6, 5.2, Math.PI, 0); ctx.fill(); }
    ctx.fillStyle = '#9fd0f0'; ctx.beginPath(); ctx.moveTo(140, -8); ctx.quadraticCurveTo(156, 0, 140, 10); ctx.fill();
    ctx.restore();
  }

  /* ---------- poderes ---------- */
  function poderesLiberados() { return D.poderes.filter((p) => progresso.poderesLib.includes(p.id)); }
  function desbloquearPoder(id) {
    if (progresso.poderesLib.includes(id)) return;
    progresso.poderesLib.push(id); salvar();
    const p = D.poderes.find((x) => x.id === id); if (!p) return;
    som('poder'); m.capaAte = tempo + 2;
    const t = $('toastPoder'); t.innerHTML = '<small>Novo poder</small><b></b><span></span>';
    t.querySelector('b').textContent = '✦ ' + p.nome; t.querySelector('span').textContent = p.desc; t.style.borderColor = p.cor;
    t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 3200);
    atualizarBadgePoder();
  }
  function atualizarBadgePoder() { $('poderesBtn').textContent = '✦ ' + progresso.poderesLib.length; }
  $('poderesBtn').addEventListener('click', () => {
    const el = $('listaPoderes'); el.innerHTML = '';
    D.poderes.forEach((p) => {
      const ok = progresso.poderesLib.includes(p.id);
      const d = document.createElement('div'); d.className = 'conq' + (ok ? ' ok' : '');
      d.innerHTML = '<div class="ico" style="background:' + (ok ? p.cor : '#ddd') + '">' + (ok ? '✦' : '?') + '</div><div><b></b><span></span></div>';
      d.querySelector('b').textContent = ok ? p.nome : '???'; d.querySelector('span').textContent = ok ? p.desc : 'Ainda vai aparecer na história.';
      el.appendChild(d);
    });
    abrirModalSimples('modalPoderes');
  });
  let modoAntesModal = null;
  function abrirModalSimples(id) { modoAntesModal = modo; modo = 'modal'; teclas.esq = teclas.dir = false; $(id).classList.add('on'); }
  function fecharModalSimples(id) { $(id).classList.remove('on'); modo = modoAntesModal || 'jogo'; atualizarBotoes(); }
  $('fecharPoderes').addEventListener('click', () => fecharModalSimples('modalPoderes'));

  /* ---------- escolha ---------- */
  function abrirEscolha(cfg, aoEscolher) {
    modo = 'modal'; teclas.esq = teclas.dir = false;
    $('escPergunta').textContent = cfg.pergunta;
    const el = $('escOpcoes'); el.innerHTML = '';
    cfg.opcoes.forEach((op, i) => {
      const b = document.createElement('button'); b.className = 'musica'; b.textContent = op.texto;
      b.onclick = () => {
        $('modalEscolha').classList.remove('on'); modo = 'jogo'; som('ok');
        progresso.escolhas = (progresso.escolhas || 0) + 1; salvar();
        if (cfg.opcoes.length >= 3) { progresso.conselho = (progresso.conselho || []); if (!progresso.conselho.includes(i)) progresso.conselho.push(i); if (progresso.conselho.length >= 2) conquista('conselho'); }
        aoEscolher(op);
      };
      el.appendChild(b);
    });
    $('modalEscolha').classList.add('on');
  }

  /* ---------- timing: enquadrar, fotografar, registrar o gol ---------- */
  let tim = null;
  function abrirTiming(cfg, fim) {
    modo = 'modal'; teclas.esq = teclas.dir = false;
    $('timTitulo').textContent = cfg.titulo; $('timInstr').textContent = cfg.instr; $('timMsg').textContent = '';
    $('timAlvo').textContent = cfg.tipo === 'chute' ? '⚽' : '🎯';
    tim = { t0: performance.now(), tent: 0, fim, zona: [0.4, 0.6] };
    $('timZona').style.left = '40%'; $('timZona').style.width = '20%';
    $('modalTiming').classList.add('on');
    const anim = () => {
      if (!tim) return;
      const k = (Math.sin((performance.now() - tim.t0) / 520) + 1) / 2;
      tim.k = k; $('timAlvo').style.left = 'calc(' + (k * 100) + '% - 14px)';
      requestAnimationFrame(anim);
    };
    anim();
  }
  $('timBotao').addEventListener('click', () => {
    if (!tim) return;
    tim.tent++;
    const ok = tim.k >= tim.zona[0] - 0.03 && tim.k <= tim.zona[1] + 0.03;
    if (ok || tim.tent >= 3) {
      som(ok ? 'click' : 'ok'); flashTela = 0.8;
      $('timMsg').textContent = ok ? 'Na mosca! 📸' : 'Quase! Mas o registro ficou ótimo.';
      const f = tim.fim; tim = null;
      setTimeout(() => { $('modalTiming').classList.remove('on'); modo = 'jogo'; contarPoder(); f(); }, 700);
    } else { som('erro'); $('timMsg').textContent = 'Quase! Tenta de novo (' + tim.tent + '/3).'; }
  });

  /* ---------- galeria (setas e contador) ---------- */
  let gal = null;
  function abrirGaleria(itens, titulo, fim) {
    gal = { itens, i: 0, fim, modoAntes: modo };
    modo = 'modal'; teclas.esq = teclas.dir = false;
    $('galTitulo').textContent = titulo || 'Fotos';
    mostrarGaleria();
    $('modalGaleria').classList.add('on');
  }
  function mostrarGaleria() {
    const it = gal.itens[gal.i];
    const img = $('galImg'); img.src = it.foto; img.alt = it.legenda || 'Foto';
    $('galLegenda').textContent = it.legenda || '';
    $('galCont').textContent = gal.itens.length > 1 ? (gal.i + 1) + ' / ' + gal.itens.length : '';
    $('galAnt').classList.toggle('oculto', gal.itens.length < 2); $('galProx').classList.toggle('oculto', gal.itens.length < 2);
    if (!progresso.fotos.includes(it.foto)) { progresso.fotos.push(it.foto); salvar(); if (progresso.fotos.length >= 10) conquista('album'); }
  }
  $('galAnt').addEventListener('click', () => { gal.i = (gal.i - 1 + gal.itens.length) % gal.itens.length; som('blip'); mostrarGaleria(); });
  $('galProx').addEventListener('click', () => { gal.i = (gal.i + 1) % gal.itens.length; som('blip'); mostrarGaleria(); });
  $('galFechar').addEventListener('click', () => {
    $('modalGaleria').classList.remove('on');
    const g = gal; gal = null; modo = g.modoAntes === 'modal' ? 'jogo' : g.modoAntes; if (modo === 'modal') modo = 'jogo';
    atualizarBotoes(); if (g.fim) g.fim();
  });
  $('galImg').addEventListener('error', () => { $('galLegenda').textContent = 'Foto indisponível. Siga em frente!'; });

  /* ---------- vídeo real (pausa trilha e ambiente) ---------- */
  let vidFim = null, vidModo = null;
  function abrirVideo(v, fim) {
    vidFim = fim; vidModo = modo; modo = 'modal'; teclas.esq = teclas.dir = false;
    pararMusica(); pararAmbiente();
    $('vidTitulo').textContent = v.titulo || 'Vídeo'; $('vidTexto').textContent = v.texto || '';
    const box = $('vidBox'); box.innerHTML = '';
    const el = document.createElement('video');
    el.src = v.src; el.controls = true; el.playsInline = true; el.setAttribute('playsinline', ''); el.preload = 'metadata';
    el.onerror = () => { box.innerHTML = '<p>Não deu para abrir o vídeo aqui. Siga em frente!</p>'; };
    el.onended = () => { $('vidFechar').textContent = 'Continuar ▸'; };
    box.appendChild(el);
    $('vidFechar').textContent = 'Pular ▸';
    $('modalVideo').classList.add('on');
    el.play().catch(() => {});
  }
  $('vidFechar').addEventListener('click', () => {
    const v = $('vidBox').querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    $('modalVideo').classList.remove('on');
    modo = vidModo === 'modal' ? 'jogo' : (vidModo || 'jogo');
    retomarSom();
    const f = vidFim; vidFim = null; if (f) f();
  });
  function retomarSom() {
    if (modo === 'show') iniciarMusicaShow();
    else if (faseAtual) { iniciarTrilha(faseAtual.trilha, faseAtual.pub ? 0.45 : 0.7); if (cena) iniciarAmbiente(cena.def.ambiente); }
    else if (modo === 'mapa') iniciarTrilha(trilhaMapa, 0.5);
  }

  /* ---------- bordado do colete ---------- */
  function abrirBordado(fim) { midiaAoFechar = () => { modo = 'jogo'; fim(); }; modo = 'modal'; $('modalBordado').classList.add('on'); som('sino'); }
  $('bordadoFechar').addEventListener('click', () => { $('modalBordado').classList.remove('on'); const cb = midiaAoFechar; midiaAoFechar = null; if (cb) cb(); });

  function abrirExtra(e) {
    if (e.tipo === 'album') { abrirGaleria([{ foto: e.foto, legenda: e.legenda }], 'Álbum', null); return; }
    modo = 'modal'; teclas.esq = teclas.dir = false; som('blip');
    $('midiaEtiqueta').textContent = 'Cartão'; $('midiaConteudo').innerHTML = '';
    $('midiaTitulo').textContent = e.titulo || ''; $('midiaTexto').textContent = e.texto || '';
    midiaAoFechar = () => { modo = 'jogo'; atualizarBotoes(); };
    $('modalMidia').classList.add('on');
  }

  /* ---------- capa e fecho de capítulo ---------- */
  function abrirCapa(f) {
    $('capaNum').textContent = 'Capítulo ' + f.id + ' · ' + (f.ano || '');
    $('capaNome').textContent = f.nome; $('capaSub').textContent = f.sub;
    $('capaFoto').style.backgroundImage = f.capa ? 'url("' + f.capa.foto + '")' : '';
    $('capaLegenda').textContent = f.capa ? f.capa.legenda : '';
    $('capaJogar').onclick = () => { $('capa').classList.remove('on'); som('ok'); entrarFaseDireto(f.id); };
    $('capaVoltar').onclick = () => { $('capa').classList.remove('on'); };
    $('capa').classList.add('on');
  }
  function abrirFrase(f, aoFim) {
    modo = 'fim';
    $('controles').classList.add('oculto');
    $('fraseNum').textContent = 'Capítulo ' + f.id + ' concluído';
    $('fraseTexto').textContent = f.frase || '';
    const fotos = (f.fotos || []).map((n) => '' + n + '.jpg');
    const tira = $('fraseFotos'); tira.innerHTML = '';
    fotos.forEach((src, i) => {
      const im = document.createElement('img'); im.src = src; im.alt = 'Foto do capítulo'; im.style.animationDelay = (i * 0.12) + 's';
      im.onclick = () => abrirGaleria(fotos.map((x) => ({ foto: x })), f.nome, null);
      im.onerror = () => im.remove(); tira.appendChild(im);
    });
    $('fraseContinuar').onclick = () => { $('fraseTela').classList.remove('on'); aoFim(); };
    $('fraseTela').classList.add('on'); som('sino');
  }

  /* ---------- mensagem final e álbum da vida ---------- */
  let hIdx = 0;
  function abrirHomenagem() {
    modo = 'fim'; pararMusica(); pararAmbiente();
    $('controles').classList.add('oculto'); $('hud').classList.add('oculto');
    if (!progresso.concluidas.includes(10)) progresso.concluidas.push(10);
    if (todasConcluidas()) conquista('heroi');
    salvar();
    hIdx = 0; mostrarTrecho();
    $('homenagem').classList.add('on');
    tocarAlbumMusica(0.55, D.musicaHomenagem || D.musicaAlbum);
  }
  function mostrarTrecho() {
    const h = D.homenagem, el = $('hTexto');
    el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra');
    el.textContent = h.trechos[hIdx];
    $('hCont').textContent = (hIdx + 1) + ' / ' + h.trechos.length;
    const ultimo = hIdx === h.trechos.length - 1;
    $('hAssin').textContent = ultimo ? '— ' + h.assinatura : '';
    $('hProx').textContent = ultimo ? 'Ver o álbum da sua vida ▸' : 'Continuar ▸';
  }
  $('hProx').addEventListener('click', () => {
    const h = D.homenagem;
    if (hIdx < h.trechos.length - 1) { hIdx++; mostrarTrecho(); return; }
    $('homenagem').classList.remove('on'); abrirAlbum(true);
  });
  $('hTudo').addEventListener('click', () => {
    const h = D.homenagem; $('hTexto').textContent = h.trechos.join('\n\n'); $('hAssin').textContent = '— ' + h.assinatura;
    hIdx = h.trechos.length - 1; $('hProx').textContent = 'Ver o álbum da sua vida ▸'; $('hCont').textContent = '';
  });
  let albumAudio = null;
  function tocarAlbumMusica(vol, src) {
    pararMusica();
    src = src || D.musicaAlbum;
    try {
      if (albumAudio && albumAudio._src !== src) { albumAudio.pause(); albumAudio = null; }
      if (!albumAudio) { albumAudio = new Audio(src); albumAudio._src = src; albumAudio.loop = true; }
      albumAudio.volume = vol; albumAudio.muted = !somLigado;
      albumAudio.play().catch(() => {});
    } catch (e) { /* sem música, o álbum continua */ }
  }
  function pararAlbumMusica() { if (albumAudio) albumAudio.pause(); }
  const alb = { i: 0, timer: null, pausado: false, depois: false };
  function abrirAlbum(depoisDoFinal) {
    alb.depois = !!depoisDoFinal; alb.i = 0; alb.pausado = false;
    modo = 'album'; pararMusica(); pararAmbiente(); fecharMapa();
    $('album').classList.add('on'); $('albPausa').textContent = '❚❚';
    tocarAlbumMusica(0.9, D.musicaAlbum);
    mostrarSlide();
  }
  function mostrarSlide() {
    clearTimeout(alb.timer);
    const s = D.album[alb.i], palco = $('albPalco');
    const novo = document.createElement('div'); novo.className = 'slide';
    if (s.capitulo) {
      novo.classList.add('cap');
      novo.innerHTML = '<div class="capT"></div><div class="linha"></div>';
      novo.querySelector('.capT').textContent = s.capitulo;
    } else {
      const src = '' + s.foto + '.jpg';
      novo.innerHTML = '<div class="fundoBlur"></div><figure><div class="kb"><img alt=""></div><figcaption><small></small><span></span></figcaption></figure>';
      novo.querySelector('.fundoBlur').style.backgroundImage = 'url("' + src + '")';
      const im = novo.querySelector('img'); im.src = src; im.alt = s.texto || '';
      novo.querySelector('.kb').style.animationName = ['kb1', 'kb2', 'kb3'][alb.i % 3];
      novo.querySelector('small').textContent = s.ano || ''; novo.querySelector('span').textContent = s.texto || '';
    }
    palco.appendChild(novo);
    requestAnimationFrame(() => novo.classList.add('on'));
    const velhos = palco.querySelectorAll('.slide'); velhos.forEach((v) => { if (v !== novo) { v.classList.remove('on'); setTimeout(() => v.remove(), 1600); } });
    const fotos = D.album.filter((x) => x.foto).length, nFoto = D.album.slice(0, alb.i + 1).filter((x) => x.foto).length;
    $('albCont').textContent = nFoto + ' / ' + fotos;
    if (!alb.pausado) alb.timer = setTimeout(avancarSlide, s.capitulo ? 3600 : 6500);
  }
  function avancarSlide(d) { alb.i = (alb.i + (d || 1) + D.album.length) % D.album.length; mostrarSlide(); }
  $('albProx').addEventListener('click', () => avancarSlide(1));
  $('albAnt').addEventListener('click', () => avancarSlide(-1));
  $('albPausa').addEventListener('click', () => {
    alb.pausado = !alb.pausado; $('albPausa').textContent = alb.pausado ? '▶' : '❚❚';
    if (alb.pausado) { clearTimeout(alb.timer); if (albumAudio) albumAudio.pause(); } else { if (albumAudio && somLigado) albumAudio.play().catch(() => {}); mostrarSlide(); }
  });
  $('albFechar').addEventListener('click', () => {
    clearTimeout(alb.timer); pararAlbumMusica(); $('album').classList.remove('on');
    if (alb.depois) { alb.depois = false; faseAtual = D.fases.find((f) => f.id === 10); concluirFaseSemFrase(); }
    else abrirMapa(null);
  });

  /* -------------------- EFEITOS ("surgindo coisas") -------------------- */
  const CORES_CONF = ['#f6b826', '#d93a2b', '#2bb3b1', '#ff6fb5', '#7a3cff', '#fff'];
  function estrelas(x, y, n, chars) {
    for (let i = 0; i < n; i++) efeitos.push({ x: x + (Math.random() - 0.5) * 40, y, vx: (Math.random() - 0.5) * 160, vy: -60 - Math.random() * 140, vida: 1 + Math.random() * 0.5, txt: chars[i % chars.length] });
  }
  function confeteParticula(x, y) {
    efeitos.push({ x, y, vx: (Math.random() - 0.5) * 220, vy: -40 - Math.random() * 200, vida: 2 + Math.random(), cor: CORES_CONF[Math.floor(Math.random() * CORES_CONF.length)], r: Math.random() * 6 });
  }
  function contarPoder() { progresso.poderes = (progresso.poderes || 0) + 1; salvar(); if (progresso.poderes >= 15) conquista('criador'); }
  function corPoder() { const l = poderesLiberados(); return l.length ? l[Math.floor(Math.random() * l.length)].cor : '#f6b826'; }
  function efeito(nome, x) {
    if (!nome) return;
    const nivel = Math.max(1, progresso.poderesLib.length);
    switch (nome) {
      case 'brilho': som('ok'); estrelas(x, CHAO - 120, 6 + nivel, ['★', '✦']); break;
      case 'poder':
        som('poder'); m.capaAte = tempo + 1.2 + nivel * 0.25; contarPoder();
        cena.raios.push({ x0: m.x, x1: x, t: tempo, cor: corPoder(), larg: 4 + nivel });
        if (nivel >= 3) setTimeout(() => cena && cena.raios.push({ x0: m.x, x1: x, t: tempo, cor: corPoder(), larg: 3 + nivel }), 150);
        setTimeout(() => estrelas(x, CHAO - 130, 8 + nivel * 3, ['✦', '★', '✸']), 250); break;
      case 'notas': som('acorde'); estrelas(x, CHAO - 90, 10, ['♪', '♫']); break;
      case 'coracao': som('ok'); estrelas((x + m.x) / 2, CHAO - 120, 10, ['♥', '♥', '✦']); break;
      case 'confete': som('sino'); som('plateia'); for (let i = 0; i < 90; i++) confeteParticula(x + (Math.random() - 0.5) * 300, CHAO - 240); break;
      case 'poeira': som('thud'); estrelas(x, CHAO - 30, 10, ['•', '●', '•']); break;
      case 'troca': som('tira'); estrelas(m.x, CHAO - 80, 10, ['✦', '★']); break;
      case 'flash': som('click'); flashTela = 1; estrelas(x, CHAO - 120, 6, ['★']); break;
      case 'rec': som('click'); flashTela = 0.6; efeitos.push({ x, y: CHAO - 150, vx: 0, vy: -30, vida: 1.2, txt: '● REC' }); contarPoder(); break;
      case 'luzes': som('poder'); flashTela = 0.5; for (let i = 0; i < 40; i++) confeteParticula(x + (Math.random() - 0.5) * 200, CHAO - 260); estrelas(x, CHAO - 200, 12, ['✦', '★']); break;
      case 'estadio': som('plateia'); som('plateia'); cena.torcida = 1; flashTela = 0.7; break;
      case 'torcida': som('plateia'); estrelas(x, CHAO - 140, 10, ['⚽', '★', '🎉']); break;
      case 'incentivo': {
        som('poder'); contarPoder();
        const j = atorPorId('jean'); if (j) { cena.raios.push({ x0: m.x, x1: j.x, t: tempo, cor: '#9fe0a0', larg: 6 }); j.brilho = tempo; estrelas(j.x, CHAO - 150, 12, ['💡', '✦', '★']); }
        break;
      }
      case 'equipe': {
        som('poder'); m.capaAte = tempo + 2.6; contarPoder();
        const alvos = cena.atores.filter((a) => !a.oculto);
        alvos.forEach((a, i) => setTimeout(() => {
          if (!cena || !cena.raios) return;
          cena.raios.push({ x0: m.x, x1: a.x, t: tempo, cor: corPoder(), larg: 4 + nivel / 2 }); a.brilho = tempo;
          estrelas(a.x, CHAO - 140, 5, ['✦', '★', '♪']); tom(523 + i * 80, 0.12, 'triangle', 0.1);
        }, 180 + i * 200));
        break;
      }
    }
  }
  function atualizarEfeitos(dt) {
    for (let i = efeitos.length - 1; i >= 0; i--) {
      const e = efeitos[i];
      e.x += e.vx * dt; e.y += e.vy * dt; e.vy += (e.cor ? 160 : 60) * dt; e.vida -= dt;
      if (e.cor) e.vx *= 0.99;
      if (e.vida <= 0) efeitos.splice(i, 1);
    }
  }
  function atualizarCena(dt) {
    if (cena.viagem) { atualizarViagem(dt); return; }
    if (cena.pendente && tempo >= cena.ocupadoAte) { const cb = cena.pendente; cena.pendente = null; cb(); }
    const p = cena.def.passos[cena.passo];
    if (p && p.auto && !cena.pendente && modo === 'jogo' && Math.abs(m.x - xAlvo(p)) < 40) executarPasso(p);
    cena.torcida = Math.max(0, cena.torcida - dt * 0.05);
    for (const a of cena.atores) {
      if (a.oculto) continue;
      let alvo = null;
      if (a.alvoX != null) { alvo = a.alvoX; if (Math.abs(a.x - alvo) < 4) { a.alvoX = null; alvo = null; } }
      else if (a.segue) { const ord = cena.atores.filter((b) => b.segue && !b.oculto).indexOf(a); alvo = m.x - m.dir * (48 + ord * 34); if (Math.abs(alvo - a.x) < 8) alvo = null; }
      if (alvo != null) { const d = alvo - a.x; a.x += Math.sign(d) * Math.min(Math.abs(d), VEL * 0.95 * dt); a.andando = true; a.dir = Math.sign(d) || a.dir; }
      else { a.andando = false; if (!a.fixo || a.segue) a.dir = m.x > a.x ? 1 : -1; }
    }
  }

  /* -------------------- FASES E MAPA -------------------- */
  function entrarFase(id) {
    const f = D.fases.find((x) => x.id === id);
    if (!f || !faseLiberada(id)) return;
    if (f.capa && modo === 'mapa') { abrirCapa(f); return; }
    entrarFaseDireto(id);
  }
  function entrarFaseDireto(id) {
    const f = D.fases.find((x) => x.id === id);
    faseAtual = f;
    fecharMapa();
    $('hud').classList.remove('oculto');
    $('controles').classList.remove('oculto');
    $('pular').classList.add('oculto');
    iniciarAudio();
    if (f.poder) desbloquearPoder(f.poder);
    if (f.pub) {
      cena = null; resetPub();
      modo = 'jogo'; pararAmbiente();
      iniciarTrilha(f.trilha, 0.45);
      objetivoAtual(); atualizarBotoes();
      setTimeout(() => { if (modo === 'jogo' && !cena && etapa === 0) aviso('Use ◀ ▶ para andar', 2600); }, 400);
    } else {
      const concl = progresso.concluidas.includes(id);
      let idx = progresso.cenaAtual[id] || 0;
      if (concl || idx >= f.cenas.length) idx = 0;
      iniciarTrilha(f.trilha, 0.7);
      entrarCena(idx);
    }
  }
  function concluirFase() {
    const f = faseAtual;
    if (f && f.frase) { pararAmbiente(); abrirFrase(f, concluirFaseSemFrase); }
    else concluirFaseSemFrase();
  }
  function concluirFaseSemFrase() {
    const id = faseAtual ? faseAtual.id : null;
    const nova = id && !progresso.concluidas.includes(id);
    if (id && !modoTeste) {
      if (nova) progresso.concluidas.push(id);
      delete progresso.cenaAtual[id];
      if (todasConcluidas()) conquista('heroi');
      salvar();
    }
    const ultimo = id === 10 && !progresso.viuFinal;
    const voltar = () => {
      cena = null; cinema = null; faseAtual = null; pararMusica(); pararAmbiente();
      if (ultimo) { progresso.viuFinal = true; salvar(); faseAtual = D.fases.find((x) => x.id === 10); abrirHomenagem(); return; }
      abrirMapa(nova ? id : null);
    };
    modo = 'transicao';
    transicao(voltar);
  }
  function voltarAoMapaNoMeio() {
    if (modo === 'titulo' || modo === 'mapa') return;
    ['modalSetlist', 'modalMidia', 'modalFinal', 'modalEscolha', 'modalTiming', 'modalGaleria', 'modalVideo', 'modalBordado'].forEach((x) => $(x).classList.remove('on'));
    tim = null; gal = null;
    const v = $('vidBox').querySelector('video'); if (v) v.pause();
    $('dialogo').classList.remove('on'); $('fraseTela').classList.remove('on');
    cena = null; cinema = null; faseAtual = null; pararMusica(); pararAmbiente();
    abrirMapa(null);
  }

  const NOS = { 1: [0.08, 0.8], 2: [0.28, 0.2], 3: [0.48, 0.1], 4: [0.68, 0.22], 5: [0.9, 0.46], 6: [0.74, 0.8], 7: [0.56, 0.9], 8: [0.38, 0.82], 9: [0.2, 0.62], 10: [0.46, 0.64] };
  let mapaSelecionada = null;
  function abrirMapa(recemConcluida) {
    modo = 'mapa';
    $('hud').classList.add('oculto'); $('controles').classList.add('oculto');
    $('mapa').classList.remove('oculto');
    iniciarTrilha(trilhaMapa, 0.5);
    mapaNivel = 1; $('abaN1').classList.add('on'); $('abaN2').classList.remove('on');
    mapaSelecionada = faseAtualMapa() || (recemConcluida || 10);
    $('mapaAlbum').classList.toggle('oculto', !progresso.viuFinal);
    desenharMapa();
    if (recemConcluida) {
      const f = D.fases.find((x) => x.id === recemConcluida);
      mapaBanner('★ Capítulo ' + f.id + ' concluído' + (faseAtualMapa() ? ' · próximo liberado!' : ''));
      som('ok');
    }
  }
  $('mapaAlbum').addEventListener('click', () => { iniciarAudio(); abrirAlbum(false); });
  $('mapaMensagem').addEventListener('click', () => { iniciarAudio(); fecharMapa(); faseAtual = D.fases.find((f) => f.id === 10); abrirHomenagem(); });
  function fecharMapa() { $('mapa').classList.add('oculto'); }
  let bannerTimer = null;
  function mapaBanner(t) { const b = $('mapaBanner'); b.textContent = t; b.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 3200); }
  function avatarMatheus() {
    const c = document.createElement('canvas'); c.width = 120; c.height = 160;
    const antigo = ctx; ctx = c.getContext('2d');
    ctx.translate(60, 152 - CHAO * 1.15); ctx.scale(1.15, 1.15);
    const vis = m.visual; m.visual = null; const sc = m.semCamisa; m.semCamisa = false;
    desenharPessoa('matheus', 0, 1, false, { capa: true, semEtiqueta: true }, null, 'm');
    m.visual = vis; m.semCamisa = sc;
    ctx = antigo;
    return c.toDataURL();
  }
  let mapaNivel = 1;
  const NOS2 = { 11: [0.14, 0.78], 12: [0.38, 0.55], 13: [0.62, 0.68], 14: [0.85, 0.22] };
  function trocarNivel(n) {
    mapaNivel = n; som('blip');
    mapaSelecionada = n === 2 ? 11 : (faseAtualMapa() || 10);
    $('abaN1').classList.toggle('on', n === 1); $('abaN2').classList.toggle('on', n === 2);
    desenharMapa();
  }
  $('abaN1').addEventListener('click', () => trocarNivel(1));
  $('abaN2').addEventListener('click', () => trocarNivel(2));
  function desenharMapaNivel2() {
    const deitado = window.innerWidth >= window.innerHeight;
    const VW = deitado ? 1000 : 600, VH = deitado ? 600 : 1000;
    const pt = (u, v) => deitado ? [u * VW, v * VH] : [(1 - v) * VW, u * VH];
    let s = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="esp" cx="70%" cy="20%" r="90%"><stop offset="0" stop-color="#3a1f6b"/><stop offset="1" stop-color="#07071a"/></radialGradient></defs>' +
      '<rect width="' + VW + '" height="' + VH + '" fill="url(#esp)"/>';
    for (let i = 0; i < 90; i++) s += '<circle cx="' + ((i * 137) % VW) + '" cy="' + ((i * 89) % VH) + '" r="' + (1 + (i % 3)) + '" fill="#fff" opacity="' + (0.3 + (i % 5) / 8) + '"/>';
    const [tx, ty] = pt(0.12, 1.05);
    s += '<circle cx="' + tx + '" cy="' + ty + '" r="' + (VW * 0.36) + '" fill="#2f7fb8" stroke="#8fd3ff" stroke-width="6"/>';
    const [px, py] = pt(0.85, 0.22);
    s += '<circle cx="' + px + '" cy="' + py + '" r="70" fill="#c46a3a"/><ellipse cx="' + px + '" cy="' + py + '" rx="112" ry="22" fill="none" stroke="#f6b826" stroke-width="7" transform="rotate(-18 ' + px + ' ' + py + ')"/>';
    let d = '';
    [11, 12, 13, 14].forEach((id, i) => { const [x, y] = pt(...NOS2[id]); d += (i ? ' L' : 'M') + x + ' ' + y; });
    s += '<path id="rota2" d="' + d + '" fill="none" stroke="#fff3d6" stroke-width="6" stroke-dasharray="3 14" stroke-linecap="round" opacity=".7"/>' +
      '<text font-size="38"><textPath href="#rota2" startOffset="0">🚀<animate attributeName="startOffset" from="0%" to="100%" dur="9s" repeatCount="indefinite"/></textPath></text>';
    D.nivel2.fases.forEach((f) => {
      const [x, y] = pt(...NOS2[f.id]);
      s += '<g class="no fut n2' + (f.id === mapaSelecionada ? ' sel' : '') + '" data-id="' + f.id + '" transform="translate(' + x + ',' + y + ')" role="button" tabindex="0" aria-label="' + f.nome + ' (em breve)">' +
        '<circle r="40" class="disco"/><text class="ic" y="13">' + f.icone + '</text>' +
        '<circle r="14" cx="31" cy="-29" class="num"/><text class="ntx" x="31" y="-24">🔒</text>' +
        '<text class="mtx nome" y="64">' + f.nome + '</text></g>';
    });
    s += '</svg>';
    $('mapaSvg').innerHTML = s;
    $('mapaSvg').querySelectorAll('.no').forEach((g) => g.addEventListener('click', () => { iniciarAudio(); som('blip'); mapaSelecionada = +g.dataset.id; desenharMapa(); }));
    $('mapaProg').textContent = D.nivel2.titulo;
    const f = D.nivel2.fases.find((x) => x.id === mapaSelecionada) || D.nivel2.fases[0];
    $('mapaCartao').classList.remove('oculto');
    $('mcNum').textContent = 'Nível 2 · ' + f.quando;
    $('mcNome').textContent = f.icone + ' ' + f.nome;
    $('mcSub').textContent = f.previa;
    $('mcEntrar').disabled = true; $('mcEntrar').textContent = '🔒 Ainda vai acontecer';
  }
  function desenharMapa() {
    if (mapaNivel === 2) { desenharMapaNivel2(); return; }
    const deitado = window.innerWidth >= window.innerHeight;
    const VW = deitado ? 1000 : 600, VH = deitado ? 600 : 1000;
    const pt = (u, v) => deitado ? [u * VW, v * VH] : [(1 - v) * VW, u * VH];
    const poli = (lista) => lista.map(([u, v]) => pt(u, v).join(',')).join(' ');
    const brasil = poli([[0, 0.52], [0.15, 0.48], [0.3, 0.5], [0.45, 0.54], [0.62, 0.62], [0.82, 0.64], [0.86, 0.82], [0.8, 1], [0, 1]]);
    const franca = poli([[0.18, 0], [0.82, 0], [0.8, 0.2], [0.74, 0.36], [0.5, 0.3], [0.3, 0.34], [0.16, 0.18]]);
    const ids = D.fases.map((f) => f.id);
    let caminho = '', feito = '';
    ids.forEach((id, i) => {
      if (i === 0) return;
      const [x0, y0] = pt(...NOS[ids[i - 1]]), [x1, y1] = pt(...NOS[id]);
      const mx = (x0 + x1) / 2 + (y1 - y0) * 0.15, my = (y0 + y1) / 2 - (x1 - x0) * 0.15;
      const seg = 'M' + x0 + ' ' + y0 + ' Q' + mx + ' ' + my + ' ' + x1 + ' ' + y1;
      caminho += seg + ' ';
      if (progresso.concluidas.includes(ids[i - 1])) feito += seg + ' ';
    });
    const [lbx, lby] = pt(0.12, 0.95), [lfx, lfy] = pt(0.5, 0.25);
    let s = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><pattern id="ondas" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 q15 -10 30 0 t30 0" fill="none" stroke="#ffffff22" stroke-width="3"><animate attributeName="d" values="M0 15 q15 -10 30 0 t30 0;M0 15 q15 10 30 0 t30 0;M0 15 q15 -10 30 0 t30 0" dur="4s" repeatCount="indefinite"/></path></pattern></defs>' +
      '<rect width="' + VW + '" height="' + VH + '" fill="#1d5f8a"/><rect width="' + VW + '" height="' + VH + '" fill="url(#ondas)"/>' +
      '<polygon points="' + brasil + '" fill="#3f9a4f" stroke="#1d4d2a" stroke-width="6"/>' +
      '<polygon points="' + franca + '" fill="#8fb35a" stroke="#4d6a2a" stroke-width="6"/>' +
      '<text x="' + lbx + '" y="' + lby + '" class="mtx terra">BRASIL</text><text x="' + lfx + '" y="' + lfy + '" class="mtx terra">FRANÇA</text>' +
      '<path d="' + caminho + '" fill="none" stroke="#fff3d6" stroke-width="7" stroke-dasharray="4 14" stroke-linecap="round"/>' +
      '<path d="' + feito + '" fill="none" stroke="#f6b826" stroke-width="9" stroke-linecap="round"/>';
    const atual = faseAtualMapa();
    D.fases.forEach((f) => {
      const [x, y] = pt(...NOS[f.id]);
      const concl = progresso.concluidas.includes(f.id), lib = faseLiberada(f.id), eAtual = f.id === atual, sel = f.id === mapaSelecionada;
      const cls = 'no' + (concl ? ' concl' : '') + (lib ? ' lib' : ' fut') + (eAtual ? ' atual' : '') + (sel ? ' sel' : '');
      s += '<g class="' + cls + '" data-id="' + f.id + '" transform="translate(' + x + ',' + y + ')" role="button" tabindex="0" aria-label="Capítulo ' + f.id + ': ' + f.nome + '">' +
        (eAtual ? '<circle r="50" class="pulso"/>' : '') +
        '<circle r="36" class="disco"/><text class="ic" y="12">' + f.icone + '</text>' +
        '<circle r="13" cx="28" cy="-27" class="num"/><text class="ntx" x="28" y="-22">' + (concl ? '✓' : f.id) + '</text>' +
        '<text class="mtx nome" y="60">' + ({ 3: 'PSG', 4: 'Família', 7: 'Gen2K', 9: '14 anos do sim' }[f.id] || f.nome) + '</text></g>';
    });
    const alvoAv = mapaSelecionada || atual || 10;
    const [ax, ay] = pt(...NOS[alvoAv]);
    s += '<image href="' + avatarMatheus() + '" x="' + (ax - 40) + '" y="' + (ay - 128) + '" width="56" height="75" class="avatar"/>';
    s += '</svg>';
    $('mapaSvg').innerHTML = s;
    $('mapaSvg').querySelectorAll('.no').forEach((g) => g.addEventListener('click', () => { iniciarAudio(); selecionarFase(+g.dataset.id); }));
    const n = progresso.concluidas.length;
    $('mapaProg').textContent = todasConcluidas() ? 'História completa! Revisite qualquer capítulo.' : n + ' de ' + D.fases.length + ' capítulos';
    atualizarCartaoMapa();
  }
  function selecionarFase(id) { som('blip'); mapaSelecionada = id; desenharMapa(); }
  function atualizarCartaoMapa() {
    const id = mapaSelecionada, cart = $('mapaCartao');
    if (!id) { cart.classList.add('oculto'); return; }
    const f = D.fases.find((x) => x.id === id);
    const concl = progresso.concluidas.includes(id), lib = faseLiberada(id);
    cart.classList.remove('oculto');
    $('mcNum').textContent = 'Capítulo ' + f.id + ' · ' + (f.ano || '') + (concl ? ' · concluído ✓' : lib ? (progresso.cenaAtual[id] ? ' · em andamento' : ' · liberado') : ' · próximo');
    $('mcNome').textContent = f.icone + ' ' + f.nome;
    $('mcSub').textContent = f.sub;
    const b = $('mcEntrar');
    b.disabled = !lib;
    b.textContent = lib ? (concl ? 'Jogar de novo ▸' : progresso.cenaAtual[id] ? 'Continuar ▸' : 'Entrar ▸') : 'Termine o capítulo ' + (id - 1) + ' antes';
  }
  $('mcEntrar').addEventListener('click', () => { if (mapaSelecionada && mapaNivel === 1) { iniciarAudio(); som('ok'); entrarFase(mapaSelecionada); } });
  window.addEventListener('resize', () => { if (modo === 'mapa') desenharMapa(); });

  let apagarArmado = 0;
  $('mapaApagar').addEventListener('click', () => {
    if (Date.now() - apagarArmado > 3000) { apagarArmado = Date.now(); mapaBanner('Toque de novo para apagar todo o progresso.'); return; }
    progresso = progressoVazio(); salvar();
    location.reload();
  });

  /* -------------------- MÚSICAS DESTA FASE (YouTube visível, opcional) -------------------- */
  let modoAntesMusica = null;
  function abrirMusicas() {
    iniciarAudio();
    modoAntesMusica = modo; modo = 'modal'; teclas.esq = teclas.dir = false;
    const fid = faseAtual ? faseAtual.id : null;
    const lista = D.musicas.filter((x) => !fid || x.fase === fid);
    const el = $('listaYT'); el.innerHTML = '';
    $('ytPlayer').innerHTML = ''; $('ytPlayer').classList.add('oculto');
    if (!lista.length) el.innerHTML = '<p style="margin:4px 0">Nenhuma música escolhida para esta fase. A trilha do jogo continua tocando.</p>';
    lista.forEach((x) => {
      const linha = document.createElement('div'); linha.className = 'ytLinha';
      const nome = document.createElement('div'); nome.innerHTML = '<b></b><span></span>';
      nome.querySelector('b').textContent = x.titulo; nome.querySelector('span').textContent = x.artista;
      linha.appendChild(nome);
      const busca = 'https://www.youtube.com/' + (x.youtubeId ? 'watch?v=' + encodeURIComponent(x.youtubeId) : 'results?search_query=' + encodeURIComponent(x.artista + ' ' + x.titulo));
      if (x.youtubeId) {
        const b = document.createElement('button'); b.className = 'ytBtn'; b.textContent = '▶ Tocar';
        b.onclick = () => tocarYT(x, busca); linha.appendChild(b);
      }
      const a = document.createElement('a'); a.className = 'ytLink'; a.href = busca; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Abrir no YouTube ↗'; linha.appendChild(a);
      el.appendChild(linha);
    });
    $('modalMusica').classList.add('on');
  }
  function tocarYT(x, link) {
    pararMusica();
    const box = $('ytPlayer'); box.classList.remove('oculto');
    const origem = /^https?:/.test(location.protocol) ? '&origin=' + encodeURIComponent(location.origin) : '';
    box.innerHTML = '<iframe title="' + x.titulo.replace(/"/g, '') + '" src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(x.youtubeId) +
      '?playsinline=1&rel=0&enablejsapi=1' + origem + '" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>' +
      '<p class="ytAjuda">Não carregou? <a href="' + link + '" target="_blank" rel="noopener">Abrir no YouTube</a> ou feche e continue sem música.</p>';
  }
  function pausarYT() {
    const f = $('ytPlayer').querySelector('iframe');
    if (f && f.contentWindow) f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }
  function fecharMusicas() {
    $('ytPlayer').innerHTML = ''; $('ytPlayer').classList.add('oculto');
    $('modalMusica').classList.remove('on');
    modo = modoAntesMusica || 'jogo';
    if (!musicaTimer && !audioEl) {
      if (modo === 'show') iniciarMusicaShow();
      else if (modo === 'mapa') iniciarTrilha(trilhaMapa, 0.35);
      else if (faseAtual) iniciarTrilha(faseAtual.trilha, faseAtual.pub ? 0.35 : 0.5);
    }
    atualizarBotoes();
  }
  $('ytFechar').addEventListener('click', fecharMusicas);
  $('musicas').addEventListener('click', abrirMusicas);
  $('mapaMusicas').addEventListener('click', abrirMusicas);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pausarYT(); if (ac && ac.state === 'running') ac.suspend(); } else if (ac && somLigado) ac.resume(); });

  /* -------------------- ENTRADA -------------------- */
  function segurar(id, chave) {
    const el = $(id);
    const on = (e) => { e.preventDefault(); teclas[chave] = true; el.classList.add('ativo'); iniciarAudio(); };
    const off = (e) => { e.preventDefault(); teclas[chave] = false; el.classList.remove('ativo'); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  segurar('esq', 'esq'); segurar('dir', 'dir');
  $('acao').addEventListener('pointerdown', (e) => { e.preventDefault(); iniciarAudio(); interagir(); });
  $('camisa').addEventListener('pointerdown', (e) => { e.preventDefault(); iniciarAudio(); alternarCamisa(); });
  $('som').addEventListener('click', alternarSom);
  $('mapaSom').addEventListener('click', alternarSom);
  $('irMapa').addEventListener('click', voltarAoMapaNoMeio);
  function alternarSom() {
    somLigado = !somLigado;
    $('som').textContent = $('mapaSom').textContent = somLigado ? '🔊' : '🔇';
    if (audioEl) audioEl.muted = !somLigado;
    if (somLigado) iniciarAudio();
  }
  window.addEventListener('keydown', (e) => {
    if (modo === 'titulo') { if (e.key === 'Enter' || e.key === ' ') comecar(); return; }
    if (modo === 'mapa') { if (e.key === 'Enter' && mapaSelecionada && mapaNivel === 1 && faseLiberada(mapaSelecionada)) entrarFase(mapaSelecionada); return; }
    if (modo === 'album') { if (e.key === 'ArrowRight') avancarSlide(1); if (e.key === 'ArrowLeft') avancarSlide(-1); return; }
    if (modo === 'cinema' || modo === 'viagem') return;
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') teclas.esq = true;
    else if (k === 'arrowright' || k === 'd') teclas.dir = true;
    else if (k === ' ' || k === 'e' || k === 'enter') { e.preventDefault(); if (!e.repeat) interagir(); }
    else if (k === 'c') alternarCamisa();
    else if (k === 'm') alternarSom();
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') teclas.esq = false;
    if (k === 'arrowright' || k === 'd') teclas.dir = false;
  });
  window.addEventListener('blur', () => { teclas.esq = teclas.dir = false; });

  /* -------------------- TELA INICIAL -------------------- */
  $('tituloJogo').innerHTML = (function () {
    const partes = D.titulo.split(':');
    return partes.length > 1 ? partes[0] + '<span>' + partes.slice(1).join(':').trim() + '</span>' : D.titulo;
  })();
  $('subJogo').textContent = modoTeste ? 'Atalho de teste: New York Pub (não salva progresso)' : D.subtitulo;
  $('avisoJogo').textContent = D.aviso;
  if (D.midia.fotoTitulo) $('copo').style.backgroundImage = 'url("' + D.midia.fotoTitulo + '")';
  else $('copo').classList.add('oculto');
  if (progresso.concluidas.length && !modoTeste) $('comecar').textContent = 'Continuar ▶';
  document.title = D.titulo;
  function comecar() {
    if (modo !== 'titulo') return;
    iniciarAudio(); som('riff');
    $('inicio').classList.add('oculto');
    if (modoTeste) { const pubF = D.fases.find((f) => f.pub); progresso.concluidas = D.fases.filter((f) => f.id < pubF.id).map((f) => f.id); entrarFaseDireto(pubF.id); return; }
    atualizarBadgePoder();
    abrirMapa(null);
  }
  $('comecar').addEventListener('click', comecar);

  /* ==================== DESENHO ==================== */
  function redimensionar() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    esc = Math.min(H / 400, W / 420);
    const chaoTela = H > W ? H * 0.70 : H * 0.86;
    offY = chaoTela - CHAO * esc;
  }
  window.addEventListener('resize', redimensionar);
  redimensionar();

  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function emShow() { return modo === 'show' || (modo === 'fim' && !cena) || (modo === 'modal' && show.fase === 'midia'); }
  function texto(t, x, y, tam, cor, peso, alinh) { ctx.font = (peso || 900) + ' ' + tam + 'px Arial Black, Arial'; ctx.textAlign = alinh || 'center'; ctx.fillStyle = cor; ctx.fillText(t, x, y); }
  function imagemContida(img, x, y, w, h) {
    const r = Math.min(w / img.width, h / img.height), iw = img.width * r, ih = img.height * r;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  }

  /* ---------- Pub ---------- */
  function desenharFundoPub(vw) {
    const topo = -offY / esc - 10, base = (H - offY) / esc + 10;
    const x0 = camX - 20, x1 = camX + vw + 20;
    ctx.fillStyle = '#2a201b';
    ctx.fillRect(x0, topo, Math.min(x1, C.porta) - x0, base - topo);
    if (x1 > C.porta) {
      ctx.fillStyle = emShow() ? '#4a2a2a' : '#3a2522';
      ctx.fillRect(C.porta, topo, x1 - C.porta, base - topo);
    }
    tijolos(x0, x1, topo);
    ctx.fillStyle = '#5a3c26'; ctx.fillRect(x0, CHAO, Math.min(x1, C.porta) - x0, base - CHAO);
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    for (let x = Math.floor(x0 / 60) * 60; x < Math.min(x1, C.porta); x += 60) {
      ctx.beginPath(); ctx.moveTo(x, CHAO); ctx.lineTo(x - 30, base); ctx.stroke();
    }
    if (x1 > C.porta) {
      ctx.fillStyle = '#1c1420'; ctx.fillRect(C.porta, CHAO, x1 - C.porta, base - CHAO);
      ctx.fillStyle = '#5b3a5e'; ctx.fillRect(INICIO_PALCO + 140, CHAO + 4, 760, 26);
      ctx.strokeStyle = '#c98f4f'; ctx.lineWidth = 2; ctx.strokeRect(INICIO_PALCO + 146, CHAO + 8, 748, 18);
      ctx.fillStyle = emShow() ? '#46ff9a' : '#2a7a55'; ctx.fillRect(C.porta, CHAO + 34, x1 - C.porta, 3);
    }
  }
  function tijolos(x0, x1, topo, cor) {
    ctx.strokeStyle = cor || 'rgba(0,0,0,.28)'; ctx.lineWidth = 1.5;
    for (let y = Math.floor(topo / 18) * 18; y < CHAO; y += 18) {
      const desl = (Math.floor(y / 18) % 2) * 20;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (let x = Math.floor(x0 / 40) * 40 + desl; x < x1; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 18); ctx.stroke();
      }
    }
  }
  function desenharCamarim() {
    for (let x = 120; x < C.porta; x += 260) {
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, -200); ctx.lineTo(x, 40); ctx.stroke();
      ctx.fillStyle = 'rgba(255,210,120,.12)';
      ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x - 90, CHAO); ctx.lineTo(x + 90, CHAO); ctx.fill();
      ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(x, 46, 8, 0, 7); ctx.fill();
    }
    // cartaz Homecoming: arte real de Matheus, se carregada
    const px = 470;
    ctx.save(); ctx.translate(px, 82); ctx.rotate(-0.04);
    ctx.fillStyle = '#111'; ctx.fillRect(-4, -4, 104, 182);
    if (imgs.cartaz) { ctx.fillStyle = '#f7a400'; ctx.fillRect(0, 0, 96, 174); imagemContida(imgs.cartaz, 0, 0, 96, 174); }
    else {
      ctx.fillStyle = '#f6b826'; ctx.fillRect(0, 0, 96, 174);
      texto("MATH'S", 48, 34, 15, '#111'); texto('BDAY', 48, 54, 15, '#111'); texto('HOMECOMING', 48, 80, 11, '#0f5c63');
    }
    ctx.restore();
    ctx.fillStyle = '#111'; ctx.fillRect(1040, 80, 150, 70);
    if (imgs.logo) ctx.drawImage(imgs.logo, 1045, 85, 140, 60);
    else texto('VOLGAN', 1115, 127, 30, '#fff');
    ctx.fillStyle = '#ffe9b0'; ctx.fillRect(700, 100, 130, 90);
    ctx.fillStyle = '#9fb7c4'; ctx.fillRect(708, 108, 114, 74);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(708 + i * 22.8, 102, 4, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#6b1f1f'; rr(860, 230, 150, 70, 10); ctx.fill();
    ctx.fillStyle = '#7f2a2a'; rr(870, 250, 130, 30, 6); ctx.fill();
    ctx.fillStyle = '#111'; ctx.fillRect(C.porta - 50, 120, 100, 180);
    ctx.fillStyle = '#8b1c1c'; ctx.fillRect(C.porta - 44, 126, 88, 174);
    ctx.fillStyle = '#f6b826'; ctx.fillRect(C.porta - 60, 90, 120, 24);
    texto('PALCO →', C.porta, 107, 14, '#111');
  }
  function desenharPalcoFundo() {
    const luz = emShow();
    const tx = C.pedestal - 230, tw = 520;
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(tx - 8, 30, tw + 16, 150);
    ctx.fillStyle = luz ? '#f7a500' : '#6b5418'; ctx.fillRect(tx, 38, tw, 134);
    if (imgs.telao) {
      ctx.globalAlpha = luz ? 1 : 0.45; imagemContida(imgs.telao, tx, 38, tw, 134); ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = luz ? 'rgba(20,20,20,.55)' : 'rgba(0,0,0,.4)';
      for (let i = 0; i < 4; i++) { const cx = tx + 120 + i * 95; ctx.beginPath(); ctx.arc(cx, 80, 18, 0, 7); ctx.fill(); ctx.fillRect(cx - 30, 100, 60, 40); }
      texto('VOLGAN', tx + tw / 2, 165, 46, '#111');
    }
    for (const bx of [INICIO_PALCO + 80, C.pedestal + 380]) {
      ctx.fillStyle = '#1f7a5a'; ctx.beginPath();
      ctx.moveTo(bx, 60); ctx.lineTo(bx + 80, 60); ctx.lineTo(bx + 80, 190); ctx.lineTo(bx + 40, 210); ctx.lineTo(bx, 190); ctx.fill();
      ctx.fillStyle = '#2050a8'; ctx.beginPath(); ctx.arc(bx + 40, 110, 26, 0, 7); ctx.fill();
      ctx.strokeStyle = '#e8e2c8'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#e8e2c8'; ctx.font = '900 14px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText('NYP', bx + 40, 115); ctx.font = '11px Georgia, serif'; ctx.fillText('NEW YORK', bx + 40, 158); ctx.fillText('PUB', bx + 40, 172);
    }
    ctx.fillStyle = '#111'; ctx.fillRect(C.porta, 8, LARG - C.porta, 8);
    for (let x = INICIO_PALCO + 60; x < LARG; x += 120) {
      const cor = ['#a14cff', '#3fa9ff', '#ff4fa3'][Math.floor(x / 120) % 3];
      ctx.fillStyle = '#222'; ctx.fillRect(x - 8, 14, 16, 14);
      ctx.fillStyle = luz ? cor : '#444'; ctx.beginPath(); ctx.arc(x, 30, 5, 0, 7); ctx.fill();
    }
    for (const ax of [C.pedestal - 240, C.pedestal + 250]) amplificador(ax);
    bateria(C.bateria);
  }
  function amplificador(ax) {
    ctx.fillStyle = '#151515'; ctx.fillRect(ax, 240, 60, 60);
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(ax + 30, 272, 20, 0, 7); ctx.fill();
    ctx.fillStyle = '#c9b27a'; ctx.fillRect(ax + 6, 244, 48, 6);
  }
  function bateria(bx, rotulo) {
    ctx.fillStyle = '#7a3e1d'; ctx.beginPath(); ctx.arc(bx, 268, 30, 0, 7); ctx.fill();
    ctx.fillStyle = '#e9e4d0'; ctx.beginPath(); ctx.arc(bx, 268, 24, 0, 7); ctx.fill();
    ctx.fillStyle = '#1f7a5a'; ctx.font = '900 10px Arial'; ctx.textAlign = 'center';
    if (rotulo) ctx.fillText(rotulo, bx, 272); else { ctx.fillText('NEW YORK', bx, 265); ctx.fillText('PUB', bx, 277); }
    ctx.fillStyle = '#7a3e1d'; ctx.fillRect(bx - 62, 240, 26, 22); ctx.fillRect(bx + 36, 236, 26, 22);
    ctx.strokeStyle = '#999'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx - 70, 300); ctx.lineTo(bx - 70, 205); ctx.moveTo(bx + 75, 300); ctx.lineTo(bx + 75, 200); ctx.stroke();
    ctx.fillStyle = '#d9b44a';
    ctx.beginPath(); ctx.ellipse(bx - 70, 205, 26, 5, -0.15, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bx + 75, 200, 28, 5, 0.15, 0, 7); ctx.fill();
  }
  function desenharObjetosPub() {
    const mx = objetos.mesa.x;
    ctx.fillStyle = '#3b2a1e'; ctx.fillRect(mx - 45, 250, 90, 10); ctx.fillRect(mx - 40, 260, 6, 40); ctx.fillRect(mx + 34, 260, 6, 40);
    if (etapa <= 2) {
      ctx.fillStyle = '#fff'; ctx.save(); ctx.translate(mx - 20, 243); ctx.rotate(-0.2); ctx.fillRect(0, 0, 22, 8); ctx.restore();
      ctx.save(); ctx.translate(mx + 2, 244); ctx.rotate(0.25); ctx.fillRect(0, 0, 22, 8); ctx.restore();
    } else { ctx.fillStyle = '#fff'; ctx.fillRect(mx - 11, 243, 22, 7); }
    ctx.fillStyle = '#d9a35a'; ctx.fillRect(mx + 20, 236, 8, 14);
    const cx = objetos.caseMic.x;
    ctx.fillStyle = '#111'; rr(cx - 30, 268, 60, 32, 4); ctx.fill();
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.strokeRect(cx - 26, 272, 52, 24);
    ctx.fillStyle = '#ccc'; ctx.fillRect(cx - 6, 264, 12, 5);
    if (etapa < 8) { ctx.fillStyle = '#f6b826'; ctx.font = '700 9px Arial'; ctx.textAlign = 'center'; ctx.fillText('MIC', cx, 288); }
    if (objetos.cabo.visivel) {
      const kx = objetos.cabo.x;
      ctx.strokeStyle = '#1d1d1d'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(kx, 295, 16, 5, 0, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(kx + 2, 293, 12, 4, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = '#bbb'; ctx.fillRect(kx + 14, 290, 8, 3);
    }
    pedestal(objetos.pedestal.x, micNoPedestal);
  }
  function pedestal(px, comMic) {
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px + 22, 300); ctx.lineTo(px + 22, 205); ctx.lineTo(px + 10, 195); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + 10, 300); ctx.lineTo(px + 22, 290); ctx.lineTo(px + 34, 300); ctx.stroke();
    if (comMic) { ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(px + 8, 193, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#2bff8a'; ctx.fillRect(px + 9, 197, 5, 2); }
  }

  /* ---------- Fundos dos capítulos ---------- */
  function ceu(topo, c1, c2) {
    const g = ctx.createLinearGradient(0, topo, 0, CHAO); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(camX - 30, topo, W / esc + 60, CHAO - topo);
  }
  function faixaCeu(x0, x1, topo, c1, c2) { const g = ctx.createLinearGradient(0, topo, 0, CHAO); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(x0, topo, x1 - x0, CHAO - topo); }
  function chao(base, cor, linhas) {
    ctx.fillStyle = cor; ctx.fillRect(camX - 30, CHAO, W / esc + 60, base - CHAO);
    if (linhas) { ctx.fillStyle = linhas; for (let x = Math.floor((camX - 30) / 40) * 40; x < camX + W / esc + 40; x += 40) ctx.fillRect(x, CHAO + 4, 22, 3); }
  }
  function morro(x, larg, alt, cor) { ctx.fillStyle = cor; ctx.beginPath(); ctx.ellipse(x, CHAO, larg, alt, 0, Math.PI, 0); ctx.fill(); }
  function casinha(x, cor, tel) {
    ctx.fillStyle = cor; ctx.fillRect(x, 250, 46, 50); ctx.fillStyle = tel || '#b5452f';
    ctx.beginPath(); ctx.moveTo(x - 6, 252); ctx.lineTo(x + 23, 226); ctx.lineTo(x + 52, 252); ctx.fill();
    ctx.fillStyle = '#3b2a1e'; ctx.fillRect(x + 17, 274, 12, 26); ctx.fillStyle = '#ffe9a8'; ctx.fillRect(x + 5, 262, 9, 9);
  }
  function arvore(x, cor, alt) {
    alt = alt || 1;
    ctx.fillStyle = '#5a3c26'; ctx.fillRect(x - 4, 300 - 40 * alt, 8, 40 * alt);
    ctx.fillStyle = cor || '#2f7d3f'; ctx.beginPath(); ctx.arc(x, 300 - 52 * alt, 26 * alt, 0, 7); ctx.arc(x - 16 * alt, 300 - 42 * alt, 18 * alt, 0, 7); ctx.arc(x + 16 * alt, 300 - 42 * alt, 18 * alt, 0, 7); ctx.fill();
  }
  function palmeira(x) {
    ctx.strokeStyle = '#7a5530'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 300); ctx.quadraticCurveTo(x + 10, 240, x + 4, 190); ctx.stroke();
    ctx.strokeStyle = '#2f8a4f'; ctx.lineWidth = 7;
    const s = Math.sin(tempo * 1.5 + x) * 4;
    for (const a of [-2.6, -2.1, -1.1, -0.5, -1.6]) { ctx.beginPath(); ctx.moveTo(x + 4, 190); ctx.quadraticCurveTo(x + 4 + Math.cos(a) * 30, 190 + Math.sin(a) * 30 - 10, x + 4 + Math.cos(a) * 52 + s, 190 + Math.sin(a) * 30 + 22); ctx.stroke(); }
  }
  function placa(x, y, t, bg, fg, tam) {
    ctx.font = '900 ' + (tam || 13) + 'px Arial Black, Arial';
    const w = ctx.measureText(t).width + 18, h = (tam || 13) + 12;
    ctx.fillStyle = '#111'; rr(x - w / 2 - 3, y - 3, w + 6, h + 6, 6); ctx.fill();
    ctx.fillStyle = bg; rr(x - w / 2, y, w, h, 5); ctx.fill();
    ctx.fillStyle = fg || '#fff'; ctx.textAlign = 'center'; ctx.fillText(t, x, y + h - 8);
  }
  function nuvens(topo, vel, cor) {
    ctx.fillStyle = cor || 'rgba(255,255,255,.75)';
    for (let i = 0; i < 8; i++) { const x = ((i * 330 + tempo * vel) % (LARG + 400)) - 200, y = topo + 50 + (i % 3) * 30; ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.arc(x + 22, y - 8, 22, 0, 7); ctx.arc(x + 46, y, 16, 0, 7); ctx.fill(); }
  }
  function predios(x0, x1, cores, telhado) {
    for (let x = x0; x < x1; x += 150) {
      const k = Math.abs(Math.round(x / 150)) % 3, alt = 150 + k * 18;
      ctx.fillStyle = cores[k]; ctx.fillRect(x, CHAO - alt, 140, alt);
      ctx.fillStyle = telhado || '#5d6b78'; ctx.beginPath(); ctx.moveTo(x - 4, CHAO - alt); ctx.lineTo(x + 12, CHAO - alt - 26); ctx.lineTo(x + 128, CHAO - alt - 26); ctx.lineTo(x + 144, CHAO - alt); ctx.fill();
      ctx.fillStyle = '#3a4a5a'; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) ctx.fillRect(x + 12 + c * 32, CHAO - alt + 18 + r * 40, 16, 26);
      ctx.fillStyle = '#222'; for (let c = 0; c < 4; c++) ctx.fillRect(x + 8 + c * 32, CHAO - alt + 46, 24, 3);
    }
  }
  function lerpCor(a, b, k) { const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16)); return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',') + ')'; }
  function parede(cor, topo) { ctx.fillStyle = cor; ctx.fillRect(camX - 30, topo, W / esc + 60, CHAO - topo); }
  function quadroParede(x, y, w, h, img, cor) { ctx.fillStyle = '#2a1d15'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8); if (img) { ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h); imagemContida(img, x, y, w, h); } else { ctx.fillStyle = cor || '#ccc'; ctx.fillRect(x, y, w, h); } }
  function arquibancada(y0, y1, cores) {
    for (let y = y0; y < y1; y += 12) for (let x = Math.floor((camX - 30) / 10) * 10; x < camX + W / esc + 30; x += 10) {
      ctx.fillStyle = cores[(x * 7 + y * 3) % cores.length]; ctx.fillRect(x, y + Math.sin(tempo * 6 + x * 0.3) * (cena && cena.torcida ? 2.5 * cena.torcida + 0.5 : 0.8), 6, 7);
    }
  }
  const FUNDOS = {
    pocosBelem(topo, base) {
      const k = Math.max(0, Math.min(1, (camX + W / esc / 2 - 700) / 400)) * (1 - Math.max(0, Math.min(1, (camX + W / esc / 2 - 1500) / 400)));
      ceu(topo, lerpCor('#7ec8f0', '#ff9a5a', k), lerpCor('#ffe2b8', '#ffd08a', k));
      nuvens(topo, 8);
      morro(150, 280, 120, '#6bb36b'); morro(450, 200, 90, '#5aa35a');
      casinha(90, '#f2e6c8'); casinha(170, '#e8c8a8', '#8a3a2a'); casinha(330, '#dfe8f0', '#3a5a8a');
      ctx.fillStyle = '#fff'; ctx.fillRect(240, 200, 6, 50); ctx.beginPath(); ctx.arc(243, 196, 7, 0, 7); ctx.fill(); // Cristo/torre ao longe
      placa(260, 70, 'POÇOS DE CALDAS', '#2f7d4f', '#fff', 13);
      ctx.fillStyle = '#4aa8d8'; ctx.fillRect(820, 262, 600, 18);  // rio em Belém
      ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 830; x < 1410; x += 40) ctx.fillRect(x + (tempo * 20) % 40, 268, 16, 2);
      ctx.fillStyle = '#8a4a2a'; ctx.beginPath(); ctx.moveTo(1180, 262); ctx.lineTo(1250, 262); ctx.lineTo(1240, 272); ctx.lineTo(1190, 272); ctx.fill(); ctx.fillRect(1212, 236, 3, 26); // barquinho
      [880, 960, 1060, 1340, 1420].forEach((x, i) => (i % 2 ? arvore(x, '#2a7a3a', 1.3) : palmeira(x)));
      placa(1120, 70, 'BARCARENA · PARÁ', '#d9822b', '#fff', 13);
      morro(1900, 260, 120, '#6bb36b'); morro(2200, 200, 80, '#5aa35a');
      casinha(1830, '#f2e6c8'); casinha(2000, '#dfe8f0', '#3a5a8a');
      chao(base, '#c9935a', null);
      ctx.fillStyle = '#7a7a7a'; ctx.fillRect(camX - 30, CHAO + 8, W / esc + 60, 24);
      ctx.fillStyle = '#f2e0b0'; for (let x = Math.floor(camX / 50) * 50; x < camX + W / esc + 50; x += 50) ctx.fillRect(x, CHAO + 19, 24, 3);
    },
    unifaeCafe(topo, base) {
      ctx.fillStyle = '#e9e4da'; ctx.fillRect(camX - 30, topo, Math.max(0, 640 - camX + 30), CHAO - topo);
      ctx.fillStyle = '#2a2240'; ctx.fillRect(Math.max(camX - 30, 640), topo, W / esc + 60, CHAO - topo);
      placa(220, 50, 'PUBLICIDADE', '#d93a2b', '#fff', 14);
      ctx.fillStyle = '#2a3a2a'; ctx.fillRect(70, 110, 120, 70); texto('Briefing', 130, 140, 13, '#fff', 700); texto('ideia → forma', 130, 162, 10, '#cfe', 700);
      const c = cena && cena.objetos.cartaz;
      if (c && c.ativo) { const est = c.estilo === 'verao' ? ['#ff8a3a', '#ffd23a'] : ['#111', '#f6b826']; [460, 560].forEach((x, i) => { ctx.fillStyle = est[i % 2]; ctx.fillRect(x - 26, 110, 52, 70); texto('★', x, 152, 18, est[(i + 1) % 2]); }); }
      ctx.fillStyle = '#ffd98a'; for (let x = 720; x < 1650; x += 120) { ctx.beginPath(); ctx.arc(x, 60, 6, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,217,138,.1)'; ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x - 70, CHAO); ctx.lineTo(x + 70, CHAO); ctx.fill(); ctx.fillStyle = '#ffd98a'; }
      placa(890, 70, 'CAFÉ · 2009', '#7a4a2a', '#fff', 13);
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(820, 250, 140, 10); ctx.fillRect(830, 260, 6, 40); ctx.fillRect(944, 260, 6, 40);
      ctx.fillStyle = '#fff'; ctx.fillRect(850, 240, 10, 10); ctx.fillRect(920, 240, 10, 10); ctx.fillStyle = '#f6f0d0'; ctx.fillRect(870, 244, 26, 6);
      chao(base, '#6b4a30', 'rgba(0,0,0,.18)');
    },
    paris(topo, base) {
      const k = Math.max(0, Math.min(1, (m.x - 900) / 1000));
      ceu(topo, lerpCor('#a8d4f0', '#1d2a5a', k), lerpCor('#eef4f8', '#f0a070', k));
      predios(-40, 1350, ['#efe3c8', '#e6d6b4', '#f2e9d6']);
      // Torre Eiffel ao fundo (aparece no fim do passeio)
      const tx = 1800, ty = CHAO - 20, acesa = k > 0.5;
      ctx.fillStyle = acesa ? '#4a3a2a' : '#6a5a4a';
      ctx.beginPath(); ctx.moveTo(tx, ty - 250); ctx.lineTo(tx + 40, ty); ctx.lineTo(tx + 22, ty); ctx.lineTo(tx, ty - 60); ctx.lineTo(tx - 22, ty); ctx.lineTo(tx - 40, ty); ctx.fill();
      ctx.fillRect(tx - 30, ty - 110, 60, 5); ctx.fillRect(tx - 18, ty - 180, 36, 4);
      if (acesa) for (let i = 0; i < 30; i++) { const yy = ty - 245 + i * 8, ww = 3 + i * 1.2; if (Math.sin(tempo * 9 + i * 3) > 0.3) { ctx.fillStyle = '#fff6c0'; ctx.fillRect(tx + (Math.random() - 0.5) * ww * 2, yy, 2, 2); } }
      ctx.fillStyle = '#c9c0b0'; ctx.fillRect(1500, CHAO - 30, 700, 30); // Trocadéro
      for (let x = 100; x < 1400; x += 300) { ctx.fillStyle = '#222'; ctx.fillRect(x, 200, 4, 100); ctx.fillStyle = k > 0.4 ? '#fff2a0' : '#ffe9a8'; ctx.fillRect(x - 6, 194, 16, 10); }
      chao(base, '#9a9590', null);
      placa(240, 50, 'PARIS', '#1d3c78', '#fff', 14);
    },
    orleans(topo, base) {
      const k = Math.max(0, Math.min(1, m.x / LARG));
      ceu(topo, k < 0.5 ? lerpCor('#ffd6a8', '#8ec8f0', k * 2) : lerpCor('#8ec8f0', '#3a2a6a', (k - 0.5) * 2), k < 0.5 ? '#fff4e0' : lerpCor('#fff4e0', '#ff9a6a', (k - 0.5) * 2));
      // apartamento de um cômodo
      ctx.fillStyle = '#efe6d4'; ctx.fillRect(0, 120, 520, 180); ctx.fillStyle = '#c9b89a'; ctx.fillRect(0, 112, 520, 10);
      ctx.fillStyle = '#9ec4e0'; ctx.fillRect(60, 150, 70, 60); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(60, 150, 70, 60);
      placa(260, 72, 'ORLÉANS', '#1d3c78', '#fff', 13);
      // obra
      ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 4;
      for (let x = 640; x < 1040; x += 90) { ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 130); ctx.stroke(); }
      for (let y = 150; y < 300; y += 60) { ctx.beginPath(); ctx.moveTo(630, y); ctx.lineTo(1030, y); ctx.stroke(); }
      ctx.fillStyle = '#b5452f'; for (let i = 0; i < 9; i++) ctx.fillRect(950 + (i % 3) * 18, 288 - Math.floor(i / 3) * 10, 16, 9);
      ctx.fillStyle = '#3a6ab0'; ctx.beginPath(); ctx.arc(1000, 265, 18, 0, 7); ctx.fill(); // betoneira
      // McDonald's (vermelho e amarelo)
      ctx.fillStyle = '#d0202a'; ctx.fillRect(1300, 110, 760, 190);
      ctx.fillStyle = '#f2c230'; ctx.fillRect(1300, 110, 760, 24);
      ctx.fillStyle = '#fff3d6'; ctx.fillRect(1330, 150, 700, 90);
      ctx.fillStyle = '#2a2a2a'; ctx.fillRect(1560, 156, 300, 42);
      ['LANCHES', 'BATATA', 'BEBIDAS'].forEach((t, i) => texto(t, 1610 + i * 100, 182, 12, '#f2c230'));
      texto('McDonald’s', 1680, 128, 18, '#d0202a');
      ctx.fillStyle = '#6b3a24'; ctx.fillRect(1880, 160, 140, 70); texto('McCafé', 1950, 184, 13, '#f2e6c8'); texto('☕', 1950, 214, 20, '#fff');
      for (let i = 0; i < 4; i++) { ctx.fillStyle = '#d0202a'; ctx.fillRect(1380 + i * 26, 212, 18, 22); ctx.fillStyle = '#f2c230'; for (let j = 0; j < 4; j++) ctx.fillRect(1382 + i * 26 + j * 4, 204, 3, 10); }
      chao(base, '#8d8478', 'rgba(0,0,0,.12)');
    },
    tunelPSG(topo, base) {
      // túnel escuro até x=900, depois o campo
      ctx.fillStyle = '#0d0f18'; ctx.fillRect(camX - 30, topo, Math.max(0, 900 - camX + 30), base - topo);
      for (let x = 100; x < 900; x += 160) { ctx.fillStyle = '#3a3a48'; ctx.fillRect(x, 110, 60, 6); ctx.fillStyle = 'rgba(255,255,230,.06)'; ctx.beginPath(); ctx.moveTo(x, 116); ctx.lineTo(x - 30, CHAO); ctx.lineTo(x + 90, CHAO); ctx.lineTo(x + 60, 116); ctx.fill(); }
      ctx.fillStyle = '#1b2a55'; ctx.fillRect(380, 120, 300, 30); texto('PARIS SAINT-GERMAIN', 530, 142, 15, '#fff');
      const brilho = Math.max(0, Math.min(1, (m.x - 500) / 400));
      if (900 < camX + W / esc + 30) {
        faixaCeu(900, camX + W / esc + 40, topo, '#1a2a5a', '#5a7ab0');
        ctx.fillStyle = '#1b2a55'; ctx.fillRect(900, 70, LARG, 170);
        arquibancada(80, 230, ['#1b2a55', '#d0102a', '#ffffff', '#1b2a55', '#c8c8d8']);
        ctx.fillStyle = '#1b2a55'; ctx.fillRect(900, 232, LARG, 28); texto('PARIS SAINT-GERMAIN', 1400, 252, 16, '#fff');
        for (let i = 0; i < 6; i++) { const fx = 1000 + i * 160, w = Math.sin(tempo * 4 + i) * 8; ctx.fillStyle = ['#1b2a55', '#d0102a', '#fff'][i % 3]; ctx.beginPath(); ctx.moveTo(fx, 60); ctx.quadraticCurveTo(fx + 20, 50 + w, fx + 40, 60); ctx.lineTo(fx + 40, 84); ctx.quadraticCurveTo(fx + 20, 74 + w, fx, 84); ctx.fill(); }
        for (const lx of [1050, 1500, 1900]) { ctx.fillStyle = '#fffbe0'; ctx.fillRect(lx - 24, 18, 48, 16); ctx.fillStyle = 'rgba(255,250,210,.08)'; ctx.beginPath(); ctx.moveTo(lx - 24, 34); ctx.lineTo(lx - 150, CHAO); ctx.lineTo(lx + 150, CHAO); ctx.lineTo(lx + 24, 34); ctx.fill(); }
        ctx.fillStyle = '#3a8a46'; ctx.fillRect(900, 260, LARG, base - 260);
        for (let x = 900; x < LARG; x += 120) { ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x, 260, 60, base - 260); }
      }
      ctx.fillStyle = 'rgba(255,255,240,' + (0.25 * brilho) + ')'; ctx.fillRect(860, topo, 60, base - topo);
      if (camX < 900) { ctx.fillStyle = '#26262e'; ctx.fillRect(camX - 30, CHAO, Math.max(0, 900 - camX + 30), base - CHAO); }
    },
    set(topo, base) {
      parede('#191720', topo);
      ctx.fillStyle = '#f2f2f2'; ctx.fillRect(360, 90, 320, 210); ctx.fillStyle = '#e4e4e4'; ctx.fillRect(360, 270, 320, 30); // fundo infinito
      for (const lx of [330, 710]) { ctx.strokeStyle = '#333'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, 300); ctx.lineTo(lx, 150); ctx.stroke(); ctx.fillStyle = '#ddd'; ctx.fillRect(lx - 22, 120, 44, 32); }
      ctx.fillStyle = '#2a3a2a'; ctx.fillRect(900, 120, 560, 180); ctx.fillStyle = '#3f9a4f'; ctx.fillRect(900, 240, 560, 60);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(1240, 180, 160, 70); // gol de treino
      placa(520, 50, 'CAMPANHA', '#d93a2b', '#fff', 13); placa(1180, 50, 'TREINO', '#1d4fb8', '#fff', 13);
      chao(base, '#2a2630', null);
    },
    quartoBebe(topo, base) {
      parede('#2f3550', topo);
      ctx.fillStyle = '#0b1230'; ctx.fillRect(200, 80, 160, 120); ctx.fillStyle = '#fff8d0'; ctx.beginPath(); ctx.arc(320, 110, 14, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffffffaa'; for (let i = 0; i < 12; i++) ctx.fillRect(210 + (i * 37) % 140, 90 + (i * 23) % 100, 2, 2);
      ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 6; ctx.strokeRect(200, 80, 160, 120);
      ctx.fillStyle = '#f7d6e6'; ctx.font = '900 28px Arial Black, Arial'; ctx.textAlign = 'center'; ctx.fillText('LYS', 760, 120);
      for (let i = 0; i < 8; i++) { ctx.fillStyle = ['#f6b826', '#ff9ec7', '#9fd0f0'][i % 3]; ctx.beginPath(); ctx.moveTo(620 + i * 40, 60); ctx.lineTo(640 + i * 40, 60); ctx.lineTo(630 + i * 40, 76); ctx.fill(); }
      ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(1050, 200, 40, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,217,138,.12)'; ctx.beginPath(); ctx.arc(1050, 200, 120, 0, 7); ctx.fill();
      chao(base, '#7a5a40', 'rgba(0,0,0,.15)');
    },
    neve(topo, base) {
      ceu(topo, '#bcd2e8', '#eef3f8');
      for (let x = 60; x < LARG; x += 140) { ctx.fillStyle = '#2f5a3a'; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x + 40, 150); ctx.lineTo(x + 80, 300); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + 28, 200); ctx.lineTo(x + 40, 150); ctx.lineTo(x + 52, 200); ctx.fill(); }
      ctx.fillStyle = '#efe6d4'; ctx.fillRect(1150, 140, 220, 160); ctx.fillStyle = '#5d6b78'; ctx.beginPath(); ctx.moveTo(1140, 142); ctx.lineTo(1260, 90); ctx.lineTo(1380, 142); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(1140, 136, 240, 8);
      ctx.fillStyle = '#ffe9a8'; ctx.fillRect(1180, 180, 40, 40); ctx.fillRect(1300, 180, 40, 40);
      chao(base, '#f4f7fb', null);
      ctx.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { const x = (i * 97 + tempo * 20 * (1 + i % 3)) % (W / esc + 60) + camX - 30, y = ((i * 53 + tempo * 30 * (1 + i % 2)) % (CHAO - topo + 40)) + topo; ctx.fillRect(x, y, 2.5, 2.5); }
    },
    viagens(topo, base) {
      ceu(topo, '#1a1f3a', '#5a4a7a');
      ['INGLATERRA', 'PELA FRANÇA', 'EUROPA', 'MAIS UM VOO', 'REUNIÃO', 'AEROPORTO'].forEach((t, i) => { const x = 160 + i * 170; ctx.fillStyle = '#222'; ctx.fillRect(x - 3, 160, 6, 140); placa(x, 128 + Math.sin(tempo * 3 + i) * 3, t, ['#2b6cb0', '#c0392b', '#6b46c1', '#2c7a7b', '#555', '#b7791f'][i], '#fff', 11); });
      const ax = ((tempo * 220) % 1800) - 200; texto('✈', ax, 70, 26, '#fff');
      ctx.fillStyle = '#2a2638'; ctx.fillRect(1100, topo, 600, CHAO - topo);
      ctx.fillStyle = '#0b0f22'; ctx.fillRect(1180, 90, 130, 120); ctx.fillStyle = '#fff8d0'; ctx.beginPath(); ctx.arc(1270, 120, 12, 0, 7); ctx.fill();
      ctx.strokeStyle = '#4a4458'; ctx.lineWidth = 6; ctx.strokeRect(1180, 90, 130, 120); ctx.beginPath(); ctx.moveTo(1245, 90); ctx.lineTo(1245, 210); ctx.stroke();
      chao(base, '#2b2733', null);
    },
    aeroporto(topo, base) {
      ceu(topo, '#e8edf2', '#cfd8e0');
      ctx.fillStyle = '#9ec4e0'; for (let x = 0; x < LARG; x += 180) ctx.fillRect(x + 10, 60, 160, 150);
      aviaoMini(300 + Math.sin(tempo * 0.3) * 40, 130, 0.5);
      ctx.fillStyle = '#1b1b1b'; ctx.fillRect(560, 40, 340, 80);
      texto('PARTIDAS · PARIS', 730, 62, 13, '#f6b826'); texto('BRASIL ............ EMBARQUE', 730, 86, 12, Math.sin(tempo * 4) > 0 ? '#9fe0a0' : '#fff');
      texto('Destino: casa', 730, 108, 11, '#fff', 700);
      chao(base, '#b8b0a4', 'rgba(0,0,0,.08)');
    },
    chegada(topo, base) {
      ceu(topo, '#5fb8ff', '#fff2c0');
      ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(900, 70, 34, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,224,102,.25)'; ctx.beginPath(); ctx.arc(900, 70, 70 + Math.sin(tempo * 2) * 6, 0, 7); ctx.fill();
      morro(200, 300, 110, '#5aa35a'); morro(700, 260, 90, '#4f9a52'); [80, 260, 1050].forEach((x) => palmeira(x));
      for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#1f8a4f' : '#f6d33a'; ctx.beginPath(); ctx.moveTo(200 + i * 80, 40); ctx.lineTo(240 + i * 80, 40); ctx.lineTo(220 + i * 80, 58); ctx.fill(); }
      chao(base, '#9ccf7a', null); ctx.fillStyle = '#b8b0a4'; ctx.fillRect(camX - 30, CHAO + 4, W / esc + 60, 20);
    },
    apartamento(topo, base) {
      parede('#efe9df', topo);
      ctx.fillStyle = '#9ec4e0'; ctx.fillRect(140, 90, 180, 130); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.strokeRect(140, 90, 180, 130);
      const c = cena && cena.objetos.caixas, n = c ? c.n : 0;
      if (n >= 1) { ctx.fillStyle = '#5a6a8a'; rr(640, 240, 170, 60, 10); ctx.fill(); ctx.fillStyle = '#6b7b9b'; rr(650, 252, 150, 26, 6); ctx.fill(); }
      if (n >= 2) { ctx.fillStyle = '#111'; ctx.fillRect(860, 120, 150, 86); ctx.fillStyle = '#2a3a5a'; ctx.fillRect(866, 126, 138, 74); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(850, 250, 170, 50); }
      if (n >= 3) { quadroParede(420, 80, 60, 46, imgs.foto1); quadroParede(500, 96, 46, 60, imgs.foto2); ctx.save(); ctx.translate(590, 160); ctx.rotate(0.3); ctx.fillStyle = '#c98a3a'; ctx.beginPath(); ctx.ellipse(0, 10, 14, 18, 0, 0, 7); ctx.fill(); ctx.fillRect(-2, -50, 4, 46); ctx.restore(); }
      chao(base, '#c9a07a', 'rgba(0,0,0,.08)');
    },
    casaPiscina(topo, base) {
      ceu(topo, '#6ec0f0', '#eaf6ff');
      // sala (0 a 1150)
      ctx.fillStyle = '#f2ece2'; ctx.fillRect(0, 80, 1150, 220); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(0, 72, 1160, 10);
      ctx.fillStyle = '#7a8a9a'; rr(560, 246, 240, 54, 10); ctx.fill(); ctx.fillStyle = '#8a9aaa'; rr(570, 256, 220, 24, 6); ctx.fill();
      quadroParede(380, 110, 60, 46, imgs.foto1); quadroParede(460, 120, 46, 60, imgs.foto2);
      ctx.fillStyle = '#3f8a4a'; ctx.beginPath(); ctx.arc(1110, 240, 22, 0, 7); ctx.fill(); ctx.fillStyle = '#7a5a3a'; ctx.fillRect(1100, 258, 20, 42);
      // área externa e piscina
      palmeira(1250); palmeira(1950);
      ctx.fillStyle = '#e6dccb'; ctx.fillRect(1160, CHAO - 6, 900, 6);
      chao(base, '#d8cdb8', null);
      ctx.fillStyle = '#2aa8d8'; ctx.fillRect(1380, CHAO, 480, base - CHAO);
    },
    festival(topo, base) {
      parede('#120c1c', topo);
      for (let i = 0; i < 5; i++) { const ox = 200 + i * 340, fx = ox + Math.sin(tempo + i) * 120; ctx.fillStyle = ['rgba(161,76,255,.12)', 'rgba(63,169,255,.12)', 'rgba(255,79,163,.12)'][i % 3]; ctx.beginPath(); ctx.moveTo(ox - 5, 20); ctx.lineTo(fx - 70, CHAO); ctx.lineTo(fx + 70, CHAO); ctx.lineTo(ox + 5, 20); ctx.fill(); }
      if (imgs.gen2k) { ctx.fillStyle = '#000'; ctx.fillRect(1196, 36, 108, 160); imagemContida(imgs.gen2k, 1200, 40, 100, 152); }
      ctx.fillStyle = '#2a1d15'; ctx.fillRect(120, 230, 180, 70); texto('haven.182', 210, 220, 12, '#f6b826', 800);
      arquibancada(250, 300, ['#1a1420', '#2a2030', '#221a2a']);
      chao(base, '#1c1420', null);
    },
    estudio(topo, base) {
      parede('#1d1a24', topo);
      for (let x = 60; x < LARG; x += 70) { ctx.fillStyle = (x / 70) % 2 ? '#2a2632' : '#26222e'; ctx.fillRect(x, 60, 60, 200); }
      ctx.fillStyle = '#0b0b0b'; ctx.fillRect(180, 200, 180, 60); for (let i = 0; i < 14; i++) { ctx.fillStyle = ['#2bff8a', '#f6b826', '#ff4fa3'][i % 3]; ctx.fillRect(190 + i * 12, 220 + Math.sin(tempo * 8 + i) * 4, 6, 16); }
      texto('ON AIR', 640, 70, 18, cena && cena.objetos.microfone && cena.objetos.microfone.ativo && Math.sin(tempo * 4) > 0 ? '#ff3a3a' : '#5a2a2a');
      chao(base, '#2a2228', null);
    },
    jardim(topo, base) {
      ceu(topo, '#bfe3f2', '#fdf3e2');
      for (let x = 40; x < LARG; x += 110) arvore(x, ['#3f8a4a', '#4f9a52', '#2f7a3f'][(x / 110) % 3 | 0], 1.7);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 60);
      for (let x = 0; x <= LARG; x += 60) ctx.quadraticCurveTo(x + 30, 80, x + 60, 60); ctx.stroke();
      for (let x = 30; x < LARG; x += 60) { ctx.fillStyle = Math.sin(tempo * 3 + x) > 0 ? '#fff4b0' : '#ffe080'; ctx.beginPath(); ctx.arc(x, 72, 3, 0, 7); ctx.fill(); }
      chao(base, '#9ccf7a', null);
      ctx.fillStyle = '#f7f1e6'; ctx.fillRect(560, CHAO, 400, base - CHAO);
      ctx.fillStyle = '#e8b4c8'; for (let x = 570; x < 960; x += 30) { ctx.beginPath(); ctx.arc(x, CHAO + 6, 3, 0, 7); ctx.fill(); }
    },
    vox(topo, base) {
      parede('#141118', topo);
      tijolos(camX - 30, camX + W / esc + 30, topo, 'rgba(255,255,255,.04)');
      ctx.save(); ctx.shadowColor = '#ff4fa3'; ctx.shadowBlur = 18; texto('VOX', 260, 120, 52, '#ff6fb5'); ctx.restore(); texto('HOUSE', 260, 144, 12, '#fff', 800);
      ctx.fillStyle = '#222'; ctx.fillRect(820, 70, 260, 150); ctx.fillStyle = '#333'; ctx.fillRect(828, 78, 244, 134);
      texto('IDEIA → ROTEIRO → GRAVAÇÃO', 950, 150, 11, '#f6b826', 800);
      chao(base, '#221a24', null);
    },
    aces(topo, base) {
      parede('#0f1418', topo);
      texto('ACES', 1000, 110, 60, '#2a3a44'); texto('SPORT', 1000, 136, 14, '#3a4a54', 800);
      chao(base, '#1a2026', null);
    }
  };
  function aviaoMini(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#fff'; rr(-60, -10, 120, 20, 10); ctx.fill(); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(20, 30); ctx.lineTo(34, 30); ctx.lineTo(20, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(-60, -4); ctx.lineTo(-76, -30); ctx.lineTo(-64, -30); ctx.lineTo(-44, -6); ctx.fill(); ctx.restore(); }
  /* elementos desenhados na frente dos personagens (água da piscina) */
  function desenharFrente(base) {
    if (!cena || cena.def.fundo !== 'casaPiscina') return;
    ctx.fillStyle = 'rgba(42,168,216,.82)'; ctx.fillRect(1380, CHAO - 26, 480, 26 + base - CHAO);
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let x = 1380; x <= 1860; x += 10) ctx.lineTo(x, CHAO - 24 + i * 10 + Math.sin(tempo * 3 + x * 0.05 + i) * 2); ctx.stroke(); }
    ctx.fillStyle = '#e6dccb'; ctx.fillRect(1370, CHAO - 28, 500, 4);
  }

  /* ---------- Objetos dos capítulos ---------- */
  function desenharObjetoCena(o) {
    if (o.oculto) return;
    const x = o.x, a = o.ativo, dt = tempo - o.t;
    switch (o.tipo) {
      case 'marco': { ctx.fillStyle = '#5a3c26'; ctx.fillRect(x - 3, 210, 6, 90); placa(x, 180, o.texto, a ? o.cor : '#7a7a7a', '#fff', 12); if (a) texto('✓', x, 172, 16, '#f6b826'); break; }
      case 'pontoOnibus': { ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x - 3, 180, 6, 120); ctx.fillStyle = '#1d6ab0'; rr(x - 20, 168, 40, 26, 4); ctx.fill(); texto('🚌', x, 188, 14, '#fff'); placa(x, 140, o.texto, '#f2c230', '#111', 10); break; }
      case 'por': { if (a) { ctx.fillStyle = 'rgba(255,140,60,' + Math.min(0.5, dt * 0.3) + ')'; ctx.beginPath(); ctx.arc(x, 250, 60, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#ffb04a'; ctx.beginPath(); ctx.arc(x, 262, 26, Math.PI, 0); ctx.fill(); } else { texto('🌅', x, 250, 20, '#fff'); } break; }
      case 'cartaz': {
        ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x - 3, 230, 6, 70);
        if (!a) { ctx.fillStyle = '#cfcfcf'; ctx.fillRect(x - 50, 120, 100, 110); texto('?', x, 190, 40, '#999'); }
        else {
          const s = Math.min(1, dt * 3), v = o.estilo === 'verao', c1 = v ? '#ff8a3a' : '#111', c2 = v ? '#ffd23a' : '#f6b826';
          ctx.save(); ctx.translate(x, 175); ctx.scale(s, s);
          ctx.fillStyle = c1; ctx.fillRect(-50, -55, 100, 110); ctx.fillStyle = c2; ctx.fillRect(-50, 25, 100, 30);
          texto(v ? 'VERÃO!' : 'ROCK!', 0, -18, 20, c2); texto('★ ✦ ★', 0, 8, 14, v ? '#fff' : '#d93a2b'); texto('IDEIA', 0, 45, 11, c1);
          ctx.restore();
        }
        break;
      }
      case 'violao': {
        ctx.save(); ctx.translate(x, 268); ctx.rotate(a ? Math.sin(tempo * 10) * 0.08 : -0.25);
        ctx.fillStyle = '#c98a3a'; ctx.beginPath(); ctx.ellipse(0, 10, 16, 20, 0, 0, 7); ctx.ellipse(0, -14, 12, 14, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#3b2412'; ctx.beginPath(); ctx.arc(0, -2, 5, 0, 7); ctx.fill(); ctx.fillRect(-2, -60, 4, 46);
        ctx.restore(); if (a && Math.sin(tempo * 5) > 0.6) texto('♪', x + 20, 210 - (tempo * 30) % 30, 16, '#f6b826');
        break;
      }
      case 'consulado': {
        ctx.fillStyle = '#f4ecdb'; ctx.fillRect(x - 120, 100, 240, 200);
        ctx.fillStyle = '#5d6b78'; ctx.beginPath(); ctx.moveTo(x - 128, 102); ctx.lineTo(x, 66); ctx.lineTo(x + 128, 102); ctx.fill();
        placa(x, 112, 'CONSULADO DO BRASIL', '#1f8a4f', '#fff', 10);
        const fx = x + 86, w = Math.sin(tempo * 3) * 3; ctx.fillStyle = '#333'; ctx.fillRect(fx, 40, 3, 70);
        ctx.fillStyle = '#1f8a4f'; ctx.fillRect(fx + 3, 40 + w, 40, 26); ctx.fillStyle = '#f6d33a'; ctx.beginPath(); ctx.moveTo(fx + 23, 43 + w); ctx.lineTo(fx + 40, 53 + w); ctx.lineTo(fx + 23, 63 + w); ctx.lineTo(fx + 6, 53 + w); ctx.fill(); ctx.fillStyle = '#1d3c78'; ctx.beginPath(); ctx.arc(fx + 23, 53 + w, 5, 0, 7); ctx.fill();
        ctx.fillStyle = '#5a3c26'; ctx.fillRect(x - 28, 214, 56, 86);
        if (a) texto('♥', x, 200 - Math.abs(Math.sin(tempo * 3)) * 8, 22, '#ff6fb5');
        break;
      }
      case 'kfc': {
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 100, 140, 200, 160); ctx.fillStyle = '#c8102e'; for (let i = 0; i < 5; i++) ctx.fillRect(x - 100 + i * 40, 120, 20, 30);
        ctx.fillStyle = '#c8102e'; ctx.fillRect(x - 100, 150, 200, 34); texto('KFC', x, 176, 22, '#fff');
        ctx.fillStyle = '#9ec4e0'; ctx.fillRect(x - 80, 200, 60, 50); ctx.fillRect(x + 20, 200, 60, 50);
        if (a) texto('🍗', x, 120 - (dt * 20 % 20), 18, '#fff');
        break;
      }
      case 'trocadero': { if (a) for (let i = 0; i < 3; i++) texto('✦', x + Math.sin(tempo * 2 + i * 2) * 60, 80 + i * 40, 14, '#fff6c0'); break; }
      case 'cama': { ctx.fillStyle = '#7a5a40'; ctx.fillRect(x - 70, 262, 140, 38); ctx.fillStyle = '#f2f2f2'; ctx.fillRect(x - 66, 252, 132, 16); ctx.fillStyle = '#9fb7d4'; ctx.fillRect(x - 20, 254, 80, 14); ctx.fillStyle = '#fff'; ctx.fillRect(x - 62, 246, 30, 12); ctx.fillStyle = '#6b3a24'; ctx.fillRect(x + 90, 250, 14, 16); texto('☕', x + 97, 246, 12, '#fff'); break; }
      case 'parede': {
        const linhas = Math.min(8, 1 + (o.n || 0) + (o.n >= 6 ? 1 : 0));
        for (let r = 0; r < linhas; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = (r + c) % 2 ? '#b5452f' : '#c25a3c'; ctx.fillRect(x - 60 + c * 30 + (r % 2) * 10, 288 - r * 12, 28, 11); }
        if (dt < 0.3) estrelas(x, 280 - linhas * 12, 1, ['•']);
        break;
      }
      case 'porta': { ctx.fillStyle = '#111'; ctx.fillRect(x - 36, 140, 72, 160); ctx.fillStyle = '#6b6b6b'; ctx.fillRect(x - 30, 146, 60, 154); placa(x, 112, o.texto, '#2a2a2a', '#fff', 11); break; }
      case 'balcao': {
        ctx.fillStyle = '#d0202a'; ctx.fillRect(x - 110, 236, 220, 64); ctx.fillStyle = '#f2c230'; ctx.fillRect(x - 116, 228, 232, 10);
        ctx.fillStyle = '#222'; ctx.fillRect(x + 50, 206, 34, 22); ctx.fillStyle = '#5aff9a'; ctx.fillRect(x + 54, 210, 26, 8);
        ctx.fillStyle = '#fff'; ctx.fillRect(x - 70, 212, 22, 16); texto('22', x - 59, 225, 9, '#111');
        ctx.fillStyle = '#c8102e'; ctx.fillRect(x - 20, 214, 16, 14); ctx.fillStyle = '#f2c230'; for (let j = 0; j < 4; j++) ctx.fillRect(x - 19 + j * 4, 206, 3, 9);
        break;
      }
      case 'saidaTunel': { const k = cena.torcida; if (k > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (0.25 * k) + ')'; ctx.fillRect(x - 40, 0, 80, 300); } break; }
      case 'gol': { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x - 50, 200, 100, 100); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(x - 50 + i * 10, 200); ctx.lineTo(x - 50 + i * 10, 300); ctx.stroke(); } texto('⚽', x - 100 + Math.sin(tempo * 2) * 6, 292, 16, '#fff'); break; }
      case 'berco': { ctx.fillStyle = '#f2ece2'; ctx.fillRect(x - 46, 236, 92, 40); ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(x - 44 + i * 11, 236); ctx.lineTo(x - 44 + i * 11, 276); ctx.stroke(); } ctx.fillStyle = '#c9b48a'; ctx.fillRect(x - 48, 276, 6, 24); ctx.fillRect(x + 42, 276, 6, 24); texto('☾', x, 226, 16, '#f6b826'); break; }
      case 'bonecoNeve': { const n = o.n || 0; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#cfd8e0'; ctx.lineWidth = 2;
        if (n >= 1) { ctx.beginPath(); ctx.arc(x, 278, 24, 0, 7); ctx.fill(); ctx.stroke(); }
        if (n >= 2) { ctx.beginPath(); ctx.arc(x, 242, 17, 0, 7); ctx.fill(); ctx.stroke(); }
        if (n >= 3) { ctx.beginPath(); ctx.arc(x, 214, 12, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#111'; ctx.fillRect(x - 5, 211, 2, 2); ctx.fillRect(x + 3, 211, 2, 2); ctx.fillStyle = '#f07b1d'; ctx.beginPath(); ctx.moveTo(x, 215); ctx.lineTo(x + 10, 217); ctx.lineTo(x, 219); ctx.fill(); ctx.fillStyle = '#c4232f'; ctx.fillRect(x - 12, 224, 24, 5); }
        if (n === 0) texto('☃️?', x, 280, 16, '#9ab'); break; }
      case 'janela': break;
      case 'convite': { ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x - 30, 258, 60, 6); ctx.fillRect(x - 3, 264, 6, 36); ctx.fillStyle = a ? '#9fe0a0' : '#fff'; ctx.fillRect(x - 14, 238 - Math.abs(Math.sin(tempo * 3)) * 4, 28, 20); texto(a ? '🇧🇷' : '✉', x, 254, 12, '#111'); break; }
      case 'malas': { const n = o.n || 0; for (let i = n; i < 3; i++) mala(x - 30 + i * 30, 300); if (n >= 3) texto('✓', x, 270, 18, '#1f8a4f'); break; }
      case 'portao': { ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x - 60, 120, 8, 180); ctx.fillRect(x + 52, 120, 8, 180); ctx.fillRect(x - 60, 120, 120, 30); texto('PORTÃO 6', x, 140, 12, '#f6b826'); placa(x, 160, 'BRASIL', '#2f8a4f', '#fff', 12); break; }
      case 'bemvindo': { placa(x, 120, 'BEM-VINDOS DE VOLTA', '#1f8a4f', '#fff', 13); texto('🇧🇷', x, 175, 26, '#fff'); break; }
      case 'caixas': { const n = o.n || 0; for (let i = n; i < 3; i++) { ctx.fillStyle = '#c9a06a'; ctx.fillRect(x - 50 + i * 36, 266 - (i % 2) * 30, 32, 32); ctx.strokeStyle = '#8a6a3a'; ctx.strokeRect(x - 50 + i * 36, 266 - (i % 2) * 30, 32, 32); } break; }
      case 'portaCasa': { ctx.fillStyle = '#4a3020'; ctx.fillRect(x - 32, 150, 64, 150); ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(x + 20, 228, 4, 0, 7); ctx.fill(); if (!a && Math.sin(tempo * 6) > 0) texto('🔔', x, 140, 16, '#fff'); break; }
      case 'tv': { ctx.fillStyle = '#111'; ctx.fillRect(x - 90, 110, 180, 100); if (a) { ctx.fillStyle = '#3a8a46'; ctx.fillRect(x - 84, 116, 168, 88); ctx.fillStyle = '#fff'; ctx.fillRect(x - 84, 158, 168, 2); ctx.beginPath(); ctx.arc(x + Math.sin(tempo * 2) * 60, 150 + Math.cos(tempo * 3) * 20, 3, 0, 7); ctx.fill(); ctx.fillStyle = '#f6d33a'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 70 + i * 26, 184, 8, 12); } else { ctx.fillStyle = '#1a1a2a'; ctx.fillRect(x - 84, 116, 168, 88); } ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x - 100, 220, 200, 12); break; }
      case 'mesaIdeia': { ctx.fillStyle = '#5a3a24'; ctx.fillRect(x - 50, 250, 100, 8); ctx.fillRect(x - 4, 258, 8, 42); texto('💬', x, 238, 16, '#fff'); if (a) texto('💡', x, 200 - Math.abs(Math.sin(tempo * 3)) * 10, 26, '#fff'); break; }
      case 'lineup': {
        const bandas = ['HALFPIPE', 'NEVERMIND', 'CASA NOVA', 'ONE MORE LIGHT', 'VOLGAN', 'BADLUV'], n = o.n || 0;
        ctx.fillStyle = '#0b0b0b'; ctx.fillRect(x - 110, 40, 220, 200); texto('GEN2K · LINE-UP', x, 64, 13, '#f6b826');
        for (let i = 0; i < 6; i++) { const ok = i < n; texto(ok ? bandas[i] : '· · ·', x, 92 + i * 24, ok && bandas[i] === 'VOLGAN' ? 15 : 12, ok ? (bandas[i] === 'VOLGAN' ? '#f6b826' : '#fff') : '#444'); }
        break;
      }
      case 'palcoFest': { ctx.fillStyle = '#0a0a0a'; ctx.fillRect(x - 160, 120, 320, 140); ctx.fillStyle = a ? '#f7a500' : '#3a2a10'; ctx.fillRect(x - 150, 130, 300, 110); if (a && imgs.telao) imagemContida(imgs.telao, x - 150, 130, 300, 110); else texto('GEN2K', x, 200, 40, '#111'); amplificador(x - 220); amplificador(x + 160); break; }
      case 'microfoneEstudio': { ctx.strokeStyle = '#333'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 210); ctx.stroke(); ctx.fillStyle = '#555'; rr(x - 8, 190, 16, 26, 8); ctx.fill(); if (a) for (let i = 1; i < 4; i++) { ctx.strokeStyle = 'rgba(246,184,38,' + (0.6 - i * 0.15) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, 200, 14 + i * 10 + (tempo * 20) % 10, -0.7, 0.7); ctx.stroke(); } break; }
      case 'arco': {
        ctx.strokeStyle = '#7a9a5a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, 200, 90, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 90, 200); ctx.lineTo(x - 90, 300); ctx.moveTo(x + 90, 200); ctx.lineTo(x + 90, 300); ctx.stroke();
        const flores = ['#ffffff', '#f7c6d6', '#f6b826', '#e86a8a', '#fff1c8'];
        for (let i = 0; i < 26; i++) { const ang = Math.PI + (i / 25) * Math.PI; ctx.fillStyle = flores[i % 5]; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * 90, 200 + Math.sin(ang) * 90, 8, 0, 7); ctx.fill(); }
        for (let i = 0; i < 6; i++) { ctx.fillStyle = flores[i % 5]; ctx.beginPath(); ctx.arc(x - 90, 220 + i * 14, 7, 0, 7); ctx.arc(x + 90, 220 + i * 14, 7, 0, 7); ctx.fill(); }
        break;
      }
      case 'carta': { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 24, 258, 48, 6); ctx.fillRect(x - 3, 264, 6, 36); const by = 238 - Math.abs(Math.sin(tempo * 3)) * 6; ctx.fillStyle = '#fff'; ctx.fillRect(x - 18, by, 36, 22); ctx.strokeStyle = '#d93a2b'; ctx.lineWidth = 2; ctx.strokeRect(x - 18, by, 36, 22); break; }
      case 'mesaReuniao': { ctx.fillStyle = '#3a2a20'; ctx.fillRect(x - 120, 250, 240, 10); ctx.fillRect(x - 110, 260, 8, 40); ctx.fillRect(x + 102, 260, 8, 40); ctx.fillStyle = '#ddd'; ctx.fillRect(x - 60, 240, 30, 10); ctx.fillStyle = '#222'; ctx.fillRect(x + 20, 236, 40, 14); break; }
      case 'cliente': {
        ctx.fillStyle = '#0b0b0b'; ctx.fillRect(x - 90, 60, 180, 170);
        if (a) { const s = Math.min(1, dt * 2.5); ctx.save(); ctx.translate(x, 145); ctx.scale(s, s); ctx.fillStyle = o.cor; ctx.fillRect(-84, -79, 168, 158); texto(o.texto, 0, -6, 20, '#fff'); if (o.sub) texto(o.sub, 0, 16, 10, '#fff', 800); texto('★ campanha pronta ★', 0, 56, 10, '#fff', 800); ctx.restore(); }
        else { texto(o.texto, x, 140, 16, '#666'); texto('?', x, 180, 28, '#444'); }
        break;
      }
      case 'rede': {
        const nomes = o.nomes || [], n = o.n || 0;
        const nos = [[x - 230, 70], [x + 110, 60], [x - 300, 170], [x + 200, 150], [x - 230, 250], [x + 150, 240]];
        for (let i = 0; i < Math.min(n, nos.length); i++) {
          const [nx, ny] = nos[i]; ctx.strokeStyle = 'rgba(246,184,38,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 160); ctx.lineTo(nx, ny); ctx.stroke();
          const t = nomes[i] || ''; ctx.font = '800 11px system-ui, Arial'; const w = ctx.measureText(t).width + 30;
          ctx.fillStyle = '#1f2a33'; rr(nx - w / 2, ny - 14, w, 28, 14); ctx.fill(); ctx.strokeStyle = '#f6b826'; ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('⚽ ' + t, nx, ny + 4);
        }
        ctx.fillStyle = '#f6b826'; ctx.beginPath(); ctx.arc(x, 160, 24, 0, 7); ctx.fill(); texto('ACES', x, 165, 11, '#111');
        break;
      }
    }
  }
  function cameraTripe(x, gravando) {
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x - 16, 300); ctx.moveTo(x, 240); ctx.lineTo(x + 16, 300); ctx.moveTo(x, 240); ctx.lineTo(x, 300); ctx.stroke();
    ctx.fillStyle = '#1a1a1a'; rr(x - 22, 218, 40, 24, 4); ctx.fill(); ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(x + 22, 230, 8, 0, 7); ctx.fill();
    if (gravando && Math.sin(tempo * 6) > 0) { ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.arc(x - 14, 224, 3, 0, 7); ctx.fill(); }
  }
  function mala(x, y) {
    ctx.fillStyle = '#2f6db0'; rr(x - 18, y - 40, 36, 40, 5); ctx.fill();
    ctx.strokeStyle = '#1d3c78'; ctx.lineWidth = 2; ctx.strokeRect(x - 18, y - 40, 36, 40);
    ctx.strokeStyle = '#222'; ctx.beginPath(); ctx.moveTo(x - 8, y - 40); ctx.lineTo(x - 8, y - 50); ctx.lineTo(x + 8, y - 50); ctx.lineTo(x + 8, y - 40); ctx.stroke();
    ctx.fillStyle = '#f6b826'; ctx.fillRect(x - 18, y - 24, 36, 5);
  }
  function onibus(x) {
    ctx.save(); ctx.translate(x, CHAO);
    ctx.fillStyle = '#1d6ab0'; rr(-110, -86, 220, 76, 12); ctx.fill(); ctx.fillStyle = '#f2c230'; ctx.fillRect(-110, -40, 220, 8);
    ctx.fillStyle = '#bfe3ff'; for (let i = 0; i < 6; i++) ctx.fillRect(-100 + i * 34, -76, 26, 26);
    ctx.fillStyle = '#d2a07a'; ctx.beginPath(); ctx.arc(-15, -60, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#17110e'; ctx.beginPath(); ctx.arc(-15, -63, 7, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#111'; for (const rx of [-70, 70]) { ctx.beginPath(); ctx.arc(rx, -8, 14, 0, 7); ctx.fill(); ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(rx, -8, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; }
    ctx.restore();
  }
  function desenharExtras() {
    for (const e of (cena.def.extras || [])) {
      const perto = Math.abs(m.x - e.x) < 46, y = 236 + Math.sin(tempo * 2 + e.x) * 3;
      ctx.fillStyle = '#5a3c26'; ctx.fillRect(e.x - 2, y + 30, 4, 300 - y - 30);
      ctx.save(); ctx.translate(e.x, y); ctx.rotate(-0.06);
      ctx.fillStyle = '#fff'; ctx.fillRect(-20, -6, 40, 40); ctx.fillStyle = e.tipo === 'album' ? '#2bb3b1' : '#f6b826'; ctx.fillRect(-16, -2, 32, 26);
      texto(e.tipo === 'album' ? '📷' : '✉', 0, 18, 14, '#fff');
      ctx.restore();
      if (perto) texto('opcional', e.x, y - 14, 9, '#fff', 700);
    }
  }

  /* ---------- Pessoas: fichas visuais ---------- */
  function desenharPessoa(id, x, dir, andando, extra, visual, ent) {
    const p = Object.assign({}, P[id], (ent === 'm' ? m.visual : null) || {}, visual || {});
    const s = p.pequeno ? 0.5 : p.crianca ? 0.64 : 1;
    const balanco = andando ? Math.sin(tempo * 12) : 0;
    const pulo = extra && extra.pulando ? Math.abs(Math.sin(tempo * 8)) * 6 : 0;
    const bob = andando ? Math.abs(Math.sin(tempo * 12)) * 2 : Math.sin(tempo * 2 + x) * 0.8;
    const semCamisa = ent === 'm' && m.semCamisa;
    const L = p.largo ? 19 : 16;
    const nada = extra && extra.nadar;
    ctx.save(); ctx.translate(x, CHAO - pulo + (nada ? 26 + Math.sin(tempo * 3 + x) * 2 : 0)); ctx.scale(s, s);
    if (p.mochila) { ctx.fillStyle = '#e86a8a'; rr(-dir * 6 - 10, -66, 20, 26, 5); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 1 + pulo, 18, 4, 0, 0, 7); ctx.fill();
    // brilho de "contribuição" (poder em equipe)
    if (extra && extra.brilho) { ctx.fillStyle = 'rgba(246,184,38,' + (0.35 * extra.brilho) + ')'; ctx.beginPath(); ctx.ellipse(0, -55, 34, 62, 0, 0, 7); ctx.fill(); }
    // capa de herói (atrás)
    if (extra && extra.capa) {
      const onda = Math.sin(tempo * 9) * 6;
      ctx.fillStyle = '#c4232f'; ctx.beginPath(); ctx.moveTo(-14, -70); ctx.lineTo(14, -70);
      ctx.quadraticCurveTo(26 - dir * 6, -30, 24 - dir * 14 + onda, -2); ctx.lineTo(-24 - dir * 14 + onda, -4); ctx.quadraticCurveTo(-26 - dir * 6, -30, -14, -70); ctx.fill();
      ctx.fillStyle = '#f6b826'; ctx.fillRect(-14, -71, 28, 3);
    }
    if (p.veu) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.moveTo(-10, -98); ctx.lineTo(10, -98); ctx.lineTo(26, -6); ctx.lineTo(-26, -6); ctx.fill(); }
    if (p.cabeloEstilo === 'longo') {
      ctx.fillStyle = p.cabelo; rr(-15, -98, 30, 44, 8); ctx.fill();
      if (p.pontas) { ctx.fillStyle = p.pontas; rr(-15, -68, 30, 14, 6); ctx.fill(); }
    }
    // pernas, saia ou vestido
    if (p.vestido) {
      ctx.fillStyle = p.vestido; ctx.beginPath(); ctx.moveTo(-14, -66); ctx.lineTo(14, -66); ctx.lineTo(p.veu ? 28 : 22, -3); ctx.lineTo(p.veu ? -28 : -22, -3); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; ctx.stroke();
    } else {
      ctx.fillStyle = p.saia ? p.pele : p.calca;
      ctx.save(); ctx.translate(-6, -34); ctx.rotate(balanco * 0.35); ctx.fillRect(-5, 0, 10, 32); ctx.restore();
      ctx.save(); ctx.translate(6, -34); ctx.rotate(-balanco * 0.35); ctx.fillRect(-5, 0, 10, 32); ctx.restore();
      if (p.saia) {
        ctx.fillStyle = p.saia; ctx.beginPath(); ctx.moveTo(-15, -36); ctx.lineTo(15, -36); ctx.lineTo(20, -16); ctx.lineTo(-20, -16); ctx.fill();
        if (p.xadrez) { ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1.5; for (let i = -14; i <= 14; i += 7) { ctx.beginPath(); ctx.moveTo(i, -36); ctx.lineTo(i * 1.3, -16); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-17, -27); ctx.lineTo(17, -27); ctx.stroke(); }
      }
    }
    ctx.fillStyle = p.tenis;
    ctx.fillRect(-13 + Math.sin(balanco) * 6, -4, 13, 5); ctx.fillRect(1 - Math.sin(balanco) * 6, -4, 13, 5);
    ctx.translate(0, -bob);
    // braços
    const pelado = p.regata || semCamisa;
    const corBraco = p.mangas || (pelado ? p.pele : p.camisa);
    for (const lado of [-1, 1]) {
      ctx.save(); ctx.translate(lado * L, -68);
      const ang = extra && extra.bracosAbertos ? lado * 1.1 : lado * 0.08 + (andando ? lado * balanco * 0.3 : 0);
      ctx.rotate(-ang);
      ctx.fillStyle = corBraco; ctx.fillRect(-4, 0, 8, 12);
      ctx.fillStyle = p.mangas || p.pele; ctx.fillRect(-4, 10, 8, 18);
      ctx.fillStyle = p.pele; ctx.fillRect(-4, 27, 8, 4);
      if (p.tatuagens && !p.mangas && (pelado || true)) {
        ctx.fillStyle = 'rgba(25,30,45,.72)';
        if (pelado) { ctx.fillRect(-4, 2, 8, 4); ctx.fillRect(-4, 8, 3, 3); ctx.fillRect(1, 7, 3, 4); }
        ctx.fillRect(-4, 12, 8, 3); ctx.fillRect(-3, 17, 5, 5); ctx.fillRect(1, 15, 3, 3); ctx.fillRect(-4, 23, 8, 2);
      }
      ctx.restore();
    }
    // tronco
    if (semCamisa) {
      ctx.fillStyle = p.pele; rr(-L, -70, L * 2, 38, 6); ctx.fill();
      ctx.fillStyle = 'rgba(25,30,45,.7)';
      ctx.fillRect(-12, -64, 9, 4); ctx.fillRect(3, -64, 9, 4); ctx.fillRect(-10, -59, 5, 4); ctx.fillRect(5, -59, 5, 4);
      ctx.fillRect(-5, -52, 10, 8); ctx.fillRect(-12, -43, 6, 5); ctx.fillRect(6, -42, 6, 6); ctx.fillRect(-2, -40, 4, 5);
    } else {
      ctx.fillStyle = p.camisa; rr(-L, -70, L * 2, 38, 6); ctx.fill();
      if (p.regata) { ctx.fillStyle = p.pele; ctx.beginPath(); ctx.moveTo(-7, -70); ctx.lineTo(0, -60); ctx.lineTo(7, -70); ctx.fill(); if (p.tatuagens) { ctx.fillStyle = 'rgba(25,30,45,.6)'; ctx.fillRect(-3, -68, 6, 3); } }
      if (p.colete) { ctx.fillStyle = p.colete; ctx.fillRect(-L, -70, 10, 38); ctx.fillRect(L - 10, -70, 10, 38); ctx.fillStyle = '#c9b48a'; for (let i = 0; i < 3; i++) ctx.fillRect(-1, -62 + i * 9, 2, 2); }
      if (p.gola) { ctx.strokeStyle = p.gola; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -69); ctx.lineTo(0, -60); ctx.lineTo(8, -69); ctx.stroke(); }
      if (p.faixa) { ctx.fillStyle = p.faixa; ctx.fillRect(-5, -70, 10, 38); ctx.fillStyle = '#fff'; ctx.fillRect(-7, -70, 2, 38); ctx.fillRect(5, -70, 2, 38); }
      if (p.numero) texto(p.numero, 0, -44, 15, '#fff');
      if (p.gravata) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-6, -70); ctx.lineTo(0, -58); ctx.lineTo(6, -70); ctx.fill(); ctx.fillStyle = p.gravata === '#ddd' ? '#111' : p.gravata; ctx.fillRect(-1.5, -66, 3, 14); }
    }
    if (!p.vestido) { ctx.fillStyle = p.calca; ctx.fillRect(-15, -36, 30, 4); }
    // cabeça
    ctx.fillStyle = p.pele; ctx.fillRect(-4, -76, 8, 6);
    ctx.beginPath(); ctx.arc(0, -86, 13, 0, 7); ctx.fill();
    if (p.tatuagens && (pelado || semCamisa)) { ctx.fillStyle = 'rgba(25,30,45,.55)'; ctx.fillRect(3, -76, 4, 4); }
    if (p.brinco) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-13, -83, 2.4, 0, 7); ctx.arc(13, -83, 2.4, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#111';
    if (p.oculos) { ctx.fillRect(-9 + dir * 2, -90, 8, 5); ctx.fillRect(1 + dir * 2, -90, 8, 5); ctx.fillRect(-1 + dir * 2, -89, 2, 2); }
    else { ctx.fillRect(-6 + dir * 2, -88, 3, 3); ctx.fillRect(3 + dir * 2, -88, 3, 3); }
    if (p.barba === 'cheia') { ctx.fillStyle = p.cabelo; ctx.beginPath(); ctx.arc(0, -84, 13, 0.15, Math.PI - 0.15); ctx.fill(); ctx.fillStyle = p.pele; ctx.fillRect(-4 + dir * 1.5, -82, 8, 2); }
    else if (p.barba === 'bigode') { ctx.fillStyle = p.cabelo; ctx.fillRect(-6 + dir * 1.5, -83, 12, 2.5); ctx.fillStyle = 'rgba(30,20,15,.25)'; ctx.beginPath(); ctx.arc(0, -84, 12.5, 0.4, Math.PI - 0.4); ctx.fill(); }
    ctx.fillStyle = '#111';
    if (extra && extra.cantando) { ctx.beginPath(); ctx.arc(dir * 1.5, -79, 3, 0, 7); ctx.fill(); }
    else ctx.fillRect(-3 + dir * 1.5, -79.5, 6, 1.5);
    // cabelo
    ctx.fillStyle = p.cabelo;
    const est = p.cabeloEstilo || 'curto';
    if (est === 'dread') {
      ctx.beginPath(); ctx.arc(0, -89, 13.5, Math.PI, 0); ctx.fill();
      for (let i = -12; i <= 12; i += 4) ctx.fillRect(i - 1, -92, 2.6, 24 + Math.abs(i) * 0.4);
    } else if (est === 'cacheado') {
      const r = p.cabeloGrande ? 7.5 : 5.5;
      for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; ctx.beginPath(); ctx.arc(Math.cos(a) * 13, -88 + Math.sin(a) * 12, r, 0, 7); ctx.fill(); }
      if (p.cabeloGrande) { ctx.beginPath(); ctx.arc(-14, -80, 6, 0, 7); ctx.arc(14, -80, 6, 0, 7); ctx.fill(); }
    } else {
      ctx.beginPath(); ctx.arc(0, -89, 13.5, Math.PI, 0); ctx.fill();
      if (est === 'topete') { ctx.beginPath(); ctx.moveTo(-12, -94); ctx.quadraticCurveTo(2, -112, 14, -96); ctx.lineTo(10, -92); ctx.fill(); }
      if (est === 'franja') { ctx.beginPath(); ctx.moveTo(-14, -94); ctx.lineTo(13, -98); ctx.lineTo(8 * dir, -82); ctx.lineTo(-6 * dir, -88); ctx.fill(); ctx.fillRect(-14, -92, 4, 12); ctx.fillRect(10, -92, 4, 12); }
      if (est === 'longo') { ctx.fillRect(-14, -90, 4, 22); ctx.fillRect(10, -90, 4, 22); if (p.pontas) { ctx.fillStyle = p.pontas; ctx.fillRect(-14, -74, 4, 6); ctx.fillRect(10, -74, 4, 6); } }
    }
    if (p.gorro) { ctx.fillStyle = p.gorro; ctx.beginPath(); ctx.arc(0, -92, 14.5, Math.PI, 0); ctx.fill(); ctx.fillRect(-14.5, -94, 29, 6); ctx.beginPath(); ctx.arc(0, -106, 4, 0, 7); ctx.fill(); }
    if (p.bone) { ctx.fillStyle = p.bone; ctx.beginPath(); ctx.arc(0, -92, 14, Math.PI, 0); ctx.fill(); ctx.fillRect(dir > 0 ? 4 : -22, -93, 18, 4); }
    if (p.capacete) { ctx.fillStyle = p.capacete; ctx.beginPath(); ctx.arc(0, -93, 15, Math.PI, 0); ctx.fill(); ctx.fillRect(-18, -94, 36, 4); }
    if (p.veu) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -100, 3, 0, 7); ctx.arc(-6, -99, 2.5, 0, 7); ctx.arc(6, -99, 2.5, 0, 7); ctx.fill(); }
    // instrumentos
    if (p.instrumento === 'guitarra' || p.instrumento === 'baixo') {
      const baixo = p.instrumento === 'baixo';
      ctx.save(); ctx.translate(2, -48); ctx.rotate(-0.5 * (dir || 1));
      ctx.fillStyle = baixo ? '#c42a22' : '#efe9d8';
      ctx.beginPath(); ctx.ellipse(-4, 4, 13, 10, 0, 0, 7); ctx.fill();
      ctx.fillStyle = baixo ? '#fff' : '#111'; ctx.beginPath(); ctx.ellipse(-4, 4, 5, 4, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(6, 1, baixo ? 32 : 26, 4);
      ctx.fillStyle = baixo ? '#c42a22' : '#efe9d8'; ctx.fillRect(baixo ? 36 : 30, -1, 7, 8);
      ctx.restore();
      if (!baixo) { ctx.strokeStyle = '#fff'; ctx.setLineDash([3, 3]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -68); ctx.lineTo(12, -40); ctx.stroke(); ctx.setLineDash([]); }
    }
    if (p.instrumento === 'baquetas') {
      ctx.strokeStyle = '#e8cfa0'; ctx.lineWidth = 2.5;
      const a = extra && extra.tocando ? Math.sin(tempo * 16) * 0.5 : 0;
      ctx.save(); ctx.translate(-17, -40); ctx.rotate(-0.8 + a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -20); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(17, -40); ctx.rotate(0.8 - a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -20); ctx.stroke(); ctx.restore();
    }
    if (p.buque) { ctx.fillStyle = '#3a7a3a'; ctx.fillRect(dir * 10 - 1, -50, 2, 12); ['#fff', '#f7c6d6', '#fff1c8'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(dir * 10 + (i - 1) * 4, -52 - (i % 2) * 3, 4, 0, 7); ctx.fill(); }); }
    if (p.bebe) { ctx.fillStyle = p.bebe; rr(-14, -60, 28, 14, 7); ctx.fill(); ctx.fillStyle = '#e9bf9c'; ctx.beginPath(); ctx.arc(dir * 10, -56, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#2b1d16'; ctx.beginPath(); ctx.arc(dir * 10, -58, 6, Math.PI, 0); ctx.fill(); }
    if (ent === 'm' && carregando) {
      ctx.save(); ctx.translate(dir * 20, -42);
      if (carregando === 'cabo') { ctx.strokeStyle = '#1d1d1d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.stroke(); }
      else if (carregando === 'mic') { ctx.fillStyle = '#333'; ctx.fillRect(-2, -2, 5, 14); ctx.beginPath(); ctx.arc(0.5, -4, 5, 0, 7); ctx.fill(); }
      else if (carregando === 'camera') { ctx.fillStyle = '#1a1a1a'; rr(-10, -8, 22, 14, 3); ctx.fill(); ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(dir * 12, -1, 5, 0, 7); ctx.fill(); if (Math.sin(tempo * 6) > 0) { ctx.fillStyle = '#f22'; ctx.fillRect(-7, -6, 3, 3); } }
      else if (carregando === 'mala') { ctx.restore(); ctx.save(); ctx.translate(dir * 26, 0); mala(0, 0); }
      ctx.restore();
    }
    ctx.restore();
    if (!(extra && extra.semEtiqueta) && !p.semEtiqueta) etiqueta(x, CHAO - 118 * s - pulo, p.nome, p.corEtiqueta);
  }
  function etiqueta(x, y, nome, cor) {
    ctx.font = '800 12px system-ui, Arial'; ctx.textAlign = 'center';
    const w = ctx.measureText(nome).width + 14;
    ctx.fillStyle = 'rgba(17,17,17,.85)'; rr(x - w / 2, y - 10, w, 18, 9); ctx.fill();
    ctx.strokeStyle = cor; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillText(nome, x, y + 3.5);
  }

  function quebrarTexto(t, max) {
    const palavras = t.split(' '), linhas = []; let l = '';
    for (const p of palavras) {
      const teste = l ? l + ' ' + p : p;
      if (ctx.measureText(teste).width > max && l) { linhas.push(l); l = p; } else l = teste;
    }
    if (l) linhas.push(l);
    return linhas;
  }
  function entidadeBolha(quem) {
    if (quem === 'matheus') return m;
    if (cena) return cena.atores.find((a) => (a.chave === quem || a.id === quem) && !a.oculto);
    return npcs[quem];
  }
  function desenharBolhas(vw) {
    for (let i = bolhas.length - 1; i >= 0; i--) if (bolhas[i].ate < tempo) bolhas.splice(i, 1);
    ctx.font = '600 13px system-ui, Arial'; ctx.textAlign = 'left';
    for (const b of bolhas) {
      const ent = entidadeBolha(b.quem);
      if (!ent) continue;
      const linhas = quebrarTexto(b.texto, 170);
      const w = Math.max(...linhas.map((l) => ctx.measureText(l).width)) + 18;
      const h = linhas.length * 16 + 12;
      let bx = ent.x - w / 2;
      bx = Math.max(camX + 6, Math.min(camX + vw - w - 6, bx));
      const by = CHAO - 142 - h;
      ctx.fillStyle = '#fff'; rr(bx, by, w, h, 10); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ent.x - 6, by + h); ctx.lineTo(ent.x + 6, by + h); ctx.lineTo(ent.x, by + h + 8); ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; rr(bx, by, w, h, 10); ctx.stroke();
      ctx.fillStyle = '#111';
      linhas.forEach((l, i) => ctx.fillText(l, bx + 9, by + 20 + i * 16));
    }
  }
  function setaAlvo(ax, ehPessoa, vw) {
    const ay = (ehPessoa ? CHAO - 140 : CHAO - 60) - Math.abs(Math.sin(tempo * 4)) * 8;
    ctx.fillStyle = '#f6b826'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
    if (ax > camX + 10 && ax < camX + vw - 10) {
      ctx.beginPath(); ctx.moveTo(ax - 10, ay - 14); ctx.lineTo(ax + 10, ay - 14); ctx.lineTo(ax, ay); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      const direita = ax > camX + vw / 2;
      const sx = direita ? camX + vw - 26 : camX + 26;
      const sy = CHAO - 70;
      ctx.beginPath();
      if (direita) { ctx.moveTo(sx + 14, sy); ctx.lineTo(sx - 8, sy - 14); ctx.lineTo(sx - 8, sy + 14); }
      else { ctx.moveTo(sx - 14, sy); ctx.lineTo(sx + 8, sy - 14); ctx.lineTo(sx + 8, sy + 14); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  function desenharAlvo(vw) {
    if (modo !== 'jogo' && modo !== 'dialogo') return;
    if (cena) {
      const p = cena.def.passos[cena.passo];
      if (!p || cena.pendente) return;
      setaAlvo(xAlvo(p), !!atorPorId(p.alvo), vw);
      return;
    }
    const e = ETAPAS[etapa];
    if (bolhas.some((b) => b.quem === e.alvo)) return;
    setaAlvo(posDe(e.alvo), !!npcs[e.alvo], vw);
  }

  function desenharLuzesShow() {
    if (!emShow()) return;
    const cores = ['rgba(161,76,255,', 'rgba(63,169,255,', 'rgba(255,79,163,', 'rgba(255,220,120,'];
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const ox = INICIO_PALCO + 120 + i * 150;
      const ang = Math.sin(tempo * (0.8 + i * 0.17) + i) * 0.45;
      const fx = ox + Math.sin(ang) * 300;
      const a = 0.10 + show.hype / 900;
      ctx.fillStyle = cores[i % 4] + a + ')';
      ctx.beginPath(); ctx.moveTo(ox - 6, 30); ctx.lineTo(fx - 70, CHAO + 10); ctx.lineTo(fx + 70, CHAO + 10); ctx.lineTo(ox + 6, 30); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,230,.12)';
    ctx.beginPath(); ctx.moveTo(m.x - 10, -40); ctx.lineTo(m.x - 60, CHAO + 6); ctx.lineTo(m.x + 60, CHAO + 6); ctx.lineTo(m.x + 10, -40); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  function desenharPlateia(vw) {
    if (!emShow()) return;
    const base = (H - offY) / esc + 10;
    const pulo = 3 + show.hype / 12;
    for (let fila = 0; fila < 3; fila++) {
      const y = CHAO + 58 + fila * 26;
      for (let x = Math.floor((camX - 40) / 34) * 34; x < camX + vw + 40; x += 34) {
        if (x < C.porta + 10) continue;
        const sx = x + (fila % 2) * 17;
        const fase = Math.sin(tempo * (6 + (sx % 5)) + sx);
        const dy = Math.max(0, fase) * pulo;
        const t = 18 + fila * 8;
        ctx.fillStyle = 'rgb(' + t + ',' + (t - 4) + ',' + (t + 10) + ')';
        ctx.beginPath(); ctx.arc(sx, y - dy, 13, 0, 7); ctx.fill();
        ctx.fillRect(sx - 18, y + 8 - dy, 36, base - y);
        if (show.hype > 30 && (sx / 34) % 3 === 0) ctx.fillRect(sx + 12, y - 30 - dy, 5, 28);
      }
    }
  }
  function desenharRitmo(vw) {
    if (!emShow() || show.fase !== 'ritmo') return;
    const ly = CHAO + 20, hx = m.x;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; rr(hx - 20, ly - 22, vw * 0.5 + 40, 44, 22); ctx.fill();
    ctx.strokeStyle = '#f6b826'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, ly, 16, 0, 7); ctx.stroke();
    ctx.font = '900 18px Arial'; ctx.textAlign = 'center';
    for (const n of show.notas) {
      const nx = hx + (n.t - show.t) * 220;
      if (nx < hx - 30 || nx > camX + vw + 20) continue;
      if (n.estado === 1) continue;
      ctx.fillStyle = n.estado === 2 ? 'rgba(255,255,255,.25)' : '#fff3d6';
      ctx.beginPath(); ctx.arc(nx, ly, 12, 0, 7); ctx.fill();
      ctx.fillStyle = '#111'; ctx.fillText('♪', nx, ly + 6);
    }
  }
  function desenharEfeitos() {
    ctx.textAlign = 'center';
    for (const e of efeitos) {
      ctx.globalAlpha = Math.max(0, Math.min(1, e.vida * 1.5));
      if (e.cor) { ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.r + tempo * 6); ctx.fillStyle = e.cor; ctx.fillRect(-3, -5, 6, 10); ctx.restore(); continue; }
      ctx.font = '900 ' + (e.txt.length > 1 ? 16 : 20) + 'px Arial';
      ctx.fillStyle = e.txt === '♥' ? '#ff6fb5' : '#f6b826'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      ctx.strokeText(e.txt, e.x, e.y); ctx.fillText(e.txt, e.x, e.y);
    }
    ctx.globalAlpha = 1;
  }
  function desenharRaios() {
    for (let i = cena.raios.length - 1; i >= 0; i--) {
      const r = cena.raios[i], d = tempo - r.t;
      if (d > 0.7) { cena.raios.splice(i, 1); continue; }
      const a = 1 - d / 0.7;
      ctx.globalAlpha = a; ctx.strokeStyle = r.cor || '#f6b826'; ctx.lineWidth = r.larg || 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(r.x0, CHAO - 60);
      for (let k = 1; k <= 6; k++) ctx.lineTo(r.x0 + (r.x1 - r.x0) * k / 6, CHAO - 60 - Math.sin(k / 6 * Math.PI) * 50 + (k < 6 ? (Math.random() - 0.5) * 12 : 0));
      ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  function desenharHype() {
    if (!emShow()) return;
    const w = Math.min(220, W * 0.45), x = 12, y = H - offY > 0 ? Math.min(H - 30, offY + (CHAO + 40) * esc) : H - 30;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(x, y, w, 18, 9); ctx.fill();
    ctx.fillStyle = '#f6b826'; rr(x + 2, y + 2, (w - 4) * show.hype / 100, 14, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '800 11px system-ui'; ctx.textAlign = 'left'; ctx.fillText('PLATEIA', x + 8, y + 13);
  }
  function desenharSobreposicoes() {
    // escurecimento progressivo na cena das viagens
    if (cena && cena.def.fundo === 'viagens') {
      const a = Math.max(0, Math.min(0.45, (m.x - 700) / 900));
      ctx.fillStyle = 'rgba(10,8,20,' + a + ')'; ctx.fillRect(0, 0, W, H);
    }
    if (cena && cena.aviao >= 0) {
      const d = tempo - cena.aviao;
      if (d < 2) { ctx.font = '900 ' + Math.round(60 * (0.6 + d)) + 'px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 4; const px = -60 + d * (W + 120) / 2, py = H * 0.35 - d * 60; ctx.strokeText('✈', px, py); ctx.fillText('✈', px, py); if (d > 0.6) { ctx.font = '900 34px Arial Black, Arial'; ctx.fillStyle = '#f6b826'; ctx.strokeText('BRASIL!', W / 2, H * 0.3); ctx.fillText('BRASIL!', W / 2, H * 0.3); } }
    }
    if (cena && cena.flashAte > tempo) {
      const rest = cena.flashAte - tempo, a = Math.min(1, rest * 1.5, (3.2 - rest) * 2);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = 'rgba(17,17,17,.82)'; ctx.fillRect(0, 0, W, H);
      const t = cena.def.flashback.split('·');
      ctx.textAlign = 'center'; ctx.fillStyle = '#f6b826'; ctx.font = '900 ' + Math.min(54, W / 9) + 'px Arial Black, Arial';
      ctx.fillText(t[0].trim(), W / 2, H * 0.45);
      ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.min(24, W / 18) + 'px system-ui, Arial';
      ctx.fillText((t[1] || '').trim(), W / 2, H * 0.45 + 40);
      ctx.globalAlpha = 1;
    }
    if (flashTela > 0) { ctx.fillStyle = 'rgba(255,255,255,' + flashTela + ')'; ctx.fillRect(0, 0, W, H); }
  }

  /* -------------------- LOOP -------------------- */
  function atualizarFade(dt) {
    const vw = W / esc;
    if (fadeAlvo === 1) {
      fade = Math.min(1, fade + dt * 3);
      if (fade >= 1 && fadeAoFim) { const cb = fadeAoFim; fadeAoFim = null; cb(); camX = Math.max(0, Math.min(LARG - vw, m.x - vw / 2)); }
    } else fade = Math.max(0, fade - dt * 3);
  }
  let ultimo = performance.now();
  function quadro(agora) {
    const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora; tempo += dt;
    const vw = W / esc;
    flashTela = Math.max(0, flashTela - dt * 3);

    if (modo === 'mapa' || modo === 'titulo' || modo === 'album') { requestAnimationFrame(quadro); return; }
    if (modo === 'cinema' && cinema) { cinema.t += dt; desenharCinematica(); if (fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, fade) + ')'; ctx.fillRect(0, 0, W, H); } atualizarFade(dt); requestAnimationFrame(quadro); return; }

    if (modo === 'jogo') {
      let v = 0;
      if (teclas.esq) v -= 1;
      if (teclas.dir) v += 1;
      if (cena && tempo < cena.ocupadoAte) v = 0;
      m.andando = v !== 0;
      if (v) { m.dir = v; m.x = Math.max(40, Math.min(LARG - 40, m.x + v * VEL * dt)); }
      if (Math.floor(tempo * 10) % 2 === 0) atualizarBotoes();
      if (!cena) for (const id of ['jean', 'luiz', 'joao', 'leo']) npcs[id].dir = m.x > npcs[id].x ? 1 : -1;
    } else m.andando = false;
    if (modo === 'show') atualizarShow(dt);
    if (cena) atualizarCena(dt);
    atualizarEfeitos(dt);

    const alvoCam = Math.max(0, Math.min(LARG - vw, m.x - vw / 2));
    camX += (alvoCam - camX) * Math.min(1, dt * 6);
    if (vw >= LARG) camX = (LARG - vw) / 2;

    atualizarFade(dt);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(DPR * esc, 0, 0, DPR * esc, -camX * esc * DPR, offY * DPR);
    const topo = -offY / esc - 10, base = (H - offY) / esc + 10;
    const capa = tempo < m.capaAte || (!!cena && progresso.poderesLib.length >= 8 && cena.def.id === '10B');
    if (cena) {
      (FUNDOS[cena.def.fundo] || FUNDOS.quarto)(topo, base);
      for (const id in cena.objetos) desenharObjetoCena(cena.objetos[id]);
      desenharExtras();
      for (const a of cena.atores) {
        if (a.oculto) continue;
        const b = a.brilho ? Math.max(0, 1 - (tempo - a.brilho) / 1.5) : 0;
        desenharPessoa(a.id, a.x, a.dir, a.andando, { brilho: b, nadar: a.acao === 'nadar' }, a.visual, a.chave);
      }
      for (const a of cena.atores) if (a.grupo && !a.oculto) placa(a.x + 25, CHAO + 40, a.grupo, '#fff3d6', '#111', 10);
      desenharRaios();
      if (!m.oculto) desenharPessoa('matheus', m.x, m.dir, m.andando, { capa }, null, 'm');
      if (cena.viagem) onibus(m.x);
      desenharFrente(base);
    } else {
      desenharFundoPub(vw);
      desenharCamarim();
      desenharPalcoFundo();
      desenharLuzesShow();
      desenharObjetosPub();
      const noShow = emShow();
      for (const id of ['leo', 'jean', 'joao', 'luiz', 'giu']) {
        const n = npcs[id];
        if (n.oculto) continue;
        desenharPessoa(id, n.x, n.dir, !!n.andando, noShow ? { tocando: id === 'leo', pulando: id !== 'jean' && id !== 'leo', cantando: id === 'giu' && show.giuChegou } : null, D.visuaisPub[id]);
      }
      desenharPessoa('matheus', m.x, m.dir, m.andando, noShow ? { cantando: true, bracosAbertos: show.hype > 55 || m.semCamisa, pulando: show.hype > 40 } : null, null, 'm');
      desenharPlateia(vw);
      desenharRitmo(vw);
    }
    desenharEfeitos();
    desenharBolhas(vw);
    desenharAlvo(vw);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    desenharHype();
    desenharSobreposicoes();
    if (fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, fade) + ')'; ctx.fillRect(0, 0, W, H); }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);

  /* gancho só para testes automatizados */
  window.__teste = {
    estado: () => ({ modo, etapa, fase: faseAtual && faseAtual.id, cena: cena && cena.def && cena.def.id, passo: cena && cena.passo, x: m.x, show: show.fase, cinema: !!cinema, progresso: JSON.parse(JSON.stringify(progresso)) }),
    irPara: (x) => { m.x = x; },
    alvoX: () => cena && cena.def ? (cena.def.passos[cena.passo] ? xAlvo(cena.def.passos[cena.passo]) : m.x) : posDe(ETAPAS[etapa].alvo),
    ir: (alvo) => { m.x = posDe(alvo); },
    entrarFase, entrarFaseDireto, interagir, alternarCamisa, tocarNota, comecar, abrirAlbum
  };

})();
