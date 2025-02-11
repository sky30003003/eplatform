# Arhitectura Sistem ePlatform

## 1. Prezentare Generală

Sistemul ePlatform este o aplicație web pentru gestionarea semnăturilor electronice avansate, dezvoltată folosind:
- Backend: NestJS (Node.js)
- Frontend: React
- Bază de date: MySQL
- Deployment: Docker (opțional)

## 2. Componente Principale

### 2.1 Frontend (React)

#### Structura Directorului
```
frontend/
├── src/
│   ├── layouts/                  # Layout-uri comune
│   │   ├── MainLayout/          # Layout principal cu header, footer
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── index.tsx
│   │   └── AuthLayout/          # Layout pentru autentificare
│   ├── pages/                   # Pagini organizate pe roluri
│   │   ├── superadmin/         # Pagini specifice SuperAdmin
│   │   │   ├── organizations/  # CRUD Organizații
│   │   │   └── orgadmins/     # CRUD OrgAdmins
│   │   ├── orgadmin/          # Pagini specifice OrgAdmin
│   │   │   ├── members/       # Gestiune membri
│   │   │   └── documents/     # Gestiune documente
│   │   ├── admin/            # Pagini specifice Admin
│   │   ├── collaborator/     # Pagini specifice Colaborator
│   │   └── employee/         # Pagini specifice Angajat
│   ├── components/           # Componente reutilizabile
│   │   ├── common/          # Componente UI de bază
│   │   └── features/        # Componente specifice funcționalităților
│   ├── hooks/               # Custom hooks
│   ├── services/            # Servicii API
│   ├── store/              # State management
│   ├── theme/              # Configurare tema și stiluri
│   └── utils/              # Utilități comune
```

#### Principii de Design Frontend
1. **Modularitate**
   - Fișiere mici, cu responsabilitate unică
   - Separare clară între componente
   - Reutilizare maximă de cod

2. **Responsive Design**
   - Breakpoints predefinite pentru toate dimensiunile de ecran
   - Layout fluid și adaptabil
   - Mobile-first approach

3. **Consistență Vizuală**
   - Sistem de teme centralizat
   - Variabile pentru culori, spațiere, tipografie
   - Componente UI standardizate

4. **Performanță**
   - Code splitting pe rute
   - Lazy loading pentru componente mari
   - Optimizare imagini și assets

### 2.2 Backend (NestJS)

#### Structura Modulară
- **Auth Module**: Autentificare și autorizare
- **Users Module**: Gestiunea utilizatorilor și rolurilor
- **Documents Module**: Gestiunea documentelor
- **Signatures Module**: Procesarea semnăturilor
- **Common Module**: Funcționalități comune

#### Securitate
- JWT pentru autentificare
- Rate limiting
- Validare input
- CORS configurabil
- Criptare date sensibile

#### Bază de Date
- MySQL cu TypeORM
- Migrări automate
- Backup automatizat

### 2.3 Roluri și Permisiuni

#### SuperAdmin
- Gestiune organizații (CRUD)
- Gestiune OrgAdmin (CRUD)

#### OrgAdmin
- Gestiune membri organizație (CRUD)
- Gestiune documente și fluxuri semnături

#### Admin
- Gestiune membri (doar Colaboratori și Angajați)
- Gestiune documente și fluxuri semnături

#### Colaborator
- Vizualizare și semnare documente

#### Angajat
- Vizualizare și semnare documente

## 3. Fluxuri de Date

### 3.1 Autentificare
1. Login cu username/password
2. Generare JWT
3. Stocare token în localStorage
4. Refresh token mechanism

### 3.2 Semnare Document
1. Upload document
2. Validare document
3. Configurare workflow semnături
   - Selectare semnatari (OrgAdmin, Colaborator, Angajați)
4. Aplicare semnături conform workflow
5. Validare semnături
6. Salvare document final

## 4. Securitate

### 4.1 Autentificare și Autorizare

#### 4.1.1 JWT (JSON Web Tokens)
- Token de acces cu durată scurtă (15 minute)
- Token de refresh cu durată lungă (30 zile)
- Validare completă a token-urilor:
  - Verificare expirare
  - Verificare data emiterii
  - Verificare subject
  - Validare semnătură

#### 4.1.2 Rate Limiting
- Limitare încercări de autentificare: 5 încercări / minut
- Protecție împotriva atacurilor de tip brute force
- Configurabil prin variabile de mediu

### 4.2 Protecția CSRF și XSS

#### 4.2.1 CSRF Protection
- Token-uri CSRF generate pentru fiecare sesiune
- Cookie-uri securizate cu flags:
  - httpOnly: true
  - sameSite: strict
  - secure: true (în producție)

#### 4.2.2 Headers de Securitate (Helmet)
- Content-Security-Policy
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

### 4.3 Gestionare Sesiune

#### 4.3.1 Token Management
- Refresh automat al token-urilor înainte de expirare
- Validare strictă la primirea noilor token-uri
- Curățare completă la delogare:
  - Ștergere token-uri
  - Curățare localStorage și sessionStorage
  - Invalidare sesiune server

#### 4.3.2 CORS Configuration
- Origin restricționat la domeniul frontend-ului
- Metode HTTP permise configurate explicit
- Headers permise strict definite
- Credentials support pentru cookie-uri

### 4.4 Validare și Sanitizare

#### 4.4.1 Input Validation
- Validare globală prin ValidationPipe
- Whitelist pentru proprietăți permise
- Transformare automată a tipurilor
- Validare strictă a DTO-urilor

#### 4.4.2 Database Security
- Prepared statements pentru prevenirea SQL injection
- Hashing parole cu Argon2
- Audit logging pentru operații sensibile
- Principle of least privilege pentru conexiuni DB

## 5. Scalabilitate

### 5.1 Design Principles
- Microservices-ready architecture
- Caching strategy
- Load balancing ready
- Database indexing

### 5.2 Performance
- Lazy loading
- Code splitting
- Resource optimization
- CDN ready

## 6. Deployment

### 6.1 Development
- Environment configuration
- Hot reloading
- Debug tools

### 6.2 Production
- Docker containers
- Environment variables
- Health monitoring
- Logging system

## 7. Maintenance

### 7.1 Monitoring
- Error tracking
- Performance metrics
- User analytics
- System health

### 7.2 Backup
- Database backup
- Document backup
- Configuration backup
- Disaster recovery plan 