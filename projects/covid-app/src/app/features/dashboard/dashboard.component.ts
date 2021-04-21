import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart', { static: true }) chart: ElementRef;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.createChart();
  }

  
  createChart() {
    const width = 1000;
    const height = 700;

    // The Map
    // const map = mapContainer
    // .append('svg')
    // .attr('padding', 'none')
    // .attr('height', height)
    // .attr('width', width)
    // .attr('border', '1px solid black')
    // .attr('margin-left', '16px')
    // .attr('preserveAspectRatio', 'xMinYMin meet')
    // // This is for when you zoom on the background, it will zoom
    // .call(zoom)
    // // This is going to be the country group
    // .append('g');

    let svg = d3.select(this.chart.nativeElement).append('svg');

    var projection = d3
      .geoMercator()
      .translate([width / 2, height / 1.4]) // translate to center of screen. You might have to fiddle with this
      .scale([150]);

    var path = d3.geoPath().projection(projection);

    // TODO: Get states also and show on zoom:
    //TODO:  http://bl.ocks.org/MaciejKus/61e9ff1591355b00c1c1caf31e76a668
    // TODO: above data comes from github: https://github.com/owid/covid-19-data/tree/master/public/data/
    this.http
      .get(
        '../../../assets/data/countries.json' /*https://gist.githubusercontent.com/GordyD/49654901b07cb764c34f/raw/27eff6687f677c984a11f25977adaa4b9332a2a9/countries-and-states.json'*/ /*('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json'*/
      )
      .subscribe((world) => {
        console.log(world);
        let svgG = svg.attr('width', width).attr('height', height).append('g');

        this.http.get('../../../assets/data/owid-covid-data.json').subscribe(console.log)

        const countries = topojson.feature(
          world,
          (world as any).objects.countries
        ).features;
        svgG
          .selectAll('path')
          .data(countries)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('class', 'country')
          .on('mousedown', (event, d) => {
            const node = d3.select(event.currentTarget);
            // node.attr('transform', 'scale(1.5)')
            /* transform="translate(-33.925962254490855,-144.64600554243407) scale(1.5932801925711724)"*/
            console.log(d);
            console.log(event);
            console.log(d.properties.name);

            // https://stackoverflow.com/questions/25310390/how-does-path-bounds-work
            var bounds = path.bounds(d),
              dx = bounds[1][0] - bounds[0][0],
              dy = bounds[1][1] - bounds[0][1],
              x = (bounds[0][0] + bounds[1][0]) / 2,
              y = (bounds[0][1] + bounds[1][1]) / 2,
              scale = 0.9 / Math.max(dx / width, dy / height),
              translate = [width / 2 - scale * x, height / 2 - scale * y];

            node.attr(
              'transform',
              `translate(${translate[0]}, ${translate[1]}) scale(${scale})`
            );
          });

        const zoom = d3
          .zoom()
          .on('zoom', (event) => {
            svgG.attr('transform', event.transform);
          })
          .scaleExtent([1, 40]);
        svg.call(zoom);

        const states = topojson.feature(world, (world as any).objects.states)
          .features;

        // console.log((world as any).objects)
        svgG
          .append('g')
          .attr('class', 'boundary state hidden')
          .selectAll('boundary')
          .data(states)
          .enter()
          .append('path')
          .attr('name', function (d) {
            return d.properties.name;
          })
          .attr('id', function (d) {
            return d.id;
          })
          // .on('click', selected)
          // .on("mousemove", showTooltip)
          // .on("mouseout",  function(d,i) {
          //     tooltip.classed("hidden", true);
          //  })
          .attr('d', path);
      });

      /* // ! show states on zoom level
      
    function zoomed() {
      var t = d3.event.translate;
      s = d3.event.scale;
      var h = 0;

      t[0] = Math.min(
        (width / height) * (s - 1),
        Math.max(width * (1 - s), t[0])
      );

      t[1] = Math.min(
        h * (s - 1) + h * s,
        Math.max(height * (1 - s) - h * s, t[1])
      );

      zoom.translate(t);
      if (s === 1 && mouseClicked) {
        rotateMap(d3.mouse(this)[0]);
        return;
      }

      g.attr('transform', 'translate(' + t + ')scale(' + s + ')');

      //adjust the stroke width based on zoom level
      d3.selectAll('.boundary').style('stroke-width', 1 / s);

      //toggle state/USA visability
      if (s > 1.5) {
        states.classed('hidden', false);
        usa.classed('hidden', true);
        canada.classed('hidden', true);
      } else {
        states.classed('hidden', true);
        usa.classed('hidden', false);
        canada.classed('hidden', false);
      }
    }*/
  }

  // TODO: Data location: https://ourworldindata.org/coronavirus-source-data

  // Adding circles overlaying countries for population
  // Todo http://bl.ocks.org/almccon/1bcde7452450c153d8a0684085f249fd
  // ? Another https://stackoverflow.com/questions/58649544/d3-js-v5-unable-to-get-data-points-to-show-on-map-of-us

  // this centers a map
  // TODO: https://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object

  /* show / hide states*/
  //TODO:  http://bl.ocks.org/MaciejKus/61e9ff1591355b00c1c1caf31e76a668
  /*
  var width = 962,
        rotated = 90,
        height = 502;

    //countries which have states, needed to toggle visibility
    //for USA/ etc. either show countries or states, not both
    var usa, canada; 
    var states; //track states
    //track where mouse was clicked
    var initX;
    //track scale only rotate when s === 1
    var s = 1;
    var mouseClicked = false;


    var projection = d3.geo.mercator()
        .scale(153)
        .translate([width/2,height/1.5])
        .rotate([rotated,0,0]); //center on USA because 'murica

    var zoom = d3.behavior.zoom()
         .scaleExtent([1, 20])
         .on("zoom", zoomed);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
          //track where user clicked down
          .on("mousedown", function() {
             d3.event.preventDefault(); 
             //only if scale === 1
             if(s !== 1) return;
               initX = d3.mouse(this)[0];
               mouseClicked = true;
          })
          .on("mouseup", function() {
              if(s !== 1) return;
              rotated = rotated + ((d3.mouse(this)[0] - initX) * 360 / (s * width));
              mouseClicked = false;
          })
        .call(zoom);


      function rotateMap(endX) {
        projection.rotate([rotated + (endX - initX) * 360 / (s * width),0,0])
            g.selectAll('path')       // re-project path data
           .attr('d', path);
      }
    //for tooltip 
    var offsetL = document.getElementById('map').offsetLeft+10;
    var offsetT = document.getElementById('map').offsetTop+10;

    var path = d3.geo.path()
        .projection(projection);

    var tooltip = d3.select("#map")
         .append("div")
         .attr("class", "tooltip hidden");

    //need this for correct panning
    var g = svg.append("g");

    //det json data and draw it
    d3.json("combined2.json", function(error, world) {
      if(error) return console.error(error);

      //countries
      g.append("g")
          .attr("class", "boundary")
        .selectAll("boundary")
          .data(topojson.feature(world, world.objects.countries).features)
          .enter().append("path")
          .attr("name", function(d) {return d.properties.name;})
          .attr("id", function(d) { return d.id;})
          .on('click', selected)
          .on("mousemove", showTooltip)
          .on("mouseout",  function(d,i) {
              tooltip.classed("hidden", true);
           })
          .attr("d", path);

      usa = d3.select('#USA');
      canada = d3.select('#CAN');
        
      //states
      g.append("g")
          .attr("class", "boundary state hidden")
        .selectAll("boundary")
          .data(topojson.feature(world, world.objects.states).features)
          .enter().append("path")
          .attr("name", function(d) { return d.properties.name;})
          .attr("id", function(d) { return d.id;})
          .on('click', selected)
          .on("mousemove", showTooltip)
          .on("mouseout",  function(d,i) {
              tooltip.classed("hidden", true);
           })
          .attr("d", path);

      states = d3.selectAll('.state');
    });

    function showTooltip(d) {
      label = d.properties.name;
      var mouse = d3.mouse(svg.node())
        .map( function(d) { return parseInt(d); } );
      tooltip.classed("hidden", false)
        .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
        .html(label);
    }

    function selected() {
      d3.select('.selected').classed('selected', false);
      d3.select(this).classed('selected', true);
    }


    function zoomed() {
      var t = d3.event.translate;
      s = d3.event.scale; 
      var h = 0;

      t[0] = Math.min(
        (width/height)  * (s - 1), 
        Math.max( width * (1 - s), t[0] )
      );

      t[1] = Math.min(
        h * (s - 1) + h * s, 
        Math.max(height  * (1 - s) - h * s, t[1])
      );

      zoom.translate(t);
      if(s === 1 && mouseClicked) {
        rotateMap(d3.mouse(this)[0])
        return;
      }

      g.attr("transform", "translate(" + t + ")scale(" + s + ")");

      //adjust the stroke width based on zoom level
      d3.selectAll(".boundary")
        .style("stroke-width", 1 / s);
      
      //toggle state/USA visability
      if(s > 1.5) {
        states
          .classed('hidden', false);
        usa
          .classed('hidden', true);
        canada
          .classed('hidden', true);
      } else {
      states
        .classed('hidden', true);
      usa
        .classed('hidden', false);
      canada
        .classed('hidden', false);
    }
  }*/
}
