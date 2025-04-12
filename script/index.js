document.addEventListener("DOMContentLoaded", function() {
    const circle = document.querySelector('.circle');
    const circlesecond = document.querySelectorAll('.circlesecond');
    const radius = 300; // Distancia desde el centro del círculo principal

    circlesecond.forEach((secCircle, index) => {
        const angle = (2 * Math.PI / circlesecond.length) * index;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Guarda las coordenadas como variables CSS personalizadas
        secCircle.style.setProperty('--x', `${x}px`);
        secCircle.style.setProperty('--y', `${y}px`);
        secCircle.style.transform = `translate(${x}px, ${y}px)`;
        
        // Obtener el enlace dentro del círculo
        const link = secCircle.querySelector('a');
        
        // Hacer que todo el círculo sea clickeable
        secCircle.addEventListener('click', function(e) {
            if (link.href) {
                window.location.href = link.href;
            }
        });
    });
});

// Obtener el enlace móvil (electrón)
const electron = document.getElementById('orbiting');

// Configuración de la órbita
const centerX = window.innerWidth / 2; // Centro horizontal de la pantalla
const centerY = window.innerHeight / 2; // Centro vertical de la pantalla
const radius = 400; // Radio de la órbita
let angle = 180 ; // Ángulo inicial

// Función para mover el enlace en una trayectoria circular
function moveElectron() {
  setInterval(() => {
    // Calcular las nuevas coordenadas usando trigonometría
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Actualizar la posición del enlace
    electron.style.left = `${x - electron.offsetWidth / 2}px`; // Centrar el enlace
    electron.style.top = `${y - electron.offsetHeight / 2}px`;

    // Incrementar el ángulo para continuar la órbita
    angle += 0.01; // Velocidad de rotación
  }, 60); // Intervalo de actualización (aproximadamente 60 FPS)
}

// Sonido
const hoverSound = document.getElementById('radar');
let isPlaying = false;

// Agregar evento de clic al enlace
electron.addEventListener('mouseover', (event) => {
  // event.preventDefault(); // Evitar que el enlace redirija

  if (!isPlaying) {
    hoverSound.currentTime = 0; // Reiniciar el sonido
    hoverSound.play(); // Reproducir el sonido
    hoverSound.volume = 0.15; // Nivel de volumen
    isPlaying = true;

    // Restablecer la bandera cuando termine el sonido
    hoverSound.onended = () => {
      isPlaying = false;
    };
  }
});

// Iniciar el movimiento
moveElectron();