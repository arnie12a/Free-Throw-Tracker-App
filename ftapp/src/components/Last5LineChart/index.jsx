// LineChart.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const Last5LineChart = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (data.length === 0) return;

        // Set up the SVG and dimensions
        const margin = { top: 20, right: 30, bottom: 50, left: 50 },
              width = 500 - margin.left - margin.right,
              height = 300 - margin.top - margin.bottom;

        // Clear previous SVG content before re-rendering
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Set the ranges
        const x = d3.scalePoint().range([0, width]).padding(0.5);
        const y = d3.scaleLinear().range([height, 0]);

        // Define the line
        const valueline = d3.line()
            .x((d, i) => x(i))
            .y(d => y(d.percentage));

        // Scale the range of the data
        const minY = d3.min(data, d => d.percentage) - 10;
        x.domain(data.map((_, i) => i));
        y.domain([minY, 100]);

        // Add the valueline path
        svg.append('path')
            .data([data])
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('d', valueline)
            .attr("stroke-dasharray", function() {
                const length = this.getTotalLength();
                return `${length} ${length}`;
            })
            .attr("stroke-dashoffset", function() {
                return this.getTotalLength();
            })
            .transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);

        // Add the scatterplot
        svg.selectAll('dot')
            .data(data)
            .enter().append('circle')
            .attr('r', 5)
            .attr('cx', (d, i) => x(i))
            .attr('cy', d => y(d.percentage))
            .attr('fill', 'blue')
            .attr("opacity", 0)
            .transition()
            .duration(2000)
            .attr("opacity", 1);

        // Create a tooltip div that is hidden by default
        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('padding', '5px')
            .style('border', '1px solid #ccc')
            .style('border-radius', '5px')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        // Add tooltip functionality
        svg.selectAll('circle')
            .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 8);
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip.html(`ftMade: ${d.ftMade}<br/>ftAttempted: ${d.ftAttempted}<br/>percentage: ${d.percentage}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this).attr('r', 5);
                tooltip.transition().duration(500).style('opacity', 0);
            });

        // Add the X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat((d, i) => `Session ${i + 1}`));

        // Add the Y Axis
        svg.append('g')
            .call(d3.axisLeft(y));

        // Add X Axis label
        svg.append('text')
            .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style('text-anchor', 'middle')
            .text('Sessions');

        // Add Y Axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Percentage');
    }, [data]);

    return <svg ref={svgRef}></svg>;
}

export default Last5LineChart;
