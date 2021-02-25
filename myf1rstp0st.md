---
layout: post
title:  Primera entrada
date:   2021-02-04 11:58:59 -0500
categories: jekyll update
author: gwynpl4ine
---
Esta será la primera entrada de este blog, espero que no sea la última.
Con esto pretendo poner mis ideas en algún lugar no tan volátil para posteriormente poder desarrollarlas en algo más concreto. Además, será un intento por documentar mi camino de aprendizaje.

Empiezo esto debido a un problema que resolví con un amigo ayer por la noche. Se trata de la pagina web personal de un hacker que le sirve de archivo para los documentos de su antiguo blog. Observar lo que encontramos allí nos hizo mucha ilusión y nos hizo reflexionar sobre el camino que estamos tomando como entusiastas de informática. Así, me resolví a escribir un blog de la misma forma que él hizo y pensé que sería una buena idea utilizar esta experiencia para hacer el contenido del primer post.

Para empezar, no pudimos contenido ver de la página así como así. Así que les mostraré el procedimiento que seguímos para entrar.

No mostraré la dirección de la página ni revelaré el nombre de la persona a la que pertenece. Tampoco revelaré lo que encontramos ahí.

Cuando entramos a la página, nos encontramos con esto:

![figure1](/assets/img/firstpost/home.png)

Alguien que esté familiarizado con como funciona una página web sabe que lo primero que debe hacer es buscar qué es lo que se encuentra del lado del cliente. Los hackers quieren atención, no te invitarían a romper algo de esa forma si no hubiera la posibilidad de hacerlo.

Buscando en las fuentes de la página llegamos al siguiente código escrito en js

```javascript
expmod = (a, n, m) => {
  if (n == 1n) return a % m;
  res = expmod((a*a) % m, n/2n, m);
  return (n % 2n) ? (res*a) % m : res;
}

(function(password){
  enc = 383758997142829475354633982978140249665899064849306762672729644831336253n;
  mod = 803427095080542426781920458218201792543115459306281475663006978487720437n;
  pub = 65537n;
  document.onkeypress = function(e) {
    if (e.keyCode == 13)
      setTimeout(() => {
        if (password.length > 0 && expmod(password.map(x => BigInt(x)).reduce((x,y) => (x << 8n) + y), pub, mod) == enc)
          document.location.href = '/' + password.map(x => String.fromCharCode(x)).reduce((x,y) => x + y);
        else
          setTimeout(() => {
            document.getElementById("error").style.display = "block";
            setTimeout(() => {
                document.getElementById("error").style.display = "none";
            }, 1000);
          }, 0);
        password = [];
      }, 0);
    else if (e.keyCode >= 97 && e.keyCode <= 122) password.push(e.keyCode);
  };
})([]);

```

Vemos que lo que pasa es que la constraseña se encripta con [RSA](https://es.wikipedia.org/wiki/RSA#Algoritmo_RSA) y los datos importantes que nos otorga son:

+ la llave pública $e$. En el código es `pub`
+ el producto de los primos $p$ y $q$. En el código `mod`.
+ el criptograma. En el código es `enc`

Los números presentados son pequeños para la maquinaria de cómputo de estos tiempos. De manera que podemos buscar la forma de factorizar nuestro $n$ como $p\cdot q$. Esto puedes hacerlo tú o puedes buscar en [factordb.com](http://factordb.com). Fui por lo segundo y tendremos que

$$
n = 834484082192663321522350796531179531\cdot 962783008358270223405333797438320127
$$

donde ambos factores son primos. Así, podemos calcular rápidamente:

$$
\begin{align*}
\varphi(n) &= (834484082192663321522350796531179531-1)(962783008358270223405333797438320127-1)\\
\varphi(n) &= 803427095080542426781920458218201790745848368755347930735322384518220780
\end{align*}
$$

Con nuestro $\varphi(n)$ ya podemos calcular la llave privada que sería

$$
d = e^{-1} (\text{ mod }\varphi(n))
$$

Es decir, solo tenemos que elevar $65537^{-1}$ módulo $\varphi(n)$. Esto puede hacerse rápidamente en sagemath:

```
┌────────────────────────────────────────────────────────────────────┐
│ SageMath version 8.1, Release Date: 2017-12-07                     │
│ Type "notebook()" for the browser-based notebook interface.        │
│ Type "help()" for help.                                            │
└────────────────────────────────────────────────────────────────────┘
sage: d = 65537**(-1) % 803427095080542426781920458218201790745848368755347930735322384518220780
sage: d
783628587999731953015150518489157191633064061943319810617868951327856153
sage: 
```

Ahora tenemos nuestra llave para desencriptar! Solo tenemos que elevar a nuestro criptograma `enc` a nuestro $d$ modulo $n$. Pero, dado lo grande que es el número, debemos usar un algoritmo de exponenciación rápida. Observe que la función `expmod` es exactamente lo que necesitamos, así que la usamos en la consola del navegador

![figure2](/assets/img/firstpost/logexpo.png)

Y así tenemos que nuestro mensaje secreto es 

```
raw = 620022046902789193430391232136373345
```

Sin embargo, el trabajo no termina aquí: observe en el código cómo es que se encripta la `password`.

Para empezar, de las últimas líneas notamos que la constraseña solo admite caracteres alfabéticos, en particular, minúsculas; del $97$ al $122$ en ASCII que corresponden a 'a' y 'z' respectivamente. Ergo, podemos ver nuestra contraseña no como una cadena de caracteres sino como un número representado en base $2^8=256$. Además, la constraseña se encripta ~~letra por letra~~ dígito por dígito en

```javascript
expmod(password.map(x => BigInt(x)).reduce((x,y) => (x << 8n) + y), pub, mod)
```

Esto quiere decir que, sea $\text{password} = \overline{p_1p_2p_3...p_t}$, donde $p_i$ es el valor ASCII una letra minúscula, tendremos que nuestro criptograma será un número que tendrá la forma

$$
\begin{align*}
&((...((p_i\cdot 2^8+p_2)\cdot 2^8 + p_3)\cdot 2^8+...)\cdot2^8+p_t) \\
\Rightarrow \hspace{0.5cm} &p_1\cdot 2^{8t} + p_2\cdot 2^{8(t-1)} + p_3\cdot 2^{8(t-2)} +... + p_{t-1}\cdot2^8 + p_t
\end{align*}
$$

Razonemos que esta es la desconposición polinómica de nuestro $\text{password}$ y, por lo tanto, es el valor **en base 10** de nuestro mensaje. Para poder encontrar la contraseña todo lo que tenemos que hacer es aplicar divisiones sucesivas para encontrar el valor de `raw` en la base $2^8$. Esto es sencillo de hacer con `python3`.

```python
t = 620022046902789193430391232136373345

while t >= 256 :
     aux = t // 256
     pasw.append(t - aux*256)
     t = aux

pasw.append(t)
print(''.join(reversed([chr(_) for _ in pasw])))
```
Y así, conseguiremos nuestra contraseña: `*i*s*n*wi*d*r*a`. La he censurado a propósito.

Una vez hecho esto, ingresamos a la página y esta nos redirigirá hacia el contenido del blog.

Estoy pensando seriamente en 'proteger' esta primera entrada con el mismo método que uso esta persona. Como sea, veré si puedo hacerlo... y si tengo ganas. De momento, es todo por hoy.