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

    #colors;
    constructor() {
        super();

        /* Css color vars */
        this.#colors = {
            LastIndex: -1,
            unnamed: [
                '--chart-color-raspberry',
                '--chart-color-azure',
                '--chart-color-verdigris',
                '--chart-color-magenta',
                '--chart-color-bitterLemonn',
                '--chart-color-vividViolet',
                '--chart-color-squash',
                '--chart-color-greenTeal',
            ],
            named: {
                raspberry: '--chart-color-raspberry',
                azure: '--chart-color-azure',
                verdigris: '--chart-color-verdigris',
                bitterlemonn: '--chart-color-bitterlemonn',
                vividviolet: '--chart-color-vividviolet',
                squash: '--chart-color-squash',
                magenta: '--chart-color-magenta',
                greenTeal: '--chart-color-greenTeal',
            },
        };

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

        // Update y axis line width when added a bar and the width is expand
        const resizeObs = new ResizeObserver((_) => {
            this.#g_axisY.style.setProperty('--y-axis-line-width', this.#bars.offsetWidth + 'px');
        });
        resizeObs.observe(this.#bars);
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

    /**
     * Render the y axis column in the column chart
     * @param {number} max max y
     * @param {number} min min y
     */
    renderAxisY(max = 60, min = 1) {
        const newValues = this.constructor.calcNiceNumber(max, min, this.stepTick);
        this.#maxAxisY = newValues.max;
        this.#minAxisY = newValues.min;

        for (let i = newValues.max; i > 0; i -= newValues.step) {
            const yStep = document.createElement('div');
            yStep.setAttribute('y-step', '');
            this.#g_axisY.appendChild(yStep);

            const text = document.createElement('span');
            text.setAttribute('text', '');
            text.innerText = Math.round(i);
            yStep.appendChild(text);

            const line = document.createElement('span');
            line.setAttribute('line', '');
            yStep.appendChild(line);
        }
    }

    /**
     * Render to chart each data object in the array
     * @param {object} datas the data
     */
    renderDatas(datas) {
        datas.forEach((data) => {
            this.addBar(data.label, data.value, data.extra);
        });
    }
    ////////////////////////////////////

    ////// Mathods

    /**
     * Import data to chart
     * @param {Array} datas the data
     */
    importData(datas) {
        if (!datas.length || datas.length < 1) return false;
        this.#maxAxisY = Math.max(...datas.map((i) => i.value)); // find the maximum value
        this.#minAxisY = Math.min(...datas.map((i) => i.value)); // find the minimum value
        this.renderAxisY(this.#maxAxisY, this.#minAxisY);
        this.renderDatas(datas);
        this.#allDatas = [...this.#allDatas, ...datas];
    }

    /**
     * Add a bar/column to chart
     * @param {string} label the name/text under column
     * @param {string|number} value the value of the bar
     * @param {object} extra extra info to the bar like custom toolip
     */
    addBar(label, value, extra) {
        const height = this.constructor.calcColumnHeight(value, this.#maxAxisY);

        label = label.split(' ').join('\n');

        const tooltip = document.createElement('span');
        tooltip.setAttribute('tooltip', '');
        tooltip.setAttribute('data-tooltip-title', label);
        tooltip.setAttribute('data-tooltip-text', extra.tooltip || value);

        const bar = document.createElement('div');
        bar.setAttribute('bar', '');
        bar.setAttribute('data-label', label);
        bar.setAttribute('data-value', value);
        bar.style.setProperty('--chart-color', `var(${this.getColor()})`);
        bar.style.setProperty('--height', `${height}%`);
        bar.appendChild(tooltip);
        this.#bars.appendChild(bar);
    }

    /**
     * Get the preferred color of visual value
     * @returns the color value/name
     */
    getColor() {
        if (this.palette === 'all') {
            this.#colors.LastIndex++;
            if (this.#colors.LastIndex >= this.#colors.unnamed.length) this.#colors.LastIndex = 0;
            return this.#colors.unnamed[this.#colors.LastIndex];
        } else return this.#colors.named[this.palette] || this.#colors.named['raspberry'];
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

    get stepTick() {
        const num = parseInt(this.getAttribute('steptick'));
        return typeof num == 'number' ? num : 1;
    }

    // the preferred color
    get palette() {
        return this.getAttribute('palette') || 'raspberry';
    }

    /* Setter */
    set type(t = 'bar-chart') {
        return this.setAttribute('type', t);
    }

    ////// Static mathods

    static get observedAttributes() {
        return ['type'];
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
