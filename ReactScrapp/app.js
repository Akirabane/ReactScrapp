// Require puppeteer (npm install puppeteer) -> API qui créer un navigateur chromium pour le webscrapping
const puppeteer = require('puppeteer');
//fs (FileSystem) est nécéssaire à la rédactrion JSON
const fs = require('fs');
// require prompt pour les input de console VSCode / serveur
// Si vous avez pas prompt -> npm install prompt
const prompt = require('prompt');

// On démarre l'app en NodeJS (npmp start)
prompt.start();

//informations
console.log("Pour le choix du site écrivez -> Cinema (c'est le seul choix possible pour le moment)");
console.log("JSON_Name -> nom du fichier JSON à la sortie");
console.log("Year = année de sortie des filmes (choisissez en 2011 et 2021)");
console.log("Month -> Mois de sortie, de janvier (01) à Décembre (12)");

//Choix de l'utilisateur
console.log("Case 1 : Cinema");

//L'app se charge de prendre les infos du site.
prompt.get(['site'], function (err, result) {
    const Site = result.site;
    switch (Site) {
        // Choix des case, dans ce cas "Cinema" car seul case existance, pas de défault.
        // Cinema = site de sortie des filmes, permettant à l'app de vous dire quels filmes sortiront prochainement.
        case "Cinema":
            prompt.get(['JSON_Name', 'year', 'month'], function (err, result) {
                if (err) { return onErr(err); }
                    (async() => {
                        // puppetter.launch = création d'un webbrowser géré automatiquement par du code.
                        const browser = await puppeteer.launch({headless: true}); // Bool | False = pupeteer créer un PID port 8080 : XXXX_8080 | True = puppeteer créer un PID non-local port sécurisé : entity real (443)
                        const page = await browser.newPage();
                        // lien du site à scrapper
                        await page.goto( `https://www.imdb.com/movies-coming-soon/` + result.year + `-` + result.month); //result year et month = date de sortie des films année et mois
                        // page.evaluate = on récupère le HTML de la page, on peut ensuite récupérer des infos en fonction des divs, td, tr etc...  #WebScrapping
                        const movies = await page.evaluate(() => {
                            let movies = [];
                            let elements = document.querySelectorAll('div.list_item');
                            for (element of elements) {
                                // je push dans un array 'movies = []' (ci-dessus) les infos intéréssantes et je les garde en objet type JSON -> [{ 'Objet 1' => 'Valeur', 'Objet 2' => 'Valeur', etc...}]
                                movies.push({
                                    title: element.querySelector('td.overview-top a')?.text.trim(),
                                    time: element.querySelector('p.cert-runtime-genre time')?.textContent,
                                    description: element.querySelector('div.outline')?.textContent.trim(),
                                    img: element.querySelector('img.poster')?.src
                                })
                            }
                            //on retourne les données
                            return movies;
                        });
                        //On transforme les données en strings et en objet plus lisibles avec .stringify et '\t'
                        const data = JSON.stringify(movies, null, '\t');
                        const JSON_Name = result.JSON_Name;
                        //fileSystem se charge de créer le fichier à la racine de l'app
                        fs.writeFile(JSON_Name + `.json`, data, (err) => {
                            if (err) {
                                throw err;
                            }
                        });
                        //débug
                        console.log(JSON_Name + `.json créé.`);
                        console.log("'C'est pas bien de scrap, mais c'est cool d'avoir des données - Mark Zückerberg, 2021 (Meta STD.)'")
                        await browser.close();
                    })();
            });
            //on sort de la case cinema
            break;
            //pas de défaut
        default:
            console.log("Aucun choix par défault");
            return 0;
    }
});

//débug
function onErr(err) {
    console.log(err);
    return 1;
}