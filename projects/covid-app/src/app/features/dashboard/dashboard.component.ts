import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
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

    let svg = d3.select(this.chart.nativeElement).append('svg');

    var projection = d3
      .geoMercator()
      .translate([width / 2, height / 1.4]) // translate to center of screen. You might have to fiddle with this
      .scale([150]);

    var path = d3.geoPath().projection(projection);

    this.http
      .get('https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json' )
      .subscribe((world) => {
        console.log(world);
        let svgG = svg.attr('width', width).attr('height', height).append('g');

        svgG
          .selectAll('path')
          .data(
            topojson.feature(world, (world as any).objects.countries).features
          )
          .enter()
          .append('path')
          .attr('d', path);
      });
  }
}
