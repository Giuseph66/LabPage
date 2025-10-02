## API - Endpoints

Sugestão: exporte variáveis de ambiente para facilitar os testes

```bash
url="http://localhost:8080"
# Após o login, substitua o conteúdo do TOKEN
TOKEN="coloque_o_token_aqui"
```

### Autenticação

#### POST /api/auth/register
- Finalidade: cadastrar usuário e retornar um JWT
- Acesso: público
- Body (JSON):
```json
{
  "gmail": "usuario@if.edu.br",
  "nome": "Nome Sobrenome",
  "senha": "SenhaForte123",
  "matricula": "202500123",
  "curso": "Engenharia",
  "telefone": "+55 11 99999-0000",
  "roles": ["ACADEMICO"]
}
```
- Resposta (200 OK): `{ "token": "..." }`

Exemplo (cURL):
```bash
curl -X POST "$url/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "gmail": "joao@if.edu.br",
    "nome": "João Silva",
    "senha": "SenhaForte123"
  }'
  ```

#### POST /api/auth/login
- Finalidade: autenticar e retornar um JWT
- Acesso: público
- Body: `{ "gmail": "joao@if.edu.br", "senha": "SenhaForte123" }`
- Resposta (200 OK): `{ "token": "..." }`

Exemplo (cURL):
```bash
curl -X POST "$url/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{ "gmail": "joao@if.edu.br", "senha": "SenhaForte123" }'

# Dica: capturar o token automaticamente (se tiver jq instalado)
TOKEN=$(curl -s -X POST "$url/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{ "gmail": "joao@if.edu.br", "senha": "SenhaForte123" }' | jq -r .token)
echo "$TOKEN"
```

#### POST /api/auth/forgot-password
- Finalidade: iniciar fluxo de recuperação de senha (envio de token por e-mail)
- Acesso: público
- Body: `{ "gmail": "usuario@if.edu.br" }`
- Resposta: `200 OK`

Exemplo (cURL):
```bash
curl -X POST "$url/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{ "gmail": "joao@if.edu.br" }'
```

#### POST /api/auth/reset-password
- Finalidade: redefinir senha usando token
- Acesso: público
- Body: `{ "token": "uuid", "novaSenha": "SenhaForte123" }`
- Resposta: `200 OK`

Exemplo (cURL):
```bash
curl -X POST "$url/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{ "token": "coloque_o_token_de_reset_aqui", "novaSenha": "SenhaForte123" }'
```

### Usuários

#### GET /api/users/me
- Finalidade: obter dados completos do usuário autenticado
- Acesso: protegido (JWT)
- Resposta (200 OK): objeto JSON com dados do usuário
```json
{
  "id": 1,
  "gmail": "usuario@if.edu.br",
  "nome": "Nome Sobrenome",
  "matricula": "202500123",
  "curso": "Engenharia",
  "telefone": "+55 11 99999-0000",
  "ativo": true,
  "roles": ["ACADEMICO"],
  "criadoEm": "2025-01-01T10:00:00Z",
  "atualizadoEm": "2025-01-01T10:00:00Z"
}
```

Exemplo (cURL):
```bash
curl "$url/api/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

#### GET /api/users
- Finalidade: listar usuários
- Acesso: protegido (ROLE_ADMIN)

Exemplo (cURL):
```bash
curl "$url/api/users" \
  -H "Authorization: Bearer $TOKEN"
```

#### POST /api/users
- Finalidade: criar usuário
- Acesso: protegido (ROLE_ADMIN)

Exemplo (cURL):
```bash
curl -X POST "$url/api/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gmail": "novo@if.edu.br",
    "nome": "Novo Usuário",
    "senhaHash": "SenhaProvisoria123",
    "roles": ["ACADEMICO"]
  }'
```

#### PUT /api/users/{id}
- Finalidade: editar usuário completo
- Acesso: protegido (ROLE_ADMIN)
- Body (JSON):
```json
{
  "nome": "Usuário Atualizado",
  "matricula": "202500999",
  "curso": "Engenharia Elétrica",
  "telefone": "+55 11 88888-0000",
  "ativo": true,
  "roles": ["PROFESSOR", "ADMIN"]
}
```
- **Nota:** Para alterar a senha, inclua o campo `senhaHash` com a nova senha (será criptografada automaticamente)

Exemplo (cURL):
```bash
USER_ID=1
curl -X PUT "$url/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Usuário Atualizado",
    "curso": "Engenharia Elétrica",
    "telefone": "+55 11 88888-0000",
    "ativo": true,
    "roles": ["PROFESSOR", "ADMIN"]
  }'
