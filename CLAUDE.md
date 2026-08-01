# CLAUDE.md — Projeto Cesariana

Guia para trabalhar neste repositório. Leia antes de editar.

## O que é

App médico **single-file** que cobre o **episódio obstétrico completo**: nota de **admissão**, **plano terapêutico**, descrição de **cesariana**, descrição de **parto vaginal**, **evolução pós-parto** (por via), **prescrição** e **alta** (sumário + orientações à paciente + atestados). O médico gera o texto e cola no prontuário. Autor/usuário: **Dr. Rafael Peters — CREMERS 19676**, obstetra, hospital brasileiro sem sistema robusto de prontuário.

Todo o app vive em **`index.html`** (HTML + CSS + JS inline, ~150 KB). Nada mais é código-fonte: `arquivo/` guarda versões antigas (referência), o `.docx` é a síntese de evidências.

## Regra de ouro: um arquivo, dois usos

`index.html` é **ao mesmo tempo**:
- o app **offline** (abre por duplo-clique em `file://` em qualquer Windows do hospital, sem internet);
- o app **online** (é o `index.html` que o **GitHub Pages** serve em `rafael-peters.github.io/cesariana`).

São o mesmo arquivo. Não crie build, não separe versões, não duplique.

## Restrições duras (não quebrar)

1. **Zero recursos externos.** Nada de Google Fonts, CDN, imagens/scripts remotos. Fontes = system stack. Ícones/ilustrações = **SVG inline**. Qualquer `http(s)://` em `src`/`href` quebra o offline.
2. **Funciona em `file://` e navegadores antigos de hospital.** Sem `?.`/`??`, sem APIs sem guarda. Clipboard tem fallback `execCommand` (não remover). `localStorage`/`sessionStorage` sempre em `try/catch`. `matchMedia` com `addEventListener`/`addListener`. CSS: usar `top/right/bottom/left` em vez de `inset`.
3. **Datas à prova de fuso.** Nunca `new Date('YYYY-MM-DD')` (parseia em UTC → sai 1 dia a menos no BRT). Usar parse manual (`dataBR`, `hojeISO`) ou `new Date(iso+'T12:00:00')`.
4. **LGPD.** Nunca persistir dados de paciente. `localStorage` (chave `cesariana_v3_config`) guarda só listas/equipe/preferências; `sessionStorage` (`cesariana_v3_form`) é rascunho volátil da sessão e é apagado em "Nova paciente". **Exceção deliberada:** o Caso Portátil exporta um `.ces` com dados de paciente **cifrado** (PBKDF2 150k + AES-256-GCM, senha mínima 8 chars, nunca armazenada) — é a ponte consultório→hospital sem servidor; não enfraquecer a criptografia nem criar exportação em claro.
5. **Segurança do prontuário.** Frases do texto são **condicionais** aos campos — nunca imprimir "sem intercorrências"/"evolução satisfatória" de forma fixa. Manter banner da paciente, botão "Nova paciente" e o aviso de `[PLACEHOLDER]` no modal.
6. **Conteúdo clínico é sugestão.** Todo texto gerado traz o disclaimer de revisão médica. Não remover.

## Mapa do `index.html`

- **CSS**: tokens em `:root` (+ `[data-theme]` claro/escuro) → topbar/tabs → banner → cards colapsáveis → combos → tabela de suturas → EVA → modal → `@media print` → responsivo.
- **HTML**: `<header>` (marca, tema, 8 abas) → banner paciente (+ faixa de alergias + botões do Caso Portátil) → `<main>` com `#tab-admissao`, `#tab-plano`, `#tab-descricao` (cesárea), `#tab-parto` (vaginal), `#tab-evolucao`, `#tab-prescricao`, `#tab-alta`, `#tab-config` → modais (preview, confirmação, caso) → toast → footer.
- **JS** (blocos): CONFIG (`CONFIG_PADRAO`/`carregarConfig`/`salvarConfig`) · utils (`v`/`setV`/`chk`/`dataBR`/`toAscii`/`esc`) · tema · tabs/cards · combos editáveis · banner/`syncPaciente`/`novaPaciente`/`limparAba` · EVA · tabela de suturas (`CAMADAS`) · útero SVG + alertas · clipboard/modal/toast · autosave · **plano terapêutico (`PLANO_BASE`/`PLANO_MOD`/`PT_CENARIOS`/`gerarPlano`)** · **presets de técnica (`TECNICAS` = fábrica; cópia editável em `CONFIG.tecnicas`)** · **`gerarDescricao`** · evolução (`gerarEvolucao`) · prescrição (`rxTemplates`/`gerarPrescricao`/escore TEV/`doseEnoxa`) · config UI · `init`.

## v4 — blocos novos (resumo para quem for editar)

