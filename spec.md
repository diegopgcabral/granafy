Sim. E para o Granafy eu concordo com você: **começaria monolítico**.

Na verdade, acho que é uma decisão melhor para esse projeto do que separar frontend + backend agora. Você vai desenvolver sozinho, quer colocar no ar rapidamente e ainda está aprendendo/experimentando a arquitetura com IA. Um monólito bem organizado permite crescer bastante sem criar complexidade prematura.

Abaixo está um documento que você pode usar como **especificação inicial do projeto e como contexto para o Codex**.

# Granafy

## Seu copiloto financeiro pessoal

O Granafy é uma aplicação web de gestão financeira pessoal, desenvolvida para substituir uma planilha de controle financeiro por uma aplicação moderna, acessível de qualquer lugar e preparada para utilizar Inteligência Artificial como interface de interação.

A aplicação deverá ser totalmente hospedada na nuvem, permitindo acesso pelo computador, notebook, tablet ou celular.

O projeto será desenvolvido inicialmente como um **monólito modular**, evitando microserviços e complexidade desnecessária.

---

# 1. Objetivo do projeto

O objetivo inicial do Granafy é permitir que o usuário acompanhe:

- Receitas
- Despesas
- Pagamentos
- Saldo mensal
- Fechamento financeiro
- Investimentos
- Patrimônio
- Evolução financeira

Além da interface tradicional, o sistema terá um **Copilot financeiro baseado em LLM**, permitindo que o usuário interaja com o sistema através de linguagem natural.

Exemplos:

> "Cadastrar uma nova despesa de condomínio de R$ 850."

> "Paguei a conta de luz hoje, R$ 192,40."

> "Quanto eu gastei com alimentação esse mês?"

> "Quanto ainda falta pagar esse mês?"

> "Quanto tenho disponível para investir?"

> "Quanto meu patrimônio cresceu nos últimos 6 meses?"

O LLM não deverá acessar diretamente o banco de dados.

Ele deverá interpretar a intenção do usuário e utilizar ferramentas/domínios disponibilizados pela aplicação.

---

# 2. Princípio arquitetural

O Granafy será inicialmente um:

**Monólito modular**

Não será utilizado:

- Microservices
- Kubernetes
- múltiplos backends
- múltiplos repositórios
- filas distribuídas sem necessidade
- infraestrutura complexa

A aplicação será um único projeto.

```text
                    ┌─────────────────────┐
                    │       Vercel        │
                    │                     │
                    │      Granafy        │
                    │                     │
                    │  Next.js            │
                    │  React               │
                    │  TypeScript         │
                    │                     │
                    │  UI                  │
                    │  Server             │
                    │  Business Logic     │
                    │  API                │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌───────────┐    ┌───────────┐   ┌───────────┐
        │ Supabase  │    │  LLM API  │   │   Future  │
        │           │    │           │   │ Services  │
        │ PostgreSQL│    │ OpenAI/...│   │           │
        │ Auth      │    │           │   │           │
        └───────────┘    └───────────┘   └───────────┘
```

---

# 3. Stack tecnológica

## Frontend + Backend

### Next.js

O Next.js será utilizado como framework principal.

A aplicação deverá utilizar:

- React
- TypeScript
- Next.js App Router
- Server Components quando fizer sentido
- Server Actions quando fizer sentido
- Route Handlers para APIs
- Client Components somente quando necessários

O objetivo é evitar separar frontend e backend prematuramente.

---

# 4. Banco de dados

O banco será:

**PostgreSQL hospedado no Supabase.**

Não haverá dependência de PostgreSQL local para o funcionamento da aplicação.

O banco deverá estar disponível na nuvem desde o início.

Arquitetura:

```text
Next.js
   ↓
Database layer
   ↓
Supabase
   ↓
PostgreSQL
```

O projeto deverá utilizar migrations para controlar alterações no banco.

---

# 5. Autenticação

A autenticação será inicialmente feita utilizando **Supabase Auth com Google OAuth**.

O primeiro fluxo de acesso será exclusivamente o login com a conta Google. Cadastro por e-mail e senha, recuperação de senha e outros provedores ficam fora do escopo inicial e só entram mediante necessidade explícita.

