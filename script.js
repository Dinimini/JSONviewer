let url = 'https://www.dnd5eapi.co/api/2014/classes/barbarian';
let apiKey = '';
let mainJson = {};
let sequentialId = 0;
let lineheight = 20;
let displacement = 20;
let isEditorOpen = false;

function makeReactive(target, onChange) {
    if (typeof target !== 'object' || target === null) return target;
    for (const key in target) {
        if (typeof target[key] === 'object' && target[key] !== null) {
            target[key] = makeReactive(target[key], onChange);
        }
    }
    return new Proxy(target, {
        set(obj, prop, value) {
            obj[prop] = (typeof value === 'object' && value !== null) ? makeReactive(value, onChange) : value;
            onChange();
            return true;
        },
        deleteProperty(obj, prop) {
            delete obj[prop];
            onChange();
            return true;
        }
    });
}

let refreshScheduled = false;
function scheduleRefresh() {
    if (refreshScheduled) return;
    refreshScheduled = true;
    queueMicrotask(() => {
        refreshScheduled = false;
        refreshAllStyles();
    });
}

const styles = makeReactive({ defaultStyle: {    color: 'black',
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
    fontFamily: 'Arial, sans-serif'} }, scheduleRefresh);

let targetElement = null;
let targetStyle = {};
const classCodes = {};
let selectedStyleKey = [''];
let selectedStyleValue = '';
let selectedElement = null;
let selectedNode = null;
let isClass = false;
let copiedStyle = null;
// Layout-driven, not a real "style" choice - excluded when sampling a style to copy elsewhere.
const STRUCTURAL_STYLE_KEYS = ['marginLeft', 'lineHeight'];
const backgroundColors = ['#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3', '#FFF9C4', '#FFECB3', '#FFE0B2', '#FFCCBC'];

// classCode -> reactive per-classCode style override, e.g. shared by every node rendered with the same structural path.
const classStyles = new Map();
function getClassStyle(classCode) {
    if (!classStyles.has(classCode)) {
        classStyles.set(classCode, makeReactive({}, () => refreshClass(classCode)));
    }
    return classStyles.get(classCode);
}

// id -> JsonNode, classCode -> Set<JsonNode>, populated as displayJsonData renders the tree.
const nodesById = new Map();
const nodesByClass = new Map();

function registerNode(node) {
    nodesById.set(node.id, node);
    if (!nodesByClass.has(node.classCode)) {
        nodesByClass.set(node.classCode, new Set());
    }
    nodesByClass.get(node.classCode).add(node);
}

function clearNodeRegistry() {
    nodesById.clear();
    nodesByClass.clear();
}

function refreshAllStyles() {
    nodesById.forEach((node) => node.refresh());
}

function refreshClass(classCode) {
    const nodes = nodesByClass.get(classCode);
    if (nodes) nodes.forEach((node) => node.refresh());
}

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
    clearNodeRegistry();
    sequentialId = 0;
    await fetchJsonData(url, apiKey);
    displayJsonData(findById("displayContainer"), mainJson);
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

function updateStyleValueDisplay() {
    const styleValueInput = findById('styleValue');
    if (!styleValueInput) return;
    const key = selectedStyleKey[0];
    const value = selectedNode ? (selectedNode.computeStyle()[key] ?? '') : (styles.defaultStyle[key] ?? '');
    styleValueInput.value = value;
    selectedStyleValue = value;
}

