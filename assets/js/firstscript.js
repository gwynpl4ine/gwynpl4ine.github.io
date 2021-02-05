expmod = (a, n, m) => {
  if (n == 1n) return a % m;
  res = expmod((a*a) % m, n/2n, m);
  return (n % 2n) ? (res*a) % m : res;
}

(function(password){
  enc = 91406341503363967394405448986214524688168284450638000634057153349781731n;
  mod = 803427095080542426781920458218201792543115459306281475663006978487720437n;
  pub = 65537n;
  document.onkeypress = function(e) {
    if (e.keyCode == 13)
      setTimeout(() => {
        if (
          password.length > 0 &&
          expmod(password.map(
            x => BigInt(x)
          ).reduce((x,y) => (x << 8n) + y), pub, mod) == enc
        )
          document.location.href = '/' + password.map(
            x => String.fromCharCode(x)).reduce((x,y) => x + y
          );
        else
          setTimeout(() => {
              document.getElementById("error").style.display = "block";
            setTimeout(() => {
              document.getElementById("error").style.display = "none";
            }, 1000);
          }, 0);
        password = [];
      }, 0);
    else if (e.keyCode >= 48 && e.keyCode <= 122) password.push(e.keyCode);
  };
})([]);