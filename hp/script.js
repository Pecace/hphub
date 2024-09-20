const elemento = document.querySelector('.sup');

document.querySelector('#btn').addEventListener('click',()=>{
  copyToClipBoard(elemento);
}

function copyToClipBoard(elemento){
  const inputOculto = document.createElement('input');

  inputOculto.setAttribute('value', elemento.innerText);
  document.body.appendChild(inputOculto);
  inputOculto.select();
  document.execCommand('copy');
  document.body.removeChild(inputOculto);
  
}

function copiarAlPortapapeles(id_elemento) {
  var aux = document.createElement("input");
  aux.setAttribute("value", document.getElementById(id_elemento).innerHTML);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
}