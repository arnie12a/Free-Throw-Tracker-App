import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const Last5LineChart = ({ data }) => {
    const chartRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

    useEffect(() => {
        const updateDimensions = () => {
            const width = chartRef.current ? chartRef.current.clientWidth : 0;
            setDimensions({ width, height: 300 });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (data.length === 0 || dimensions.width === 0) return;

        const ctx = chartRef.current.getContext('2d');
        const labels = data.map((_, i) => `${i + 1}`);
        const percentages = data.map(d => d.percentage);
        const ftMade = data.map(d => d.ftMade);
        const ftAttempted = data.map(d => d.ftAttempted);

        // Calculate minimum Y-axis bound (minimum value - 10, rounded down to nearest multiple of 5)
        const minPercentage = Math.min(...percentages);
        const yMin = Math.floor((minPercentage - 10) / 5) * 5;

        // Create gradient for the line chart
        const gradient = ctx.createLinearGradient(0, 0, dimensions.width, 0);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)'); // Indigo start
        gradient.addColorStop(1, 'rgba(79, 209, 197, 0.8)'); // Teal end

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Free Throw Percentage',
                        data: percentages,
                        fill: false,
                        borderColor: gradient,
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(128, 90, 213, 1)', // Purple points
                        pointBorderColor: '#fff',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0, // Smooth lines
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
                        backgroundColor: 'rgba(34, 34, 34, 0.8)', // Dark tooltip
                        titleColor: '#f3f4f6', // Light text
                        bodyColor: '#e5e7eb', // Lighter text
                        padding: 12,
                        borderRadius: 12,
                        borderColor: '#4b5563', // Subtle gray border
                        borderWidth: 1,
                        callbacks: {
                            title: (tooltipItems) => `Session ${tooltipItems[0].label}`,
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
                            color: '#6b7280', // Muted gray
                        },
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: '#6b7280', // Muted gray ticks
                            maxRotation: 0,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Percentage',
                            color: '#6b7280', // Muted gray
                        },
                        min: yMin, // Minimum value calculated dynamically
                        max: 100, // Fixed maximum value
                        ticks: {
                            stepSize: 5, // Steps in multiples of 5
                            callback: (value) => `${value}%`,
                            padding: 10,
                            color: '#6b7280', // Muted gray ticks
                        },
                        grid: {
                            borderDash: [5, 5], // Dotted lines
                            color: 'rgba(209, 213, 219, 0.3)', // Light gray grid
                        },
                    },
                },
            },
        });

        return () => {
            chart.destroy();
        };
    }, [data, dimensions]);

    return (
        <div className="w-full h-auto p-6 bg-gray-100 shadow-lg rounded-lg">
            <div className="relative">
                <canvas ref={chartRef} className="w-full h-72"></canvas>
            </div>
        </div>
    );
};

export default Last5LineChart;
