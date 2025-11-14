let url = 'https://www.dnd5eapi.co/api/2014/classes/barbarian';
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
let selectedStyleKey = [''];
let selectedStyleValue = '';
let isClass = false;
const defaultStyle = {
    color: 'black',
    fontSize: '14px',
    backgroundColor: 'white',
    display: 'block',
    marginLeft: '0px',
    lineHeight: '20px',
    padding: '2px',
    borderRadius: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc',
    fontWeight: 'normal',
    fontFamily: 'Arial, sans-serif'
}
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
    const classList = [codeString,  "jsonElement"];
    classCodes[codeString] = "";
    return classList;

}

function selectMaker(from, variable, parent){
    const select = createHtmlElement({ tag: 'select', parent: parent, id: `${variable}Select` });
    from.forEach((optionValue) => {
        const option = createHtmlElement({ tag: 'option', parent: select, content: optionValue, attributes: { value: optionValue } });
    });
    select.addEventListener('change', (event) => {
        variable[0] = event.target.value;
    });
    return select;
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
    const editor = createHtmlElement({ tag: "div", parent: root, id: "editorContainer"});
    const styleKey = selectMaker(Object.keys(defaultStyle), selectedStyleKey, editor);
    const styleValue = createHtmlElement({ tag: "input", parent: editor, id: "styleValue", classes: [], attributes: { type: "text", placeholder: "Enter CSS value (e.g., red, 20px)" } });
    
        styleValue.addEventListener("change", (event) => {
        selectedStyleValue = event.target.value;
    });
    const applyStyleBtn = createHtmlElement({ tag: "button", parent: editor, id: "applyStyleBtn", classes: [], content: "Apply Style" });
    applyStyleBtn.addEventListener("click", () => {
        style[targetElement] = style[targetElement] || {};
        style[targetElement][selectedStyleKey[0]] = selectedStyleValue;
        console.log(style);
        console.log(defaultStyle);
        reRenderDisplay();

    });
    const toggleClassBtn = createHtmlElement({ tag: "button", parent: editor, id: "toggleClassBtn", classes: [], content: "Toggle Class/Classless" });
    toggleClassBtn.addEventListener("click", () => {
        isClass = !isClass;
    });

}

function buildLayout() {
    
    const root = findById('root');
    const quiz = createHtmlElement({ tag: "div", parent: root, id: "quizContainer" });
    createEditorLayout(quiz);
    buildSpacer(quiz);
    createHtmlElement({ tag: "div", parent: root, id: "displayContainer" });
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
    sequentialId = 0;
    displayJsonData(findById("displayContainer"), mainJson);
    eventuateAllElements();
}

function eventuateAllElements(){
    document.querySelectorAll(".jsonElement").forEach((child) => {
        child.addEventListener("click", (event) => {
                let assignToClass = isClass ? event.target.classList[0]:event.target.id.toString();
                targetElement = assignToClass;
            console.log(assignToClass);
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

function stringifyStyle(styleObject) {
    return Object.entries(styleObject).map(([key, value]) => {
        key = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${key}: ${value};`}).join(' ');
}

function displayJsonData(parent, data, depth = 0, classCode = "r", inline = false) {
    
    let newStyle = {...defaultStyle};
    newStyle.marginLeft = `${depth * displacement}px`;
    newStyle.lineHeight = `${lineheight}px`;
    newStyle.display = "block";
    newStyle.backgroundColor = backgroundColors[sequentialId % backgroundColors.length];
    let final = null;
    if (style[sequentialId.toString()]){
        final = style[sequentialId.toString()];
    } else if (style[classCode]){
        final = style[classCode];
    }
    final&&console.log(final);
    final&& Object.entries(final).forEach( ([key, value]) => {
        newStyle[key] = value;
    });
    sequentialId++;
    if (!(data instanceof Object) && !(data instanceof Array)) {
        final = createHtmlElement({ parent: parent, tag: 'div', content: `${data}`, id: sequentialId.toString(), classes: makeClasslist(classCode), attributes: {style: stringifyStyle(newStyle) } });
        sequentialId++;
        return;
    }
    if (data instanceof Object) {
        let i = true;
        for (const [key, value] of Object.entries(data)) {
            let newParent = createHtmlElement({ parent: parent, tag: 'div', id: sequentialId.toString(), classes: makeClasslist(classCode), content: `${key}:`, attributes:  {style: stringifyStyle(newStyle) } });
                
            displayJsonData(newParent, value, depth + 1, classCode + 'O', i);
            i = false;
        }
    }
    if (data instanceof Array) {
        for (let datum of data){
            const element =createHtmlElement({ parent: parent, tag: 'div', id: sequentialId.toString(), classes: makeClasslist(classCode), attributes: {style: stringifyStyle(newStyle) } });
                
            displayJsonData(element, datum, depth + 1, classCode + 'A');
        };
    }
}

function init() {
    buildLayout();
}

init();
