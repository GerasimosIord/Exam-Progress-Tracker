// ... [Previous code remains unchanged up to the updateTrendsChart function]

function updateTrendsChart() {
    console.log("Entering updateTrendsChart function");
    const ctx = document.getElementById('trendsCanvas').getContext('2d');
    
    if (trendsChart) {
        console.log("Destroying existing chart");
        trendsChart.destroy();
    }

    console.log("Processing datasets");
    const datasets = progress.map(course => {
        console.log(`Processing course: ${course.name}`);
        let cumulativeData = [];
        let cumulativeTotal = 0;

        // Sort the daily progress by date
        const sortedProgress = course.dailyProgress.sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedProgress.forEach(day => {
            cumulativeTotal += day.slides;
            cumulativeData.push({
                x: new Date(day.date + 'T00:00:00'),
                y: cumulativeTotal
            });
        });

        console.log(`Cumulative data for ${course.name}:`, cumulativeData);

        // If there's no progress data, add initial completed slides
        if (cumulativeData.length === 0 && course.initialCompleted > 0) {
            cumulativeData.push({
                x: new Date(),
                y: course.initialCompleted
            });
        }

        // Ensure there are at least two points for the chart
        if (cumulativeData.length === 1) {
            cumulativeData.unshift({
                x: new Date(cumulativeData[0].x.getTime() - 86400000),
                y: 0
            });
        }

        return {
            label: course.name,
            data: cumulativeData,
            borderColor: course.color,
            fill: false
        };
    });

    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f0f0f0' : '#666';

    // Calculate the maximum total slides
    const maxTotalSlides = Math.max(...progress.map(course => course.totalSlides));
    console.log("Max total slides:", maxTotalSlides);

    // Set a fixed height for the chart container
    const chartContainer = document.getElementById('trendsChart');
    chartContainer.style.height = '400px';
    console.log("Chart container height set to 400px");

    // Fail-safe: Check if we have valid data to display
    if (!datasets.some(dataset => dataset.data.length > 0) || maxTotalSlides <= 0) {
        console.log("No valid data to display. Skipping chart creation.");
        ctx.font = '20px Arial';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText('No valid progress data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    console.log("Creating new chart");
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM d, yyyy'
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        color: textColor
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                        color: textColor
                    }
                },
                y: {
                    beginAtZero: true,
                    max: maxTotalSlides,
                    title: {
                        display: true,
                        text: 'Cumulative Slides Completed',
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            elements: {
                line: {
                    tension: 0.4
                },
                point: {
                    radius: 2,
                    hoverRadius: 5
                }
            },
            animation: false // Disable all animations
        }
    });
    console.log("Chart created successfully");
}

// ... [Rest of the code remains unchanged]

// Add this at the end of the file
console.log("Initial progress data:", progress);
renderCourses();
console.log("Courses rendered");
