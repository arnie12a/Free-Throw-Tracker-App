import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables); // Register all Chart.js components

const Last5LineChart = ({ data }) => {
    const chartRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

    useEffect(() => {
        // Function to update dimensions based on container size
        const updateDimensions = () => {
            const width = chartRef.current ? chartRef.current.clientWidth : 0;
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

        const ctx = chartRef.current.getContext('2d');

        // Prepare the data for Chart.js
        const labels = data.map((_, i) => `Session ${i + 1}`);
        const percentages = data.map(d => d.percentage);
        const ftMade = data.map(d => d.ftMade);
        const ftAttempted = data.map(d => d.ftAttempted);

        // Create the chart
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Free Throw Percentage',
                        data: percentages,
                        fill: false,
                        borderColor: 'blue',
                        borderWidth: 2,
                        tension: 0.2,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 10,
                        borderRadius: 8,
                        borderColor: '#666',
                        borderWidth: 1,
                        callbacks: {
                            title: (tooltipItems) => {
                                return `Session ${tooltipItems[0].label}`;
                            },
                            label: (tooltipItem) => {
                                const index = tooltipItem.dataIndex;
                                return `Percentage: ${percentages[index]}%`;
                            },
                            afterLabel: (tooltipItem) => {
                                const index = tooltipItem.dataIndex;
                                return `FT Made: ${ftMade[index]}, FT Attempted: ${ftAttempted[index]}`;
                            },
                        },
                    },
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Sessions',
                        },
                        grid: {
                            display: true,
                        },
                        ticks: {
                            autoSkip: false, // Prevent auto skipping of ticks
                            maxRotation: 0, // Prevent rotation of ticks
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Percentage',
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%',
                            padding: 10, // Increase padding between y-axis and points
                        },
                    },
                },
            },
        });

        return () => {
            chart.destroy(); // Clean up the chart instance on unmount
        };
    }, [data, dimensions]);

    return (
        <div className="w-full h-auto p-4 bg-white shadow-md rounded-lg">
            <canvas ref={chartRef} className="w-full h-64"></canvas>
        </div>
    );
};

export default Last5LineChart;
