### **Guia Definitivo: Protegendo sua API com Kong e Keycloak**

**Objetivo:** Configurar um fluxo de autenticação onde apenas requisições com um token JWT válido, emitido pelo Keycloak, possam acessar o `orders-service` através do Kong.

**Pré-requisitos:**
1. Todo o ambiente Docker está rodando (`docker-compose up -d`).
2. O `orders-service` está rodando localmente na sua máquina (`npm run start:dev orders`).

#### **O Fluxo de Autenticação (Visão Geral)**
1. Um cliente (ex: Postman, ou seu frontend no futuro) pede um token ao **Keycloak**, enviando as credenciais do usuário.
2. O Keycloak valida as credenciais e retorna um **Token JWT**.
3. O cliente faz uma requisição para a API (ex: criar um pedido) enviando esse token para o **Kong**.
4. O Kong usa seu plugin `jwt` para verificar se a assinatura do token é válida, usando a chave pública do Keycloak que cadastramos.
5. Se o token for válido, o Kong encaminha a requisição para o `orders-service`. Caso contrário, ele retorna um erro `401 Unauthorized`.
---

### **Parte 1: Configuração no Keycloak (O Provedor de Identidade)**
Nesta parte, vamos configurar o ambiente no Keycloak para gerenciar nossos usuários e emitir os tokens.
**1.1. Acesse a Console de Administração**
- Abra em seu navegador: `http://localhost:8080`
- Faça login com `admin` / `admin`.

**1.2. Crie o "Realm"**
- No canto superior esquerdo, clique em "master" e depois em **"Create Realm"**.
- **Realm name:** `ecommerce-realm`
- Clique em **Create**.

**1.3. Crie o "Client"**
- No menu esquerdo (certifique-se de que `ecommerce-realm` está selecionado), clique em **"Clients"** e depois em **"Create client"**.
- **Client ID:** `ecommerce-api`
- **Name:** `E-commerce API`
- Clique em **Next**.
- Na tela seguinte, ative a opção **"Client authentication"**.
- Clique em **Save**.

**1.4. Obtenha o "Client Secret"**
- Após salvar, uma nova aba **"Credentials"** aparecerá.
- Clique nela e copie o valor do **Client secret**. Guarde-o em um local seguro, pois precisaremos dele mais tarde.

**1.5. Crie um Usuário de Teste**
- No menu esquerdo, clique em **"Users"** e depois em **"Create new user"**.
- **Username:** `testuser`
- Clique em **Create**.

**1.6. Defina uma Senha Permanente para o Usuário**
- Na página do `testuser`, vá para a aba **"Credentials"**.
- Clique em **"Set password"**.
- Defina uma senha (ex: `password`).
- **Importante:** Desative a chave **"Temporary"** para que a senha seja permanente.
- Clique em **Save**.
---

### **Parte 2: Configuração no Kong (O Guardião da API)**
Agora, vamos configurar o Kong via sua API Admin (`curl`) para proteger nossa rota.
**2.1. Limpeza (Opcional, mas recomendado para um início limpo)**
```
# Deleta a rota, se existir
curl -i -X DELETE http://localhost:8001/services/orders-service/routes/orders-route

# Deleta o serviço, se existir
curl -i -X DELETE http://localhost:8001/services/orders-service

# Deleta o consumidor, se existir
curl -i -X DELETE http://localhost:8001/consumers/testuser
```

**2.2. Encontre seu IP Local**
- **Windows:** `cmd` -> `ipconfig` -> Endereço IPv4.
- **Mac/Linux:** `terminal` -> `ifconfig` ou `ip a` -> `inet`.

**2.3. Crie o "Service" e a "Route" no Kong**
- **Substitua `<SEU_IP_LOCAL>`** pelo IP que você encontrou.

```
# 1. Cria o Serviço apontando para o seu IP local
curl -i -X POST http://localhost:8001/services/ \
  --data name=orders-service \
  --data host=<SEU_IP_LOCAL> \
  --data port=3001

# 2. Cria a Rota para o serviço
curl -i -X POST http://localhost:8001/services/orders-service/routes \
  --data name=orders-route \
  --data 'paths[]=/orders' \
  --data strip_path=false
```

**2.4. Crie o "Consumer"**
```
curl -i -X POST http://localhost:8001/consumers/ --data username=testuser
```

**2.5. Registre a Chave Pública do Keycloak no Kong**
- **Primeiro, obtenha a chave:**
    - No Keycloak, vá em **"Realm settings"** -> **"Keys"**.
    - Na linha da chave `RS256`, clique em **"Public key"**.
    - Copie **apenas a string da chave**, sem as linhas `BEGIN` e `END`.
- **Segundo, crie um arquivo:**
    - Na raiz do seu projeto, crie um arquivo `public_key.pem`.
    - Cole o conteúdo no seguinte formato:
```
        -----BEGIN PUBLIC KEY-----
        SUA_CHAVE_PUBLICA_COPIADA_AQUI
        -----END PUBLIC KEY-----
 ```

- **Terceiro, registre a chave no Kong:**
    ```
    curl -i -X POST http://localhost:8001/consumers/testuser/jwt \
      --data "algorithm=RS256" \
      --data-urlencode "rsa_public_key@public_key.pem"
    ```
    
**2.6. Associe a Credencial ao "Issuer" do Token (Correção Final)**

- **Primeiro, obtenha o ID da credencial JWT:**
    ```
    curl http://localhost:8001/consumers/testuser/jwt
    ```
    Copie o valor do campo `"id"` da resposta.
    
- **Segundo, atualize a credencial.** Substitua `<ID_DA_CREDENCIAL_JWT>` pelo ID que você copiou.
    ```
    curl -i -X PATCH http://localhost:8001/consumers/testuser/jwt/<ID_DA_CREDENCIAL_JWT> \
      --data "key=http://localhost:8080/realms/ecommerce-realm"
    ```

**2.7. Ative o Plugin `jwt` na Rota**
```
curl -i -X POST http://localhost:8001/routes/orders-route/plugins --data name=jwt
```

---

### **Parte 3: Testando o Fluxo Completo**

**3.1. Obtenha o Token de Acesso do Keycloak**

- **Substitua `<SEU_CLIENT_SECRET>`** pelo segredo que você guardou.
    ```
    curl -X POST "http://localhost:8080/realms/ecommerce-realm/protocol/openid-connect/token" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "grant_type=password" \
      -d "client_id=ecommerce-api" \
      -d "client_secret=<SEU_CLIENT_SECRET>" \
      -d "username=testuser" \
      -d "password=password"
    ```
    
- Copie o valor do `access_token` da resposta.
    

**3.2. Faça a Requisição Autenticada**

- **Substitua `<SEU_TOKEN_DE_ACESSO>`** pelo token que você copiou.
    ```
    curl -i -X POST http://localhost:8000/orders \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <SEU_TOKEN_DE_ACESSO>" \
      --data '{"userId": "12345", "total": 99.99}'
    ```
- **Resultado esperado:** Você deve receber a resposta **`HTTP/1.1 201 Created`**, e o evento será publicado no RabbitMQ como antes.