# 01 – Projekttérkép (read-only audit, 1. kör)

Állapot: branch `frontend`, commit `e3462fe`. Kódot nem módosítottam, csomagot nem telepítettem, dev szervert nem indítottam. Futtatott parancsok: `eslint` (frontend + backend), fájlolvasás.
Sorszámok `git ls-files` alapján, lock- és migrációs fájlok nélkül. Összesen ~3250 sor forráskód, 79 követett fájl.

---

## 1. CÉL ÉS MŰKÖDÉS

**Mire való:** „Game Theater IOI vol.4" – közönségszavazásos, interaktív színházi játék. A közönség (játékosok) telefonról/gépről szavaz egy elágazó történet minden kérdésénél. A többségi válasz dönt a folytatásról, és három szereplő (Réka, Domi, Kata) eredménypontját változtatja. A szereplők („actors") kivetítőn látják az állást.

**Játékmenet lépésről lépésre**

| # | Szereplő | Lépés | Technikailag |
|---|---|---|---|
| 1 | Játékos | Regisztrál, belép (email + jelszó) | `POST /auth/register`, `POST /auth/login` → JWT (8 óra), `localStorage["token"]` |
| 2 | Játékos | `/main` → „Csatlakozás" → játékot választ a modalban | `GET /api/game`, `POST /api/user/join-game/:gameId` (`User.gameId`) → navigál `/game/:gameId` |
| 3 | Játékos | Vár: „Várakozás a következő kérdésre…" | `GamePage` 2 mp-es pollinggal kérdezi `GET /api/game/:id`-t |
| 4 | Admin | `/game-admin/:gameId` oldalon „Következő kérdés" gomb | `GET /api/game/next/:id` (!) → `availableForAns=true`, a szerver 20 mp-et vár |
| 5 | Játékos | A poll látja az `availableForAns=true`-t → lekéri a kérdést (`GET /api/question/number/:n`), 20 mp-es kliensoldali visszaszámlálás indul | |
| 6 | Játékos | Válaszol, „Válasz beküldése" | `POST /api/user/answer/:gameId`, body = a teljes answer objektum → `user.answers` kapcsolat (M:N) |
| 7 | Szerver | 20 mp után `availableForAns=false`, összeszámolja a játékosok válaszait az aktuális kérdés válaszai közül. Győztes = legtöbb szavazat, döntetlennél véletlen | `game.controller.js:169-265` |
| 8 | Szerver | A győztes `resultReka/Domi/Kata` hozzáadódik a Game összeghez, `questionNum = nextQuestN`, `collAnswer = [győztes]` | `game.controller.js:247-257` |
| 9 | Admin | A 20 mp-es visszaszámlálás végén az admin oldal újratölt (fetchGame ×2), látja az új állást és a következő kérdés előnézetét | `GameAdminPage.jsx:42-52` |
| 10 | Kivetítő | `/actors`: oszlopdiagram a 3 szereplő állásáról + utolsó győztes válasz (csak ha `!availableForAns`) | 5 mp polling |

**Szerepkörök**

| Szerep | Azonosítás | Mit lát |
|---|---|---|
| Játékos | `User.isAdmin=false` | `/main`, `/game/:id` (kérdés + válaszok + visszaszámláló) |
| Admin | `User.isAdmin=true` (csak DB-ben állítható, nincs UI) | Mint a játékos, plusz Header „Kérdések & Válaszok" (halott link), „Admin Játék" → `/game-admin/:id` |
| Kivetítő / szereplők | Nincs külön szerep. `/actors` bárkinek megnyitható, de az API hívás tokent igényel, ezért be kell lépni | Pontállás-oszlopok, utolsó győztes válasz |

Az admin is játékosként csatlakozik a játékhoz (`User.gameId`), ezért az ő válasza is beleszámít a szavazásba. Az „Admin Játék" menü a `gameId`-ból épül.

---

## 2. TECH STACK ÉS ARCHITEKTÚRA

**Mappastruktúra:** két különálló csomag, nincs workspace/monorepo-eszköz (nincs gyökér `package.json`).
```
backend/   Express API (ESM, JS), Prisma + PostgreSQL
  prisma/schema.prisma, 10 migráció
  src/{app,server}.js, routes/, controllers/, services/, middleware/, utils/, validations/, constants/, models/prismaClient.js
frontend/  Vite + React SPA (JS/JSX)
  src/{App,main}.jsx, pages/, components/, components/modals/, contexts/, services/, schema/, constants/
```

