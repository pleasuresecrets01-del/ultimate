document.addEventListener('DOMContentLoaded', function () {
    /* =============================================
       1. LEITURA DOS DADOS DOS PACOTES DO HTML
       ============================================= */
    const produtos = {};

    const pacoteIds = [
        'pacoteC1', 'pacoteC2', 'pacoteC3', 'pacoteC4', 'pacoteC5',
        'pacoteMomAndSon', 'pacoteHighSchool', 'pacoteHighSchoolThots',
        'pacoteDarkzadie', 'pacoteAnxiousPanda', 'pacoteNewStuffPyt',
        'pacoteSnapgod', 'pacoteBlackmail', 'pacoteBrazzers', 'pacoteSnapchat', 'pacoteOmegle',
        'pacoteIvanka', 'pacoteJess', 'pacoteAva', 'pacoteAsh', 'pacoteBelleDelphine',
        'pacoteBlondeGirls', 'pacoteDesireGarcia', 'pacoteIzzy', 'pacoteLizzyFolder','pacoteSavannah',
        'pacoteVipGroup'  // Adicionado caso use VIP Group
    ];

    pacoteIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            produtos[id] = {
                nome: element.getAttribute('data-nome') || 'Pacote Premium',
                preco: element.getAttribute('data-preco') || '??',
                descricao: (element.getAttribute('data-descricao') || '').split(',').filter(item => item.trim()),
                buyLink: element.getAttribute('data-buy-link') || null
            };
        }
    });

    /* =============================================
       2. AUTOPLAY + CONTROLES DE SOM NOS VÍDEOS DE PRÉVIA
       ============================================= */
    const previewVideos = document.querySelectorAll('.video-preview');

    previewVideos.forEach(video => {
        // Configurações iniciais
        video.muted = true;        // Muted para permitir autoplay
        video.loop = true;         // Loop para manter a prévia rodando
        video.playsInline = true;  // Importante para mobile

        // Adiciona controles nativos (já tem no HTML, mas garante)
        video.controls = true;

        // Tenta autoplay assim que possível
        const tryAutoplay = () => {
            video.play().catch(e => {
                console.log('Autoplay bloqueado (usuário não interagiu ainda):', e);
            });
        };

        // Tenta autoplay quando o vídeo pode tocar
        video.addEventListener('canplay', tryAutoplay);
        tryAutoplay(); // Tenta imediatamente

        // Adiciona botão personalizado de mute/unmute sobre o vídeo
        const muteBtn = document.createElement('div');
        muteBtn.className = 'custom-mute-btn';
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        muteBtn.style.position = 'absolute';
        muteBtn.style.bottom = '15px';
        muteBtn.style.right = '15px';
        muteBtn.style.background = 'rgba(0,0,0,0.6)';
        muteBtn.style.color = 'white';
        muteBtn.style.padding = '10px';
        muteBtn.style.borderRadius = '50%';
        muteBtn.style.cursor = 'pointer';
        muteBtn.style.zIndex = '10';
        muteBtn.style.fontSize = '1.2em';
        muteBtn.style.transition = 'all 0.3s';

        // Insere o botão no container do vídeo
        video.parentElement.style.position = 'relative';
        video.parentElement.appendChild(muteBtn);

        // Funcionalidade do botão
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            muteBtn.innerHTML = video.muted 
                ? '<i class="fas fa-volume-mute"></i>' 
                : '<i class="fas fa-volume-up"></i>';
        });
    });

    /* =============================================
       3. GALERIA DE FOTOS/VÍDEOS (RETRATO) - mantido original
       ============================================= */
    const photoGalleries = document.querySelectorAll('.photo-gallery-container');

    photoGalleries.forEach(galleryContainer => {
        const photos = galleryContainer.querySelectorAll('.photo-item');
        const prevBtn = galleryContainer.querySelector('.gallery-prev-btn');
        const nextBtn = galleryContainer.querySelector('.gallery-next-btn');

        let currentPhoto = 0;

        const scrollToPhoto = (direction) => {
            currentPhoto = (currentPhoto + direction + photos.length) % photos.length;
            photos[currentPhoto].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            });
        };

        if (nextBtn) nextBtn.addEventListener('click', () => scrollToPhoto(1));
        if (prevBtn) prevBtn.addEventListener('click', () => scrollToPhoto(-1));
    });

    /* =============================================
       4. MODAL DE PAGAMENTO (BOTÃO PRINCIPAL DA HOME)
       ============================================= */
    const paymentModal = document.getElementById('payment-modal');
    const closeModalBtn = document.getElementById('close-payment-modal');

    if (paymentModal && closeModalBtn) {
        closeModalBtn.addEventListener('click', () => paymentModal.style.display = 'none');

        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) paymentModal.style.display = 'none';
        });
    }

    /* =============================================
       5. BOTÕES DE COMPRA – PRIORIDADE: STRIPE → TELEGRAM
       ============================================= */
    const priceButtons = document.querySelectorAll('.price-button, .buy-now-button, .buy-normal');
    const telegramUsername = 'yudmila1'; // Altere se necessário

    priceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (button.closest('.buy-now-container')) {
                e.preventDefault();
                if (paymentModal) paymentModal.style.display = 'flex';
                return;
            }

            e.preventDefault();

            try {
                const section = button.closest('.content-section');
                if (!section) throw new Error('Seção não encontrada');

                const pacoteElement = section.querySelector('[id^="pacote"]');
                if (!pacoteElement) throw new Error('Elemento do pacote não encontrado');

                const pacoteId = pacoteElement.id;
                const produto = produtos[pacoteId];

                if (!produto) throw new Error('Dados do produto não carregados');

                // Prioridade 1: Checkout direto (Stripe, etc.)
                if (produto.buyLink && produto.buyLink.startsWith('http')) {
                    window.location.href = produto.buyLink;
                    return;
                }

                // Prioridade 2: Mensagem automática no Telegram
                const message = encodeURIComponent(
                    `Hello! I would like to buy\n\n` +
                    `Content: ${produto.nome}\n` +
                    `Description:\n${produto.descricao.join('\n')}\n` +
                    `Price: $${produto.preco}`
                );

                window.location.href = `https://t.me/${telegramUsername}?text=${message}`;

            } catch (error) {
                console.error('Erro ao processar compra:', error);
                window.location.href = `https://t.me/${telegramUsername}`;
            }
        });
    });
});