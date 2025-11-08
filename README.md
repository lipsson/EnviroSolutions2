# Nazwa Projektu: Polska Geo-Wizualizacja (OpenLayers + React/TS)

Aplikacja mapowa stworzona w oparciu o OpenLayers, React z TypeScript oraz menedżer pakietów npm, służąca do
wizualizacji danych geograficznych Polski.

## Wymagania

- Node.js (LTS)
- npm

## Struktura Aplikacji

polska-geo-wizualizacja/
│
├── public/
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── MapComponent.tsx
│   │   ├── MapComponent.css
│   │   └── map-osm-poland-data.tsx
│   │
│   ├── types/
│   │   ├── ol-ext.d.ts
│   │   └── geojson.d.ts
│   │
│   ├── db/
│   │   ├── wojewodztwa.geojson
│   │   └── linie.geojson
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── theme.ts
│   │
│   ├── utils/
│   │   ├── mapHelpers.ts
│   │   └── styleCache.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .gitignore
├── .env
├── .env.example
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
└── README.md

### Instalacja

Sklonuj repozytorium:


`git clone https://github.com/lipsson/EnviroSolutions2.git
cd EnviroSolutions2`

Zainstaluj zależności za pomocą pnpm:

## Bash

`pnpm install`


**Ważne:** Upewnij się, że pliki `wojewodztwa.geojson` i `linie.geojson` zostały umieszczone w folderze `src/db/`.

## Uruchomienie

Aby uruchomić aplikację w trybie deweloperskim:
### Bash

`pnpm run dev`

Aplikacja będzie dostępna pod adresem `http://localhost:5173/` (lub innym adresem podanym przez Vite).


## Budowanie i uruchamianie w kontenerze Docker (wymaga Docker) - Multi-stage Build:
### Zbuduj obraz
`docker build -t envirosolutions4:latest .`

### Uruchom kontener
`docker run -p 5173:80 envirosolutions4:latest`

## Kluczowe Funkcjonalności i Użyte Technologie

| Funkcjonalność | Implementacja | Technologia |
|---|---|---|
| Główna Biblioteka Mapowa | Zarządzanie mapą, widokiem, warstwami | OpenLayers (ol@10.7.0) |
| Frontend | Interfejs użytkownika i stan aplikacji | React 19.1.1 + TypeScript 5.9.3 |
| Wizualizacja Wykresów | Wyświetlanie wykresów kołowych/słupkowych (dane1-data4) na mapie z animacją | ol-ext 4.0.36 (Chart style) |
| Interakcje Użytkownika | Zaznaczanie województw (Select interaction), przełączanie warstw | OpenLayers (ol/interaction/Select) |
| Zarządzanie Stanem Warstw | Komponentowy stan React (useState) do przełączania widoczności warstw (setVisible) | React Hooks |
| Stylizacja UI | Panel kontrolny z Material-UI, responsywne kontrolki | @mui/material 7.3.5 + @emotion/styled 11.14.1 |
| Wpisywanie Typów GeoJSON | Deklaracje typów dla modułów `.geojson` | TypeScript (ol-ext.d.ts) |
| Bundler | Szybki build i hot reload | Vite 7.1.7 |

## Szczegółowy Opis Implementacji

### 🗺️ src/components/map-osm-poland-data.tsx

**Błędy w kodzie (do naprawy):**
- ❌ Użycie `removeEventListener()` zamiast `.un()` z OpenLayers API
- ❌ Niewykorzystana zmienna `progress` z `olEasing.easeOut()`
- ❌ Brak obsługi błędów przy ładowaniu GeoJSON
- ❌ Style cache nie czyszczony przy zmianie parametrów

**Poprawki:**
- ✅ Zamiana `removeEventListener()` → `.un('prerender', listenerKey)`
- ✅ Wykorzystanie `progress` do modyfikacji `frameState.animate`
- ✅ Dodanie try-catch przy loadowaniu danych GeoJSON
- ✅ Czyszczenie cache stylów w `useEffect` zależności

**Funkcjonalności:**
- Inicjalizacja mapy OpenLayers z centrum na Polskę (zoom: 6)
- Warstwa województw z danymi GeoJSON (wojewodztwa.geojson)
- Warstwa linii administracyjnych (linie.geojson)
- Dynamiczne wykresy (pie, bar, donut) na województwach
- Select interaction do zaznaczania województw
- Przełączanie widoczności warstw (checkboxy)
- Zmiana typu wykresu (select dropdown)
- Animacja wykresów z easing effect
- Cache stylów do optymalizacji wydajności

### 📦 src/types/ol-ext.d.ts

**Błędy:**
- ❌ Brak deklaracji typów dla `*.geojson` modules
- ❌ Niedokładne typy dla `ol.style.Chart`

**Poprawki:**
- ✅ Dodanie `declare module '*.geojson'`
- ✅ Rozszerzenie typów dla `ol-ext/style/Chart`
- ✅ Obsługa GeoJSON FeatureCollection

**Zawartość:**

```typescript 
declare module '*.geojson' { const content: GeoJSON.FeatureCollection; export default content; }
declare module 'ol-ext/style/Chart' { export default Chart; }
```

## Optymalizacja Wydajności

### Dla danych liniowych (linie.geojson):

1. **Prosty styl** - minimalistyczne podejście do renderowania
2. **Rendering VectorLayer** - OpenLayers domyślnie używa canvas/WebGL
3. **W przypadku dużych zbiorów danych:**
    - Użycie WebGL renderera
    - Klasteryzacja/upraszczanie geometrii
    - Renderowanie warstwowe (image mode) - z utratą interaktywności

### Cache Stylów

```typescript 
const styleCache = useRef<Record<string, Style[]>>({}); // Cache przechowuje style aby uniknąć zbędnych obliczeń
```

## Wersje Pakietów

```json 
{ "react": "19.1.1", "typescript": "5.9.3", "ol": "10.7.0", "ol-ext": "4.0.36", "@mui/material": "7.3.5", "vite": "7.1.7" }
```

## Troubleshooting

**Problem:** `TS2307: Cannot find module '*.geojson'`
- **Rozwiązanie:** Sprawdź czy `ol-ext.d.ts` zawiera deklaracje `*.geojson`

**Problem:** Mapa nie pokazuje się
- **Rozwiązanie:** Upewnij się że `mapContainer` ma wysokość (`height: 100vh`) i że pliki GeoJSON są w `src/db/`

**Problem:** Animacja nie płynie
- **Rozwiązanie:** Użyj prostego stylu (bez gradientów), zmniejsz liczność feature'ów lub użyj WebGL renderera