O sistema deverá ser preparado para múltiplos usuários.

Mesmo que inicialmente apenas uma pessoa utilize o sistema, todas as entidades financeiras deverão estar associadas a um usuário.

Exemplo:

```text
users
   ↓
expenses
income
investments
accounts
patrimony
```

Nenhum usuário poderá acessar dados financeiros de outro usuário.

A segurança deverá ser reforçada utilizando Row Level Security (RLS) no PostgreSQL/Supabase.

---

# 6. Hospedagem

A aplicação será hospedada na:

**Vercel**

O código ficará no GitHub.

Fluxo:

```text
Developer
    ↓
Git
    ↓
GitHub
    ↓
Vercel
    ↓
Build
    ↓
Deploy
```

Cada push para a branch principal poderá gerar automaticamente um novo deploy.

---

# 7. Estrutura inicial do projeto

A estrutura deverá ser simples e organizada.

Uma sugestão:

```text
granafy/
├── app/
│   ├── dashboard/
│   ├── expenses/
│   ├── income/
│   ├── investments/
│   ├── patrimony/
│   ├── copilot/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── expenses/
│   ├── income/
│   ├── investments/
│   └── copilot/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── ai/
│   ├── financial/
│   └── validations/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── tests/
│
├── .env.local
├── .gitignore
├── AGENTS.md
├── README.md
├── package.json
└── ...
```

A estrutura poderá evoluir conforme o projeto crescer.

Não criar abstrações apenas por antecipação.

---

# 8. Módulos do sistema

O sistema será dividido conceitualmente em módulos.

## Dashboard

Visão geral da situação financeira.

Informações iniciais:

- Receita do mês
- Despesas do mês
- Total pago
- Total pendente
- Saldo disponível
- Investimentos
- Patrimônio
- Evolução financeira

---

# 9. Receitas

O módulo de receitas deverá permitir cadastrar entradas financeiras.

Exemplos:

- Salário
- Benefícios
- Reembolsos
- Rendimentos
- Outros recebimentos

Campos iniciais:

```text
id
user_id
description
amount
date
category
status
notes
created_at
updated_at
```

Exemplo:

```text
Salário
R$ 20.000
05/10/2026
```

---

# 10. Despesas

Esse será um dos principais módulos do MVP.

Uma despesa deverá possuir:

```text
id
user_id
description
reference_amount
paid_amount
due_date
paid_at
category
status
notes
created_at
updated_at
```

Exemplo:

```text
Condomínio

Valor previsto: R$ 850,00
Valor pago:     R$ 850,00

Vencimento: 10/10/2026
Status: Pago
```

A ideia vem diretamente do modelo utilizado anteriormente em planilha.

---

# 11. Status das despesas

Inicialmente:

```text
PENDING
PAID
PARTIAL
CANCELLED
```

Exemplo:

```text
Condomínio      R$ 850    Pago
Energia         R$ 190    Pago
Internet        R$ 120    Pendente
Cartão          R$ 4.200  Parcial
```

---

# 12. Fechamento mensal

O sistema deverá permitir visualizar o mês financeiro.

Exemplo:

```text
OUTUBRO/2026

Receitas
----------------
Salário          R$ 20.000
Reembolso         R$ 500

Total             R$ 20.500


Despesas
----------------
Pagas             R$ 8.200
Pendentes         R$ 3.100

Total             R$ 11.300


Saldo
----------------
R$ 9.200
```

Os valores deverão ser calculados pelo backend/banco.

O LLM nunca deverá ser responsável por realizar cálculos financeiros críticos.

---

# 13. Investimentos

O módulo de investimentos será implementado após o MVP financeiro.

Deverá permitir acompanhar diferentes tipos de ativos.

Exemplos:

```text
Renda fixa
Ações
FIIs
ETFs
Criptomoedas
Exterior
```

Exemplos de ativos:

```text
BRCO11
QQQ
VT
Bitcoin
CDB
```

O sistema deverá permitir acompanhar:

