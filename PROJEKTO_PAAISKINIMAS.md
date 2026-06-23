# Studentų registro projekto paaiškinimas

Šis dokumentas skirtas pasiruošti projekto gynimui. Jame paaiškinta sistemos
architektūra, svarbiausi failai, duomenų judėjimas ir galimi gynimo klausimai.

## 1. Trumpas projekto pristatymas

Projektas yra studentų registro WEB sistema. Ji leidžia:

- pridėti, peržiūrėti, redaguoti ir pašalinti studentus;
- studentui priskirti, redaguoti ir pašalinti mokomuosius dalykus;
- filtruoti studentus pagal ID, vardą, pavardę ir kursą;
- peržiūrėti studento detalią informaciją bei bendrą kreditų skaičių.

Sistema sudaryta iš keturių dalių:

1. **React WEB aplikacija** – vartotojo sąsaja.
2. **Express REST API** – priima HTTP užklausas ir vykdo verslo logiką.
3. **PostgreSQL** – saugo studentų ir dalykų duomenis.
4. **pgAdmin** – grafinė PostgreSQL administravimo priemonė.

Visas dalis paleidžia `Docker Compose`.

## 2. Kliento–serverio architektūra

Duomenų kelias sistemoje:

```text
Vartotojas
   ↓
React komponentas
   ↓
front/src/api.js
   ↓ HTTP + JSON
Express maršrutas
   ↓
Valdiklis (controller)
   ↓
Servisas (verslo logika)
   ↓
Repository (SQL užklausa)
   ↓
PostgreSQL
```

Atsakymas grįžta atgal tuo pačiu keliu ir React atnaujina vaizdą.

Toks sluoksnių atskyrimas svarbus todėl, kad:

- maršrutai aprašo API adresus;
- valdikliai dirba su HTTP užklausa ir atsakymu;
- servisai vykdo verslo taisykles;
- repository sluoksnis atsakingas tik už SQL;
- vartotojo sąsaja nežino, kaip fiziškai saugomi duomenys.

## 3. Projekto katalogai

```text
PraktinisEgzaminas
├── back                 # REST API
│   ├── src
│   │   ├── controllers  # HTTP užklausų apdorojimas
│   │   ├── db           # DB ryšys ir SQL struktūra
│   │   ├── middleware   # klaidos ir validacija
│   │   ├── repositories # SQL užklausos
│   │   ├── routes       # REST API endpoint'ai
│   │   ├── services     # verslo logika
│   │   └── validators   # įvesties taisyklės
│   └── test             # vienetiniai testai
├── front                # React WEB aplikacija
│   └── src
│       ├── components   # vartotojo sąsajos dalys
│       ├── api.js       # HTTP užklausos
│       └── App.jsx      # pagrindinė būsena ir veiksmų valdymas
├── docker-compose.yml   # visų servisų paleidimas
├── .env.example         # aplinkos kintamųjų pavyzdys
└── README.md            # paleidimo instrukcija
```

## 4. Duomenų bazė

### `back/src/db/init.sql`

Šis failas pirmą kartą paleidus PostgreSQL sukuria lenteles, indeksus ir
demonstracinius duomenis.

### Lentelė `students`

Saugo studento informaciją:

- `id` – automatiškai generuojamas pirminis raktas;
- `first_name` – vardas;
- `last_name` – pavardė;
- `course` – kursas nuo 1 iki 6;
- `created_at` – sukūrimo laikas;
- `updated_at` – paskutinio atnaujinimo laikas.

`CHECK (course BETWEEN 1 AND 6)` neleidžia į DB įrašyti netinkamo kurso net
tuo atveju, jei būtų apeita API validacija.

### Lentelė `subjects`

Saugo mokomojo dalyko informaciją:

- `id` – dalyko identifikatorius;
- `name` – dalyko pavadinimas;
- `credits` – kreditų skaičius.

Unikalus apribojimas `(name, credits)` neleidžia kurti identiškų dalykų
dublikatų.

### Lentelė `student_subjects`

Tai jungiamoji lentelė tarp studentų ir dalykų:

- `student_id` nurodo studentą;
- `subject_id` nurodo dalyką;
- `UNIQUE (student_id, subject_id)` neleidžia tam pačiam studentui dukart
  priskirti to paties dalyko.

