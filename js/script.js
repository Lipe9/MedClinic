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


