let url = 'https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/all';
let apiKey = '';
let mainJson = {};
let sequentialId = 0;
let lineheight = 20;
let displacement = 20;
const styleHolders = {};
let isEditorOpen = false;
const style = {};
let targetElement = null;
const classCodes = {};
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

function makeClasslist(codeString) {
    const classList = [codeString, codeString.length.toString(), "jsonElement"];
    classCodes[codeString] = "";
    return classList;

}

async function onButtonClick() {
    findById("displayContainer").innerHTML = '';
    await fetchJsonData(url, apiKey);
    displayJsonData(findById("displayContainer"), mainJson);
    eventuateAllElements();
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

function createEditorLayout(root) {
    const editor = createHtmlElement({ tag: "div", parent: root, id: "editorContainer", classes: ["vertical"] });
    const styleKey = createHtmlElement({ tag: "input", parent: editor, id: "styleKey", classes: [], attributes: { type: "text", placeholder: "Enter CSS property (e.g., color, fontSize)" } });
    const styleValue = createHtmlElement({ tag: "input", parent: editor, id: "styleValue", classes: [], attributes: { type: "text", placeholder: "Enter CSS value (e.g., red, 20px)" } });
    [styleKey, styleValue].forEach((input) => {
        input.addEventListener("change", (event) => {
        styleHolders[event.target.id] = event.target.value;});
    });
    const applyStyleBtn = createHtmlElement({ tag: "button", parent: editor, id: "applyStyleBtn", classes: [], content: "Apply Style" });
    applyStyleBtn.addEventListener("click", () => {
        style[targetElement] = styleHolders["styleValue"];
        console.log(styleHolders, targetElement, style);
        reRenderDisplay();

    });


}

function buildLayout() {
    
    const root = findById('root');
    const quiz = createHtmlElement({ tag: "div", parent: root, id: "quizContainer", classes: ["vertical"] });
    createEditorLayout(quiz);
    buildSpacer(quiz);
    createHtmlElement({ tag: "div", parent: root, id: "displayContainer", classes: ["vertical"] });
    findById("quizContainer").appendChild(createQuizDiv());
    findById("url").addEventListener("change", (event) => {
        url = event.target.value;
    });
    findById("closeWeatherBtn").addEventListener("click", () => {
        fetchJsonData(url, apiKey);
    });
    findById("closeWeatherBtn").addEventListener("click", onButtonClick);
}

function clearDisplay(id) {
    findById(id).innerHTML = '';
}

function reRenderDisplay(){
    clearDisplay("displayContainer");
    displayJsonData(findById("displayContainer"), mainJson);
    eventuateAllElements();
}

function eventuateAllElements(){
    document.querySelectorAll(".jsonElement").forEach((child) => {
        child.addEventListener("click", (event) => {
            targetElement = event.target.classList[0];
            console.log(event.target.classList[0]);
        });
    });
}

function buildSpacer(parent){
    let container = parent.appendChild(createHtmlElement({ tag: 'div', classes: ['spacerPixel'], id: `spacerContainer` }) );
    container.addEventListener('click', (event) => {
        displacement = event.offsetX;
        lineheight = event.offsetY;
        reRenderDisplay();
        
    });
};

function displayJsonData(parent, data, depth = 0, classCode = "r") {
    let additionalStyles = style[classCode] || "";

    sequentialId++;
    if (!(data instanceof Object) && !(data instanceof Array)) {
        final = createHtmlElement({ parent: parent, tag: 'div', content: `${data}`, classes: makeClasslist(classCode), attributes: {style: `margin-left: ${depth * displacement}px; line-height: ${lineheight}px; backgroundColor: ${backgroundColors[sequentialId%2]}${";" +additionalStyles}`} });
        return;
    }
    if (data instanceof Object) {
        for (const [key, value] of Object.entries(data)) {
            let newParent = createHtmlElement({ parent: parent, tag: 'div', classes: makeClasslist(classCode), content: `${key}:`, attributes:  {style: `margin-left: ${depth * displacement}px; line-height: ${lineheight}px; background-color: ${backgroundColors[sequentialId%3]} ${";" +additionalStyles}`}  });
            displayJsonData(newParent, value, depth + 1, classCode + 'O');
        }
    }
    if (data instanceof Array) {
        for (let datum of data){
            const element =createHtmlElement({ parent: parent, tag: 'div', id: `jsonElement${sequentialId}`, classes: makeClasslist(classCode), attributes: {style: `margin-left: ${depth * displacement}px; line-height: ${lineheight}px; background-color: ${backgroundColors[sequentialId%3]} ${";" +additionalStyles}`} });
            displayJsonData(element, datum, depth + 1, classCode + 'A');
        };
    }
}

function init() {
    buildLayout();
}

init();
