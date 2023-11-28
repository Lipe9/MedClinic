let menuMobile = document.querySelector('.cabecalho__menu')
let botaoMenu = document.querySelector('.cabecalho__botao')

let aberto = false 

botaoMenu.onclick = function abrirOuFecharMenu() {
  if (aberto === true) {
    aberto = false
    menuMobile.classList.remove('aberto')
    botaoMenu.innerHTML = `<img src="img/menu_white_24dp.svg " alt="Menu aberto">`
  } else if (aberto === false) {
    aberto = true
    menuMobile.classList.add('aberto')
    botaoMenu.innerHTML = `<img src="img/close_white_24dp.svg"" alt="Menu fechado">`
  }
}

function atualizarResultado() {
  const menu1 = document.getElementById('menu1').value;
  const menu2 = document.getElementById('menu2').value;
  const menu3 = document.getElementById('menu3').value;

  const resultado = document.getElementById('itemSelecionado');
  resultado.textContent = `Selecionado: ${menu1}, ${menu2}, ${menu3}`;
}


document.getElementById("botaoEnviar").addEventListener("click", function() {
  
    // Obtém os valores dos campos de entrada
    var name = document.getElementById("name").value;
    // Cria uma mensagem de alerta com os valores
    alert(`Olá, ${name}, seu formulário foi enviado com sucesso!!`);
  });



  




document.getElementById('register-form').addEventListener('submit', registerUser);
document.getElementById('login-form').addEventListener('submit', loginUser);

function registerUser(e) {
    e.preventDefault();
    
    var username = document.getElementById('register-username').value;
    var password = document.getElementById('register-password').value;
    
    // Fazer algo com os dados de registro
    console.log('Registrado:', username, password);
    
    // Limpar os campos
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
}

function loginUser(e) {
    e.preventDefault();
    
    var username = document.getElementById('login-username').value;
    var password = document.getElementById('login-password').value;
    
    // Fazer algo com os dados de login
    console.log('Logado:', username, password);
    
    // Limpar os campos
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}
