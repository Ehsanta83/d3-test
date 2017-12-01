// @see https://bl.ocks.org/Fil/6d9de24b31cb870fed2e6178a120b17d

function scatterplotmatrix()
{
    var self = {};
    self.state = {};
    self.state.data = {};
    self.state.data.url = "http://localhost/d3-test/data/ScatterplotMatrix.json";
    self.state.data.showxaxis = true;
    self.state.data.showyaxis = true;
    self.state.id = "scatterplotmatrix";
    self.state.data.width = 960;
    self.state.data.size =  230;
    self.state.data.padding = 20;

    d3.json( self.state.data.url, function(error, p_chartdata) {
        if (error) throw error;
        const l_width = self.state.data.width,
              l_size = self.state.data.size,
              l_padding = self.state.data.padding,
              l_data = {
                  x: d3.scaleLinear().range( [l_padding / 2, l_size - l_padding / 2] ),
                  y: d3.scaleLinear().range( [l_size - l_padding / 2, l_padding / 2] ),

              },
              l_xaxis = d3.axisBottom().scale( l_data.x ).ticks( 6 ),
              l_yaxis = d3.axisLeft().scale( l_data.y ).ticks( 6 ),
              l_color = d3.scaleOrdinal(d3.schemeCategory10),
              l_domainbytrait = {},
              l_traits = d3.keys(p_chartdata.data[0]).filter(function(d) { return d !== "species"; }),
              n = l_traits.length,
              l_chart = d3.select( "#" + self.state.id + "-chart" )
                              .style( "width", l_size * n + l_padding + "px" )
                              .style( "height", l_size * n + l_padding + "px" )
                          .append( "g" )
                              .attr( "transform", "translate(" + l_padding + "," + l_padding / 2 + ")" ),
              l_brush = d3.brush()
                          .on( "start", brushstart )
                          .on( "brush", brushmove )
                          .on( "end", brushend )
                          .extent( [[0,0], [l_size,l_size]] );

        l_traits.forEach( function( l_trait ) {
            l_domainbytrait[l_trait] = d3.extent( p_chartdata.data, function( d ) { return d[l_trait]; } );
        } );
        l_xaxis.tickSize( l_size * n );
        l_yaxis.tickSize( -l_size * n );

        if ( self.state.data.showxaxis )
            l_chart.selectAll( ".x.axis" )
                    .data( l_traits )
                .enter().append( "g" )
                    .attr( "class", "x axis" )
                    .attr( "transform", function( d, i ) { return "translate(" + ( n - i - 1 ) * l_size + ",0)"; } )
                    .each( function( d ) { l_data.x.domain( l_domainbytrait[d] ); d3.select( this ).call( l_xaxis ); } );
        
        if ( self.state.data.showyaxis )
            l_chart.selectAll( ".y.axis" )
                    .data( l_traits )
                .enter().append( "g" )
                    .attr( "class", "y axis" )
                    .attr( "transform", function( d, i ) { return "translate(0," + i * l_size + ")"; } )
                    .each( function( d ) { l_data.y.domain( l_domainbytrait[d] ); d3.select( this ).call( l_yaxis ); } );
                    
        var l_cell = l_chart.selectAll( ".cell" )
                .data( cross( l_traits, l_traits ) )
            .enter().append( "g" )
                .attr( "class", "cell" )
                .attr( "transform", function( d ) { return "translate(" + ( n - d.i - 1 ) * l_size + "," + d.j * l_size + ")"; } )
                .each( plot );
        // Titles for the diagonal.
        l_cell.filter( function( d ) { return d.i === d.j; } ).append( "text" )
            .attr( "x", l_padding )
            .attr( "y", l_padding )
            .attr( "dy", ".71em" )
            .text( function( d ) { return d.x; } );
        l_cell.call( l_brush );

        function plot( p ) {
            var l_cell = d3.select( this );
            l_data.x.domain( l_domainbytrait[p.x] );
            l_data.y.domain( l_domainbytrait[p.y] );
            l_cell.append( "rect" )
                .attr( "class", "frame" )
                .attr( "x", l_padding / 2 )
                .attr( "y", l_padding / 2 )
                .attr( "width", l_size - l_padding )
                .attr( "height", l_size - l_padding );
            l_cell.selectAll( "circle" )
                    .data( p_chartdata.data )
                .enter().append( "circle" )
                    .attr( "cx", function( d ) { return l_data.x( d[p.x] ); } )
                    .attr( "cy", function( d ) { return l_data.y( d[p.y] ); } )
                    .attr( "r", 4 )
                    .style( "fill", function( d ) { return l_color( d.species ); } );
        }

        var l_brushcell;
        // Clear the previously-active brush, if any.
        function brushstart( p ) {
            if ( l_brushcell !== this ) {
                d3.select( l_brushcell ).call( l_brush.move, null );
                l_brushcell = this;
                l_data.x.domain( l_domainbytrait[p.x] );
                l_data.y.domain( l_domainbytrait[p.y] );
            }
        }
        // Highlight the selected circles.
        function brushmove( p ) {
            var e = d3.brushSelection( this );
            l_chart.selectAll( "circle" ).classed( "hidden", function( d ) {
                return !e
                    ? false
                    : (
                        e[0][0] > l_data.x( +d[p.x] ) || l_data.x( +d[p.x] ) > e[1][0]
                        || e[0][1] > l_data.y( +d[p.y] ) || l_data.y( +d[p.y] ) > e[1][1]
                    );
            });
        }
        // If the brush is empty, select all circles.
        function brushend() {
            var e = d3.brushSelection( this );
            if ( e === null ) l_chart.selectAll( ".hidden" ).classed( "hidden", false );
        }
        
        d3.select( "#" + self.state.id + "-chart" ).select( function() { return this.parentNode } ).style( "overflow", "scroll" );
        d3.select( "#" + self.state.id + "-chart" ).style( "font", "10px sans-serif" )
                                                   .style( "padding", "10px" );
        l_chart.selectAll( ".axis, .frame" ).style( "shape-rendering", "crispEdges" );
        l_chart.selectAll( ".axis line" ).style( "stroke", "#ddd" );
        l_chart.selectAll( ".axis path" ).style( "display", "none" );
        l_chart.selectAll( ".cell text" ).style( "font-weight", "bold" )
                                         .style( "text-transform", "capitalize" );
        l_chart.selectAll( ".frame" ).style( "fill", "none" )
                                     .style( "stroke", "#aaa" );
        l_chart.selectAll( "circle" ).style( "fill-opacity", ".7" );
    });

    function cross( a, b ) {
        var c = [], n = a.length, m = b.length, i, j;
        for ( i = -1; ++i < n; ) for ( j = -1; ++j < m; ) c.push( {x: a[i], i: i, y: b[j], j: j} );
        return c;
    }
}

scatterplotmatrix();