Ryšys su studentu naudoja:

```sql
REFERENCES students(id) ON DELETE CASCADE
```

Tai reiškia, kad pašalinus studentą automatiškai pašalinami visi jo dalykų
priskyrimai. Ši funkcija realizuoja užduotyje reikalaujamą kaskadinį šalinimą.

### Kodėl struktūra atitinka 3NF?

- Kiekviena lentelė aprašo vieną objektą arba ryšį.
- Studento duomenys saugomi tik `students` lentelėje.
- Dalyko duomenys saugomi tik `subjects` lentelėje.
- Studento ir dalyko ryšys saugomas `student_subjects`.
- Ne pirminio rakto laukai priklauso nuo savo lentelės pirminio rakto, o ne
  nuo kitų ne rakto laukų.

Taip išvengiama duomenų kartojimo ir atnaujinimo anomalijų.

### `back/src/db/connection.js`

Failas:

- pasiima `DATABASE_URL` iš aplinkos kintamųjų;
- sukuria PostgreSQL ryšio objektą;
- eksportuoja `sql`, naudojamą repository failuose;
- turi `testConnection()` funkciją ryšiui patikrinti.

Slaptažodis nėra įrašytas JavaScript kode. Docker Compose suformuoja
`DATABASE_URL` iš `.env` faile esančių kintamųjų.

## 5. Serverio paleidimas

### `back/src/server.js`

Tai REST API paleidimo taškas.

Veiksmų seka:

1. Patikrinamas ryšys su PostgreSQL.
2. Jei ryšys sėkmingas, Express pradeda klausyti `PORT`.
3. Jei DB nepasiekiama, serveris išveda klaidą ir sustoja.

Tai apsaugo nuo situacijos, kai API atrodo paleista, bet negali vykdyti
jokių duomenų operacijų.

### `back/src/app.js`

Šis failas sukonfigūruoja Express aplikaciją:

- `cors` leidžia React aplikacijai siųsti užklausas į API;
- `express.json()` perskaito JSON užklausų kūną;
- `/health` grąžina serverio būseną;
- `/api/students` prijungia studentų maršrutus;
- `/api/students/:studentId/subjects` prijungia dalykų maršrutus;
- pabaigoje prijungiami 404 ir bendras klaidų middleware.

Middleware ir maršrutų tvarka svarbi: Express juos vykdo iš viršaus į apačią.

## 6. REST API maršrutai

### `back/src/routes/studentRoutes.js`

Aprašo studentų endpoint'us:

| Metodas | Adresas | Funkcija |
|---|---|---|
| `GET` | `/api/students` | Grąžina studentų sąrašą |
| `POST` | `/api/students` | Sukuria studentą |
| `GET` | `/api/students/:id` | Grąžina vieną studentą |
| `PUT` | `/api/students/:id` | Atnaujina studentą |
| `DELETE` | `/api/students/:id` | Pašalina studentą |

Prieš valdiklį vykdomos validacijos taisyklės ir `validateRequest`.

### `back/src/routes/subjectRoutes.js`

Aprašo studentui priskirtų dalykų endpoint'us:

| Metodas | Adresas | Funkcija |
|---|---|---|
| `GET` | `/api/students/:studentId/subjects` | Grąžina studento dalykus |
| `POST` | `/api/students/:studentId/subjects` | Priskiria naują dalyką |
| `GET` | `/api/students/:studentId/subjects/:assignmentId` | Grąžina vieną priskyrimą |
| `PUT` | `/api/students/:studentId/subjects/:assignmentId` | Atnaujina dalyką |
| `DELETE` | `/api/students/:studentId/subjects/:assignmentId` | Pašalina priskyrimą |

`Router({ mergeParams: true })` leidžia šiame maršrute pasiekti tėvinio
adreso parametrą `studentId`.

## 7. Valdikliai

### `back/src/controllers/studentController.js`

Valdikliai yra tarpininkai tarp HTTP ir verslo logikos.

Kiekviena funkcija:

1. pasiima parametrus iš `req.params`, `req.query` arba `req.body`;
2. iškviečia studentų servisą;
3. grąžina JSON ir tinkamą HTTP statusą;
4. klaidą perduoda į `next(error)`.

