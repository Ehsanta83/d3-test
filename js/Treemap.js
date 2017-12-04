// @see https://bl.ocks.org/ganezasan/52fced34d2182483995f0ca3960fe228

function treemap()
{
    var self = {};
    self.state = {};
    self.state.data = {};
    self.state.data.url = "http://localhost/d3-test/data/Treemap.json";
    self.state.id = "treemap";
    self.state.data.width = 960;
    self.state.data.height =  500;

    d3.json( self.state.data.url, function( error, p_chartdata ) {
        if (error) throw error;
        const l_margin = {top: 40, right: 10, bottom: 10, left: 10},
              l_width = self.state.data.width - l_margin.left - l_margin.right,
              l_height = self.state.data.height - l_margin.top - l_margin.bottom,
              l_color = d3.scaleOrdinal().range(d3.schemeCategory20c),
              l_treemap = d3.treemap().size([l_width, l_height]),
              l_chart = d3.select( "#" + self.state.id + "-chart" )
                  .style( "position", "relative")
                  .style( "width", ( l_width + l_margin.left + l_margin.right) + "px" )
                  .style( "height", ( l_height + l_margin.top + l_margin.bottom) + "px" )
                  .style( "left", l_margin.left + "px" )
                  .style( "top", l_margin.top + "px" ),
              l_root = d3.hierarchy(p_chartdata.data, (d) => d.children)
                  .sum((d) => d.size),
              l_tree = l_treemap(l_root);

              l_node = l_chart.datum(l_root).selectAll(".node")
                      .data(l_tree.leaves())
                  .enter().append("div")
                      .attr("class", "node")
                      .style("left", (d) => d.x0 + "px")
                      .style("top", (d) => d.y0 + "px")
                      .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                      .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
                      .style("background", (d) => l_color(d.parent.data.name))
                      .text((d) => d.data.name);

              d3.selectAll("input").on("change", function change() {
                  const value = this.value === "count"
                      ? (d) => { return d.size ? 1 : 0;}
                      : (d) => { return d.size; };

                  const newRoot = d3.hierarchy(p_chartdata.data, (d) => d.children)
                      .sum(value);

                  l_node.data(l_treemap(newRoot).leaves())
                      .transition()
                          .duration(1500)
                          .style("left", (d) => d.x0 + "px")
                          .style("top", (d) => d.y0 + "px")
                          .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                          .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
              });

        const l_container = d3.select( "#" + self.state.id + "-parent" );
        l_container.select( function() { return this.parentNode } ).style( "overflow", "scroll" );
        l_container.selectAll( ".node" ).style( "border", "solid 1px white" )
                                        .style( "font", "10px sans-serif" )
                                        .style( "line-height", "12px" )
                                        .style( "overflow", "hidden" )
                                        .style( "position", "absolute" )
                                        .style( "text-indent", "2px" );

    });
};

treemap();
