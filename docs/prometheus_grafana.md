###  Configurando o Grafana e Criando seu Primeiro Dashboard

**Descrição:** Vamos conectar o Grafana à nossa fonte de dados (Prometheus) e depois construir dois painéis: um para mostrar o número total de pedidos e outro para mostrar a taxa de pedidos por minuto.

**Raciocínio:** O Grafana precisa saber de onde puxar os dados. Nossa primeira ação é configurá-lo para usar o Prometheus como fonte de dados. Uma vez conectado, podemos usar a linguagem de consulta do Prometheus (PromQL) para criar visualizações poderosas.

-----

#### Passo a Passo:

**1. Acesse o Grafana**

  * Abra no seu navegador: `http://localhost:3000`
  * Faça login com o usuário `admin` e a senha `admin`. Você pode pular a etapa de alteração de senha por enquanto.

**2. Adicione o Prometheus como Fonte de Dados (Data Source)**

  * No menu lateral esquerdo, clique no ícone de engrenagem (**Administration**).

  * Clique em **"Data sources"**.

  * Clique no botão azul **"Add new data source"**.

  * Selecione **"Prometheus"** da lista.

  * **Configuração:**

      * **Name:** `Prometheus` (pode deixar o padrão).
      * **Prometheus server URL:** `http://prometheus:9090`
          * **Importante:** Usamos `prometheus` como host (o nome do container no `docker-compose.yml`) porque o Grafana está rodando dentro da mesma rede Docker e se comunicará diretamente com o container do Prometheus. Não use `localhost` aqui.

  * Role para baixo e clique em **"Save & test"**. Você deve ver uma mensagem verde de sucesso: "Data source is working".

**3. Crie um Novo Dashboard**

  * No menu lateral esquerdo, clique no ícone de quatro quadrados (**Dashboards**).
  * Clique no botão **"New"** no canto superior direito e selecione **"New Dashboard"**.

**4. Crie o Primeiro Painel: "Total de Pedidos"**

  * Você verá uma tela para criar seu primeiro painel. Clique em **"Add visualization"**.
  * Na parte de baixo, certifique-se de que a fonte de dados (**Data source**) selecionada seja **"Prometheus"**.
  * No campo de consulta (**Metrics browser**), digite exatamente o nome da nossa métrica:
    ```promql
    orders_created_total
    ```
  * No canto superior direito, mude o tipo de visualização para **"Stat"**. Isso é ideal para mostrar um número único e grande.
  * Ainda no painel da direita (**Panel options**):
      * **Title:** `Total de Pedidos Criados`
  * Clique em **"Apply"** no canto superior direito para salvar o painel e voltar para o dashboard.

**5. Crie o Segundo Painel: "Taxa de Pedidos por Minuto"**

  * No dashboard, clique no ícone de "Adicionar" (**Add**) no canto superior direito e selecione **"Visualization"**.

  * Novamente, selecione **"Prometheus"** como fonte de dados.

  * Desta vez, usaremos uma função do PromQL chamada `rate()` para ver a frequência com que os pedidos estão sendo criados. Digite a seguinte consulta:

    ```promql
    rate(orders_created_total[5m])
    ```

      * **O que isso faz?** `rate()` calcula a taxa de crescimento por segundo de um contador, e `[5m]` diz para ele calcular essa média ao longo de uma janela de 5 minutos. Isso nos dá uma visão da "velocidade" com que os pedidos chegam.

  * Mantenha o tipo de visualização como **"Time series"**, que é o padrão e ideal para gráficos ao longo do tempo.

  * No painel da direita (**Panel options**):

      * **Title:** `Taxa de Criação de Pedidos (a cada 5 min)`

  * Clique em **"Apply"**.

**6. Salve o Dashboard**

  * No canto superior direito da página do dashboard, clique no ícone de disquete (**Save dashboard**).
  * Dê um nome ao seu dashboard, por exemplo, `Dashboard de Pedidos`.
  * Clique em **"Save"**.

### Testando o Resultado

Agora vem a parte divertida\!

1.  Abra seu cliente de API (Postman, VS Code com REST Client, etc.) e use o arquivo `http/api.http` para criar alguns pedidos novos. Lembre-se de obter um novo token JWT do Keycloak primeiro, se o antigo tiver expirado.
2.  Volte para o seu dashboard no Grafana. Você verá o painel **"Total de Pedidos Criados"** aumentar a cada novo pedido e o gráfico de **"Taxa de Criação de Pedidos"** mostrar picos de atividade.

Você acaba de implementar o primeiro pilar da observabilidade\! O próximo passo seria replicar essa instrumentação para os outros microsserviços, adicionando métricas relevantes para cada um deles (ex: pagamentos processados, itens removidos do estoque, etc.).