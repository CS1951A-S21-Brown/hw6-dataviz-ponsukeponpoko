// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;
var curr_genre = 0;
var curr_count = 30;

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Set up reference to count SVG group
let countRef = svg.append("g");

d3.csv("./data/video_games.csv").then(function(data) {
    // Get top 10 global sale
    data = cleanData(data, function(a, b){return parseInt(b.Global_Sales) - parseInt(a.Global_Sales);}, 10);

    let x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {return parseInt(d.Global_Sales);})])
        .range([0, graph_1_width-margin.left - margin.right]);
    let y = d3.scaleBand()
        .domain(data.map(function(d) {return d["Name"];}))
        .range([0, graph_1_height-margin.top - margin.bottom])
        .padding(0.1);
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));
    let bars = svg.selectAll("rect").data(data);
    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d["Name"];}))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 10));
    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d['Name']);}) 
        .attr("x", x(0))
        .attr("y", function(d) {return y(d['Name']);})
        .attr("width", function(d){return x(parseInt(d.Global_Sales));})
        .attr("height",  y.bandwidth());

    let counts = countRef.selectAll("text").data(data);

    // TODO: Render the text elements on the DOM
    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d){return x(parseInt(d.Global_Sales)) + 10;})
        .attr("y", function(d){return y(d.Name) + 12;})
        .style("text-anchor", "start")
        .text(function(d){return d.Global_Sales;});
    
    svg.append("text")
        .attr("transform", `translate(${graph_1_width/2 - 90},${graph_1_height - margin.bottom -10})`)       // HINT: Place this at the bottom middle edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Global Sales");

    // TODO: Add y-axis label
    svg.append("text")
        .attr("transform", `translate(${-margin.left + 20},${graph_1_height/2}) rotate(270)`)       // HINT: Place this at the center left edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "left")
        .style("font-size", 15)
        .text("Game Title");

    // TODO: Add chart title
    svg.append("text")
        .attr("transform", `translate(${graph_1_width/2 - 90},${-margin.top/4})`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Top 10 Best Seller Game");
});

/**
 * Below code is for the 2nd graph!
 */

let regions = ["NA_Sales","EU_Sales","JP_Sales", "Other_Sales"]
let region_name = ["North America", "Europe", "Japan", "Rest of the World"]

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left + 200},${margin.top+100})`);

var radius = Math.min(graph_2_width, graph_2_height)/2 - 30;
let countRef2 = svg2.append("g");
var tooltip = d3.select("#graph2")
    .append('div')
    .attr('class', 'tooltip')
    .attr("opacity", 0);     
tooltip.append('div')
    .attr('class', 'key'); 
tooltip.append('div')
    .attr('class', 'value');
tooltip.append('div')
    .attr('class', 'percent');

function set_data(index){
    svg2.selectAll('*').remove();
    d3.csv("./data/video_games.csv").then(function(data){
        data = d3.nest()
            .key(function(d){return d.Genre;})
            .rollup(function(d){return d3.sum(d, function(c){return parseFloat(c[regions[index]]);});})
            .entries(data);
        data = data.sort(function(x, y){return d3.descending(x.value, y.value);});

        //pie chart referenced from: https://www.d3-graph-gallery.com/graph/pie_annotation.html
        var color = d3.scaleOrdinal().domain(data).range(d3.schemeSet3);
        var pie = d3.pie().value(function(d){return d.value;});
        var pie_data = pie(data);
        var path = svg2.selectAll("mySlices")
            .data(pie_data)
            .enter()
            .append('path')
                .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
                .attr('fill', function(d){ return(color(d.data.key));})
                .attr("stroke", "black")
                .style("stroke-width", "1px")

        //Mouseover referenced from: https://bl.ocks.org/cflavs/ff1c6005fd7edad32641
        path.on('mouseover', function(d){
            var total = d3.sum(data.map(function(d) {return d.value;}));
            var percent = (100 * d.data.value/total).toFixed(2);
            tooltip.select('.key').html("Genre: " + d.data.key)
            tooltip.select('.value').html("Sales: " + d.data.value.toFixed(3));
            tooltip.select('.percent').html(percent + "%");
            tooltip.style('opacity', 0.9);
            tooltip.style('display', 'block'); 
            tooltip.style("left", `${(d3.event.pageX) - 100}px`)
            tooltip.style("top", `${(d3.event.pageY) - 60}px`)
        });
        path.on("mouseout", function(){tooltip.style('display', 'none'); });

        svg2.append("text")
        .attr("transform", `translate(0,-120)`)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Popular Genre in " + region_name[index]);

        svg2.append("text")
        .attr("transform", `translate(250,0)`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Most Popular Genre: " + data[0].key);
    });
}

/**
 * Below code is for the 3rd graph!
 */


let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left + 50},${margin.top})`);
let genres = ["Action","Sports","Shooter", "Platform", "Misc", "Racing", "Role-Playing", "Fighting", "Simulation", "Puzzle", "Adventure", "Strategy"]
var tooltip2 = d3.select("#graph2")
    .append('div')
    .attr('class', 'tooltip')
    .attr("opacity", 0);     