| Réteg | Csomag | Verzió (package.json) |
|---|---|---|
| Backend | express | ^4.21.2 |
| | @prisma/client / prisma | ^6.4.1 |
| | jsonwebtoken / bcrypt | ^9.0.2 / ^5.1.1 |
| | yup, cors, dotenv, multer | ^1.6.1, ^2.8.5, ^16.4.7, ^1.4.5-lts.1 |
| | cloudinary | ^2.5.1 (**sehol nincs használva**) |
| Frontend | react / react-dom | ^19.0.0 |
| | react-router-dom | ^7.2.0 |
| | vite / @vitejs/plugin-react | ^6.2.0 / ^4.3.4 |
| | tailwindcss | ^3.4.17 |
| | axios, formik, yup, jwt-decode, react-toastify | ^1.8.1, ^2.4.6, ^1.6.1, ^4.0.0, ^11.0.5 |
| Típusosság / teszt | **Nincs TypeScript**, nincs tsconfig/jsconfig, nincs teszt (`npm test` = echo error) | |

**Valós idejű kommunikáció:** **nincs** (nincs WebSocket, Socket.IO, SSE, Supabase realtime). Minden **HTTP polling**:

| Hol jön létre | Végpont | Periódus | Megjegyzés |
|---|---|---|---|
| `GamePage.jsx:59` | `GET /api/game/:id` (+ `GET /api/question/number/:n`, amíg `availableForAns`) | 2 mp (de lásd 6/8) | játékosonként |
| `GameStatus.jsx:25` | `GET /api/game/:id` | 5 mp | kivetítő |
| `GameAdminPage.jsx:31-33, 47-48` | `GET /api/game/:id` | csak betöltéskor és a 20 mp végén | nincs élő nézet |

Eseménynév → irány → payload táblázat nincs, mert nincsenek események. A „szerver → kliens" üzenet az `availableForAns`, `questionNum`, `*Result`, `collAnswer` mezők pollingja a Game rekordból.

**Adattárolás (PostgreSQL, Prisma)** – `backend/prisma/schema.prisma` (69 sor)

