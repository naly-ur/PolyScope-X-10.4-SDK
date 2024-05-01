class <%= programComponentName %>Component extends HTMLElement {
    constructor() {
        super();
        this._contributedNode = null;
        this._presenterAPI = null;
        this._applicationContext = null;
        this._robotSettings = null;
        this._programTree = null;
    }

    // contributionNode is optional
    get contributedNode() {
        return this._contributedNode;
    }

    set contributedNode(value) {
        this._contributedNode = value;
        this.updateHTML();
    }

    // presenterAPI is optional
    get presenterAPI() {
        return this._presenterAPI;
    }

    set presenterAPI(value) {
        this._presenterAPI = value;
    }

    // applicationContext is optional
    get applicationContext() {
        return this._applicationContext;
    }

    set applicationContext(value) {
        this._applicationContext = value;
    }

    // robotSettings is optional
    get robotSettings() {
        return this._robotSettings;
    }

    set robotSettings(value) {
        this._robotSettings = value;
    }

    // programTree is optional
    get programTree() {
        return this._programTree;
    }

    set programTree(value) {
        this._programTree = value;
    }

    // variables is optional
    get variables() {
        return this._variables;
    }

    set variables(value) {
        this._variables = value;
    }

    connectedCallback() {
        this.updateHTML();
    }

    // call saveNode to save node parameters
    async saveNode() {
        await this._presenterAPI.programNodeService.updateNode(this.contributedNode);
    }

    updateHTML() {
        this.setHTML();
    }

    setHTML() {
        this.innerHTML = `
            <div style="margin-top: 1rem;">
                <div style="margin-bottom: 1rem;min-height: 22px;white-space: nowrap;">
                </div>
            </div>
       `;
    }
}

window.customElements.define('<%= programTagName %>', <%= programComponentName%>Component);
