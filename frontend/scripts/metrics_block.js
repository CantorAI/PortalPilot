const DATA_POINTS = 120; // 2 minutes of data at 1s interval
const BUFFER_SIZE = 5 * DATA_POINTS;
class Metrics {
    constructor(updatePeriod, timeWindow) {
        this.updatePeriod = updatePeriod;
        this.timeWindow = timeWindow;
        this.map = new Map();
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
    getLatestTime() {
        if (this.map.size == 0) {
            return 0;
        }
        const firstKey = this.map.keys().next().value;
        if (this.map.get(firstKey).length > 0) {
            return this.map.get(firstKey).slice(-1)[0].timestamp;
        }
        else {
            return 0;
        }
    }
    Colors(name) {
        return this.colors.get(name);
    }
    addMetric(name,color) {
        this.map.set(name, []);
        if (color == undefined) {
            color = this.getRandomColor();
        }
        this.colors.set(name, color);
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

    attributeChangedCallback(attrName, oldVal, newVal) {
        this[attrName] = newVal;
        if (attrName == "src") {
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
        this.width = 600;
        this.height = 400;
        this.scaleX = d3.scaleTime().range([50, 550]);
        this.scaleY = d3.scaleLinear().range([350, 50]);
        this.currentOffset = { x: 0, y: 0 };
        this.dragStart = null;
        this.svg = null;

        this.metrics = new Metrics(1000, DATA_POINTS * 1000);//use 1000 from seconds to to ms
        //this.metrics.addMetric("CPU");
        //this.metrics.addMetric("Memory");
        //this.metrics.addMetric("ThreadCount");
        //this.metrics.addMetric("CantorCPU");

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
        const container = document.createElement('div');
        container.style.position = 'relative'; 
        this.svg = d3.select(container).append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.svg.append("g").classed("graph-group", true);

        // Create and append a button
        const button = document.createElement('button');
        button.textContent = 'Reset';
        button.style.position = 'absolute';  // Position the button as absolute
        button.style.top = '10px';  // Adjust as needed for your desired fixed coordinate
        button.style.left = '10px';
        button.onclick = () => {
            self.resetView();
        };

        container.appendChild(button);
        this.shadowRoot.appendChild(container);

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

        let latestTime = thisBlock.metrics.getLatestTime();
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

        let hideTooltipTimeout;
        // Drawing curves
        thisBlock.metrics.map.forEach((data, metricName) => {
            let checkName = thisBlock.metrics.Colors(metricName);
            thisBlock.svg.append("path")
                .datum(data)
                .attr("name", metricName)
                .attr("fill", "none")
                .attr("stroke", thisBlock.metrics.Colors(metricName))
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(d => thisBlock.scaleX(d.timestamp))
                    .y(d => thisBlock.scaleY(d.value))
                )
                .attr("clip-path", "url(#clip)")
                .on("mouseover", function (event,d) {
                    const pathNode = this;
                    const pathData = d;
                    const [mouseX, mouseY] = d3.pointer(event);
                    const threshold = 100;
                    let closestPoint = { x: 0, y: 0 };
                    let closestDistance = Infinity;
                    let closestDataIndex = null;
                    let interpolatedY = 0;
                    // Iterate over data points, which represent the segments
                    for (let i = 0; i < data.length - 1; i++) {
                        const start = pathNode.getPointAtLength(i * pathNode.getTotalLength() / (data.length - 1));
                        const end = pathNode.getPointAtLength((i + 1) * pathNode.getTotalLength() / (data.length - 1));

                        // Find the mid-point of the segment
                        const midX = (start.x + end.x) / 2;
                        const midY = (start.y + end.y) / 2;

                        const distance = Math.sqrt(Math.pow(mouseX - midX, 2) + Math.pow(mouseY - midY, 2));

                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestDataIndex = i;
                            // Linear interpolation to find the Y value at mouseX
                            interpolatedY = (mouseX - start.x) / (end.x - start.x);
                            const interpolatedX = start.x + interpolatedY * (end.x - start.x);
                            const interpolatedSegmentY = start.y + interpolatedY * (end.y - start.y);
                            closestPoint.x = interpolatedX;
                            closestPoint.y = interpolatedSegmentY;
                        }
                    }
                    if (closestDistance < threshold) {
                        const name = d3.select(this).attr("name");
                        const segmentDataStart = pathData[closestDataIndex];
                        const segmentDataEnd = pathData[closestDataIndex + 1];
                        const val = segmentDataStart.value + (segmentDataEnd.value - segmentDataStart.value) * interpolatedY;
                        tooltip
                            .attr("x", mouseX)
                            .attr("y", mouseY)
                            .text(`${name}: ${val.toFixed(2)}`)
                            .attr("visibility", "visible");
                        circle_mouseover
                            .attr("cx", closestPoint.x)
                            .attr("cy", closestPoint.y)
                            .attr("visibility", "visible");
                        const height = +svg.attr("height");
                        guideline
                            .attr("x1", closestPoint.x)
                            .attr("y1", thisBlock.scaleY(100))
                            .attr("x2", closestPoint.x)
                            .attr("y2", thisBlock.scaleY(0))
                            .attr("visibility", "visible");
                    }
                    else {
                        hideTooltipTimeout = setTimeout(() => {
                            tooltip.attr("visibility", "hidden");
                            circle_mouseover.attr("visibility", "hidden");
                            guideline.attr("visibility", "hidden"); 
                        }, 500);
                    }
                })
        });
        // Assuming you've already selected your SVG
        const svg = thisBlock.svg;
        const tooltip = svg.append("text")
            .attr("visibility", "hidden")
            .attr("text-anchor", "middle")
            .attr("dy", "-1em") // Position above the mouse pointer
            .style("font-size", "12px")
            .style("background-color", "white");
        const circle_mouseover = svg.append("circle")
            .attr("r", 3)  // Radius of circle
            .attr("fill", "none")  // No fill
            .attr("stroke", "red") // Blue stroke color
            .attr("stroke-width", 1) // Width of the stroke, adjust as needed
            .attr("visibility", "hidden");
        const guideline = svg.append("line")
            .attr("stroke", "blue")
            .attr("stroke-dasharray", "2,2") 
            .attr("stroke-width", 1)
            .attr("visibility", "hidden");
        // Hide tooltip on mouse out of the SVG
        svg.on("mouseout", function () {
            hideTooltipTimeout = setTimeout(() => {
                tooltip.attr("visibility", "hidden");
                circle_mouseover.attr("visibility", "hidden");
                guideline.attr("visibility", "hidden"); 
            }, 500);
        });
        // Drawing legend
        let legend = thisBlock.svg.selectAll(".legend")
            .data(Array.from(thisBlock.metrics.map.keys()))
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + (20 * i) + ")");

        legend.append("rect")
            .attr("x", 480)
            .attr("y", 10)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => thisBlock.metrics.Colors(d));

        legend.append("text")
            .attr("x", 500)
            .attr("y", 20)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d);
    }//end renderGraph

}
customElements.define("metrics-block", MetricsBlock);

