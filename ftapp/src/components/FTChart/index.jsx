// src/FTChart.js

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const FTChart = () => {
    const [view, setView] = useState('yearly');
    const chartRef = useRef(null);

    const yearlyData = [
        { year: 2020, percentage: 75 },
        { year: 2021, percentage: 78 },
        { year: 2022, percentage: 80 },
        { year: 2023, percentage: 82 },
    ];

    const monthlyData = [
        { month: '2023-01', percentage: 70 },
        { month: '2023-02', percentage: 72 },
        { month: '2023-03', percentage: 74 },
        { month: '2023-04', percentage: 76 },
        { month: '2023-05', percentage: 78 },
        { month: '2023-06', percentage: 80 },
        { month: '2023-07', percentage: 82 },
        { month: '2023-08', percentage: 84 },
        { month: '2023-09', percentage: 86 },
        { month: '2023-10', percentage: 88 },
        { month: '2023-11', percentage: 90 },
        { month: '2023-12', percentage: 92 },
    ];

    useEffect(() => {
        drawChart();
    }, [view]);

    const drawChart = () => {
        const data = view === 'yearly' ? yearlyData : monthlyData;
        const parseTime = d3.timeParse(view === 'yearly' ? '%Y' : '%Y-%m');
        const formatTime = d3.timeFormat(view === 'yearly' ? '%Y' : '%b %Y');

        d3.select(chartRef.current).select('svg').remove();

        const svgWidth = 500;
        const svgHeight = 300;
        const margin = { top: 20, right: 20, bottom: 70, left: 50 };

        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => parseTime(view === 'yearly' ? d.year : d.month)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(parseTime(view === 'yearly' ? d.year : d.month)))
            .y(d => y(d.percentage));

        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(data.length).tickFormat(d => formatTime(d)));

        if (view === 'monthly') {
            xAxis.selectAll('text')
                .attr('transform', 'rotate(-45)')
                .style('text-anchor', 'end');
        }

        svg.append('g')
            .call(d3.axisLeft(y));

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);

        svg.selectAll('.dot')
            .data(data)
            .enter().append('circle')
            .attr('cx', d => x(parseTime(view === 'yearly' ? d.year : d.month)))
            .attr('cy', d => y(d.percentage))
            .attr('r', 4)
            .attr('fill', 'steelblue');
    };

    return (
        <div className="p-4">
            <div ref={chartRef}></div>

            <div className="flex justify-center mb-4">
                <button onClick={() => setView('yearly')} className="mx-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">Yearly</button>
                <button onClick={() => setView('monthly')} className="mx-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition">Monthly</button>
            </div>
        </div>
    );
};

export default FTChart;
