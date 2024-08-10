const courses = [
    { name: 'Molecular Genetics', totalSlides: 878, examDate: '2024-08-30', color: '#FF6B6B', initialCompleted: 300 },
    { name: 'Animal Physiology', totalSlides: 835, examDate: '2024-09-05', color: '#4ECDC4', initialCompleted: 39 },
    { name: 'Μοριακή Βάση Κυτταρικών Λειτουργιών', totalSlides: 411, examDate: '2024-09-06', color: '#45B7D1', initialCompleted: 47 },
    { name: 'Plant Physiology', totalSlides: 259, examDate: '2024-09-12', color: '#98D861', initialCompleted: 10 },
    { name: 'Microbiology', totalSlides: 555, examDate: '2024-09-18', color: '#FFD93D', initialCompleted: 0 },
];

let progress;
try {
    const savedProgress = localStorage.getItem('studyProgress');
    if (savedProgress) {
        progress = JSON.parse(savedProgress);
    } else {
        progress = courses.map(course => ({
            ...course,
            completedSlides: course.initialCompleted,
            dailyProgress: course.initialCompleted > 0 ? [{
                date: new Date().toISOString().split('T')[0],
                slides: course.initialCompleted
            }] : []
        }));
        localStorage.setItem('studyProgress', JSON.stringify(progress));
    }
} catch (error) {
    console.error('Error accessing localStorage:', error);
    progress = courses.map(course => ({
        ...course,
        completedSlides: course.initialCompleted,
        dailyProgress: course.initialCompleted > 0 ? [{
            date: new Date().toISOString().split('T')[0],
            slides: course.initialCompleted
        }] : []
    }));
}

let selectedCourse = null;

function renderCourses() {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '<div class="course-grid"></div>';
    const courseGrid = courseList.querySelector('.course-grid');
    
    progress.forEach(course => {
        const percentage = calculatePercentage(course.completedSlides, course.totalSlides);
        const daysRemaining = calculateDaysRemaining(course.examDate);
        const avgDailyProgress = calculateAverageDailyProgress(course);
        const suggestedTarget = suggestDailyTarget(course);

        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <h2>${course.name}</h2>
            <p>Completed: ${course.completedSlides} / ${course.totalSlides} slides</p>
            <p>Progress: ${percentage}%</p>
            <p>Days until exam: ${daysRemaining}</p>
            <p>Avg. daily progress: ${avgDailyProgress} slides</p>
            <p>Suggested daily target: ${suggestedTarget} slides</p>
            <div class="progress-bar" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress" style="width: ${percentage}%; background-color: ${course.color};"></div>
            </div>
            <button onclick="selectCourse('${course.name}')" aria-label="Update progress for ${course.name}">Update Progress</button>
        `;
        courseGrid.appendChild(courseCard);
    });
}

function selectCourse(courseName) {
    selectedCourse = progress.find(course => course.name === courseName);
    document.getElementById('selectedCourse').textContent = `Updating progress for: ${selectedCourse.name}`;
    document.getElementById('updateProgressModal').style.display = 'block';
    document.getElementById('slidesCompleted').focus();
}

function closeModal() {
    document.getElementById('updateProgressModal').style.display = 'none';
}

function updateProgress() {
    const slidesCompleted = parseInt(document.getElementById('slidesCompleted').value);
    if (selectedCourse && !isNaN(slidesCompleted) && slidesCompleted >= 0) {
        const courseIndex = progress.findIndex(course => course.name === selectedCourse.name);
        progress[courseIndex].completedSlides = Math.min(
            progress[courseIndex].completedSlides + slidesCompleted,
            progress[courseIndex].totalSlides
        );
        progress[courseIndex].dailyProgress.push({
            date: new Date().toISOString().split('T')[0],
            slides: slidesCompleted
        });
        saveProgress();
        renderCourses();
        document.getElementById('slidesCompleted').value = '';
        closeModal();
    }
}

function calculatePercentage(completed, total) {
    return ((completed / total) * 100).toFixed(2);
}

function calculateDaysRemaining(examDate) {
    const today = new Date();
    const exam = new Date(examDate + 'T00:00:00');
    const diffTime = exam - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

function calculateAverageDailyProgress(course) {
    if (course.dailyProgress.length === 0) return 0;
    const totalSlides = course.dailyProgress.reduce((sum, day) => sum + day.slides, 0);
    return Math.round(totalSlides / course.dailyProgress.length);
}

function suggestDailyTarget(course) {
    const daysRemaining = calculateDaysRemaining(course.examDate);
    const slidesRemaining = course.totalSlides - course.completedSlides;
    return daysRemaining > 0 ? Math.ceil(slidesRemaining / daysRemaining) : 0;
}

function exportData() {
    const dataStr = JSON.stringify(progress, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = 'study_progress_data.json';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
}

function saveProgress() {
    try {
        localStorage.setItem('studyProgress', JSON.stringify(progress));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

window.onclick = function(event) {
    const modal = document.getElementById('updateProgressModal');
    if (event.target == modal) {
        closeModal();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Check for saved dark mode preference
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
}

// Add dark mode toggle button event listener
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

renderCourses();