- **Admissão** (`ad-`): sorologias, GBS, toque com **índice de Bishop** (`calcularBishop`), condutas (`AD_CONDUTAS`), `gerarAdmissao`. A avaliação de risco reusa `PT_CENARIOS` (fonte única).
- **Parto vaginal** (`pv-`): presets em `PARTOS` (espontâneo/induzido/vácuo/fórceps/OASIS), `PV_RESET` evita vazamento entre presets, `perineoGrau()` decide blocos de reparo, `gerarParto` com condutas pós-OASIS (RCOG GTG 29).
- **Evolução por via**: `ev-via` (cesarea/vaginal/oasis) ramifica `gerarEvolucao` (FO×períneo, SVD/curativo só cesárea, itens pós-OASIS). `atualizarViaEvolucao()` sincroniza os grupos visuais — chamar após limpar/restaurar.
- **Alta** (`al-`): `AL_DOC` seleciona sumário/orientações/atestado; `CID_CENARIO` sugere diagnósticos pelos cenários; CID em atestado só com `al-cid-autorizado` (CFM 2.381/2024).
- **Guardas clínicas transversais**: `cenarioAtivo('hiv')` e `cenarioAtivo('obitoFetal')` suprimem/trocam amamentação, "Parabéns", seção RN e alertas neonatais em evolução/sumário/orientações. **Todo texto novo sobre aleitamento/RN deve passar por essas guardas.**
- **Caso Portátil**: `exportarCaso`/`importarCaso` cifram o dump do `sessionStorage`; após importar, chamar `sincronizarUIaposRestauro()` (nunca `alergiaMudou`/`montarRxItens`, que descartariam edições restauradas da prescrição).
- Smoke tests: `scratchpad/smoke.js` … `smoke6.js` (6 suítes históricas, não versionadas; a 6 cobria v4 + roundtrip AES real) e **`scratchpad/smoke7.js` (versionada no repo — presets editáveis/`CONFIG.tecnicas`, estrela de padrão, merge robusto, flag `editado`)**. Rodar `node scratchpad/smoke7.js` antes de considerar pronto.

## Plano Terapêutico: por que é a primeira aba do fluxo do MV

O prontuário do hospital (MV PEP) **bloqueia a Descrição Cirúrgica** até existir o documento "Plano Terapêutico", que tem colunas PROBLEMA e META. Por isso a aba vem primeiro e alimenta as demais (`syncPT`).

- `PLANO_BASE` = 8 problemas que entram sempre; `PLANO_MOD` = modificadores por cenário; `PT_CENARIOS` = checkboxes (alguns com `auto:` que os marca a partir das outras abas).
- **Supressão**: um modificador pode declarar `suprime:['id']` (remove problema+metas+condutas do base) ou `suprimeConduta:['id']` (só as condutas). Existe porque cenários contradizem o base — HIV × meta de amamentar, óbito fetal × Apgar, corioamnionite × profilaxia em dose única. **Ao adicionar cenário novo, verifique se ele contradiz algum problema-base.**
- Metas devem ser **mensuráveis**: verbo + parâmetro + valor-alvo + prazo (exigência de acreditação/auditoria). "Promover alívio da dor" não serve; "manter EVA ≤ 3 em repouso nas primeiras 48 h, reavaliando a cada 6 h" serve.
- O plano é **médico e complementar ao da enfermagem** — não repetir SAE/NANDA (pega, posicionamento, ambiente); focar em diagnóstico, risco, terapêutica, recursos e critérios de alta.

## Dados clínicos ficam em objetos, não espalhados

Opções, textos-padrão e doses vivem em **`CONFIG_PADRAO.listas`** (editável pelo usuário na aba Config, incluindo a escolha da opção padrão por estrela) e em **`TECNICAS`** (presets de fábrica). Os presets também são editáveis pelo usuário: `carregarConfig` clona `TECNICAS` para **`CONFIG.tecnicas`** e mescla overrides salvos (campos/camadas/checks); `aplicarTecnica`, `gerarDescricao` e o sumário de alta leem **`CONFIG.tecnicas`**, nunca `TECNICAS` direto (que serve só de fábrica para `tecRestaurar`). A UI fica na Config → "Presets de Técnica — Cesariana" (`renderTecnicasConfig`), com os valores limitados às listas correspondentes. Para adicionar/alterar conteúdo clínico, edite esses objetos — não hardcode dentro das funções de geração.

## Ao alterar

- Rode o smoke test em jsdom (`scratchpad/smoke.js` — geradores, presets, datas, alertas) e o `node --check` do JS antes de considerar pronto.
- Mudança clínica (doses, condutas, referências) exige revisão de um agente clínico; mudança de fluxo exige revisão de código. Manter as duas passagens separadas da autoria.
- Base de evidência atual: **ERAS 2025** (partes 2 e 3), **RCOG 37a**, **SMFM #51**, **2Close RCT / endometrium-free (AJOG 2024)**, **CORONIS/Cochrane** (peritônio), **NEJM 2016** (azitromicina), **FIGO** (HPP, PAS), **CFM 1.638/2002**, **Lei 9.263/96**. Codeína/tramadol na lactação: cautela (FDA/ANVISA).

## Publicar

Commit + `git push origin main`. O GitHub Pages recompila em ~1-2 min. Não há passo de build.
