var axios = require('axios');
var fs = require('fs');
var HTMLParser = require('node-html-parser');

let allFound = [];




for (let i = 1; i < 10; i++) { //how many pages to parse
    getAllHrefsPage(i)
}


async function getAllHrefsPage(page) {
    let res = await axios.get(`https://www.constructiondive.com/topic/multifamily/?page=${page}`)
    let root = HTMLParser.parse(res.data);
    let allImgs = root.querySelectorAll(".feed__image");
    let allTitles = root.querySelectorAll(".feed__title.feed__title--display");
    for (let i in allImgs) {
        await parsePage(`https://www.constructiondive.com${allImgs[i].getAttribute("href")}`, `https://www.constructiondive.com${allImgs[i].childNodes[1].getAttribute("src")}`, normalizeInnerText(allTitles[i].innerText))
    }
}


async function parsePage(link, image, title) {
    let res = await axios.get(link)
    let root = HTMLParser.parse(res.data);
    let text = normalizeInnerText(removeJSFunctions(root.querySelector(".large.medium.article-body").innerText))

    allFound.push({
        link,
        title,
        image,
        text
    })
    fs.writeFileSync("data.json", JSON.stringify(allFound))
}

function removeJSFunctions(str) {
    const functionRegex = /function\s*\w*\s*\([^)]*\)\s*{[^}]*}/g;
    const functionRege1 = /waitToLoadAds\.push\([\s\S]*?^\s*}\);\s*/gm;
    const functionRege2 = /}\);/g;
    const functionRege3 = /}/g;

    str = str.replace(functionRegex, '');
    str = str.replace(functionRege1, '');
    str = str.replace(functionRege2, '');
    str = str.replace(functionRege3, '');
    return str
}

function normalizeInnerText(text) {
    var normalizedText = text.replace(/\n+/g, '\n').trim();
    var lines = normalizedText.split('\n');
    var filteredLines = lines.filter(function (line) {
        return line.trim() !== '';
    });
    var result = filteredLines.join(' ');
    return result;
}




