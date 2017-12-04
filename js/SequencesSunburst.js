// @see https://bl.ocks.org/kerryrodden/766f8f6d31f645c39f488a0befa1e3c8

function sequencessunburst()
{
    var self = {};
    self.state = {};
    self.state.data = {};
    self.state.data.url = "http://localhost/d3-test/data/SequencesSunburst.json";
    self.state.id = "sequencessunburst";
    self.state.data.width = 960;
    self.state.data.height =  700;

    d3.json( self.state.data.url, function(error, p_chartdata) {
        if (error) throw error;

        const l_chart = d3.select( "#" + self.state.id );

        // Dimensions of sunburst.
        var width = p_chartdata.sunburstwidth;
        var height = p_chartdata.sunburstheight;
        var radius = Math.min(width, height) / 2;

        // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
        var b = {
            w: 75, h: 30, s: 3, t: 10
        };

        // Mapping of step names to colors.
        var colors = p_chartdata.color;

        // Total size of all segments; we set this later, after loading the data.
        var totalSize = 0;

        var vis = l_chart.select("#" + self.state.id + "-chart").append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .append("svg:g")
            .attr("id", "#" + self.state.id + "-container")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var partition = d3.partition()
            .size([2 * Math.PI, radius * radius]);

        var arc = d3.arc()
            .startAngle(function(d) { return d.x0; })
            .endAngle(function(d) { return d.x1; })
            .innerRadius(function(d) { return Math.sqrt(d.y0); })
            .outerRadius(function(d) { return Math.sqrt(d.y1); });

        createVisualization(p_chartdata.data);

        // Main function to draw and set up the visualization, once we have the data.
        function createVisualization(json) {
            // Basic setup of page elements.
            initializeBreadcrumbTrail();
            drawLegend();
            l_chart.select("#" + self.state.id + "-togglelegend").on("click", toggleLegend);

            // Bounding circle underneath the sunburst, to make it easier to detect
            // when the mouse leaves the parent g.
            vis.append("svg:circle")
                .attr("r", radius)
                .style("opacity", 0);

            // Turn the data into a d3 hierarchy and calculate the sums.
            var root = d3.hierarchy(json)
                .sum(function(d) { return d.size; })
                .sort(function(a, b) { return b.value - a.value; });

            // For efficiency, filter nodes to keep only those large enough to see.
            var nodes = partition(root).descendants()
                .filter(function(d) {
                    return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
                });

            var path = vis.data([json]).selectAll("path")
                .data(nodes)
                .enter().append("svg:path")
                .attr("display", function(d) { return d.depth ? null : "none"; })
                .attr("d", arc)
                .attr("fill-rule", "evenodd")
                .style("fill", function(d) { return colors[d.data.name]; })
                .style("opacity", 1)
                .on("mouseover", mouseover);

            // Add the mouseleave handler to the bounding circle.
            l_chart.select("#" + self.state.id + "-container").on("mouseleave", mouseleave);

            // Get total size of the tree = value of root node from partition.
            totalSize = path.datum().value;
         };

        // Fade all but the current sequence, and show it in the breadcrumb trail.
        function mouseover(d) {
            var percentage = (100 * d.value / totalSize).toPrecision(3);
            var percentageString = percentage + "%";
            if (percentage < 0.1) {
                percentageString = "< 0.1%";
            }

            l_chart.select("#" + self.state.id + "-percentage")
                .text(percentageString);

            l_chart.select("#" + self.state.id + "-explanation")
                .style("visibility", "");

            var sequenceArray = d.ancestors().reverse();
            sequenceArray.shift(); // remove root node from the array
            updateBreadcrumbs(sequenceArray, percentageString);

            // Fade all the segments.
            l_chart.selectAll("path")
                .style("opacity", 0.3);

            // Then highlight only those that are an ancestor of the current segment.
            vis.selectAll("path")
                .filter(function(node) {
                    return (sequenceArray.indexOf(node) >= 0);
                })
                .style("opacity", 1);
        }

        // Restore everything to full opacity when moving off the visualization.
        function mouseleave(d) {
            // Hide the breadcrumb trail
            l_chart.select("#trail")
                .style("visibility", "hidden");

            // Deactivate all segments during transition.
            l_chart.selectAll("path").on("mouseover", null);

            // Transition each segment to full opacity and then reactivate it.
            l_chart.selectAll("path")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .on("end", function() {
                    d3.select(this).on("mouseover", mouseover);
                });

            l_chart.select("#" + self.state.id + "-explanation")
                .style("visibility", "hidden");
        }

        function initializeBreadcrumbTrail() {
            // Add the svg area.
            var trail = l_chart.select("#" + self.state.id + "-sequence").append("svg:svg")
                .attr("width", width)
                .attr("height", 50)
                .attr("id", "trail");
            // Add the label at the end, for the percentage.
            trail.append("svg:text")
              .attr("id", "endlabel")
              .style("fill", "#000");
        }

        // Generate a string that describes the points of a breadcrumb polygon.
        function breadcrumbPoints(d, i) {
            var points = [];
            points.push("0,0");
            points.push(b.w + ",0");
            points.push(b.w + b.t + "," + (b.h / 2));
            points.push(b.w + "," + b.h);
            points.push("0," + b.h);
            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                points.push(b.t + "," + (b.h / 2));
            }
            return points.join(" ");
        }

        // Update the breadcrumb trail to show the current sequence and percentage.
        function updateBreadcrumbs(nodeArray, percentageString) {
            // Data join; key function combines name and depth (= position in sequence).
            var trail = l_chart.select("#trail")
                .selectAll("g")
                .data(nodeArray, function(d) { return d.data.name + d.depth; });

            // Remove exiting nodes.
            trail.exit().remove();

            // Add breadcrumb and label for entering nodes.
            var entering = trail.enter().append("svg:g");

            entering.append("svg:polygon")
                .attr("points", breadcrumbPoints)
                .style("fill", function(d) { return colors[d.data.name]; });

            entering.append("svg:text")
                .attr("x", (b.w + b.t) / 2)
                .attr("y", b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(function(d) { return d.data.name; });

            // Merge enter and update selections; set position for all nodes.
            entering.merge(trail).attr("transform", function(d, i) {
                return "translate(" + i * (b.w + b.s) + ", 0)";
            });

            // Now move and update the percentage at the end.
            l_chart.select("#trail").select("#endlabel")
                .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
                .attr("y", b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(percentageString);

            // Make the breadcrumb trail visible, if it's hidden.
            l_chart.select("#trail")
                .style("visibility", "");

        }

        function drawLegend() {
            // Dimensions of legend item: width, height, spacing, radius of rounded rect.
            var li = {
                w: 75, h: 30, s: 3, r: 3
            };

            var legend = l_chart.select("#" + self.state.id + "-legend").append("svg:svg")
                .attr("width", li.w)
                .attr("height", d3.keys(colors).length * (li.h + li.s));

            var g = legend.selectAll("g")
                .data(d3.entries(colors))
                .enter().append("svg:g")
                .attr("transform", function(d, i) {
                    return "translate(0," + i * (li.h + li.s) + ")";
                });

            g.append("svg:rect")
                .attr("rx", li.r)
                .attr("ry", li.r)
                .attr("width", li.w)
                .attr("height", li.h)
                .style("fill", function(d) { return d.value; });

            g.append("svg:text")
                .attr("x", li.w / 2)
                .attr("y", li.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(function(d) { return d.key; });
        }

        function toggleLegend() {
            var legend = l_chart.select("#" + self.state.id + "-legend");
            if (legend.style("visibility") == "hidden")
            {
                legend.style("visibility", "");
            }
            else
            {
                legend.style("visibility", "hidden");
            }
        }

        l_chart.select( function() { return this.parentNode } ).style( "overflow", "scroll" );
        l_chart.style( "font-family", "Open Sans', sans-serif" )
               .style( "font-size", "12px" )
               .style( "font-weight", "400" )
               .style( "background-color", "#fff" )
               .style( "width", self.state.data.width + "px" )
               .style( "height", self.state.data.height + "px" )
               .style( "margin-top", "10px" );
        l_chart.selectAll( "#" + self.state.id + "-main" ).style( "float", "left" )
                                    .style( "width", self.state.data.width );
        l_chart.selectAll( "#" + self.state.id + "-sidebar" ).style( "float", "right" )
                                       .style( "width", "100px" );
        l_chart.selectAll( "#" + self.state.id + "-sequence" ).style( "width", self.state.data.width - 100 + "px" )
                                        .style( "height", "70px" );
        l_chart.selectAll( "#" + self.state.id + "-legend" ).style( "padding", "10px 0 0 3px" );
        l_chart.selectAll( "#" + self.state.id + "-sequence text, #legend text" ).style( "", "" )
                                                           .style( "", "" );
        l_chart.selectAll( "#" + self.state.id + "-chart" ).style( "position", "relative" );
        l_chart.selectAll( "#" + self.state.id + "-chart path" ).style( "stroke", "#fff" );
        l_chart.selectAll( "#" + self.state.id + "-explanation" ).style( "position", "absolute" )
                                           .style( "top", "260px" )
                                           .style( "left", "305px" )
                                           .style( "width", "140px" )
                                           .style( "text-align", "center" )
                                           .style( "color", "#666" );
        l_chart.selectAll( "#" + self.state.id + "-percentage" ).style( "font-size", "2.5em" );

    });
};

sequencessunburst();
