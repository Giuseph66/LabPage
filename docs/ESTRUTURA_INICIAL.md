# Estrutura Inicial do Projeto - HardLab

## 📁 Estrutura de Diretórios

```
hardlab/
├── README.md                    # Documentação principal
├── docs/                        # Documentação do projeto
│   ├── CRONOGRAMA_ORGANIZACIONAL.md
│   ├── SEMANA1_REQUISITOS.md
│   ├── ESTRUTURA_INICIAL.md
│   └── api/
│       └── openapi.yml         # Especificação da API
├── backend/                     # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hardlab/
│   │   │   │   ├── config/     # Configurações
│   │   │   │   ├── controller/ # Controllers REST
│   │   │   │   ├── dto/        # Data Transfer Objects
│   │   │   │   ├── entity/     # Entidades JPA
│   │   │   │   ├── repository/ # Repositories
│   │   │   │   ├── service/    # Lógica de negócio
│   │   │   │   └── security/   # Configurações de segurança
│   │   │   └── resources/
│   │   │       ├── db/migration/ # Flyway migrations
│   │   │       └── application.yml
│   │   └── test/               # Testes
│   ├── pom.xml                 # Dependências Maven
│   └── Dockerfile
├── frontend/                    # React Native App
│   ├── app/                    # Expo Router pages
│   ├── components/             # Componentes reutilizáveis
│   ├── hooks/                 # Custom hooks
│   ├── services/              # API services
│   ├── stores/                # Estado global
│   ├── types/                 # TypeScript types
│   ├── package.json
│   └── app.config.js
├── docker-compose.yml          # Infraestrutura local
├── scripts/                    # Scripts de automação
└── .gitignore
```

## 🚀 Primeiros Passos

### 1. Setup do Repositório

```bash
# Criar estrutura de diretórios
mkdir -p hardlab/{backend,frontend,docs,scripts}
cd hardlab

# Inicializar git
git init
git add .
git commit -m "Initial commit: Project structure"
```

### 2. Backend - Spring Boot

```bash
cd backend

# Criar projeto Spring Boot
spring init \
  --build=maven \
  --java-version=17 \
  --dependencies=web,data-jpa,validation,security,mail,actuator \
  --groupId=com.hardlab \
  --artifactId=hardlab-api \
  --name=HardLab API \
  --description="API para gestão de laboratório de tecnologia" \
  --package-name=com.hardlab \
  .

# Adicionar dependências extras no pom.xml
```

### 3. Frontend - Expo

```bash
cd ../frontend

# Criar projeto Expo
npx create-expo-app@latest . --template blank-typescript

# Instalar dependências
npm install @tanstack/react-query @tanstack/react-query-persist-client
npm install expo-router expo-linking expo-constants expo-status-bar
npm install react-native-paper react-native-safe-area-context
npm install expo-camera expo-barcode-scanner expo-notifications
npm install react-native-document-picker expo-file-system
npm install expo-sqlite @react-native-async-storage/async-storage
```

### 4. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: hardlab
      POSTGRES_USER: hardlab
      POSTGRES_PASSWORD: hardlab123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

## 📋 Checklist de Setup

### Backend Setup
- [ ] Projeto Spring Boot criado
- [ ] Dependências configuradas no `pom.xml`
- [ ] Configuração do `application.yml`
- [ ] Entidades JPA criadas
- [ ] Repositories implementados
- [ ] Controllers REST criados
- [ ] Autenticação JWT configurada
- [ ] Swagger/OpenAPI configurado
- [ ] Testes unitários implementados

### Frontend Setup
- [ ] Projeto Expo criado
- [ ] Expo Router configurado
- [ ] TanStack Query configurado
- [ ] React Native Paper configurado
- [ ] Contexto de autenticação criado
- [ ] Telas básicas implementadas
- [ ] Navegação configurada
- [ ] Integração com API

### Infraestrutura
- [ ] Docker Compose configurado
- [ ] PostgreSQL rodando
- [ ] MinIO rodando
- [ ] Migrations executadas
- [ ] Ambiente de desenvolvimento funcional

## 🔧 Configurações Iniciais

### Backend - application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hardlab
    username: hardlab
    password: hardlab123
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

  security:
    jwt:
      secret: your-secret-key-here
      expiration: 86400000 # 24h

minio:
  endpoint: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin123
  bucket: hardlab-files

server:
  port: 8080

logging:
  level:
    com.hardlab: DEBUG
