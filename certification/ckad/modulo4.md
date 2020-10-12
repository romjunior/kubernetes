# Modulo 4: Observabilidade

Como o kubernetes sabe se o container está em pé e executando?

*Probes* podem detectar e corrigir falhas. Podemos fazer isso de 3 jeitos.

* HTTP(GET) Connection
* Command line
* TCP Connection

Existem dois tipos de *Probes*

* Readiness
* Liveness

## Readiness Probes

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

## Liveness Probes

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

## Debug Pods

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