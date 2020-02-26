# Certified Kubernetes Application Developer (CKAD)

## Dicas para o Exame

### Produtividade no Exame:

* Defina um alias para o kubectl: alias k=kubectl
* Configure o contexto e o namespace antes de executar os comandos para ter certeza que vai executar no lugar certo:

```
kubectl config set-context <contexto-da-questao> --namespace=<namespace-da-questao>
```

* Utilize o nome dos recursos curtos:
    * ns = namespaces
    * pvc= persistentVolumeClaim
    * pv = persistentVolume
    * po = pods
    * svc = service

**Deleção de Objetos:** não espere eles se excluírem de forma normal. Utilize a forma forçada:
```
kubectl delete pod nginx --grace-period=0 --force
```
Pode ser que no cluster que você esteja executando tenha objetos criados, use-os a seu favor, mas primeiro ache-os, grep é o seu amigo:
```
kubectl describe pods | grep -C 10 "author=John Doe"
```

No momento da prova só pode abrir o Kubernetes docs, Pode utilizar o comando  `--help`

Pode usar o comando explain, ex: 
```
kubectl explain pods.spec
```

### Três Ferramentas importantes(Trinity of Tooling):

* YAML
* Vim - Mas disse que pode mudar
* Comandos Bash

## Módulo 1: Básico

### Kubernetes Object Struture

Tipo | Valores
------ | ------
APIVersion | v1, apps/v1....
Kind | Pod, Deployment, Quota...
Metadata | Name, namespaces, Labels...
Spec | Estado desejado
Status| estado atual

exemplo:

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels: 
    run: nginx
  name: nginx
spec:
  containers:
   - image: nginx
     name: nginx
     resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Never
status: {}
```

### Criando objetos na linha de comando

Gerenciamento imperativo de objetos

* Rápido mas requer conhecimento detalhado, não há registro de rastreamento:

create: criação de recursos, fornece o tipoe do objeto que deseja criar e o seu nome no final:
```
kubectl create namespace ckad
```
algo semelhante ao run:
```
kubectl run nginx --image=nginx --restart=Never -n ckad
```
podemos editar o comando:
```
kubectl edit pod/nginx -n ckad
```

Gerenciamento declarativo de objetos

* Mais elaborado para mudanças, rastreia as mudanças.
* Cria o arquivo .yaml, escreve o recurso lá e após isso o executa.

```
vim nginx-pod.yaml
kubectl create -f nginx-pod.yaml
kuectl delete pod/nginx
```

Abordagem Híbrida.

* Gerar o arquivo .yaml com o comando kubectl e consegue editar depois.
* Utiliza o comando **--dry-run** para não criar o objeto.
* Utiliza o comando **-o yaml > nomearq.yaml** para criar o yaml.
```
kubectl run nginx --image=nginx --restart=Never --dry-run -o yaml > nginx-pod.yaml
```

### Entendendo Pods


Provávelmente o objeto mais importante.

![One of Many in Pods](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/pods-1.png)


Fluxo de criação de um pod:

![Pod Creation Control](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/pod-flow.png)

Ciclo de vida de um pod:

![Pod Lifecycle](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/pod-lifecycle.png)

### Inspecionando Pods

inspecionando Status de um Pod:

```
kubectl describe pods nginx | grep Status:
...
Status:   Running
```

ou pode usar o comando para ver o atual status no ciclo de vida:
```
kubectl get pods nginx -o yaml
...
status:
  conditions:
  ...
  containerStatuses:
    ...
    state:
      running:
        startedAt: 2019-05-24T16:56:55Z
  phase: Running
```

**Injetando variáveis de ambiente**

* Pode injetar via runtime

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: spring-boot-app
spec:
  containers:
   - image: <imagem>
     name: spring-boot-app
     env:
      - name: SPRING_PROFILES_ACTIVE
        value: production
```

**Executar Comandos**

* Executar um comando dentro de um container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
   - image: nginx
     name: nginx
     args:
      - /bin/sh
      - -c
      - echo hello world