```

### Frontend - app.config.js

```javascript
export default {
  expo: {
    name: 'HardLab',
    slug: 'hardlab',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.hardlab.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      },
      package: 'com.hardlab.app',
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE'
      ]
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-router',
      'expo-camera',
      'expo-barcode-scanner',
      'expo-notifications'
    ],
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:8080'
    }
  }
};
```

## 📱 Telas Iniciais

### 1. Tela de Login
```typescript
// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../stores/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HardLab</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### 2. Dashboard
```typescript
// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function DashboardScreen() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats'),
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.projetosAtivos || 0}</Text>
          <Text style={styles.statLabel}>Projetos Ativos</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.materiaisTotal || 0}</Text>
          <Text style={styles.statLabel}>Materiais</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.pedidosPendentes || 0}</Text>
          <Text style={styles.statLabel}>Pedidos Pendentes</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.quickAction}>
        <Text style={styles.quickActionText}>Novo Projeto</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction}>
        <Text style={styles.quickActionText}>Solicitar Material</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  quickAction: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## 🗄️ Migrations Iniciais

### V1__base.sql
```sql
-- Usuários
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBRO',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de materiais
CREATE TABLE tipos_materiais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materiais
CREATE TABLE materiais (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo_id BIGINT REFERENCES tipos_materiais(id),
    dono_id BIGINT REFERENCES usuarios(id),
    codigo_qr VARCHAR(100) UNIQUE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    unidade VARCHAR(20) NOT NULL DEFAULT 'un',
    localizacao VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'NOVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projetos
CREATE TABLE projetos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    area VARCHAR(50) NOT NULL,
    professor_id BIGINT REFERENCES usuarios(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membros do projeto
CREATE TABLE projeto_membros (
    id BIGSERIAL PRIMARY KEY,
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES usuarios(id),
    papel_no_projeto VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(projeto_id, usuario_id)
);

-- Materiais usados no projeto
CREATE TABLE projeto_materiais (
    id BIGSERIAL PRIMARY KEY,
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    material_id BIGINT REFERENCES materiais(id),
    quantidade_prevista INTEGER NOT NULL DEFAULT 0,
    quantidade_utilizada INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE pedidos (
    id BIGSERIAL PRIMARY KEY,
    solicitante_id BIGINT REFERENCES usuarios(id),
    status VARCHAR(20) NOT NULL DEFAULT 'SOLICITADO',
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens do pedido
CREATE TABLE pedido_itens (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT REFERENCES pedidos(id) ON DELETE CASCADE,
    material_id BIGINT REFERENCES materiais(id),
    quantidade INTEGER NOT NULL,
    situacao_item VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anexos
CREATE TABLE anexos (
    id BIGSERIAL PRIMARY KEY,
    projeto_id BIGINT REFERENCES projetos(id) ON DELETE CASCADE,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    hash VARCHAR(64),
    url VARCHAR(500),
    tamanho BIGINT,
    metadados JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoria
CREATE TABLE auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id),
    acao VARCHAR(50) NOT NULL,
    recurso VARCHAR(50) NOT NULL,
    recurso_id BIGINT,
    dados_anteriores JSONB,
    dados_novos JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_materiais_tipo ON materiais(tipo_id);
CREATE INDEX idx_materiais_dono ON materiais(dono_id);
CREATE INDEX idx_projetos_professor ON projetos(professor_id);
CREATE INDEX idx_projeto_membros_projeto ON projeto_membros(projeto_id);
CREATE INDEX idx_pedidos_solicitante ON pedidos(solicitante_id);
CREATE INDEX idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX idx_anexos_projeto ON anexos(projeto_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_timestamp ON auditoria(timestamp);

-- Dados iniciais
INSERT INTO usuarios (nome, email, senha, role) VALUES 
('Admin', 'admin@hardlab.com', '$2a$10$encrypted_password', 'ADMIN'),
('Professor Teste', 'professor@hardlab.com', '$2a$10$encrypted_password', 'PROFESSOR');

INSERT INTO tipos_materiais (nome, descricao) VALUES 
('Resistor', 'Componentes resistivos'),
('Capacitor', 'Componentes capacitivos'),
('Microcontrolador', 'MCUs e processadores'),
('Sensor', 'Sensores diversos'),
('Ferramenta', 'Ferramentas manuais'),
('Impressora 3D', 'Equipamentos de impressão 3D');
```

## 🚀 Comandos de Execução

### Desenvolvimento Local
```bash
# 1. Iniciar infraestrutura
docker-compose up -d

# 2. Executar backend
cd backend
./mvnw spring-boot:run

# 3. Executar frontend
cd frontend
npx expo start

# 4. Acessar documentação
# http://localhost:8080/swagger-ui.html
```

### Produção
```bash
# Build das imagens
docker build -t hardlab-backend ./backend
docker build -t hardlab-frontend ./frontend

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

**HardLab** - Estrutura inicial configurada e pronta para desenvolvimento! 🚀 