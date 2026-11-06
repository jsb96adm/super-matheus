/* =====================================================================
   MATHEUS: HOMECOMING · DADOS EDITÁVEIS (v2)
   Tudo o que é texto, nome, cor, posição ou mídia fica aqui.
   Para trocar uma foto: coloque o arquivo em assets/ e escreva o caminho.
   null = desliga / usa o espaço provisório. Nada aqui bloqueia o jogo.
   ===================================================================== */
window.DADOS = {
  titulo: "Super Matheus",
  subtitulo: "O jogo da vida · Feliz aniversário!",
  aviso: "Feito com carinho pelo Jean. As situações de jogo são ficção inspirada na história real; datas e fatos vêm dos relatos e das publicações.",
  chaveSalvamento: "super-matheus-v3",

  // true = mostra etiquetas [PROVISÓRIO] nos espaços de mídia vazios
  mostrarMarcadores: false,

  /* ---------------- PERSONAGENS (fichas visuais) ----------------
     Base de cada pessoa. Cada cena pode trocar a roupa com "visual".
     Campos: pele, cabelo, cabeloEstilo (curto|topete|franja|longo|cacheado),
     pontas (cor nas pontas), barba ("bigode"|"cheia"), brinco, oculos,
     camisa, regata, mangas (manga longa), colete, calca, saia, xadrez,
     vestido, veu, tenis, bone, capacete, numero (camisa de jogo),
     instrumento (guitarra|baixo|baquetas), largo, crianca, tatuagens. */
  personagens: {
    matheus: { nome: "Matheus", papel: "Vocal · VOLGAN", corEtiqueta: "#f6b826",
      pele: "#d2a07a", cabelo: "#17110e", cabeloEstilo: "topete", barba: "bigode", brinco: true,
      camisa: "#151515", regata: true, calca: "#2b2b2b", tenis: "#f2f2f2", tatuagens: true },
    jean:    { nome: "Jean", papel: "Bastidores e negócios", corEtiqueta: "#2bb3b1",
      pele: "#c99470", cabelo: "#1d1410", cabeloEstilo: "curto", largo: true,
      camisa: "#151515", calca: "#23262d", tenis: "#111" },
    luiz:    { nome: "Luis", papel: "Baixo · VOLGAN", corEtiqueta: "#ffffff",
      pele: "#e0b592", cabelo: "#241913", cabeloEstilo: "curto", camisa: "#141414",
      calca: "#151515", tenis: "#eee", instrumento: "baixo" },
    joao:    { nome: "João", papel: "Guitarra · VOLGAN", corEtiqueta: "#e2453a",
      pele: "#e2b893", cabelo: "#4a3222", cabeloEstilo: "curto", camisa: "#b08a62",
      calca: "#2d2420", tenis: "#ddd", instrumento: "guitarra" },
    leo:     { nome: "Léo", papel: "Bateria · VOLGAN", corEtiqueta: "#8fd3c8",
      pele: "#c99a74", cabelo: "#1a1411", cabeloEstilo: "longo", barba: "cheia", camisa: "#eef3f1",
      calca: "#2a2a2a", tenis: "#eee", instrumento: "baquetas" },
    giu:     { nome: "Giu", papel: "Esposa · coprotagonista", corEtiqueta: "#ff6fb5",
      pele: "#ecc4a2", cabelo: "#e2c48a", cabeloEstilo: "longo", camisa: "#1a1a1a",
      calca: "#3b4a6b", tenis: "#111" },
    lys:     { nome: "Lys", papel: "Filha", corEtiqueta: "#ffd1e6", crianca: true,
      pele: "#e9bf9c", cabelo: "#2b1d16", cabeloEstilo: "longo", camisa: "#fbf7ef", vestido: "#fbf7ef", tenis: "#f5f5f5" },
    luca:    { nome: "Luca", papel: "Filho", corEtiqueta: "#bfe3ff", crianca: true,
      pele: "#e2b893", cabelo: "#2b1d16", cabeloEstilo: "curto", camisa: "#f2ead9", calca: "#efe6d2", tenis: "#f5f5f5" },
    dudu:    { nome: "Dudu", papel: "Irmão da Giu", corEtiqueta: "#9ad1ff",
      pele: "#e6bd98", cabelo: "#2a1d15", cabeloEstilo: "curto", barba: "cheia", oculos: true,
      camisa: "#161616", calca: "#3a3f4a", tenis: "#ddd" },
    isaac:   { nome: "Isaac", papel: "Produção musical", corEtiqueta: "#c59bff",
      pele: "#e0b48e", cabelo: "#21160f", cabeloEstilo: "cacheado", camisa: "#141414", calca: "#2a2a2a", tenis: "#eee" },
    gui:     { nome: "Gui", papel: "Sócio · Vox", corEtiqueta: "#ffb36b",
      pele: "#d9a57f", cabelo: "#1d1410", cabeloEstilo: "curto", barba: "cheia", oculos: true, largo: true,
      camisa: "#8a5a32", mangas: "#8a5a32", calca: "#e9dfcb", tenis: "#fff" },
    belle:   { nome: "Belle", papel: "Equipe", corEtiqueta: "#ff9ec7",
      pele: "#e8c0a0", cabelo: "#1c1310", cabeloEstilo: "longo", camisa: "#151515", calca: "#151515", tenis: "#eee" },
    julia:   { nome: "Júlia", papel: "Core", corEtiqueta: "#fff1a8",
      pele: "#e2b893", cabelo: "#2a1a12", cabeloEstilo: "longo", camisa: "#f4efe6", vestido: "#f4efe6", tenis: "#d8c6a8" },
    kevin:   { nome: "Kevin", papel: "Core", corEtiqueta: "#a8ffcf",
      pele: "#e8c0a0", cabelo: "#6b4a2a", cabeloEstilo: "curto", oculos: true, camisa: "#2d3a52", calca: "#1d1d1d", tenis: "#fff" },
    luana:   { nome: "Luana", papel: "Core", corEtiqueta: "#ffc4a8",
      pele: "#e2b48e", cabelo: "#20140e", cabeloEstilo: "longo", oculos: true, camisa: "#6a6e3a", calca: "#151515", tenis: "#111" },
    lu:      { nome: "Lu", papel: "Irmã do Matheus", corEtiqueta: "#ffd27a",
      pele: "#dcae88", cabelo: "#1a110c", cabeloEstilo: "longo", camisa: "#151515", calca: "#2a2a2a", tenis: "#111" },
    lucas:   { nome: "Lucas Moura", papel: "Futebol", corEtiqueta: "#6fa8ff",
      pele: "#a8775a", cabelo: "#111", cabeloEstilo: "curto", barba: "cheia",
      camisa: "#1b2a55", calca: "#1b2a55", tenis: "#fff", numero: "7" },
    david:   { nome: "David Luiz", papel: "Futebol", corEtiqueta: "#6fd0ff",
      pele: "#d8a67e", cabelo: "#3a2616", cabeloEstilo: "cacheado", cabeloGrande: true, barba: "cheia",
      camisa: "#1d4fb8", calca: "#1d4fb8", tenis: "#fff", numero: "4" },
    maeGiu:  { nome: "Mãe da Giu", papel: "Família", corEtiqueta: "#ffe3f0",
      pele: "#e2b893", cabelo: "#6b5040", cabeloEstilo: "longo", camisa: "#c9a9b8", vestido: "#c9a9b8", tenis: "#b08a8a" },
    maeMatheus: { nome: "Mãe do Matheus", papel: "Família", corEtiqueta: "#fff0d0",
      pele: "#d2a07a", cabelo: "#3a2a20", cabeloEstilo: "longo", camisa: "#8fa58a", vestido: "#8fa58a", tenis: "#6b5a4a" },
    thiago: { nome: "Thiago", papel: "Melhor amigo", corEtiqueta: "#ffe066",
      pele: "#d2a07a", cabelo: "#1d1410", cabeloEstilo: "curto", barba: "cheia", camisa: "#e9dcc4", calca: "#4a4a4a", tenis: "#f2f2f2" },
    everaldo: { nome: "Everaldo", papel: "Amigo do Pará", corEtiqueta: "#ffd27a",
      pele: "#b98663", cabelo: "#151010", cabeloEstilo: "curto", barba: "cheia", camisa: "#2e6b4f", calca: "#2b2b2b", tenis: "#eee" },
    jogador: { nome: "Jogador", papel: "PSG", corEtiqueta: "#6fa8ff", pele: "#a8775a", cabelo: "#111", cabeloEstilo: "curto",
      camisa: "#1b2a55", faixa: "#d0102a", calca: "#1b2a55", tenis: "#fff", numero: "10" },
    carrillo: { nome: "Carrillo", papel: "Aces", corEtiqueta: "#ffd27a", pele: "#7a4e34", cabelo: "#111", cabeloEstilo: "dread",
      camisa: "#151515", calca: "#151515", tenis: "#fff" },
    andreas: { nome: "Andreas", papel: "Aces", corEtiqueta: "#9fe0a0", pele: "#d9a57f", cabelo: "#2a1d15", cabeloEstilo: "curto",
      camisa: "#1f7a3a", calca: "#f2f2f2", tenis: "#fff" },
    convidado: { nome: "", papel: "", corEtiqueta: "#fff", semEtiqueta: true,
      pele: "#d6a882", cabelo: "#2a1d15", cabeloEstilo: "curto", camisa: "#d9d3c4", calca: "#4a4a4a", tenis: "#ddd" }
  },

  /* Roupas no Pub (Homecoming): Giu com pontas rosa e saia xadrez, como na foto do palco */
  visuaisPub: {
    matheus: { camisa: "#f1ece2", regata: true, calca: "#3a3a3a" },   // regata branca, como nas fotos e no vídeo da noite
    giu: { pontas: "#e0457b", camisa: "#141414", saia: "#b3263a", xadrez: true }
  },

  /* ---------------- PUB: CENÁRIO (posições no mundo) ---------------- */
  cenario: {
    largura: 2400,
    inicioMatheus: 170,
    jean: 360, mesa: 580, luiz: 760, joao: 980, cabo: 1210, leo: 1300,
    caseMic: 1110, porta: 1420, pedestal: 1790, bateria: 2010
  },

  objetivos: {
    falarJean:    { texto: "Ande até o Jean e fale com ele.", botao: "Falar" },
    falarLuiz:    { texto: "Fale com o Luis (baixo).", botao: "Falar" },
    setlist:      { texto: "Organize o setlist na mesa do camarim.", botao: "Ver setlist" },
    falarJoao:    { texto: "Fale com o João (guitarra).", botao: "Falar" },
    pegarCabo:    { texto: "Pegue o cabo perto da porta do palco.", botao: "Pegar cabo" },
    entregarCabo: { texto: "Leve o cabo para o João.", botao: "Entregar" },
    falarLeo:     { texto: "Fale com o Léo (bateria).", botao: "Falar" },
    pegarMic:     { texto: "Pegue o microfone no case.", botao: "Pegar mic" },
    colocarMic:   { texto: "Leve o microfone até o pedestal no palco.", botao: "Colocar mic" },
    irPalco:      { texto: "Tudo pronto. Comece o show!", botao: "Começar show" }
  },

  setlistBloco1: ["Vowe: É Só o Começo", "Forfun: História de Verão", "Dead Fish: Bem-vindo ao Clube"],
  setlistDica: "Dica: o show abre com “É Só o Começo”.",

  dialogos: {
    jeanInicio: [
      { quem: "narrador", texto: "6 de dezembro de 2025. New York Pub, Poços de Caldas. O palco que a VOLGAN sonhava desde 2009." },
      { quem: "jean", texto: "Vamos deixar tudo pronto pro show? Passa no Luis, no João e no Léo." }
    ],
    luizPedido: [
      { quem: "luiz", texto: "As folhas do setlist embaralharam. Coloca o primeiro bloco na ordem? Tá na mesa." }
    ],
    joaoPedido: [
      { quem: "joao", texto: "Minha guitarra tá sem cabo. Acho que ficou perto da porta do palco." }
    ],
    joaoOk: [
      { quem: "joao", texto: "Valeu! Agora sim." }
    ],
    leoPedido: [
      { quem: "leo", texto: "O microfone tá no case aqui do lado. Leva pro pedestal?" }
    ],
    jeanPronto: [
      { quem: "jean", texto: "Setlist, cabo, microfone. Tudo certo. É a sua noite, irmão." },
      { quem: "jean", texto: "E tenta ficar de camisa pelo menos na primeira música." }
    ]
  },

  falas: {
    botaACamisa: "Bota a camisa, Matheus.",        // frase interna confirmada
    camisaDeVolta: "Camisa de volta. O Jean respira aliviado.",
    luizSetlistOk: "Agora sim!",
    micOk: "Microfone no pedestal.",
    ocioso: {
      jean: "Um de cada vez. Olha o objetivo lá em cima.",
      luiz: "Tô afinando aqui.",
      joao: "Tô de olho no som.",
      leo: "Baquetas na mão, só esperando."
    },
    pronto: "Pronto pra tocar!",
    plateiaCamisa: "A plateia vai à loucura!"
  },

  textos: {
    showComeca: "Agora é com a VOLGAN.",
    ritmoDica: "Opcional: toque ♪ quando a nota chegar no círculo.",
    surpresa: "E aquela noite ainda tinha uma surpresa.",
    giuTitulo: "Surpresa!",
    giuTexto: "A Giu sobe ao palco e canta com a VOLGAN.",
    pubFimTitulo: "Homecoming!",
    pubFimTexto: "Um sonho realizado com a banda e os amigos, no New York Pub.",
    finalFotoLegenda: "Homecoming · New York Pub"
  },

  /* ---------------- CONQUISTAS (todas opcionais) ---------------- */
  conquistas: {
    vestido:  { nome: "Bota a camisa", desc: "Preparou o show inteiro sem tirar a camisa." },
    teimoso:  { nome: "O Jean avisou", desc: "Tirou a camisa 3 vezes nos bastidores." },
    tradicao: { nome: "Tradição mantida", desc: "Tirou a camisa no palco." },
    ritmo:    { nome: "No tempo certo", desc: "Acertou 8 notas no show." },
    criador:  { nome: "Modo criador", desc: "Usou os poderes 15 vezes." },
    album:    { nome: "Álbum de família", desc: "Abriu 10 fotos pelo caminho." },
    conselho: { nome: "Bom de conversa", desc: "Ouviu, perguntou e chamou alguém para ajudar." },
    heroi:    { nome: "Herói da própria história", desc: "Completou os 10 capítulos." }
  },

  /* ---------------- MÍDIAS DO PUB ---------------- */
  midia: {
    videoGiu: null,                                   // ex.: "giu_palco.mp4"
    imagemGiu: "homecoming_giu.jpg",
    fotoFinal: "final_galera.jpg",
    fotoTitulo: "matheus_capa.png",
    cartazPub: "homecoming_arte.jpg",    // cartaz na parede do camarim
    telaoPub: "volgan_arte.jpg",         // arte no telão do palco
    gen2k: "gen2k.jpg",                   // cartaz na fase 6
    logoVolgan: null,
    audioShow: null,   // áudio autorizado, ex.: "show.mp3". null = rock sintetizado próprio
    musicaGiu: "misery_business.mp3",   // Paramore - Misery Business, toca quando a Giu entra no palco
    musicaGiuInicio: 100                // segundo em que começa (1:40)
  },

  /* ---------------- MÚSICA ----------------
     Trilha de cada capítulo: rock instrumental gerado pelo próprio jogo (sem direitos de terceiros).
     Álbum final: piano original composto para o jogo (album.mp3).
     "🎵 Músicas desta fase": vídeos oficiais do YouTube, abertos num player visível com o jogo pausado. */
  musicaHomenagem: "saturn.mp3",         // Sleeping At Last - Saturn, por baixo do texto escrito pro Matheus
  musicaAlbum: "so_os_loucos_sabem.mp3",   // Charlie Brown Jr., escolhida pelo Jean para o álbum final
  musicas: [
    { fase: 1, titulo: "Zeh Nery e VOLGAN ao vivo no NY Pub", artista: "Volgan Rock (canal da banda)", youtubeId: "3a5deMW-3Gc" },
    { fase: 6, titulo: "É Só o Começo", artista: "Vowe", youtubeId: "5tO1d4o3a8o" },
    { fase: 6, titulo: "História de Verão", artista: "Forfun", youtubeId: "O-mCO1L7jbY" },
    { fase: 6, titulo: "Bem-vindo ao Clube", artista: "Dead Fish", youtubeId: "kG8MvPz2sn4" },
    { fase: 7, titulo: "Zeh Nery canta “Amor e Ódio” com a VOLGAN", artista: "Volgan Rock", youtubeId: "a4dKEHF7F_E" },
    { fase: 7, titulo: "Zeh Nery e VOLGAN ao vivo no NY Pub", artista: "Volgan Rock", youtubeId: "3a5deMW-3Gc" },
    { fase: 10, titulo: "High Hopes", artista: "Panic! At The Disco", youtubeId: "IPXIgEAGe4U" }
  ],

  /* ---------------- PODERES (linguagem de fantasia da homenagem) ---------------- */
  poderes: [
    { id: "criar", nome: "Criar", desc: "Uma ideia ganha forma.", cor: "#f6b826" },
    { id: "junto", nome: "Construir junto", desc: "Duas contribuições viram uma.", cor: "#ff6fb5" },
    { id: "experimentar", nome: "Experimentar", desc: "Novas ferramentas, novas possibilidades.", cor: "#3fa9ff" },
    { id: "cuidar", nome: "Cuidar", desc: "Presença que mantém a família junta.", cor: "#ff9e5a" },
    { id: "ouvir", nome: "Escolher e ouvir", desc: "Consultar alguém muda o caminho.", cor: "#8fd3c8" },
    { id: "reunir", nome: "Reunir", desc: "As pessoas chegam e ficam.", cor: "#c59bff" },
    { id: "incentivar", nome: "Incentivar", desc: "Depois da conversa, o outro age.", cor: "#9fe0a0" },
    { id: "realizar", nome: "Realizar em conjunto", desc: "Muita gente fazendo algo acontecer.", cor: "#ffffff" }
  ],

  /* ---------------- CAPÍTULOS ----------------
     capa: foto de abertura. frase: aparece ao final, com as fotos do capítulo.
     Passos: alvo, obj (objetivo), rotulo (botão), efeito, falas, bolhas, escolha, repetir, timing,
     viagem, video, galeria, vestir, carrega, solta, segue, chegam, revelar, ativa, poder. */
  fases: [
    { id: 1, nome: "Origens", sub: "Poços · Barcarena · Poços", ano: "anos 2000", icone: "🏡", poder: "criar",
      capa: { foto: "antiga_2.jpg", legenda: "Poços de Caldas. Os primeiros sonhos." },
      frase: "Você ainda não sabia onde tudo isso ia dar. Mas já tinha coisas que queria fazer acontecer.",
      fotos: ["antiga_2", "thiago_antiga_camisetas", "antiga_1", "antiga_joao"],
      trilha: { bpm: 112, acordes: [110, 82.41, 92.5, 73.42] },
      cenas: [
        { id: "1A", fundo: "pocosBelem", largura: 2300, ambiente: "passaros",
          matheus: { camisa: "#1a1a1a", cabeloEstilo: "franja", barba: null, brinco: true },
          atores: [{ id: "thiago", x: 330, dir: -1, visual: { barba: null, camisa: "#151515", calca: "#555" } }, { id: "everaldo", x: 1300, dir: -1 }],
          objetos: [
            { id: "ponto1", tipo: "pontoOnibus", x: 560, texto: "PARA BARCARENA" },
            { id: "rio", tipo: "por", x: 1080 },
            { id: "ponto2", tipo: "pontoOnibus", x: 1560, texto: "PARA POÇOS" },
            { id: "placa", tipo: "marco", x: 2120, texto: "POÇOS DE NOVO", cor: "#2f7d4f" }
          ],
          intro: [{ quem: "narrador", texto: "Toda história de herói começa em algum lugar. A dele começa em Poços de Caldas." }],
          passos: [
            { alvo: "thiago", obj: "Seu melhor amigo está te esperando.", rotulo: "Chegar junto 🤜🤛", efeito: "coracao",
              bolhas: [{ quem: "thiago", texto: "Bora, irmão!" }], galeria: ["thiago_antiga_camisetas", "thiago_antiga_porta"],
              falas: [{ quem: "citacao", texto: "“Não importa o tempo, a distância ou o que a vida nos trouxe. No fundo, quando estamos juntos, ainda somos os mesmos.”", autor: "Matheus, sobre o Thiago · Instagram, 2025" }] },
            { alvo: "ponto1", obj: "Mudança: pegue o ônibus para Barcarena, no Pará.", rotulo: "Mudar pro Pará 🚌", viagem: { veiculo: "onibus", ate: 980 } },
            { alvo: "rio", obj: "Barcarena: veja o pôr do sol no rio.", rotulo: "Olhar o rio", efeito: "brilho", ativa: "rio", aviso: "Barcarena, Pará." },
            { alvo: "everaldo", obj: "Um amigo pra vida inteira.", rotulo: "Chegar junto", efeito: "coracao", bolhas: [{ quem: "everaldo", texto: "🤝" }] },
            { alvo: "ponto2", obj: "Hora de voltar.", rotulo: "Voltar pra Poços 🚌", viagem: { veiculo: "onibus", ate: 1980 } },
            { alvo: "placa", obj: "Poços de novo.", rotulo: "Chegar", efeito: "brilho",
              falas: [{ quem: "narrador", texto: "Poços. Barcarena. Poços de novo." }] }
          ] },
        { id: "1B", fundo: "unifaeCafe", largura: 1650, ambiente: "cafe",
          matheus: { camisa: "#1a1a1a", cabeloEstilo: "franja", barba: null, brinco: true },
          atores: [
            { id: "luiz", x: 820, dir: 1, visual: { cabeloEstilo: "franja", instrumento: null, camisa: "#eeeeee", regata: true } },
            { id: "joao", x: 960, dir: -1, visual: { instrumento: null, camisa: "#c22", cabeloEstilo: "franja" } },
            { id: "giu", x: 1480, dir: -1, visual: { camisa: "#2a2a2a" } }
          ],
          objetos: [{ id: "cartaz", tipo: "cartaz", x: 300 }, { id: "violao", tipo: "violao", x: 890 }],
          extras: [{ tipo: "album", x: 560, foto: "antiga_1.jpg", legenda: "Música desde cedo" }],
          passos: [
            { alvo: "cartaz", obj: "Faculdade de Publicidade: crie o primeiro cartaz.", rotulo: "Criar ✦", poder: "criar",
              escolha: { pergunta: "Que cara vai ter o cartaz?", opcoes: [
                { texto: "🎸 Rock, preto e amarelo", estilo: "rock" },
                { texto: "🌅 Cores quentes, cara de verão", estilo: "verao" } ] },
              efeito: "poder", ativa: "cartaz", aviso: "A ideia saiu do papel e foi parar nas paredes." },
            { alvo: "violao", obj: "Na mesa do café, pegue o violão.", rotulo: "Tocar ♪", efeito: "notas", ativa: "violao",
              bolhas: [{ quem: "luiz", texto: "🤘" }, { quem: "joao", texto: "♪♪" }],
              falas: [{ quem: "narrador", texto: "2009. Uma mesa de café, um violão e um sonho: um dia tocar no New York Pub." }] },
            { alvo: "giu", obj: "Alguém especial está chegando.", rotulo: "Falar", efeito: "coracao",
              falas: [{ quem: "narrador", texto: "Publicidade, música e um encontro que mudou os próximos planos." }] }
          ] }
      ] },

    { id: 2, nome: "França", sub: "Paris · Orléans · uma vida juntos", ano: "2012", icone: "🗼", poder: "junto",
      capa: { foto: "paris_sim_2012.jpg", legenda: "Paris. O sim." },
      frase: "Vocês foram aprendendo enquanto construíam uma vida juntos.",
      fotos: ["paris_sim_2012", "obra_2012_b", "obra_2012_a", "eiffel_inverno_2017", "franca_castelo", "paris_outono"],
      trilha: { bpm: 104, acordes: [87.31, 65.41, 98.0, 73.42] },
      cenas: [
        { id: "2V", cinematica: "voo", texto: "Destino: França." },
        { id: "2A", fundo: "paris", largura: 2100, ambiente: "cidade",
          matheus: { camisa: "#22283a", regata: false, mangas: "#22283a", calca: "#22283a", tenis: "#222", gravata: "#ddd" },
          atores: [{ id: "giu", x: 150, dir: 1, segue: true, visual: { camisa: "#f1e6dc", vestido: "#f1e6dc", buque: true } }],
          objetos: [
            { id: "consulado", tipo: "consulado", x: 430 },
            { id: "kfc", tipo: "kfc", x: 1080 },
            { id: "torre", tipo: "trocadero", x: 1800 }
          ],
          intro: [{ quem: "narrador", texto: "22 de março de 2012. Uma manhã em Paris." }],
          passos: [
            { alvo: "consulado", obj: "No consulado, digam o sim juntos.", rotulo: "Dizer sim 💍", poder: "junto", efeito: "confete",
              bolhas: [{ quem: "giu", texto: "Sim! ♥" }], aviso: "Casados no civil. 22.03.2012." },
            { alvo: "kfc", obj: "Comemorem do jeito de vocês.", rotulo: "Comemorar no KFC", efeito: "brilho",
              bolhas: [{ quem: "giu", texto: "🍗😄" }] },
            { alvo: "torre", obj: "Caminhem pela cidade até a torre.", rotulo: "Olhar a torre", efeito: "luzes", ativa: "torre",
              falas: [{ quem: "narrador", texto: "O sim foi numa manhã no consulado. Depois, KFC e uma caminhada pela cidade, sem imaginar até onde aquele sim ia levar." }],
              galeria: ["paris_sim_2012"] }
          ] },
        { id: "2B", fundo: "orleans", largura: 2250, ambiente: "cidade",
          matheus: { camisa: "#1d2a44", regata: false, mangas: "#1d2a44", calca: "#3b4a6b", tenis: "#ddd" },   // jaqueta azul-marinho, como nas fotos de 25/04/2012
          atores: [{ id: "giu", x: 220, dir: 1, visual: { camisa: "#3a2a2a", bone: null } }],
          objetos: [
            { id: "casa", tipo: "cama", x: 330 },
            { id: "parede", tipo: "parede", x: 820 },
            { id: "porta", tipo: "porta", x: 1220, texto: "VESTIÁRIO" },
            { id: "balcao", tipo: "balcao", x: 1700 }
          ],
          intro: [{ quem: "narrador", texto: "Orléans. A vida começou num apartamento de um cômodo." }],
          passos: [
            { alvo: "casa", obj: "Bom dia. Café rápido e trabalho.", rotulo: "Sair pro trabalho", bolhas: [{ quem: "giu", texto: "Vai lá! ☕" }], efeito: "coracao" },
            { alvo: "parede", obj: "Na obra: assente os tijolos.", rotulo: "Assentar tijolo 🧱", repetir: { n: 6, objeto: "parede", som: "thud" },
              aviso: "Tijolo por tijolo.", galeria: ["obra_2012_a", "obra_2012_b", "obra_2012_c"] },
            { alvo: "porta", obj: "Fim do turno. Troque de roupa.", rotulo: "Trocar de turno", efeito: "troca",
              vestir: { bone: "#d0202a", camisa: "#2a2a2a", mangas: null, regata: false, calca: "#222" }, mover: { giu: 1950 },
              aviso: "Próximo turno: McDonald’s." },
            { alvo: "balcao", obj: "Atendam juntos: ele no balcão, a Giu no McCafé.", rotulo: "Atender", sequencia: "pedido", poder: "junto",
              falas: [{ quem: "narrador", texto: "A vida de casados começou longe de casa: tijolos na obra, cafezinhos no McCafé." }] }
          ] }
      ] },

    { id: 3, nome: "Do expediente ao PSG", sub: "Futebol, câmera e oportunidades", ano: "anos 2010", icone: "⚽", poder: "experimentar",
      capa: { foto: "psg_estadio.jpg", legenda: "Parc des Princes." },
      frase: "Naquele dia, você chegou com o uniforme do trabalho. E encontrou outras possibilidades para o seu trabalho.",
      fotos: ["psg_estadio"],
      trilha: { bpm: 128, acordes: [82.41, 98.0, 110, 73.42] },
      cenas: [
        { id: "3A", fundo: "tunelPSG", largura: 2000, ambiente: "torcida",
          matheus: { bone: "#d0202a", camisa: "#2a2a2a", regata: false, calca: "#222", carrega: "camera" },
          atores: [{ id: "lucas", x: 1380, dir: -1, visual: { faixa: "#d0102a", papel: "PSG" } }],
          objetos: [{ id: "luz", tipo: "saidaTunel", x: 900 }, { id: "gol", tipo: "gol", x: 1820 }],
          extras: [
            { tipo: "cartao", x: 1600, titulo: "Outro dia, outra história", texto: "Teve também um jantar com jogadores ao lado do Lucas Moura. Um episódio diferente do dia do uniforme." },
            { tipo: "cartao", x: 1960, titulo: "Bastidores", texto: "Em 2025, ele completou 10 anos no marketing esportivo. No caminho, gravou com Sergio Ramos e Marquinhos para o PSG e foi eleito pelo Facebook o melhor criador de conteúdo esportivo do mundo (2018/19)." }
          ],
          passos: [
            { alvo: "luz", obj: "Atravesse o túnel.", auto: true, efeito: "estadio", ativa: "luz",
              falas: [{ quem: "narrador", texto: "Ele chegou ao PSG ainda com o uniforme do McDonald’s." }] },
            { alvo: "lucas", obj: "Enquadre o Lucas Moura.", rotulo: "Enquadrar 🎥", poder: "experimentar",
              timing: { titulo: "Enquadrar", instr: "Toque quando o Lucas estiver dentro do quadro." }, efeito: "rec" },
            { alvo: "lucas", obj: "Comece a entrevista.", rotulo: "Entrevistar 🎙️",
              escolha: { pergunta: "Primeira pergunta?", opcoes: [
                { texto: "Como foi o treino hoje?", bolhas: [{ quem: "lucas", texto: "👍 Pesado, mas bom!" }] },
                { texto: "Um recado pra torcida?", bolhas: [{ quem: "lucas", texto: "❤️💙 Allez Paris!" }] } ] }, efeito: "rec" },
            { alvo: "gol", obj: "Registre o gol.", rotulo: "Registrar o gol 📸",
              timing: { titulo: "No ângulo", instr: "Toque quando a bola chegar na rede.", tipo: "chute" }, efeito: "flash",
              falas: [{ quem: "narrador", texto: "Lucas Moura: o primeiro jogador com quem ele trabalhou. Novos trabalhos, viagens e encontros." }] }
          ] }
      ] },

    { id: 4, nome: "Família crescendo", sub: "Lys e Luca", ano: "2017 · 2020", icone: "👶", poder: "cuidar",
      capa: { foto: "lys_1ano.jpg", legenda: "Lys." },
      frase: "Os planos continuaram. E passaram a incluir acompanhar vocês crescendo.",
      fotos: ["lys_1ano", "matheus_lys_2018", "luca_recem", "familia_4_2020", "natal_2020", "neve_criancas", "franca_familia_2020"],
      trilha: { bpm: 92, acordes: [130.81, 98.0, 110, 87.31] },
      cenas: [
        { id: "4A", fundo: "quartoBebe", largura: 1300, ambiente: "noite",
          matheus: { camisa: "#6b4a5a", regata: false, mangas: "#222", gorro: "#7a2a4a", barba: "bigode", calca: "#222" },
          atores: [{ id: "giu", x: 680, dir: -1, visual: { camisa: "#151515", saia: "#f2c230" } },
            { id: "lys", x: 780, oculto: true, visual: { pequeno: true, camisa: "#f4b6c8" } }],
          objetos: [{ id: "berco", tipo: "berco", x: 760 }],
          intro: [{ quem: "narrador", texto: "3 de setembro de 2017, 18h03." }],
          passos: [
            { alvo: "berco", obj: "Conheça a Lys.", rotulo: "Segurar a Lys 💛", poder: "cuidar", efeito: "coracao", vestir: { bebe: "#f7d6e6" },
              aviso: "Lys · 03.09.2017", galeria: ["lys_1ano", "matheus_lys_2018"] },
            { alvo: "berco", obj: "O tempo passa rápido.", rotulo: "Ver ela crescer", efeito: "brilho", vestir: { bebe: null },
              chegam: ["lys"], segue: "lys" }
          ] },
        { id: "4D", fundo: "set", largura: 1300, ambiente: "estudio",
          matheus: { camisa: "#151515", regata: false, calca: "#2b2b2b", carrega: "camera", gorro: "#7a2a4a" },
          atores: [{ id: "david", x: 820, dir: -1 }],
          intro: [{ quem: "narrador", texto: "Entre fraldas e madrugadas, o trabalho também cresceu." }],
          passos: [
            { alvo: "david", obj: "Mais trabalhos com o David Luiz.", rotulo: "📸 Fotografar", poder: "experimentar",
              timing: { titulo: "Retrato", instr: "Toque quando a luz estiver no ponto." }, efeito: "flash",
              bolhas: [{ quem: "david", texto: "Ficou top! 🙌" }] },
            { alvo: "david", obj: "Agora, um vídeo.", rotulo: "● Gravar", efeito: "rec",
              falas: [{ quem: "narrador", texto: "Trabalho com o David Luiz de dia, a Lys crescendo em casa." }] }
          ] },
        { id: "4B", fundo: "neve", largura: 1400, ambiente: "neve",
          matheus: { camisa: "#151515", regata: false, mangas: "#151515", gorro: "#2a3a6a", oculos: true, calca: "#151515" },
          atores: [
            { id: "giu", x: 520, dir: -1, visual: { camisa: "#c4232f", mangas: "#c4232f", calca: "#c4232f", cabelo: "#8a5a3a" } },
            { id: "lys", x: 300, dir: 1, segue: true, visual: { pequeno: true, camisa: "#f4b6c8", gorro: "#d9407a" } },
            { id: "luca", x: 600, oculto: true, visual: { pequeno: true, camisa: "#2a3a8a", gorro: "#cfcfcf" } }
          ],
          objetos: [{ id: "boneco", tipo: "bonecoNeve", x: 980 }],
          passos: [
            { alvo: "giu", obj: "Chegou mais alguém na família.", rotulo: "Conhecer o Luca 💙", efeito: "coracao", chegam: ["luca"], segue: "luca",
              aviso: "Luca · 15.06.2020", galeria: ["luca_recem", "familia_4_2020", "natal_2020"] },
            { alvo: "boneco", obj: "Montem um boneco de neve juntos.", rotulo: "Montar ☃️", repetir: { n: 3, objeto: "boneco", som: "pega" }, efeito: "brilho",
              falas: [{ quem: "narrador", texto: "Os planos continuaram, agora em quatro." }] }
          ] }
      ] },

    { id: 5, nome: "A volta", sub: "Escolha e retorno", ano: "anos 2020", icone: "✈️", poder: "ouvir",
      capa: { foto: "franca_familia_2020.jpg", legenda: "França. Antes da volta." },
      frase: "Voltar também foi uma escolha sobre a vida que vocês queriam construir dali em diante.",
      fotos: ["franca_familia_2020", "paris_outono"],
      trilha: { bpm: 84, acordes: [110, 87.31, 130.81, 98.0], calma: true },
      cenas: [
        { id: "5A", fundo: "viagens", largura: 1500, ambiente: "noite",
          matheus: { camisa: "#3b4252", regata: false, mangas: "#3b4252", calca: "#2b2b2b" },
          atores: [{ id: "giu", x: 1450, oculto: true, visual: { camisa: "#4a3a4a", mangas: "#4a3a4a", cabelo: "#8a5a3a" } }],
          objetos: [{ id: "janela", tipo: "janela", x: 1240 }, { id: "mesa", tipo: "convite", x: 1380 }],
          passos: [
            { alvo: "janela", obj: "Caminhe.", auto: true,
              falas: [{ quem: "narrador", texto: "Muitas viagens, muito trabalho, pouco tempo em casa. Entre tantas viagens, também houve dias difíceis." }] },
            { alvo: "janela", obj: "O que fazer agora?", rotulo: "Pensar", poder: "ouvir",
              escolha: { pergunta: "Antes de decidir:", opcoes: [
                { texto: "💬 Conversar com a Giu", chegam: ["giu"], bolhas: [{ quem: "giu", texto: "Tô aqui. ♥" }] },
                { texto: "📞 Ligar para um amigo", bolhas: [{ quem: "matheus", texto: "📞 Posso te contar uma coisa?" }], chegam: ["giu"] } ] },
              falas: [{ quem: "citacao", texto: "“Quando eu pensei em parar, você falou em continuar. Quando eu duvidei, você acreditou.”", autor: "Matheus, sobre a Giu · Instagram, 22/03/2026" }] },
            { alvo: "mesa", obj: "O Andreas está indo para o Brasil.", rotulo: "Decidir 🇧🇷", efeito: "brilho", ativa: "mesa",
              falas: [{ quem: "narrador", texto: "Ele já trabalhava com o Andreas Pereira, que estava vindo para o Brasil." },
                { quem: "narrador", texto: "Ninguém decidiu por ele. Voltar foi escolha dele: bora junto de novo." }] }
          ] },
        { id: "5B", fundo: "aeroporto", largura: 1300, ambiente: "aeroporto",
          matheus: { camisa: "#151515", regata: false, mangas: "#151515", calca: "#151515", oculos: true },
          atores: [
            { id: "giu", x: 200, dir: 1, segue: true, visual: { camisa: "#c4232f", calca: "#c4232f", cabelo: "#8a5a3a" } },
            { id: "lys", x: 150, dir: 1, segue: true, visual: { pequeno: true, camisa: "#f4b6c8", mochila: true } },
            { id: "luca", x: 110, dir: 1, segue: true, visual: { pequeno: true, camisa: "#2a3a8a" } }
          ],
          objetos: [{ id: "malas", tipo: "malas", x: 520 }, { id: "portao", tipo: "portao", x: 1120 }],
          passos: [
            { alvo: "malas", obj: "Arrumem as malas, cada um ajuda.", rotulo: "Pegar mala 🧳", repetir: { n: 3, objeto: "malas", som: "pega" }, poder: "cuidar",
              bolhas: [{ quem: "lys", texto: "Eu levo a minha!" }] },
            { alvo: "portao", obj: "Embarquem juntos.", rotulo: "Embarcar juntos ✈️", efeito: "brilho" }
          ] },
        { id: "5V", cinematica: "volta", texto: "França → Brasil" },
        { id: "5C", fundo: "chegada", largura: 1200, ambiente: "passaros",
          matheus: { camisa: "#151515", regata: false, mangas: "#151515", calca: "#151515", oculos: true, carrega: "mala" },
          atores: [
            { id: "giu", x: 120, dir: 1, segue: true, visual: { camisa: "#c4232f", calca: "#c4232f", cabelo: "#8a5a3a" } },
            { id: "lys", x: 80, dir: 1, segue: true, visual: { pequeno: true, camisa: "#f4b6c8", mochila: true } },
            { id: "luca", x: 50, dir: 1, segue: true, visual: { pequeno: true, camisa: "#2a3a8a" } }
          ],
          objetos: [{ id: "chegada", tipo: "bemvindo", x: 900 }],
          passos: [
            { alvo: "chegada", obj: "Cheguem em casa.", auto: true, efeito: "confete", solta: true,
              falas: [{ quem: "narrador", texto: "De volta ao Brasil. Todos juntos." }] }
          ] },
        { id: "5D", fundo: "apartamento", largura: 1200, ambiente: "casa",
          matheus: { camisa: "#151515", regata: true },
          atores: [
            { id: "giu", x: 900, dir: -1, visual: { camisa: "#e8d6c8", cabelo: "#d8b47a" } },
            { id: "lys", x: 980, dir: -1, visual: { camisa: "#b9a3e8" } },
            { id: "luca", x: 1040, dir: -1, visual: { camisa: "#3a5ab8" } }
          ],
          objetos: [{ id: "caixas", tipo: "caixas", x: 520 }],
          intro: [{ quem: "narrador", texto: "Primeiro, um apartamento no Brasil." }],
          passos: [
            { alvo: "caixas", obj: "Desencaixote a mudança.", rotulo: "Abrir caixa 📦", repetir: { n: 3, objeto: "caixas", som: "pega" }, efeito: "brilho",
              bolhas: [{ quem: "luca", texto: "Achei meus brinquedos!" }] }
          ] }
      ] },

    { id: 6, nome: "Homecoming", sub: "New York Pub · 06.12.2025", ano: "dez 2025", icone: "🎸", pub: true, poder: "reunir",
      capa: { foto: "homecoming_banda.jpg", legenda: "Math's Bday · Homecoming." },
      frase: "Naquela noite, tinha muita gente fazendo parte de algo que era importante para você.",
      fotos: ["homecoming_banda", "homecoming_giu", "homecoming_pai", "homecoming_espelho", "jean_matheus", "final_galera"],
      video: { src: "homecoming_show.mp4", titulo: "A noite de verdade", texto: "Registro real do show no New York Pub." },
      trilha: { bpm: 120, acordes: [82.41, 65.41, 98.0, 73.42] } },

    { id: 7, nome: "Gen2K e VOLGAN", sub: "Festival e músicas próprias", ano: "mai–jul 2026", icone: "🤘", poder: "incentivar",
      capa: { foto: "gen2k_publico.jpg", legenda: "Gen2K · New York Pub Festival." },
      frase: "Quanto mais gente participa, mais possibilidades vocês conseguem colocar de pé.",
      fotos: ["gen2k_publico", "gen2k_bandas", "gen2k_palco", "show_regata", "show_semcamisa", "volgan_arte"],
      trilha: { bpm: 132, acordes: [82.41, 110, 98.0, 73.42] },
      cenas: [
        { id: "8A", fundo: "festival", largura: 1700, ambiente: "torcida",
          matheus: { camisa: "#151515", regata: true },
          objetos: [{ id: "mesaHaven", tipo: "mesaIdeia", x: 260 }, { id: "lineup", tipo: "lineup", x: 900 }, { id: "palco", tipo: "palcoFest", x: 1450 }],
          intro: [{ quem: "narrador", texto: "Gen2K nasceu de uma conversa numa terça-feira à noite." }],
          passos: [
            { alvo: "mesaHaven", obj: "Tenha a ideia do festival.", rotulo: "Ter a ideia ✦", efeito: "poder", ativa: "mesaHaven" },
            { alvo: "lineup", obj: "Chame as bandas.", rotulo: "Chamar banda 📣", repetir: { n: 6, objeto: "lineup", som: "ok" }, poder: "incentivar",
              aviso: "A Halfpipe foi a primeira a topar." },
            { alvo: "palco", obj: "Abra o festival.", rotulo: "Abrir o Gen2K 🔥", efeito: "luzes", ativa: "palco",
              falas: [{ quem: "narrador", texto: "Ela só virou realidade porque muita gente resolveu acreditar junto." }] }
          ] },
        { id: "8B", fundo: "estudio", largura: 1300, ambiente: "estudio",
          matheus: { camisa: "#151515", regata: true },
          atores: [{ id: "luiz", x: 520, dir: 1 }, { id: "joao", x: 760, dir: -1 }, { id: "leo", x: 1000, dir: -1 }, { id: "isaac", x: 260, dir: 1 }],
          objetos: [{ id: "microfone", tipo: "microfoneEstudio", x: 640 }],
          passos: [
            { alvo: "microfone", obj: "Gravem juntos as músicas da VOLGAN.", rotulo: "Gravar 🔴", efeito: "equipe", ativa: "microfone", poder: "incentivar",
              bolhas: [{ quem: "isaac", texto: "Gravando! 🎧" }],
              falas: [{ quem: "narrador", texto: "Julho de 2026: as músicas que nasceram no violão, 15 anos antes, finalmente gravadas." }] }
          ] }
      ] },

    { id: 8, nome: "Casa cheia", sub: "A casa, o Core e os encontros", ano: "jun–ago 2026", icone: "🏠",
      capa: { foto: "pai_filhos_casa.jpg", legenda: "Em casa." },
      frase: "Com o tempo, aquela casa passou a fazer parte da história de outras pessoas também.",
      fotos: ["pai_filhos_casa", "thiago_shopping", "thiago_brasil", "familia_passeio", "core"],
      trilha: { bpm: 108, acordes: [98.0, 123.47, 110, 82.41] },
      cenas: [
        { id: "6B", fundo: "casaPiscina", largura: 2000, ambiente: "piscina", camisa: true,
          matheus: { camisa: "#151515", regata: true },
          atores: [
            { id: "giu", x: 1700, dir: -1, visual: { camisa: "#e8d6c8", cabelo: "#d8b47a" } },
            { id: "lys", x: 1500, dir: 1, visual: { camisa: "#b9a3e8" }, acao: "nadar" },
            { id: "luca", x: 1600, dir: -1, visual: { camisa: "#3a5ab8" }, acao: "nadar" },
            { id: "jean", x: 2000, oculto: true, visual: { camisa: "#151515" } },
            { id: "julia", x: 2000, oculto: true }, { id: "kevin", x: 2000, oculto: true },
            { id: "isaac", x: 2000, oculto: true }, { id: "luana", x: 2000, oculto: true },
            { id: "thiago", x: 2000, oculto: true }
          ],
          objetos: [{ id: "portao", tipo: "portaCasa", x: 260 }, { id: "tv", tipo: "tv", x: 700 }, { id: "violao", tipo: "violao", x: 1020 }],
          intro: [{ quem: "narrador", texto: "2026. Uma casa maior, com piscina e porta aberta." }],
          passos: [
            { alvo: "portao", obj: "Alguém tocou a campainha.", rotulo: "Abrir a porta 🚪", poder: "reunir",
              chegam: ["thiago", "jean", "julia", "kevin", "isaac", "luana"], posicoes: [420, 560, 620, 760, 820, 880], efeito: "brilho",
              bolhas: [{ quem: "thiago", texto: "Cheguei primeiro! 😄" }],
              aviso: "Chegaram o Thiago e o Core: Jean, Júlia, Kevin, Isaac e Luana." },
            { alvo: "tv", obj: "Dia de jogo. Ligue a TV.", rotulo: "Ligar o jogo 📺", ativa: "tv", efeito: "torcida",
              bolhas: [{ quem: "kevin", texto: "GOOOL! ⚽" }, { quem: "julia", texto: "🇧🇷🇧🇷" }],
              video: { src: "casa_jogo.mp4", titulo: "Jogo na casa do Matheus", texto: "Registro real: o Core assistindo ao jogo. Junho de 2026." } },
            { alvo: "violao", obj: "Pegue o violão.", rotulo: "Tocar ♪", efeito: "notas", ativa: "violao",
              bolhas: [{ quem: "isaac", texto: "Essa aí dá som! 🎧" }],
              video: { src: "casa_core.mp4", titulo: "Violão em casa", texto: "Registro real: agosto de 2026." } },
            { alvo: "jean", obj: "O Jean quer te mostrar uma ideia.", rotulo: "Conversar 💬", poder: "incentivar",
              escolha: { pergunta: "O Jean contou um plano novo. Como você ajuda?", opcoes: [
                { texto: "👂 Ouvir até o fim", bolhas: [{ quem: "jean", texto: "Faz sentido falando em voz alta." }] },
                { texto: "❓ Fazer perguntas", bolhas: [{ quem: "jean", texto: "Boa pergunta. Vou ajustar isso." }] },
                { texto: "🙋 Chamar o Thiago pra opinar", bolhas: [{ quem: "thiago", texto: "Dá pra começar pequeno." }] } ] },
              efeito: "incentivo",
              falas: [
                { quem: "matheus", texto: "E aquele meu plano? Me dá sua opinião sincera." },
                { quem: "jean", texto: "Você talvez nem lembre de algumas conversas. Eu lembro do que elas me ajudaram a fazer." } ] }
          ] }
      ] },

    { id: 9, nome: "14 anos do sim", sub: "Renovação de votos", ano: "ago 2026", icone: "💍", poder: "realizar",
      capa: { foto: "renovacao_cerimonia.jpg", legenda: "Renovação de votos. Agosto de 2026." },
      frase: "Desde aquele sim, vocês mudaram, tiveram filhos e construíram uma história. Em agosto, celebraram tudo isso juntos.",
      fotos: ["renovacao_cerimonia", "civil_2012", "renovacao_familia", "renovacao_bordado", "paris_14anos"],
      trilha: { bpm: 76, acordes: [130.81, 98.0, 110, 87.31], calma: true },
      cenas: [
        { id: "9A", fundo: "jardim", largura: 1300, flashback: "2012 → 2026 · 14 anos de casamento", ambiente: "passaros",
          matheus: { camisa: "#f6f2ea", regata: false, mangas: "#efe6d4", colete: "#efe6d4", calca: "#efe6d4", tenis: "#e8dcc4", barba: "bigode" },
          atores: [
            { id: "giu", x: 760, dir: -1, visual: { camisa: "#ffffff", vestido: "#ffffff", veu: true, pontas: null, tenis: "#fff", cabelo: "#ecd29a" } },
            { id: "lys", x: 700, dir: 1, visual: { camisa: "#fbf7ef", vestido: "#fbf7ef" } }, { id: "luca", x: 820, dir: -1 },
            { id: "maeMatheus", x: 470, revela: true, dir: 1 }, { id: "maeGiu", x: 1040, revela: true, dir: -1 },
            { id: "convidado", x: 250, revela: true, grupo: "Família", visual: { camisa: "#a7b8c9", calca: "#3a4250" } },
            { id: "convidado", x: 300, revela: true, visual: { camisa: "#e5c7a8", vestido: "#e5c7a8", cabeloEstilo: "longo" } },
            { id: "convidado", x: 360, revela: true, grupo: "Amigos do Pará", visual: { camisa: "#2e6b4f", calca: "#222" } },
            { id: "convidado", x: 410, revela: true, visual: { camisa: "#f0d27a", vestido: "#f0d27a", cabeloEstilo: "longo", cabelo: "#5a3a22" } },
            { id: "convidado", x: 1110, revela: true, grupo: "Melhores amigos", visual: { camisa: "#151515", calca: "#222", barba: "cheia" } },
            { id: "convidado", x: 1165, revela: true, visual: { camisa: "#b5c99a", vestido: "#b5c99a", cabeloEstilo: "longo" } },
            { id: "convidado", x: 1220, revela: true, grupo: "Amigos de todo o Brasil", visual: { camisa: "#7a8fb5", calca: "#2b2b2b" } }
          ],
          objetos: [{ id: "arco", tipo: "arco", x: 760 }],
          passos: [
            { alvo: "giu", obj: "Caminhe até a Giu.", rotulo: "Renovar os votos 💍", efeito: "confete", revelar: true, poder: "realizar",
              falas: [{ quem: "narrador", texto: "Em agosto de 2026, celebraram 14 anos de casamento, cercados por pessoas importantes." }] },
            { alvo: "giu", obj: "Um detalhe no colete.", rotulo: "Ver o bordado 🧵", bordado: true,
              galeria: ["renovacao_cerimonia", "renovacao_familia", "renovacao_bordado"] }
          ] }
      ] },

    { id: 10, nome: "Vox e Aces", sub: "Os projetos de agora", ano: "2026", icone: "🚀", poder: "realizar",
      capa: { foto: "vox_equipe.jpg", legenda: "Vox. Ideias virando trabalho." },
      frase: "Você foi encontrando pessoas com quem podia transformar ideias em trabalho. E esse trabalho abriu novas possibilidades para todos vocês.",
      fotos: ["vox_equipe", "aces_carrillo", "piquenique", "core"],
      trilha: { bpm: 118, acordes: [98.0, 73.42, 82.41, 65.41] },
      cenas: [
        { id: "10A", fundo: "vox", largura: 2000, ambiente: "estudio", camisa: true,
          matheus: { camisa: "#151515", regata: true },
          atores: [{ id: "gui", x: 520, dir: -1 }, { id: "isaac", x: 600, dir: -1 }, { id: "belle", x: 680, dir: -1 }, { id: "jean", x: 360, dir: 1 }],
          objetos: [{ id: "reuniao", tipo: "mesaReuniao", x: 520 },
            { id: "ollivia", tipo: "cliente", x: 1020, texto: "OLLIVIA", sub: "GASTRONOMIA", cor: "#3a4a2a" },
            { id: "melfiore", tipo: "cliente", x: 1380, texto: "MELFIORE", sub: "FITNESS · BEACH · CASUAL", cor: "#d99a8f" },
            { id: "torq", tipo: "cliente", x: 1740, texto: "TORQ", sub: "PERDIZES · SP", cor: "#231f1d" }],
          extras: [{ tipo: "cartao", x: 1900, titulo: "Em andamento", texto: "A Santa Casa aparece como uma conversa em andamento. Ainda não é um capítulo fechado." }],
          intro: [{ quem: "narrador", texto: "Vox: sócios, câmera, luz, som e muita ideia." }],
          passos: [
            { alvo: "reuniao", obj: "Reunião com os sócios da Vox.", rotulo: "Abrir a reunião", efeito: "equipe",
              bolhas: [{ quem: "jean", texto: "Bota a camisa, Matheus. 😅" }], aviso: "Dica: o botão 👕 também funciona aqui." },
            { alvo: "ollivia", obj: "Ollivia Gastronomia: entenda o que o cliente precisa.", rotulo: "Ouvir o cliente 👂",
              escolha: { pergunta: "O que o Ollivia quer mostrar primeiro?", opcoes: [
                { texto: "🍽️ A cozinha e os pratos" }, { texto: "🌿 Os jardins e o clima da casa" } ] },
              efeito: "equipe", ativa: "ollivia", aviso: "Primeiro cliente: Ollivia Gastronomia." },
            { alvo: "melfiore", obj: "Melfiore: criem a campanha juntos.", rotulo: "Criar com a equipe ✦", efeito: "equipe", ativa: "melfiore" },
            { alvo: "torq", obj: "Torq: um lançamento do zero.", rotulo: "Lançar a marca 🚀", efeito: "equipe", ativa: "torq",
              falas: [{ quem: "narrador", texto: "Ollivia, Melfiore e Torq: os primeiros contratos da Vox. Ideias que viraram trabalho de verdade." }] }
          ] },
        { id: "10B", fundo: "aces", largura: 1400, ambiente: "estudio",
          matheus: { camisa: "#151515", regata: true },
          atores: [{ id: "carrillo", x: 700, dir: -1 }, { id: "david", x: 900, dir: -1, visual: { camisa: "#151515", calca: "#151515", numero: null } }, { id: "andreas", x: 1100, dir: -1 }],
          objetos: [{ id: "rede", tipo: "rede", x: 380, nomes: ["Andreas Pereira", "Matheuzinho", "Vitinho · 2025", "Kenu Leandro · 2025", "Bastos · 2026", "Maurício · 2026"] }],
          extras: [{ tipo: "album", x: 1250, foto: "aces_carrillo.jpg", legenda: "Aces · Carrillo" },
            { tipo: "cartao", x: 200, titulo: "Aces Sport", texto: "Fundada por ele. Referência no Meta Summit London 2025 e citado entre os melhores gestores de atletas da Europa, o único sul-americano da lista." }],
          passos: [
            { alvo: "rede", obj: "Conecte a rede de atletas da Aces.", rotulo: "Conectar ✦", repetir: { n: 6, objeto: "rede", som: "ok" }, efeito: "poder",
              aviso: "2025 e 2026: mais atletas, mais histórias." },
            { alvo: "carrillo", obj: "Bastidores com o Carrillo.", rotulo: "● Gravar", efeito: "rec" },
            { alvo: "david", obj: "Um trabalho com o David Luiz.", rotulo: "📸 Fotografar", timing: { titulo: "Retrato", instr: "Toque quando a luz estiver no ponto." }, efeito: "flash" },
            { alvo: "andreas", obj: "Um projeto com o Andreas.", rotulo: "Criar junto ✦", efeito: "equipe",
              falas: [{ quem: "narrador", texto: "Mais atletas, mais histórias, mais gente crescendo junto." }] }
          ] }
      ] }
  ],

  /* ---------------- MENSAGEM FINAL DO JEAN (em trechos) ---------------- */
  homenagem: {
    titulo: "Feliz aniversário, Matheus!",
    trechos: [
      "Matheus, eu quis te dar esse presente porque tem muita coisa em você que eu admiro e queria colocar em palavras.",
      "O cara que cria, que trabalha, que sobe no palco. Mas também o pai da Lys e do Luca, o companheiro da Giu e o amigo que recebe a gente em casa e passa um tempo pensando nos nossos planos junto com a gente.",
      "Eu vejo o quanto você incentiva as pessoas. Às vezes, numa conversa que parece pequena para você, alguém encontra coragem para tentar uma coisa que vinha adiando. Eu me incluo nisso.",
      "Sua história se encontrou com a minha, e você se tornou muito importante para mim. Pelas conversas, pela confiança, pelas ideias que a gente divide e pelos momentos que já viveu junto.",
      "Quero te ver realizando seus sonhos, aproveitando sua família e continuando a descobrir o que faz sentido para você. E quero continuar por perto, participando, dando opinião e inventando mais coisas com você.",
      "Feliz aniversário, meu irmão. Te amo. Ainda quero viver muita coisa com você."
    ],
    assinatura: "Jean",
    fechamento: "O que a gente vai fazer junto daqui pra frente?"
  },

  /* ---------------- ÁLBUM DA VIDA (apresentação final, em loop) ---------------- */
  album: [
    { capitulo: "Origens" },
    { foto: "antiga_2", ano: "Poços de Caldas", texto: "Os primeiros sonhos tinham cabelo na cara e violão na mão." },
    { foto: "antiga_1", ano: "Juventude", texto: "A música chegou cedo e nunca mais foi embora." },
    { foto: "antiga_joao", ano: "Amigos de longa data", texto: "Alguns amigos atravessam todas as fases." },
    { foto: "thiago_antiga_camisetas", ano: "Thiago · melhor amigo", texto: "Camisetas iguais e uma amizade que atravessa tudo." },
    { foto: "thiago_antiga_porta", ano: "Antes de tudo", texto: "Antes de qualquer palco, a fé e os amigos." },
    { capitulo: "França" },
    { foto: "paris_sim_2012", ano: "22.03.2012 · Paris", texto: "Uma manhã no consulado. Um sim que mudou tudo." },
    { foto: "obra_2012_b", ano: "25.04.2012 · França", texto: "Tijolo por tijolo, sonhando com campanhas gigantes." },
    { foto: "eiffel_inverno_2017", ano: "Paris", texto: "Poucos recursos, muitos planos." },
    { foto: "franca_castelo", ano: "França", texto: "Aprendendo enquanto construíam." },
    { capitulo: "Família" },
    { foto: "lys_1ano", ano: "Lys · 03.09.2017", texto: "A menina mais linda chegou às 18h03." },
    { foto: "matheus_lys_2018", ano: "2018", texto: "Pai." },
    { foto: "luca_recem", ano: "Luca · 15.06.2020", texto: "E então eram quatro." },
    { foto: "familia_4_2020", ano: "2020", texto: "O maior sonho, em um abraço." },
    { foto: "natal_2020", ano: "Natal de 2020", texto: "Pijamas iguais, cabelo azul e casa cheia de amor." },
    { foto: "neve_criancas", ano: "2021", texto: "Os nenéns na neve." },
    { foto: "franca_familia_2020", ano: "França", texto: "Juntos para onde for." },
    { capitulo: "Trabalho e sonhos" },
    { foto: "psg_estadio", ano: "Parc des Princes", texto: "Do uniforme do trabalho ao gramado." },
    { foto: "paris_outono", ano: "Paris", texto: "Ela sempre ao lado." },
    { foto: "palco_giu_matheus", ano: "No palco", texto: "Ele e ela, cantando." },
    { capitulo: "De volta pra casa" },
    { foto: "homecoming_espelho", ano: "06.12.2025", texto: "Math's Bday: Homecoming." },
    { foto: "homecoming_banda", ano: "New York Pub", texto: "O sonho de 2009 chegou ao palco." },
    { foto: "homecoming_giu", ano: "A surpresa", texto: "A Giu subiu ao palco." },
    { foto: "homecoming_pai", ano: "Dad, you rock", texto: "Os pequenos na beira do palco." },
    { foto: "jean_matheus", ano: "Irmãos", texto: "Família também é quem a vida aproxima." },
    { foto: "final_galera", ano: "Todo mundo junto", texto: "Muita gente fazendo parte de algo importante." },
    { capitulo: "Agora" },
    { foto: "gen2k_publico", ano: "Gen2K · 2026", texto: "Uma terça-feira, uma conversa, um festival." },
    { foto: "gen2k_bandas", ano: "Gen2K", texto: "Muita gente resolveu acreditar junto." },
    { foto: "show_regata", ano: "VOLGAN", texto: "Rock, regata e tatuagens." },
    { foto: "pai_filhos_casa", ano: "Em casa", texto: "O melhor lugar do mundo." },
    { foto: "piquenique", ano: "Domingo", texto: "Tempo de qualidade, sem pressa." },
    { foto: "thiago_shopping", ano: "Thiago e Matheus", texto: "Não importa o tempo ou a distância: ainda os mesmos." },
    { foto: "thiago_brasil", ano: "Torcida", texto: "Os amigos de sempre, com a camisa do Brasil." },
    { foto: "corinthians_criancas", ano: "Em campo", texto: "Lys e Luca, do jeito deles." },
    { foto: "familia_passeio", ano: "Família", texto: "Os pequenos gestos." },
    { foto: "vox_equipe", ano: "Vox", texto: "Ideias que viram trabalho." },
    { foto: "aces_carrillo", ano: "Aces", texto: "Histórias de quem ele admira, contadas por ele." },
    { foto: "core", ano: "Core", texto: "Os amigos que viraram casa." },
    { capitulo: "14 anos do sim" },
    { foto: "renovacao_cerimonia", ano: "Agosto de 2026", texto: "Tudo de novo, agora com todo mundo junto." },
    { foto: "civil_2012", ano: "Agosto de 2026", texto: "O sorriso de quem realizou um sonho." },
    { foto: "renovacao_bordado", ano: "Lys 3.9.17 · Luca 15.06.20", texto: "Bordado perto do coração." },
    { foto: "renovacao_familia", ano: "14 anos depois", texto: "Mudaram, cresceram, continuaram." },
    { foto: "paris_14anos", ano: "Paris · 14 anos", texto: "De volta ao lugar do primeiro sim." },
    { capitulo: "Feliz aniversário, Matheus." }
  ],

  /* ---------------- NÍVEL 2: FASES QUE AINDA VÃO ACONTECER ---------------- */
  nivel2: {
    titulo: "Nível 2 · Em breve",
    texto: "Essas fases ainda não aconteceram. Elas destravam quando a vida chegar lá.",
    fases: [
      { id: 11, nome: "Aniversário de herói", sub: "Poços · heróis, vilões e anti-heróis", icone: "🦸", quando: "Fim de novembro",
        previa: "A festa em Poços com tema de heróis, vilões e anti-heróis. O aniversariante vai de Superman. Essa fase abre depois da festa, com as fotos da noite." },
      { id: 12, nome: "Próximo nível", sub: "A Aces decola", icone: "🚀", quando: "Em construção",
        previa: "A agência chega a outro nível e leva mais gente junto. Carreiras, campanhas e novos jogadores no mapa." },
      { id: 13, nome: "Show no estádio", sub: "VOLGAN num estádio lotado", icone: "🏟️", quando: "Um dia",
        previa: "A banda conhecida no país inteiro, num estádio gigante tipo Maracanã. Ainda vai rolar a camisa voando no telão." },
      { id: 14, nome: "Show fora da Terra", sub: "Festival interplanetário", icone: "🪐", quando: "Sonho grande",
        previa: "Foguete saindo de Poços, palco montado em outro planeta, estrutura para receber a galera da galáxia. O primeiro Gen2K fora da Terra." }
    ]
  }
};