| Modell | Fő mezők | Kapcsolatok |
|---|---|---|
| User | id(cuid), username(unique), email(unique), password(hash), isAdmin, createdAt, gameId? | → Game (N:1), Answer (M:N „User_Answer") |
| Question | id, number(unique Int), question | → Answer (1:N), Game (1:N, `Game.questionNum → Question.number`) |
| Answer | id, relQuestN, answer, resultReka/Domi/Kata, nextQuestN | → Question (relQuestN→number), Game (M:N „User_Answer_Game" = collAnswer), User (M:N) |
| Game | id, name, createdAt, questionNum(default 0), availableForAns, rekaResult/domiResult/kataResult | → users, question, collAnswer |

**Hol él a játékállapot**
- Tartós állapot **DB-ben** (Game sor: `questionNum`, `availableForAns`, eredmények, `collAnswer`).
- A **20 mp-es szavazási ablak a szerver memóriájában él**: `setTimeout` a `nextQuestion` kérés-handlerben (`game.controller.js:194`). Újraindításkor elvész, `availableForAns` örökre `true` maradhat.
- A szavazatok a `User.answers` M:N táblában gyűlnek. Kérdésenkénti törlés nincs. A `resetAnswers` végpont létezik (`user.controller.js:82`), de a frontend sosem hívja.
- Cache nincs.

**Auth / jogosultság**
- Belépés: email+jelszó (a backend username-et is elfogad, a frontend csak emailt küld) → JWT, 8 óra, payload: id, username, email, createdAt, isAdmin. Tárolás: `localStorage`. Axios interceptor teszi fel a `Bearer` fejlécet (`axiosInstance.js:8-12`).
- Backend: `authenticate` (JWT ellenőrzés) és `authorize` (`req.user.isAdmin`) middleware, `middleware/auth.middleware.js`.
- Admin védelem **csak a backendben és csak részben**: `authorize` a question/answer írásán és a game létrehozásán van. A frontend útvonalaknak **nincs guardja** (`App.jsx:21-28`), az „admin"-ság csak a Header linkek elrejtése. Részletek: 6. fejezet.
- Admin fiók létrehozása: nincs UI/endpoint, a DB-ben kell `isAdmin=true`-ra állítani.

**Deploy konfiguráció**
- Nincs `vercel.json`, `Dockerfile`, CI konfig, `.env.example`. A README helyi fejlesztést ír (8080-as port).
- Env változók **nevei**: backend `PORT`, `DATABASE_URL`, `JWT_SECRET`. Frontend `VITE_API_URL` (a `frontend/.env` **be van commitolva**, a backend `.env` gitignore-olt).
- Frontend build: `vite build`. Backend: `node --watch src/server.js` (`dev`), nincs `start` script.

---

## 3. FUNKCIÓLISTA

| Funkció | Hol van | Állapot |
|---|---|---|
| Regisztráció | `auth.controller.js`, `auth.service.js`, `RegisterForm.jsx` | kész |
| Belépés (JWT) | `auth.service.js`, `LoginForm.jsx`, `AuthContext.jsx` | kész |
| Kijelentkezés | `AuthContext.jsx:78`, `Header.jsx:24` | kész |
| Játék létrehozása (API) | `game.routes.js:10`, `game.service.js` | kész (backend), **nincs UI** |
| Játék lista + csatlakozás/kilépés | `GameSelectionModal.jsx`, `user.controller.js:100,135` | kész |
| Következő kérdés + szavazás-lezárás + győztes | `game.controller.js:169-265` | kész, de sérülékeny (6. fejezet) |
| Válasz beküldése | `GamePage.jsx:75`, `user.controller.js:241` | kész, validáció nélkül |
| Játékos nézet (kérdés, visszaszámláló) | `GamePage.jsx` | kész |
| Admin játékoldal | `GameAdminPage.jsx`, `GameSummary.jsx`, `UpcomingQuestion.jsx` | félkész (nincs élő nézet, reset, szavazat-eloszlás) |
| Kivetítő / szereplők oldala | `PageForActors.jsx`, `GameStatus.jsx` | félkész (**hardkódolt gameId**, `PageForActors.jsx:4`) |
| Kérdések CRUD (API) | `question.*` | kész (backend), **nincs UI** |
| Válaszok CRUD (API) | `answer.*` | félkész, az `update` hibás mezőneveket használ (`answer.controller.js:51-75`) |
| Játék reset (API) | `game.controller.js:74`, `game.routes.js:31` | kész, **nincs UI**, nincs `authorize` |
| User válaszainak törlése | `user.controller.js:82` | halott (frontend nem hívja) |
| Profil módosítás | `user.controller.js:41`, `user.service.js:60` | **halott/hibás**: a service csak `answers`-t kezeli, `username/email/password/isAdmin` elnyelődik |
| Profil törlés | `user.controller.js:64` | kész, csak saját |
| Header „Kérdések & Válaszok" → `/question` | `Header.jsx:68` | **halott link**, nincs ilyen route |
| Régi `nextQuestion` verziók, régi `addAnswerToGame` | `game.controller.js:61-71, 93-167`, `user.controller.js:170-239` | halott kód (kikommentezett, ~170 sor) |
| `getCurrentQuestion` (frontend) | `game.service.js:13` | halott (azonos a `NextQuestionByGameById`-dal, sehol nincs hívva) |
| `multer` / `cloudinary` | `game.routes.js:4,7`, `question.routes.js:4,7` / – | multer csak `upload.none()`, cloudinary halott dependency |
| `CollectiveAnswersModal` | `modals/CollectiveAnswersModal.jsx` | használt, de duplán rendereli a modalt (D1) |
| Tesztek, TypeScript, realtime, deploy konfig | – | nincs |

---

## 4. ADMIN UI LELTÁR

### 4.1 Oldalak és komponensek

| Útvonal | Fájl | Sor | Mit csinál |
|---|---|---|---|
| `/game-admin/:gameId` | `frontend/src/pages/GameAdminPage.jsx` | 105 | Egyetlen admin oldal: lekéri a játékot, „Következő kérdés" gomb + 20 mp visszaszámláló |
| – (beágyazva) | `components/GameSummary.jsx` | 78 | Játék neve, létrehozás ideje, kérdésszám. 51 sor kikommentezett régi kód |
| – (beágyazva) | `components/UsersAndAnswers.jsx` | 102 | Játékosok + minden válaszuk, Réka/Domi/Kata eredmény, „Kollektív válaszok" modal (nyers JSON) |
| – (beágyazva) | `components/UpcomingQuestion.jsx` | 56 | A `game.questionNum` szerinti kérdés + válaszai előnézete |
| – (beágyazva) | `components/modals/CollectiveAnswersModal.jsx` | 29 | Általános modal, a `collAnswer` JSON-t mutatja |
| Header link | `components/Header.jsx:66-85` | 114 | „Kérdések & Válaszok" (`/question`, **nem létezik**), „Admin Játék" |
| `/actors` | `pages/PageForActors.jsx` + `components/GameStatus.jsx` | 15 + 177 | Kivetítő nézet. Nem admin-védett, de a szereplőknek az admin nyitja meg |

Nincs admin UI: játék létrehozásra, kérdés/válasz szerkesztésre, reset-re, játékos kezelésre, szavazat-eloszlásra, szavazás megszakítására. Mindez csak API-n (Postman) érhető el.

### 4.2 Admin műveletek

| Művelet | UI elem | API | Backend védelem |
|---|---|---|---|
| Következő kérdés indítása + szavazás lezárása | `GameAdminPage.jsx:87` gomb → `handleNextQuestion` (`:35`) | `GET /api/game/next/:id` (`game.routes.js:25`) | **csak `authenticate`**, bármely belépett játékos hívhatja |
| Játék állapot frissítése | automatikus (`GameAdminPage.jsx:47-48`) | `GET /api/game/:id` | authenticate |
| Játék létrehozása | nincs UI | `POST /api/game` | authenticate + authorize ✔ |
| Játék átnevezése / törlése | nincs UI | `PUT /api/game/:id`, `DELETE /api/game/:id` | **csak authenticate** |
| Játék reset | nincs UI | `PUT /api/game/reset/:id` | **csak authenticate** |
| Kérdés/válasz létrehozás | nincs UI | `POST /api/question`, `POST /api/answer` | authenticate + authorize ✔ |
| Kérdés/válasz módosítás/törlés | nincs UI | `PUT/DELETE /api/question/:id`, `/api/answer/:id` | authenticate + authorize ✔ |
| Felhasználó lista/lekérés | nincs UI | `GET /api/user`, `GET /api/user/:id` | **nincs auth** |

### 4.3 Duplikációk és felesleges lépések

| # | Hol | Mi |
|---|---|---|
| D1 | `UsersAndAnswers.jsx:66-86` **és** `:88-97` | Ugyanaz a modal kétszer van renderelve (beégetett inline + `CollectiveAnswersModal`), egyszerre nyílik, két egymásra rakott overlay |
| D2 | `GameSummary.jsx:24-74` vs `UsersAndAnswers.jsx:10-63` | A kikommentezett blokk a `UsersAndAnswers` tartalmát duplikálja |
| D3 | `GameSummary.jsx:14-15` + `UsersAndAnswers.jsx:8-9` | Egymásba ágyazott, azonos kártyák (kétszeres padding és háttér) |
| D4 | `game.service.js:13-21` | `getCurrentQuestion` és `NextQuestionByGameById` azonos (azonos URL, azonos kód), és az URL **állapotot módosít GET-tel** |
| D5 | `GameAdminPage.jsx:47-48` | `fetchGame()` majd 1 mp múlva újra `fetchGame()`: két lekérés ugyanarra |
| D6 | `GameAdminPage.jsx:67-69` és `:99` | Hibaüzenet kétszer: a `:67` korai return lecseréli az oldalt, így a `:99` soros hiba sosem látszik |
| D7 | `GameAdminPage.jsx:35-61` vs `GamePage.jsx:63-72` | Két külön visszaszámláló implementáció (admin: setInterval a handlerben, játékos: effect). A 20 mp kétszer hardkódolva a kliensekben + egyszer a backendben (`game.controller.js:194`), nincs közös konstans |
| D8 | `GameAdminPage.jsx:16`, `GamePage.jsx:22`, `GameStatus.jsx:9` | Háromszor ugyanaz a „fetch game" logika, külön hibakezeléssel |
| D9 | `GamePage.jsx:101-125` vs `UpcomingQuestion.jsx:41-54` | Kérdés + válaszlista render duplikálva |
| D10 | `UpcomingQuestion.jsx:12-22` | Külön lekéri a kérdést, amit az admin oldal már megkapott a nextQuestion válaszában (`game.controller.js:188`), de a frontend ezt eldobja |
| D11 | `Header.jsx:10-37` és `LandingPage.jsx:5-20` | Azonos modal-állapotkezelés és login/register váltás kétszer |
| D12 | `LoginForm.jsx` vs `RegisterForm.jsx` | ~90%-ban azonos (form, toast, hibakezelés, stílus) |
| D13 | `backend/src/validations/user.validations.js` vs `frontend/src/schema/UserValidationSchema.js` | Ugyanaz a séma két helyen |
| D14 | `user.controller.js:41-47, 64-70, 82-88` | A „csak saját profil" ellenőrzés háromszor, a tokent újra dekódolva (`extractUserIdFromToken`), pedig az `authenticate` már beállította a `req.user`-t |
| D15 | `user.controller.js:100-133` vs `:135-170` | `joinGameById` / `LeaveGameById` majdnem azonos |
| D16 | `services/*.service.js` (`getById`, `update`, `destroy`) | Minden hívás előtt `isValid…Id` (1 DB lekérés), majd maga a művelet: **2 query/hívás**. A `game.service.js:21` `getById` a polling fő útvonala |
| D17 | `user.controller.js:170-239`, `game.controller.js:61-167` | Két kikommentezett `addAnswerToGame` verzió, három kikommentezett `nextQuestion` verzió |
| D18 | `LandingPage.jsx:33-50` | Kikommentezett modal-blokk |
| D19 | Header „Játékod" vs „Admin Játék" (`Header.jsx:59-83`) | Az admin ugyanazt a `gameId`-t két linken éri el (játékos- és admin nézet), és játékosként a saját szavazata is beleszámít |
| D20 | Játékcsatlakozás | Két belépési út: Header „Játékod" (`/game/${gameId}`, `gameId` lehet `null`) és `/main` → modal. A Header a `gameId`-t csak egyszer olvassa (`Header.jsx:14-22`), join után elavul |

---

## 5. KÓDMINŐSÉG GYORSKÉP

**15 legnagyobb forrásfájl**

| # | Fájl | Sor |
|---|---|---|
| 1 | backend/src/controllers/user.controller.js | 287 |
| 2 | backend/src/controllers/game.controller.js | 277 |
| 3 | frontend/src/components/GameStatus.jsx | 177 |
| 4 | frontend/src/pages/GamePage.jsx | 151 |
| 5 | frontend/src/components/Header.jsx | 114 |
| 6 | backend/src/services/user.service.js | 114 |
| 7 | frontend/src/components/RegisterForm.jsx | 107 |
| 8 | frontend/src/pages/GameAdminPage.jsx | 105 |
| 9 | frontend/src/components/UsersAndAnswers.jsx | 102 |
| 10 | frontend/src/components/LoginForm.jsx | 97 |
| 11 | frontend/src/components/modals/GameSelectionModal.jsx | 96 |
| 12 | backend/src/controllers/answer.controller.js | 94 |
| 13 | frontend/src/contexts/AuthContext.jsx | 92 |
| 14 | backend/src/controllers/question.controller.js | 89 |
| 15 | backend/src/services/game.service.js | 83 |

A két legnagyobb fájl nagyjából fele kikommentezett halott kód.

**Backend szerkezet:** van szétválasztás (route → controller → service → prisma, plusz middleware, `HttpError`, yup validáció). Hibák:
- Az üzleti logika (szavazatszámlálás, időzítés) a **controllerben** van (`game.controller.js:169-265`), nem a service-ben.
- Validáció csak az auth-ban van, a többi végpont nem validál.
- Nincsenek típusos modellek: sima JS, a Prisma generált típusai nincsenek kihasználva.
- Nincs tranzakció, nincs logger (csak `console.log`), nincs async-error wrapper (Express 4).

**Frontend állapotkezelés:** `useState` + egyetlen `AuthContext` (user, login, register, logout). Nincs globális játékállapot, nincs data-fetching könyvtár, nincs közös hook. Minden oldal maga pollingol. A stílus Tailwind, kivéve `GameStatus.jsx`, ami teljesen inline CSS. Az újrahasznosítás gyenge (D1-D13).

**Lint / tsc**

| Eszköz | Eredmény |
|---|---|
| `tsc --noEmit` | **Nem futtatható**: nincs TypeScript, tsconfig/jsconfig |
| backend `eslint src` | 0 hiba, 0 figyelmeztetés |
| frontend `eslint .` | 0 hiba, 1 figyelmeztetés |

Az egyetlen figyelmeztetés: `react-hooks/exhaustive-deps`, `GameAdminPage.jsx:33` (hiányzó `fetchGame`).
A konfigurált lint **nem fog meg valós hibákat**. A kézzel talált, lint által nem jelzett legfontosabb 10 hiba:

1. `LoginForm.jsx:5`, `RegisterForm.jsx:2` importja `../schema/userValidationSchema`, a fájl neve viszont `UserValidationSchema.js`. Windowson fut, **Linuxon (Vercel/Docker) a build elbukik**.
2. `answer.controller.js:51-75`: `relQuestionNr`/`nextQuestNr` mezőket küld a Prisma-nak, a séma `relQuestN`/`nextQuestN` → az `update` mindig hibára fut.
3. `user.service.js:60-78`: az `update` nem módosít semmit, csak `answers`-t kapcsol.
4. `game.controller.js:262-264`: válasz elküldése után `next(error)` → `ERR_HTTP_HEADERS_SENT`, kezeletlen rejection, a Node folyamat leállhat.
5. `Header.jsx:68`: `/question` route nincs.
6. `GamePage.jsx:10`: `const { _user } = useContext(AuthContext)`, nem létező mező, mindig `undefined`.
7. `GameAdminPage.jsx:81`: `game?.questionNum &&`: ha `questionNum === 0` (az alapérték), `0` íródik ki szövegként, és nincs előnézet.
8. `GamePage.jsx:61`: az effect `timeLeft`-re függ, ezért az interval másodpercenként újraindul (lásd 6/8).
9. `auth.service.js:29`: a login `OR:[{username: undefined},{email: undefined}]` ágon hiányzó mezőknél bármely user-re illeszkedhet.
10. `PageForActors.jsx:4`: hardkódolt gameId.

---

## 6. ELSŐ BENYOMÁS – KOCKÁZATOK

| # | Súlyosság | Kockázat | Hol |
|---|---|---|---|
| 1 | **Magas** | **Jelszó-hash és email szivárgás.** `GET /api/user` és `/api/user/:id` **auth nélkül** visszaadja az összes usert a `password` hash-sel. A `GET /api/game/:id` és `/api/game` bármely belépettnek visszaadja a játék összes userét (hash + email + összes válasz). | `user.routes.js:10-11`, `user.service.js:32-48`, `game.service.js:12-36` |
| 2 | **Magas** | **Hiányzó admin-jogosultság** a játékvezérlésen: bármely játékos hívhatja a `next`, `reset`, `PUT`, `DELETE` game végpontokat, törölheti a játékot vagy léptetheti a kérdéseket. `POST /api/user` is auth nélküli. | `game.routes.js:18-31`, `user.routes.js:8` |
| 3 | **Magas** | **A játékos szavazhat többször, bármikor.** `addAnswerToGame` nem ellenőrzi: `availableForAns`, tagság a játékban, az answer az aktuális kérdéshez tartozik-e, volt-e már válasz erre a kérdésre. Scriptből tetszőleges számú szavazat adható le, a többség manipulálható. | `user.controller.js:241-272` |
| 4 | **Magas** | **Polling-terhelés 120–140 játékosnál.** Játékosonként 0,5 req/s a game végpontra, ami a lekérés előtt 2 DB query-t csinál (`isValid` + `findUnique`), és betölti az **összes játékost az összes válaszukkal** (a szavazatok felhalmozódnak, a payload kérdésenként nő). 140 játékosnál ~70 req/s, 140+ query/s, MB/s kimenő forgalom, ehhez jön a kérdés lekérése (~70 req/s). A Prisma alapértelmezett connection pool-ja kicsi (CPU×2+1), az olcsó DB-k kapcsolatlimitje szintén. | `game.service.js:21-36`, `GamePage.jsx:59`, `question.service.js:46` |
| 5 | **Magas** | **A szavazási ablak memóriában él** (`setTimeout` egy HTTP handlerben): szerver-újraindulás/deploy közben a játék beragad (`availableForAns=true`). Dupla kattintás (vagy a #2 miatt két hívó) két párhuzamos időzítőt indít, ami kétszer számolja és írja az eredményt. Nincs zárolás/állapotgép. | `game.controller.js:185-257` |
| 6 | **Magas** | **Valószínű szerverleállás:** a catch `next(error)`-t hív már elküldött válasz után, az `errorHandler` újra `res.json()`-t hív → kivétel, Express 4-ben nincs async-védelem, Node ≥15-ben kezeletlen rejection miatt a folyamat leállhat az előadás közepén (pl. DB hiba a 20 mp utáni műveleteknél). | `game.controller.js:262-264`, `errorHandlingMiddleware.js` |
| 7 | **Magas** | **Linux build hiba:** import kis/nagybetű eltérés (`userValidationSchema` vs `UserValidationSchema.js`). Windowson nem látszik, deploykor elbukik a `vite build`. | `LoginForm.jsx:5`, `RegisterForm.jsx:2` |
| 8 | **Közepes** | **Polling-interval minden másodpercben újraindul** a játékos oldalon, mert az effect `timeLeft`-től függ. A szavazás alatt (2 mp-es periódus, 1 mp-enként törlődik) gyakorlatilag nem pollingol. A kliens 20 mp-es visszaszámlálása a *látás* pillanatától indul (0–2 mp késés), így a játékos még szavazna, amikor a szerver már lezárt. | `GamePage.jsx:21-72` |
| 9 | **Közepes** | **A válaszok pontértékei és `nextQuestN` a kliensnek is kimennek** (`GET /api/question/number/:n` az `Answer` összes mezőjét adja): a játékos látja, melyik válasz mennyit ad Rékának/Dominak/Katának, a hálózati fülön megnézhető. | `question.service.js:46-53`, `GamePage.jsx:110` |
| 10 | **Közepes** | **A szavazatok nincsenek kérdésenként elkülönítve:** a `User.answers` M:N-ben halmozódik, nincs reset a kérdések között. Elágazó történetnél (ha `nextQuestN` visszavisz egy korábbi kérdéshez) a régi szavazatok újra beleszámítanak. A játék-reset sem törli a user-válaszokat (`resetGame` csak `collAnswer`-t üríti). | `game.controller.js:205-210`, `game.service.js:58-72` |
| 11 | **Közepes** | **Üres szavazat / játék vége nincs kezelve:** ha senki nem válaszol, a `return` miatt a játék ugyanazon a kérdésen marad, jelzés nélkül. Ha `nextQuestN` nem létező kérdésre mutat, a következő kattintás 404, nincs „játék vége" állapot. Döntetlennél véletlen választás, ami nincs jelezve az adminnak. | `game.controller.js:180-182, 212-216` |
| 12 | **Közepes** | **Admin oldal vak:** nincs élő szavazatszám/eloszlás, nincs polling, nincs `isAdmin` route-guard (bármely belépett user megnyithatja a `/game-admin/:id` oldalt), nincs reset/megszakítás gomb, a hiba felülírja az egész oldalt. | `GameAdminPage.jsx` |
| 13 | **Közepes** | **Biztonsági alapok hiányoznak:** `cors()` korlátozás nélkül (`app.js:14`), nincs rate limit (login/regisztráció brute-force, 140 egyidejű regisztráció), nincs helmet, JWT `localStorage`-ben, bcrypt költség 5 (`user.service.js:20`), nincs `JWT_SECRET`-ellenőrzés indításkor, `frontend/.env` commitolva. | `app.js`, `constants.js` |
| 14 | **Alacsony** | **Halott/hibás végpontok és hiányzó alapok:** `answer.update` hibás mezőnevek, `user.update` nem ment semmit, `/question` halott link, `/actors` hardkódolt gameId, nincs `start` script, nincs `.env.example`, nincsenek tesztek, a README elavult (8080 vs `PORT` alapérték 8000). | lásd 3. és 5. fejezet |
| 15 | **Alacsony** | **Karbantarthatóság:** ~170 sor kikommentezett kód, `GameStatus.jsx` teljes inline CSS + `console.log` minden renderben (`:12,40,48`), emoji-s kommentek, vegyes magyar/angol nevek, a szerveroldali vezérlés GET-tel történik (`GET /next/:id`, `game.routes.js:25`), nem idempotens. | `game.controller.js`, `GameStatus.jsx` |

---

*Javasolt következő körök: a szavazási folyamat állapotgéppé alakítása, realtime (SSE/WebSocket) bevezetése, a jogosultsági mátrix rendbetétele, terhelésteszt 140 virtuális játékossal.*
