const DATA_POINTS = 120; // 2 minutes of data at 1s interval
const BUFFER_SIZE = 5 * DATA_POINTS;
const colors = {
    "CPU": "blue",
    "CantorCPU": "yellow",
    "ThreadCount":"green",
    "Memory": "red"
};

class Metrics {
    constructor(updatePeriod, timeWindow) {
        this.updatePeriod = updatePeriod;
        this.timeWindow = timeWindow;
        this.map = new Map();
    }
    addMetric(name) {
        this.map.set(name, []);
    }
}

function contentCallback(data_put,content) {
    let metrics = parseFloat(content);
    if (isNaN(metrics)) {
        metrics = 0.0;
    }
    data_put.push({ timestamp: new Date(), value: metrics });
    if (data_put.length > BUFFER_SIZE) {
        data_put.shift();
    }
}
function fetchData(data_put, metricName) {
    //http://localhost:9089/api/metrics?keys=CPU&object=
    let uri = "http://localhost:9089/api/metrics?keys=" + metricName +"&object=";
    new CantorRequest(uri, contentCallback, data_put);
}
function fetchData_fake(minVal, maxVal) {
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

class MetricsBlock extends HTMLElement {
    static get observedAttributes() { return ['src']; }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.width = 600;
        this.height = 400;
        this.scaleX = d3.scaleTime().range([50, 550]);
        this.scaleY = d3.scaleLinear().range([350, 50]);
        this.currentOffset = { x: 0, y: 0 };
        this.dragStart = null;
        this.svg = null;

        this.metrics = new Metrics(1000, DATA_POINTS * 1000);//use 1000 from seconds to to ms
        this.metrics.addMetric("CPU");
        this.metrics.addMetric("Memory");
        this.metrics.addMetric("ThreadCount");
        this.metrics.addMetric("CantorCPU");

        this.addStyles(`
            svg {
                user-select: none; /* Standard syntax */
                -webkit-user-select: none; /* Safari */
                -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
            }
        `);
    }
    connectedCallback() {
        let self = this;

        this.svg = d3.select(this.shadowRoot).append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.svg.append("g").classed("graph-group", true);

        this.svg.on("wheel", function (event) {
            event.preventDefault();

            let zoomFactorX = 0.05;
            let zoomFactorY = 0.02; // Use a smaller zoom factor for Y-axis

            if (event.deltaY < 0) { // Zoom in
                self.scaleX.range([50, 50 + (550 - 50) * (1 - zoomFactorX)]);
                self.scaleY.range([350, 50 + (350 - 50) * (1 - zoomFactorY)]);
            } else { // Zoom out
                self.scaleX.range([50, 50 + (550 - 50) * (1 + zoomFactorX)]);
                self.scaleY.range([350, 50 + (350 - 50) * (1 + zoomFactorY)]);
            }

            self.redrawGraph(self);
        });

        this.svg.on("pointerdown", this.onPointerDown.bind(this));
        window.addEventListener("pointermove", this.onPointerMove.bind(this));
        window.addEventListener("pointerup", function (event) {
            if (event.button === 0 || event.button === 2) {
                self.dragStart = null;
                self.svg.node().releasePointerCapture(event.pointerId);
            }
        });

        setInterval(this.collectAllMetricsData.bind(this), this.metrics.updatePeriod);

        setInterval(this.redrawGraph.bind(this, this), 1000);
    }
    addStyles(styles) {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }
    collectAllMetricsData() {
        this.metrics.map.forEach((data, metricName) => {
            fetchData(data, metricName);
        });
    }
    collectAllMetricsData_Fake() {
        this.metrics.map.forEach((data, metricName) => {
            data.push({ timestamp: new Date(), value: fetchData_fake(0, 100) });
            if (data.length > BUFFER_SIZE) {
                data.shift();
            }
        });
    }
    onPointerDown(event) {
        this.dragStart = d3.pointer(event, this);
        event.preventDefault();
        this.setPointerCapture(event.pointerId);
    }
    onPointerMove(event) {
        if (this.dragStart) {
            let dragCurrent = d3.pointer(event, this);

            let deltaX = dragCurrent[0] - this.dragStart[0];
            let deltaY = dragCurrent[1] - this.dragStart[1];

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                this.currentOffset.x += deltaX * 1000;
            } else {
                this.currentOffset.y += deltaY;
            }

            this.dragStart = dragCurrent;
            this.redrawGraph(this);
        }
    }
    resetView() {
        this.currentOffset = { x: 0, y: 0 }; // Reset offsets
        this.scaleX.range([50, 550]);       // Reset X scale range
        this.scaleY.range([350, 50]);       // Reset Y scale range
        this.redrawGraph(this);                 // Redraw the graph with updated settings
    }

    redrawGraph(thisBlock) {
        thisBlock.svg.selectAll("*").remove();

        thisBlock.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 50)
            .attr("y", 50)
            .attr("width", 500)
            .attr("height", 300);

        let now = new Date();
        let timeSpan = thisBlock.metrics.timeWindow;

        let latestTime = 0;
        if (thisBlock.metrics.map.get("CPU").length > 0) {
            latestTime = thisBlock.metrics.map.get("CPU").slice(-1)[0].timestamp;
        }
        let earliestTime = latestTime - BUFFER_SIZE * thisBlock.metrics.updatePeriod;

        let shiftedEndTime = new Date(latestTime - thisBlock.currentOffset.x);
        let shiftedStartTime = new Date(shiftedEndTime - timeSpan);

        if (shiftedStartTime < earliestTime) {
            shiftedStartTime = earliestTime;
            shiftedEndTime = new Date(shiftedStartTime + timeSpan);
        }

        thisBlock.scaleX.domain([shiftedStartTime, shiftedEndTime]);
        thisBlock.scaleY.domain([0 + thisBlock.currentOffset.y, 100 + thisBlock.currentOffset.y]);

        // Axes
        thisBlock.svg.append("g")
            .attr("transform", "translate(0,350)")
            .call(d3.axisBottom(thisBlock.scaleX));

        thisBlock.svg.append("g")
            .attr("transform", "translate(50,0)")
            .call(d3.axisLeft(thisBlock.scaleY));

        // Drawing curves
        thisBlock.metrics.map.forEach((data, metricName) => {
            thisBlock.svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", colors[metricName])
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(d => thisBlock.scaleX(d.timestamp))
                    .y(d => thisBlock.scaleY(d.value))
                )
                .attr("clip-path", "url(#clip)");
        });

        // Drawing legend
        let legend = thisBlock.svg.selectAll(".legend")
            .data(Array.from(thisBlock.metrics.map.keys()))
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + (20 * i) + ")");

        legend.append("rect")
            .attr("x", 510)
            .attr("y", 10)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => colors[d]);

        legend.append("text")
            .attr("x", 530)
            .attr("y", 20)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d);
    }//end renderGraph

}
customElements.define("metrics-block", MetricsBlock);

