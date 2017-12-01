// @see https://bl.ocks.org/mbostock/3883245

function linechart()
{
    var self = {};
    self.state = {};
    self.state.data = {};
    self.state.data.url = "http://localhost/d3-test/data/LineChart.json";
    self.state.data.showxaxis = true;
    self.state.data.showyaxis = true;
    self.state.id = "linechart";
    self.state.data.width = 960;
    self.state.data.height =  500;

    d3.json( self.state.data.url, function(error, p_chartdata) {
        if (error) throw error;
        const l_margin = {top: 20, right: 20, bottom: 30, left: 50},
              l_width = self.state.data.width - l_margin.left - l_margin.right,
              l_height = self.state.data.height - l_margin.top - l_margin.bottom,
              l_data = {
                  x: d3.scaleTime().rangeRound( [0, l_width] ),
                  y: d3.scaleLinear().rangeRound( [l_height, 0] )
              },
              l_chart = d3.select( "#" + self.state.id + "-chart" )
                          .style( "width", l_width + l_margin.left + l_margin.right + "px" )
                          .style( "height", l_height + l_margin.top + l_margin.bottom + "px" )
              l_g = l_chart.append( "g" )
                           .attr( "transform", "translate(" + l_margin.left + "," + l_margin.top + ")" ),
              l_parseTime = d3.timeParse( "%d-%b-%y" ),
              l_line = d3.line()
                         .x(function( d ) { return l_data.x( d.date ); } )
                         .y(function( d ) { return l_data.y( d.close ); } ),
              l_chartdata = p_chartdata.data.map( function( d ) {
                  return { date: l_parseTime( d.date ), close: +d.close };
              });

        l_data.x.domain( d3.extent( l_chartdata, function( d ) { return d.date; } ) );
        l_data.y.domain( d3.extent( l_chartdata, function( d ) { return d.close; } ) );

        if ( self.state.data.showxaxis )
            l_g.append( "g" )
                    .attr( "transform", "translate(0," + l_height + ")" )
                    .call( d3.axisBottom( l_data.x ) )
                .select( ".domain" )
                      .remove();

        if ( self.state.data.showyaxis )
            l_g.append( "g" )
                   .call( d3.axisLeft( l_data.y ) )
               .append( "text" )
                   .attr( "fill", "#000" )
                   .attr( "transform", "rotate(-90)" )
                   .attr( "y", 6 )
                   .attr( "dy", "0.71em" )
                   .attr( "text-anchor", "end" )
                   .text( p_chartdata.xaxistext );

        l_g.append( "path" )
              .datum( l_chartdata )
              .attr( "fill", "none" )
              .attr( "stroke", "steelblue" )
              .attr( "stroke-linejoin", "round" )
              .attr( "stroke-linecap", "round" )
              .attr( "stroke-width", 1.5 )
              .attr( "d", l_line );

        d3.select( "#" + self.state.id + "-chart" ).select( function() { return this.parentNode } ).style( "overflow", "scroll" );
    });
};

linechart();
