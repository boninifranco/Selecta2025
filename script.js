let player; // Variable global para el objeto del reproductor de YouTube

// Esta función será llamada automáticamente por la API de YouTube cuando esté lista
function onYouTubeIframeAPIReady() {
    // Si bovinos se ha cargado y hay un primer video, lo inicializamos.
    // Esto asegura que el reproductor se cree y se cargue el primer video
    // una vez que la API esté lista Y los datos estén cargados.
    // La lógica de carga inicial se maneja dentro del DOMContentLoaded listener.
}

document.addEventListener('DOMContentLoaded', async () => {
    const bovinoGallery = document.getElementById('bovino-gallery');
    const youtubePlayerContainer = document.getElementById('youtube-player'); // Asegúrate de que este div esté en tu HTML
    let bovinos = []; // Aquí cargaremos los datos scrapeados

    try {
        const response = await fetch('bovinos_youtube_data.json');
        bovinos = await response.json();
        console.log("Datos de bovinos cargados:", bovinos);
    } catch (error) {
        console.error("Error al cargar los datos de bovinos:", error);
        alert("No se pudieron cargar los datos de los bovinos. Asegúrate de que 'bovinos_youtube_data.json' existe.");
        return;
    }

    /**
     * Carga las miniaturas de los bovinos en la galería.
     */
    function loadBovinosGallery() {
        bovinos.forEach(bovino => {
            if (bovino.thumbnail_image && bovino.youtube_video_id) {
                const bovinoItem = document.createElement('div');
                bovinoItem.classList.add('bovino-item');
                bovinoItem.dataset.videoId = bovino.youtube_video_id;

                bovinoItem.innerHTML = `
                    <img src="${bovino.thumbnail_image}" alt="${bovino.name}">
                    <h3>${bovino.name}</h3>
                `;

                bovinoItem.addEventListener('click', () => {
                    playYouTubeVideo(bovino.youtube_video_id);
                    // *** AÑADIR ESTA LÍNEA AQUÍ ***
                    scrollToTop(); // Llama a la función para desplazar la vista
                });

                bovinoGallery.appendChild(bovinoItem);
            }
        });
    }

    /**
     * Reproduce el video de YouTube usando la API de IFrame Player.
     * @param {string} videoId - El ID del video de YouTube a reproducir.
     */
    function playYouTubeVideo(videoId) {
        if (typeof YT !== 'undefined' && YT.Player) {
            if (!player) {
                player = new YT.Player('youtube-player', {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        'autoplay': 1,
                        'controls': 1,
                        'rel': 0,
                        'showinfo': 0,
                        'modestbranding': 1
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
            } else {
                player.loadVideoById(videoId);
            }
        } else {
            console.warn("La API de YouTube no está cargada aún. No se puede reproducir el video.");
        }
    }

    function onPlayerReady(event) {
        event.target.playVideo();
    }

    function onPlayerStateChange(event) {
        // Lógica para cambios de estado (si es necesario)
    }

    /**
     * Desplaza la ventana del navegador al inicio de la página.
     */
    function scrollToTop() {
        // Opción 1: Desplazamiento suave (recomendado)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // --- Lógica de Inicialización ---
    loadBovinosGallery();

    // Lógica para reproducir el primer video al cargar la página
    // Aseguramos que se intente inicializar cuando la API de YT esté lista y tengamos datos
    if (bovinos.length > 0 && bovinos[0].youtube_video_id) {
        if (typeof YT !== 'undefined' && YT.Player) {
            playYouTubeVideo(bovinos[0].youtube_video_id);
        } else {
            // Si la API de YT aún no está lista, configuramos la función onYouTubeIframeAPIReady
            // para que reproduzca el primer video una vez que se cargue la API.
            // Esto es crucial para la carga inicial.
            window.onYouTubeIframeAPIReady = function() {
                if (bovinos.length > 0 && bovinos[0].youtube_video_id) {
                    playYouTubeVideo(bovinos[0].youtube_video_id);
                }
            };
        }
    }
});