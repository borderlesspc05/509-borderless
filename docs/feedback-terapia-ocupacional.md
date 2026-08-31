# Parecer da Terapia Ocupacional — Ajustes no Aplicativo

**Data do feedback:** 28/08/2026  
**Origem:** Agnes Sunderhus Pereira (CREFITO 15 20111 TO) e Paloma Maires Hoppe (CREFITO 15 21537 TO)  
**Status:** Parcialmente implementado

---

## Resumo

A equipe de T.O. identificou três frentes principais:

1. **PEDI** — enunciados devem seguir o manual; variação carro/ônibus nos itens 11–15
2. **Perfil Sensorial** — enunciados oficiais para pontuação fidedigna
3. **Evolução em prontuário** — modelo estruturado de sessão de T.O.

---

## 1. PEDI

### Feedback
- Perguntas precisam estar corretas conforme manual (números fixos no mapa de itens)
- Itens 11–15: variação **carro** ou **ônibus** — preencher apenas uma
- Até revisão completa: uso manual ou site Avalia TO

### Implementado
- [x] Seletor de transporte (carro / ônibus) com reset dos itens MB-11 a MB-15
- [x] Enunciados dinâmicos para transferência carro vs ônibus
- [x] Parte II (cuidador) ASC-MB-02 alinhada ao transporte escolhido
- [x] `transferMode` persistido na avaliação salva
- [x] Aviso clínico na tela de aplicação

### Pendente
- [ ] Auditoria linha a linha dos 197 itens contra folha oficial Avalia TO
- [ ] Tabelas normativas/contínuas oficiais (substituir seeds ilustrativos)
- [ ] Mapa de itens com cores amarelo/azul e linha Rasch (Fase 3)

---

## 2. Perfil Sensorial II

### Feedback
- Perguntas conforme manual; tabela de pontuação com numeração não sequencial
- Até revisão: uso manual ou Avalia TO

### Implementado
- [x] Aviso clínico na tela de aplicação

### Pendente
- [ ] Substituir 32 itens ilustrativos pelos 86 itens oficiais (9 seções)
- [ ] Tabelas normativas oficiais por seção × quadrante × faixa etária
- [ ] Merge automático no relatório TO (`[QUADRO_PERFIL_SENSORIAL]`)

---

## 3. Evolução em prontuário — Terapia Ocupacional

### Modelo solicitado
- Data / Hora
- Diagnóstico Terapêutico Ocupacional
- Recursos utilizados
- Objetivo da sessão | Metas funcionais
- Descrição do atendimento (recepção, engajamento, comportamentos, desempenho funcional)
- Nível de assistência (IND, DV, DVA, DVI, DG, MOD, AFP, AFT)
- Conduta e próximos passos
- Orientações à família / escola

### Implementado
- [x] Aba **Modelo TO** em Evolução Convencional (`/dashboard/evolucao-convencional`)
- [x] Formulário estruturado com todos os campos do parecer
- [x] Geração de HTML para salvamento e exportação em PDF
- [x] Aba **Editor livre** mantida para outras especialidades

---

## Arquivos principais

| Área | Arquivos |
|------|----------|
| PEDI transporte | `src/lib/pedi/transfer-mode.ts`, `src/lib/pedi/item-map.ts` |
| PEDI UI | `src/components/assessments/pedi/pedi-application-page-view.tsx` |
| Evolução TO | `src/lib/terapia-ocupacional/to-evolution.ts`, `src/components/clinical-evolution/to-evolution-structured-form.tsx` |
| Evolução conv. | `src/components/clinical-evolution/conventional-evolution-form.tsx` |

---

## Validação sugerida com a equipe TO

1. PEDI: selecionar ônibus, preencher itens 11–15, salvar e reabrir
2. PEDI: confirmar que carro e ônibus não pontuam juntos
3. Evolução: preencher modelo TO completo, salvar, gerar PDF
4. Comparar enunciados PEDI/Perfil Sensorial com manual e enviar divergências
