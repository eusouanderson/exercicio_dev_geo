# Documentação do Projeto: Exercicio Geo 🗺️

Bem-vindo à documentação oficial do **Exercicio Geo**. Este projeto é uma aplicação web de geoanálise que permite aos usuários interagir com um mapa, adicionar pontos de interesse, desenhar polígonos e realizar análises espaciais sobre os pontos contidos nesses polígonos.

## ✨ Funcionalidades Principais

- **Visualização de Mapa Interativo**: Navegue por um mapa dinâmico fornecido pelo Leaflet.
- **Adição de Pontos**: Clique no mapa para adicionar marcadores (pontos) que representam locais de interesse.
- **Desenho de Polígonos**: Ferramentas para desenhar polígonos diretamente no mapa para definir áreas de análise.
- **Análise Espacial**: Calcule automaticamente quais pontos estão dentro de um polígono desenhado.
- **Análise com IA (Gemini)**: Utilize a API do Gemini para gerar insights e análises textuais baseadas nos dados geográficos selecionados.
- **Busca de Localizações (Geocoding)**: Encontre e centralize o mapa em endereços específicos usando o serviço Nominatim.
- **Upload de Dados**: Carregue pontos em massa através de arquivos CSV.

---

## 🚀 Tecnologias Utilizadas (Tech Stack)

O projeto é um monorepo dividido em duas partes principais: `backend` e `frontend`.

