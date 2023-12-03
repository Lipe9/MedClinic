const registerButton = document.getElementById("register");
const loginButton = document.getElementById("login");
const container = document.getElementById("container");

registerButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

loginButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("login-form");
  
form.addEventListener("submit", function(event) {
    event.preventDefault(); 
  
    const username = document.getElementById("nm-usuario").value;
    const password = document.getElementById("senha").value;
  
    if (username !== "" && password !== "") {
      window.location.href = "index.html"; 
    } else {
  
      alert("Preencha todos os campos!");
  
      }
    });
  });


  document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("rg-form");
    
    form.addEventListener("submit", function(event) {
      event.preventDefault(); 
    
      const username = document.getElementById("nm-usuario").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("senha").value;
    
      if (username !== "" && email != "" && password !== "") {
        window.location.href = "index.html"; 
      } else {
    
        alert("Preencha todos os campos!");
    
        }
      });
    });
    