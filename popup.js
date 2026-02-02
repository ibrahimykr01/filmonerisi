const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ODM2MTllYjk1MmVlMzgzY2I1NGM4NjhhODk2Mjk5OSIsIm5iZiI6MTYyOTA5ODgyMC4zMTIsInN1YiI6IjYxMWExMzQ0ODdmM2YyMDA0NTRiY2M0NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xHFd7LN8DR6x2Zl-yvGeBAtzELqRKbCnP3cgNDtdXRU'; 
let currentMovie = null;
const headers = { accept: 'application/json', Authorization: `Bearer ${API_TOKEN}` };

async function fetchMovie() {
    document.getElementById('suggest-btn').innerText = "Aranıyor...";
    const randomPage = Math.floor(Math.random() * 500) + 1;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?language=tr-TR&page=${randomPage}`, { headers });
        const data = await response.json();
        currentMovie = data.results[Math.floor(Math.random() * data.results.length)];
        const rating = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : "0";

        document.getElementById('movie-title').innerHTML = `${currentMovie.title} <span style="color:#f1c40f;">⭐${rating}</span>`;
        document.getElementById('movie-overview').innerText = currentMovie.overview || "Özet yok.";
        document.getElementById('movie-poster').src = `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`;
        document.getElementById('movie-card').style.display = 'block';
        document.getElementById('suggest-btn').innerText = "Başka Bir Tane Bul";
    } catch (err) { alert("Bağlantı Hatası!"); }
}

document.getElementById('trailer-btn').onclick = async () => {
    let res = await fetch(`https://api.themoviedb.org/3/movie/${currentMovie.id}/videos`, { headers });
    let data = await res.json();
    let trailer = data.results.find(v => v.type === 'Trailer');
    if (trailer) window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    else alert("Fragman bulunamadı.");
};

document.getElementById('wa-share').onclick = () => {
    const text = `🎬 *${currentMovie.title}* (⭐${currentMovie.vote_average.toFixed(1)})\n📝 ${currentMovie.overview}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
};

document.getElementById('tw-share').onclick = () => {
    window.open(`https://twitter.com/intent/tweet?text=Önerim: ${currentMovie.title}`, '_blank');
};

document.getElementById('copy-share').onclick = () => {
    navigator.clipboard.writeText(`${currentMovie.title} - Özet: ${currentMovie.overview}`);
    alert("Kopyalandı!");
};

document.getElementById('fav-btn').onclick = () => {
    chrome.storage.local.get({favs: []}, (res) => {
        let favs = res.favs;
        if (!favs.some(f => f.id === currentMovie.id)) {
            favs.push({id: currentMovie.id, title: currentMovie.title, score: currentMovie.vote_average.toFixed(1)});
            chrome.storage.local.set({favs}, () => { alert("Kaydedildi!"); updateFavList(); });
        }
    });
};

function updateFavList() {
    chrome.storage.local.get({favs: []}, (res) => {
        const container = document.getElementById('fav-container');
        container.innerHTML = '<strong>Favorilerim:</strong>';
        res.favs.forEach((f, index) => {
            container.innerHTML += `<div class="fav-item"><span>${f.title} (⭐${f.score})</span> <span style="cursor:pointer; color:red" onclick="deleteFav(${index})">✖</span></div>`;
        });
    });
}

window.deleteFav = (idx) => {
    chrome.storage.local.get({favs: []}, (res) => {
        res.favs.splice(idx, 1);
        chrome.storage.local.set({favs: res.favs}, updateFavList);
    });
};

document.getElementById('toggle-favs').onclick = () => {
    const c = document.getElementById('fav-container');
    c.style.display = c.style.display === 'block' ? 'none' : 'block';
    if(c.style.display === 'block') updateFavList();
};

document.querySelectorAll('.dot').forEach(dot => {
    dot.onclick = () => {
        const color = dot.getAttribute('data-color');
        document.documentElement.style.setProperty('--main-bg', color);
        localStorage.setItem('themeColor', color);
    };
});

document.getElementById('suggest-btn').onclick = fetchMovie;
const savedColor = localStorage.getItem('themeColor');
if (savedColor) document.documentElement.style.setProperty('--main-bg', savedColor);