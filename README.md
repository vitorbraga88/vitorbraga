# Vitor Braga — Landing Page Pessoal

Landing page de apresentação pessoal. Stack: **HTML5 + CSS3 + JavaScript puro** (sem build, sem dependências).

## Rodar localmente

Qualquer servidor HTTP serve — o mais simples:

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Abra `http://localhost:8000` no navegador. O `index.html` também abre direto via `file://`, mas lazy loading de imagens pode se comportar diferente em alguns navegadores.

## Estrutura

```
/
├── index.html
├── css/style.css
├── js/main.js
├── assets/
│   ├── icons/          SVGs do LinkedIn e Instagram
│   └── memorias/
│       ├── perfil.jpg
│       ├── memoria_001.jpg ... memoria_062.jpg
│       └── thumbnails/
│           └── memoria_001.jpg ... memoria_062.jpg
└── README.md
```

## Adicionar as fotos

As fotos ficam no servidor em `/opt/data/memorias-page/`. Copie para `assets/memorias/`:

```bash
# Do servidor para o PC local
scp -r vitorbraga@<IP_DO_SERVIDOR>:/opt/data/memorias-page/ ./memorias-page/

# Mova para o lugar certo
mv memorias-page/perfil.jpg assets/memorias/
mv memorias-page/memoria_*.jpg assets/memorias/
mv memorias-page/thumbnails/ assets/memorias/
```

Nomes esperados: `memoria_001.jpg` até `memoria_062.jpg` (zero-padded, 3 dígitos) e `thumbnails/memoria_001.jpg` etc. Thumbnails recomendados: 200×200 px para carregamento rápido.

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "feat: landing page pessoal Vitor Braga"
git branch -M main
git remote add origin https://github.com/<SEU_USUARIO>/<SEU_REPO>.git
git push -u origin main
```

No GitHub: **Settings → Pages → Source: branch `main` / pasta `/ (root)`** → Save.

A URL será:
- Repo `<usuario>.github.io` → `https://<usuario>.github.io/`
- Outro repo → `https://<usuario>.github.io/<nome-do-repo>/`

> Se usar sub-path (ex.: `/meu-site/`), os links de `assets/` continuam funcionando pois são relativos.
