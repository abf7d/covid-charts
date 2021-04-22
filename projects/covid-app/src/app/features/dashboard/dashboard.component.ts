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
import { FormGroup, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart', { static: true }) chart: ElementRef;
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  private selectedNode: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get(
        '../../../assets/data/countries.json' /*https://gist.githubusercontent.com/GordyD/49654901b07cb764c34f/raw/27eff6687f677c984a11f25977adaa4b9332a2a9/countries-and-states.json'*/ /*('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json'*/
      )
      .subscribe((world) => {
        const countries = topojson.feature(
          world,
          (world as any).objects.countries
        ).features;
        let svg = d3.select(this.chart.nativeElement).append('svg');
        this.createChart(countries, svg);
      });
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return value;
  }
  selected: any;
  createChart(countries: any[], svg) {
    const width = 1000;
    const height = 700;
    svg.select('*').remove();

    var projection = d3
      .geoMercator()
      .translate([width / 2, height / 1.4]) // translate to center of screen. You might have to fiddle with this
      .scale([150]);

    var path = d3.geoPath().projection(projection);

    // TODO: Get states also and show on zoom:
    // TODO:  http://bl.ocks.org/MaciejKus/61e9ff1591355b00c1c1caf31e76a668
    // TODO: above data comes from github: https://github.com/owid/covid-19-data/tree/master/public/data/
    // this.http
    //   .get(
    //     '../../../assets/data/countries.json' /*https://gist.githubusercontent.com/GordyD/49654901b07cb764c34f/raw/27eff6687f677c984a11f25977adaa4b9332a2a9/countries-and-states.json'*/ /*('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json'*/
    //   )
    //   .subscribe((world) => {
    //     console.log(world);
    let svgG = svg.attr('width', width).attr('height', height).append('g');

    this.http
      .get('../../../assets/data/owid-covid-data.json')
      .subscribe(console.log);

    // const countries = topojson.feature(
    //   world,
    //   (world as any).objects.countries
    // ).features;
    if (this.selected) {
      countries.splice(countries.indexOf(this.selected), 1);
      countries.push(this.selected);
    }
    const _this = this;
    svgG
      .selectAll('path')
      .data(countries)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', 'country')
      .on('mousedown', (event, d) => {
        const node = d3.select(event.currentTarget);

        if (this.selected === d) {
          // if (this.selectedNode) {
            // node.attr('transform', `translate(0, 0) scale(1)`);
            // this.selectedNode = null;
            // this.selected = null;
            d.selected = false;
          // }

          // node.attr('transform', `translate(0, 0) scale(1)`);
        } else {
          countries.forEach((c) => (c.selected = false));
          this.selected = d;
          d.selected = !d.selected;
          // node.attr('transform', 'scale(1.5)')
          /* transform="translate(-33.925962254490855,-144.64600554243407) scale(1.5932801925711724)"*/
          console.log(d);
          console.log(event);
          console.log(d.properties.name);
          this.selectedNode = node;

          // https://stackoverflow.com/questions/25310390/how-does-path-bounds-work
          // var bounds = path.bounds(d),
          //   dx = bounds[1][0] - bounds[0][0],
          //   dy = bounds[1][1] - bounds[0][1],
          //   x = (bounds[0][0] + bounds[1][0]) / 2,
          //   y = (bounds[0][1] + bounds[1][1]) / 2,
          //   scale = 0.9 / Math.max(dx / width, dy / height),
          //   translate = [width / 2 - scale * x, height / 2 - scale * y];

          // node.attr(
          //   'transform',
          //   `translate(${translate[0]}, ${translate[1]}) scale(${scale})`
          // );
        }
        this.createChart(countries, svg);
      })
      .each(function (d) {
        const node = d3.select(this);
        var t = d3.transition().duration(400).ease(d3.easeLinear);
        if (d.selected) {
          
          // .ease(d3.easeLinear);

          // d3.selectAll(".apple").transition(t)
          //     .style("fill", "red");

          var bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = 0.9 / Math.max(dx / width, dy / height),
            translate = [width / 2 - scale * x, height / 2 - scale * y];

          node
            .transition(t)
            .attr(
              'transform',
              `translate(${translate[0]}, ${translate[1]}) scale(${scale})`
            );
        } else if (_this.selected == d) {

          var bounds = path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = 0.9 / Math.max(dx / width, dy / height),
          translate = [width / 2 - scale * x, height / 2 - scale * y];

          node
          .attr(
            'transform',
            `translate(${translate[0]}, ${translate[1]}) scale(${scale})`
          )
          .transition(t)
          .attr(
            'transform',
            `translate(0, 0) scale(1)`
          );
          _this.selected = null;
        }
      });

    //! state stuff
    // const zoom = d3
    //   .zoom()
    //   .on('zoom', (event) => {
    //     svgG.attr('transform', event.transform);
    //   })
    //   .scaleExtent([1, 40]);
    // svg.call(zoom);

    // const states = topojson.feature(world, (world as any).objects.states)
    //   .features;

    // // console.log((world as any).objects)
    // svgG
    //   .append('g')
    //   .attr('class', 'boundary state hidden')
    //   .selectAll('boundary')
    //   .data(states)
    //   .enter()
    //   .append('path')
    //   .attr('name', function (d) {
    //     return d.properties.name;
    //   })
    //   .attr('id', function (d) {
    //     return d.id;
    //   })

    // .attr('d', path);
    // });

    // ! show states on zoom level
    // TODO:  http://bl.ocks.org/MaciejKus/61e9ff1591355b00c1c1caf31e76a668
    /*
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
}
