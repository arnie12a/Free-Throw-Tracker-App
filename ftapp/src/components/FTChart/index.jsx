import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

const FTChart = ({ data }) => {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return { year, month, day };
    };

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

    const currentYearData = getCurrentYearData(data);
    const monthlyData = groupByMonth(currentYearData);
    const yearlyData = calculateYearlyPercentage(data);

    const [view, setView] = useState('yearly');

    const getChartData = () => {
        const chartData = view === 'yearly' ? yearlyData : monthlyData;

        return {
            labels: chartData.map(d => view === 'yearly' ? d.year : d.month),
            datasets: [
                {
                    label: 'Free Throw Percentage (%)',
                    data: chartData.map(d => d.percentage),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.3)', // Softer background
                    fill: true,
                    tension: 0, // Smoother curve
                    pointBackgroundColor: '#34D399', // Tailwind's teal color
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#34D399',
                    pointRadius: 6, // Bigger points for visibility
                    pointHoverRadius: 8, // Enlarge on hover
                },
            ],
        };
    };

    const getMinPercentage = () => {
        const chartData = view === 'yearly' ? yearlyData : monthlyData;
        const percentages = chartData.map(d => d.percentage);
        const minPercentage = Math.min(...percentages);
        return Math.max(0, Math.floor(minPercentage / 5) * 5 - 10); // Round down to nearest multiple of 5 and subtract 10
    };

    const getMaxPercentage = () => {
        const chartData = view === 'yearly' ? yearlyData : monthlyData;
        const percentages = chartData.map(d => d.percentage);
        const maxPercentage = Math.max(...percentages);
        return Math.ceil(maxPercentage / 5) * 5; // Round up to nearest multiple of 5
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Ensures better responsiveness
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Percentage: ${context.raw}%`;
                    },
                },
                backgroundColor: '#111827', // Darker background for tooltip
                titleColor: '#F9FAFB', // Tailwind white
                bodyColor: '#F9FAFB',
                titleFont: { weight: 'bold' },
                borderWidth: 1,
                borderColor: '#6B7280', // Tailwind gray
                borderRadius: 8, // Rounded tooltip
                padding: 10,
                animation: {
                    duration: 400, // Smooth tooltip animation
                },
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: view === 'yearly' ? 'year' : 'month',
                    displayFormats: {
                        year: 'yyyy',
                        month: 'MMM yyyy',
                    },
                },
                grid: { display: false }, // Remove grid lines for cleaner look
                ticks: {
                    align: 'start', // Ensure the first tick is not right on the vertical axis
                },
            },
            y: {
                beginAtZero: false,
                suggestedMin: getMinPercentage(),
                suggestedMax: getMaxPercentage(),
                ticks: {
                    stepSize: 5, // Ensure steps are multiples of 5
                },
                title: { display: true, text: 'Free Throw Percentage', font: { size: 14 } },
                grid: { color: '#E5E7EB' }, // Light gray grid lines
            },
        },
    };

    return (
        <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex justify-center w-full h-96"> {/* Fixed chart height for consistency */}
                <Line data={getChartData()} options={chartOptions} />
            </div>
            <div className="flex justify-center items-center flex-col space-y-4"> {/* Centering the buttons */}
                <button
                    className={`px-6 py-3 rounded-lg shadow-md transition-all duration-300 text-white font-semibold ${
                        view === 'yearly' ? 'bg-teal-500' : 'bg-teal-400 hover:bg-teal-500'
                    }`}
                    onClick={() => setView('yearly')}
                >
                    Yearly
                </button>
                <button
                    className={`px-6 py-3 rounded-lg shadow-md transition-all duration-300 text-white font-semibold ${
                        view === 'monthly' ? 'bg-red-500' : 'bg-red-400 hover:bg-red-500'
                    }`}
                    onClick={() => setView('monthly')}
                >
                    Monthly
                </button>
            </div>
        </div>
    );
};

export default FTChart;
