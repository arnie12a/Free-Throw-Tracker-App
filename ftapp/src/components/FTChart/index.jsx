// src/FTChart.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const FTChart = () => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (d3Container.current) {
        const data = [
            { date: new Date('2023-01-01'), percentage: 70 },
            { date: new Date('2023-02-01'), percentage: 75 },
            { date: new Date('2023-03-01'), percentage: 80 },
            { date: new Date('2023-04-01'), percentage: 60 },
            { date: new Date('2023-05-01'), percentage: 65 },
        ];

        const margin = { top: 20, right: 30, bottom: 30, left: 40 },
                width = 600 - margin.left - margin.right,  // Adjusted width
                height = 300 - margin.top - margin.bottom; // Adjusted height

        const svg = d3.select(d3Container.current)
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
                    .domain(d3.extent(data, d => d.date))
                    .range([0, width]);

        const y = d3.scaleLinear()
                    .domain([0, 100])
                    .range([height, 0]);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5));

        svg.append('g')
            .call(d3.axisLeft(y));

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line()
                        .x(d => x(d.date))
                        .y(d => y(d.percentage))
            );

        svg.selectAll('dot')
            .data(data)
            .enter().append('circle')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.percentage))
            .attr('r', 4)  // Slightly larger radius
            .attr('fill', 'steelblue');
        }
    }, [d3Container.current]);

    return (
        <svg
        className="d3-component"
        ref={d3Container}
        />
    );
};

export default FTChart;
