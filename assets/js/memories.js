// Gerenciamento do carrossel de memórias

document.addEventListener('DOMContentLoaded', () => {
    loadCarouselImages();
});

let currentSlide = 0;
let carouselImages = [];
let autoPlayInterval;

async function loadCarouselImages() {
    try {
        const response = await fetch('/data/memories_carousel.json');
        const data = await response.json();
        carouselImages = data.carousel_images;
        renderCarousel();

        // Inicializa o auto-play
        startAutoPlay();
    } catch (error) {
        console.error('Erro ao carregar imagens do carrossel:', error);
    }
}

function renderCarousel() {
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselDots = document.querySelector('.carousel-dots');
    const carouselPrev = document.querySelector('.carousel-prev');
    const carouselNext = document.querySelector('.carousel-next');
    const carouselCaption = document.querySelector('.carousel-caption');
    const carouselContainer = document.querySelector('.carousel-container');

    if (!carouselSlide || !carouselDots || !carouselPrev || !carouselNext || !carouselCaption || !carouselContainer) return;

    carouselSlide.innerHTML = ''; // Limpa antes de adicionar

    carouselImages.forEach(image => {
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        img.addEventListener('load', () => {
            requestAnimationFrame(updateCarousel); // Atualiza quando a imagem é carregada
        });
        carouselSlide.appendChild(img);
    });

    carouselDots.innerHTML = carouselImages.map((_, index) => `
        <span class="dot" data-index="${index}"></span>
    `).join('');

    carouselPrev.addEventListener('click', () => {
        stopAutoPlay();
        currentSlide = (currentSlide === 0) ? carouselImages.length - 1 : currentSlide - 1;
        requestAnimationFrame(updateCarousel);
        startAutoPlay();
    });

    carouselNext.addEventListener('click', () => {
        stopAutoPlay();
        currentSlide = (currentSlide === carouselImages.length - 1) ? 0 : currentSlide + 1;
        requestAnimationFrame(updateCarousel);
        startAutoPlay();
    });

    carouselDots.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            stopAutoPlay();
            currentSlide = parseInt(e.target.dataset.index);
            requestAnimationFrame(updateCarousel);
            startAutoPlay();
        });
    });

    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', () => {
        requestAnimationFrame(updateCarousel);
    });

    // Chamar updateCarousel após o carregamento completo da página (incluindo imagens)
    window.addEventListener('load', () => {
        requestAnimationFrame(updateCarousel);
    });
}

function startAutoPlay() {
    stopAutoPlay(); // Garante que apenas um intervalo esteja ativo
    autoPlayInterval = setInterval(() => {
        currentSlide = (currentSlide === carouselImages.length - 1) ? 0 : currentSlide + 1;
        updateCarousel();
    }, 5000); // Muda a cada 5 segundos (ajuste o tempo conforme preferir)
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

function updateCarousel() {
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselDots = document.querySelector('.carousel-dots');
    const carouselCaption = document.querySelector('.carousel-caption');
    const carouselContainer = document.querySelector('.carousel-container');

    if (!carouselSlide || !carouselDots || !carouselCaption || !carouselContainer) return;

    // Obter a largura atual do contêiner do carrossel
    const containerWidth = carouselContainer.clientWidth;

    // Garante que a largura total do carouselSlide acomode todas as imagens
    carouselSlide.style.width = `${containerWidth * carouselImages.length}px`;

    // Ajustar a largura de cada imagem para ser igual à largura do container do carrossel
    const images = carouselSlide.querySelectorAll('img');
    images.forEach(img => {
        img.style.width = `${containerWidth}px`;
    });

    // Calcular a translação com base na largura atual do contêiner
    carouselSlide.style.transform = `translateX(${-containerWidth * currentSlide}px)`;

    carouselDots.querySelectorAll('.dot').forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Atualiza a legenda
    carouselCaption.textContent = carouselImages[currentSlide].caption;
} 