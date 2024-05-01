class <%= applicationComponentName %>Component extends HTMLElement {
    constructor(){
        super();
        this._applicationNode = null;
        this._applicationAPI = null;
        this._robotSettings = null;
        this._robotContext = null;
    }

    // applicationNode is required
    get applicationNode() {
        return this._applicationNode;
    }

    set applicationNode(value) {
        this._applicationNode = value;
        this.updateHTML();
    }

    // applicationAPI is optional
    get applicationAPI() {
        return this._applicationAPI;
    }

    set applicationAPI(value) {
        this._applicationAPI = value;
    }

  // robotSettings is optional
    get robotSettings() {
        return this._robotSettings;
    }

    set robotSettings(value) {
        this._robotSettings = value;
    }

  // robotContext is optional
    get robotContext() {
        return this._robotContext;
    }

    set robotContext(value) {
        this._robotContext = value;
    }

    connectedCallback() {
        this.updateHTML();
    }

    // call saveNode to save node parameters
    saveNode() {
        this._applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }

    updateHTML() {
        if (!this.applicationNode) {
            return;
        }
        this.setHTML();
    }

    setHTML() {
        this.innerHTML = `
            <div style="margin-top: 1rem;">
                <div style="margin-left: 1rem;margin-bottom: 1rem;min-height: 22px;white-space: nowrap;">
                </div>
            </div>
        `;
    }
}

window.customElements.define('<%= applicationTagName %>', <%= applicationComponentName %>Component);