```

**Outros comandos Úteis**

* olha os logs do Pod, `-f` para ficar escutando os logs.
```
kubectl logs [-f] <PodName> 
```

* podemos conectar no pod e executar comandos:
```
kubectl exec <PodName> -it -- /bin/sh
```

* Pode consultar um pod e conseguir mais informações:
```
kubectl get po <PodName> -o wide
```

* Quando criar um pod, pode adicionar o `--rm` para deletar o pod quando estiver terminado

## Módulo 2: Configuração

### Configuração centralizada

Pode utilizar configMaps e Secrets. Diferença entre os dois é que o o Secret encoda(não criptografa) os dados em base64.

![Pod Config](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/pod-config.png)

### ConfigMaps

* Rápido, Fácil e flexível, pode apontar para fontes diferentes.

Imperativo
```
# Literal values
kubectl create configmap db-config --from-literal=db=staging
# single file with env vars
kubectl create configmap db-config --from-env-file=config.env
# file or directory
kubectl create configmap db-config --from-file=config.txt
```

Declarativo
```yaml
apiVersion: v1
data:
  db: staging
  username: jdoe
kind: ConfigMap
metadata:
  name: db-config
```

![Mount Config-Map](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/mount-cm.png)

Montando ConfigMap como env. var. de um Pod.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend
spec:
  containers:
   - image: nginx
     name: backend
     envFrom:
      - configMapRef:
          name: db-config

```
ou declarando chaves explícitas, caso os nomes forem diferentes:
```yaml
spec:
  containers:
   - image: nginx
     name: backend
     env:
      - name: CONFIG_DB
     valueFrom:
       configMapKeyRef:
          name: db-config
          key: dbConfig
```

Montando ConfigMap como Volume em um Pod.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend
spec:
  containers:
   - image: nginx
     name: backend
     volumeMounts:
      - name: config-volume
        mountPath: /etc/config
  volumes:
   - name: config-volume
     configMap:
       name: db-config
```

**OBS:** Se você montar um ConfigMap como key/value, a key se torna um arquivo e o value seu conteúdo.

### Secrets

* Utilização similar ao ConfigMaps
* Com adição do tipo de secret, nesse caso é `generic`

Imperativo
```
#Literal Values
kubectl create secret generic db-creds --from-literal=pwd=secret
kubectl create secret generic db-creds --from-env-file=creds.env
# file or directory
kubectl create secret generic db-creds --from-file=creds.txt
```

Declarativa:

* Valores devem ser encodados manualmente(base64): `echo -n 'value' | base64`
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  pwd: <valueInBase64>
```

Montando o Secret como  Env:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend
spec:
  containers:
   - image: nginx
     name: backend
     envFrom:
      - secretRef:
          name: mysecret

```
ou declarando chaves explícitas, caso os nomes forem diferentes:
```yaml
spec:
  containers:
   - image: nginx
     name: backend
     env:
      - name: SECRET
     valueFrom:
       secretKeyRef:
          name: mysecret
          key: secretKey
```

Montando o Secret como Volume:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend
spec:
  containers:
   - image: nginx
     name: backend
     volumeMounts:
      - name: secret-volume
        mountPath: /etc/secret
  volumes:
   - name: secret-volume
     secret:
       secretName: mysecret
```

### Security Contexts

![Security Contexts](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/security-context.png)

Definindo um Security Context

Pod Level vs Container Level:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secured-pod
spec:
  securityContext:  #Pod Level - embaixo do spec, se aplica a todos os containers
    runAsUser: 1000
  containers:
   - securityContext: #Container Level - define de cada container
     runAsGroup: 3000
```

### Definindo limite de recursos

* Define número de Pods, até por namespace.
* Define limite de CPU e Memória, até por namespace.

![Resource Limits](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/resource-limits.png)

Criando um **Resource Quota**

Definição no nível do Namespace

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: app
spec:
  hard:
    pods: "2"
    requests.cpu: "2"
    requests.memory: "500m"
```

Definição no nível do Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
   - image: nginx
     name: mypod
     resources:    #aqui é onde se define os limites
       requests:
         cpu: "0.5"
         memory: "200m"
```

### Service Accounts

* Provém identidade para processos rodando em um Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  serviceAccountName: myserviceaccount # o service account
```

## Modulo 4: Multi-Container Pods

* ciclo de vida e recursos compartilhados.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container
spec:
  containers:
   - image: nginx
     name: container1
   - image: nginx
     name: container2
