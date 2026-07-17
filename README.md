# 🏥 Cesariana — Descrição Cirúrgica, Evolução PO e Prescrição

**Dr. Rafael Peters | CREMERS 19676**

Sistema completo em **um único arquivo HTML** (`index.html`) para gerar, copiar e colar no prontuário:

1. **Descrição Cirúrgica** de cesariana — 7 presets de técnica (Tradicional, Misgav-Ladach, 3 Camadas, Intraparto, Emergência, Gemelar, Acretismo/PAS), bloco de manejo de HPP, equipe completa (CFM 1.638/2002), checklist OMS, classificação de Robson;
2. **Evolução Pós-Operatória** (SOAP, 1º–3º DPO automático) — alinhada ao ERAS 2025, com escala de dor EVA visual, alertas automáticos de pré-eclâmpsia pós-parto e sepse puerperal;
3. **Prescrição Padrão** (Dia 0 / 1º DPO / Alta) — analgesia multimodal em horário fixo, escore de risco TEV (RCOG 37a) com dose de enoxaparina ajustada por peso/IMC, presets para pré-eclâmpsia (MgSO4), alergias e alto risco de TEV.

## ✨ Como usar

### Offline (computador do hospital)
Copie o `index.html` para o computador (pendrive/WhatsApp/download) e **abra com duplo-clique**. Funciona em qualquer Windows com navegador, **sem internet e sem instalação** — o arquivo é 100% autocontido (sem fontes ou scripts externos).

### Online (link para colegas)
O mesmo arquivo é servido pelo GitHub Pages:
```
https://rafael-peters.github.io/cesariana/
```
Quem abrir o link pode usar direto ou baixar o arquivo para uso offline (Ctrl+S).

## 🔐 Segurança do prontuário

- **Banner fixo** com o nome da paciente sempre visível + botão **"Nova paciente"** que limpa as três abas (evita herdar dados do caso anterior);
- **Aviso automático** se o texto gerado contém campos não preenchidos (`[NOME]`, `[DATA]`...);
- Frases condicionais: nunca imprime "sem intercorrências" quando há intercorrência registrada;
- **Nenhum dado de paciente é salvo** — o armazenamento local guarda apenas listas, equipe frequente e preferências (LGPD);
- Rodapé de rastreabilidade em todo documento gerado.

## ⚙️ Personalização (aba Configurações)

- Cadastro da **equipe frequente** (autocomplete nos campos de equipe);
- Todas as **listas e textos-padrão são editáveis** (indicações, fios, técnicas, doses...);
- **Modo compatibilidade**: copia o texto sem acentos/símbolos para prontuários legados;
- **Modo escuro** para plantão noturno (botão ☀/☾);
- Exportar/importar configurações em JSON (backup entre computadores).

## 📁 Estrutura

| Caminho | Conteúdo |
|---|---|
| `index.html` | **Aplicativo completo** (offline = online, mesmo arquivo) |
| `arquivo/` | Versões anteriores (referência histórica) |
| `Tecnicas_Cesariana_Sintese_Evidencias.docx` | Síntese de evidências das técnicas |

## 📚 Bases de evidência

ERAS Society — cesarean delivery guidelines partes 2 e 3 (atualização 2025) · RCOG Green-top 37a (tromboprofilaxia) · SMFM Consult #51 · 2Close RCT (AJOG 2024, histerorrafia) · técnica endometrium-free (AJOG 2024) · CORONIS/Cochrane (peritônio) · NEJM 2016 (azitromicina adjuvante) · FIGO (HPP 2022, PAS) · OMS (Robson, Checklist Cirurgia Segura) · CFM 1.638/2002 · Lei 9.263/96.

> ⚠️ **Ferramenta de apoio à documentação.** Todo texto gerado (descrição, evolução e principalmente prescrição) deve ser revisado e validado pelo médico assistente antes de inserido/assinado no prontuário.

## 📝 Licença

Uso livre para fins médicos e educacionais.
