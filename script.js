document.addEventListener('DOMContentLoaded', () => {
    const bovinoGallery = document.getElementById('bovino-gallery');
    const mainVideoPlayer = document.getElementById('main-video');

    // Datos de ejemplo de los bovinos.
    // En un proyecto real, esto podría venir de una API o un archivo JSON.
    const bovinos = [
        {
            id: 'lote34',
            name: 'Lote 34',
            description: 'Excelente ejemplar Angus',
            image: 'images/bovino1.jpg', // Ruta a la imagen del bovino
            video: 'videos/bovino1.mp4'  // Ruta al video del bovino
        },
        {
            id: 'lote35',
            name: 'Lote 35',
            description: 'Calidad superior Braford',
            image: 'images/bovino2.jpg',
            video: 'videos/bovino2.mp4'
        },
        {
            id: 'lote36',
            name: 'Lote 36',
            description: 'Red Angus destacado',
            image: 'images/bovino3.jpg',
            video: 'videos/bovino3.mp4'
        },
        {
            id: 'lote37',
            name: 'Lote 37',
            description: 'Angus Negro robusto',
            image: 'images/bovino4.jpg',
            video: 'videos/bovino4.mp4'
        },
        {
            id: 'lote38',
            name: 'Lote 38',
            description: 'Charolais puro',
            image: 'images/bovino5.jpg',
            video: 'videos/bovino5.mp4'
        },
        {
            id: 'lote39',
            name: 'Lote 39',
            description: 'Hereford de pedigree',
            image: 'images/bovino6.jpg',
            video: 'videos/bovino6.mp4'
        }
        // Puedes agregar más bovinos aquí
    ];

    /**
     * Carga las miniaturas de los bovinos en la galería.
     */
    function loadBovinosGallery() {
        bovinos.forEach(bovino => {
            const bovinoItem = document.createElement('div');
            bovinoItem.classList.add('bovino-item');
            bovinoItem.dataset.videoId = bovino.id; // Guarda el ID del video para referencia

            bovinoItem.innerHTML = `
                <img src="${bovino.image}" alt="${bovino.name}">
                <h3>${bovino.name}</h3>
                <p>${bovino.description}</p>
            `;

            bovinoItem.addEventListener('click', () => {
                playBovinoVideo(bovino.video);
            });

            bovinoGallery.appendChild(bovinoItem);
        });
    }

    /**
     * Reproduce el video del bovino seleccionado.
     * @param {string} videoUrl - La URL del video a reproducir.
     */
    function playBovinoVideo(videoUrl) {
        if (mainVideoPlayer.src !== videoUrl) { // Evitar recargar si ya es el mismo video
            mainVideoPlayer.src = videoUrl;
            mainVideoPlayer.load(); // Carga el nuevo video
            mainVideoPlayer.play().catch(error => {
                console.error("Error al intentar reproducir el video:", error);
                // Manejar errores de autoplay, por ejemplo, mostrando un botón de play
                alert("Para reproducir el video, por favor, toque el botón de play.");
            });
        } else {
             mainVideoPlayer.play().catch(error => {
                console.error("Error al intentar reproducir el video:", error);
                alert("Para reproducir el video, por favor, toque el botón de play.");
            });
        }
    }

    // Carga la galería al iniciar
    loadBovinosGallery();

    // Opcional: Reproducir el primer video al cargar la página
    if (bovinos.length > 0) {
        playBovinoVideo(bovinos[0].video);
    }
});