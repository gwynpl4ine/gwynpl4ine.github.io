expmod = (a, n, m) => {
  if (n == 1n) return a % m;
  res = expmod((a*a) % m, n/2n, m);
  return (n % 2n) ? (res*a) % m : res;
}

gogo = function(e) {
  enc = 91406341503363967394405448986214524688168284450638000634057153349781731n;
  mod = 803427095080542426781920458218201792543115459306281475663006978487720437n;
  pub = 65537n;
  pass = document.getElementById('pass')
  pass.style.width = ((pass.value.length+1)*14)+'px';
  
  if (e.keyCode == 13){
    prox = (str) => str.map((a)=>a.charCodeAt(0));
    password = prox(pass.value.split(''));

    if (password.length > 0 && expmod(password.map(
        x => BigInt(x)
      ).reduce((x,y) => (x << 8n) + y), pub, mod) == enc
    ) {
      document.location.href = '/' + password.map(
        x => String.fromCharCode(x)).reduce((x,y) => x + y
      );
    }
    else {
      pass.value = ''
      pass.style.width = '1px';
      setTimeout(() => {
        document.getElementById("error").style.display = "block";
        setTimeout(() => {
          document.getElementById("error").style.display = "none";
        }, 500);
      }, 0);
    }
  }
}