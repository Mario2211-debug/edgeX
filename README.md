**Criação de uma rede EDGE sobre a plataforma EdgeX**

Este projeto tem como finalidade configurar um dispositivo MQTT no EdgeX Foundry para enviar dados simulados de um sensor usando um publisher em Node.js. O projeto utiliza o serviço `device-mqtt` para processar mensagens MQTT e gerar eventos que podem ser consultados via API. O dispositivo simulado, chamado `MQTT-test-device`, envia valores aleatórios para o recurso `randfloat64`, definido no perfil `Test-Device-MQTT-Profile`.

## Tarefas
Configurar o EdgeX Foundry com um dispositivo MQTT que envia valores aleatórios via MQTT.

## Pré-requisitos
- **Docker** e **Docker Compose** instalados.
- **Node.js** (versão 14 ou superior) para executar o publisher e o subscriber.
- **EMQ** ou outro broker MQTT rodando em `localhost:1883`.
- **Mosquitto-client** Para testar os tópicos posteriormente
- **VSCode** ou um editor de texto que preferir.

## Estrutura do Projeto
A estrutura recomendada do projeto é:

    ├── README.md
    ├── docker-compose.yml
    ├── mqtt
    │   └── configuration.yaml 
    └── mqtt-scripts
        ├── mock-device.js
        └── subscriber.js

- `mqtt/`: Contém o arquivo de configuração do serviço device-mqtt **configuration.yaml**.
- `mqtt-scripts/`: Contém o código do publisher e do Subscriber Node.js.
- `docker-compose.yml`: Configura os serviços do EdgeX Foundry.

    2 directories, 6 files

### 2. Publisher (`mock-device.js`)
Este código:
- Conecta ao broker MQTT em `localhost:1883`.
- Publica um valor aleatório (como string) a cada 2 segundos no tópico `incoming/data/MQTT-test-device/randfloat64`.
## Nota importante:
 - O resourceName deve obedecer um dos tipos suportados pelo device-mqtt (randfloat64, script, randfloat32), no nosso caso: randfloat64.

### 3 Subscriber (`subscriber.js`)
Este código:
- Conecta ao broker MQTT em `localhost:1883`.
- Publica um valor aleatório (como string) a cada 2 segundos no tópico `incoming/data/MQTT-test-device/randfloat64`.

## Passos de Configuração

### 1. Configuração do Ambiente
#### 1.1. Com o Docker e o docker-compose ja instalados, vamos executar o EdgeX Foundry

1. consulte o `docker-compose.yml` nos arquivos. Deve incluir os serviços `core-data`, `core-metadata`, `core-command`, `core-keeper`, `emq`  e `device-mqtt`.

2. Inicie o EdgeX:
   ```bash
   docker-compose up -d
   ```
3. Certifica-te de que todos os serviços estejam em excução.
   ```bash
   docker-compose ps
   ```

#### 1.2. Configurar o Broker MQTT
O projeto usa um broker EMQ. O `docker-compose.yml` acima inclui o Mosquitto por padrão, mas ee foi alterado para usar o EMQ, mas se você preferir pode usar o Mosquitto.

### 2. Carregar a configuração do device-mqtt
O ficheiro `configuration.yaml` é montado via volume (`./mqtt/configuration.yaml:/res/configuration.yaml`). O serviço `device-mqtt` carrega automaticamente os perfis e os devices por padrão.

### 4. Configurar o Publisher e o Subscriber
1. Instalar o NodeJS e o mosquitto-client

   ```bash
    sudo apt update
    sudo apt install nodejs
    sudo apt install mosquitto-client
    node -v
   ```
2. Instalar as dependências do NodeJS

   ```bash
   cd mqtt-scripts
   npm install mqtt
   ```
### Nota importante, pode ser necessário instalar também o npm(Node Package Manager)!

3. Execute o publisher, e o subscriber em outro terminal:
   ```bash
   node mock-device.js e num outro terminal node subscriber.js.
   ```

### 5. Testar e Verificar
1. Verifique as mensagens do tópico:
   ```bash
   mosquitto_sub -h localhost -t incoming/data/#
   ```

2. Consulte os eventos gerados:
   ```bash
   curl http://localhost:59880/api/v3/event/device/MQTT-test-device
   ```
   Deve conter eventos com `resourceName: randfloat64` e `valueType: Float64`.

3. Monitorar os logs do `device-mqtt` e os outros serviços:
   ```bash
   docker logs edgex-device-mqtt
   ```

## Solução de Problemas

- **Erro: "source name `randfloat64` not found as Device Command or Device Resource"**:
  - **Causa**: Mismatch no nome do dispositivo (ex.: `MQTT-Test-Device` vs. `MQTT-test-device`).
  - **Solução**: Verifique o nome do dispositivo com:
    ```bash
    curl -X GET http://localhost:59881/api/v3/device/name/MQTT-test-device
    ```
    - Atualize o publisher para usar o nome correto ou recrie o dispositivo com o nome desejado.

    - Reinicie o serviço:
    ```bash
    docker restart edgex-device-mqtt
    ```
- **Erro: Dados MQTT não processados**:
  - **Causa**: Tópico incorreto.
  - **Solução**: Verifique o `configuration.yaml` do `device-mqtt`:
    ```bash
    docker exec -it edgex-device-mqtt cat /etc/device-mqtt/configuration.toml
    ```
    Certifique-se de que `Incoming.Topic = "incoming/data/#"`.

## Conclusão
Este tutorial configurou um dispositivo MQTT no EdgeX Foundry que envia valores aleatórios para o recurso `randfloat64`. Os eventos gerados podem ser consultados via API, e o setup é escalável para outros recursos ou dispositivos. Para mais detalhes, consulte a [documentação do EdgeX Foundry](https://docs.edgexfoundry.org/).
```