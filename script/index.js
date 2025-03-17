document.addEventListener("DOMContentLoaded", function() {
    const circle = document.querySelector('.circle');
    const circlesecond = document.querySelectorAll('.circlesecond');
    const radius = 270; // Distancia desde el centro del círculo principal

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