tooltip2.append('div')
    .attr('class', 'key'); 
tooltip2.append('div')
    .attr('class', 'value');
function set_data_2(index, cnt){
    svg3.selectAll('*').remove();
    d3.csv("./data/video_games.csv").then(function(data){
        //Ignore genres that we don't need!
        data = data.filter(function(d){
            if (d.Genre != genres[index]){
                return false;
            }
            return true;
        });
        data = d3.nest()
            .key(function(d){return d.Publisher;})
            .rollup(function(d){return d3.sum(d, function(c){return parseFloat(c["Global_Sales"]);});})
            .entries(data);
        data = data.sort(function(x, y){return d3.descending(x.value, y.value);}).slice(0, cnt);

        var x = d3.scaleLinear()
            .domain([0, Math.round(data[0].value * 1.1)])
            .range([ 0, graph_3_width- 300]);
        
        svg3.append("g")
            .attr("transform", `translate(0,${graph_3_height - 100})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle");

        // make Y axis
        var y = d3.scaleBand()
            .range([ 0, graph_3_height-100])
            .domain(data.map(function(d) { return d.key; }))
            .padding(1);
        svg3.append("g").call(d3.axisLeft(y))

        // make lines
        var path = svg3.selectAll("myline")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", x(0)) //Where in the x value the line should start from (oviously from 0)
            .attr("x2", function(d) { return x(d.value); }) //Where in the x value the line should stop (stop at the circle/value)
            .attr("y1", function(d) { return y(d.key); }) //where the line should head to on the graph (aka towards the circle)
            .attr("y2", function(d) { return y(d.key); })//Where the line starts on the left edge of the graph
            .attr("stroke", "black")
            .style("stroke-width", "2.5px")

        // make circles in lolipop
        var path2 = svg3.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x(d.value); })
            .attr("cy", function(d) { return y(d.key); })
            .attr("r", "5")
            .style("fill", "yellow")
            .attr("stroke", "black")
        
        //Tooktip (mouse hovering) I have two separate tooltip, since 1 is for line and 1 is for the circle
        path.on('mouseover', function(d){
            tooltip.select('.key').html("Company: " + d.key)
            tooltip.select('.value').html("Sales: " + d.value.toFixed(3));
            tooltip.style('opacity', 0.9);
            tooltip.style('display', 'block'); 
            tooltip.style("left", `${(d3.event.pageX) - 100}px`)
            tooltip.style("top", `${(d3.event.pageY) - 60}px`)
            });
        path.on("mouseout", function(){tooltip.style('display', 'none'); });
        path2.on('mouseover', function(d){
            tooltip.select('.key').html("Company: " + d.key)
            tooltip.select('.value').html("Sales: " + d.value.toFixed(3));
            tooltip.select('.percent').html("");
            tooltip.style('opacity', 0.9);
            tooltip.style('display', 'block'); 
            tooltip.style("left", `${(d3.event.pageX) - 100}px`)
            tooltip.style("top", `${(d3.event.pageY) - 60}px`)
            });
        path2.on("mouseout", function(){tooltip.style('display', 'none'); });

        svg3.append("text")
        .attr("transform", `translate(${graph_3_width/2 - 120},${graph_3_height - 50})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Global Sales");

        svg3.append("text")
        .attr("transform", `translate(${-margin.left-15},${graph_3_height/2}) rotate(270)`)
        .style("text-anchor", "left")
        .style("font-size", 15)
        .text("Company");

        svg3.append("text")
        .attr("transform", `translate(${graph_3_width/2 - 120},${-margin.top/4})`)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Top " + cnt +" Best Company of " + genres[index] + " Games");
    });
}

function cleanData(data, comparator, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    data = data.sort(comparator).slice(0, numExamples)
    return data
}

function set_genre(gen){
    curr_genre = gen;
    set_data_2(curr_genre, curr_count);
}

function set_count(){
    var cnt = document.getElementById("inputNum").value;
    if (parseInt(cnt) <51 && parseInt(cnt) > 0){
        curr_count = parseInt(cnt);
        set_data_2(curr_genre, curr_count);
        console.log(cnt);
    }
}

set_data(0);
set_data_2(0, 30);