- quantidade
- preço médio
- valor investido
- valor atual
- rentabilidade
- dividendos
- aportes
- retiradas

---

# 14. Patrimônio

O módulo de patrimônio deverá consolidar os ativos financeiros e outros patrimônios cadastrados.

Exemplo:

```text
Patrimônio

Investimentos       R$ 150.000
Conta corrente       R$ 20.000
Cripto               R$ 10.000
Outros               R$ 30.000

Total               R$ 210.000
```

No futuro:

```text
Patrimônio
    ├── Dinheiro
    ├── Investimentos
    ├── Cripto
    ├── Veículos
    ├── Imóveis
    └── Outros
```

---

# 15. Copilot

O Copilot será uma das principais funcionalidades do Granafy.

Ele permitirá utilizar linguagem natural para interagir com o sistema.

Exemplo:

```text
Usuário:

"Paguei a conta de luz de R$ 182,50."
```

O sistema deverá:

```text
Usuário
   ↓
LLM
   ↓
Interpretar intenção
   ↓
Encontrar despesa
   ↓
Executar ferramenta
   ↓
Atualizar banco
   ↓
Retornar resultado
```

Resposta:

```text
Conta de luz marcada como paga por R$ 182,50.
```

---

# 16. O LLM não terá acesso direto ao banco

Essa é uma regra arquitetural importante.

Não fazer:

```text
LLM
 ↓
SQL
 ↓
Database
```

Fazer:

```text
LLM
 ↓
Tool
 ↓
Business Logic
 ↓
Database
```

Exemplo:

```text
markExpenseAsPaid({
  expenseId,
  paidAmount
})
```

Outro exemplo:

```text
createExpense({
  description,
  referenceAmount,
  dueDate
})
```

Outro:

```text
getMonthlySummary({
  month
})
```

O LLM apenas decide qual ferramenta utilizar.

---

# 17. Ferramentas do Copilot

Inicialmente:

```text
createExpense
findExpense
updateExpense
markExpenseAsPaid
cancelExpense

createIncome
findIncome
updateIncome

getMonthlySummary
getExpenses
getIncome

getPortfolio
getPatrimony
```

No futuro:

```text
createInvestment
registerInvestmentTransaction
getInvestmentPerformance
getPatrimonyEvolution
simulateInvestment
```

---

# 18. Confirmação de operações críticas

O Copilot não deverá executar operações potencialmente destrutivas sem confirmação.

Exemplo:

```text
Usuário:

"Apague a despesa de R$ 5.000."
```

O sistema:

```text
Encontrei:

Cartão de crédito
R$ 5.000

Deseja realmente excluir essa despesa?
```

Somente após confirmação a operação será executada.

Isso deverá ser aplicado principalmente a:

- exclusão
- alteração de valores relevantes
- investimentos
- vendas
- alterações patrimoniais

---

# 19. Inteligência Artificial

O projeto deverá ser independente do provedor de LLM.

Criar uma camada:

```text
lib/ai/
```

Por exemplo:

```text
lib/ai/
├── provider.ts
├── tools.ts
├── prompts.ts
└── types.ts
```

O restante da aplicação não deverá depender diretamente de uma implementação específica.

Assim será possível trocar:

```text
OpenAI
Claude
Gemini
outro provedor
```

sem reescrever o sistema inteiro.

---

# 20. Regra importante sobre IA

Não utilizar LLM para aquilo que o sistema consegue fazer melhor.

Por exemplo:

Não pedir ao LLM:

> "Some todas as despesas."

O backend deverá fazer:

```text
SELECT SUM(...)
```

O LLM pode apenas transformar o resultado em uma resposta amigável.

```text
Database
   ↓
R$ 8.523,40
   ↓
LLM
   ↓
"Você gastou R$ 8.523,40 este mês."
```

Isso reduz custo e aumenta a confiabilidade.

---

# 21. Segurança

Como o Granafy trabalha com dados financeiros, segurança deverá ser considerada desde o início.

Regras:

