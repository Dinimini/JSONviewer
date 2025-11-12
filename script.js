let url = 'https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/all';
let apiKey = '';
let mainJson = {};
let sequentialId = 0;
let lineheight = 20;
let displacement = 20;
const backgroundColors = ['#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFF9C4', '#FFECB3', '#FFE0B2', '#FFCCBC'];

function createHtmlElement({ tag, content = '', parent = null, classes = [], id = '', attributes = {} }) {
    if (!tag || typeof tag !== 'string') {
        throw new Error('The "tag" parameter must be a non-empty string.');
    }

    const element = document.createElement(tag);

    if (content) {
        element.innerText = content;
    }
    
    if (Array.isArray(classes) && classes.length > 0) {
        element.classList.add(...classes);
    }

    if (id) {
        element.id = id;
    }

    if (typeof attributes === 'object' && attributes !== null) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    
    if (parent instanceof HTMLElement) {
        parent.appendChild(element);
    } else if (parent !== null) {
        console.warn('The "parent" parameter is not a valid HTMLElement. Skipping append.');
    }

    return element;
}

function findById(id) {
    return document.getElementById(id);
}

async function onButtonClick() {
    findById("displayContainer").innerHTML = '';
    await fetchJsonData(url, apiKey);
    displayJsonData(findById("displayContainer"), mainJson);
}

function buildEditorDiv() {
    const editorDiv = createHtmlElement({
        tag: 'div',
        id: 'editorDiv'
    })
    editorDiv.innerHTML = `
    <form class="fetchDataForm">
        <label for="url">Write your url here!:</label>
        <input type="text" id="url" name="url">
        <label for="fname">Paste your key here if you have any!</label>
        <input type="text" id="key" name="key">
        <button type="button" id="closeWeatherBtn">Close</button>
    </form>
  `
    return editorDiv
}

function createQuizDiv() {
    const quizDiv = createHtmlElement({
        tag: 'div',
        id: 'quizrDiv'
    })
    quizDiv.innerHTML = `
  <form class="fetchDataForm">
    <label for="url">Write your url here!:</label>
    <input type="text" id="url" name="url">
    <label for="fname">Paste your key here if you have any!</label>
    <input type="text" id="key" name="key">
    <button type="button" id="closeWeatherBtn">Close</button>
  </form>
`
    return quizDiv
}

async function fetchJsonData(url, apiKey) {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        mainJson = data;
        return data;
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        return null;
    }
}

function buildLayout() {
    
    const root = findById('root');
    const quiz = createHtmlElement({ tag: "div", parent: root, id: "quizContainer", classes: ["vertical"] });
    buildSpacer(quiz);
    createHtmlElement({ tag: "div", parent: root, id: "displayContainer", classes: ["vertical"] });
    findById("quizContainer").appendChild(createQuizDiv());
    findById("url").addEventListener("change", (event) => {
        url = event.target.value;
    });
    findById("key").addEventListener("change", (event) => {
        apiKey = event.target.value;
    });
    findById("closeWeatherBtn").addEventListener("click", () => {
        fetchJsonData(url, apiKey);
    });
    findById("closeWeatherBtn").addEventListener("click", onButtonClick);
}

function clearDisplay(id) {
    findById(id).innerHTML = '';
}

function buildSpacer(parent){
    let container = parent.appendChild(createHtmlElement({ tag: 'div', classes: ['spacerPixel'], id: `spacerContainer` }) );
    container.addEventListener('click', (event) => {
        displacement = event.offsetX;
        lineheight = event.offsetY;
        clearDisplay("displayContainer");
        displayJsonData(findById("displayContainer"), mainJson);
    });
}

function displayJsonData(parent, data, depth = 0, inline = false) {
    sequentialId++;
    if (!(data instanceof Object) && !(data instanceof Array)) {
        final = parent.appendChild(createHtmlElement({ tag: 'div', content: `${data}`, classes: [`finalData`, depth.toString()], attributes: {style: `margin-left: ${depth * displacement}px; line-height: ${lineheight}px; backgroundColor: ${backgroundColors[sequentialId%2]}`} }));
        return;
    }
    if (data instanceof Object) {
        for (const [key, value] of Object.entries(data)) {
            let newParent = parent.appendChild(createHtmlElement({ tag: 'div', classes: [`objectHeader`, depth.toString()], content: `${key}:`, attributes:  {style: `margin-left: ${depth * displacement}px; line-height: ${lineheight}px; background-color: ${backgroundColors[sequentialId%3]}`}  }));
            displayJsonData(newParent, value, depth + 1, true);
        }
    }
    if (data instanceof Array) {
        for (let datum of data){
            const element = parent.appendChild(createHtmlElement({ tag: 'div', id: `jsonElement${sequentialId}; background-color: ${backgroundColors[sequentialId%3]}` }));
            displayJsonData(element, datum, depth + 1);
        };
    }
}

function init() {
    buildLayout();
}

init();