```

Para apontar para um container dentro do Pod, mostre qual container(--container ou -c), ex:

```
kubectl logs multi-container --container=container1
```

### Multi-Container Patterns

*Para o exame*: vai precisar saber no alto nível.(Livro Kubernetes Patterns by O'Reilly)

Patterns:
 * Init Container
 * Sidecar
   * Adapter
   * Ambassador

#### Init Container

Lógica de inicialização antes da aplicação principal iniciar.

![Init Containers](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/init-containers.png)

* eles separam responsabilidades provendo um ciclo de vida para inicialização e conclusão de tarefas diferentes da aplicação principal.
* são esperados que os init containers sejam pequenos, executem rápidos e completem com sucesso.
* devem ser feitos de forma idempotent por questões de restart do Pod.
* eles compartilham recursos, volumes e configs de segurança, então deve prestar atenção, principalmente nos recursos de memória e CPU, onde o limite vai respeitar o maior usado, seja o ini container ou a app.
* eles possuem um esquema diferente para healthcheck, não tem readiness check para os init containers.
* para questões de debug, você pode usar comando `sleep [seconds]` para verificar o init container e saber o que está falhando.

Ex:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: www
  labels:
    app: www
spec:
  initContainers:
  - name: download
    image: axeclbr/git
    command:                                             
    - git
    - clone
    - https://github.com/mdn/beginner-html-site-scripted
    - /var/lib/data
    volumeMounts:                                        
    - mountPath: /var/lib/data
      name: source
  containers:
  - name: run
    image: docker.io/centos/httpd
    ports:
    - containerPort: 80
    volumeMounts:                                        
    - mountPath: /var/www/html
      name: source
  volumes:                                               
  - emptyDir: {}
    name: source
```

#### Sidecar

Melhorar a lógica da aplicação principal.

![Sidecar Pattern](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/sidecar-pattern.png)

Pod Sidecar ex:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
  - name: app
    image: docker.io/centos/httpd    
    ports:
    - containerPort: 80
    volumeMounts:
    - mountPath: /var/www/html       
      name: git
  - name: poll
    image: axeclbr/git               
    volumeMounts:
    - mountPath: /var/lib/data       
      name: git
    env:
    - name: GIT_REPO
      value: https://github.com/mdn/beginner-html-site-scripted
    command:
    - "sh"
    - "-c"
    - "git clone $(GIT_REPO) . && watch -n 600 git pull"
    workingDir: /var/lib/data
  volumes:
  - emptyDir: {}
    name: git
```

![Sidecar Example](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/sidecar-example.png)

O container principal geralmente é o primeiro que deve ser listado.

#### Adapter Pattern

* Especialização do *Sidecar pattern*
* Padroniza e normaliza a saida da aplicação para ser lida por serviços externos.

#### Ambassador Pattern

* Especialização do *Sidecar pattern*
* Proxy para a aplicação principal do Pod.(Autentição, Autorização e etc...)

## Modulo 5: Observabilidade

Como o kubernetes sabe se o container está em pé e executando?

*Probes* podem detectar e corrigir falhas. Podemos fazer isso de 3 jeitos.

* HTTP(GET) Connection
* Command line
* TCP Connection

Existem dois tipos de *Probes*

* Readiness
* Liveness

#### Readiness Probes

Responde a pergunta: a aplicação está pronta para servir requests?

![Readiness Probe](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/readiness-probe.png)


HTTP Probes são muito úteis para aplicações web.
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
   - name: web-app
     image: eshop:4.6.3
     readinessProbe:
       httpGet:
         path: /
         port: 8080
       initialDelaySeconds: 5
       periodSeconds: 2
```

**initialDelaySeconds**: tempo que vai esperar para iniciar o *probe*. Usado por quê as aplicações demoram um tempo para iniciar, é bom começar a checar quando ela estiver pronta.

**periodSeconds**: Período que o *probe* vai esperar entre as checagens.

#### Liveness Probes

Responde a pergunta: a aplicação está funcionando sem erros?

![Liveness Probe](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/liveness-probe.png)

Exemplo de Custom command para verificar os logs.
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
   - name: web-app
     image: eshop:4.6.3
     livenessProbe:
       exec:
         command:
          - cat
          - /tmp/healthy
       initialDelaySeconds: 5
       periodSeconds: 2
```

**initialDelaySeconds**: tempo que vai esperar para iniciar o *probe*. Usado por quê as aplicações demoram um tempo para iniciar, é bom começar a checar quando ela estiver pronta, no caso do liveness é bom deixar o tempo bem maior para ter a aplicação iniciada e funcionando.

**periodSeconds**: Período que o *probe* vai esperar entre as checagens.

#### Debug Pods

Dicas para debug:

O que está executando no "alto-nível"? 

```
kubectl get all
```

Qual é exatamento o problema? Evento mostra `CrashLoopBackOff` por exemplo.

```
kubectl describe pod abc
```

A saída mostra a causa raiz? 

```
kubectl logs abc
```

## Modulo 6: Pod Design

#### Labels

* São essenciais para consultar, filtrar e organizar os objetos do k8s
* São definidas na seção de `metadata` do k8s do Object Definition

```yaml
apiVersion: v1
kind: POd
metadata:
  name: pod1
  labels:
    tier: backend
    env: prod
    app: miracle
