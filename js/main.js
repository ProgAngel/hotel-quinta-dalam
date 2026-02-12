// Obtener elementos del DOM
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("imgZoom");
const captionText = document.getElementById("caption");
const closeBtn = document.querySelector(".close");

// Seleccionar todas las imágenes de las cards
const images = document.querySelectorAll(".habitaciones-card img");

// Solo ejecutamos la lógica si hay imágenes en la página actual
if (images.length > 0) {
    images.forEach(img => {
        img.onclick = function() {
            modal.style.display = "block";
            modalImg.src = this.src;
            const nombreHabitacion = this.parentElement.querySelector('h3').innerText;
            captionText.innerHTML = nombreHabitacion;
        }
    });
}

images.forEach(img => {
    img.onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src;
        
        // Navegación: sube al padre (.habitaciones-card) y busca el h3
        const nombreHabitacion = this.parentElement.querySelector('h3').innerText;
        captionText.innerHTML = nombreHabitacion; 
    }
});

// Cerrar el modal al hacer clic en la (X)
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// Cerrar también al hacer clic fuera de la imagen
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}