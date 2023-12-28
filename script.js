class Chart extends HTMLElement {
    #g_axisY;
    #g_axisX;

    #typeHandle;
    constructor() {
        super();

        ////// Pie //////

        ////// Graph //////
        // axis-y
        this.#g_axisY = document.createElement('div');
        this.#g_axisY.setAttribute('axis', 'y');
        // axis-X
        this.#g_axisX = document.createElement('div');
        this.#g_axisX.setAttribute('axis', 'x');

        this.#typeHandle = {
            graph: {
                valueContainer: this.#g_axisX,
                render: [this.#g_axisY, this.#g_axisX],
            },
        };
    }

    ////// Render
    connectedCallback() {
        this.render();
    }

    render() {
        if (this.parentNode) {
            this.#typeHandle[this.type].render.forEach(this.appendChild.bind(this));
        }
    }
    ////////////////////////////////////

    ////// Mathods

    /**
     *
     * @param {*} datas
     */
    importData(datas) {
        if (!datas.length || datas.length < 1) return false;
        const length = datas.length;
        let max = 0;
        for (const data of datas) {
            if (data.percentage > max) max = data.percentage;
            const value = this.constructor.createValue(data.text, data.percentage);
            this.#typeHandle[this.type].valueContainer.appendChild(value);
            value.style.height = data.percentage + '%';
        }
        for (let i = max + 10; i >= 0; i -= 10) {
            const value = this.constructor.createValue(null, i);
            this.#g_axisY.appendChild(value);
        }
    }

    ////// Attribute
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'type':
                if (!this.Types.includes(newValue) || newValue === oldValue) {
                    this.type = oldValue;
                    return false;
                }
                const typeChangeEvent = new CustomEvent('changed-type', {
                    detail: {
                        newType: oldValue,
                        oldType: newValue,
                    },
                });
                this.dispatchEvent(typeChangeEvent);
                break;
            default:
                break;
        }
    }
    ////////////////////////////////////

    /* Getter */
    get Types() {
        return ['graph', 'pie', 'donut'];
    }

    get type() {
        return this.getAttribute('type') || 'graph';
    }

    ////// Static mathods

    static get observedAttributes() {
        return ['type'];
    }

    /**
     *
     * @param {*} text
     * @param {*} percentage
     * @returns
     */
    static createValue(text, percentage) {
        const obj = document.createElement('div');
        obj.setAttribute('data-axis', percentage);
        if (text) obj.innerHTML = `<span>${text}</span>`;
        return obj;
    }
    ////////////////////////////////////
}

customElements.define('smt-chart', Chart);
