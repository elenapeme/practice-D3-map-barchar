const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

d3.json("./practica_airbnb.json").then((madrid) => {
    drawGraphs(madrid);

});

let pathMadrid;
const drawGraphs = (madrid) =>{
    // Map of Madrid &  avg prices
    //Set variables
    const borderTop = 20;
    const borderLeft = 20;
    const borderBottom = 20;
    const borderRight = 20;
    const width = windowWidth / 2;
    const dataFeatures = madrid.features;

    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", windowHeight);

    const projection = d3.geoMercator()
        .fitSize([width - borderLeft - borderRight, windowHeight - borderTop - borderBottom], madrid);

    const toolTip = d3.select("#map").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("padding", "7px")
        .style("background-color", "white");

    // Colors
    const colorList = d3.schemePaired.slice(0, 6);
    const scaleColorMap = d3.scaleQuantize()
        .domain([0, d3.max(dataFeatures, d => d.properties.avgprice)])
        .range(colorList);

    pathMadrid = svg.append("g")
        .selectAll('path')
        .data(dataFeatures)
        .enter()
        .append("path")
        .attr('d', d3.geoPath().projection(projection))
        .attr('fill', (d) => {
            const priceCondition = d.properties.avgprice || 0;
            return scaleColorMap(priceCondition);
        });

    pathMadrid.on("mouseover", (d) => {
        const name = d.properties.name;
        const price = d.properties.avgprice || 0;

        toolTip.transition()
            .duration(100)
            .style("visibility", "visible")
            .style("opacity", .9)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 30) + "px")
            .text(name +" : "+ price + " euros");
    }).on("mouseout", () => {
        toolTip.style("visibility", "hidden");
    });

    //Creation of the bar chart
    barChart(madrid.features[0].properties.avgbedrooms);

};

const barChart = (avgbedrooms) => {
    // Bar chart avg bedrooms
    var top = 55;
    var width = windowWidth / 2;
    var height = windowHeight - top;

    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', windowHeight);

    var scaleX = d3.scaleBand()
        .range([50, width])
        .padding(0.1);

    var scaleY = d3.scaleLinear()
        .range([height, top]);

    var scaleColorBar = d3.scaleOrdinal(d3.schemeCategory10);


    var xAxis = d3.axisBottom(scaleX).tickSizeOuter(0);
    var yAxis = d3.axisLeft(scaleY);
    console.log(pathMadrid);
    pathMadrid
        .on("click", d => changeBar(d.properties.avgbedrooms));


    changeBar(avgbedrooms);


    svg.append("g")
        .attr('class', 'axisX')
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr('class', 'axisY')
        .attr("transform", "translate(50, 0)")
        .call(yAxis);

    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + 30) + ")")
        .style("text-anchor", "middle")
        .text("NÚMERO DE HABITACIONES");

    svg.append("text")
        .attr("x", 50)
        .attr("dy", "1em")
        .text("NÚMERO DE PROPIEDADES");

    // Function to change neighbour
    function changeBar(avgbedrooms) {
        const numberSpeed = 800;
        scaleX.domain(avgbedrooms.map(d => d.bedrooms));
        scaleY.domain([0, d3.max(avgbedrooms, d => d.total)]).nice();


        svg.selectAll('rect').remove();
        svg.selectAll('.recttext').remove();
        svg.selectAll(".axisY")
            .transition()
            .duration(numberSpeed)
            .call(yAxis);
        svg.selectAll(".axisX")
            .transition()
            .duration(numberSpeed)
            .call(xAxis);

        var rect = svg.append("g")
            .selectAll('rect')
            .data(avgbedrooms)
            .enter()
            .append('rect')
            .attr('x', d => scaleX(d.bedrooms))
            .attr('width', scaleX.bandwidth())
            .attr('y', height)
            .attr('fill', d => scaleColorBar(d.bedrooms));

        rect
            .transition()
            .duration(numberSpeed)
            .ease(d3.easeLinear)
            .attr('y', d => scaleY(d.total))
            .attr('height', d => scaleY(0) - scaleY(d.total));

        const text = svg.append("g")
            .selectAll('text')
            .data(avgbedrooms)
            .enter()
            .append("text")
            .attr('class', 'recttext')
            .text((d) => d.total)
            .attr('x', function(d) {
                const textLength = this.getComputedTextLength();
                return scaleX(d.bedrooms) + scaleX.bandwidth() / 2 - textLength / 2;
            })
            .attr('y', height)
            .attr('fill', 'black');

        text
            .transition()
            .duration(numberSpeed)
            .ease(d3.easeLinear)
            .attr('y', (d) => {
                const borderTop = 15;
                const y = scaleY(d.total) + borderTop;
                if (y > height) {
                    return height;
                } else {
                    return y;
                }
            })

    }
};