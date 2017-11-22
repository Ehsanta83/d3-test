// @see https://bl.ocks.org/mbostock/3884955

var self = {};
self.state = {};
self.state.data = {};
self.state.data.url = "http://localhost/d3-test/data/MultiSeriesLine.json";
self.state.data.showxaxis = true;
self.state.data.showyaxis = true;
self.state.id = "multiseriesline";
self.state.data.width = 960;
self.state.data.height =  500;

d3.json( self.state.data.url, function(error, p_chartdata) {
    if (error) throw error;
    const l_margin = {top: 20, right: 80, bottom: 30, left: 50},
          l_width = self.state.data.width - l_margin.left - l_margin.right,
          l_height = self.state.data.height - l_margin.top - l_margin.bottom,
          l_data = {
              x: d3.scaleTime().range( [0, l_width] ),
              y: d3.scaleLinear().range( [l_height, 0] ),
              z: d3.scaleOrdinal( d3.schemeCategory10 )

          },
          l_chart = d3.select( "#" + self.state.id + "-chart" )
                      .style( "width", l_width + l_margin.left + l_margin.right + "px" )
                      .style( "height", l_height + l_margin.top + l_margin.bottom + "px" )
          l_g = l_chart.append( "g" )
                       .attr( "transform", "translate(" + l_margin.left + "," + l_margin.top + ")" ),
          l_parseTime = d3.timeParse( "%Y%m%d" ),
          l_line = d3.line()
                     .curve( d3.curveBasis )
                     .x(function(d) { return l_data.x( d.date ); } )
                     .y(function(d) { return l_data.y( d.temperature ); } ),
          l_series = p_chartdata.key.map(function(id) {
              return {
                  id: id,
                  values: p_chartdata.data.map(function(d) {
                      return {date: l_parseTime(d.date), temperature: +d[id]};
                  })
              };
          });

    l_data.x.domain( d3.extent( p_chartdata.data, function( d ) { return l_parseTime( d.date ); } ) );
    l_data.y.domain( [
        d3.min( l_series, function( c ) { return d3.min( c.values, function( d ) { return d.temperature; } ); } ),
        d3.max( l_series, function( c ) { return d3.max( c.values, function( d ) { return d.temperature; } ); } )
    ] );
    l_data.z.domain( l_series.map( function( c ) { return c.id; } ) );

    if ( self.state.data.showxaxis )
        l_g.append( "g" )
            .attr( "class", "axis axis--x" )
            .attr( "transform", "translate(0," + l_height + ")" )
            .call( d3.axisBottom( l_data.x ) );

    if ( self.state.data.showyaxis )
        l_g.append( "g" )
                .attr( "class", "axis axis--y" )
                .call( d3.axisLeft( l_data.y ) )
            .append( "text" )
                .attr( "transform", "rotate(-90)" )
                .attr( "y", 6 )
                .attr( "dy", "0.71em" )
                .attr( "fill", "#000" )
                .text( "Temperature, ºF" );

    var l_serie = l_g.selectAll( ".city" )
        .data( l_series )
        .enter().append( "g" )
            .attr( "class", "city" );

    l_serie.append( "path" )
        .attr( "class", "line" )
        .attr( "d", function( d ) { return l_line( d.values ); } )
        .style( "stroke", function( d ) { return l_data.z( d.id ); } );

    l_serie.append( "text" )
        .datum( function( d ) { return { id: d.id, value: d.values[d.values.length - 1] }; } )
        .attr( "transform", function( d ) { return "translate(" + l_data.x( d.value.date ) + "," + l_data.y( d.value.temperature ) + ")"; } )
        .attr( "x", 3 )
        .attr( "dy", "0.35em" )
        .style( "font", "10px sans-serif" )
        .text( function( d ) { return d.id; } );

    d3.select( "#" + self.state.id + "-chart" ).select( function() { return this.parentNode } ).style( "overflow", "scroll" );
    l_chart.selectAll( ".axis--x path" ).style( "display", "none" );
    l_chart.selectAll( ".line" ).style( "fill", "none" )
                                .style( "stroke-width", "1.5px" );
});
