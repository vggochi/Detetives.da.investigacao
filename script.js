
/* =========================================================
   DETETIVES DA INFORMAÇÃO — ARMAGEDOM / 2BDEV
   JavaScript + Supabase
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     1. CONFIGURAÇÃO
     ======================================================= */

  const SESSION_KEY = "detetives-squad-session-v1";
  let currentSquad = null;
  let currentParticipant = "";

  let supabaseClient =
    typeof window.supabaseClient?.from === "function"
      ? window.supabaseClient
      : typeof window.supabase?.from === "function"
        ? window.supabase
        : null;

  const SUPABASE_CONFIGURED = () => Boolean(supabaseClient);

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);



  const STORAGE_KEY_PREFIX = "detetives-progresso-v2-";
  const getStorageKey = () =>
    STORAGE_KEY_PREFIX + currentSquad.id + "-" +
    encodeURIComponent(currentParticipant.toLocaleLowerCase("pt-BR"));

  /* =======================================================
     2. CASOS EDUCACIONAIS
     As histórias e as pistas continuam no JavaScript.
     ======================================================= */

  const CASES = [
    {
      id: "ciclovias",
      title: "A cidade das ciclovias",
      category: "Mobilidade urbana",
      difficulty: "Iniciante",
      points: 100,
      image:
        "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=900&q=80",
      claim:
        "Uma publicação afirma que a cidade duplicou sua rede de ciclovias em apenas um ano.",
      context:
        "A postagem apresenta um número expressivo, mas não informa claramente o período comparado, a extensão inicial nem a origem do dado.",
      verdict: "v",
      explanation:
        "A conclusão deve ser sustentada por registros oficiais que informem a extensão da rede e os períodos comparados. Uma imagem isolada ou uma postagem sem referência não basta para comprovar a afirmação.",
      clues: [
        {
          title: "Portal da prefeitura",
          source: "Portal oficial",
          type: "of",
          description:
            "Uma página municipal apresenta relatórios de mobilidade e informa a extensão da rede em diferentes anos.",
          classification: "a",
          explanation:
            "É uma fonte institucional potencialmente relevante. Confira a data, a metodologia e se os números realmente permitem a comparação."
        },
        {
          title: "Publicação compartilhada",
          source: "Rede social",
          type: "rd",
          description:
            "Uma postagem repete a afirmação, mas não apresenta links, documentos ou números verificáveis.",
          classification: "d",
          explanation:
            "Repetir uma afirmação não comprova sua veracidade. Sem uma origem verificável, a postagem não sustenta o dado."
        },
        {
          title: "Relatório de mobilidade",
          source: "Documento técnico",
          type: "un",
          description:
            "Um documento apresenta mapas e medições de ciclovias, mas é necessário verificar a data de publicação.",
          classification: "a",
          explanation:
            "O documento pode ajudar a conferir a extensão da rede. A data e a metodologia precisam corresponder ao período alegado."
        },
        {
          title: "Fotografia de uma avenida",
          source: "Imagem sem legenda",
          type: "rd",
          description:
            "Uma fotografia mostra uma ciclovia, sem localização ou data confirmadas.",
          classification: "i",
          explanation:
            "A imagem pode mostrar a existência de uma ciclovia, mas não comprova a extensão total da rede nem seu crescimento anual."
        }
      ]
    },
    {
      id: "cha",
      title: "O chá milagroso",
      category: "Saúde e ciência",
      difficulty: "Iniciante",
      points: 150,
      image:
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80",
      claim:
        "Um vídeo afirma que um chá elimina uma doença em poucos dias e garante o mesmo resultado para todas as pessoas.",
      context:
        "O vídeo usa depoimentos pessoais e expressões como 'cura garantida', mas não apresenta evidências clínicas suficientes.",
      verdict: "f",
      explanation:
        "Depoimentos individuais não demonstram que um tratamento funcione para todos. Uma alegação de cura garantida exige evidências científicas robustas; não se deve abandonar um tratamento indicado por profissionais com base em vídeos.",
      clues: [
        {
          title: "Órgão de saúde",
          source: "Instituição oficial",
          type: "of",
          description:
            "Uma página de saúde orienta o público a verificar evidências e consultar profissionais antes de usar tratamentos.",
          classification: "a",
          explanation:
            "Orientações institucionais ajudam a contextualizar a alegação, embora seja necessário conferir a informação específica sobre o produto."
        },
        {
          title: "Depoimento em vídeo",
          source: "Rede social",
          type: "rd",
          description:
            "Uma pessoa diz que melhorou após tomar o chá, sem apresentar avaliação clínica ou outras informações.",
          classification: "i",
          explanation:
            "Uma experiência pessoal não estabelece causalidade e não prova que o produto trate uma doença."
        },
        {
          title: "Artigo científico",
          source: "Publicação científica",
          type: "ci",
          description:
            "Um estudo científico pode informar quais resultados foram observados, em qual grupo e sob quais condições.",
          classification: "a",
          explanation:
            "Estudos podem fornecer evidências, mas é essencial conferir o método, a qualidade e se o estudo realmente investigou a alegação."
        },
        {
          title: "Anúncio de venda",
          source: "Página comercial",
          type: "rd",
          description:
            "Uma loja promete cura garantida e pede que o consumidor compre o produto imediatamente.",
          classification: "d",
          explanation:
            "O interesse comercial e a ausência de evidências tornam o anúncio insuficiente para comprovar uma alegação médica."
        }
      ]
    },
    {
      id: "escola",
      title: "A escola que mais cresceu",
      category: "Educação e estatística",
      difficulty: "Avançado",
      points: 300,
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
      claim:
        "Um gráfico afirma que determinada escola teve o maior crescimento de desempenho da região.",
      context:
        "O gráfico mostra barras de alturas diferentes, mas não informa com clareza a fonte, o indicador ou o período de comparação.",
      verdict: "i",
      explanation:
        "Sem identificar o indicador, o período, a população analisada e a origem dos números, não é possível confirmar que a escola foi a que mais cresceu. O gráfico, sozinho, não resolve essas lacunas.",
      clues: [
        {
          title: "Gráfico compartilhado",
          source: "Publicação sem referência",
          type: "rd",
          description:
            "A imagem compara três escolas, mas não inclui fonte dos dados, unidade de medida nem período.",
          classification: "i",
          explanation:
            "Sem esses elementos, não é possível verificar o significado das barras ou reproduzir a comparação."
        },
        {
          title: "Base de dados educacionais",
          source: "Base de dados pública",
          type: "bd",
          description:
            "Uma base pública pode conter indicadores por escola e por ano, permitindo comparar os dados originais.",
          classification: "a",
          explanation:
            "É uma fonte adequada para investigação, desde que o indicador e os períodos sejam compatíveis com a afirmação."
        },
        {
          title: "Comentário de um estudante",
          source: "Relato pessoal",
          type: "rd",
          description:
            "Um comentário diz que a escola melhorou muito, mas não apresenta dados comparativos.",
          classification: "d",
          explanation:
            "O comentário é uma experiência pessoal, não uma medição que comprove o maior crescimento regional."
        },
        {
          title: "Relatório institucional",
          source: "Documento educacional",
          type: "of",
          description:
            "Um relatório apresenta resultados de avaliação, mas ainda é necessário confirmar quais escolas e anos foram incluídos.",
          classification: "a",
          explanation:
            "O relatório pode ajudar a testar a afirmação, desde que cubra o conjunto de escolas e o intervalo analisado."
        }
      ]
    },
    {
      id: "desemprego",
      title: "O desemprego pela metade",
      category: "Economia e dados",
      difficulty: "Intermediário",
      points: 200,
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
      claim:
        "Uma postagem afirma que o desemprego caiu pela metade e apresenta o número como prova definitiva de melhora geral.",
      context:
        "O conteúdo não explica o período usado na comparação nem informa se o indicador se refere a uma região específica ou ao país inteiro.",
      verdict: "f",
      explanation:
        "A conclusão apresentada como prova definitiva não é sustentada por uma comparação sem período, território, definição do indicador e fonte verificável. Uma queda só pode ser avaliada com os dados completos e o contexto correto.",
      clues: [
        {
          title: "Estatísticas oficiais",
          source: "Base de dados pública",
          type: "bd",
          description:
            "Uma base estatística oficial publica indicadores de trabalho por período e região.",
          classification: "a",
          explanation:
            "A base permite conferir os valores originais, desde que sejam selecionados os períodos e os recortes corretos."
        },
        {
          title: "Imagem com uma porcentagem",
          source: "Publicação compartilhada",
          type: "rd",
          description:
            "Uma imagem mostra uma porcentagem em destaque, mas não informa a fonte ou o intervalo de tempo.",
          classification: "i",
          explanation:
            "Uma porcentagem sem referência e sem período não permite validar a comparação."
        },
        {
          title: "Manchete antiga",
          source: "Notícia jornalística",
          type: "im",
          description:
            "Uma manchete relata uma mudança no mercado de trabalho em um período anterior.",
          classification: "i",
          explanation:
            "A notícia pode ajudar a entender o contexto histórico, mas não comprova automaticamente uma afirmação sobre outro período."
        },
        {
          title: "Tabela com datas e definições",
          source: "Relatório estatístico",
          type: "of",
          description:
            "Uma tabela pode apresentar as datas, a definição do indicador e os valores necessários para a comparação.",
          classification: "a",
          explanation:
            "Esses dados são relevantes para testar a afirmação. Confira se a redução alegada é realmente demonstrada."
        }
      ]
    },
    {
      id: "espelhos",
      title: "Espelhos na montanha",
      category: "Imagem e contexto",
      difficulty: "Intermediário",
      points: 250,
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
      claim:
        "Uma imagem viral afirma mostrar uma instalação gigantesca de espelhos em uma montanha, construída recentemente.",
      context:
        "A imagem é compartilhada sem localização, data original ou identificação do projeto. A aparência da fotografia não confirma a legenda.",
      verdict: "v",
      explanation:
        "A existência de instalações solares com espelhos pode ser documentada por fontes técnicas e registros verificáveis. Para confirmar esta publicação específica, porém, é necessário identificar o local e verificar se a imagem corresponde ao projeto mencionado.",
      clues: [
        {
          title: "Imagem viral",
          source: "Rede social",
          type: "rd",
          description:
            "A fotografia aparece em uma postagem com legenda chamativa, mas sem crédito ou localização.",
          classification: "i",
          explanation:
            "A imagem isolada não permite confirmar o local, a data ou a descrição apresentada."
        },
        {
          title: "Registro de projeto energético",
          source: "Documento institucional",
          type: "of",
          description:
            "Um registro técnico descreve instalações de energia solar e pode incluir localização e fotografias.",
          classification: "a",
          explanation:
            "O registro pode confirmar a existência do projeto, desde que corresponda à imagem e à localização alegadas."
        },
        {
          title: "Busca reversa de imagem",
          source: "Ferramenta de verificação",
          type: "bd",
          description:
            "Uma busca por imagens semelhantes pode localizar versões mais antigas e páginas que publicaram a fotografia.",
          classification: "a",
          explanation:
            "A busca ajuda a rastrear a origem da imagem. Os resultados precisam ser abertos e verificados individualmente."
        },
        {
          title: "Comentário sem fonte",
          source: "Discussão online",
          type: "rd",
          description:
            "Um comentário afirma conhecer o local, mas não oferece endereço, documento ou outra evidência.",
          classification: "d",
          explanation:
            "Uma alegação sem referência verificável não confirma a origem da imagem."
        }
      ]
    }
  ];

  const SOURCE_TYPES = {
    of: "Site oficial",
    un: "Universidade",
    ci: "Instituição científica",
    bd: "Base de dados pública",
    im: "Imprensa",
    rd: "Rede social ou blog"
  };

  const CLASSIFICATIONS = {
    a: "Apoia",
    c: "Contradiz",
    i: "Incompleta",
    d: "Descartar"
  };

  const VERDICTS = {
    v: "Verdadeira",
    f: "Falsa",
    i: "Inconclusiva"
  };

  // Cada caso precisa de uma missão exclusiva no Supabase.
  const MISSION_SLUGS = {
    ciclovias: "caso-ciclovias",
    cha: "caso-cha",
    escola: "caso-escola",
    desemprego: "caso-desemprego",
    espelhos: "caso-espelhos"
  };

  /* =======================================================
     3. ESTADO DO JOGO
     ======================================================= */

  const state = {
    current: 0,
    screen: "overview",
    answers: {},
    verdict: "",
    justification: "",
    results: {},
    completed: new Set(),
    missions: [],
    remoteRecords: [],
    loading: false,
    saving: false,
    error: "",
    startedAt: null,
    rankingRows: []
  };

  /* =======================================================
     4. PERSISTÊNCIA LOCAL
     ======================================================= */

  function loadLocalProgress() {
    try {
      if (!currentSquad) return;
      const raw = localStorage.getItem(getStorageKey());
      if (!raw) return;

      const saved = JSON.parse(raw);

      if (saved.results && typeof saved.results === "object") {
        state.results = saved.results;
      }

      if (Array.isArray(saved.completed)) {
        state.completed = new Set(saved.completed);
      }
    } catch (error) {
      console.warn("Não foi possível ler o progresso local:", error);
    }
  }

  function saveLocalProgress() {
    try {
      localStorage.setItem(
        getStorageKey(),
        JSON.stringify({
          results: state.results,
          completed: [...state.completed]
        })
      );
    } catch (error) {
      console.warn("Não foi possível guardar o progresso local:", error);
    }
  }

  /* =======================================================
     5. SUPABASE
     ======================================================= */

  async function fetchAllPages(queryFactory, pageSize = 1000) {
    const rows = [];
    let from = 0;

    while (true) {
      const { data, error } = await queryFactory().range(from, from + pageSize - 1);
      if (error) throw error;

      const page = data || [];
      rows.push(...page);

      if (page.length < pageSize) break;
      from += pageSize;
    }

    return rows;
  }

  async function loadRankingData() {
    const status = $("#ranking-status");
    const refreshButton = $("#refresh-ranking");

    if (!supabaseClient) {
      if (status) status.textContent = "Conexão com o Supabase indisponível.";
      renderRanking();
      return;
    }

    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.textContent = "Atualizando...";
    }
    if (status) status.textContent = "Sincronizando pontuações com o Supabase...";

    try {
      const [squads, records] = await Promise.all([
        fetchAllPages(() =>
          supabaseClient.from("squads").select("id, nome, turma")
        ),
        fetchAllPages(() =>
          supabaseClient
            .from("investigacoes")
            .select("squad_id, missao_id, pontos_obtidos, concluida")
            .eq("concluida", true)
        )
      ]);

      const rankingMap = new Map();
      squads.forEach((squad) => {
        rankingMap.set(squad.id, {
          id: squad.id,
          nome: squad.nome,
          turma: squad.turma,
          pontos: 0,
          missoes: new Set()
        });
      });

      records.forEach((record) => {
        const row = rankingMap.get(record.squad_id);
        if (!row) return;
        row.pontos += Number(record.pontos_obtidos) || 0;
        if (record.missao_id) row.missoes.add(record.missao_id);
      });

      state.rankingRows = [...rankingMap.values()]
        .map((row) => ({ ...row, concluidas: row.missoes.size }))
        .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome));

      if (status) {
        const now = new Date();
        status.textContent = `Placar sincronizado • ${state.rankingRows.length} squads • atualizado às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
      }
    } catch (error) {
      console.error("Erro ao atualizar o placar:", error);
      if (status) status.textContent = `Não foi possível atualizar o placar: ${error.message || "verifique as permissões de leitura do Supabase"}`;
    } finally {
      if (refreshButton) {
        refreshButton.disabled = false;
        refreshButton.textContent = "Atualizar placar";
      }
      renderRanking();
    }
  }

  async function loadSupabaseData() {
    if (!supabaseClient || !currentSquad) return;

    state.loading = true;
    renderGrand();

    try {
      const [missionsResult, investigationsResult] = await Promise.all([
        supabaseClient
          .from("missoes")
          .select("id, slug, titulo, dificuldade, pontos, ativo")
          .eq("ativo", true),

        supabaseClient
          .from("investigacoes")
          .select(
            "id, squad_id, missao_id, nome_jogador, resposta, correta, pontos_obtidos, concluida, iniciada_em, concluida_em"
          )
          .eq("squad_id", currentSquad.id)
          .eq("concluida", true)
      ]);

      if (missionsResult.error) throw missionsResult.error;
      if (investigationsResult.error) throw investigationsResult.error;

      state.missions = missionsResult.data || [];
      state.remoteRecords = investigationsResult.data || [];

      // Sincroniza o histórico persistido com os indicadores.
      state.remoteRecords.forEach((record) => {
        if (!record.missao_id) return;

        const mission = state.missions.find(
          (item) => item.id === record.missao_id
        );

        if (!mission) return;

        const matchingCase = CASES.find((item) => {
          return MISSION_SLUGS[item.id] === mission.slug;
        });

        if (!matchingCase) return;

        state.completed.add(matchingCase.id);

        // Preserva um resultado local mais recente, se já existir.
        if (
          record.nome_jogador === currentParticipant &&
          !state.results[matchingCase.id]
        ) {
          state.results[matchingCase.id] = {
            total: Number(record.pontos_obtidos) || 0,
            verdict: record.resposta || "",
            correct: Boolean(record.correta),
            persisted: true
          };
        }
      });

      saveLocalProgress();
    } catch (error) {
      console.error("Erro ao carregar dados do Supabase:", error);
      state.error =
        "Não foi possível carregar o histórico do banco. O jogo continua disponível; confira as políticas RLS e a conexão.";
    } finally {
      state.loading = false;
      await loadRankingData();
      renderGrand();
    }
  }

  function findMissionForCase(item) {
    const slug = MISSION_SLUGS[item.id];
    return state.missions.find((mission) => mission.slug === slug) || null;
  }

  async function saveInvestigation(item, result) {
    if (!supabaseClient) {
      return {
        saved: false,
        message: "Supabase não configurado. Resultado guardado apenas neste navegador."
      };
    }

    const mission = findMissionForCase(item);

    if (!mission) {
      return {
        saved: false,
        message:
          "Resultado calculado, mas não foi encontrada uma missão correspondente no Supabase."
      };
    }

    const existingResult = await supabaseClient
      .from("investigacoes")
      .select("id, squad_id, missao_id, nome_jogador, pontos_obtidos, resposta, correta, concluida")
      .eq("squad_id", currentSquad.id)
      .eq("missao_id", mission.id)
      .eq("nome_jogador", currentParticipant)
      .eq("concluida", true)
      .limit(1);

    if (existingResult.error) {
      console.error("Falha ao consultar investigação existente:", existingResult.error);
      return {
        saved: false,
        message: `Não foi possível consultar seu histórico: ${existingResult.error.message}`
      };
    }

    if (existingResult.data?.length) {
      const previousRecord = existingResult.data[0];
      const alreadyLoaded = state.remoteRecords.some((record) => record.id === previousRecord.id);

      if (!alreadyLoaded) state.remoteRecords.push(previousRecord);

      state.results[item.id] = {
        total: Number(previousRecord.pontos_obtidos) || 0,
        verdict: previousRecord.resposta || "",
        correct: Boolean(previousRecord.correta),
        persisted: true
      };
      state.completed.add(item.id);
      saveLocalProgress();

      // Reconsulta o banco para atualizar o ranking geral com os dados oficiais.
      await loadSupabaseData();
      renderGrand();

      return {
        saved: true,
        message: `Resultado anterior recuperado: ${Number(previousRecord.pontos_obtidos) || 0} pontos. O ranking foi atualizado sem duplicar a pontuação.`
      };
    }

    const payload = {
      squad_id: currentSquad.id,
      missao_id: mission.id,
      noticia_id: null,
      nome_jogador: currentParticipant,
      resposta: VERDICTS[result.verdict] || result.verdict,
      correta: result.correct,
      pontos_obtidos: result.total,
      concluida: true,
      concluida_em: new Date().toISOString()
    };

    state.saving = true;
    renderGrand();

    try {
      const { data, error } = await supabaseClient
        .from("investigacoes")
        .insert(payload)
        .select("id, squad_id, missao_id, nome_jogador, resposta, correta, pontos_obtidos, concluida, concluida_em")
        .single();

      if (error) throw error;

      // Marca como persistido antes de atualizar a tela para não somar
      // o resultado local e o registro do banco duas vezes.
      if (state.results[item.id]) {
        state.results[item.id].total = Number(data.pontos_obtidos) || 0;
        state.results[item.id].persisted = true;
      }

      state.remoteRecords.push(data);
      saveLocalProgress();

      // Recarrega squads e investigações concluídas para recalcular a classificação
      // de todos os squads, reordenar as posições e refletir o resultado recém-salvo.
      await loadSupabaseData();
      renderGrand();

      return {
        saved: true,
        message: `Pontuação atualizada: ${Number(data.pontos_obtidos) || 0} pontos salvos. Ranking geral atualizado.`
      };
    } catch (error) {
      console.error("Erro ao salvar investigação:", error);
      state.error = error?.message || "Erro desconhecido ao salvar no Supabase.";

      return {
        saved: false,
        message: `Não foi possível salvar a pontuação: ${state.error}`
      };
    } finally {
      state.saving = false;
      renderGrand();
    }
  }

  /* =======================================================
     6. CÁLCULO DA PONTUAÇÃO
     ======================================================= */

  function calculateScore(item, answers, verdict, justification) {
    let exactClassifications = 0;
    let discardedCorrectly = 0;
    let supportedClues = 0;

    item.clues.forEach((clue, index) => {
      const answer = answers[index];

      if (answer === clue.classification) {
        exactClassifications++;
      }

      if (
        (answer === "d" && clue.classification === "d") ||
        (answer !== "d" && clue.classification !== "d")
      ) {
        discardedCorrectly++;
      }

      if (
        answer === "a" &&
        (clue.classification === "a" || clue.classification === "i")
      ) {
        supportedClues++;
      }
    });

    const totalClues = item.clues.length;
    const classificationScore = Math.round(
      (exactClassifications / totalClues) * 35
    );

    const discardScore = Math.round(
      (discardedCorrectly / totalClues) * 15
    );

    const verdictScore = verdict === item.verdict ? 25 : 0;

    const cleanText = justification.trim();
    const lengthScore = Math.min(15, Math.round((cleanText.length / 100) * 15));
    const evidenceScore = supportedClues > 0 ? 10 : 0;
    const clarityScore = Math.min(25, lengthScore + evidenceScore);

    const total = Math.min(
      100,
      classificationScore + discardScore + verdictScore + clarityScore
    );

    return {
      total,
      classificationScore,
      discardScore,
      verdictScore,
      clarityScore,
      exactClassifications,
      totalClues,
      correct: verdict === item.verdict,
      verdict,
      justification: cleanText
    };
  }

  /* =======================================================
     7. GALERIA E ABAS
     ======================================================= */

  function renderTabs() {
    const tabs = $("#tabs");
    if (!tabs) return;

    tabs.innerHTML = CASES.map((item, index) => `
      <button
        class="tab ${index === state.current ? "on" : ""}"
        type="button"
        data-open-case="${index}"
        aria-pressed="${index === state.current}"
      >
        <b>${esc(item.title)}</b>
        <span>${esc(item.difficulty)} · ${state.completed.has(item.id) ? "Concluído" : "Pendente"}</span>
      </button>
    `).join("");
  }

  function setActiveCover(index) {
    $$(".case-cover").forEach((cover, coverIndex) => {
      const active = coverIndex === index;
      cover.classList.toggle("is-active", active);

      if (active) {
        cover.setAttribute("aria-current", "true");
      } else {
        cover.removeAttribute("aria-current");
      }
    });
  }

  /* =======================================================
     8. INDICADORES E PLACAR
     ======================================================= */

  function getCompletedCount() {
    return state.completed.size;
  }

  function getTotalPoints() {
    // Soma os pontos de todos os participantes já registrados no squad.
    const savedPoints = state.remoteRecords.reduce(
      (sum, record) => sum + (Number(record.pontos_obtidos) || 0),
      0
    );

    // Também mantém no placar uma tentativa local caso o Supabase esteja indisponível.
    // Resultados persistidos já estão em remoteRecords e não podem ser somados duas vezes.
    const pendingPoints = Object.values(state.results).reduce(
      (sum, result) => sum + (result?.persisted ? 0 : Number(result?.total) || 0),
      0
    );

    return savedPoints + pendingPoints;
  }

  function renderGrand() {
    const grand = $("#grand");

    const completed = getCompletedCount();
    const points = getTotalPoints();
    const percent = Math.round((completed / CASES.length) * 100);

    if (grand) {
      grand.innerHTML = `
        <span>Progresso da investigação</span>
        <strong>${completed}/${CASES.length} casos concluídos</strong>
        <span>·</span>
        <strong>${points} pontos do squad</strong>
        <div class="bar-track" role="progressbar"
          aria-label="Progresso dos casos"
          aria-valuemin="0"
          aria-valuemax="${CASES.length}"
          aria-valuenow="${completed}">
          <i style="width:${percent}%"></i>
        </div>
        ${
          state.loading
            ? "<p>Carregando histórico do Supabase…</p>"
            : ""
        }
        ${
          state.saving
            ? "<p>Salvando investigação…</p>"
            : ""
        }
        ${
          state.error
            ? `<p role="status">${esc(state.error)}</p>`
            : ""
        }
      `;
    }

    const casesCount = $("#cases-count");
    const reportsCount = $("#reports-count");
    const casesMeter = $("#cases-meter");
    const reportsMeter = $("#reports-meter");
    const totalScore = $("#total-score");
    const sessionPoints = $("#session-points");

    if (sessionPoints) sessionPoints.textContent = `${points} pts`;
    if (casesCount) casesCount.textContent = `${completed}/${CASES.length}`;
    if (reportsCount) reportsCount.textContent = `${completed}/${CASES.length}`;
    if (casesMeter) casesMeter.style.width = `${percent}%`;
    if (reportsMeter) reportsMeter.style.width = `${percent}%`;
    if (totalScore) totalScore.textContent = String(points);

    updateChecklist();
    renderRanking();
  }

  function updateChecklist() {
    const checklist = [
      ["#check-source", getCompletedCount() > 0],
      ["#check-date", getCompletedCount() > 0],
      ["#check-evidence", getCompletedCount() > 0],
      ["#check-report", getCompletedCount() > 0]
    ];

    checklist.forEach(([selector, done]) => {
      const element = $(selector);
      if (!element) return;

      const listItem = element.matches("li")
        ? element
        : element.closest("li");

      if (listItem) listItem.classList.toggle("done", done);
    });
  }

  function renderRanking() {
    const body = $("#rank-body");
    const rankingScore = $("#ranking-score");

    if (rankingScore) {
      rankingScore.textContent = String(getTotalPoints());
    }

    if (!body) return;

    const rows = state.rankingRows || [];

    if (!rows.length) {
      body.innerHTML = `
        <tr>
          <td colspan="4" class="rank-empty">
            Nenhum squad com pontuação cadastrada ainda. Seja o primeiro a investigar!
          </td>
        </tr>
      `;
      return;
    }

    const maxPoints = Math.max(100, ...rows.map((row) => Number(row.pontos) || 0));
    body.innerHTML = rows.map((row, index) => `
      <tr class="${index === 0 ? "first" : ""}">
        <td class="pos">${String(index + 1).padStart(2, "0")}</td>
        <td>
          <div class="nm">${esc(row.nome)}</div>
          <small>${esc(row.turma || "")}</small>
        </td>
        <td>
          <div class="pts">
            <span>${Number(row.pontos) || 0} pontos</span>
            <i style="--w:${Math.min(100, ((Number(row.pontos) || 0) / maxPoints) * 100)}%"></i>
          </div>
        </td>
        <td>${Number(row.concluidas) || 0}</td>
      </tr>
    `).join("");
  }

  /* =======================================================
     9. RELATÓRIO
     ======================================================= */

  function renderReport(item, result) {
    const reportBody = $("#report-body");
    if (!reportBody) return;

    const answerRows = item.clues.map((clue, index) => {
      const answer = state.answers[index] || "";
      return `
        <li>
          <strong>${esc(clue.title)}</strong>
          <span>${esc(clue.source)}</span>
          <span>Classificação: ${esc(CLASSIFICATIONS[answer] || "Não informada")}</span>
          <span class="r-meta">${esc(clue.explanation)}</span>
        </li>
      `;
    }).join("");

    reportBody.innerHTML = `
      <div class="r-row">
        <div class="r-h">Caso</div>
        <div>${esc(item.title)}</div>
      </div>
      <div class="r-row">
        <div class="r-h">Afirmação</div>
        <div>${esc(item.claim)}</div>
      </div>
      <div class="r-row">
        <div class="r-h">Veredito</div>
        <div>
          <span class="vchip ${
            result.verdict === "v"
              ? "verdadeira"
              : result.verdict === "f"
                ? "falsa"
                : "inconclusiva"
          }">${esc(VERDICTS[result.verdict] || "Não informado")}</span>
        </div>
      </div>
      <div class="r-row">
        <div class="r-h">Justificativa</div>
        <div>${esc(result.justification)}</div>
      </div>
      <div class="r-row">
        <div class="r-h">Evidências analisadas</div>
        <div><ol class="r-list">${answerRows}</ol></div>
      </div>
      <div class="r-row">
        <div class="r-h">Pontuação</div>
        <div>${result.total}/100 pontos</div>
      </div>
    `;

    const report = $("#report");
    if (report) report.hidden = false;
  }

  async function copyReport() {
    const reportBody = $("#report-body");
    const status = $("#copy-status");
    const fallback = $("#copy-fallback");

    if (!reportBody) return;

    const text = reportBody.innerText.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard indisponível");
      }

      if (status) status.textContent = "Relatório copiado.";
    } catch {
      if (fallback) {
        fallback.hidden = false;
        fallback.value = text;
        fallback.focus();
        fallback.select();
      }

      if (status) {
        status.textContent =
          "Selecione e copie o texto do relatório manualmente.";
      }
    }
  }

  /* =======================================================
     10. TELA INICIAL DO CASO
     ======================================================= */

  function renderOverview() {
    const item = CASES[state.current];
    const container = $("#case");
    if (!item || !container) return;

    state.screen = "overview";

    container.innerHTML = `
      <div class="case-h">
        <span class="chip">Caso ${String(state.current + 1).padStart(2, "0")}</span>
        <span class="chip">${esc(item.difficulty)}</span>
        <span class="chip">${item.points} pontos disponíveis</span>
      </div>

      <h3>${esc(item.title)}</h3>

      <div class="claim">
        <span class="label">Afirmação investigada</span>
        <p>${esc(item.claim)}</p>
        <p class="ctx">${esc(item.context)}</p>
      </div>

      <div class="panel">
        <div class="panel-h">
          <h3>Objetivo da investigação</h3>
        </div>
        <p>
          Analise as quatro pistas, classifique cada evidência e escolha
          um veredito. Justifique sua conclusão com base nas informações
          disponíveis, distinguindo evidências de opiniões.
        </p>
        <p class="hint" style="margin-top:12px">
          Este é um caso educacional simulado. As pistas servem para
          praticar verificação de informações, não para afirmar fatos reais.
        </p>
        <button class="btn primary" type="button" data-action="start">
          ${state.completed.has(item.id) ? "Reinvestigar caso" : "Iniciar investigação"}
        </button>
      </div>
    `;

    setActiveCover(state.current);
    renderTabs();
  }

  /* =======================================================
     11. TELA DE ANÁLISE DAS PISTAS
     ======================================================= */

  function renderAnalysis() {
    const item = CASES[state.current];
    const container = $("#case");
    if (!item || !container) return;

    state.screen = "analysis";

    const clueCards = item.clues.map((clue, index) => `
      <article class="clue">
        <header>
          <span class="pn">0${index + 1}</span>
          <span class="tag ${clue.type === "of" || clue.type === "ci" || clue.type === "bd" ? "ver" : "oth"}">
            ${esc(SOURCE_TYPES[clue.type] || clue.source)}
          </span>
        </header>

        <h4>${esc(clue.title)}</h4>
        <p class="meta">${esc(clue.source)}</p>
        <p class="txt">${esc(clue.description)}</p>

        <fieldset class="seg">
          <legend>Como você classifica esta pista?</legend>
          <div class="seg-row">
            ${Object.entries(CLASSIFICATIONS).map(([key, label]) => `
              <span class="opt">
                <input
                  type="radio"
                  id="clue-${index}-${key}"
                  name="clue-${index}"
                  value="${key}"
                  ${state.answers[index] === key ? "checked" : ""}
                  required
                >
                <label for="clue-${index}-${key}">${esc(label)}</label>
              </span>
            `).join("")}
          </div>
        </fieldset>
      </article>
    `).join("");

    container.innerHTML = `
      <div class="case-h">
        <span class="chip">Caso ${String(state.current + 1).padStart(2, "0")}</span>
        <span class="chip">${esc(item.category)}</span>
      </div>

      <h3>${esc(item.title)}</h3>

      <div class="claim">
        <span class="label">Afirmação investigada</span>
        <p>${esc(item.claim)}</p>
        <p class="ctx">${esc(item.context)}</p>
      </div>

      <form id="active-investigation-form">
        <h4 class="sub-h">Arquivo de evidências</h4>
        <div class="clues">${clueCards}</div>

        <div class="panel">
          <fieldset class="seg">
            <legend>Qual é o seu veredito?</legend>
            <div class="seg-row">
              <span class="opt v-ok">
                <input type="radio" id="verdict-v" name="veredito" value="v"
                  ${state.verdict === "v" ? "checked" : ""} required>
                <label for="verdict-v">Verdadeira</label>
              </span>
              <span class="opt v-bad">
                <input type="radio" id="verdict-f" name="veredito" value="f"
                  ${state.verdict === "f" ? "checked" : ""} required>
                <label for="verdict-f">Falsa</label>
              </span>
              <span class="opt v-warn">
                <input type="radio" id="verdict-i" name="veredito" value="i"
                  ${state.verdict === "i" ? "checked" : ""} required>
                <label for="verdict-i">Inconclusiva</label>
              </span>
            </div>
          </fieldset>

          <div class="field">
            <label for="justification-input">Justifique seu veredito</label>
            <textarea
              id="justification-input"
              name="justificativa"
              minlength="20"
              maxlength="1500"
              required
              placeholder="Explique quais evidências sustentam sua conclusão e quais limitações você encontrou."
            >${esc(state.justification)}</textarea>
            <span class="hint">Escreva pelo menos 20 caracteres e cite as pistas que foram importantes para sua análise.</span>
          </div>

          <p id="form-error" class="hint" role="alert"></p>

          <div class="cta">
            <button class="btn primary" type="submit">Registrar veredito</button>
            <button class="btn" type="button" data-action="back">Voltar ao caso</button>
          </div>
        </div>
      </form>
    `;

    // Atualiza as respostas à medida que o usuário preenche o formulário.
    const form = $("#active-investigation-form");

    form?.addEventListener("change", (event) => {
      const target = event.target;

      if (target.matches('input[type="radio"][name^="clue-"]')) {
        const index = Number(target.name.replace("clue-", ""));
        state.answers[index] = target.value;
      }

      if (target.matches('input[name="veredito"]')) {
        state.verdict = target.value;
      }
    });

    $("#justification-input")?.addEventListener("input", (event) => {
      state.justification = event.target.value;
    });

    form?.addEventListener("submit", handleSubmit);
    renderTabs();
  }

  /* =======================================================
     12. RESULTADO E FEEDBACK
     ======================================================= */

  async function renderResult(result, persistedMessage = "") {
    const item = CASES[state.current];
    const container = $("#case");
    if (!item || !container) return;

    state.screen = "result";

    const feedback = item.clues.map((clue, index) => {
      const answer = state.answers[index] || "";
      const correct = answer === clue.classification;

      return `
        <li class="${correct ? "ok" : "warn"}">
          <b>${correct ? "✓" : "!"}</b>
          <span>
            <strong>${esc(clue.title)} — ${esc(CLASSIFICATIONS[answer] || "Sem classificação")}</strong><br>
            ${esc(clue.explanation)}
          </span>
        </li>
      `;
    }).join("");

    container.innerHTML = `
      <div class="result">
        <span class="chip">Investigação finalizada</span>
        <h3>${esc(item.title)}</h3>

        <div class="total">
          <div>
            <span>Sua pontuação</span>
            <br>
            <small>Máximo de 100 pontos por caso</small>
          </div>
          <b>${result.total}</b>
        </div>

        <div class="claim">
          <span class="label">Seu veredito</span>
          <p>${esc(VERDICTS[result.verdict])}</p>
          <p class="ctx">
            ${result.correct
              ? "Seu veredito corresponde à conclusão definida para este caso educacional."
              : "Seu veredito difere da conclusão definida para este caso. Revise as pistas e os critérios."}
          </p>
        </div>

        <h4>Como foi calculada a pontuação</h4>
        <ul class="sc">
          <li>Classificações: ${result.classificationScore}/35</li>
          <li>Descarte de pistas: ${result.discardScore}/15</li>
          <li>Veredito: ${result.verdictScore}/25</li>
          <li>Justificativa: ${result.clarityScore}/25</li>
        </ul>

        <h4>Revisão das pistas</h4>
        <ul class="flags">${feedback}</ul>

        <div class="panel">
          <h4>Conclusão de referência</h4>
          <p>${esc(item.explanation)}</p>
        </div>

        <p class="hint" role="status">${esc(persistedMessage)}</p>

        <div class="cta">
          <button class="btn primary" type="button" data-action="review">
            Revisar pistas
          </button>
          <button class="btn" type="button" data-action="report">
            Ver relatório
          </button>
          ${
            state.current < CASES.length - 1
              ? '<button class="btn" type="button" data-action="next">Próximo caso →</button>'
              : '<button class="btn" type="button" data-action="finish">Ver conclusão</button>'
          }
        </div>
      </div>
    `;

    renderReport(item, result);
    renderGrand();
    renderTabs();
  }

  /* =======================================================
     13. FORMULÁRIO E SALVAMENTO
     ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    if (state.saving) return;

    const item = CASES[state.current];
    const form = event.currentTarget;
    const errorBox = $("#form-error", form);

    // Coleta o estado atual do formulário.
    item.clues.forEach((_, index) => {
      const selected = $(`input[name="clue-${index}"]:checked`, form);
      state.answers[index] = selected ? selected.value : "";
    });

    const verdictInput = $('input[name="veredito"]:checked', form);
    state.verdict = verdictInput ? verdictInput.value : "";
    state.justification = $("#justification-input", form)?.value.trim() || "";

    const missingClue = item.clues.some(
      (_, index) => !state.answers[index]
    );

    if (missingClue || !state.verdict || state.justification.length < 20) {
      if (errorBox) {
        errorBox.textContent =
          "Classifique todas as pistas, escolha um veredito e escreva uma justificativa de pelo menos 20 caracteres.";
      }
      return;
    }

    const result = calculateScore(
      item,
      state.answers,
      state.verdict,
      state.justification
    );

    state.results[item.id] = { ...result, persisted: false };
    state.completed.add(item.id);
    saveLocalProgress();

    // Atualiza os indicadores imediatamente, antes mesmo da resposta do banco.
    renderGrand();
    renderTabs();

    // Mostra o resultado imediatamente; o banco é salvo em seguida.
    await renderResult(result, "Calculando e salvando pontuação…");

    const saveStatus = await saveInvestigation(item, result);

    const status = $("#case .result .hint");
    if (status) status.textContent = saveStatus.message;

    if (saveStatus.saved) {
      state.results[item.id].persisted = true;
      saveLocalProgress();
    }

    renderGrand();
    renderTabs();
  }

  /* =======================================================
     14. RELATÓRIO FINAL
     ======================================================= */

  function renderFinalSummary() {
    const container = $("#case");
    if (!container) return;

    const completed = getCompletedCount();
    const points = getTotalPoints();

    state.screen = "final";

    container.innerHTML = `
      <div class="result">
        <span class="chip">Arquivo encerrado</span>
        <h3>Relatório do squad ${esc(currentSquad?.nome || "")}</h3>
        <p>
          O squad concluiu ${completed} de ${CASES.length} casos e acumulou
          ${points} pontos registrados no Supabase.
        </p>

        <div class="total">
          <div>
            <span>Pontuação total</span>
            <br>
            <small>Turma ${esc(currentSquad?.turma || "")}</small>
          </div>
          <b>${points}</b>
        </div>

        <h4>Casos concluídos</h4>
        <ul class="flags">
          ${CASES.map((item) => {
            const result = state.results[item.id];
            return `
              <li class="${result ? "ok" : "warn"}">
                <b>${result ? "✓" : "!"}</b>
                <span>
                  <strong>${esc(item.title)}</strong><br>
                  ${result
                    ? `${result.total}/100 pontos`
                    : "Ainda não concluído"}
                </span>
              </li>
            `;
          }).join("")}
        </ul>

        <div class="cta">
          <button class="btn primary" type="button" data-action="first">
            Voltar aos casos
          </button>
          <button class="btn" type="button" data-action="report">
            Abrir relatório disponível
          </button>
        </div>
      </div>
    `;

    renderGrand();
  }

  /* =======================================================
     15. AÇÕES DE NAVEGAÇÃO
     ======================================================= */

  function openCase(index) {
    if (!Number.isInteger(index) || index < 0 || index >= CASES.length) {
      return;
    }

    state.current = index;
    state.answers = {};
    state.verdict = "";
    state.justification = "";
    state.startedAt = new Date().toISOString();

    const existing = state.results[CASES[index].id];

    if (existing) {
      // Ao reabrir, permite uma nova tentativa, sem apagar o histórico salvo.
      state.answers = {};
    }

    renderOverview();
    scrollToInvestigation();
  }

  function startCase() {
    state.answers = {};
    state.verdict = "";
    state.justification = "";
    renderAnalysis();
  }

  function scrollToInvestigation() {
    const section = $("#casos") || $("#case");
    section?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start"
    });
  }

  function handleAction(action) {
    switch (action) {
      case "start":
        startCase();
        break;

      case "back":
        renderOverview();
        break;

      case "review":
        renderAnalysis();
        break;

      case "next":
        openCase(Math.min(state.current + 1, CASES.length - 1));
        break;

      case "finish":
        renderFinalSummary();
        break;

      case "first":
        openCase(0);
        break;

      case "report": {
        const item = CASES[state.current];
        const result = state.results[item.id];

        if (result) {
          renderReport(item, result);
          $("#report")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          const report = $("#report-body");
          if (report) {
            report.innerHTML =
              "<p>Conclua uma investigação para gerar um relatório.</p>";
          }
          $("#report")?.removeAttribute("hidden");
        }
        break;
      }

      default:
        break;
    }
  }

  /* =======================================================
     16. EFEITOS VISUAIS
     ======================================================= */

  function installMotionStyles() {
    if ($("#detetives-motion-styles")) return;

    const style = document.createElement("style");
    style.id = "detetives-motion-styles";

    style.textContent = `
      @keyframes caseReveal {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      #case > * {
        animation: caseReveal .32s ease both;
      }

      .clue {
        transition: transform .2s ease, box-shadow .2s ease;
      }

      .clue:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(15, 30, 42, .10);
      }

      .case-cover {
        transition: transform .2s ease, border-color .2s ease;
      }

      .case-cover:hover {
        transform: translateY(-3px);
      }

      .bar-track i {
        transition: width .35s ease;
      }

      @media (prefers-reduced-motion: reduce) {
        #case > *, .clue, .case-cover {
          animation: none !important;
          transition: none !important;
          transform: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function addTilt() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    $$(".case-cover").forEach((cover) => {
      cover.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;

        const rect = cover.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        cover.style.transform =
          `perspective(600px) rotateX(${(0.5 - y) * 3}deg) rotateY(${(x - 0.5) * 3}deg) translateY(-2px)`;
      });

      cover.addEventListener("pointerleave", () => {
        cover.style.transform = "";
      });
    });
  }

  /* =======================================================
     17. EVENTOS GERAIS
     ======================================================= */

  function installEvents() {
    document.addEventListener("click", (event) => {
      const cover = event.target.closest(".case-cover");

      if (cover) {
        const index = Number(cover.dataset.case);

        if (Number.isInteger(index) && index >= 0 && index < CASES.length) {
          openCase(index);
        }

        return;
      }

      const tab = event.target.closest("[data-open-case]");

      if (tab) {
        openCase(Number(tab.dataset.openCase));
        return;
      }

      const actionButton = event.target.closest("[data-action]");

      if (actionButton) {
        handleAction(actionButton.dataset.action);
      }
    });

    $("#copy-report")?.addEventListener("click", copyReport);
    $("#refresh-ranking")?.addEventListener("click", loadRankingData);
  }


  /* =======================================================
     18. SQUADS — CRIAÇÃO, ENTRADA E SESSÃO
     ======================================================= */

  function showGateMessage(message, isError = false) {
    const status = $("#squad-gate-status");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  function setSquadSession(squad, participant) {
    currentSquad = squad;
    currentParticipant = participant;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      squadId: squad.id,
      participant
    }));
    document.body.classList.add("squad-ready");
    $("#squad-gate").hidden = true;
    $("#squad-session")?.removeAttribute("hidden");

    const sessionName = $("#session-squad-name");
    const sessionParticipant = $("#session-participant");
    const inviteCode = $("#session-invite-code");
    if (sessionName) sessionName.textContent = squad.nome;
    if (sessionParticipant) sessionParticipant.textContent = participant;
    if (inviteCode) inviteCode.textContent = squad.codigo_convite || "—";

    const footerName = $("#footer-squad-name");
    const footerClass = $("#footer-squad-class");
    const footerParticipants = $("#footer-squad-participants");
    if (footerName) footerName.textContent = squad.nome;
    if (footerClass) footerClass.textContent = "Turma " + squad.turma;
    if (footerParticipants) {
      const names = Array.isArray(squad.participantes) ? squad.participantes : [];
      footerParticipants.textContent = names.length
        ? names.join(" • ")
        : "Participantes ainda não cadastrados";
    }
    const footerLogo = $("#footer-squad-logo");
    if (footerLogo) footerLogo.hidden = squad.nome.toUpperCase() !== "ARMAGEDOM";

    state.current = 0;
    state.answers = {};
    state.verdict = "";
    state.justification = "";
    state.results = {};
    state.completed = new Set();
    state.remoteRecords = [];
    state.rankingRows = [];
    state.error = "";
  }

  async function enterSquad(squad, participant) {
    setSquadSession(squad, participant);
    loadLocalProgress();
    renderTabs();
    renderOverview();
    renderGrand();
    showGateMessage("");
    await loadSupabaseData();
    renderTabs();
    renderGrand();
  }

  async function restoreSquadSession() {
    if (!supabaseClient) return false;

    let saved;
    try {
      saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }

    if (!saved?.squadId || !saved?.participant) return false;

    const { data, error } = await supabaseClient
      .from("squads")
      .select("id, nome, turma, descricao, codigo_convite, participantes")
      .eq("id", saved.squadId)
      .maybeSingle();

    if (error || !data) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }

    currentSquad = data;
    currentParticipant = saved.participant;
    await enterSquad(data, saved.participant);
    return true;
  }

  async function handleCreateSquad(event) {
    event.preventDefault();
    if (!supabaseClient) {
      showGateMessage("Supabase não está configurado. Confira supabase.js.", true);
      return;
    }

    const form = event.currentTarget;
    const nome = $("#create-squad-name", form)?.value.trim() || "";
    const turma = $("#create-squad-class", form)?.value.trim() || "";
    const descricao = $("#create-squad-description", form)?.value.trim() || "";
    const rawNames = $("#create-squad-members", form)?.value || "";
    const participantes = [...new Set(
      rawNames.split(/[\\n,;]+/).map((name) => name.trim()).filter(Boolean)
    )];

    if (nome.length < 2 || nome.length > 50 || turma.length < 1 || turma.length > 30) {
      showGateMessage("Informe um nome de squad (2–50 caracteres) e uma turma (1–30 caracteres).", true);
      return;
    }
    if (!participantes.length || participantes.some((name) => name.length < 2 || name.length > 50)) {
      showGateMessage("Informe pelo menos um participante, com nome entre 2 e 50 caracteres.", true);
      return;
    }

    const submit = $('button[type="submit"]', form);
    if (submit) { submit.disabled = true; submit.textContent = "Criando squad…"; }

    try {
      const { data, error } = await supabaseClient
        .from("squads")
        .insert({ nome, turma, descricao, participantes })
        .select("id, nome, turma, descricao, codigo_convite, participantes")
        .single();

      if (error) throw error;
      form.reset();
      await enterSquad(data, participantes[0]);
    } catch (error) {
      console.error("Erro ao criar squad:", error);
      showGateMessage(error.message || "Não foi possível criar o squad. Confira as políticas RLS.", true);
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = "Criar squad e entrar"; }
    }
  }

  async function handleJoinSquad(event) {
    event.preventDefault();
    if (!supabaseClient) {
      showGateMessage("Supabase não está configurado. Confira supabase.js.", true);
      return;
    }

    const form = event.currentTarget;
    const code = $("#join-squad-code", form)?.value.trim().toUpperCase() || "";
    const participant = $("#join-squad-member", form)?.value.trim() || "";

    if (code.length < 6 || participant.length < 2 || participant.length > 50) {
      showGateMessage("Informe um código válido e um nome de participante entre 2 e 50 caracteres.", true);
      return;
    }

    const submit = $('button[type="submit"]', form);
    if (submit) { submit.disabled = true; submit.textContent = "Verificando código…"; }

    try {
      const { data, error } = await supabaseClient.rpc("entrar_squad", {
        p_codigo: code,
        p_participante: participant
      });

      if (error) throw error;
      const joined = Array.isArray(data) ? data[0] : data;
      if (!joined?.id) throw new Error("O código não retornou um squad válido.");

      const { data: squad, error: squadError } = await supabaseClient
        .from("squads")
        .select("id, nome, turma, descricao, codigo_convite, participantes")
        .eq("id", joined.id)
        .single();

      if (squadError) throw squadError;
      form.reset();
      await enterSquad(squad, participant);
    } catch (error) {
      console.error("Erro ao entrar no squad:", error);
      showGateMessage(error.message || "Não foi possível entrar. Confira o código e tente novamente.", true);
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = "Entrar no squad"; }
    }
  }

  function leaveSquad() {
    sessionStorage.removeItem(SESSION_KEY);
    currentSquad = null;
    currentParticipant = "";
    document.body.classList.remove("squad-ready");
    $("#squad-gate").hidden = false;
    $("#squad-session")?.setAttribute("hidden", "");
    state.results = {};
    state.completed = new Set();
    state.remoteRecords = [];
    state.rankingRows = [];
    state.error = "";
    showGateMessage("Você saiu do squad. O progresso continua salvo no banco de dados.");
    loadRankingData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function installSquadEvents() {
    $("#squad-create-form")?.addEventListener("submit", handleCreateSquad);
    $("#squad-join-form")?.addEventListener("submit", handleJoinSquad);
    $("#leave-squad")?.addEventListener("click", leaveSquad);

    $("#copy-invite-code")?.addEventListener("click", async () => {
      const code = currentSquad?.codigo_convite || "";
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        $("#copy-invite-code").textContent = "Código copiado!";
      } catch {
        showGateMessage("Seu código de convite é: " + code);
      }
    });
  }


  /* =======================================================
     19. INICIALIZAÇÃO
     ======================================================= */

  async function init() {
    installMotionStyles();
    installEvents();
    installSquadEvents();
    addTilt();

    try {
      if (window.supabaseReady) {
        supabaseClient = await window.supabaseReady;
      } else if (!supabaseClient && window.supabaseClient?.from) {
        supabaseClient = window.supabaseClient;
      }
    } catch (error) {
      console.error("Falha no carregamento do Supabase:", error);
    }

    if (!supabaseClient || typeof supabaseClient.from !== "function") {
      showGateMessage("Não foi possível carregar o Supabase. Verifique sua conexão e tente atualizar a página.", true);
      return;
    }

    const restored = await restoreSquadSession();
    if (!restored) {
      document.body.classList.remove("squad-ready");
      $("#squad-gate").hidden = false;
      renderTabs();
      await loadRankingData();
    }

    console.info("Detetives da Informação iniciado.", {
      casos: CASES.length,
      supabaseConfigurado: Boolean(supabaseClient),
      squad: currentSquad?.nome || null,
      turma: currentSquad?.turma || null
    });
  }

  init();
})();