### Backend

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Hono](https://hono.dev/) - Um framework web rápido, leve e para múltiplos runtimes.
- **Banco de Dados**: PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Um ORM TypeScript "headless" para SQL.
- **Análise Geoespacial**: [Turf.js](https://turfjs.org/)
- **Autenticação**: JWT (JSON Web Tokens)
- **Containerização**: Docker (com `docker-compose.yml`)
- **Testes**: Bun Test Runner
- **Documentação da API**: Swagger UI

### Frontend

- **Framework**: [Vue.js 3](https://vuejs.org/) (com Composition API)
- **UI Framework**: [Vuetify](https://vuetifyjs.com/) - Framework de componentes Material Design.
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Biblioteca de Mapa**: [Leaflet.js](https://leafletjs.com/) com `@vue-leaflet/vue-leaflet`
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Requisições HTTP**: [Axios](https://axios-http.com/)
- **Linguagem**: TypeScript

---

## 📂 Estrutura do Projeto

A estrutura de pastas foi organizada para separar claramente as responsabilidades.

### Estrutura do Backend

#### Arquitetura em Camadas (Layered Architecture) - Clean Architecture inspirada em DDD (Domain-Driven Design Light).

```bash
controllers/ → camada de apresentação (interface com o mundo externo, HTTP).

services/ → camada de negócio (regras da aplicação).

repository/ → camada de persistência (acesso ao banco).

db/schemas/ → definição da estrutura do domínio no banco.

routes/ → orquestração entre controllers e middlewares.

config/, utils/ e types/ → camadas de suporte.
```

```
backend/
├── src/
│   ├── app.ts                # Configuração central da aplicação Hono
│   ├── auth/                 # Lógica de autenticação (JWT, middleware)
│   ├── config/               # Configurações específicas (ex: algoritmos)
│   ├── controllers/          # Controladores (recebem requisições e enviam respostas)
│   ├── db/
│   │   ├── connect.ts        # Conexão com o banco de dados
│   │   └── schemas/          # Schemas do Drizzle ORM (definição das tabelas)
│   ├── repository/           # Camada de acesso aos dados (interação com o DB)
│   ├── routes/               # Definição das rotas da API
│   ├── services/             # Lógica de negócio da aplicação
│   ├── swagger/              # Definições do Swagger para documentação da API
│   ├── types/                # Definições de tipos TypeScript
│   └── utils/                # Funções utilitárias (ex: processador de CSV)
├── tests/                    # Testes unitários e de integração
├── drizzle/                  # Arquivos de migração gerados pelo Drizzle Kit
├── docker-compose.yml        # Orquestração do container do PostgreSQL
├── package.json              # Dependências e scripts do backend
└── drizzle.config.ts         # Configuração do Drizzle Kit
```

### Estrutura do Frontend

```
frontend/
├── src/
│   ├── App.vue               # Componente raiz da aplicação
│   ├── assets/               # Arquivos estáticos (CSS, imagens)
│   ├── components/           # Componentes Vue reutilizáveis (mapa, controles, etc.)
│   ├── composables/          # Funções reutilizáveis da Composition API (lógica do mapa)
│   ├── config/               # Configurações do frontend
│   ├── helpers/              # Funções de ajuda
│   ├── main.ts               # Ponto de entrada da aplicação Vue
│   ├── plugins/              # Plugins do Vue (Vuetify)
│   ├── services/             # Serviços para comunicação com a API do backend
│   └── types/                # Definições de tipos TypeScript
├── public/                   # Arquivos públicos
├── index.html                # Arquivo HTML principal
├── package.json              # Dependências e scripts do frontend
└── vite.config.mts           # Configuração do Vite
```

---

## ⚙️ Como Executar o Projeto

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento.

### Pré-requisitos

- [Bun](https://bun.sh/docs/installation)
- [Docker](https://www.docker.com/get-started/) e Docker Compose
- Node.js (para compatibilidade com alguns pacotes)

O backend estará rodando em `http://localhost:3002`. A documentação da API estará disponível em `http://localhost:3002/docs`.

### 2. Configuração do Frontend

```bash
# 1. Navegue para a pasta do frontend (a partir da raiz do projeto)
cd frontend

# 2. Instale as dependências
bun install

# 3. Inicie o servidor de desenvolvimento
bun run dev
```

O frontend estará acessível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

---

## Endpoints da API

A API segue um padrão RESTful. Abaixo estão os principais endpoints. Para detalhes completos, acesse a [documentação do Swagger](http://localhost:3000/swagger) com o backend em execução.

| Método | Endpoint | Descrição |
| :----- | :------- | :-------- |

| `GET` | `/points` | Lista todos os pontos cadastrados. |
| `POST` | `/polygons` | Cria um novo polígono e retorna os pontos dentro. |
| `GET` | `/geo/search` | Busca coordenadas para um endereço (geocoding). |
| `POST` | `/gemini/analyze` | Envia dados para análise do Gemini AI. |

---

## 💡 Possíveis Melhorias Futuras

- **Autenticação de Usuários**: Implementar um sistema completo de login e registro para que os usuários possam salvar seus próprios mapas e análises.
- **Exportação de Dados**: Permitir que os usuários exportem os resultados das análises (pontos dentro de um polígono) em formatos como CSV ou GeoJSON.
- **Edição de Geometrias**: Adicionar funcionalidade para editar pontos e polígonos após terem sido criados.
- **Melhorias na UI/UX**: Refinar a interface para uma experiência de usuário mais fluida, incluindo feedback visual durante as operações.
- **WebSockets**: Implementar comunicação em tempo real para colaboração de múltiplos usuários no mesmo mapa.

# 🚀 Como Executar o Projeto com Docker Compose

Este guia fornece instruções passo a passo para configurar e executar o ambiente de desenvolvimento localmente usando Docker e Docker Compose.

## ✅ Pré-requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas e configuradas em sua máquina:

- **Docker**
- **Docker Compose**

Você pode verificar se ambos estão instalados corretamente executando os seguintes comandos no seu terminal:

```bash
# Verifica a versão do Docker
docker -v

# Verifica a versão do Docker Compose
docker compose version
```

Se precisar instalá-los, consulte a documentação oficial:

- [Instalar o Docker Engine](https://docs.docker.com/engine/install/)
- [Instalar o Docker Compose](https://docs.docker.com/compose/install/)

## ▶️ Iniciando o Ambiente

Com os pré-requisitos atendidos, execute o comando abaixo na raiz do projeto (no mesmo diretório onde se encontra o arquivo `docker-compose.yml`).

```bash
docker compose up --build
```

- O comando `up` irá criar e iniciar todos os contêineres definidos no arquivo de configuração.
- A flag `--build` força a reconstrução das imagens a partir dos Dockerfiles, garantindo que quaisquer alterações recentes no código sejam aplicadas.

Aguarde até que o processo de build seja concluído e os logs dos contêineres se estabilizem.

## 🔗 Acessando os Serviços

Após a inicialização completa, os seguintes serviços estarão disponíveis nos endereços abaixo:

- 🌐 **Frontend:** [http://localhost:3003](http://localhost:3003)
- ⚙️ **Backend:** [http://localhost:3002](http://localhost:3002)
- 📚 **Documentação da API (Swagger):** [http://localhost:3002/docs](http://localhost:3002/docs)
- 🗄️ **Banco de Dados (PostgreSQL):**
  - **Host:** `localhost`
  - **Porta:** `5432`
  - _(Use estes dados para se conectar através de um cliente de banco de dados de sua preferência, como DBeaver, Beekeeper Studio ou DataGrip)._

## ⏹️ Parando o Ambiente

Para parar e remover os contêineres, redes e volumes criados pelo Docker Compose, execute o seguinte comando no terminal (no mesmo diretório do projeto):

```bash
docker compose down
```

Este comando irá limpar o ambiente, garantindo que não haja serviços rodando em segundo plano.
