# CKAD Cerfification

Source: https://learning.oreilly.com/videos/certified-kubernetes-application/9780136677628

## Módulo 2

### Lesson 4: k8s Essentials

Pod: Pode ter vários containers que compartilham o mesmo volume

Olhar todos os recursos da API:
```
kubectl api-resources
```

Olhar as versões das APIs:
```
kubectl api-versions
```

Descrever para que serve um recurso:
```
kubectl explain <resource-name>
```

Ver a config de contexto:
```
kubectl config view
```

Alterar o contexto no arquivo:
```
kubectl config set current-context <context-name>
```

Consultar o contexto atual:
```
kubectl config current-context
```

Saber se um usuário do k8s pode fazer algo:
```
kubectl auth can-i [coommand](ex: get pods)
```

Iniciar um proxy entra o client e o server para garantir a segurança(TLS) para fazer requisições direto no api-server
```
kubectl proxy --port 8001
curl http://localhost:8001
```


### Lesson 5: Managing Pod Basic Features

Gerar yaml a partir de um deployment:
```
kubectl get deployments nginx --export -o yaml
```

### Lesson 6: Managing Pod Advanced Features

Acessando Pods(port-forward):
```
kubectl port-forward pod/podName OuterPort:ContainerPort
```

### Lesson 7: Managing Deployments

Escalar um deployment
```
kubectl scale deployment [name] -- replicas=4
```
ou editando manual
```
kubectl edit deployment [name]
```

Labels = usado para adicionar
Selector = usado para consultar as labels
Annotations = usado somente para metadados(fins informativos)

procurar por pods que possuam labels em específico.
```
kubectl get pods --selector='run=httpd'
```

adicionar uma label no deployment
```
kubectl label deployment [name] [key=value]
```

remover uma label no deployment
```
kubectl label deployment [name] [key]-
```

ver as labels do deployment
```
kubectl get deployments --show-labels
```

ver o histórico de rollout do deployment
```
kubectl rollout history deployment [name]
```

para fazer um rollout do deployment
```
kubectl rollout undo deployment [name]
```

Estratégias de updates:
* Recreate: mata todos os pods e cria os novos, faz com que tenha uma indisponibilidade temporária.
* RollingUpdate: atualiza um pod de cada vez, garante a disponibilidade.
    * Tem opções para definir o min e o max de pods disponíveis.
        * maxUnavailable: determina o número máximo de pods que são atualizados ao mesmo tempo.
        * maxSurge: número de pod mínimos que rodam acima do limite para garantirem a disponibilidade.


### Lesson 8: Managing Networking

Services - Tipos:
  * ClusterIP: padrão; provém acesso interno somente.
  * NodePort: aloca um específica porta do nó no qual precisa ser aberta no firewall.
  * LoadBalancer: atualmente implementado somente na cloud publica.
  * ExternalName: o objeto relativamente novo que funciona no DNS; redirecionamento funciona a partir do DNS.
  * Service sem selector: usado para conexões diretas baseado no ip/port, sem um endpoint. útil para conexões a bancos e entre namespaces.

Expose deployment.
```
kubectl expose deployment [name] --port=80 --type=NodePort  [--targetPort=80]
```

consultar os services:
```
kubectl get svc
```

Policies
  * por padrão, todos os pods podem acessar uns aos outros.
  * isolamento de rede pode ser configurado para bloquear o tr[afego para os pods, executando eles em namespaces dedicados.
  * NetworkPolicy pode ser usado para bloquear egress e ingress, e funciona como firewall
  * Uso do NetworkPolicy depende do suporte do network provider; nem todos oferencem suporte, assim não surte efeito o Policy.
  * Conexões são stateful por padrã, permitindo uma direção fo tráfego é o suficiente.

### Lesson 9: Managing Ingress

* Ingress expõem rotas HTTP e HTTPs de fora para os serviços dentro do cluster
* Roteamento de tráfego é controlado por regras definidas nos recursos do Ingress
* Ingress pode ser configurado para fazer o seguinte:
  * Dar aos serviços URLs externas acessíveis.
  * Load Balance Traffic
  * Terminate SSL/TLS
  * Oferecer o nome baseado em virtual hosting