- Nunca armazenar API keys no código.
- Utilizar environment variables.
- Nunca enviar secrets para o frontend.
- Utilizar Supabase RLS.
- Toda entidade financeira deverá possuir `user_id`.
- Validar dados no backend.
- Nunca confiar em valores enviados pelo frontend.
- Validar permissões antes de qualquer operação.
- Não permitir acesso direto do LLM ao banco.
- Registrar operações importantes.

---

# 22. Environment variables

Localmente:

```text
.env.local
```

Exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

DATABASE_URL=

LLM_API_KEY=
```

Na Vercel, essas variáveis deverão ser configuradas no projeto.

O arquivo `.env.local` nunca deverá ser commitado.

---

# 23. Interface

A interface deverá ser moderna e simples.

Referências conceituais:

- Nubank
- Inter
- Linear
- Vercel
- Stripe

Não copiar interfaces.

Utilizar como referência de:

- simplicidade
- espaçamento
- hierarquia visual
- dashboards
- navegação

Layout inicial:

```text
┌──────────────────────────────────────────────┐
│ GRANAfy                                      │
├──────────────┬───────────────────────────────┤
│              │                               │
│ Dashboard    │                               │
│              │        Dashboard              │
│ Receitas     │                               │
│ Despesas     │        Cards                  │
│              │                               │
│ Investimentos│        Gráficos               │
│              │                               │
│ Patrimônio   │                               │
│              │                               │
│ Copilot      │                               │
│              │                               │
└──────────────┴───────────────────────────────┘
```

O Copilot deverá possuir uma interface própria semelhante a um chat.

---

# 24. Organização do desenvolvimento

O desenvolvimento será guiado por entregas pequenas, utilizáveis e publicadas. Uma etapa só começa quando a anterior estiver funcional em produção ou quando a dependência estiver explicitamente resolvida.

Cada etapa deve conter:

- um objetivo único;
- alterações de banco, backend e interface necessárias para esse objetivo;
- validações de autorização, dados e regras financeiras aplicáveis;
- uma verificação manual do fluxo principal;
- um commit claro e deploy de preview antes de ir para `main`.

Não abrir uma etapa futura para compensar lacunas da etapa atual. Investimentos, patrimônio e Copilot ficam fora do MVP.

## Marco A — Aplicação acessível

### Etapa A1 — Base do projeto

Criar e versionar o projeto com Next.js, TypeScript, App Router, Tailwind, ESLint, Prettier, shadcn/ui, README e `AGENTS.md`. Configurar os scripts de desenvolvimento, lint, checagem de tipos e build.

**Critério de aceite:** qualquer pessoa do time consegue clonar o repositório, seguir o README, executar a aplicação e concluir `lint`, checagem de tipos e build sem erros.

### Etapa A2 — Serviços em nuvem e deploy

Criar os projetos no Supabase e na Vercel, conectar o repositório GitHub e configurar as variáveis de ambiente de desenvolvimento, preview e produção. Publicar uma página inicial mínima.

**Critério de aceite:** um push para a branch principal publica a aplicação; nenhum segredo está versionado; a URL de produção responde corretamente.

## Marco B — Acesso isolado por usuário

### Etapa B1 — Modelo de identidade e segurança

Definir como o usuário autenticado será relacionado às tabelas financeiras. Criar as migrations iniciais para os dados de perfil que forem realmente necessários e ativar RLS no Supabase antes de inserir dados financeiros.

**Critério de aceite:** as políticas permitem a cada usuário ler e alterar somente seus próprios registros, inclusive quando uma chamada é feita diretamente ao Supabase com a sessão desse usuário.

### Etapa B2 — Autenticação e rotas protegidas

Implementar login com Google OAuth, logout, recuperação de sessão, redirecionamento de rotas privadas e estado de carregamento. A interface autenticada deve exibir o usuário atual e oferecer saída da conta.

**Critério de aceite:** um visitante não acessa rotas financeiras; o login Google retorna à aplicação com uma sessão válida; ao sair, a sessão e os redirecionamentos funcionam; duas contas não enxergam a área de dados uma da outra.

## Marco C — Fundamento financeiro

### Etapa C1 — Contratos do domínio e banco inicial

Modelar apenas `income` e `expenses`, com `user_id`, valores monetários armazenados de forma precisa, datas, categoria, observações, timestamps e os status de despesas definidos nesta especificação. Criar migrations, índices e constraints necessárias.

Definir no código os contratos de validação, as operações de domínio e as consultas de resumo mensal. A interface não deve conter cálculo de saldo, pagamento parcial ou status.

**Critério de aceite:** migrations podem ser aplicadas do zero; valores inválidos, registros sem usuário e alterações em registros de outro usuário são rejeitados; os totais mensais são calculados no servidor ou banco.

### Etapa C2 — Navegação e estrutura da área financeira

Criar o layout autenticado com navegação para Dashboard, Receitas e Despesas. Incluir estados vazios, de carregamento e de erro, além de uma convenção única para selecionar o mês de referência.

**Critério de aceite:** o usuário navega entre os três módulos, entende quando não há lançamentos e pode escolher um mês sem perder o contexto da rota.

## Marco D — MVP utilizável

### Etapa D1 — Receitas

Entregar listagem mensal, criação, edição, exclusão, categoria e total do mês. Aplicar filtros somente se forem necessários para localizar lançamentos reais; começar pelo filtro de mês.

**Critério de aceite:** uma receita criada aparece apenas para seu proprietário, pode ser corrigida ou removida, e o total exibido corresponde aos lançamentos do mês selecionado.

### Etapa D2 — Despesas básicas

Entregar listagem mensal, criação, edição, exclusão, categoria, vencimento e status inicial `PENDING`. Exibir valor previsto, valor pago e valor pendente segundo as regras do domínio.

**Critério de aceite:** o usuário consegue reproduzir na aplicação todas as despesas planejadas de sua planilha e identificar quais estão pendentes no mês selecionado.

### Etapa D3 — Pagamento e ciclo da despesa

Implementar marcar como paga, pagamento parcial e cancelamento. Cada transição deve validar o estado atual, o valor informado e a autorização do usuário. Exclusão e alterações relevantes devem pedir confirmação na interface.

**Critério de aceite:** uma despesa percorre corretamente `PENDING`, `PARTIAL`, `PAID` e `CANCELLED`; valores pagos nunca excedem o previsto sem uma regra explícita aprovada; os totais do mês são atualizados após cada alteração.

### Etapa D4 — Dashboard e fechamento mensal

Montar o resumo do mês com receitas, despesas previstas, total pago, total pendente e saldo. A página de fechamento pode reutilizar o mesmo conjunto de cálculos, apresentando os lançamentos que formam cada total.

Gráficos só entram se responderem a uma pergunta útil com dados reais. O primeiro fechamento não exige gráficos nem comparações históricas.

**Critério de aceite:** para um mês com lançamentos conhecidos, os valores do Dashboard e do Fechamento batem entre si e com os registros de Receitas e Despesas.

### Etapa D5 — Pronto para uso diário

Revisar responsividade, mensagens de erro, estados vazios, acessibilidade básica, formatação monetária e de datas para pt-BR, além da experiência em celular. Corrigir os problemas encontrados no uso real e documentar o fluxo de deploy e recuperação de dados.

**Critério de aceite:** o usuário consegue registrar receita, criar despesa, registrar um pagamento e conferir o saldo mensal em celular e desktop. Este é o encerramento do MVP.

## Marco E — Evolução após o MVP

As etapas abaixo só devem ser priorizadas após uso real do MVP. A próxima escolha será feita pela necessidade mais frequente ou pelo maior risco operacional observado.

### Etapa E1 — Copilot financeiro

Criar primeiro a camada de ferramentas sobre as regras de domínio já existentes. Implementar uma ferramenta por vez, começando por `createExpense`, `findExpense`, `markExpenseAsPaid`, `createIncome`, `getMonthlySummary` e `getExpenses`.

O modelo de linguagem interpreta a intenção e chama ferramentas autorizadas; ele não gera SQL, não acessa o banco diretamente e não calcula valores financeiros críticos. Operações destrutivas, alterações relevantes e ações patrimoniais exigem confirmação explícita antes da execução.

**Critério de aceite:** cada ação do Copilot produz o mesmo resultado e respeita as mesmas permissões da interface convencional; uma solicitação ambígua pede esclarecimento e uma ação crítica pede confirmação.

### Etapa E2 — Investimentos

Quando o fluxo financeiro estiver estável, criar contas ou corretoras, ativos e transações de aporte e venda. Começar por quantidade, preço médio e valor investido; cotações e rentabilidade automatizadas só entram com uma fonte de dados definida.

**Critério de aceite:** o usuário consegue registrar e auditar a origem de cada posição, sem misturar movimentações de investimento com receitas e despesas comuns.

### Etapa E3 — Patrimônio e evolução

Consolidar caixa, investimentos, cripto e outros ativos a partir de fontes identificáveis. Registrar snapshots ou outra estratégia explícita de histórico antes de apresentar evolução patrimonial.

**Critério de aceite:** o total patrimonial pode ser explicado pelos itens que o compõem e a evolução mostra uma data de referência clara.

### Etapa E4 — Inteligência financeira

Adicionar análises e projeções somente quando houver histórico suficiente e premissas visíveis. Consultas como gasto por categoria e evolução mensal devem usar consultas do banco; simulações devem declarar prazo, taxa, aportes e demais hipóteses.

**Critério de aceite:** toda resposta analítica informa período, fonte dos dados e premissas; os números podem ser reproduzidos sem depender da resposta do LLM.

## Backlog de produto

### Duplicar despesas ao avançar o ciclo financeiro

Ao navegar para um novo ciclo financeiro, oferecer uma ação explícita para duplicar as despesas do ciclo anterior. A ação deverá permitir revisar quais lançamentos serão copiados antes de confirmar.

Cada cópia deve pertencer ao novo ciclo, ter a data de vencimento ajustada para o período correspondente e iniciar com `PENDING`, valor pago igual a zero e sem data de pagamento. Nenhum pagamento, status `PARTIAL` ou `PAID`, nem observação de quitação deve ser carregado da despesa original. A operação deve ser idempotente ou informar claramente quais despesas já foram duplicadas, evitando lançamentos repetidos.

## Regras de priorização

Ao terminar cada etapa, registrar problemas observados e escolher a próxima tarefa nesta ordem:

1. falha de segurança, perda ou inconsistência de dados;
2. bloqueio do fluxo diário de registrar, pagar ou consultar valores;
3. correção que reduz trabalho manual da planilha;
4. melhoria de clareza ou experiência de uso;
5. funcionalidade futura.

Uma funcionalidade nova só entra na etapa atual se for necessária para cumprir o critério de aceite dela. Caso contrário, ela entra no backlog com uma frase descrevendo o problema que resolve.

---

# 25. Desenvolvimento com Codex

O Codex deverá ser utilizado como parceiro de desenvolvimento, não como gerador de um projeto inteiro de uma única vez.

Evitar prompts como:

> "Crie todo o Granafy."

Preferir tarefas pequenas e verificáveis.

Exemplo:

> Implemente a autenticação utilizando Supabase Auth. Antes de alterar qualquer arquivo, analise a estrutura atual do projeto. Mantenha a arquitetura monolítica e não introduza abstrações desnecessárias.

Depois:

> Implemente o módulo de despesas. Crie migration, schema, validações, repository/service quando necessário, componentes de UI e testes. Não implemente funcionalidades de investimentos ou Copilot ainda.

Depois:

> Implemente a ação de marcar uma despesa como paga.

Cada alteração deverá ser pequena o suficiente para ser revisada.

---

# 26. AGENTS.md

O projeto deverá possuir um `AGENTS.md` na raiz.

Esse arquivo deverá explicar ao Codex:

- objetivo do projeto
- arquitetura
- stack
- regras de código
- convenções
- comandos
- regras de segurança
- o que não fazer

Exemplo de princípios:

```text
1. Keep the application modular but monolithic.
2. Avoid premature abstractions.
3. Prefer readable code over clever code.
4. Do not introduce microservices.
5. Business rules must stay outside UI components.
6. LLM must never access the database directly.
7. Financial calculations must be performed by the backend/database.
8. Never expose secrets to the client.
9. Every financial record must belong to a user.
10. Prefer small, reviewable changes.
```

---

# 27. Git

Utilizar Git desde o primeiro dia.

Branches simples:

```text
main
```

Para funcionalidades maiores:

```text
feature/expenses
feature/copilot
feature/investments
```

Commits claros:

```text
feat: add expense management
feat: add monthly dashboard
fix: correct expense total
feat: add copilot expense tool
```

---

# 28. Deploy

O projeto deverá ser conectado ao GitHub e à Vercel.

Fluxo:

```text
Código
   ↓
