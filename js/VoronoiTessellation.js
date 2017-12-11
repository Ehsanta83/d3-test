// @see https://bl.ocks.org/mbostock/4060366

function voronoitessellation()
{
    var self = {};
    self.state = {};
    self.state.data = {};
    self.state.data.url = "http://localhost/d3-test/data/VoronoiTessellation.json";
    self.state.id = "voronoitessellation";
    self.state.data.width = 960;
    self.state.data.height =  500;

    d3.json( self.state.data.url, function( error, p_chartdata ) {
        if (error) throw error;

        const l_width = self.state.data.width,
              l_height = self.state.data.height,
              l_chart = d3.select( "#" + self.state.id + "-chart" )
                                        .style( "width", l_width + "px" )
                                        .style( "height", l_height + "px" )
                                        .on("touchmove mousemove", moved);

        var sites = p_chartdata.data;
        var voronoi = d3.voronoi()
            .extent([[-1, -1], [l_width + 1, l_height + 1]]);

        var polygon = l_chart.append("g")
            .attr("class", "polygons")
          .selectAll("path")
          .data(voronoi.polygons(sites))
          .enter().append("path")
            .call(redrawPolygon);

        var link = l_chart.append("g")
            .attr("class", "links")
          .selectAll("line")
          .data(voronoi.links(sites))
          .enter().append("line")
            .call(redrawLink);

        var site = l_chart.append("g")
            .attr("class", "sites")
          .selectAll("circle")
          .data(sites)
          .enter().append("circle")
            .attr("r", 2.5)
            .call(redrawSite);

        function moved() {
          sites[0] = d3.mouse(this);
          redraw();
        }

        function redraw() {
          var diagram = voronoi(sites);
          polygon = polygon.data(diagram.polygons()).call(redrawPolygon);
          link = link.data(diagram.links()), link.exit().remove();
          link = link.enter().append("line").merge(link).call(redrawLink);
          site = site.data(sites).call(redrawSite);
        }

        function redrawPolygon(polygon) {
          polygon
              .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
        }

        function redrawLink(link) {
          link
              .attr("x1", function(d) { return d.source[0]; })
              .attr("y1", function(d) { return d.source[1]; })
              .attr("x2", function(d) { return d.target[0]; })
              .attr("y2", function(d) { return d.target[1]; });
        }

        function redrawSite(site) {
          site
              .attr("cx", function(d) { return d[0]; })
              .attr("cy", function(d) { return d[1]; });
        }

        l_chart.selectAll( ".links" ).style( "stroke", "#000" )
                                     .style( "stroke-opacity", "0.2" );
        l_chart.selectAll( ".polygons" ).style( "fill", "none" )
                                     .style( "stroke", "#000" );
        l_chart.selectAll( ".polygons :first-child" ).style( "fill", "#f00" );
        l_chart.selectAll( ".sites" ).style( "fill", "#000" )
                                     .style( "stroke", "#fff" );
        l_chart.selectAll( ".sites :first-child" ).style( "fill", "#fff" );
    });
};

voronoitessellation();
