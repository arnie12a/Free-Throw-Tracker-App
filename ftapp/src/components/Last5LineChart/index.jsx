import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const Last5LineChart = ({ data }) => {
    const svgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

    useEffect(() => {
        // Function to update dimensions based on container size
        const updateDimensions = () => {
            const width = svgRef.current ? svgRef.current.clientWidth : 0;
            setDimensions({ width, height: 300 });
        };

        // Initial dimensions update
        updateDimensions();

        // Event listener for window resize
        window.addEventListener('resize', updateDimensions);

        // Clean up the event listener on component unmount
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (data.length === 0 || dimensions.width === 0) return;

        // Set up the SVG and dimensions with responsive scaling
        const margin = { top: 20, right: 30, bottom: 50, left: 50 };
        const svgWidth = dimensions.width - margin.left - margin.right;
        const svgHeight = dimensions.height - margin.top - margin.bottom;

        // Clear previous SVG content before re-rendering
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', svgWidth + margin.left + margin.right)
            .attr('height', svgHeight + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Set the ranges
        const x = d3.scalePoint().range([0, svgWidth]).padding(0.5);
        const y = d3.scaleLinear().range([svgHeight, 0]);

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
            .attr('stroke-dasharray', function () {
                const length = this.getTotalLength();
                return `${length} ${length}`;
            })
            .attr('stroke-dashoffset', function () {
                return this.getTotalLength();
            })
            .transition()
            .duration(2000)
            .attr('stroke-dashoffset', 0);

        // Add the scatterplot
        svg.selectAll('dot')
            .data(data)
            .enter().append('circle')
            .attr('r', 5)
            .attr('cx', (d, i) => x(i))
            .attr('cy', d => y(d.percentage))
            .attr('fill', 'blue')
            .attr('opacity', 0)
            .transition()
            .duration(2000)
            .attr('opacity', 1);

        // Tooltip setup
        const tooltip = svg.append('g')
    .attr('class', 'tooltip')
    .style('display', 'none');

// Tooltip background with rounded corners, shadow, and padding
tooltip.append('rect')
    .attr('class', 'tooltip-bg')
    .attr('width', 140)  // Set to a larger value to accommodate more text
    .attr('height', 70)
    .attr('fill', 'rgba(0, 0, 0, 0.75)')
    .attr('stroke', '#666')
    .attr('rx', 12)
    .attr('ry', 12)
    .attr('opacity', 0.9)
    .style('filter', 'url(#drop-shadow)');  // Add shadow for depth

// Tooltip text style
tooltip.append('text')
    .attr('x', 10)
    .attr('y', 25)
    .attr('class', 'tooltip-text')
    .style('font-size', '12px')
    .style('fill', '#ffffff')
    .style('font-weight', 'bold');

// Create a drop-shadow filter for the tooltip
const defs = svg.append('defs');
const filter = defs.append('filter')
    .attr('id', 'drop-shadow')
    .attr('height', '130%');

filter.append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 3);

filter.append('feOffset')
    .attr('dx', 2)
    .attr('dy', 2)
    .attr('result', 'offsetblur');

filter.append('feFlood')
    .attr('flood-color', 'rgba(0, 0, 0, 0.5)');

filter.append('feComposite')
    .attr('in2', 'offsetblur')
    .attr('operator', 'in');

const feMerge = filter.append('feMerge');
feMerge.append('feMergeNode');
feMerge.append('feMergeNode')
    .attr('in', 'SourceGraphic');

// Handle mouse events for tooltips
svg.selectAll('circle')
    .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 8);
        tooltip.style('display', null);
        
        tooltip.select('text')
            .text(`FT Made: ${d.ftMade}`)
            .append('tspan')
            .attr('x', 10)
            .attr('y', 40)
            .text(`FT Attempted: ${d.ftAttempted}`)
            .append('tspan')
            .attr('x', 10)
            .attr('y', 55)
            .text(`Percentage: ${d.percentage}%`);
    })
    .on('mousemove', function (event) {
        const [xPos, yPos] = d3.pointer(event);
        tooltip.attr('transform', `translate(${xPos + 15},${yPos - 20})`);
    })
    .on('mouseout', function () {
        d3.select(this).attr('r', 5);
        tooltip.style('display', 'none');
    });


        // Add the X Axis
        svg.append('g')
            .attr('transform', `translate(0,${svgHeight})`)
            .call(d3.axisBottom(x).tickFormat((d, i) => `Session ${i + 1}`));

        // Add the Y Axis
        svg.append('g')
            .call(d3.axisLeft(y));

        // X Axis label
        svg.append('text')
            .attr('transform', `translate(${svgWidth / 2}, ${svgHeight + margin.bottom - 10})`)
            .style('text-anchor', 'middle')
            .text('Sessions');

        // Y Axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (svgHeight / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Percentage');
    }, [data, dimensions]);

    return (
        <div className="w-full h-auto p-4 bg-white shadow-md rounded-lg">
            <svg ref={svgRef} className="w-full"></svg>
        </div>
    );
};

export default Last5LineChart;
