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
import { forkJoin } from 'rxjs';
import { isLoweredSymbol } from '@angular/compiler';
import { summaryFileName } from '@angular/compiler/src/aot/util';
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
  public days: number;
  public maxDays: number;
  public dayInterval: number;
  public currentDay: number;
  public durationMs: number;
  public midColor: string;
  public minColor: string;
  public maxColor: string;
  public currentDate: Date;
  constructor(private http: HttpClient) {}

  //TODO: Heatmap 2 color ranges

  ngOnInit(): void {
    let svg = d3.select(this.chart.nativeElement).append('svg');
    this.maxDays = 400;
    this.dayInterval = 10;
    this.currentDay = 1;
    this.durationMs = 6000;

    this.minColor = 'yellow';
    this.midColor = 'purple';
    this.maxColor = 'green';

    this.http
      .get(
        '../../../assets/data/countries.json' /*https://gist.githubusercontent.com/GordyD/49654901b07cb764c34f/raw/27eff6687f677c984a11f25977adaa4b9332a2a9/countries-and-states.json'*/ /*('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json'*/
      )
      .subscribe((world) => {
        const countries = topojson.feature(
          world,
          (world as any).objects.countries
        ).features;
        //  let svg = d3.select(this.chart.nativeElement).append('svg');
        //  this.createChart(countries, svg);
      });

    this.runStateBubble(svg);
    this.getLineage(svg);
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return value;
  }
  selected: any;
  getLineage(svg) {
    const lineages = [
      'B.1.1.7', 'B.1.351', 'B.1.427', 'B.1.429', 'P.1', 'B.1.526', 'B.1.526','B.1.526.1', 'B.1.526.2', 'B.1.617', 'P.2'
    ]
    this.http.get('https://api.outbreak.info/genomics/lineage-by-sub-admin-most-recent?location_id=USA&pangolin_lineage=B.1.1.7&timestamp=449880&ndays=60').subscribe( x => {
      console.log('lineage', x);
    });
  }
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
    /*
    geometry: {type: "Polygon", coordinates: Array(1)}
id: "AFG"
properties: {name: "Afghanistan"}
type: "Feature"
__proto__: Object*/
    const _this = this;
    svgG
      .selectAll('path')
      .data(countries)
      .enter()
      .append('path')
      .attr('d', (d) => {
        path(d);
      })
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
        var t = d3.transition().duration(100).ease(d3.easeLinear);
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
            .delay(700)
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
            .delay(700)
            .attr('transform', `translate(0, 0) scale(1)`);
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

  toMagnitude(n) {
    var order = Math.floor(Math.log(n) / Math.LN10 + 0.000000001);
    return Math.pow(10, order);
  }

  getLocation(d, countyMap, stateMap) {
    let location = countyMap.get(d.fips);
    if (!location && d.county === 'New York City')
      location = countyMap.get('36061');
    if (!location) location = stateMap.get(d.state);
    if (!location) console.warn('No location found for: ' + JSON.stringify(d));
    return location;
  }

  runStateBubble(svg) {
    // d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
    const usFile = this.http.get('../../assets/data/observable-us.json');
    const placesFile = this.http.get(
      '../../assets/data/observable-places.json'
    );
    // const covid = this.http.get(
    //   '../../assets/data/observable-counties-by-date.json'
    // );
    const rawDataFile = this.http.get(
      'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv',
      { responseType: 'text' } //../../assets/data/observable-rawData.json'
    );
    const populationFile = this.http.get('../../assets/data/population.json');

    // population: 'https://github.com/Zoooook/CoronavirusTimelapse/blob/master/static/population.json'

    forkJoin([usFile, rawDataFile, placesFile, populationFile]).subscribe(
      ([us, rawDataCsv, places, population]) => {
        // d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
        var rawDataJson = d3.csvParse(rawDataCsv);

        const countyMap = new Map(
          topojson
            .feature(us, (us as any).objects.counties)
            .features.map((d) => [d.id, d])
        );
        const stateMap = new Map(
          topojson
            .feature(us, (us as any).objects.states)
            .features.map((d) => [d.properties.name, d])
        );
        this.populationMap = new Map(
          (population as any).map((x) => [x.us_county_fips || x.subregion, x])
        );
        this.maxPop = Math.max(...(population as any).map(p => +p.population));
        const cases = (rawDataJson as any).map((a) => +a.cases);
        this.maxCases = cases.reduce((max, v) => max >= v ? max : v, -Infinity);
        this.renderStateBubble(
          svg,
          countyMap,
          stateMap,
          rawDataJson,
          us,
          places
        );
        //this.loop();
      }
    );
  }

  mapProjection(coords) {
    const proj = d3.geoAlbersUsa().scale(1300);
    const [x, y] = proj(coords);
    return [x + 6, y + 54];
  }
  renderStateBubble(svg, countyMap, stateMap, rawData, us, places) {
    this.countyMap = countyMap;
    const width = 1000;
    const height = 700;
    svg.select('*').remove();
    let svgG = svg.attr('width', width).attr('height', height).append('g');
    this.svgG = svgG;
    /*var projection = d3
      .geoMercator()
      .translate([width / 2, height / 1.4]) // translate to center of screen. You might have to fiddle with this
      .scale([150]);*/

    const proj = d3.geoAlbersUsa().scale(1300);
    const albersProjection = (coords) => {
      const [x, y] = proj(coords);
      return [x + 6, y + 54];
    };

    var path = d3.geoPath(); //.projection(projection);
    this.path = path;
    const startDate = '2020-03-01';
    const excludeTerritories = new Set([
      'Guam',
      'Puerto Rico',
      'Virgin Islands',
    ]);

    const data = d3.group(
      rawData.filter((d) => !excludeTerritories.has(d.state)),
      (d) => d.date
    );
    this.data = data;
    this.maxDays = data.size;

    for (let k of data.keys()) {
      if (k < startDate) data.delete(k);
    }
    console.log(data);

    console.log('test', data[0]);

    const dates = Array.from(data.keys()).map((d) => new Date(`${d}T20:00Z`));
    // const sorted = dates.sort((a: any, b: any) => a-b);

    svgG
      .append('path')
      .datum(topojson.feature(us, us.objects.nation)) //
      .attr('fill', '#f4f4f4')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .attr('d', (d) => {
        return path(d);
      });

    // topojson.feature(
    //       world,
    //       (world as any).objects.countries
    //     ).features;

    svgG
      .append('path')
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('stroke-width', 0.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', path);

    // const counties = topojson.mesh(us, us.objects.counties, (a, b) => a !== b);
    // svgG
    // .append("path")
    // .datum(topojson.mesh(us, us.objects.counties, (a, b) => a !== b))
    // .attr("fill", "none")
    // .attr("stroke", "#999")
    // .attr("stroke-width", 0.5)
    // .attr("stroke-linejoin", "round")
    // .attr("d", path);

    this.drawHeatmap(0);
    // const testDataPoint = Array.from(data.values())[40];

    // const maxCases = Math.max(...(testDataPoint as any).map((a) => a.cases));

    // var colorScale = d3
    //   .scaleLog () //(d3.interpolateInferno)
    //   .domain([1, maxCases]) //5000])
    //   .range(['yellow', 'purple']);

    // const unknownCounty = [];
    // const bubble = svgG
    //   .selectAll('.bubble')
    //   .data(
    //     /*data[data.length - 1]*/ (testDataPoint as any)
    //       // .slice(0, 10)
    //       .sort((a, b) => +b.cases - +a.cases),
    //     (d) => d.fips || d.county
    //   )
    //   .enter()
    //   .append('path')
    //   .attr('class', 'bubble')
    //   .attr('fill', (d) => {
    //       const color = colorScale(+d.cases);
    //       return color;
    //   })
    //   .attr('d', (d) => {
    //     let county = countyMap.get(d.fips || d.county);
    //     if (d.county === 'New York City') {
    //       county = countyMap.get('36061');
    //       console.log(`county new york city`, county);
    //     }
    //     if (d.county === 'Kansas City') {
    //       county = countyMap.get('64105'); // 64155 mptworking
    //       console.log(`county kansas city`, county);
    //     }
    //     if (!county) {
    //       unknownCounty.push(d);
    //       console.log(`fips: ${d.fips}, county: ${d.county}`, d);
    //     }

    //     const p = path(county);
    //     return p;
    //   });
    // .attr("fill", d => colorScale(0))
    // .attr("r", d => radius(0));

    // bubbles first
    this.places = places;
    // svgG
    //   .selectAll('place')
    //   .data(places)
    //   .enter()
    //   .append('circle')
    //   .attr('class', 'place')
    //   .attr('r', 2.5)
    //   .attr('transform', function (d) {
    //     return (
    //       'translate(' + albersProjection([+d.LONGITUDE, +d.LATITUDE]) + ')'
    //     );
    //   });

    // svgG
    //   .selectAll('.place-label')
    //   .data(places)
    //   .enter()
    //   .append('text')
    //   .attr('class', 'place-label')
    //   .attr('transform', function (d) {
    //     return (
    //       'translate(' + albersProjection([+d.LONGITUDE, +d.LATITUDE]) + ')'
    //     );
    //   })
    //   .attr('dy', '.35em')
    //   .text(function (d) {
    //     return d.NAME;
    //   })
    //   .attr('x', 6)
    //   .style('text-anchor', 'start');
    /*
    const bubble = svgG
    .selectAll(".bubble")
    .data(
      data[data.length - 1].sort((a, b) => +b.cases - +a.cases),
      d => d.fips || d.county
    )
    .enter()
    .append("circle")
    .attr("transform", d => "translate(" + path.centroid(getLocation(d)) + ")")
    .attr("class", "bubble")
    .attr("fill-opacity", 0.5)
    .attr("fill", d => colorScale(0))
    .attr("r", d => radius(0));

  bubble.append("title");

  svgG
    .selectAll("place")
    .data(places)
    .enter()
    .append("circle")
    .attr("class", "place")
    .attr("r", 2.5)
    .attr("transform", function(d) {
      return "translate(" + albersProjection([+d.LONGITUDE, +d.LATITUDE]) + ")";
    });

    svgG
    .selectAll(".place-label")
    .data(places)
    .enter()
    .append("text")
    .attr("class", "place-label")
    .attr("transform", function(d) {
      return "translate(" + albersProjection([+d.LONGITUDE, +d.LATITUDE]) + ")";
    })
    .attr("dy", ".35em")
    .text(function(d) {
      return d.NAME;
    })
    .attr("x", 6)
    .style("text-anchor", "start");
*/
  }

  countyMap: any;
  path: any;
  svgG: any;
  data: any;
  places: any;
  previousDay: number;
  displayType = 'sum';
  populationMap;
  usePopulation: boolean;
  maxPop: number;
  maxCases: number;
  changeDisplayType(type) {
    this.displayType = type;
  }
  getMaxValue(testDataPoint) {
    if (this.displayType === 'sum') {
      return Math.max(...(testDataPoint as any).map((a) => a.cases));
    }
    return 1000;
  }
  drawHeatmap(i: number) {
    const testDataPoint = Array.from(this.data.values())[i];
    const date = Array.from(this.data.keys())[i];
    const prevDate = this.previousDay
      ? Array.from(this.data.keys())[this.previousDay]
      : null;
    const prevData = new Map(
      this.data.get(prevDate)?.map((x) => [x.fips || x.county, x])
    );
    this.currentDate = new Date(`${date}T20:00Z`);
    if (!i || !testDataPoint) {
      return;
    }
    const maxCases = this.maxCases; //this.getMaxValue(testDataPoint); //Math.max(...(testDataPoint as any).map((a) => a.cases));
    // const lowerColor = d3
    // .linear()
    // .domain([0, maxCases / 2])
    // .range([`#0f0`, `#FFFF00`]);

    // const upperColor = d3
    // .linear()
    // .domain([maxCases / 2, 0])
    // .range([`#FF0`, `#F00`]);
    const topValue = this.usePopulation? maxCases / this.maxPop : maxCases;
    const logMax = Math.log10(topValue);
    const mid = Math.pow(10, logMax / 2);
    const lower = this.usePopulation? .001 : 1;
    var colorScale = d3
      .scaleLog() //(d3.interpolateInferno)
      .domain([lower, mid]) // maxCases]) //5000])
      .range([this.minColor, this.midColor]);

    var upperColorScale = d3
      .scaleLog() //(d3.interpolateInferno)
      .domain([mid, maxCases]) // maxCases]) //5000])
      .range([this.midColor, this.maxColor]);

    const unknownCounty = [];
    const nodes = this.svgG.selectAll('.bubble').data(
      /*data[data.length - 1]*/ (testDataPoint as any)
        // .slice(0, 10)
        .sort((a, b) => +b.cases - +a.cases),
      (d) => d.fips || d.county
    );
    const enterNodes = nodes.enter(); // need to run update instead of enter, its only coloring new counties
    enterNodes
      .append('path')
      .attr('class', 'bubble')
      .attr('fill', (d) => {
        const pop = this.populationMap.get(d.fips || d.county);
        let cases = +d.cases;
        if (pop && this.usePopulation) {
          cases = cases / +pop.population;
        }

        if (this.displayType === 'sum') {
          if (+cases > mid) {
            return upperColorScale(+cases);
          }
          const color = colorScale(+cases);
          return color;
        }
        const prev = prevData.get(d.fips || d.county);
        const change = prev ? cases - (prev as any).cases : 0;
        if (change > mid) {
          return upperColorScale(+change);
        }
        const color = colorScale(+change);
        return color;
      })
      .attr('d', (d) => {
        let county = this.countyMap.get(d.fips || d.county);
        if (d.county === 'New York City') {
          county = this.countyMap.get('36061');
          // console.log(`county new york city`, county);
        }
        if (d.county === 'Kansas City') {
          county = this.countyMap.get('64105'); // 64155 mptworking
          // console.log(`county kansas city`, county);
        }
        if (!county) {
          unknownCounty.push(d);
          // console.log(`fips: ${d.fips}, county: ${d.county}`, d);
        }

        const p = this.path(county);
        return p;
      });

    nodes.attr('fill', (d) => {
      const pop = this.populationMap.get(d.fips || d.county);
        let cases = +d.cases;
        if (pop && this.usePopulation) {
          cases = cases / +pop.population;
        }

        if (this.displayType === 'sum') {
          if (+cases > mid) {
            return upperColorScale(+cases);
          }
          const color = colorScale(+cases);
          return color;
        }
        const prev = prevData.get(d.fips || d.county);
        const change = prev ? cases - (prev as any).cases : 0;
        if (change > mid) {
          return upperColorScale(+change);
        }
        const color = colorScale(+change);
        return color;
    });

    nodes.exit().remove();
    const proj = d3.geoAlbersUsa().scale(1300);
    const albersProjection = (coords) => {
      const [x, y] = proj(coords);
      return [x + 6, y + 54];
    };
    this.svgG
      .selectAll('place')
      .data(this.places)
      .enter()
      .append('circle')
      .attr('class', 'place')
      .attr('r', 2.5)
      .attr('transform', function (d) {
        return (
          'translate(' + albersProjection([+d.LONGITUDE, +d.LATITUDE]) + ')'
        );
      });

    this.svgG
      .selectAll('.place-label')
      .data(this.places)
      .enter()
      .append('text')
      .attr('class', 'place-label')
      .attr('transform', function (d) {
        return (
          'translate(' + albersProjection([+d.LONGITUDE, +d.LATITUDE]) + ')'
        );
      })
      .attr('dy', '.35em')
      .text(function (d) {
        return d.NAME;
      })
      .attr('x', 6)
      .style('text-anchor', 'start');

    this.previousDay = i;
  }


  mousedownDay() {
    clearInterval(this.interval);
  }
  changeDay() {
    clearInterval(this.interval);
    this.drawHeatmap(this.currentDay);
  }
  changeColor(open) {
    if (!open) {
      clearInterval(this.interval);
      this.drawHeatmap(this.currentDay);
    }
  }
  resetTimer() {
    clearInterval(this.interval);
    this.loop();
  }

  setByPopulation(usePopulation) {
    this.usePopulation = usePopulation;
    clearInterval(this.interval);
    this.drawHeatmap(this.currentDay);
  }
  interval;
  loop() {
    const frames = Array.from(this.data.values()).length;
    const totalMs = this.durationMs;
    const step = this.dayInterval;
    const secPerFrame = (totalMs / frames) * step;
    clearInterval(this.interval);
    let index = this.currentDay;
    setTimeout(() => {
      this.interval = setInterval(() => {
        if (index > frames) {
          clearInterval(this.interval);
        } else {
          this.currentDay = index;

          this.drawHeatmap(index);
          index = index + step;
        }
      }, secPerFrame);
    }, 10);
    /* update(i) {
      const t = svg
        .transition()
        .duration(i === 0 ? 0 : delay)
        .ease(d3.easeLinear);

      bubble
        .data(data[i], d => d.fips || d.county)
        .call(b => {
          b.transition(t)
            .attr("fill", d => colorScale(+d.cases))
            .attr("r", d => radius(+d.cases))
            .select("title")
            .text(d => `${placeName(d)}: ${numFormat(+d.cases)} cases`);
        })
        .exit()
        .call(b => {
          b.transition()
            .attr("fill", d => colorScale(0))
            .attr("r", d => radius(0));
        });
    }*/
  }

  // TODO: Data location: https://ourworldindata.org/coronavirus-source-data

  // Adding circles overlaying countries for population
  // Todo http://bl.ocks.org/almccon/1bcde7452450c153d8a0684085f249fd
  // ? Another https://stackoverflow.com/questions/58649544/d3-js-v5-unable-to-get-data-points-to-show-on-map-of-us

  // this centers a map
  // TODO: https://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
}
