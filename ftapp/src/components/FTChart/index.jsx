import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const FTChart = ({ data }) => {
    // Helper function to format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // zero-based month
        const day = ('0' + date.getDate()).slice(-2);
        return { year, month, day };
    };

    // Function to calculate yearly percentages
    const calculateYearlyPercentage = (data) => {
        const yearlyData = data.reduce((acc, { date, ftMade, ftAttempted }) => {
            const { year } = formatDate(date);
            if (!acc[year]) {
                acc[year] = { ftMade: 0, ftAttempted: 0 };
            }
            acc[year].ftMade += ftMade;
            acc[year].ftAttempted += ftAttempted;
            return acc;
        }, {});

        return Object.keys(yearlyData).map((year) => ({
            year,
            percentage: Math.round((yearlyData[year].ftMade / yearlyData[year].ftAttempted) * 100),
        }));
    };

    const getCurrentYearData = (data) => {
        const currentYear = new Date().getFullYear();
        return data.filter(({ date }) => new Date(date).getFullYear() === currentYear);
    };

    const groupByMonth = (data) => {
        const monthlyData = data.reduce((acc, { date, ftMade, ftAttempted }) => {
            const { year, month } = formatDate(date);
            const key = `${year}-${month}`;
            if (!acc[key]) {
                acc[key] = { ftMade: 0, ftAttempted: 0 };
            }
            acc[key].ftMade += ftMade;
            acc[key].ftAttempted += ftAttempted;
            return acc;
        }, {});

        const sortedMonthlyData = Object.keys(monthlyData)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((key) => ({
                month: key,
                percentage: Math.round((monthlyData[key].ftMade / monthlyData[key].ftAttempted) * 100),
            }));

        return sortedMonthlyData;
    };

    const getLastMonthData = (data) => {
        const now = new Date();
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

        return data.filter(({ date }) => {
            const d = new Date(date);
            return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
        });
    };

    const groupByDay = (data) => {
        const dailyData = data.reduce((acc, { date, ftMade, ftAttempted }) => {
            const { year, month, day } = formatDate(date);
            const key = `${year}-${month}-${day}`;
            if (!acc[key]) {
                acc[key] = { ftMade: 0, ftAttempted: 0 };
            }
            acc[key].ftMade += ftMade;
            acc[key].ftAttempted += ftAttempted;
            return acc;
        }, {});

        const sortedDailyData = Object.keys(dailyData)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((key) => ({
                day: key,
                percentage: Math.round((dailyData[key].ftMade / dailyData[key].ftAttempted) * 100),
            }));

        return sortedDailyData;
    };

    const currentYearData = getCurrentYearData(data);
    const monthlyData = groupByMonth(currentYearData);
    const lastMonthData = getLastMonthData(data);
    const dailyData = groupByDay(lastMonthData);

    const [view, setView] = useState('yearly');
    const chartRef = useRef(null);

    const yearlyData = calculateYearlyPercentage(data);

    useEffect(() => {
        drawChart();
    }, [view]);

    const drawChart = () => {
        const data = view === 'yearly' ? yearlyData : view === 'monthly' ? monthlyData : dailyData;
        const parseTime = d3.timeParse(view === 'yearly' ? '%Y' : view === 'monthly' ? '%Y-%m' : '%Y-%m-%d');
        const formatTime = d3.timeFormat(view === 'yearly' ? '%Y' : view === 'monthly' ? '%b %Y' : '%d %b');

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

        const xDomain = d3.extent(data, d => parseTime(view === 'yearly' ? d.year : view === 'monthly' ? d.month : d.day));
        const x = d3.scaleTime()
            .domain(xDomain)
            .range([0, width])
            .nice();

        const minY = Math.min(...data.map(d => d.percentage)) - 10;
        const y = d3.scaleLinear()
            .domain([minY, 100])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(parseTime(view === 'yearly' ? d.year : view === 'monthly' ? d.month : d.day)))
            .y(d => y(d.percentage));

        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(data.length).tickFormat(d => formatTime(d)));

        if (view !== 'yearly') {
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
            .attr('d', line)
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .attr('opacity', 1);

        svg.selectAll('.dot')
            .data(data)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(parseTime(view === 'yearly' ? d.year : view === 'monthly' ? d.month : d.day)))
            .attr('cy', d => y(d.percentage))
            .attr('r', 4)
            .attr('fill', 'steelblue')
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .attr('opacity', 1);

        // Tooltip
        const tooltip = d3.select(chartRef.current)
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', '#fff')
            .style('padding', '5px')
            .style('border', '1px solid #ccc')
            .style('border-radius', '5px')
            .style('pointer-events', 'none');

        svg.selectAll('.dot')
            .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 6);
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip.html(`Date: ${formatTime(parseTime(view === 'yearly' ? d.year : view === 'monthly' ? d.month : d.day))}<br>Percentage: ${d.percentage}%`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this).attr('r', 4);
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    };

    return (
        <div className="p-4">
            <div ref={chartRef}></div>

            <div className="flex justify-center mb-4">
                <button onClick={() => setView('yearly')} className="mx-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">Yearly</button>
                <button onClick={() => setView('monthly')} className="mx-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition">Monthly</button>
                <button onClick={() => setView('daily')} className="mx-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition">Daily</button>
            </div>
        </div>
    );
};

export default FTChart;
