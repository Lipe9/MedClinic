function atualizarResultado() {
    const menu1 = document.getElementById('menu1').value;
    const menu2 = document.getElementById('menu2').value;
    const menu3 = document.getElementById('menu3').value;
  
    const resultado = document.getElementById('itemSelecionado');
    resultado.textContent = `Selecionado: ${menu1}, ${menu2}, ${menu3}`;
  }

  document.getElementById("botaoEnviar").addEventListener("click", function() {
    alert("Seu formulario foi enviado com sucesso!!");
  });