function createEditorLayout(root) {
    const editor = createHtmlElement({ tag: "div", parent: root, id: "editorContainer", classes: ["editor"], attributes: { style: "border: 1px solid black; padding: 10px; position: relative; display: none;" } });
    const styleValue = createHtmlElement({ tag: "input", parent: editor, id: "styleValue", classes: [], attributes: { type: "text", placeholder: "Enter CSS value (e.g., red, 20px)" } });

        styleValue.addEventListener("change", (event) => {
        selectedStyleValue = event.target.value;
    });
    const styleKeySelect = selectMaker(Object.keys(styles.defaultStyle), selectedStyleKey, editor);
    styleKeySelect.addEventListener("change", updateStyleValueDisplay);
    const applyStyleBtn = createHtmlElement({ tag: "button", parent: editor, id: "applyStyleBtn", classes: [], content: "Apply Style" });
    applyStyleBtn.addEventListener("click", () => {
        if (!selectedNode) {
            console.warn('No element selected to style. Click a rendered value first.');
            return;
        }
        const key = selectedStyleKey[0];
        if (isClass) {
            getClassStyle(selectedNode.classCode)[key] = selectedStyleValue;
        } else {
            selectedNode.ownStyle[key] = selectedStyleValue;
        }
        editor.style.display = 'none';
    });
    const isClassLabel = createHtmlElement({ tag: "label", parent: editor, content: "Apply to class", attributes: { for: "isClassCheckbox" } });
    const isClassCheckbox = createHtmlElement({ tag: "input", parent: editor, id: "isClassCheckbox", classes: [], attributes: { type: "checkbox" } });
    isClassCheckbox.addEventListener("change", (event) => {
        isClass = event.target.checked;
    });
    const copyStyleBtn = createHtmlElement({ tag: "button", parent: editor, id: "copyStyleBtn", classes: [], content: "🧪 Copy Style", attributes: { title: "Copy this element's style to apply elsewhere later" } });
    copyStyleBtn.addEventListener("click", () => {
        if (!selectedNode) {
            console.warn('No element selected to copy a style from. Click a rendered value first.');
            return;
        }
        copiedStyle = { ...selectedNode.computeStyle() };
        STRUCTURAL_STYLE_KEYS.forEach((key) => delete copiedStyle[key]);
        console.log('Copied style', copiedStyle);
    });
    const pasteStyleBtn = createHtmlElement({ tag: "button", parent: editor, id: "pasteStyleBtn", classes: [], content: "Paste Style" });
    pasteStyleBtn.addEventListener("click", () => {
        if (!selectedNode) {
            console.warn('No element selected to paste the copied style onto. Click a rendered value first.');
            return;
        }
        if (!copiedStyle) {
            console.warn('Nothing copied yet. Use Copy Style on an element first.');
            return;
        }
        if (isClass) {
            Object.assign(getClassStyle(selectedNode.classCode), copiedStyle);
        } else {
            Object.assign(selectedNode.ownStyle, copiedStyle);
        }
        editor.style.display = 'none';
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

function buildLayout() {

    const root = findById('root');
    const quizDiv = createQuizDiv();
    root.appendChild(quizDiv);
    const quiz = createHtmlElement({ tag: "div", parent: quizDiv, id: "quizContainer" });
    createEditorLayout(quiz);
    buildSpacer(quiz);
    const displayContainer = createHtmlElement({ tag: "div", parent: root, id: "displayContainer" });
    displayContainer.addEventListener("click", (event) => {
        if (!event.target.classList.contains("jsonElement")) return;
        const node = nodesById.get(event.target.id);
        if (!node) return;
        selectedNode = node;
        selectedElement = event.target;
        targetElement = isClass ? node.classCode : node.id;
        findById("editorContainer").style.display = 'block';
        updateStyleValueDisplay();
    });
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
    clearNodeRegistry();
    sequentialId = 0;
    displayJsonData(findById("displayContainer"), mainJson);
}

function buildSpacer(parent){
    let container = parent.appendChild(createHtmlElement({ tag: 'div', classes: ['spacerPixel'], id: `spacerContainer` }) );
    container.addEventListener('click', (event) => {
        displacement = event.offsetX;
        lineheight = event.offsetY;
        refreshAllStyles();

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

function displayJsonData(parent, data, depth = 0, classCode = "r", parentNode = null, parentContainer = null, key = null) {
    if (!(data instanceof Object)) {
        const id = createSequentialId();
        const node = new JsonNode({ id, data, parentContainer, key, parent: parentNode, depth, classCode });
        const element = createHtmlElement({ parent, tag: 'div', content: `${data}`, id, classes: makeClasslist(classCode) });
        node.element = element;
        registerNode(node);
        if (parentNode) parentNode.addChild(node);
        node.refresh();
        return node;
    }

    if (Array.isArray(data)) {
        return data.map((datum, index) => {
            const id = createSequentialId();
            const node = new JsonNode({ id, data: datum, parentContainer: data, key: index, parent: parentNode, depth, classCode });
            const element = createHtmlElement({ parent, tag: 'div', id, classes: makeClasslist(classCode) });
            node.element = element;
            registerNode(node);
            if (parentNode) parentNode.addChild(node);
            node.refresh();
            displayJsonData(element, datum, depth + 1, classCode + 'A', node, data, index);
            return node;
        });
    }

    return Object.entries(data).map(([entryKey, value]) => {
        const id = createSequentialId();
        const node = new JsonNode({ id, data: value, parentContainer: data, key: entryKey, parent: parentNode, depth, classCode });
        const element = createHtmlElement({ parent, tag: 'div', id, classes: makeClasslist(classCode), content: `${entryKey}:` });
        node.element = element;
        registerNode(node);
        if (parentNode) parentNode.addChild(node);
        node.refresh();
        displayJsonData(element, value, depth + 1, classCode + 'O', node, data, entryKey);
        return node;
    });
}

HTMLElement.prototype.add = function(element) {
    this.appendChild(element);
    return this;
}


function init() {
    buildLayout();
}

init();
