# Teste para Desenvolvedor Fullstack - Kognita

## Prazo: 

1 semana (7 dias) a partir do recebimento do mesmo


## Objetivo do Teste

Criar uma aplicação web interativa com mapas que permita o usuário final visualizar e interagir com dados geoespaciais.

---

## Instruções de Entrega

1. **Fork do Repositório Original**  
   Crie um fork do repositório original para sua conta no GitHub. Isso permitirá que você trabalhe no projeto sem alterar o repositório principal.

2. **Desenvolvimento e Histórico de Commits**  
   Realize todas as alterações e implementações diretamente no repositório forkeado. Certifique-se de manter um histórico de commits que demonstre o progresso e as decisões técnicas tomadas.

3. **Entrega Final**  
   A entrega deve ser feita por meio do repositório "forkeado", contendo:  
   - Um arquivo `README.md` com instruções claras sobre como configurar, rodar e testar a aplicação.

---

## Passo a Passo para o Desenvolvimento

1. **Configuração Inicial**  
   - Escolha e configure as dependências necessárias para o projeto (ex.: React ou outro framework, Leaflet/Mapbox, Express).  
   - Configure um servidor básico usando Node.js para servir a aplicação e processar chamadas à API.

2. **Implementação do Mapa**  
   - Exiba o mapa utilizando **Leaflet** ou **Mapbox**.  
   - Implemente funcionalidades que permitam desenhar polígonos no mapa.

3. **Utilização das Bases de Dados**  
   - Use os arquivos fornecidos na pasta `files` para adicionar pontos ao mapa como marcadores.  
   - Configure eventos para que, ao clicar ou passar o mouse sobre os marcadores, informações básicas (ex.: nome, ID) sejam exibidas.  
   - Permita que o usuário desenhe um polígono no mapa e liste ou conte os pontos do JSON que estão dentro da área delimitada.

4. **Integração com a API OpenStreetMap**  
   - Adicione a funcionalidade de inserir pinos ao clicar no mapa.  
   - Para cada pino adicionado, consulte a API do OpenStreetMap com as coordenadas correspondentes.  
   - Exiba as informações retornadas ao clicar ou passar o mouse sobre os pinos.

5. **Testes e Documentação**  
   - Inclua testes básicos para validar o funcionamento das principais funcionalidades.  
   - Documente todo o processo no `README.md`, incluindo como instalar dependências, rodar a aplicação e executar os testes.

---

## Desafios Adicionais (Extras)

Para destacar ainda mais suas habilidades, implemente uma ou mais das funcionalidades abaixo:

1. **Autenticação JWT**  
   - Implemente autenticação no backend utilizando **JSON Web Tokens (JWT)** para proteger as rotas.

2. **Persistência de Dados**  
   - Salve as consultas feitas pelo usuário em um banco de dados.  
   - Armazene as operações realizadas, como o desenho de polígonos e adição de pinos, em um banco de dados local ou em memória.

3. **Filtros e Edição de Pinos**  
   - Adicione filtros que permitam exibir apenas determinados tipos de pontos da base de dados fake no mapa.  
   - Implemente funcionalidades para editar ou remover pinos adicionados pelo usuário.

4. **Testes Automatizados**  
   - Adicione testes automatizados usando ferramentas como **Jest**, **Cypress** ou similares.

---

## Critérios de Avaliação

- **Organização do Código**: Qualidade, clareza e modularidade do código.  
- **Funcionalidade**: Implementação correta e funcionalidade das features solicitadas.  
- **Documentação**: Instruções claras no README e histórico de commits detalhado.  
- **Extras**: Implementação dos desafios adicionais.  

Boa sorte e divirta-se desenvolvendo! 🚀
