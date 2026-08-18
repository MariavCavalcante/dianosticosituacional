# Painel do Diagnóstico Situacional da Rede de Atenção às Urgências — Goiás

Aplicação web institucional para a Secretaria de Estado da Saúde de Goiás,
consolidando as respostas do Google Forms "DIAGNÓSTICO SITUACIONAL" em
indicadores, gráficos, mapa e tabelas sobre a Rede de Atenção às Urgências do
Estado, com atualização automática a cada nova resposta.

> **Antes de publicar**, leia `docs/identidade-visual.md` (o Brasão Oficial
> ainda precisa ser substituído — este projeto usa um placeholder) e
> `docs/integracao-google-forms.md` (configuração da fonte de dados e do
> gatilho de atualização automática).

## Visão geral técnica

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router.
- **Gráficos**: Recharts. **Mapa**: React-Leaflet + GeoJSON oficial (malha
  municipal do IBGE para Goiás, 246 municípios).
- **Backend**: Netlify Functions (`netlify/functions/dados.ts` e
  `revalidar.ts`), reaproveitando a mesma camada de transformação usada em
  desenvolvimento local (`src/lib/pipeline.ts`).
- **Fonte de dados**: Planilha Google publicada em CSV (ver
  `docs/integracao-google-forms.md`).
- **Sem dependência de banco de dados ou serviços pagos** para esta primeira
  versão.

## Estrutura do projeto

```
src/
  components/     Cabeçalho, filtros, busca avançada, tabela, gráficos, mapa
  pages/          10 páginas temáticas do painel
  lib/            Limpeza, transformação, indicadores, dicionário de dados,
                  paleta de cores, navegação
  data/           GeoJSON dos municípios de Goiás (IBGE)
  types/          Contratos TypeScript compartilhados
  hooks/          useDataset (fetch + atualização automática)
  context/        Estado global de filtros
netlify/functions/  Netlify Functions (produção)
scripts/            Gerador do dicionário de dados + planilha de referência
docs/               Dicionário de dados, metodologia, identidade visual,
                    integração com Google Forms
tests/              Testes com Vitest (limpeza, transformação, indicadores)
```

## Instalação e execução local

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. Sem `GOOGLE_SHEETS_CSV_URL` configurada, o
ambiente local usa automaticamente a planilha de referência
(`scripts/fixtures/planilha-referencia.csv`, com as mesmas 172 respostas
usadas para desenvolver e validar este projeto) — não é necessário nenhum
segredo para rodar o painel localmente.

Para testar contra a planilha real, copie `.env.example` para `.env` e
preencha `GOOGLE_SHEETS_CSV_URL`.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento (Vite + middleware `/api/dados` local) |
| `npm run build` | Verificação de tipos + build de produção (`dist/`) |
| `npm run preview` | Serve o build de produção localmente |
| `npm run typecheck` | Verificação de tipos TypeScript, sem build |
| `npm test` | Roda a suíte de testes (Vitest) |
| `npm run test:watch` | Testes em modo observação |
| `npm run importar-planilha` | Reexecuta o gerador do dicionário de dados a partir da planilha de referência |

## Testes e validação da base

```bash
npm test
```

A suíte cobre limpeza de dados (carimbo, CNES, valores mistos, expressões de
ausência), a transformação completa da planilha de referência real (172
respostas) e os indicadores agregados. Os testes de transformação validam
números específicos da base analisada — 144 municípios, 168 CNES distintos, 4
CNES duplicados, 2 respostas com a categoria residual "Opção 8", Goiânia com 12
respostas e Senador Canedo com 4 — funcionando como regressão contra a
metodologia documentada em `docs/metodologia.md`.

## Publicação no Netlify

1. Suba este repositório para o GitHub.
2. No Netlify: **Add new site → Import an existing project**, conecte o
   repositório. O `netlify.toml` já configura build (`npm run build`),
   diretório de publicação (`dist`) e as funções serverless.
3. Em **Site settings → Environment variables**, configure no mínimo
   `GOOGLE_SHEETS_CSV_URL` (ver `docs/integracao-google-forms.md`). Opcional:
   `REVALIDATE_TOKEN`, `VITE_SYNC_INTERVAL_MS`.
4. Cada push na branch principal gera um novo deploy automaticamente após
   build bem-sucedido — mas **novas respostas do Google Forms aparecem no
   painel sem precisar de novo deploy**, graças à Netlify Function.
5. (Opcional, recomendado) Configure o gatilho `onFormSubmit` do Google Apps
   Script apontando para `/api/revalidar` — ver
   `docs/integracao-google-forms.md`.

## Documentação

- [`docs/dicionario-de-dados.md`](docs/dicionario-de-dados.md) — as 123
  colunas analíticas mapeadas a eixo, indicador, tipo, unidade, regra de
  limpeza e visualização (gerado por `scripts/gerar-dicionario.py`).
- [`docs/metodologia.md`](docs/metodologia.md) — regras de limpeza,
  deduplicação de CNES, tratamento de valores extremos, fórmulas dos
  indicadores e regras dos semáforos.
- [`docs/identidade-visual.md`](docs/identidade-visual.md) — paleta oficial,
  paleta de visualização de dados (e por que o amarelo institucional não é
  usado em gráficos), e a pendência do Brasão Oficial.
- [`docs/integracao-google-forms.md`](docs/integracao-google-forms.md) —
  configuração da fonte de dados, cache/revalidação e atualização automática.

## Pendências institucionais antes da publicação definitiva

Estas decisões dependem da Secretaria de Estado da Saúde de Goiás e não foram
tomadas pela IA que gerou este código (ver também a seção 3 do prompt mestre
original):

1. **Brasão Oficial**: substituir o placeholder em
   `public/assets/brasao-goias-placeholder.svg` pelo arquivo vetorial oficial.
2. **Nível de acesso**: confirmado como **público** para esta versão — o
   painel já foi construído com anonimização completa (sem nome do
   responsável pelo preenchimento, sem exposição da planilha bruta). Se a
   decisão mudar para acesso restrito, será necessário adicionar uma camada de
   autenticação (não incluída nesta v1).
3. **Metas e faixas de alerta**: nenhuma meta clínica/administrativa foi
   inventada — os semáforos usam apenas classificações descritivas. Definir
   metas com as áreas técnicas antes de ativar semáforos avaliativos.
4. **Categoria residual "Opção 8"**: revisar com a equipe que administra o
   Google Forms o que essa opção representa e se deve virar uma categoria
   nomeada.
5. **Fonte geográfica**: o mapa usa a malha municipal do IBGE (`qualidade
   mínima`, 246 municípios) — confirmar se este é o ano/fonte de referência
   desejado institucionalmente.

## Licença / propriedade

Projeto desenvolvido para a Secretaria de Estado da Saúde de Goiás a partir dos
dados fornecidos pela usuária responsável pelo diagnóstico situacional.