spec:
...
```

Consultar as labels:
```
kubectl get pods --show-labels
```

#### Selecionando as labels

Podemos selecionar pelo CLI ou via `spec.selector`

Selecionando via CLI, pode selecionar via *equality-based* e via *set-based*

Exemplo: Onde o tier seja front E o env seja dev
```
kubectl get pods -l(--selector) tier=front,env=dev --show-labels
```

Exemplo: se possui a label version
```
kubectl get pods -l(--selector) version --show-labels
```

Exemplo: Onde o tier for back OU front E o env seja dev
```
kubectl get pods -l(--selector) 'tier in (front,back),env=dev' --show-labels
```

Selecionando via YAML

Equality Exemplo:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
  ...
spec:
  selector:
    tier: front
    env: dev
```

Equality e set Exemplo:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
  ...
spec:
  selector:
    matchLabels:
      version: v2.1
    matchExpressions:
     - { key: tier, operator: In, values: [front, back]}
```

Deletando label via CLI
```
kubectl label pod [nome] [label]-(sinal de menos pra remover)
```

#### Anotações

* Metadados descritivos sem a habilidade de fazer consultas.
* São definidos na seção `metadata` do k8s Object Definition.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  annotations:
    commit: 23eefj339
    autor: 'João'
    branch: 'feature/custom'
spec:
...
```

Olhar as anotações via `describe` do k8s

#### Deployments

* Adiciona recursos de *Scaling* e *Replication* a um conjunto de Pods.
* Quando se cria um *Deployment*, é criado automáticamente um *ReplicaSet* no qual cuida da replicação.

![Replica Sets](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/replica-sets.png)

**Criando Deployment**

Comando para executar(run) um deployment está *deprecated*, para criar você não pode especificar o comando `--restart=Never` se não ele cria um Pod.
```
kubectl run my-deploy --image=nginx [--replicas=3]
```

Maneira nova para se criar um Deployment
```
kubectl create deployment my-deploy --image=nginx --dry-run -o yaml > deploy.yaml

nano deploy.yaml

kubectl create -f deploy.yaml
```

Deployments em YAML
```yaml
apiVersion: v1
kind: Deployment
metadata:
  labels:
    app: my-deploy
  name: my-deploy
spec:
  replicas: 3 # numero de pods para executar
  selector:
    matchLabels:
      app: my-deploy # pods que estejam como essa label
  template: # aqui é como se fosse a definição do Pod, a estrutura é quase igual
    metadata:
      labels:
        app: my-deploy #esse é o label dos Pods que vão executar
    spec:
      containers:
       - image: nginx
         name: nginx
```

Consultar deployments
```
kubectl get deployments
```

#### Replica Set

* Automáticamente criado pelo Deployment, não foi feito para ser modificado.
  *  listar: `kubectl get replicasets`
  *  descrever: `kubectl describe deploy [name]`
  * encontrar a replica: `kubectl describe replicasets [deploy-runtime-name]`

Deployment usa *Rolling Update Strategy*, Vai em cada Pod e o atualiza, um por um.

![Rolling Updates](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/rolling-updates.png)

Desvantagens: Se possuir mudanças significativas que quebram as versões antigas, essa estratégia pode ser problemática.

Podemos chegar o *Rollout History*
```
kubectl rollout history deployments my-deploy
```

Se quiser ver o que exatamente mudou entre os rollouts.
```
kubectl rollout history deployments my-deploy --revision=2
```

Rolling Back

Esse é pra voltar pra versão anterior.
```
kubectl rollout undo deployments [deploy-name]
```

Voltar para algum versão(revision) específico.
```
kubectl rollout undo deployments [deploy-name] --to-revision=<número da revision>
```

ver o status do rollback
```
kubectl rollout status deployments [deploy-name]
```

**Escalando Deployments**

Podemos fazer de dois jeitos:

Manualmente, onde o # é o número desejado:
```
kubectl scale deployments [my-deploy] --replicas=#
```

Ou Automáticamente via porcentagem de recursos utilizados pelos pods(Horizontal Pod Autoscaler). 

Exemplo utilização de CPU ultrapassar os 70%
```
kubectl autoscale deployments [my-deploy] --cpu-percent=70 --min=1 --max=10
``` 

Como consultar
```
kubectl get hpa [my-deploy]
```

### Pods vs. Jobs vs. CronJobs

