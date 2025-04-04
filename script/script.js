/* function copiarAlPortapapeles(id_elemento) {
  var aux = document.createElement("input");
  aux.setAttribute("value", document.getElementById(id_elemento).innerHTML);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
} */
            
// Copiar al portapapeles
function copiarAlPortapapeles(id_elemento) {
  var textoCopiar = document.getElementById(id_elemento).innerHTML;
  navigator.clipboard.writeText(textoCopiar)
    .then(() => {
      console.log('Texto copiado al portapapeles');
    })
    .catch(err => {
      console.error('Error al copiar al portapapeles: ', err);
    });
}
            
/* Audio begin */
const audio1 = new Audio();
audio1.src = "media/audio/speech.mp3";

/* Audio bottom 
const audio = new Audio();
audio.src = "media/audio/pop.mp3";*/