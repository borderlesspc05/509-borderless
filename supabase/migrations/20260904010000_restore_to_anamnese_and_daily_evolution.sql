-- Restaura Anamnese TO (UUID próprio) e modelo de Evolução Diária TO.
-- c1000007 ficou com Anamnese Fisioterapia após migration de fisio.

insert into public.document_templates (
  id, name, category, body_html, status, clinical_areas, created_at, updated_at
) values (
  'c1000017-0000-4000-8000-000000000017',
  'Anamnese Terapia Ocupacional 2026',
  'anamnese',
  $body_to_anamnese$
<h2>ANAMNESE — TERAPIA OCUPACIONAL</h2>
<p>
Data da Anamnese: [DATA_SESSAO]<br>
Responsável pela entrevista: [NOME_PROFISSIONAL]<br>
Terapeuta Ocupacional — [CONSELHO_PROFISSIONAL]
</p>

<h3>IDENTIFICAÇÃO</h3>
<p>
Nome da criança: [NOME_PACIENTE]<br>
Data de nascimento: [DATA_NASCIMENTO] &nbsp; Idade (meses e dias na data da anamnese): [IDADE]<br>
Sexo: [SEXO]<br>
Nome da genitora: [NOME_GENITORA]<br>
Nome do genitor: [NOME_GENITOR]<br>
Responsável: [RESPONSAVEL]<br>
Estado civil: [ESTADO_CIVIL]<br>
Telefone (1): [TELEFONE_1]<br>
Telefone (2): [TELEFONE_2]<br>
Endereço: [ENDERECO]<br>
E-mail: [EMAIL]
</p>

<h3>DIAGNÓSTICO E QUEIXA PRINCIPAL</h3>
<p>[DIAGNOSTICO]</p>
<p>[QUEIXA_PRINCIPAL]</p>

<h3>MEDICAMENTOS QUE FAZ USO</h3>
<p>[MEDICAMENTOS]</p>

<h3>HISTÓRIA PREGRESSA (GESTACÃO/PARTO/PUERPÉRIO)</h3>
<p>[HISTORIA_PREGRESSA]</p>

<h3>SAÚDE</h3>
<p>
Idade gestacional: [IDADE_GESTACIONAL]<br>
Peso: [PESO_NASCIMENTO]<br>
Apgar: [APGAR]<br>
Icterícia: [ICTERICIA]<br>
Alta junto da mãe: [ALTA_COM_MAE]<br>
Apresenta alguma alergia (alimentar, medicamento, etc.): [ALERGIAS]
</p>

<h3>HISTÓRICO DO DESENVOLVIMENTO</h3>
<p><em>*Cartilha da criança</em></p>
<p>
( ) Controle Cervical &nbsp; ( ) Rolou &nbsp; ( ) Arrastou &nbsp; ( ) Segurou objetos<br>
( ) Sentou — controle de tronco sem apoio &nbsp; ( ) Engatinhou &nbsp; ( ) Andou sem apoio<br>
( ) Explorar objetos com a boca &nbsp; ( ) Falou
</p>
<p>Do nascimento até o momento atual, há dificuldades relacionadas ao padrão do sono? [DIFICULDADES_SONO]</p>
<p>( ) Bebê agitado &nbsp; ( ) Chorava muito &nbsp; ( ) Excessivamente passivo</p>
<p><strong>Introdução alimentar</strong><br>
Idade: [IDADE_INTRO_ALIMENTAR]<br>
Como a família ofertava os alimentos (inteiros, batidos, amassados): [OFERTA_ALIMENTOS]<br>
Engasgava/engasga com alimentos ou líquidos: [ENGASGO]
</p>
<p>Retirada da fralda / Desfralde: [DESFRALDE]</p>

<h3>ALTERAÇÃO NOS COMPONENTES DO DESEMPENHO MÚSCULO-ESQUELÉTICOS</h3>
<p>
( ) Força &nbsp; ( ) Controle postural &nbsp; ( ) Tônus muscular &nbsp; ( ) Alinhamento postural<br>
( ) ADM &nbsp; ( ) Controle motor / Praxia<br>
( ) Escorrega da cadeira ou se debruça sobre a mesa ou chão quando sentado
</p>
<p>[OBS_MUSCULO_ESQUELETICO]</p>

<h3>COMPONENTES DE DESEMPENHO MOTORES</h3>
<p>
( ) Trocar objeto de mão &nbsp; ( ) Arremessa bola ou objetos &nbsp; ( ) Pega e solta ativamente objetos<br>
( ) Integração bilateral &nbsp; ( ) Integração visomotora (escrever, desenhar, pegar bola, amarrar sapato)<br>
( ) Coordenação motora fina / destreza &nbsp; ( ) Coordenação ampla &nbsp; ( ) Planejamento motor
</p>
<p>Dominância: [DOMINANCIA]</p>

<h3>ALTERAÇÃO NOS COMPONENTES DO DESEMPENHO COGNITIVO E SOCIAL</h3>
<p>
( ) Planejamento e organização &nbsp; ( ) Linguagem &nbsp; ( ) Atenção e concentração<br>
( ) Orientação temporal e espacial &nbsp; ( ) Reconhecimento &nbsp; ( ) Início e término da atividade<br>
( ) Memória &nbsp; ( ) Sequenciamento &nbsp; ( ) Resolução de problemas<br>
( ) Aprendizado &nbsp; ( ) Conduta social &nbsp; ( ) Capacidade para lidar com fatos<br>
( ) Autoexpressão &nbsp; ( ) Valores &nbsp; ( ) Interesses adequados para a idade
</p>
<p>[OBS_COGNITIVO_SOCIAL]</p>

<h3>ESCOLA</h3>
<p>
Nome da escola: [NOME_ESCOLA]<br>
Série: [SERIE]<br>
Contraturno: [CONTRATURNO]<br>
Queixas: [QUEIXAS_ESCOLA]<br>
Possui atendente terapêutico ou cuidador(a): [ATENDENTE_TERAPEUTICO]<br>
Material adaptado: [MATERIAL_ADAPTADO]
</p>

<h3>REPERTÓRIOS</h3>
<p>
Orientação temporal: [REP_ORIENTACAO_TEMPORAL]<br>
Reconhecimento de cores: [REP_CORES]<br>
Reconhecimento de números: [REP_NUMEROS]<br>
Reconhecimento de letras: [REP_LETRAS]<br>
Posiciona a tesoura adequadamente e recorta com destreza esperada para a idade: [REP_TESOURA]<br>
Pinta dentro dos limites da imagem: [REP_PINTURA]<br>
Preensão no lápis: [REP_PREENSAO]<br>
Utilização de borracha e apontador: [REP_BORRACHA]<br>
Sabe montar quebra-cabeças e fazer jogos de encaixe e construções: [REP_QUEBRA_CABECA]<br>
Reconhecimento de nomes — mãe, pai, irmãos: [REP_NOMES_FAMILIA]<br>
Próprio nome: [REP_PROPRIO_NOME]<br>
Escreve: [REP_ESCREVE]
</p>

<h3>COMPREENSÃO</h3>
<p>( ) Boa &nbsp; ( ) Prejudicada &nbsp; — [OBS_COMPREENSAO]</p>

<h3>COMPORTAMENTO</h3>
<p>( ) Agressivo &nbsp; ( ) Passivo &nbsp; ( ) Indiferente às situações</p>
<p>O que fazem: [CONDUTA_FAMILIA]</p>

<h3>ATIVIDADES DE VIDA DIÁRIA</h3>
<p><strong>Higiene:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Controle de esfíncter &nbsp; ( ) Pede para ir ao banheiro &nbsp; ( ) Senta-se ao vaso<br>
( ) Avisa quando molhado &nbsp; ( ) Utiliza papel higiênico &nbsp; ( ) Incomoda-se quando sujo<br>
( ) Lava e enxuga o rosto &nbsp; ( ) Lava as mãos com água e sabão &nbsp; ( ) Seca as mãos
</p>
<p><strong>Banho:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Coopera durante o banho &nbsp; ( ) Ensaboar &nbsp; ( ) Lavar cabelo<br>
( ) Reconhece as partes &nbsp; ( ) Postura durante o banho &nbsp; ( ) Secar
</p>
<p><strong>Higiene bucal:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Segura escova &nbsp; ( ) Coloca creme dental &nbsp; ( ) Gradua força corretamente<br>
( ) Abre e fecha pasta &nbsp; ( ) Escova os dentes &nbsp; ( ) Morde as cerdas<br>
( ) Enxaguar a boca &nbsp; ( ) Cospe &nbsp; ( ) Incomoda-se excessivamente / resiste
</p>
<p><strong>Pentear cabelo:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Leva pente/escova até o cabelo &nbsp; ( ) Desembaraça &nbsp; ( ) Amarra<br>
( ) Resistência em pentear cabelos &nbsp; ( ) Resistência em cortar cabelos
</p>
<p><strong>Vestuário:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Veste-se sozinho &nbsp; ( ) Despe-se sozinho &nbsp; ( ) Ajusta roupa no corpo &nbsp; ( ) Coopera<br>
( ) Reconhece pé correto &nbsp; ( ) Prepara e amarra cadarço &nbsp; ( ) Calça meia &nbsp; ( ) Retira meia<br>
( ) Incomoda-se com etiqueta &nbsp; ( ) Recusa certos tipos de tecidos
</p>
<p><strong>Alimentação:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Come sozinho &nbsp; ( ) Reconhece os alimentos &nbsp; ( ) Utiliza colher &nbsp; ( ) Utiliza garfo e faca<br>
( ) Serve a própria comida
</p>
<p>
Fica muito incomodado quando fica sujo: [INCOMODO_SUJO]<br>
Rejeita muitos tipos de alimentos ou exclui grupos alimentares: [REJEICAO_ALIMENTAR]<br>
Aprendeu a utilizar talheres desde muito cedo: [TALHERES_CEDO]<br>
Aceita comer os alimentos com as mãos: [COME_COM_MAOS]<br>
Local da refeição: [LOCAL_REFEICAO]<br>
Levanta durante a refeição: [LEVANTA_REFEICAO]
</p>

<h3>ROTINA</h3>
<p>
Qual a rotina da criança na maioria dos dias:<br>
Acordar: [ROTINA_ACORDAR]<br>
Hora do café da manhã: [ROTINA_CAFE]<br>
Horário da escola: [ROTINA_ESCOLA]<br>
Horário das refeições: [ROTINA_REFEICOES]<br>
Horário da soneca: [ROTINA_SONECA]<br>
Brincar / TV: [ROTINA_BRINCAR]<br>
Jantar: [ROTINA_JANTAR]<br>
Sono: [ROTINA_SONO]<br>
Tempo diário em telas: [TEMPO_TELAS]
</p>

<h3>SONO</h3>
<p>[OBS_SONO]</p>

<h3>BRINCAR</h3>
<p>[OBS_BRINCAR]</p>

<h3>OBJETIVOS E EXPECTATIVAS DA FAMÍLIA</h3>
<p>[OBJETIVOS_FAMILIA]</p>

<h3>INSTRUMENTOS PADRONIZADOS SUGERIDOS</h3>
<p>[INSTRUMENTOS_SUGERIDOS]</p>

<p>_______________________________________________<br>
[NOME_PROFISSIONAL]<br>
Terapeuta Ocupacional<br>
[CONSELHO_PROFISSIONAL]</p>
$body_to_anamnese$,
  'active',
  array['terapia_ocupacional']::text[],
  now(),
  now()
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  body_html = excluded.body_html,
  status = 'active',
  clinical_areas = array['terapia_ocupacional']::text[],
  updated_at = now();

insert into public.document_templates (
  id, name, category, body_html, status, clinical_areas, created_at, updated_at
) values (
  'c1000018-0000-4000-8000-000000000018',
  'Evolução Diária — Terapia Ocupacional',
  'evolucao_clinica',
  $body_to_evolucao$
<article data-to-evolution="true">
<h2>Evolução — Terapia Ocupacional</h2>
<p><strong>Paciente:</strong> [NOME_PACIENTE] · <strong>Data:</strong> [DATA_SESSAO] · <strong>Hora:</strong> [HORA_SESSAO]</p>
<p><strong>Profissional:</strong> [NOME_PROFISSIONAL] ([CARGO_PROFISSIONAL]) · [CONSELHO_PROFISSIONAL]</p>
<h3>Diagnóstico Terapêutico Ocupacional</h3><p>[DIAGNOSTICO_TO]</p>
<h3>Recursos utilizados</h3><p>[RECURSOS_UTILIZADOS]</p>
<h3>Objetivo da sessão | Metas funcionais</h3><p>[OBJETIVO_SESSAO]</p>
<h3>Descrição do atendimento — recepção e contexto</h3><p>[RECEPCAO_CONTEXTO]</p>
<h3>Engajamento e resposta à intervenção e setting</h3><p>[ENGAJAMENTO]</p>
<h3>Comportamentos interferentes e/ou manejo</h3><p>[COMPORTAMENTOS]</p>
<h3>Desempenho funcional / desempenho ocupacional e processos</h3><p>[DESEMPENHO_FUNCIONAL]</p>
<h3>Observações clínicas estruturadas e não estruturadas</h3><p>[OBS_CLINICAS]</p>
<h3>Aspectos motores, sensoriais, cognitivos e socioemocionais</h3><p>[ASPECTOS_MSC]</p>
<h3>Intercorrências ou fatores contextuais</h3><p>[FATORES_CONTEXTUAIS]</p>
<h3>Nível de assistência requerido</h3><p>[NIVEL_ASSISTENCIA] (IND / DV / DVA / DVI / DG / MOD / AFP / AFT)</p>
<h3>Diretriz para a próxima sessão</h3><p>[PROXIMA_SESSAO]</p>
<h3>Orientações à família / escola</h3><p>[ORIENTACOES_FAMILIA]</p>
</article>
$body_to_evolucao$,
  'active',
  array['terapia_ocupacional']::text[],
  now(),
  now()
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  body_html = excluded.body_html,
  status = 'active',
  clinical_areas = array['terapia_ocupacional']::text[],
  updated_at = now();

-- Garante que o template de fisio no UUID antigo permanece marcado como fisioterapia
update public.document_templates
set clinical_areas = array['fisioterapia']::text[],
    updated_at = now()
where id = 'c1000007-0000-4000-8000-000000000007'
  and name ilike '%fisioterapia%';
