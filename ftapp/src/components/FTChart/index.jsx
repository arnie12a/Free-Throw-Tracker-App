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

    /*
    const monthlyData = [
        { month: '2023-01', percentage: 70 },
        { month: '2023-02', percentage: 66 },
        { month: '2023-03', percentage: 74 },
        { month: '2023-04', percentage: 87 },
        { month: '2023-05', percentage: 78 },
        { month: '2023-06', percentage: 80 },
        { month: '2023-07', percentage: 65 },
        { month: '2023-08', percentage: 84 },
        { month: '2023-09', percentage: 86 },
        { month: '2023-10', percentage: 90 },
        { month: '2023-11', percentage: 84 },
        { month: '2023-12', percentage: 77 },
    ];
    

    const dailyData = [
        { day: '2023-05-01', percentage: 71 },
        { day: '2023-05-02', percentage: 73 },
        { day: '2023-05-03', percentage: 75 },
        { day: '2023-05-04', percentage: 72 },
        { day: '2023-05-05', percentage: 74 },
        { day: '2023-05-06', percentage: 76 },
        { day: '2023-05-07', percentage: 78 },
        { day: '2023-05-08', percentage: 77 },
        { day: '2023-05-09', percentage: 79 },
        { day: '2023-05-10', percentage: 80 },
        { day: '2023-05-11', percentage: 82 },
        { day: '2023-05-12', percentage: 81 },
        { day: '2023-05-13', percentage: 83 },
        { day: '2023-05-14', percentage: 85 },
        { day: '2023-05-15', percentage: 84 },
        { day: '2023-05-16', percentage: 86 },
        { day: '2023-05-17', percentage: 88 },
        { day: '2023-05-18', percentage: 87 },
        { day: '2023-05-19', percentage: 89 },
        { day: '2023-05-20', percentage: 90 },
        { day: '2023-05-21', percentage: 88 },
        { day: '2023-05-22', percentage: 89 },
        { day: '2023-05-23', percentage: 91 },
        { day: '2023-05-24', percentage: 93 },
        { day: '2023-05-25', percentage: 92 },
        { day: '2023-05-26', percentage: 94 },
        { day: '2023-05-27', percentage: 95 },
        { day: '2023-05-28', percentage: 93 },
        { day: '2023-05-29', percentage: 92 },
        { day: '2023-05-30', percentage: 94 },
        { day: '2023-05-31', percentage: 95 },
    ];
    */

    const currentYearData = getCurrentYearData(data);
    const monthlyData = groupByMonth(currentYearData);
    const lastMonthData = getLastMonthData(data);
    const dailyData = groupByDay(lastMonthData);
    const yearlyData = calculateYearlyPercentage(data);


    const [view, setView] = useState('yearly');
    const chartRef = useRef(null);


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

            <div className="flex justify-center">
                <div ref={chartRef}></div>
            </div>

            <div className="flex justify-center mb-4 space-x-2">
                <button onClick={() => setView('yearly')} className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition ${view === 'yearly' ? 'bg-blue-700' : ''}`}>Yearly</button>
                <button onClick={() => setView('monthly')} className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition ${view === 'monthly' ? 'bg-green-700' : ''}`}>Monthly</button>
                <button onClick={() => setView('daily')} className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition ${view === 'daily' ? 'bg-red-700' : ''}`}>Daily</button>
            </div>
        </div>
    );
};

export default FTChart;