Git
   ↓
GitHub
   ↓
Vercel
   ↓
Production
```

O ambiente de produção deverá utilizar:

```text
Vercel
+
Supabase
```

---

# 29. Domínio

Inicialmente poderá utilizar:

```text
granafy.vercel.app
```

Posteriormente poderá ser registrado um domínio próprio.

Exemplo:

```text
granafy.com.br
```

ou outro domínio disponível.

---

# 30. Princípio mais importante do projeto

O Granafy não deverá ser desenvolvido como uma aplicação gigante desde o primeiro dia.

O objetivo é chegar rapidamente a:

```text
Login
   ↓
Dashboard
   ↓
Receitas
   ↓
Despesas
   ↓
Fechamento mensal
```

e colocar isso em produção.

Depois:

```text
Investimentos
   ↓
Patrimônio
   ↓
Copilot
   ↓
Inteligência financeira
```

---

# 31. MVP

O primeiro MVP deverá conter somente:

### Autenticação

- Login com Google
- Logout

### Receitas

- Criar
- Editar
- Excluir
- Listar

### Despesas

- Criar
- Editar
- Excluir
- Pagar
- Listar
- Filtrar

### Dashboard

- Receita
- Despesa
- Pago
- Pendente
- Saldo

### Fechamento mensal

- Selecionar mês
- Visualizar receitas
- Visualizar despesas
- Visualizar saldo

### Infraestrutura

- GitHub
- Supabase
- Vercel
- Deploy automático

O Copilot não precisa fazer parte da primeira versão.

Ele deverá entrar depois que o domínio financeiro estiver sólido.

---

# 32. Visão futura

A visão final do Granafy é:

```text
                         GRANAfy
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
      Financeiro       Investimentos      Patrimônio
          │                 │                 │
       Receitas          Ativos             Cash
       Despesas          Aportes            Investimentos
       Pagamentos        Vendas             Imóveis
       Categorias        Dividendos         Veículos
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                         Copilot
                            │
                           LLM
                            │
                    Financial Tools
                            │
                       Business Logic
                            │
                         Database