Naudojami statusai:

- `200` – sėkmingas gavimas ar atnaujinimas;
- `201` – studentas sukurtas;
- `204` – studentas pašalintas, atsakymo kūno nėra.

### `back/src/controllers/subjectController.js`

Veikia tokiu pačiu principu, tačiau perduoda ir `studentId`, ir
`assignmentId`. Tai užtikrina, kad būtų keičiamas būtent pasirinkto studento
dalyko priskyrimas.

## 8. Verslo logika

### `back/src/services/studentService.js`

Šis sluoksnis:

- gauna studentų sąrašą;
- patikrina, ar konkretus studentas egzistuoja;
- prie studento detalių prideda jo dalykus;
- sukuria ir atnaujina studentą;
- grąžina `404`, jei redaguojamo ar šalinamo studento nėra.

Verslo logika laikoma atskirai nuo valdiklio, kad ją būtų lengviau testuoti,
keisti ir pakartotinai naudoti.

### `back/src/services/subjectService.js`

Prieš kiekvieną dalyko operaciją `ensureStudent()` patikrina, ar studentas
egzistuoja.

Servisas taip pat apdoroja PostgreSQL klaidos kodą `23505`. Šis kodas reiškia
unikalumo pažeidimą. Tokiu atveju API grąžina:

```json
{
  "error": {
    "message": "Toks dalykas studentui jau priskirtas."
  }
}
```

HTTP statusas yra `409 Conflict`.

## 9. Duomenų prieigos sluoksnis

### `back/src/repositories/studentRepository.js`

Čia laikomos visos studentų SQL užklausos:

- `findStudents()` – sąrašas ir filtravimas;
- `findStudentById()` – studentas pagal ID;
- `insertStudent()` – `INSERT`;
- `updateStudentById()` – `UPDATE`;
- `deleteStudentById()` – `DELETE`.

Filtravimas atliekamas vienoje SQL užklausoje. Pavyzdžiui:

```sql
(${course}::int IS NULL OR s.course = ${course})
```

Jei filtras nepateiktas, pirmoji sąlygos dalis yra teisinga ir filtras
neapriboja rezultatų. Jei kursas pateiktas, grąžinami tik to kurso studentai.

Vardui ir pavardei naudojamas `ILIKE`, todėl paieška:

- nepriklauso nuo didžiųjų ir mažųjų raidžių;
- gali rasti dalį žodžio.

`COUNT(ss.id)` apskaičiuoja, kiek dalykų priskirta kiekvienam studentui.

### `back/src/repositories/subjectRepository.js`

Šis failas:

- grąžina studento dalykus;
- randa konkretų priskyrimą;
- sukuria dalyką, jei jo dar nėra;
- sukuria studento ir dalyko ryšį;
- atnaujina arba pašalina ryšį.

Kūrimas ir atnaujinimas vykdomi transakcijose:

```js
sql.begin(async (transaction) => {
  // kelios susijusios DB operacijos
});
```

Transakcija užtikrina, kad visos susijusios operacijos būtų įvykdytos kartu.
Jei viena operacija nepavyksta, pakeitimai atšaukiami.

## 10. Validacija ir klaidos

### `back/src/validators/rules.js`

Čia aprašytos paprastos, nepriklausomos validacijos funkcijos:

- `isValidName()` – vardas arba pavardė turi 2–80 simbolių;
- `isValidCourse()` – kursas yra sveikasis skaičius nuo 1 iki 6;
- `isValidSubjectName()` – dalyko pavadinimas turi 2–120 simbolių;
- `isValidCredits()` – kreditai yra sveikasis skaičius nuo 1 iki 30.

Šios funkcijos atskirtos todėl, kad jas galima tiesiogiai testuoti.

### `studentValidators.js` ir `subjectValidators.js`

Šie failai susieja validavimo taisykles su konkrečiais:

- URL parametrais;
- užklausos filtrais;
- JSON laukais.

### `middleware/validateRequest.js`

Suranda visas `express-validator` klaidas ir grąžina vienodą JSON formatą:

```json
{
  "error": {
    "message": "Pateikti netinkami duomenys.",
    "details": [
      {
        "field": "course",
        "message": "Kursas turi būti sveikasis skaičius nuo 1 iki 6."
      }
    ]
  }
}
```

