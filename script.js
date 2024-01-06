class Chart extends HTMLElement {
    // Bar Chart Elements
    #g_axisY;
    #g_axisX;
    #bars;

    // Y Axis
    #maxAxisY;
    #minAxisY;

    #typeHandle;

    #allDatas;
    constructor() {
        super();

        this.#allDatas = [];

        this.chartHeader = document.createElement('div');
        this.chartHeader.setAttribute('header', '');

        this.chartBody = document.createElement('div');
        this.chartBody.setAttribute('body', '');

        ////// Pie //////

        ////// Bar Chart //////
        // Bars container
        this.#bars = document.createElement('div');
        this.#bars.setAttribute('bars', '');

        // axis-y
        this.#maxAxisY = 60;
        this.#minAxisY = 1;
        this.#g_axisY = document.createElement('div');
        this.#g_axisY.setAttribute('axis', 'y');

        // axis-X
        this.#g_axisX = document.createElement('div');
        this.#g_axisX.setAttribute('axis', 'x');

        this.#typeHandle = {
            'bar-chart': {
                valueContainer: this.#bars,
                render: [this.#g_axisY, this.#bars, this.#g_axisX],
            },
        };

        /*         //this.#g_axisY.offsetHeight;
        const step = 10;
        const resizeObs = new ResizeObserver((entries) => {
            const x = this.maxY / step;
            const eachStepH = this.#g_axisY.firstChild.getBoundingClientRect();

            this.#maxAxisY = eachStepH.height * (this.maxY / 10);
            if (this.#allDatas.length > 0) this.renderDatas(this.#allDatas);
        });
        resizeObs.observe(this.#g_axisY); */
    }

    ////// Render
    connectedCallback() {
        this.render();
    }

    render() {
        if (this.parentNode) {
            this.appendChild(this.chartHeader);
            this.appendChild(this.chartBody);
        }
        this.#typeHandle[this.type].render.forEach((elm) => {
            this.chartBody.appendChild(elm);
        });
    }

    renderAxisY(max = 60, min = 1) {
        const newValues = this.constructor.calcNiceNumber(max, min, this.stepTick);
        this.#maxAxisY = newValues.max;
        this.#minAxisY = newValues.min;

        for (let i = newValues.max; i > 0; i -= newValues.step) {
            const yStep = document.createElement('div');
            yStep.setAttribute('y-step', '');
            this.#g_axisY.appendChild(yStep);

            const text = document.createElement('span');
            text.innerText = Math.round(i);
            yStep.appendChild(text);

            const line = document.createElement('span');
            line.setAttribute('line', '');
            yStep.appendChild(line);
        }
    }

    renderDatas(datas) {
        datas.forEach((data) => {
            this.addBar(data.label, data.value);
        });
    }
    ////////////////////////////////////

    ////// Mathods

    /**
     *
     * @param {*} datas
     */
    importData(datas) {
        if (!datas.length || datas.length < 1) return false;
        this.#maxAxisY = Math.max(...datas.map((i) => i.value)); // find the maximum value
        this.#minAxisY = Math.min(...datas.map((i) => i.value)); // find the minimum value
        this.renderAxisY(this.#maxAxisY, this.#minAxisY);
        this.renderDatas(datas);
        this.#allDatas = [...this.#allDatas, ...datas];
    }

    addBar(label, value) {
        const height = this.constructor.calcColumnHeight(value, this.#maxAxisY);

        const bar = document.createElement('div');
        bar.setAttribute('bar', '');
        bar.setAttribute('data-label', label.split(' ').join('\n'));
        bar.setAttribute('data-value', value);
        bar.setAttribute('style', `--height: ${height}%`);
        this.#bars.appendChild(bar);
    }

    ////// Attribute
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'type':
                if (!this.Types.includes(newValue) || newValue === oldValue) {
                    this.type = this.Types.includes(oldValue) ? oldValue : 'bar-chart';
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
            case 'max-y':
                const num = parseInt(newValue);
                if (typeof num == 'number') this.renderAxisY(num);
                break;
            default:
                break;
        }
    }
    ////////////////////////////////////

    /* Getter */
    get Types() {
        return ['bar-chart', 'pie', 'donut'];
    }

    get type() {
        return this.getAttribute('type') || 'bar-chart';
    }

    get maxY() {
        const num = parseInt(this.getAttribute('max-y'));
        return typeof num == 'number' ? num : 60;
    }

    get stepTick() {
        const num = parseInt(this.getAttribute('steptick'));
        return typeof num == 'number' ? num : 1;
    }

    /* Setter */
    set type(t = 'bar-chart') {
        return this.setAttribute('type', t);
    }

    ////// Static mathods

    static get observedAttributes() {
        return ['type', 'max-y'];
    }

    /**
     * Calculate the column height in the graph
     * @param {number} value
     * @param {number} maxValue
     * @return {number} the column height
     */
    static calcColumnHeight(value, maxValue) {
        return (value / maxValue) * 100;
    }

    static findNiceNum(range, round) {
        const exponent = Math.floor(Math.log10(range));
        const fraction = Math.floor(Math.log10(range));
        let niceFraction;
        if (round) {
            if (fraction < 1.5) niceFraction = 1;
            else if (fraction < 3) niceFraction = 2;
            else if (fraction < 7) niceFraction = 5;
            else niceFraction = 10;
        } else {
            if (fraction <= 1) niceFraction = 1;
            else if (fraction <= 2) niceFraction = 2;
            else if (fraction <= 5) niceFraction = 5;
            else niceFraction = 10;
        }

        return niceFraction * Math.pow(10, exponent);
    }
    static calcNiceNumber(max, min, tick) {
        const range = this.findNiceNum(max - min, false);
        const tickSpacing = this.findNiceNum(range / tick, true);
        const niceLowerBound = Math.floor(min / tickSpacing) * tickSpacing;
        const niceUpperBound = Math.ceil(max / tickSpacing) * tickSpacing;

        return {
            step: tickSpacing,
            max: niceUpperBound,
            min: niceLowerBound,
        };
    }
    ////////////////////////////////////
}

customElements.define('smt-chart', Chart);
