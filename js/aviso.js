function alerta() {
  var name = document.getElementById("name").value;

  Swal.fire({
    title: `Olá, ${name}!`,

    text: `O seu formulário foi enviado com sucesso.
        Obrigado pela preferência!! volte sempre :)`,

    icon: "success",

    background: "rgb(4, 36, 111)",

    color: "white"
    
   

  });
  
}