### `middleware/AppError.js`

Tai nuosava klaidos klasė. Ji saugo:

- žmogui suprantamą pranešimą;
- HTTP statuso kodą;
- papildomas klaidos detales.

### `middleware/errorHandler.js`

- `notFoundHandler` apdoroja neegzistuojantį API adresą;
- `errorHandler` suvienodina visų klaidų JSON atsakymus;
- produkcinėje aplinkoje neatskleidžia vidinių serverio detalių.

## 11. React aplikacija

### `front/src/main.jsx`

Tai React paleidimo taškas. Jis:

- suranda HTML elementą `#root`;
- į jį įkelia pagrindinį `App` komponentą;
- prijungia bendrą CSS failą.

### `front/src/App.jsx`

Tai pagrindinis React komponentas ir aplikacijos valdymo centras.

Svarbiausios būsenos:

- `students` – rodomų studentų masyvas;
- `filters` – pasirinkti filtrai;
- `selected` – detaliai peržiūrimas studentas;
- `editing` – redaguojamas studentas;
- `loading` – ar kraunami duomenys;
- `busy` – ar vyksta išsaugojimo operacija;
- `message` – sėkmės arba klaidos pranešimas.

`useEffect` su 250 ms uždelsimu leidžia filtruoti ne po kiekvieno klavišo
paspaudimo akimirksniu, o trumpai palaukus. Tai sumažina nereikalingų HTTP
užklausų kiekį.

Pagrindinės funkcijos:

- `loadStudents()` – parsiunčia studentų sąrašą;
- `selectStudent()` – parsiunčia studento detales;
- `saveStudent()` – sukuria arba atnaujina studentą;
- `removeStudent()` – pašalina studentą;
- `subjectAction()` – bendra dalykų kūrimo, keitimo ir šalinimo eiga.

### `front/src/api.js`

Tai vienintelė vieta, kur React tiesiogiai bendrauja su REST API.

`request()` funkcija:

- suformuoja pilną URL;
- nustato JSON antraštę;
- iškviečia `fetch`;
- perskaito JSON;
- nesėkmės atveju iš API klaidos sukuria JavaScript `Error`.

`api` objektas turi aiškias funkcijas:

- `getStudents`;
- `getStudent`;
- `createStudent`;
- `updateStudent`;
- `deleteStudent`;
- analogiškas dalykų funkcijas.

Tai neleidžia išmėtyti `fetch` užklausų po visus komponentus.

## 12. React komponentai

### `components/Filters.jsx`

Atvaizduoja filtrus pagal:

- ID;
- vardą;
- pavardę;
- kursą.

Komponentas pats nesaugo pagrindinių filtrų duomenų. Reikšmes gauna per
`props`, o pakeitimus perduoda tėviniam `App` komponentui per `onChange`.
Tai vadinama kontroliuojamais formos laukais.

### `components/StudentList.jsx`

Atvaizduoja studentus lentelėje.

Komponentas turi tris būsenų vaizdus:

- duomenys kraunami;
- studentų nerasta;
- studentų lentelė.

Paspaudus studento vardą vykdoma `onSelect`, o redagavimo ir šalinimo
mygtukai iškviečia atitinkamas tėvinio komponento funkcijas.

### `components/StudentForm.jsx`

Naudojamas ir kūrimui, ir redagavimui.

Jei perduotas `student`, forma užpildoma jo duomenimis ir veikia redagavimo
režimu. Jei studentas nepateiktas, forma kuria naują įrašą.

`useEffect` atnaujina formos laukus pasikeitus redaguojamam studentui.

### `components/StudentDetails.jsx`

Rodo:

- studento vardą ir pavardę;
- ID ir kursą;
- bendrą kreditų skaičių;
- priskirtų dalykų sąrašą;
- dalyko pridėjimo arba redagavimo formą.

Bendras kreditų skaičius apskaičiuojamas naudojant `reduce`:

```js
student.subjects.reduce((sum, subject) => sum + subject.credits, 0);
```

### `front/src/styles.css`

Aprašo visą dizainą:

- spalvas ir CSS kintamuosius;
- lenteles, formas, korteles ir mygtukus;
- pranešimus ir būsenas;
- mobilų išdėstymą su `@media` taisyklėmis.

