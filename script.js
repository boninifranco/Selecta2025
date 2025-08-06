let player; // Variable global para el objeto del reproductor de YouTube
let bovinosData = []; // Para almacenar los datos una vez cargados
let youtubeAPIReady = false; // Estado de la API de YouTube
let domLoaded = false; // Estado del DOM
let carouselInterval = null; // NUEVO: Para controlar el intervalo del carrusel

// Función llamada por la API de YouTube
function onYouTubeIframeAPIReady() {
    youtubeAPIReady = true;
    console.log("API de YouTube está lista.");
    checkAndInitializeApp();
}

document.addEventListener('DOMContentLoaded', async () => {
    domLoaded = true;
    console.log("DOM está cargado.");

    try {
        const response = await fetch('bovinos_youtube_data.json'); // Asegúrate que el nombre del archivo JSON sea correcto
        bovinosData = await response.json();
        console.log("Datos cargados:", bovinosData);
        loadBovinosGallery();
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        alert("No se pudieron cargar los datos. Asegúrate de que el archivo JSON existe y es accesible.");
        return;
    }

    checkAndInitializeApp();
});

/**
 * Verifica si todo está listo para inicializar la aplicación.
 */
function checkAndInitializeApp() {
    // Solo inicializa si el DOM, la API y los datos están listos
    if (domLoaded && youtubeAPIReady && bovinosData.length > 0) {
        console.log("Todo listo. Inicializando con el primer item.");
        const firstItem = bovinosData[0];
        
        // Decide si el primer item es un video o una imagen
        if (firstItem.youtube_video_id) {
            playYouTubeVideo(firstItem.youtube_video_id);
        } else if (firstItem.images && firstItem.images.length > 0) {
            displayImages(firstItem.images);
        }
    }
}

/**
 * Carga la galería de miniaturas. MODIFICADA PARA MANEJAR VIDEOS E IMÁGENES
 */
function loadBovinosGallery() {
    const bovinoGallery = document.getElementById('bovino-gallery');
    bovinoGallery.innerHTML = ''; // Limpiar galería

    bovinosData.forEach(bovino => {
        const bovinoItem = document.createElement('div');
        bovinoItem.classList.add('bovino-item');

        // Determina si es video o embrión (imágenes)
        if (bovino.youtube_video_id) {
            // LÓGICA PARA VIDEOS (EXISTENTE)
            bovinoItem.dataset.videoId = bovino.youtube_video_id;
            bovinoItem.innerHTML = `
                <img src="${bovino.thumbnail_image}" alt="${bovino.name}">
                <h3>${bovino.name}</h3>
            `;
            bovinoItem.addEventListener('click', () => {
                playYouTubeVideo(bovino.youtube_video_id);
                scrollToTop();
            });
        } else if (bovino.images && bovino.images.length > 0) {
            // NUEVA LÓGICA PARA IMÁGENES
            bovinoItem.innerHTML = `
                <img src="${bovino.images[0]}" alt="${bovino.name}">
                <h3>${bovino.name}</h3>
            `;
            bovinoItem.addEventListener('click', () => {
                displayImages(bovino.images);
                scrollToTop();
            });
        }
        
        bovinoGallery.appendChild(bovinoItem);
    });
}


/**
 * NUEVO: Muestra imágenes en el área del reproductor.
 * @param {string[]} images - Un array con las URLs de las imágenes.
 */
function displayImages(images) {
    // Detener y ocultar el reproductor de YouTube
    if (player) {
        player.stopVideo();
        document.getElementById('youtube-player').style.display = 'none';
    }

    // Detener cualquier carrusel anterior
    clearInterval(carouselInterval);

    const imageContainer = document.getElementById('image-carousel-container');
    imageContainer.innerHTML = ''; // Limpiar contenedor
    imageContainer.style.display = 'block'; // Hacer visible el contenedor de imágenes

    if (images.length === 1) {
        // Si hay una sola imagen, mostrarla estáticamente
        imageContainer.innerHTML = `<img src="${images[0]}" class="carousel-image active">`;
    } else {
        // Si hay varias, iniciar el carrusel
        startImageCarousel(images, imageContainer);
    }
}

/**
 * NUEVO: Inicia un carrusel de imágenes automático.
 * @param {string[]} images - El array de URLs de imágenes.
 * @param {HTMLElement} container - El elemento contenedor del carrusel.
 */
function startImageCarousel(images, container) {
    let currentIndex = 0;
    
    // Crear todos los elementos de imagen
    images.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.classList.add('carousel-image');
        if (index === 0) {
            img.classList.add('active'); // La primera imagen es la activa
        }
        container.appendChild(img);
    });

    const imageElements = container.querySelectorAll('.carousel-image');

    // Iniciar el intervalo para cambiar de imagen
    carouselInterval = setInterval(() => {
        imageElements[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length; // Loop
        imageElements[currentIndex].classList.add('active');
    }, 3000); // Cambia cada 3 segundos
}

/**
 * Reproduce un video de YouTube. MODIFICADO para detener el carrusel.
 * @param {string} videoId - El ID del video de YouTube.
 */
function playYouTubeVideo(videoId) {
    // NUEVO: Detener el carrusel y ocultar su contenedor
    clearInterval(carouselInterval);
    document.getElementById('image-carousel-container').style.display = 'none';
    
    // Mostrar el contenedor del reproductor de YouTube
    const playerContainer = document.getElementById('youtube-player');
    playerContainer.style.display = 'block';

    if (typeof YT !== 'undefined' && YT.Player) {
        if (!player) {
            player = new YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: { 'controls': 0, 'rel': 0, 'showinfo': 0, 'modestbranding': 1, 'mute': 1, 'loop': 1, 'fs': 0, 'autoplay': 1, 'playlist': videoId },
                events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
            });
        } else {
            player.loadVideoById({ videoId: videoId, playlist: videoId });
        }
    } else {
        console.warn("La API de YouTube no está cargada aún.");
    }
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo(); 
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}