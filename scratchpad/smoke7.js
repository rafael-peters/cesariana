/* Smoke 7 — presets de técnica editáveis (CONFIG.tecnicas) + estrela de opção padrão.
   Roda sem dependências: node scratchpad/smoke7.js
   Avalia o <script> inteiro do index.html num sandbox vm com stubs de DOM/storage. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = html.match(/<script>([\s\S]*)<\/script>/)[1];

// ---- stubs de DOM/storage ----
const store = {};
function fakeClassList(){
  const set = {};
  return {
    add(c){ set[c] = 1; }, remove(c){ delete set[c]; },
    toggle(c, force){ if (force === undefined) { set[c] ? delete set[c] : set[c] = 1; } else if (force) set[c] = 1; else delete set[c]; },
    contains(c){ return !!set[c]; }
  };
}
const els = {};
let elSeq = 0;
function mkEl(tag){
  const el = {
    tagName: (tag || 'div').toUpperCase(), id: 'anon' + (elSeq++),
    value: '', checked: false, disabled: false, textContent: '', className: '',
    dataset: {}, style: {}, options: [], children: [], hidden: false,
    classList: fakeClassList(),
    appendChild(c){ this.children.push(c); return c; },
    addEventListener(){}, removeEventListener(){}, focus(){}, click(){},
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    setAttribute(){}, getAttribute(){ return null; },
    closest(){ return null; }
  };
  let _html = '';
  Object.defineProperty(el, 'innerHTML', {
    get(){ return _html; },
    set(val){ _html = String(val); if (_html === '') el.children.length = 0; }
  });
  el.parentNode = { classList: fakeClassList(), parentNode: { classList: fakeClassList() } };
  return el;
}
function byId(id){ if (!els[id]) { els[id] = mkEl('div'); els[id].id = id; } return els[id]; }
const sandbox = {
  console,
  setTimeout(fn){ return 0; }, clearTimeout(){},
  localStorage: {
    getItem(k){ return store[k] !== undefined ? store[k] : null; },
    setItem(k, val){ store[k] = String(val); },
    removeItem(k){ delete store[k]; }
  },
  sessionStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
  navigator: {},
  document: {
    getElementById: byId,
    createElement(tag){ return mkEl(tag); },
    querySelectorAll(){ return []; },
    querySelector(){ return null; },
    addEventListener(){},
    body: mkEl('body'), documentElement: mkEl('html')
  }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(js, sandbox, { filename: 'inline.js' });
const run = code => vm.runInContext(code, sandbox);
console.log('1. script inteiro avaliado sem erro de sintaxe/top-level');

// ---- carregarConfig sem nada salvo: tecnicas = fábrica ----
run('carregarConfig()');
assert.strictEqual(run('Object.keys(CONFIG.tecnicas).length'), 7, '7 tecnicas');
assert.strictEqual(run('CONFIG.tecnicas.misgav.campos["dc-incisao"]'), 'Joel-Cohen (transversa retilínea, 3 cm abaixo da linha bi-espinhal)');
assert.strictEqual(run('CONFIG.tecnicas.intraparto.checks["dc-azitro"]'), true);
assert.strictEqual(run('CONFIG.tecnicas.misgav.editado'), undefined, 'fabrica nao vem marcada como editada');
console.log('2. carregarConfig sem estado salvo OK');

// ---- editar, salvar, recarregar: overrides + flag editado persistem; resto intacto ----
run('tecSetCampo("misgav", "dc-incisao", "Pfannenstiel (transversa suprapúbica, ~12 cm)");' +
    'CONFIG.tecnicas.misgav.camadas.m1 = [false, "PDS 0", "Pontos separados"];' +
    'CONFIG.tecnicas.intraparto.checks = {};' +
    'salvarConfig(); carregarConfig();');
assert.strictEqual(run('CONFIG.tecnicas.misgav.campos["dc-incisao"]'), 'Pfannenstiel (transversa suprapúbica, ~12 cm)', 'campo editado persistiu');
assert.strictEqual(run('JSON.stringify(CONFIG.tecnicas.misgav.camadas.m1)'), '[false,"PDS 0","Pontos separados"]', 'camada editada persistiu');
assert.strictEqual(run('CONFIG.tecnicas.misgav.editado'), true, 'flag editado persistiu');
assert.strictEqual(run('CONFIG.tecnicas.intraparto.checks["dc-azitro"]'), undefined, 'check desmarcado persistiu');
assert.strictEqual(run('CONFIG.tecnicas.emergencia.checks["dc-azitro"]'), true, 'tecnica nao editada intacta');
assert.strictEqual(run('CONFIG.tecnicas.emergencia.editado'), undefined, 'tecnica nao editada sem flag');
console.log('3. roundtrip salvar/recarregar OK');

// ---- dado corrompido nao derruba o merge (validacao completa das 3 posicoes) ----
run('localStorage.setItem(LS_KEY, JSON.stringify({ listas: {}, tecnicas: { misgav: { camadas: { m1: "lixo", m2: [true, {a:1}, null], pele: [true, "Nylon 3-0"] }, campos: { "dc-incisao": 42 } }, fantasma: {} } })); carregarConfig();');
assert.strictEqual(run('CONFIG.tecnicas.misgav.campos["dc-incisao"]'), 'Joel-Cohen (transversa retilínea, 3 cm abaixo da linha bi-espinhal)', 'campo invalido ignorado');
assert.strictEqual(run('CONFIG.tecnicas.misgav.camadas.m1[0]'), true, 'camada string ignorada');
assert.strictEqual(run('JSON.stringify(CONFIG.tecnicas.misgav.camadas.m2)'), '[false]', 'camada com objeto/null nas posicoes 1-2 rejeitada (fica a de fabrica)');
assert.strictEqual(run('JSON.stringify(CONFIG.tecnicas.misgav.camadas.pele)'), '[true,"Nylon 3-0"]', 'camada valida parcial aceita');
assert.strictEqual(run('CONFIG.tecnicas.fantasma'), undefined, 'tecnica desconhecida ignorada');
run('localStorage.setItem(LS_KEY, "{not json"); carregarConfig();');
assert.strictEqual(run('Object.keys(CONFIG.tecnicas).length'), 7, 'JSON corrompido cai na fabrica');
console.log('4. merge robusto a dados corrompidos OK');

// ---- renderTecnicasConfig monta 7 secoes; option com value=; disabled em camada off ----
run('carregarConfig(); renderTecnicasConfig()');
assert.strictEqual(run('document.getElementById("cfgTecnicas").children.length'), 7, '7 secoes renderizadas');
const secHtml = run('document.getElementById("cfgTecnicas").children[1].innerHTML'); // misgav
assert(secHtml.indexOf('Misgav-Ladach (Stark)') !== -1, 'rotulo no header');
assert(secHtml.indexOf('Suturas') !== -1, 'secao de suturas');
assert(secHtml.indexOf('tecSetCampo(') !== -1 && secHtml.indexOf('tecSetCamada(') !== -1 && secHtml.indexOf('tecRestaurar(') !== -1, 'handlers ligados');
assert((secHtml.match(/tec-cam[ "]/g) || []).length >= 9, '9 linhas de sutura');
assert(secHtml.indexOf('<option value="') !== -1, 'options com atributo value (preserva espacos)');
assert(secHtml.indexOf(' disabled ') !== -1 || secHtml.indexOf(' disabled>') !== -1, 'selects de camada desligada desabilitados');
assert(secHtml.indexOf('tec-mod') !== -1, 'badge modificado presente no header');
console.log('5. render da Config OK');

// ---- setters gravam, salvam e marcam editado; restaurar limpa ----
run('tecSetCampo("misgav", "dc-histerotomia", "Segmentar vertical")');
assert.strictEqual(run('CONFIG.tecnicas.misgav.campos["dc-histerotomia"]'), 'Segmentar vertical');
assert.strictEqual(run('CONFIG.tecnicas.misgav.editado'), true, 'tecSetCampo marca editado');
assert(store['cesariana_v3_config'].indexOf('Segmentar vertical') !== -1, 'salvo no localStorage');
run('document.getElementById("cfgtec-misgav-pele-on").checked = false;' +
    'document.getElementById("cfgtec-misgav-pele-fio").value = "Nylon 4-0";' +
    'document.getElementById("cfgtec-misgav-pele-tec").value = "Pontos separados";' +
    'tecSetCamada("misgav", "pele")');
assert.strictEqual(run('JSON.stringify(CONFIG.tecnicas.misgav.camadas.pele)'), '[false,"Nylon 4-0","Pontos separados"]', 'tecSetCamada gravou triplo');
run('tecSetCheck("tradicional", "dc-azitro", true)');
assert.strictEqual(run('CONFIG.tecnicas.tradicional.checks["dc-azitro"]'), true);
run('tecRestaurar("misgav")');
assert.strictEqual(run('CONFIG.tecnicas.misgav.campos["dc-histerotomia"]'), 'Segmentar transversa (Kerr)', 'restaurar volta a fabrica');
assert.strictEqual(run('CONFIG.tecnicas.misgav.editado'), undefined, 'restaurar limpa flag editado');
console.log('6. setters e restaurar OK');

// ---- listas: estrela de padrao; remover opcao padrao deixa sem padrao; add re-renderiza presets ----
run('renderListasConfig()');
const listaHtml = run('document.getElementById("cfgListas").children[1].innerHTML'); // anestesias
assert(listaHtml.indexOf('★') !== -1 && listaHtml.indexOf('☆') !== -1, 'estrelas no render das listas');
run('setPadraoLista("anestesias", 2)');
assert.strictEqual(run('CONFIG.listas.anestesias.padrao'), run('CONFIG.listas.anestesias.opcoes[2]'), 'padrao trocado');
run('setPadraoLista("anestesias", 2)');
assert.strictEqual(run('CONFIG.listas.anestesias.padrao'), '', 'toggle remove padrao');
run('CONFIG.listas.liquidos.padrao = CONFIG.listas.liquidos.opcoes[0]; removerOpcao("liquidos", 0)');
assert.strictEqual(run('CONFIG.listas.liquidos.padrao'), '', 'remover a opcao padrao deixa campo sem padrao');
run('document.getElementById("cfg-add-fios").value = "Fio de teste 9-0"; addOpcao("fios")');
const secDepois = run('document.getElementById("cfgTecnicas").children[0].innerHTML');
assert(secDepois.indexOf('Fio de teste 9-0') !== -1, 'addOpcao re-renderiza selects dos presets');
console.log('7. estrela de padrao e sincronizacao listas->presets OK');

// ---- aplicarTecnica usa CONFIG.tecnicas; gerarDescricao reflete edicao e omite ref de fabrica ----
run('localStorage.removeItem(LS_KEY); carregarConfig(); var __captura = ""; abrirModal = function(titulo, texto){ __captura = texto; };');
run('aplicarTecnica("tradicional", null, true); gerarDescricao();');
let desc = run('__captura');
assert(desc.indexOf('DESCRIÇÃO CIRÚRGICA — CESARIANA') === 0, 'gerarDescricao ok');
assert(desc.indexOf('Referência da técnica:') !== -1, 'preset de fabrica imprime referencia');
assert(desc.indexOf('preset personalizado') === -1, 'preset de fabrica sem aviso de personalizacao');
run('tecSetCampo("tradicional", "dc-incisao", "Mediana infraumbilical"); aplicarTecnica("tradicional", null, true); gerarDescricao();');
desc = run('__captura');
assert.strictEqual(run('document.getElementById("dc-incisao").value'), 'Mediana infraumbilical', 'preset aplicado usa valor editado');
assert(desc.indexOf('preset personalizado pelo cirurgião') !== -1, 'nome sinaliza personalizacao');
assert(desc.indexOf('Referência da técnica:') === -1, 'referencia de fabrica omitida em preset editado');
assert(desc.indexOf('referência bibliográfica de fábrica foi omitida') !== -1, 'aviso de omissao presente');
console.log('8. aplicarTecnica/gerarDescricao com preset editado OK');

console.log('\nsmoke7: todos os testes passaram');
