document.addEventListener('componentsLoaded', () => {
    
    // --- Initialize AOS (Animate On Scroll) ---
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // --- Language State ---
    let currentLang = 'tr';
    let allData = {};

    // Base Path Kontrolü (Alt klasörler için)
    const basePath = window.siteBasePath || '';

    // --- Favicon Update ---
    // Web site başlığının solundaki simgeyi (Favicon) favicon.ico olarak ayarla
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.href = basePath + 'assets/images/icons/favicon.ico';

    // --- Data Fetching (Simulating API Call) ---
    fetch(basePath + 'data/data.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            renderPage(allData[currentLang]);
        })
        .catch(error => console.error('Veri yüklenirken hata oluştu:', error));

    // --- Language Switching Logic ---
    const langLinks = document.querySelectorAll('.lang-link');
    const currentLangText = document.getElementById('current-lang-text');
    
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = link.getAttribute('data-lang');
            
            if (selectedLang !== currentLang) {
                currentLang = selectedLang;
                
                // Update UI text
                if (currentLangText) {
                    // Masaüstü menüsündeki ilgili dil linkini bul (Tam adını almak için: Türkçe, English vb.)
                    const desktopLink = document.querySelector(`.lang-link:not(.mobile-lang-link)[data-lang="${selectedLang}"]`);
                    currentLangText.innerText = desktopLink ? desktopLink.innerText.trim() : link.innerText.trim();
                }

                // Update Mobile Links Visuals
                const mobileLinks = document.querySelectorAll('.mobile-lang-link');
                mobileLinks.forEach(l => {
                    if (l.getAttribute('data-lang') === currentLang) {
                        l.classList.add('font-bold', 'text-white');
                        l.classList.remove('text-white/70', 'font-medium');
                    } else {
                        l.classList.add('text-white/70', 'font-medium');
                        l.classList.remove('font-bold', 'text-white');
                    }
                });

                // Re-render page
                renderPage(allData[currentLang]);
            }
        });
    });

    // --- Render Functions ---
    function renderPage(data) {
        renderMenu(data.menu);
        
        // Sadece element varsa çalıştır (Sayfa kontrolü)
        if (document.getElementById('hero-section')) {
            renderHero(data.hero);
        }
        if (document.getElementById('difference-container')) {
            renderDifference(data.difference);
        }
        if (document.getElementById('product-grid')) {
            // Varsayılan dil yedeği (tr varsa onu kullan, yoksa boş)
            const fallbackProducts = allData['tr'] ? allData['tr'].products : [];
            renderProducts(data.products.length > 0 ? data.products : fallbackProducts);
        }
        if (document.getElementById('about-content')) {
            renderAbout(data.about);
            // About sayfası başlığını güncelle
            const pageTitle = document.getElementById('page-title');
            if(pageTitle) {
                // Menüden "Hakkımızda" başlığını dinamik bul
                let aboutTitle = null;
                data.menu.some(m => {
                    if(m.link === 'corporate/about') { aboutTitle = m.title; return true; }
                    if(m.items) {
                        const sub = m.items.find(i => i.link === 'corporate/about');
                        if(sub) { aboutTitle = sub.title; return true; }
                    }
                });
                pageTitle.innerText = aboutTitle || (currentLang === 'tr' ? 'Hakkımızda' : 'About Us');
            }
        }
        if (document.getElementById('projects-grid')) {
            renderProjectsPage(data.projectsPage);
        }
        if (document.getElementById('contact-container')) {
            renderContactPage(data.contactPage);
        }
        
        // Static Text Updates
        const pTitle = document.getElementById('products-title');
        if (pTitle) pTitle.innerText = data.productsSection.title;
        const pDesc = document.getElementById('products-desc');
        if (pDesc) pDesc.innerText = data.productsSection.desc;
        
        updateFooterContent(data.footer);
        renderCookieBanner(data.cookieConsent);
    }

    function renderMenu(menuItems) {
        const overlayMenuList = document.getElementById('overlay-menu-list');
        
        // Drill-down menü mantığı (Seviyeli geçiş)
        const renderLevel = (items, backCallback = null, direction = 'init') => {
            
            const fillContent = () => {
                overlayMenuList.innerHTML = ''; // Mevcut listeyi temizle
                
                // Geri Butonu (Eğer bir alt menüdeysek)
                if (backCallback) {
                    const backLi = document.createElement('li');
                    backLi.className = 'w-full flex justify-start mb-4 border-b border-white/10 pb-2';
                    backLi.innerHTML = `
                        <button class="flex items-center gap-2 text-white/70 hover:text-accent-500 transition-colors group">
                            <i class="fa-solid fa-chevron-left text-xs group-hover:-translate-x-1 transition-transform"></i>
                            <span class="text-sm font-medium tracking-wide uppercase">${allData[currentLang].back || 'Back'}</span>
                        </button>
                    `;
                    backLi.addEventListener('click', (e) => {
                        e.stopPropagation();
                        backCallback(); // Bir üst seviyeye dön
                    });
                    overlayMenuList.appendChild(backLi);
                }

                // Menü Elemanlarını Listele
                items.forEach(item => {

                    const li = document.createElement('li');
                    li.className = 'w-full';
                    
                    // Standart stil (Tüm seviyeler için okunaklı font)
                    const fontSize = 'text-base md:text-lg';
                    const fontWeight = 'font-semibold';
                    const textColor = 'text-white';

                    if (item.items && item.items.length > 0) {
                        // Alt menüsü olan eleman -> Tıklayınca içeri girer
                        li.innerHTML = `
                            <div class="flex justify-center items-center gap-3 cursor-pointer group py-2 transition-colors duration-300">
                                <!-- Denge için hayalet ikon -->
                                <i class="fa-solid fa-chevron-right text-[10px] opacity-0"></i>
                                <span class="menu-title ${fontSize} ${fontWeight} ${textColor} group-hover:text-accent-500 transition-colors tracking-wide">${item.title}</span>
                                <i class="fa-solid fa-chevron-right text-white/50 text-[10px] group-hover:text-accent-500 transition-transform duration-300"></i>
                            </div>
                        `;
                        
                        li.addEventListener('click', (e) => {
                            e.stopPropagation();
                            // Alt menüye gir, geri dönüldüğünde şu anki listeyi (items) tekrar göster
                            renderLevel(item.items, () => renderLevel(items, backCallback, 'backward'), 'forward');
                        });
                    } else {
                        // Normal Link
                        let linkUrl = item.link || '#';
                        // Eğer link http ile başlamıyorsa ve # değilse base path ekle
                        if (linkUrl !== '#' && !linkUrl.startsWith('http') && !linkUrl.startsWith('//')) linkUrl = basePath + linkUrl;

                        li.innerHTML = `
                            <a href="${linkUrl}" class="flex justify-center items-center py-2 hover:text-accent-500 transition-colors ${fontSize} ${fontWeight} ${textColor} tracking-wide">
                                ${item.title}
                            </a>
                        `;
                    }
                    overlayMenuList.appendChild(li);
                });

                // Giriş Animasyonu (Staggered Fade In & Slide)
                Array.from(overlayMenuList.children).forEach((child, index) => {
                    child.style.opacity = '0';
                    child.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'; // Daha yumuşak "page" hissi
                    
                    // Yöne göre başlangıç pozisyonu (Daha geniş hareket)
                    if (direction === 'forward') child.style.transform = 'translateX(100px)';
                    else if (direction === 'backward') child.style.transform = 'translateX(-100px)';
                    else child.style.transform = 'translateY(20px)';

                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translate(0)';
                        }, 50 + (index * 5)); // Stagger azaltıldı, blok halinde hareket
                    });
                });
            };

            // Çıkış Animasyonu (Eğer başlangıç değilse)
            if (direction !== 'init' && overlayMenuList.children.length > 0) {
                Array.from(overlayMenuList.children).forEach(child => {
                    child.style.transition = 'all 0.2s ease-in';
                    child.style.opacity = '0';
                    // İleri gidiyorsak sola, geri gidiyorsak sağa kaybol
                    child.style.transform = direction === 'forward' ? 'translateX(-100px)' : 'translateX(100px)';
                });
                // Animasyon bitince içeriği doldur
                setTimeout(fillContent, 200);
            } else {
                fillContent();
            }
        };

        // İlk açılışta ana menüyü göster
        renderLevel(menuItems);
    }

    function renderHero(heroData) {
        const heroSection = document.getElementById('hero-section');
        
        // Video varsa video, yoksa görsel kullan
        let backgroundHTML = '';
        if (heroData.video) {
            backgroundHTML = `
                <video autoplay loop muted playsinline poster="${basePath + heroData.bgImage}" class="absolute inset-0 w-full h-full object-cover z-0">
                    <source src="${basePath + heroData.video}">
                </video>
                <div class="absolute inset-0 bg-black/20 z-0"></div>
            `;
        } else {
            heroSection.style.backgroundImage = `url('${basePath + heroData.bgImage}')`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
            backgroundHTML = `<div class="absolute inset-0 bg-primary/60"></div>`;
        }

        heroSection.innerHTML = `
            ${backgroundHTML}
            <div class="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                <a href="#difference-section" class="text-white/90 hover:text-accent-500 transition-colors duration-300 block" aria-label="Aşağı Kaydır">
                    <i class="fa-solid fa-chevron-down text-5xl drop-shadow-lg"></i>
                </a>
            </div>
        `;
    }

    function renderDifference(diffData) {
        const container = document.getElementById('difference-container');
        
        let html = `
            <div class="text-center mb-20" data-aos="fade-up">
                <h2 class="text-4xl md:text-5xl font-extrabold text-primary mb-6 tracking-tight relative inline-block">
                    ${diffData.title}
                    <span class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-accent-500 rounded-full"></span>
                </h2>
                <p class="text-xl text-gray-600 font-medium max-w-3xl mx-auto mt-8">${diffData.subtitle}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                ${diffData.features.map((item, index) => `
                    <div class="group relative bg-white p-10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 border border-gray-100 hover:border-accent-500/30 hover:-translate-y-2 overflow-hidden" data-aos="fade-up" data-aos-delay="${index * 150}">
                        <!-- Decorative Background Element -->
                        <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent-500/10 to-transparent rounded-bl-[100px] -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12"></div>
                        
                        <div class="relative z-10">
                            <div class="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-8 text-accent-500 group-hover:bg-accent-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                <i class="fa-solid ${item.icon} text-3xl"></i>
                            </div>
                            
                            <h3 class="text-2xl font-bold text-primary mb-4 group-hover:text-accent-600 transition-colors duration-300">${item.title}</h3>
                            <p class="text-gray-600 leading-relaxed group-hover:text-gray-700">${item.desc}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = html;
    }

    function renderProducts(productsData) {
        const grid = document.getElementById('product-grid');
        grid.innerHTML = productsData.map(product => `
            <div class="product-card-container group" data-aos="fade-up">
                <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                    <div class="h-48 overflow-hidden relative">
                        <img src="${basePath + product.image}" alt="${product.title}" loading="lazy" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                    </div>
                    <div class="p-6 card-content flex-grow flex flex-col justify-between">
                        <div>
                            <h3 class="text-xl font-bold text-primary mb-2">${product.title}</h3>
                            <p class="text-gray-600 text-sm mb-4">${product.desc}</p>
                        </div>
                        <a href="#" class="text-accent-500 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                            Detayları İncele <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function renderAbout(aboutData) {
        const contentContainer = document.getElementById('about-content');
        const imageEl = document.getElementById('about-image');
        const statsContainer = document.getElementById('about-stats');

        if (contentContainer) {
            contentContainer.innerHTML = `
                <h2 class="text-3xl md:text-4xl font-bold text-primary mb-6">${aboutData.title}</h2>
                <h3 class="text-xl text-accent-500 font-medium mb-6">${aboutData.subtitle}</h3>
                <div class="text-gray-600 leading-relaxed space-y-4">
                    ${aboutData.content}
                </div>
            `;
        }
        if (imageEl) imageEl.src = basePath + aboutData.image;
        if (statsContainer) {
            statsContainer.innerHTML = aboutData.stats.map(stat => `
                <div class="text-center">
                    <div class="text-2xl md:text-3xl font-bold text-primary">${stat.value}</div>
                    <div class="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider">${stat.label}</div>
                </div>
            `).join('');
        }
    }

    function renderProjectsPage(data) {
        const grid = document.getElementById('projects-grid');
        const title = document.getElementById('page-title');
        const desc = document.getElementById('page-desc');
        
        if(title) title.innerText = data.title;
        if(desc) desc.innerText = data.description;
        
        if(grid) {
            grid.innerHTML = data.items.map(item => `
                <div class="group relative overflow-hidden rounded-xl shadow-lg" data-aos="fade-up">
                    <img src="${basePath + item.image}" alt="${item.title}" class="w-full h-64 object-cover transition duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                        <span class="text-accent-500 text-xs font-bold uppercase tracking-wider mb-1">${item.category}</span>
                        <h3 class="text-white text-xl font-bold">${item.title}</h3>
                        <p class="text-white/70 text-sm"><i class="fa-solid fa-location-dot mr-1"></i> ${item.location}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    function renderContactPage(data) {
        const title = document.getElementById('page-title');
        const desc = document.getElementById('page-desc');
        const address = document.getElementById('contact-address');
        const phone = document.getElementById('contact-phone');
        const email = document.getElementById('contact-email');
        const map = document.getElementById('contact-map');

        if(title) title.innerText = data.title;
        if(desc) desc.innerText = data.description;
        if(address) address.innerText = data.address;
        if(phone) phone.innerText = data.phone;
        if(email) email.innerText = data.email;
        if(map) map.src = data.mapUrl;
    }

    function updateFooterContent(footerData) {
        // 1. Linkleri Oluştur
        const linksGrid = document.getElementById('footer-links-grid');
        if (linksGrid && footerData.links) {
            linksGrid.innerHTML = footerData.links.map(column => `
                <div>
                    <h3 class="footer-heading">${column.title}</h3>
                    <ul class="footer-list">
                        ${column.items.map(item => {
                            // Link kontrolü ve basePath ekleme
                            let linkUrl = item.link || '#';
                            if (linkUrl !== '#' && !linkUrl.startsWith('http') && !linkUrl.startsWith('//') && !linkUrl.startsWith('mailto')) {
                                linkUrl = basePath + linkUrl;
                            }
                            return `<li><a href="${linkUrl}">${item.title}</a></li>`;
                        }).join('')}
                    </ul>
                </div>
            `).join('');
        }

        // 2. Statik Metinleri Güncelle
        const contactTitle = document.getElementById('footer-contact-title');
        const contactLabel = document.getElementById('footer-contact-label');
        const newsTitle = document.getElementById('footer-newsletter-title');
        const newsInput = document.getElementById('footer-newsletter-input');
        const newsBtn = document.getElementById('footer-newsletter-btn');
        const copyright = document.getElementById('footer-copyright');

        if (contactTitle) contactTitle.innerText = footerData.contactBox.title;
        if (contactLabel) contactLabel.innerText = footerData.contactBox.label;
        if (newsTitle) newsTitle.innerText = footerData.newsletter.title;
        if (newsInput) newsInput.placeholder = footerData.newsletter.placeholder;
        if (newsBtn) newsBtn.innerText = footerData.newsletter.button;
        if (copyright) copyright.innerHTML = `<p>+90 262 000 00 00 | Fax: +90 262 000 00 01</p><p>Gebze OSB, Teknoloji Bulvarı No:1, 41400 Kocaeli, Türkiye</p><div class="mt-2 pt-2 border-t border-white/10">${footerData.copyright}</div>`;
    }

    // --- Sticky Header Efekti ---
    const header = document.getElementById('main-header');
    const logoContainer = document.querySelector('.logo-text');
    const langSelector = document.getElementById('lang-toggle');
    const menuBtn = document.getElementById('menu-toggle-btn');
    
    let isScrolling = false;

    function handleScroll() {
        if (window.scrollY > 50) {
            // Scrolled State (Small & Orange)
            header.classList.add('bg-[#ff6b00]', 'shadow-md', 'py-2');
            header.classList.remove('bg-gradient-to-b', 'from-black/60', 'to-transparent', 'py-8');
            
            if(logoContainer) {
                logoContainer.classList.remove('h-20', 'h-24');
                logoContainer.classList.add('h-16');
            }
            if(langSelector) {
                langSelector.classList.replace('text-lg', 'text-sm');
            }
            if(menuBtn) {
                menuBtn.classList.replace('text-4xl', 'text-2xl');
            }
        } else {
            // Initial State (Large & Transparent)
            header.classList.remove('bg-[#ff6b00]', 'shadow-md', 'py-2');
            header.classList.add('bg-gradient-to-b', 'from-black/60', 'to-transparent', 'py-8');
            
            if(logoContainer) {
                logoContainer.classList.remove('h-12', 'h-16');
                logoContainer.classList.add('h-24');
            }
            if(langSelector) {
                langSelector.classList.replace('text-sm', 'text-lg');
            }
            if(menuBtn) {
                menuBtn.classList.replace('text-2xl', 'text-4xl');
            }
        }
        isScrolling = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(handleScroll);
            isScrolling = true;
        }
    });

    // --- Overlay Menü Toggle ---
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const overlayMenu = document.getElementById('overlay-menu');
    const menuBackdrop = document.getElementById('menu-backdrop');
    const menuSidebar = document.getElementById('menu-sidebar');
    const closeMenuBtn = document.getElementById('close-menu-btn');

    function openMenu() {
        // Menüyü her açılışta sıfırla (En baştan başlat)
        if (allData[currentLang] && allData[currentLang].menu) {
            renderMenu(allData[currentLang].menu);
        }

        overlayMenu.classList.remove('invisible');
        menuBackdrop.classList.remove('opacity-0');
        menuSidebar.classList.remove('translate-x-full');
    }

    function closeMenu() {
        menuBackdrop.classList.add('opacity-0');
        menuSidebar.classList.add('translate-x-full');
        setTimeout(() => overlayMenu.classList.add('invisible'), 300);
    }

    menuToggleBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    menuBackdrop.addEventListener('click', closeMenu);

    // --- Cookie Consent Logic ---
    function renderCookieBanner(cookieData) {
        const banner = document.getElementById('cookie-banner');
        const text = document.getElementById('cookie-text');
        const btn = document.getElementById('cookie-accept');
        
        // Kullanıcı daha önce kabul ettiyse gösterme
        if (localStorage.getItem('cookieConsent') === 'true') {
            return;
        }

        // İçeriği güncelle
        text.innerText = cookieData.text;
        btn.innerText = cookieData.accept;

        // Banner'ı göster
        banner.classList.remove('hidden');
        // Animasyon için küçük bir gecikme
        setTimeout(() => banner.classList.remove('translate-y-full'), 100);

        btn.onclick = () => {
            localStorage.setItem('cookieConsent', 'true');
            banner.classList.add('translate-y-full');
            setTimeout(() => banner.classList.add('hidden'), 500);
        };
    }

});
