# Nazwa Projektu: Polska Geo-Wizualizacja (OpenLayers + React/TS)

Aplikacja mapowa stworzona w oparciu o OpenLayers, React z TypeScript oraz menedżer pakietów pnpm, służąca do
wizualizacji danych geograficznych Polski.

Wymagania

Node.js (LTS)

pnpm

## Struktura Aplikacji

## Instalacja

Sklonuj repozytorium:

### Bash

`git clone [LINK_DO_TWOJEGO_REPOZYTORIUM]
cd [NAZWA_PROJEKTU]`
Zainstaluj zależności za pomocą pnpm:

## Bash

pnpm install
Ważne: Upewnij się, że pliki wojewodztwa.geojson i linie.geojson zostały umieszczone w folderze public/data/.

## Uruchomienie

Aby uruchomić aplikację w trybie deweloperskim:

### Bash

`pnpm run dev`
Aplikacja będzie dostępna pod adresem http://localhost:5173/ (lub innym adresem podanym przez Vite).

## Kluczowe Funkcjonalności i Użyte Technologie

Funkcjonalność Implementacja Technologia
Główna Biblioteka Mapowa Zarządzanie mapą, widokiem, warstwami. OpenLayers (ol)
Frontend Interfejs użytkownika i stan aplikacji. React + TypeScript
Wizualizacja Wykresów Wyświetlanie wykresów kołowych/słupkowych (dane1-dane4) na mapie. ol-ext (ChartLayer)
Ograniczenie Widoku (Maskowanie)    Warstwa VectorLayer z poligonem z "dziurą" (granice Polski) i ograniczenie extent
widoku. OpenLayers (ol/geom/Polygon)
Wydajne Linie Użycie VectorLayer z prostym stylem i strategią ładowania jednokrotnego (url w VectorSource). OpenLayers
Zarządzanie Stanem Warstw Komponentowy stan React (useState) do przełączania widoczności warstw (setVisible(
true/false)). React


// Wymaganie płynnej mapy dla danych liniowych (linie.geojson):
// 1. Użycie prostego stylu (zrobione w createLayers).
// 2. W przypadku bardzo dużych zbiorów danych: renderowanie w trybie WebGL lub klasteryzacja/upraszczanie po stronie serwera/kliencka.
// 3. Użycie opcji renderowania 'image' w VectorLayer, aby renderować warstwę jako obraz (kosztem interaktywności).
//
// W tym kodzie polegamy na prostym stylu i kluczowej optymalizacji:
// Warstwy wektorowe w OpenLayers są domyślnie wydajne (canvas/WebGL) dla linii.
