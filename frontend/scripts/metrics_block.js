const DATA_POINTS = 120; // 2 minutes of data at 1s interval
const BUFFER_SIZE = 5 * DATA_POINTS;
class Metrics {
    constructor(sources, updatePeriod, timeWindow) {
        this.lastMetricsId = 0;
        this.updatePeriod = updatePeriod;
        this.timeWindow = timeWindow;
        this.data = [];
        const ds_key = "metrics_map_data:" + sources;
        if (typeof _datastore !== "undefined") {
            if (_datastore.has(ds_key)) {
                this.data = _datastore.get(ds_key);
            }
            else {
                _datastore.set(ds_key, this.data);
            }
        }
        this.map = new Map();
        this.axies = [];
        this.axies.push("Time");
        this.colors = new Map();
    }
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    Colors(name) {
        return this.colors.get(name);
    }
    addMetric(name, color) {
        if (!this.map.has(name)) {
            this.map.set(name, this.lastMetricsId++);
            this.axies.push(name);
        }
        if (color == undefined) {
            color = this.getRandomColor();
        }
        this.colors.set(name, color);
    }
}

function contentCallback(action_info, content) {
    let metrics = parseFloat(content);
    if (isNaN(metrics)) {
        metrics = 0.0;
    }
    action_info[0][action_info[1]] = metrics;
}
function getUrlOfHost() {
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const host = url.hostname;
    const port = url.port || ''; // Use an empty string if port is not specified
    const urlWithoutPath = `${url.protocol}//${host}${port ? `:${port}` : ''}/`;
    return urlWithoutPath;
}
function fetchData(data_put,index,metricName) {
    //http://localhost:9089/api/metrics?keys=CPU&object=
    //let uri = "http://localhost:9089/api/metrics?keys=" + metricName + "&object=";
    let uri = getUrlOfHost() + "api/metrics?keys=" + metricName + "&object=";
    new CantorRequest(uri, contentCallback, [data_put,index],false);
}

class MetricsBlock extends HTMLElement {
    static get observedAttributes() { return ['src']; }

    attributeChangedCallback(attrName, oldVal, newVal) {
        this[attrName] = newVal;
        if (attrName == "src") {
            //use 1000 from seconds to to ms
            this.metrics = new Metrics(newVal,1000, DATA_POINTS * 1000);
            this.parseMetrics(newVal);
        }
    }
    //src format: "{[objectKey.]Metrics_Name[:color][,]}*"
    //test
    //const input = "obj1.metric1:blue,obj2.metric2:red,metric3";
    //console.log(parseMetrics(input));
    parseMetrics(input) {
        const regex = /(([^.,:]+)\.)?([^.,:]+)(:([^,]+))?/g;

        const results = [];
        let match;

        while (match = regex.exec(input)) {
            let objectKey = match[2] || undefined;
            let metricName = match[3] || undefined;
            let color = match[5] || undefined;
            this.metrics.addMetric(metricName, color);
        }

        return results;
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
              position: relative;
            }
            .graph {
              width: 100%;
            }
            .legend-container {
              position: absolute;
              top: 0;
              right:0;
            }
          </style>
          <div class="graph"></div>
          <div class="legend-container"></div>
          <div style="left:20px;">
          </div>
        `;
            //Zoom: click-drag //dhq 20240304
            //Pan: shift-click-drag
            //Restore zoom level: double-click
    }
    connectedCallback() {
        const graphDiv = this.shadowRoot.querySelector('.graph');
        const legendDiv = this.shadowRoot.querySelector('.legend-container');
        //container.appendChild(legendContainer);
        this.g = new Dygraph(
            graphDiv,
            this.metrics.data,
            {
                labelsDiv: legendDiv,
                drawPoints: true,
                //showRoller: true,
                //valueRange: [0.0, 120],
                labels: this.metrics.axies,
                rollPeriod: 7,
                legend: 'always',
                plugins: [
                    new Dygraph.Plugins.Crosshair({
                        direction: "vertical"
                    })
                ]
            }
        );
        setInterval(this.collectAllMetricsData.bind(this), this.metrics.updatePeriod);
    }
    collectAllMetricsData() {
        const newData = new Array(this.metrics.map.size+1);
        newData[0] = new Date();
        this.metrics.data.push(newData);
        if (this.metrics.data.length > BUFFER_SIZE) {
            this.metrics.data.shift();
        }
        this.metrics.map.forEach((index, metricName) => {
            fetchData(newData, index+1, metricName);
        });
        this.g.updateOptions({ 'file': this.metrics.data });
    }

}
customElements.define("metrics-block", MetricsBlock);

