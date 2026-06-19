// One JsonNode per rendered element: keeps the link to the live JSON value (and where to write
// it back), to its parent/children nodes, and to its own style overrides so it can refresh itself
// without touching the rest of the tree.
// Relies on makeReactive, styles, classStyles, updateOject, stringifyStyle, displacement and
// lineheight being defined as globals by script.js, which is loaded after this file.
class JsonNode {
    constructor({ id, data, parentContainer, key, parent, depth, classCode }) {
        this.id = id;
        this.data = data;
        this.parentContainer = parentContainer;
        this.key = key;
        this.parent = parent;
        this.children = [];
        this.depth = depth;
        this.classCode = classCode;
        this.element = null;
        this.ownStyle = makeReactive({}, () => this.refresh());
    }

    addChild(child) {
        this.children.push(child);
        return child;
    }

    computeStyle() {
        const merged = { ...styles.defaultStyle };
        merged.marginLeft = `${this.depth * displacement}px`;
        merged.lineHeight = `${lineheight}px`;
        const classStyle = classStyles.get(this.classCode);
        if (classStyle) updateOject(merged, classStyle);
        updateOject(merged, this.ownStyle);
        return merged;
    }

    refresh() {
        if (this.element) {
            this.element.setAttribute('style', stringifyStyle(this.computeStyle()));
        }
    }

    refreshTree() {
        this.refresh();
        this.children.forEach((child) => child.refreshTree());
    }

    setValue(newValue) {
        this.data = newValue;
        if (this.parentContainer && this.key !== null) {
            this.parentContainer[this.key] = newValue;
        }
        if (this.element) {
            this.element.innerText = `${newValue}`;
        }
    }
}
