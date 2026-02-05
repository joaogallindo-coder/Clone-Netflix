function aba(){
    alert("Essa aba não está disponível!");
}

/* === CONFIGURAÇÃO SEGURA === */
// Insira sua API Key aqui. Nenhuma input de usuário é gerado neste código.
const API_KEY = '0a175c1a1b1940d68254d69f11760b67'; 
const API_BASE = 'https://api.themoviedb.org/3';
const LANGUAGE = 'pt-BR';

/* Fetch Helper */
const basicFetch = async (endpoint) => {
    try {
        const req = await fetch(`${API_BASE}${endpoint}`);
        if (!req.ok) throw new Error('Erro ao conectar com API');
        return await req.json();
    } catch (error) {
        console.error("Erro:", error);
        return null;
    }
}

/* Definição de Categorias Estáticas */
const getHomeList = async () => {
    return [
        {
            slug: 'originals',
            title: 'Originais do Netflix',
            items: await basicFetch(`/discover/tv?with_network=213&language=${LANGUAGE}&api_key=${API_KEY}`)
        },
        {
            slug: 'trending',
            title: 'Recomendados para Você',
            items: await basicFetch(`/trending/all/week?language=${LANGUAGE}&api_key=${API_KEY}`)
        },
        {
            slug: 'toprated',
            title: 'Em Alta',
            items: await basicFetch(`/movie/top_rated?language=${LANGUAGE}&api_key=${API_KEY}`)
        },
        {
            slug: 'action',
            title: 'Top Ação',
            items: await basicFetch(`/discover/movie?with_genres=28&language=${LANGUAGE}&api_key=${API_KEY}`)
        },
        {
            slug: 'comedy',
            title: 'Top Comédia',
            items: await basicFetch(`/discover/movie?with_genres=35&language=${LANGUAGE}&api_key=${API_KEY}`)
        },
        {
            slug: 'drama',
            title: 'Top Drama',
            items: await basicFetch(`/discover/movie?with_genres=18&language=${LANGUAGE}&api_key=${API_KEY}`)
        }
    ];
}

/* Renderização do Destaque (Hero) */
const renderFeatured = async (items) => {
    if (!items || !items.results || items.results.length === 0) return;

    let randomChosen = Math.floor(Math.random() * (items.results.length - 1));
    let chosen = items.results[randomChosen];
    let chosenInfo = await basicFetch(`/tv/${chosen.id}?language=${LANGUAGE}&api_key=${API_KEY}`);

    if (!chosenInfo) return;

    let description = chosenInfo.overview;
    if (description.length > 200) {
        description = description.substring(0, 200) + '...';
    }

    // Injeção de dados em elementos estáticos (H2, SPAN, P)
    document.getElementById('featured').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${chosenInfo.backdrop_path})`;
    document.getElementById('featured-title').innerText = chosenInfo.name; // Vai para o H2
    document.getElementById('featured-score').innerText = `${chosenInfo.vote_average.toFixed(1)} pontos`; // Vai para o SPAN
    
    let year = new Date(chosenInfo.first_air_date).getFullYear();
    document.getElementById('featured-year').innerText = year; // Vai para o SPAN
    document.getElementById('featured-desc').innerText = description || "Descrição indisponível."; // Vai para o P
}

/* Drag-to-Scroll Lógica */
const enableDragScrolling = () => {
    const sliders = document.querySelectorAll('.movieRow--listarea');
    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; 
            slider.scrollLeft = scrollLeft - walk;
        });
    });
}

/* Inicialização */
const loadAll = async () => {
    const list = await getHomeList();
    
    let originals = list.filter(i => i.slug === 'originals');
    if(originals.length > 0) {
        await renderFeatured(originals[0].items);
    }

    const listArea = document.getElementById('lists');
    let html = '';

    for(let i in list) {
        let results = list[i].items ? list[i].items.results : [];
        if(results.length > 0) {
            // Estrutura semântica: Section > H2 > Divs
            html += `
                <section class="movieRow">
                    <h2>${list[i].title}</h2>
                    <div class="movieRow--listarea">
                        <div class="movieRow--list">
            `;
            
            results.forEach(item => {
                if(item.poster_path) {
                    let title = item.title || item.name;
                    // Imagem puramente visual, sem inputs associados
                    html += `
                        <div class="movieRow--item">
                            <img src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${title}" loading="lazy" />
                        </div>
                    `;
                }
            });

            html += `
                        </div>
                    </div>
                </section>
            `;
        }
    }

    listArea.innerHTML = html;
    enableDragScrolling();
}

loadAll();

window.addEventListener('scroll', () => {
    if(window.scrollY > 10) {
        document.getElementById('navbar').classList.add('black');
    } else {
        document.getElementById('navbar').classList.remove('black');
    }
});
