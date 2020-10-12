# Dicas para o Exame

## Currículo

* Requisitos: https://github.com/cncf/curriculum
* Info sobre a certificação: https://www.cncf.io/certification/ckad/
* GitHub do autor: https://github.com/bmuschko/ckad-prep

Exercícios:

* https://github.com/dgkanatsios/CKAD-exercises
* https://github.com/nikhilagrawal577/ckad-notes

Produtividade no Exame:

Defina um alias para o kubectl: alias k=kubectl
Configure o contexto e o namespace antes de executar os comandos para ter certeza que vai executar no lugar certo:

kubectl config set-context --namespace=

Utilize o nome dos recursos curtos:

* ns = namespaces
* pvc= persistentVolumeClaim
* pv = persistentVolume
* p = pods
* svc = service

Deleção de Objetos: não espere eles se excluírem de forma normal. Utilize a forma forçada:
```
kubectl delete pod nginx --grace-period=0 --force
```

Pode ser que no cluster que você esteja executando tenha objetos criados, use-os a seu favor, mas primeiro ache-os, grep é o seu amigo:
```
kubectl describe pods | grep -C 10 "author=John Doe"
```
No momento da prova só pode abrir o Kubernetes docs.

Pode utilizar o comando --help

Pode usar o comando explain, ex: 
```
kubectl explain pods.spec
```

Três Ferramentas importantes(Trinity os Tooling):

YAML
Vim - Mas disse que pode mudar
Comandos Bash

Usando o Curso de Certificação: https://learning.oreilly.com/learning-paths/learning-path-certified/9781492061021/

## Produtividade no Exame:

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

## Três Ferramentas importantes(Trinity of Tooling):

* YAML
* Vim - Mas disse que pode mudar
* Comandos Bash