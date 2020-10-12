# Modulo 6: Services and Networking

## Services

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

Expose deployment.
```
kubectl expose deployment [name] --port=80 --type=NodePort  [--targetPort=80]
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
  * ExternalName: o objeto relativamente novo que funciona no DNS; redirecionamento funciona a partir do DNS.
  * Service sem selector: usado para conexões diretas baseado no ip/port, sem um endpoint. útil para conexões a bancos e entre namespaces.

### Ingress

* Ingress expõem rotas HTTP e HTTPs de fora para os serviços dentro do cluster
* Roteamento de tráfego é controlado por regras definidas nos recursos do Ingress
* Ingress pode ser configurado para fazer o seguinte:
  * Dar aos serviços URLs externas acessíveis.
  * Load Balance Traffic
  * Terminate SSL/TLS
  * Oferecer o nome baseado em virtual hosting

## Network Policies

Controlam o tráfego de/para o Pod

Network Policies Rules(NPC)

  * Quais Pods a regra se aplica? Label Selectors
  * Qual direção do tráfego? Quem está habilitado? tráfego vindo(Ingress), tráfego saindo(Egress)

  Policies
  * por padrão, todos os pods podem acessar uns aos outros.
  * isolamento de rede pode ser configurado para bloquear o tr[afego para os pods, executando eles em namespaces dedicados.
  * NetworkPolicy pode ser usado para bloquear egress e ingress, e funciona como firewall
  * Uso do NetworkPolicy depende do suporte do network provider; nem todos oferencem suporte, assim não surte efeito o Policy.
  * Conexões são stateful por padrã, permitindo uma direção fo tráfego é o suficiente.

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