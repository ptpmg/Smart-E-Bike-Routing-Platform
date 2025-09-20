### 🎯 Objetivo

Uma aplicação **fullstack** que permite:

- Registar utilizadores.
- Criar, guardar e partilhar rotas para bicicletas elétricas.
- Integrar com APIs externas (ex: mapas, meteorologia).
- Apresentar dashboards com estatísticas (km percorridos, gasto energético estimado, poupança de CO₂).
- Gestão administrativa (moderar utilizadores/rotas, estatísticas globais).

---

### 🖥️ Frontend (React + Tailwind ou Next.js)

- SPA com autenticação (JWT).
- Página de mapa interativo (Leaflet ou Mapbox).
- Painel do utilizador com rotas criadas e estatísticas.
- Área de administração.

---

### ⚙️ Backend (Node.js + Express ou NestJS)

- API RESTful.
- CRUD de utilizadores, rotas e estatísticas.
- Integração com API de meteorologia (para prever condições do trajeto).
- Autenticação e autorização com JWT + RBAC (Role-Based Access Control).

---

### 🗄️ Base de Dados

- PostgreSQL (estrutura relacional para utilizadores/rotas).
- Redis para cache de rotas e sessões.
- Opção: ElasticSearch para pesquisa avançada de rotas.

---

### ☁️ DevOps (todas as fases incluídas)

1. **Controlo de versão**: Git + GitHub/GitLab.
2. **CI/CD**:
   - GitHub Actions/GitLab CI para testes automáticos e deploy.
3. **Containerização**:
   - Docker + docker-compose (frontend, backend, db).
   - Opção: Kubernetes (kind/minikube para testar).
4. **Infraestrutura como código**:
   - Terraform para provisionar VM na cloud (AWS, GCP ou Azure free tier).
5. **Monitorização & Logging**:
   - Prometheus + Grafana para métricas.
   - ELK stack (Elastic + Logstash + Kibana) para logs.
6. **Deploy**:
   - Nginx como reverse proxy.
   - HTTPS com Let’s Encrypt.
