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

### Três Ferramentas importantes(Trinity os Tooling):

* YAML
* Vim - Mas disse que pode mudar
* Comandos Bash