```

O Copilot será a camada inteligente sobre o sistema, e não o próprio sistema.

---

# 33. Primeiro objetivo

O primeiro objetivo técnico é simples:

**Colocar o Granafy no ar.**

Ao terminar a primeira etapa, deverá ser possível acessar:

```text
https://granafy.vercel.app
```

fazer login e visualizar a aplicação.

Depois disso, o desenvolvimento será incremental.

O foco deve ser:

**pequenas entregas → produção → feedback → próxima funcionalidade.**

---

# 34. Próxima sequência de execução

A sequência imediata é:

```text
A1 → A2 → B1 → B2 → C1 → C2 → D1 → D2 → D3 → D4 → D5
```

O primeiro corte publicável é A2. O primeiro corte com dados protegidos é B2. O primeiro produto que substitui a planilha é D5.

Antes de iniciar uma etapa, abrir uma issue ou tarefa curta contendo objetivo, critério de aceite e dependências. Ao concluí-la, anexar a evidência da verificação manual, abrir um pull request quando aplicável e publicar. Isso mantém o trabalho pequeno, revisável e fácil de retomar.

Eu começaria **exatamente pelo passo 1**, e não pelo banco: criar o repositório e o projeto Next.js, conectar ao GitHub e colocar a primeira versão vazia na Vercel. A partir daí, podemos ir construindo o Granafy com o Codex em etapas pequenas.