Sąsaja prisitaiko prie planšetės ir telefono ekrano.

## 13. HTML5 semantiniai elementai

React sąsajoje naudojami:

- `<header>` – puslapio antraštė;
- `<main>` – pagrindinis turinys;
- `<section>` – loginės turinio dalys;
- `<aside>` – studento detalės;
- `<article>` – vienas mokomasis dalykas;
- `<footer>` – puslapio apačia;
- `<form>`, `<label>`, `<table>` – semantiškai tinkami valdikliai.

Semantika pagerina prieinamumą, paieškos sistemų supratimą ir kodo
skaitomumą.

## 14. Docker

### `docker-compose.yml`

Paleidžia keturis servisus:

#### `postgres`

- naudoja `postgres:16-alpine`;
- gauna vartotoją, slaptažodį ir DB pavadinimą iš `.env`;
- saugo duomenis `postgres_data` volume;
- pirmą kartą įvykdo `init.sql`;
- turi healthcheck.

#### `pgadmin`

- naudoja `dpage/pgadmin4`;
- pasiekiamas per `localhost:5050`;
- saugo savo nustatymus `pgadmin_data` volume.

pgAdmin serverio ryšio duomenys:

```text
Host: postgres
Port: 5432
Database: student_registry
Username: student_registry
Password: change_me
```

`postgres` yra Docker serviso vardas. Jis veikia tik tarp to paties Compose
tinklo konteinerių.

#### `back`

- sukuria API atvaizdą iš `back/Dockerfile`;
- laukia, kol PostgreSQL bus sveikas;
- gauna `DATABASE_URL`, sudarytą iš PostgreSQL kintamųjų;
- API iš kompiuterio pasiekiamas per `localhost:5000`.

#### `front`

- sukuria React atvaizdą iš `front/Dockerfile`;
- pasiekiamas per `localhost:5173`;
- į naršyklę perduoda API adresą.

### Kodėl naudojami volume?

- PostgreSQL duomenys neišnyksta perkūrus konteinerį.
- pgAdmin išsaugo registruotus serverius.
- `node_modules` laikomas konteinerio viduje ir nekonfliktuoja su Windows.

Komanda `docker compose down` volume palieka.

Komanda `docker compose down -v` volume ištrina kartu su visais lokaliais DB
duomenimis.

## 15. Aplinkos kintamieji

`.env` faile laikomi:

```env
POSTGRES_USER=student_registry
POSTGRES_PASSWORD=change_me
POSTGRES_DB=student_registry
PORT=5000
CLIENT_URL=http://localhost:5173
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=change_me
VITE_API_URL=http://localhost:5000/api
```

`.env` nėra keliamas į Git, nes jis gali turėti slaptus duomenis.
Repozitorijoje laikomas tik `.env.example`.

## 16. Testai

### `back/test/validation.test.js`

Naudojamas integruotas Node.js testų modulis.

Testai tikrina:

- tinkamą ir netinkamą vardą;
- kurso ribas;
- dalyko pavadinimą;
- kreditų ribas.

Paleidimas:

```bash
cd back
npm test
```

React patikros:

```bash
cd front
npm run lint
npm run build
```

`lint` ieško kodo kokybės problemų, o `build` patvirtina, kad aplikacija gali
būti paruošta produkcijai.

## 17. Vienos operacijos pavyzdys

### Naujo studento kūrimas

1. Vartotojas užpildo `StudentForm`.
2. Forma iškviečia `App.jsx` funkciją `saveStudent`.
3. `api.createStudent()` siunčia:

   ```http
   POST /api/students
   Content-Type: application/json
   ```

   ```json
   {
     "firstName": "Jonas",
     "lastName": "Jonaitis",
     "course": 2
   }
   ```

4. `studentRoutes.js` paleidžia validaciją.
5. `studentController.js` priima HTTP duomenis.
6. `studentService.js` iškviečia duomenų prieigos funkciją.
7. `studentRepository.js` vykdo `INSERT INTO students`.
8. API grąžina `201 Created` ir studento JSON.
9. React iš naujo parsiunčia sąrašą ir parodo studentą lentelėje.

## 18. CRUD reikšmė

CRUD reiškia:

