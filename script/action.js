// Variable para alternar entre colores
let esVerde = true;

// Función para copiar texto al portapapeles
async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);

    // Mostrar la alerta personalizada
    const alerta = document.getElementById('customAlert');
    alerta.style.display = 'block'; // Mostrar la alerta
    alerta.classList.add('show'); // Mostrar con animación
    
    // Ocultar la alerta después de 3 segundos
    setTimeout(() => {
      alerta.classList.remove('show'); // Ocultar con animación
    }, 900);
  } 
  catch (error) {
    console.error('Error al copiar el texto: ', error);
    alert('No se pudo copiar el texto. Por favor, inténtalo de nuevo.');
  }
}

// Obtener todos los elementos con la clase "contenedorTexto"
const contenedores = document.querySelectorAll('.copyText');

// Asignar el evento click a cada elemento
contenedores.forEach(contenedor => {
  contenedor.addEventListener('click', () => {
      const textoACopiar = contenedor.textContent; // Obtener el texto del elemento
      copiarTexto(textoACopiar); // Llamar a la función para copiar
  });
});

// Función para procesar el texto y conservar los saltos de línea
function procesarTexto(elemento) {
  const clon = elemento.cloneNode(true); // Crear un clon del elemento

  // Reemplazar todas las etiquetas <br> con un salto de línea (\n)
  clon.querySelectorAll('br').forEach(br => {
      br.replaceWith('\n'); // Reemplazar <br> con \n
  });

  // Texto plano con saltos de línea
  const textoPlano = clon.textContent.trim();

  // Texto HTML original con <br> para mantener el formato
  const textoHTML = elemento.innerHTML;

  return {
      plano: textoPlano,
      html: textoHTML,
};
};

contenedores.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.code === 'Space') {
      const textoACopiar = contenedores.textContent;
      copiarTexto(textoACopiar);
  }
});