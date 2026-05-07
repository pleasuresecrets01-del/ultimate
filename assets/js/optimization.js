document.addEventListener('DOMContentLoaded', function() {
    // Lazy loading para imagens
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Pré-carregamento de imagens críticas
    function preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[critical]');
        criticalImages.forEach(img => {
            if (img.dataset.src) {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'image';
                preloadLink.href = img.dataset.src;
                document.head.appendChild(preloadLink);
            }
        });
    }

    // Otimização de cache para imagens
    function setupImageCache() {
        if ('caches' in window) {
            caches.open('image-cache').then(cache => {
                document.querySelectorAll('img').forEach(img => {
                    const src = img.src || img.dataset.src;
                    if (src) {
                        cache.add(src).catch(() => {
                            console.log('Falha ao cachear: ' + src);
                        });
                    }
                });
            });
        }
    }

    // Compressão de imagens em tempo real (apenas para thumbnails)
    function createThumbnail(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 150; // Tamanho máximo do thumbnail

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (maxWidth * height) / width;
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        return canvas.toDataURL('image/webp', 0.8);
    }

    // Otimização de vídeos
    function optimizeVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.preload = 'metadata';
            video.setAttribute('loading', 'lazy');
            
            // Carrega o vídeo apenas quando estiver próximo da viewport
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.preload = 'auto';
                        videoObserver.unobserve(video);
                    }
                });
            }, { rootMargin: '50px' });
            
            videoObserver.observe(video);
        });
    }

    // Inicializa todas as otimizações
    preloadCriticalImages();
    setupImageCache();
    optimizeVideos();
});

// Sistema de Cache e Segurança integrado ao ImageOptimizer
const ImageOptimizer = {
    init() {
        this.setupLazyLoading();
        this.setupImageFormats();
        this.setupPreloading();
        this.setupCache();
        this.setupSecurity();
    },

    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    },

    async setupCache() {
        if ('caches' in window) {
            try {
                const cache = await caches.open('image-cache-v1');
                const resources = [
                    '/assets/css/style2.css',
                    '/assets/js/script2.js',
                    '/assets/js/optimization.js'
                ];
                
                // Adiciona recursos críticos ao cache
                await cache.addAll(resources);

                // Cache de imagens sob demanda
                document.querySelectorAll('img[data-src]').forEach(img => {
                    const src = img.dataset.src;
                    if (src) {
                        this.cacheResource(src);
                    }
                });
            } catch (error) {
                console.error('Erro ao configurar cache:', error);
            }
        }
    },

    async cacheResource(url) {
        try {
            const cache = await caches.open('image-cache-v1');
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
            }
        } catch (error) {
            console.error('Erro ao cachear recurso:', url, error);
        }
    },

    setupSecurity() {
        // Sanitização de URLs
        document.querySelectorAll('img[data-src]').forEach(img => {
            const src = img.dataset.src;
            if (src && !this.isValidImageUrl(src)) {
                console.error('URL de imagem inválida:', src);
                img.dataset.src = '';
            }
        });

        // Proteção contra XSS em atributos data-*
        document.querySelectorAll('[data-*]').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                    el.setAttribute(attr.name, this.sanitizeInput(attr.value));
                }
            });
        });

        // Configuração de Content Security Policy
        this.setupCSP();
    },

    isValidImageUrl(url) {
        try {
            const validUrl = new URL(url);
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            return validExtensions.some(ext => validUrl.pathname.toLowerCase().endsWith(ext));
        } catch {
            return false;
        }
    },

    sanitizeInput(input) {
        return input.replace(/[<>'"]/g, '');
    },

    setupCSP() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `
            default-src 'self';
            img-src 'self' data: https:;
            script-src 'self' https://cdnjs.cloudflare.com https://unpkg.com https://kit.fontawesome.com;
            style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline';
            font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
            connect-src 'self' https://t.me;
        `.replace(/\s+/g, ' ').trim();
        document.head.appendChild(meta);
    },

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Tenta carregar WebP primeiro
        this.supportsWebP()
            .then(supported => {
                if (supported && src.match(/\.(jpg|jpeg|png)$/)) {
                    img.src = src.replace(/\.[^/.]+$/, '.webp');
                } else {
                    img.src = src;
                }
            });
    },

    supportsWebP() {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        });
    }
};

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    ImageOptimizer.init();
});

// Sistema de Segurança Avançado
const SecuritySystem = {
    init() {
        this.preventDevTools();
        this.preventRightClick();
        this.preventSourceView();
        this.preventFraming();
        this.setupCSP();
        this.preventCodeInspection();
        this.monitorBehavior();
    },

    // Previne uso do DevTools
    preventDevTools() {
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
            }
        });
    },

    // Previne clique direito
    preventRightClick() {
        document.addEventListener('contextmenu', e => e.preventDefault());
    },

    // Previne visualização do código fonte
    preventSourceView() {
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'u') e.preventDefault();
        });
    },

    // Previne framing do site
    preventFraming() {
        if (window.self !== window.top) {
            window.top.location.href = window.self.location.href;
        }
    },

    // Configuração de Content Security Policy
    setupCSP() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `
            default-src 'self';
            img-src 'self' data: https:;
            script-src 'self' https://cdnjs.cloudflare.com https://unpkg.com https://kit.fontawesome.com;
            style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline';
            font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
            connect-src 'self' https://t.me;
        `.replace(/\s+/g, ' ').trim();
        document.head.appendChild(meta);
    },

    // Previne inspeção de código
    preventCodeInspection() {
        // Ofusca o código de forma mais suave
        const scripts = document.getElementsByTagName('script');
        Array.from(scripts).forEach(script => {
            if (!script.getAttribute('nonce')) {
                script.setAttribute('nonce', this.generateNonce());
            }
        });
    },

    // Monitora comportamento suspeito
    monitorBehavior() {
        let suspiciousActions = 0;
        const maxActions = 50; // Aumentado o limite
        
        document.addEventListener('copy', () => {
            suspiciousActions++;
            if (suspiciousActions > maxActions) {
                console.warn('Muitas ações suspeitas detectadas');
            }
        });
    },

    // Gera nonce único para scripts
    generateNonce() {
        return Math.random().toString(36).substring(2);
    }
};

// Inicializa o sistema de segurança
document.addEventListener('DOMContentLoaded', () => {
    SecuritySystem.init();
}); 