* Pods: processo "infinito"
* Job: One-time process
* CronJob: Periodic process

**Job:** é completo quando o número específico de conclusões for alcançado, por padrão o número de conclusões é 1.

Criar Jobs

Imperativo(Depreciado):
```
kubectl run counter --image=nginx --restart=OnFailure -- 
/bin/sh -c 'counter=0; while [ $counter -lt 3 ]; do counter=$((counter+1)); echo "$counter"; sleep 3; done;'
```

Declarativo:
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: counter
spec:
  completions: 1 ##número de conclusões a ser alcançados
  parallelism: 1 ##se a task deve rodar em paralelo
  backoffLimit: 6 ##quantas vezes nos tentamos até matar o job como falho
  template:
    spec:
      restartPolicy: OnFailure ##Se dar restart no container ou no pod(OnFailure=restart no container dentro do Pod, Never=restart do Pod)
      containers:
       - args:
         - /bin/sh
         - -c
         - ...
        image: nginx
        name: counter
```

Mista:
```
kubectl create job counter --image=nginx --dry-run -o yaml --
/bin/sh -c 'counter=0; while [ $counter -lt 3 ]; do counter=$((counter+1)); echo "$counter" sleep 3; done;' > job.yaml

kubectl create -f job.yaml
```

comandos do job:
```

kubectl get jobs ##lista os jobs

kubectl get pods ##olhar os pods relacionados ao job

```

**CronJob:** tarefa que é executada em uma agenda específica

`spec.schedule: "0 * * * *"`

Criar CronJobs

Imperativo(Depreciado):
```
kubectl run counter --image=nginx --restart=OnFailure --schedule="*/1 * * * *" ... 
```

Declarativo:
```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: counter
spec:
  schedule: "*/1 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never ##Se dar restart no container ou no pod(OnFailure=restart no container dentro do Pod, Never=restart do Pod)
          containers:
          - args:
            - /bin/sh
            - -c
            - ...
            image: nginx
            name: counter
```

comandos do job:

```

kubectl get cronjobs ##lista os jobs

kubectl get jobs --watch ##olha os jobs executando na agenda

```

## Modulo 7: Services and Networking

### Services

Habilita rede para acessar um conjunto de Pods. Ele utiliza os "label selectors" pra saber pra quais pods redirecionar as requisições.

![Service Label Selectors](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/service-label-selectors.png)

Criando Serviços:

Imperativo(param expose):
```
kubectl run nginx --image=nginx --restart=Never --port=80 --expose
```

Ou se já possuir um deployments:
```
kubectl expose deploy [deploy-name] --target-port=80
```

Declarativo:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  selector:        ## determina quais pods serão redirecionadas as requisições
    tier: frontend
  ports:
   - port: 3000    ##Mapeia a porta do pod para porta que vai receber a request
     protocol: TCP
     targetPort: 80
  type: ClusterIP ##Especifica como expor o serviço.
```

![Incoming Traffic](https://github.com/romjunior/kubernetes/blob/master/certification/ckad/images/incoming-traffic.png)

Tipos de Serviços:

  * ClusterIP: Expõe o serviço interno no cluster. Somente visível e comunicável dentro do cluster.
  * NodePort: Expõe o serviço no IP de cada nó em uma porta estática. Acessível fora do cluster.
  * LoadBalancer: Expõe o serviço utilizando um LoadBalancer.


### Network Policies

Controlam o tráfego de/para o Pod

Network Policies Rules(NPC)

  * Quais Pods a regra se aplica? Label Selectors
  * Qual direção do tráfego? Quem está habilitado? tráfego vindo(Ingress), tráfego saindo(Egress)

Criando NPC

Declarativo: 
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: my-network-policy
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
   - Ingress
   - Egress
  ingress:
   - from:
      ...
  egress:
    - to:
      ...
```

OBS: Regra geral, negue acesso a todos os recursos e vá liberando a partir de necessidades. Existe um NPC que você pode aplicar para o k8s e ele negar para todos
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {} ##significa todos os pods
  policyTypes:  ##entrada e saída bloqueia tudo
   - Ingress
   - Egress
```

OBS: Você pode selecionar por Namespace, Pod ou IP Address

labels:
```yaml
...
ingress:
 - from:
   - podSelector:
       matchLabels:
         tier: backend
```

Por portas(Portas são todas abertas por padrão):
```yaml
...
ingress:
 - from:
   - podSelector:
       matchLabels:
         tier: backend
   ports:
    - protocol: TCP
      port: 5432   ## estamos habilitando o tráfego nessa porta específica
...
```