```

#### DELETE /api/users/{id}
- Finalidade: deletar usuário
- Acesso: protegido (ROLE_ADMIN)

Exemplo (cURL):
```bash
USER_ID=1
curl -X DELETE "$url/api/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" -i
```

#### PUT /api/users/{id}/roles
- Finalidade: atualizar APENAS as roles do usuário (sem modificar outros dados)
- Acesso: protegido (ROLE_ADMIN)
- Body (JSON):
```json
{
  "roles": ["ADMIN", "PROFESSOR", "ACADEMICO"]
}
```
- **Roles disponíveis:** `ADMIN`, `PROFESSOR`, `ACADEMICO`
- **Nota:** Este endpoint atualiza apenas as permissões. Para editar outros dados, use `PUT /api/users/{id}`

Exemplo (cURL):
```bash
USER_ID=1
curl -X PUT "$url/api/users/$USER_ID/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "roles": ["ADMIN", "PROFESSOR"] }'
```

### Notificações

#### POST /api/notifications/device-token
- Finalidade: registrar token de push do dispositivo
- Acesso: protegido (JWT)
- Body: `{ "deviceToken": "..." }`

Exemplo (cURL):
```bash
curl -X POST "$url/api/notifications/device-token" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "deviceToken": "expo_or_fcm_token_aqui" }'
```

### Componentes

#### POST /api/components
- Finalidade: criar novo componente
- Acesso: protegido (PROFESSOR ou ADMIN)
- Body (JSON): dados completos do componente
- Resposta (200 OK): componente criado

Exemplo (cURL):
```bash
curl -X POST "$url/api/components" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partNumber": "LAB-RES-10K-0603",
    "name": "Resistor 10kΩ 0603",
    "description": "Resistor de precisão 10kΩ SMD 0603",
    "category": "Resistores",
    "subcategory": "SMD/0603",
    "manufacturer": "Yageo",
    "series": "RC0603",
    "packageType": "0603",
    "technicalParams": {
      "resistance": 10000,
      "tolerance": 5,
      "power": 0.1,
      "tcr": 100,
      "technology": "Filme Espesso"
    },
    "currentStock": 100,
    "minimumStock": 20,
    "economicOrderQuantity": 500,
    "storageLocation": "A1-B2-C3",
    "standardCost": 0.05,
    "currency": "BRL",
    "rohs": true,
    "reach": true,
    "msl": "1",
    "esdLevel": "Classe 1",
    "tempMin": -55,
    "tempMax": 155,
    "datasheet": "https://www.yageo.com/documents/recent/PYu-RC_Group_51_RoHS_L_11.pdf",
    "status": "active"
  }'
```

#### GET /api/components
- Finalidade: listar todos os componentes
- Acesso: protegido (JWT)
- Resposta (200 OK): array de componentes

Exemplo (cURL):
```bash
curl "$url/api/components" \
  -H "Authorization: Bearer $TOKEN"
```

#### GET /api/components/{id}
- Finalidade: buscar componente por ID
- Acesso: protegido (JWT)
- Resposta (200 OK): dados do componente

Exemplo (cURL):
```bash
curl "$url/api/components/1" \
  -H "Authorization: Bearer $TOKEN"
```

#### GET /api/components/search?q=...
- Finalidade: buscar componentes por texto (nome, part number, fabricante)
- Acesso: protegido (JWT)
- Resposta (200 OK): array de componentes encontrados

Exemplo (cURL):
```bash
curl "$url/api/components/search?q=resistor" \
  -H "Authorization: Bearer $TOKEN"
```

#### GET /api/components/by-barcode?code=...
- Finalidade: buscar componente por código/QR (stub)
- Acesso: protegido (JWT)
- Resposta: `204 No Content` se não encontrado (por enquanto)

Exemplo (cURL):
```bash
curl "$url/api/components/by-barcode?code=LAB-RES-220R-001" \
  -H "Authorization: Bearer $TOKEN" -i
```

### Observações Gerais
- JWT: expiração em `security.jwt.expiration-ms` (padrão 24h) e segredo `security.jwt.secret`.
- Perfis de acesso: `ADMIN`, `PROFESSOR`, `ACADEMICO`.
- Erros de validação e regra de negócio seguem `GlobalExceptionHandler` (HTTP 400).