- **Create** – `POST`, naujo įrašo kūrimas;
- **Read** – `GET`, duomenų gavimas;
- **Update** – `PUT`, esamo įrašo atnaujinimas;
- **Delete** – `DELETE`, įrašo pašalinimas.

Šiame projekte pilnas CRUD realizuotas ir studentams, ir jų dalykų
priskyrimams.

## 19. Galimi gynimo klausimai

### Kodėl pasirinktas REST API?

REST aiškiai susieja resursus su URL, naudoja standartinius HTTP metodus ir
leidžia React klientą atskirti nuo serverio realizacijos.

### Kodėl duomenys siunčiami JSON?

JSON yra lengvai apdorojamas JavaScript, tinkamas HTTP API ir žmogui
perskaitomas formatas.

### Kodėl validacija atliekama ir API, ir DB?

API pateikia aiškią klaidą vartotojui, o DB apribojimai yra paskutinė
apsauga nuo nekorektiškų duomenų.

### Kodėl ne viskas parašyta viename serverio faile?

Sluoksnių atskyrimas mažina priklausomybes, gerina skaitomumą, leidžia
lengviau testuoti ir plėsti sistemą.

### Kuo skiriasi controller ir service?

Controller dirba su HTTP objektais `req` ir `res`. Service vykdo verslo
logiką ir neturi būti priklausomas nuo vartotojo sąsajos.

### Kuo skiriasi service ir repository?

Service priima verslo sprendimus, pavyzdžiui, tikrina ar studentas
egzistuoja. Repository tik vykdo SQL užklausas.

### Kaip realizuotas filtravimas?

React filtrus perduoda kaip URL query parametrus, pavyzdžiui:

```text
GET /api/students?course=2&firstName=Jon
```

API validuoja parametrus, o repository pritaiko juos SQL `WHERE` sąlygoje.

### Kaip realizuotas kaskadinis šalinimas?

`student_subjects.student_id` išorinis raktas turi `ON DELETE CASCADE`.
Pašalinus studentą PostgreSQL automatiškai pašalina jo ryšius su dalykais.

### Kodėl dalykas ir jo priskyrimas yra atskiri?

Tas pats dalykas gali būti priskirtas keliems studentams. Atskyrimas mažina
duomenų dubliavimą ir atitinka reliacinį modelį.

### Kodėl naudojamos transakcijos?

Priskiriant dalyką reikia ir rasti arba sukurti dalyką, ir sukurti ryšį.
Transakcija garantuoja, kad neliks pusiau atliktos operacijos.

### Kam naudojamas CORS?

Naršyklė React aplikaciją ir API laiko skirtingais origin, nes jų prievadai
skiriasi. CORS leidžia patvirtintam klientui siųsti API užklausas.

### Kodėl slapti duomenys laikomi `.env`?

Kad slaptažodžiai nebūtų įrašyti programos kode ir nepatektų į Git
repozitoriją.

### Ką dar būtų galima patobulinti?

- pridėti autentifikaciją ir vartotojų roles;
- pridėti puslapiavimą dideliam studentų kiekiui;
- pridėti integracinius API testus;
- naudoti migracijų sistemą;
- produkcijoje React pateikti per Nginx;
- naudoti sudėtingesnę paiešką ir rikiavimą;
- pridėti automatinį CI procesą GitHub Actions.

## 20. Trumpa kalba gynimui

> Sukūriau studentų registro sistemą pagal kliento–serverio architektūrą.
> Vartotojo sąsaja realizuota su React, o serverio dalis – su Node.js ir
> Express. React per HTTP siunčia ir gauna JSON duomenis iš REST API. API
> kodas suskirstytas į maršrutų, valdiklių, servisų ir repository sluoksnius,
> todėl verslo logika atskirta nuo duomenų prieigos. Duomenys saugomi
> PostgreSQL duomenų bazėje, kurios struktūra normalizuota iki 3NF. Studentų
> ir dalykų ryšys saugomas atskiroje jungiamojoje lentelėje, o studento
> šalinimas realizuotas kaskadiniu būdu. Sistema turi pilną CRUD, filtravimą,
> įvesties validaciją, vienodą JSON klaidų formatą ir prisitaikančią React
> sąsają. Visos sistemos dalys paleidžiamos naudojant Docker Compose.

