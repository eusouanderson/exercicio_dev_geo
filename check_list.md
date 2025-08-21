## Passo a Passo para o Desenvolvimento

### 1. Configuração Inicial

- [x] Escolher framework frontend ( Vuetfy ).
- [x] Configurar mapa (Leaflet ou Mapbox).
- [x] Configurar servidor básico Node.js para servir a aplicação e processar chamadas à API.
- [x] Configurar dependências necessárias (ex.: axios, express, dotenv, papaparse, etc.).

### 2. Utilização das Bases de Dados

- [x] Adicionar pontos ao mapa a partir dos arquivos na pasta `files`.
- [ ] Configurar eventos para exibir `censo_2022_domicilio_particular_poi_counts` ao clicar ou passar o mouse sobre os marcadores.

### 3. Implementação do Mapa

- [x] Exibir mapa com (Leaflet) .
- [ ] Permitir desenhar polígonos no mapa.
- [ ] Calcular e exibir operações sobre a área demarcada:
  - [ ] Total de pontos
  - [ ] Soma
  - [ ] Média
  - [ ] Mediana

### 4. Integração com API OpenStreetMap

- [ ] Permitir que o usuário adicione pinos clicando no mapa.
- [ ] Consultar API OpenStreetMap usando as coordenadas do pino.
- [ ] Persistir e exibir informações retornadas ao interagir com o pino.
- [ ] Testar exemplo:

```json
{
  "place_id": 123456,
  "lat": "40.748817",
  "lon": "-73.985428",
  "display_name": "Empire State Building, New York, NY, USA",
  "address": {
    "building": "Empire State Building",
    "city": "New York",
    "state": "NY",
    "country": "United States",
    "postcode": "10118"
  }
}
```
