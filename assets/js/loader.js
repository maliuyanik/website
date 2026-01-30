document.addEventListener("DOMContentLoaded", function() {
    const basePath = window.siteBasePath || "";

    function loadComponent(placeholderId, componentPath) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return Promise.resolve();

        return fetch(basePath + componentPath)
            .then(response => {
                if (!response.ok) throw new Error(`${componentPath} yüklenemedi`);
                return response.text();
            })
            .then(html => {
                placeholder.innerHTML = html;
                
                // Linkleri ve Resimleri BasePath'e göre güncelle
                if (basePath) {
                    const links = placeholder.querySelectorAll("a");
                    links.forEach(link => {
                        const href = link.getAttribute("href");
                        if (href && !href.startsWith("http") && !href.startsWith("//") && !href.startsWith("#") && !href.startsWith("mailto")) {
                            link.setAttribute("href", basePath + href);
                        }
                    });

                    const images = placeholder.querySelectorAll("img");
                    images.forEach(img => {
                        const src = img.getAttribute("src");
                        if (src && !src.startsWith("http") && !src.startsWith("//")) {
                            img.setAttribute("src", basePath + src);
                        }
                    });
                }
            })
            .catch(error => console.error(error));
    }
    
    Promise.all([
        loadComponent("header-placeholder", "components/header.html"),
        loadComponent("footer-placeholder", "components/footer.html")
    ]).then(() => {
        // Tüm bileşenler yüklendiğinde script.js'in çalışması için event fırlat
        document.dispatchEvent(new Event("componentsLoaded"));
    });
});