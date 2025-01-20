# Aplicação Teste Fullstack Kognita
## _Objetivo do Teste_

O objetivo desse teste é criar uma aplicação web interativa com mapas que permite visualizar e interagir com dados geoespaciais.

## Instruções Para entrega
 - Realize um fork do repositório original. Isso criará uma cópia do repositório na sua conta do GitHub, permitindo que você trabalhe no projeto sem alterar o repositório original.
 - Faça todas as alterações e desenvolvimentos diretamente no repositório que foi forkeado, garantindo que o histórico de commits reflita o progresso e as implementações realizadas.
 - Esse repositório será a entrega final do projeto. Certifique-se de incluir um arquivo README.md com instruções claras sobre como rodar e testar a aplicação.

## Passo a Passo para o Desenvolvimento

- Configuração Inicial:
    - Instale as dependências que ache necessárias (React ou outro framework, Leaflet/Mapbox, Express).
    - Configure um servidor básico no Node.js para servir a aplicação e fazer chamadas à API.
- Implementação do Mapa:
    - Exiba o mapa usando Leaflet ou Mapbox.
    -  Adicione funcionalidades para desenhar polígonos.
- Utilização das bases modelo:
    - Utilize um dos arquivos da pasta “files” para plotar (adicionar) os pontos no mapa como marcadores.
    - Exiba informações básicas (nome, ID, etc..) ao clicar ou passar o mouse sobre os marcadores.
    - Permita que o usuário desenhe um polígono no mapa e liste ou conte os pontos do JSON que estão dentro da área delimitada.
- Integração com a OpenStreetMap
    - Permita que o usuário adicione pinos ao clicar no mapa.
    - Para cada pino, consulte a API do OpenStreetMap com as coordenadas do pino.
    - Exiba as informações retornadas ao clicar ou passar o mouse sobre os pinos.
- Testes e Documentação:
    - Adicione testes básicos (se possível).
    - Documente como rodar a aplicação.

## Extras (Desafio Adicional)
 - Implementar autenticação JWT para proteger o backend.
 - Permitir salvar consultas feitas pelo usuário no banco de dados.
 - Adicionar testes automatizados usando ferramentas como Jest ou Cypress.
 - Adicionar um filtro para exibir apenas determinados tipos de pontos da base fake no mapa.
 - Salvar as operações realizadas pelo usuário (desenho de polígonos e adição de pinos) em um banco de dados local ou em memória.
 - Permitir editar ou remover pinos já adicionados.