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