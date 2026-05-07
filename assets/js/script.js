// Aguarda o carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('.video-container video');

    // Verificação para loading screen
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        // Função para verificar se o vídeo foi carregado
        function checkVideoLoaded() {
            if (video.readyState >= 3) {
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 1000);
            } else {
                video.addEventListener('canplay', () => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                });
            }
        }

        // Inicia a verificação de carregamento
        checkVideoLoaded();

        // Timeout máximo
        setTimeout(() => {
            if (loadingScreen.style.display !== 'none') {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 10000);
    }

    // Verificação para age verification (apenas para index.html)
    const overlay = document.querySelector('.age-verification-overlay');
    if (overlay) {
        const exitBtn = document.querySelector('.exit-btn');
        const confirmBtn = document.querySelector('.confirm-btn');

        exitBtn.addEventListener('click', function() {
            window.location.href = 'https://www.google.com';
        });

        confirmBtn.addEventListener('click', function() {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        });
    }

    // Controles para vídeos da galeria retrato
    const portraitVideos = document.querySelectorAll('.portrait-gallery video');
    portraitVideos.forEach((video, index) => {
        const playPauseBtn = video.parentElement.querySelector(`#playPauseBtn${index + 6}`);
        const muteBtn = video.parentElement.querySelector(`#muteBtn${index + 6}`);

        // Controle de Play/Pause
        playPauseBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                video.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        // Controle de Mute com nova funcionalidade
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            muteBtn.innerHTML = video.muted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
            
            // Se o vídeo foi desmutado, muta todos os outros
            if (!video.muted) {
                muteAllExcept(video);
            }
        });
    });

    // Simplifica o código do carrossel para usar apenas navegação por toque/deslize
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselTrack = document.querySelector('.carousel-track');
    const newPrevBtn = document.querySelector('.carousel-prev-btn');
    const newNextBtn = document.querySelector('.carousel-next-btn');
    let currentIndex = 0;
    const cardWidth = 420; // largura do card + gap

    // Mantém apenas o suporte para touch/swipe
    let touchStartX = 0;
    let touchEndX = 0;

    if (carouselTrack) {
        carouselTrack.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        });

        carouselTrack.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].clientX;
            
            if (Math.abs(touchStartX - touchEndX) > 50) {
                carouselWrapper.scrollBy({
                    left: touchStartX > touchEndX ? cardWidth : -cardWidth,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Navegação por botões
    if (newPrevBtn && newNextBtn && carouselTrack) {
        newPrevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                carouselTrack.scrollBy({
                    left: -cardWidth,
                    behavior: 'smooth'
                });
            }
        });
        
        newNextBtn.addEventListener('click', () => {
            const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
            if (carouselTrack.scrollLeft < maxScroll) {
                currentIndex++;
                carouselTrack.scrollBy({
                    left: cardWidth,
                    behavior: 'smooth'
                });
            }
        });
    }

    var buyNowBtn = document.querySelector('.buy-now-button');
    var paymentModal = document.getElementById('payment-modal');
    var closeModalBtn = document.getElementById('close-payment-modal');

    if (buyNowBtn && paymentModal && closeModalBtn) {
        buyNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            paymentModal.style.display = 'flex';
        });
        closeModalBtn.addEventListener('click', function() {
            paymentModal.style.display = 'none';
        });
        paymentModal.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                paymentModal.style.display = 'none';
            }
        });
    }
});
