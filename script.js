let url = 'https://www.dnd5eapi.co/api/2014/classes/barbarian';
let apiKey = '';
let mainJson = {};
let sequentialId = 0;
let lineheight = 20;
let displacement = 20;
let isEditorOpen = false;
const styles = {id: {}, class: {}, defaultStyle: {    color: 'black',
    fontSize: '14px',
    backgroundColor: 'white',
    display: 'block',
    marginLeft: '0px',
    marginRight: '0px',
    textAlign: 'left',
    
    lineHeight: '20px',
    padding: '2px',
    borderRadius: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc',
    fontWeight: 'normal',
    fontFamily: 'Arial, sans-serif'}, alternateStyle: {    color: 'black',
    fontSize: '14px',
    backgroundColor: 'white',
    display: 'block',
    marginLeft: '0px',
    marginRight: '0px',
    textAlign: 'left',
    width: 'auto',
    height: 'auto',
    padding: '2px',
    margin: '0px',
    border: '1px solid #ccc',
    background: 'white',
    color: 'black',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'left',
    lineHeight: '20px',
    padding: '2px',
    borderRadius: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc',
    fontWeight: 'normal',
    fontFamily: 'Arial, sans-serif'}};
let targetElement = null;
let targetStyle = {};
const classCodes = {};
let selectedStyleKey = [''];
let selectedStyleValue = '';
let isClass = false;
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



function createQuizDiv() {
    const quizDiv = createHtmlElement({
        tag: 'div',
        id: 'quizrDiv',
        attributes: { style: 'border: 1px solid black; padding: 10px; margin-bottom: 10px; background-color: #f9f9f9; position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;' }
    })
    quizDiv.innerHTML = `
  <form class="fetchDataForm">
    <label for="url" placeholder="Write your url here!">Write your url here!:</label>
    <input type="text" id="url" name="url">
    <button type="button" id="closeWeatherBtn">Load</button>
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
    const editor = createHtmlElement({ tag: "div", parent: root, id: "editorContainer", classes: ["editor"], attributes: { style: "border: 1px solid black; padding: 10px; position: relative;" } });
    const styleValue = createHtmlElement({ tag: "input", parent: editor, id: "styleValue", classes: [], attributes: { type: "text", placeholder: "Enter CSS value (e.g., red, 20px)" } });
    
        styleValue.addEventListener("change", (event) => {
        selectedStyleValue = event.target.value;
    });
    const styleKeySelect = selectMaker(Object.keys(styles.defaultStyle), selectedStyleKey, editor);
    const applyStyleBtn = createHtmlElement({ tag: "button", parent: editor, id: "applyStyleBtn", classes: [], content: "Apply Style" });
    applyStyleBtn.addEventListener("click", () => {
        const styleType = isClass ? 'class' : 'id';
        styles[styleType][targetElement] = styles[styleType][targetElement] || {};
        styles[styleType][targetElement][selectedStyleKey[0]] = selectedStyleValue;
        console.log(styles);
        refreshStyles();

    });
    const toggleClassBtn = createHtmlElement({ tag: "button", parent: editor, id: "toggleClassBtn", classes: [], content: "Toggle Class/Classless" });
    toggleClassBtn.addEventListener("click", () => {
        isClass = !isClass;
    });
    const donwloadHtmlBtn = createHtmlElement({ tag: "button", parent: editor, id: "downloadBtn", classes: [], content: "Download" });
    donwloadHtmlBtn.addEventListener("click", () => {
        const htmlContent = document.getElementById("displayContainer").innerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'styled_json_viewer.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
)

}

function refreshStyles(){
    const allElements = document.querySelectorAll(".jsonElement");
    allElements.forEach((element) => {
        const depth = element.classList[0].length - 1;
        const newStyle = createSytleObject(depth, element.classList[0], element.id);
        element.setAttribute('style', stringifyStyle(newStyle));
    });
}

function buildLayout() {
    
    const root = findById('root');
    const quizDiv = createQuizDiv();
    root.appendChild(quizDiv);
    const quiz = createHtmlElement({ tag: "div", parent: quizDiv, id: "quizContainer" });
    createEditorLayout(quiz);
    buildSpacer(quiz);
    createHtmlElement({ tag: "div", parent: root, id: "displayContainer" });
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

function updateOject(object, updateOject){
    Object.entries(updateOject).forEach( ([key, value]) => {
        object[key] = value;
    });
    return object;
}

function createSequentialId() {
    sequentialId++;
    return sequentialId.toString();
}

function createSytleObject(depth, classCode, id) {
    let newStyle = {...styles.defaultStyle};
    newStyle.marginLeft = `${depth * displacement}px`;
    newStyle.lineHeight = `${lineheight}px`;
    styles.id[id] && (updateOject(newStyle, styles.id[id]));
    styles.class[classCode] && (updateOject(newStyle, styles.class[classCode]));
    return newStyle;
}

function displayJsonData(parent, data, depth = 0, classCode = "r") {
    
    let newStyle = createSytleObject(depth, classCode, (sequentialId-1).toString());
    if (!(data instanceof Object) && !(data instanceof Array)) {
        final = createHtmlElement({ parent: parent, tag: 'div', content: `${data}`, id: createSequentialId(), classes: makeClasslist(classCode), attributes: {style: stringifyStyle(newStyle) } });
        return;
    }
    if (data instanceof Object) {
        let i = true;
        for (const [key, value] of Object.entries(data)) {
            let newParent = createHtmlElement({ parent: parent, tag: 'div', id: createSequentialId(), classes: makeClasslist(classCode), content: `${key}:`, attributes:  {style: stringifyStyle(newStyle) } });
                
                            displayJsonData(newParent, value, depth + 1, classCode + 'O');
        }
    }
    if (data instanceof Array) {
        for (let datum of data){
            const element =createHtmlElement({ parent: parent, tag: 'div', id: createSequentialId(), classes: makeClasslist(classCode), attributes: {style: stringifyStyle(newStyle) } });
                
            displayJsonData(element, datum, depth + 1, classCode + 'A');
        };
    }
}

HTMLElement.prototype.add = function(element) {
    this.appendChild(element);
    return this;
}


function init() {
    buildLayout();
}

init();
