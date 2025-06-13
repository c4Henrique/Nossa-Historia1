// Gerenciamento do carrossel da página inicial
document.addEventListener('DOMContentLoaded', () => {
    loadCarouselImages();
});

let currentSlide = 0;
let carouselInterval;
const slideInterval = 3000; // 3 segundos entre slides

function loadCarouselImages() {
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselDots = document.querySelector('.carousel-dots');
    const carouselCaption = document.querySelector('.carousel-caption');
    
    // Lista de imagens do carrossel com suas legendas
    const images = [
        { src: 'assets/img/galeria/1.jpg', caption: 'Nossas Memórias 1' },
        { src: 'assets/img/galeria/2.jpg', caption: 'Nossas Memórias 2' },
        { src: 'assets/img/galeria/3.jpg', caption: 'Nossas Memórias 3' },
        { src: 'assets/img/galeria/5.jpg', caption: 'Nossas Memórias 5' },
        { src: 'assets/img/galeria/6.jpg', caption: 'Nossas Memórias 6' },
        { src: 'assets/img/galeria/7.jpg', caption: 'Nossas Memórias 7' },
        { src: 'assets/img/galeria/10.jpg', caption: 'Nossas Memórias 10' },
        { src: 'assets/img/galeria/11.jpg', caption: 'Nossas Memórias 11' },
        { src: 'assets/img/galeria/14.jpg', caption: 'Nossas Memórias 14' },
        { src: 'assets/img/galeria/18.jpg', caption: 'Nossas Memórias 18' },
        { src: 'assets/img/galeria/21.jpg', caption: 'Nossas Memórias 21' },
        { src: 'assets/img/galeria/27.jpg', caption: 'Nossas Memórias 27' },
        { src: 'assets/img/galeria/28.jpg', caption: 'Nossas Memórias 28' },
        { src: 'assets/img/galeria/30.jpg', caption: 'Nossas Memórias 30' },
        { src: 'assets/img/galeria/31.jpg', caption: 'Nossas Memórias 31' },
        { src: 'assets/img/galeria/33.jpg', caption: 'Nossas Memórias 33' },
        { src: 'assets/img/galeria/34.jpg', caption: 'Nossas Memórias 34' },
        { src: 'assets/img/galeria/35.jpg', caption: 'Nossas Memórias 35' },
        { src: 'assets/img/galeria/42.jpg', caption: 'Nossas Memórias 42' },
        { src: 'assets/img/galeria/43.jpg', caption: 'Nossas Memórias 43' },
        { src: 'assets/img/galeria/45.jpg', caption: 'Nossas Memórias 45' },
        { src: 'assets/img/galeria/50.jpg', caption: 'Nossas Memórias 50' },
        { src: 'assets/img/galeria/53.jpg', caption: 'Nossas Memórias 53' },
        { src: 'assets/img/galeria/56.jpg', caption: 'Nossas Memórias 56' },
        { src: 'assets/img/galeria/58.jpg', caption: 'Nossas Memórias 58' },
        { src: 'assets/img/galeria/59.jpg', caption: 'Nossas Memórias 59' },
        { src: 'assets/img/galeria/61.jpg', caption: 'Nossas Memórias 61' },
        { src: 'assets/img/galeria/62.jpg', caption: 'Nossas Memórias 62' },
        { src: 'assets/img/galeria/63.jpg', caption: 'Nossas Memórias 63' },
        { src: 'assets/img/galeria/65.jpg', caption: 'Nossas Memórias 65' }
    ];

    // Limpa o carrossel
    carouselSlide.innerHTML = '';
    carouselDots.innerHTML = '';

    // Adiciona as imagens ao carrossel
    images.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.caption;
        if (index === 0) img.classList.add('active');
        carouselSlide.appendChild(img);

        // Adiciona os pontos de navegação
        const dot = document.createElement('span');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        carouselDots.appendChild(dot);
    });

    // Configura os botões de navegação
    document.querySelector('.carousel-prev').addEventListener('click', () => {
        clearInterval(carouselInterval);
        goToSlide(currentSlide - 1);
        startCarousel();
    });

    document.querySelector('.carousel-next').addEventListener('click', () => {
        clearInterval(carouselInterval);
        goToSlide(currentSlide + 1);
        startCarousel();
    });

    // Atualiza a legenda inicial
    updateCaption(images[0].caption);

    // Inicia o carrossel automático
    startCarousel();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide img');
    const dots = document.querySelectorAll('.carousel-dot');
    const images = [
        { caption: 'Nossas Memórias 1' },
        { caption: 'Nossas Memórias 2' },
        { caption: 'Nossas Memórias 3' },
        { caption: 'Nossas Memórias 5' },
        { caption: 'Nossas Memórias 6' },
        { caption: 'Nossas Memórias 7' },
        { caption: 'Nossas Memórias 10' },
        { caption: 'Nossas Memórias 11' },
        { caption: 'Nossas Memórias 14' },
        { caption: 'Nossas Memórias 18' },
        { caption: 'Nossas Memórias 21' },
        { caption: 'Nossas Memórias 27' },
        { caption: 'Nossas Memórias 28' },
        { caption: 'Nossas Memórias 30' },
        { caption: 'Nossas Memórias 31' },
        { caption: 'Nossas Memórias 33' },
        { caption: 'Nossas Memórias 34' },
        { caption: 'Nossas Memórias 35' },
        { caption: 'Nossas Memórias 42' },
        { caption: 'Nossas Memórias 43' },
        { caption: 'Nossas Memórias 45' },
        { caption: 'Nossas Memórias 50' },
        { caption: 'Nossas Memórias 53' },
        { caption: 'Nossas Memórias 56' },
        { caption: 'Nossas Memórias 58' },
        { caption: 'Nossas Memórias 59' },
        { caption: 'Nossas Memórias 61' },
        { caption: 'Nossas Memórias 62' },
        { caption: 'Nossas Memórias 63' },
        { caption: 'Nossas Memórias 65' }
    ];

    // Ajusta o índice se necessário
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    // Atualiza o slide atual
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    // Atualiza os pontos de navegação
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Atualiza a legenda
    updateCaption(images[index].caption);

    currentSlide = index;
}

function updateCaption(caption) {
    const captionElement = document.querySelector('.carousel-caption');
    captionElement.textContent = caption;
}

function startCarousel() {
    carouselInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, slideInterval);
} 