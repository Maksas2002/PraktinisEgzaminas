# Studentų registro sistema

Pilno ciklo WEB aplikacija studentams ir jų mokomiesiems dalykams administruoti. Projektas sukurtas pagal kliento–serverio architektūrą:

Išsamus kodo ir architektūros paaiškinimas projekto gynimui pateiktas faile
[`PROJEKTO_PAAISKINIMAS.md`](PROJEKTO_PAAISKINIMAS.md).

- **WEB sąsaja:** React + Vite;
- **REST API:** JavaScript, Node.js ir Express;
- **duomenų bazė:** PostgreSQL (valdoma ir per pgAdmin);
- **paleidimas:** Docker Compose.

## Funkcionalumas

- studentų kūrimas, sąrašo peržiūra, detalios informacijos gavimas, redagavimas ir šalinimas;
- studento dalykų kūrimas, sąrašo ir konkretaus įrašo gavimas, redagavimas ir šalinimas;
- studentų filtravimas pagal kursą, ID, vardą ir pavardę;
- studento šalinimas kartu su jo dalykų priskyrimais (`ON DELETE CASCADE`);
- JSON užklausos, atsakymai ir aiškios validacijos klaidos;
- prisitaikanti, semantiniais HTML5 elementais sukurta React sąsaja;
- vieši REST API taškai.

## Duomenų bazė ir 3NF

Duomenys atskirti į tris lenteles:

- `students` – studento duomenys;
- `subjects` – unikalus dalyko pavadinimo ir kreditų katalogas;
- `student_subjects` – studento ir dalyko ryšys.

Tokiu būdu dalykų duomenys nekartojami kiekviename studento įraše, o daugelio-su-daugeliu ryšys realizuotas atskira lentele. Struktūra atitinka trečiosios normalinės formos reikalavimus.

## Paleidimas su Docker

Reikia turėti įdiegtus **Docker Desktop** ir **Docker Compose**.

1. Nukopijuokite aplinkos kintamųjų pavyzdį:

   ```bash
   cp .env.example .env
   ```

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

2. `.env` faile pakeiskite slaptažodžius. `DATABASE_URL` rašyti
   nereikia – Docker Compose jį automatiškai sudaro iš `POSTGRES_USER`,
   `POSTGRES_PASSWORD` ir `POSTGRES_DB`, todėl API ir PostgreSQL visada
   naudoja tuos pačius prisijungimo duomenis.

3. Paleiskite visą sistemą:

   ```bash
   docker compose up --build
   ```

4. Atidarykite:

   - WEB aplikacija: <http://localhost:5173>
   - REST API sveikatos patikra: <http://localhost:5000/health>
   - pgAdmin: <http://localhost:5050>

pgAdmin registruojant serverį naudokite:

- **Name**: `Studentų registras` (arba bet kokį kitą pavadinimą);
- **Host name/address**: `postgres`;
- **Port**: `5432`;
- **Maintenance database**: `POSTGRES_DB` reikšmę iš `.env`;
- **Username**: `POSTGRES_USER` reikšmę iš `.env`;
- **Password**: `POSTGRES_PASSWORD` reikšmę iš `.env`.

### pgAdmin klaida „password authentication failed“

PostgreSQL vartotojas ir slaptažodis nustatomi tik pirmą kartą kuriant
duomenų volume. Jei pakeitėte `.env` po pirmojo paleidimo, senas volume vis
dar naudoja ankstesnius duomenis.

Jei duomenų išsaugoti nereikia, atkurkite duomenų bazę:

```bash
docker compose down -v
docker compose up --build
```

> `down -v` ištrina lokalius PostgreSQL ir pgAdmin duomenis.

Jei `.env` naudojate:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
```

pgAdmin lange įrašykite `postgres` į **Maintenance database**, **Username**
ir **Password** laukus.

Sustabdymas:

```bash
docker compose down
```

Sustabdymas ir DB duomenų ištrynimas:

```bash
docker compose down -v
```

## Paleidimas be Docker

Reikia Node.js 22+ ir veikiančios PostgreSQL duomenų bazės.

```bash
cd back
npm install
npm run dev
```

Kitame terminale:

```bash
cd front
npm install
npm run dev
```

Prieš paleidžiant API be Docker būtina nurodyti `DATABASE_URL` ir įvykdyti
`back/src/db/init.sql`.

## REST API taškai

Visų užklausų ir atsakymų formatas – JSON, išskyrus sėkmingą `DELETE`, kuris grąžina `204 No Content`.

### Studentai

| Metodas | Adresas | Paskirtis |
|---|---|---|
| `GET` | `/api/students` | Gauti studentų sąrašą |
| `GET` | `/api/students?course=2` | Filtruoti pagal kursą |
| `GET` | `/api/students?id=3&firstName=Jonas&lastName=Jonaitis` | Filtruoti pagal ID, vardą ir pavardę |
| `GET` | `/api/students/:id` | Gauti studentą su dalykais |
| `POST` | `/api/students` | Sukurti studentą |
| `PUT` | `/api/students/:id` | Atnaujinti studentą |
| `DELETE` | `/api/students/:id` | Pašalinti studentą ir jo ryšius |

Studento JSON pavyzdys:

```json
{
  "firstName": "Jonas",
  "lastName": "Jonaitis",
  "course": 2
}
```

### Studento mokomieji dalykai

| Metodas | Adresas | Paskirtis |
|---|---|---|
| `GET` | `/api/students/:studentId/subjects` | Gauti studento dalykus |
| `GET` | `/api/students/:studentId/subjects/:assignmentId` | Gauti konkretų dalyko priskyrimą |
| `POST` | `/api/students/:studentId/subjects` | Sukurti ir priskirti dalyką |
| `PUT` | `/api/students/:studentId/subjects/:assignmentId` | Pakeisti priskirtą dalyką |
| `DELETE` | `/api/students/:studentId/subjects/:assignmentId` | Pašalinti dalyko priskyrimą |

Dalyko JSON pavyzdys:

```json
{
  "name": "JavaScript programavimas",
  "credits": 6
}
```

## HTTP statuso kodai

- `200 OK` – sėkmingas gavimas arba atnaujinimas;
- `201 Created` – įrašas sukurtas;
- `204 No Content` – įrašas pašalintas;
- `400 Bad Request` – netinkami įvesties duomenys;
- `404 Not Found` – studentas, dalykas arba adresas nerastas;
- `409 Conflict` – dalykas studentui jau priskirtas;
- `500 Internal Server Error` – serverio klaida.

Klaidos atsakymo pavyzdys:

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

## Testai

API vienetiniai testai:

```bash
cd back
npm install
npm test
```

Viso projekto patikra iš šakninio katalogo:

```bash
npm test
```

WEB aplikacijos produkcinis surinkimas:

```bash
npm run build
```

## Projekto struktūra

```text
.
├── back
│   ├── src
│   │   ├── controllers   # HTTP užklausų valdymas
│   │   ├── db            # PostgreSQL prisijungimas ir schema
│   │   ├── middleware    # klaidos ir validacijos rezultatai
│   │   ├── repositories  # duomenų prieigos sluoksnis
│   │   ├── routes        # REST API maršrutai
│   │   ├── services      # verslo logika
│   │   └── validators    # įvesties validacija
│   └── test
├── front
│   └── src
│       ├── components
│       ├── api.js
│       └── App.jsx
└── docker-compose.yml
```

Slapti nustatymai nėra saugomi repozitorijoje: `.env` įtrauktas į `.gitignore`, o pateikiamas tik saugus `.env.example`.
