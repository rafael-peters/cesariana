# CLAUDE.md — Projeto Cesariana

Guia para trabalhar neste repositório. Leia antes de editar.

## O que é

App médico **single-file** para gerar texto de **descrição cirúrgica de cesariana**, **evolução pós-operatória** e **prescrição padrão**, que o médico copia e cola no prontuário. Autor/usuário: **Dr. Rafael Peters — CREMERS 19676**, obstetra, hospital brasileiro sem sistema robusto de prontuário.

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
4. **LGPD.** Nunca persistir dados de paciente. `localStorage` (chave `cesariana_v3_config`) guarda só listas/equipe/preferências; `sessionStorage` (`cesariana_v3_form`) é rascunho volátil da sessão e é apagado em "Nova paciente".
5. **Segurança do prontuário.** Frases do texto são **condicionais** aos campos — nunca imprimir "sem intercorrências"/"evolução satisfatória" de forma fixa. Manter banner da paciente, botão "Nova paciente" e o aviso de `[PLACEHOLDER]` no modal.
6. **Conteúdo clínico é sugestão.** Todo texto gerado traz o disclaimer de revisão médica. Não remover.

## Mapa do `index.html`

- **CSS**: tokens em `:root` (+ `[data-theme]` claro/escuro) → topbar/tabs → banner → cards colapsáveis → combos → tabela de suturas → EVA → modal → `@media print` → responsivo.
- **HTML**: `<header>` (marca, tema, 4 abas) → banner paciente → `<main>` com `#tab-descricao`, `#tab-evolucao`, `#tab-prescricao`, `#tab-config` → modais (preview e confirmação) → toast → footer.
- **JS** (blocos): CONFIG (`CONFIG_PADRAO`/`carregarConfig`/`salvarConfig`) · utils (`v`/`setV`/`chk`/`dataBR`/`toAscii`/`esc`) · tema · tabs/cards · combos editáveis · banner/`syncPaciente`/`novaPaciente`/`limparAba` · EVA · tabela de suturas (`CAMADAS`) · útero SVG + alertas · clipboard/modal/toast · autosave · **presets de técnica (`TECNICAS`)** · **`gerarDescricao`** · evolução (`gerarEvolucao`) · prescrição (`rxTemplates`/`gerarPrescricao`/escore TEV/`doseEnoxa`) · config UI · `init`.

## Dados clínicos ficam em objetos, não espalhados

Opções, textos-padrão e doses vivem em **`CONFIG_PADRAO.listas`** (editável pelo usuário na aba Config) e em **`TECNICAS`** (presets). Para adicionar/alterar conteúdo clínico, edite esses objetos — não hardcode dentro das funções de geração.

## Ao alterar

- Rode o smoke test em jsdom (`scratchpad/smoke.js` — geradores, presets, datas, alertas) e o `node --check` do JS antes de considerar pronto.
- Mudança clínica (doses, condutas, referências) exige revisão de um agente clínico; mudança de fluxo exige revisão de código. Manter as duas passagens separadas da autoria.
- Base de evidência atual: **ERAS 2025** (partes 2 e 3), **RCOG 37a**, **SMFM #51**, **2Close RCT / endometrium-free (AJOG 2024)**, **CORONIS/Cochrane** (peritônio), **NEJM 2016** (azitromicina), **FIGO** (HPP, PAS), **CFM 1.638/2002**, **Lei 9.263/96**. Codeína/tramadol na lactação: cautela (FDA/ANVISA).

## Publicar

Commit + `git push origin main`. O GitHub Pages recompila em ~1-2 min. Não há passo de build.
