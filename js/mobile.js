var formSignin = document.querySelector('#signin')
var formSignup = document.querySelector('#signup')
var btnColor = document.querySelector('.btnColor')

document.querySelector('#btnSignin')
  .addEventListener('click', () => {
    formSignin.style.left = "25px"
    formSignup.style.left = "450px"
    btnColor.style.left = "0px"
})

document.querySelector('#btnSignup')
  .addEventListener('click', () => {
    formSignin.style.left = "-450px"
    formSignup.style.left = "25px"
    btnColor.style.left = "110px"
})

// Verifica a largura da janela sempre que houver uma alteração de tamanho
window.addEventListener('resize', function(){
  // Obtém a largura atual da janela
  var screenWidth = window.innerWidth;
  
  // Verifica se a largura é igual a 768 pixels
  if (screenWidth === 768){
    // Redireciona para a página com a imagem
    window.location.href = 'mobile.html';
  }
});