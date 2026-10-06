let subjectsData = [];
let totalWorkingDaysCount = 0;
let selectedTerm = "1";
let monthlyWorkingDays = [];

// Existing result edit mode
let isEditingExistingResult = false;
let editingExistingClassKey = '';
let editingExistingTerm = '';

// Global Storage Object for Student Records
let schoolDatabase = {}; 


// =========================================================
// বর্তমানে লগইন করা শিক্ষক
// =========================================================

function getCurrentLoggedInUser() {

    const teacherId =
        localStorage.getItem('LS_LOGGED_IN_USER');

    if (!teacherId) {
        return null;
    }

    let teachersDB = {};

    try {
        teachersDB =
            JSON.parse(
                localStorage.getItem('teachersDB')
            ) || {};
    } catch (error) {
        console.error('teachersDB data parse error:', error);
        return null;
    }

    return teachersDB[teacherId] || null;
}


function validateTeacherClass() {

    const currentUser = getCurrentLoggedInUser();

    if (!currentUser) {
        alert('লগইন করা ব্যবহারকারীর তথ্য পাওয়া যায়নি। আবার লগইন করুন।');
        window.location.href = 'index.html';
        return false;
    }

    if (currentUser.designation !== 'শ্রেণী শিক্ষক (Class Teacher)')  {
        return true;
    }

    const enteredClass =
        document.getElementById('className').value.trim();

    const assignedClass =
        String(currentUser.className || '').trim();

    if (!enteredClass) {
        return true;
    }

    function normalizeClass(value) {

    const normalized =
        String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\([^)]*\)/g, '')
            .replace(/\s+/g, '');

    const classMap = {
        'প্লে': 'play',
        'play': 'play',

        'নার্সারি': 'nursery',
        'nursery': 'nursery',

        'ওয়ান': 'one',
        'ওয়ান': 'one',
        'one': 'one',

        'টু': 'two',
        'two': 'two',

        'থ্রি': 'three',
        'three': 'three',

        'ফোর': 'four',
        'four': 'four',

        'ফাইভ': 'five',
        'five': 'five'
    };

    return classMap[normalized] || normalized;
}

    if (
        normalizeClass(enteredClass) !==
        normalizeClass(assignedClass)
    ) {
        alert('আপনি এই ক্লাসের শিক্ষক নন।');
        document.getElementById('className').value = '';
        return false;
    }

    return true;
}


// =========================================================
// page.html থেকে নির্দিষ্ট প্রান্তিকের Result ওপেন করা
// =========================================================

function loadResultSearchContext() {

    const savedContext =
        sessionStorage.getItem('ls_result_search_context');

    if (!savedContext) {
        return;
    }

    let context;

try {
    context = JSON.parse(savedContext);
} catch (error) {
    console.error('ls_result_search_context parse error:', error);
    sessionStorage.removeItem('ls_result_search_context');
    return;
}

    const classKey = context.classKey;
    const term = context.term;

    if (
        !classKey ||
        !schoolDatabase[classKey] ||
        !schoolDatabase[classKey].students
    ) {
        sessionStorage.removeItem('ls_result_search_context');
        return;
    }

    const classData = schoolDatabase[classKey];

    // Class ও Session আলাদা করা
    document.getElementById('className').value =
        classData.className || classKey.split('_')[0];

    document.getElementById('sessionYear').value =
        classData.sessionYear || classKey.substring(
            classKey.indexOf('_') + 1
        );

    // নির্দিষ্ট প্রান্তিক নির্বাচন
    selectedTerm = term;

    const termSelect =
        document.getElementById('termType');

    if (termSelect) {
        termSelect.value = term;
    }

    // প্রয়োজনীয় Working Days
    totalWorkingDaysCount =
        classData.totalWorkingDays || 0;

    monthlyWorkingDays =
        classData.monthlyWorkingDays || [];

    // Result Table-এ আগের existing function ব্যবহার
renderResultTable(classKey);

// Search Card থেকে Result দেখা হলে
// "পরিবর্তন করুন" বাটনটি "ফিরে যান" হবে
const backButton =
    document.querySelector('#step-4 .btn-prev');

if (backButton) {
    backButton.innerHTML = '&larr; ফিরে যান';

    backButton.onclick = function() {
        window.location.href = 'page.html';
    };
}

// ধাপ ৪ দেখানো
goToStep(4);

    // একবার ব্যবহার করার পর context মুছে দেওয়া
    sessionStorage.removeItem(
        'ls_result_search_context'
    );
}

const subjectListOptions = [
    "বাংলা", "বাংলা ব্যাকরণ", "ইংরেজি", "ইংরেজি গ্রামার", "গণিত",
    "প্রাথমিক বিজ্ঞান", "বাংলাদেশ ও বিশ্বপরিচয়", "ইসলাম ও নৈতিক শিক্ষা/আরবি",
    "সাধারণ জ্ঞান", "ড্রয়িং", "আরবি ও মক্তব", "উপস্থিতি", "শৃঙ্খলা ও পরিষ্কার পরিচ্ছন্নতা", "চারু ও কারুকলা"
];

const monthsShort = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
const monthsFull = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

// Load Local Storage on startup
window.onload = function() {

    let savedData =
        localStorage.getItem('ls_school_data');

    if(savedData) {
        try {
            schoolDatabase = JSON.parse(savedData);
        } catch (error) {
            console.error('ls_school_data parse error:', error);
            schoolDatabase = {};
        }
    }

    loadResultSearchContext();
};

function saveToLocalStorage() {
    localStorage.setItem('ls_school_data', JSON.stringify(schoolDatabase));
}

// Toggle Search Panel
function toggleSearchForm() {
    const searchCard = document.getElementById('searchSection');
    searchCard.classList.toggle('active');
}

// Advanced Search Student Function (Handles Single & Multiple Matches)
let tempSearchResults = [];
function searchStudent() {
    const session = document.getElementById('searchSession').value.trim();
    const className = document.getElementById('searchClass').value.trim();
    const studentName = document.getElementById('searchName').value.trim();

    if (!session || !className || !studentName) {
        alert('অনুগ্রহ করে সেশন, ক্লাস এবং স্টুডেন্টের নাম - তিনটি তথ্যই প্রদান করুন।');
        return;
    }

    // ধাপ ১-এর শ্রেণী ইনপুটের একই normalization rule
    function normalizeClass(value) {

        const normalized =
            String(value || '')
                .trim()
                .toLowerCase()
                .replace(/\([^)]*\)/g, '')
                .replace(/\s+/g, '');

        const classMap = {
            'প্লে': 'play',
            'play': 'play',

            'নার্সারি': 'nursery',
            'nursery': 'nursery',

            'ওয়ান': 'one',
            'ওয়ান': 'one',
            'one': 'one',

            'টু': 'two',
            'two': 'two',

            'থ্রি': 'three',
            'three': 'three',

            'ফোর': 'four',
            'four': 'four',

            'ফাইভ': 'five',
            'five': 'five'
        };

        return classMap[normalized] || normalized;
    }

    const normalizedSearchClass = normalizeClass(className);

    // সংরক্ষিত ক্লাসের নামও একই নিয়মে মিলানো হবে
    const classEntry = Object.entries(schoolDatabase).find(
        ([key, classData]) =>
            classData &&
            classData.students &&
            String(classData.sessionYear).trim() === session &&
            normalizeClass(classData.className || key.split('_')[0]) === normalizedSearchClass
    );

    if (!classEntry) {
        alert('দুঃখিত! এই সেশন ও শ্রেণীর কোন তথ্য সংরক্ষিত নেই।');
        return;
    }

    const classKey = classEntry[0];
    const classData = classEntry[1];

    tempSearchResults = classData.students
        .map((s, idx) => ({ ...s, originalIdx: idx }))
        .filter(
            s =>
                String(s.name || '').trim().toLowerCase() ===
                studentName.toLowerCase()
        );

    if (tempSearchResults.length === 0) {
        alert('দুঃখিত! এই নামের কোন শিক্ষার্থী খুঁজে পাওয়া যায়নি।');
        return;
    }

    // Search-এর পর standard stored class name ব্যবহার করা হবে
    document.getElementById('className').value =
        classData.className || className;

    document.getElementById('sessionYear').value =
        classData.sessionYear || session;

    if (tempSearchResults.length === 1) {
        showBookletView();
        document.getElementById('studentSelector').value =
            tempSearchResults[0].originalIdx;
        loadStudentBooklet();
    } else {
        // Multiple Matches - Display Selection Modal
        let dropdown =
            document.getElementById('multipleStudentDropdown');

        dropdown.innerHTML = "";

       tempSearchResults.forEach(s => {

    const rollNumber =
        String(s.originalIdx + 1).padStart(2, '0');

    const studentIdText =
        String(s.studentId || '').trim();

    const displayText =
        studentIdText
            ? `রোল: ${rollNumber} - নাম: ${s.name} - ID: ${studentIdText}`
            : `রোল: ${rollNumber} - নাম: ${s.name}`;

    dropdown.innerHTML += `
        <option value="${s.originalIdx}">
            ${displayText}
        </option>
    `;
});

        document.getElementById('multipleSelectModal').style.display =
            'flex';
    }

    document.getElementById('searchSection').classList.remove('active');
}

function confirmStudentSelection() {
    let selectedIdx = document.getElementById('multipleStudentDropdown').value;
    document.getElementById('multipleSelectModal').style.display = 'none';
    showBookletView();
    document.getElementById('studentSelector').value = selectedIdx;
    loadStudentBooklet();
}

// 15 Days Edit Lock Check
function isRecordLocked(createdAtTimestamp) {
    if (!createdAtTimestamp) return false;

    const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;

    return (Date.now() - Number(createdAtTimestamp)) > fifteenDaysInMs;
}

// Dynamic Months Setup
const monthsContainer = document.getElementById('monthsContainer');
monthsFull.forEach((m) => {
    monthsContainer.innerHTML += `
        <div class="form-group">
            <label>${m}</label>
            <input type="number" class="month-input" min="0" value="0" onchange="calculateWorkingDays()">
        </div>
    `;
});

function calculateWorkingDays() {
    let inputs = document.querySelectorAll('.month-input');
    totalWorkingDaysCount = 0;
    monthlyWorkingDays = [];
    inputs.forEach(inp => {
        let val = Number(inp.value) || 0;
        monthlyWorkingDays.push(val);
        totalWorkingDaysCount += val;
    });
    document.getElementById('totalWorkingDays').innerText = totalWorkingDaysCount;
}

function generateSubjectFields() {
    let count = parseInt(document.getElementById('totalSubjects').value) || 0;
    let container = document.getElementById('subjectContainer');
    container.innerHTML = "<h4>বিষয়ের নাম নির্বাচন ও নম্বর সীমা সেটআপ:</h4>";

    let optionsHTML = `<option value="">-- বিষয় সিলেক্ট করুন --</option>`;
    subjectListOptions.forEach(sub => {
        optionsHTML += `<option value="${sub}">${sub}</option>`;
    });

    for (let i = 0; i < count; i++) {
        container.innerHTML += `
            <div class="card grid-3">
                <div class="form-group">
                    <label>বিষয় ${i+1}-এর নাম:</label>
                    <select class="sub-name">
                        ${optionsHTML}
                    </select>
                </div>
                <div class="form-group">
                    <label>পূর্ণ মান:</label>
                    <input type="number" class="sub-full-mark" value="100">
                </div>
                <div class="form-group">
                    <label>শ্রেণীতে সর্বোচ্চ প্রাপ্ত নম্বর:</label>
                    <input type="number" class="sub-highest-mark" placeholder="Like:95">
                </div>
            </div>
        `;
    }
}

function goToStep(stepNum) {
    document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-item').forEach((ind, i) => {
        if (i + 1 < stepNum) ind.className = 'step-item completed';
        else if (i + 1 === stepNum) ind.className = 'step-item active';
        else ind.className = 'step-item';
    });
    document.getElementById(`step-${stepNum}`).classList.add('active');
}

function goToStep2() {
    let cName = document.getElementById('className').value;
    let tStud = document.getElementById('totalStudents').value;
    let tSub = document.getElementById('totalSubjects').value;

    if (!cName || !tStud || !tSub) {
        alert('অনুগ্রহ করে ধাপ ১-এর সকল তথ্য ঠিকভাবে পূরণ করুন!');
        return;
    }

    const currentUser = getCurrentLoggedInUser();

    if (!currentUser) {
        alert('লগইন করা ব্যবহারকারীর তথ্য পাওয়া যায়নি। আবার লগইন করুন।');
        window.location.href = 'index.html';
        return;
    }

    const currentTeacherId =
        localStorage.getItem('LS_LOGGED_IN_USER');

    const sYear =
    document.getElementById('sessionYear').value.trim();

if (!/^\d{4}$/.test(sYear)) {
    alert('অনুগ্রহ করে সঠিক ৪ সংখ্যার Session Year প্রদান করুন।');
    return;
}

const classKey = `${cName}_${sYear}`;

    const classRecord = schoolDatabase[classKey];

    if (
        classRecord &&
        classRecord.ownerTeacherId &&
        classRecord.ownerTeacherId !== currentTeacherId
    ) {
        alert('এই রেজাল্ট পরিবর্তন করার অনুমতি আপনার নেই।');
        return;
    }

    selectedTerm = document.getElementById('termType').value;
    subjectsData = [];
    let subNames = document.querySelectorAll('.sub-name');
    let subFull = document.querySelectorAll('.sub-full-mark');
    let subHigh = document.querySelectorAll('.sub-highest-mark');

    for (let i = 0; i < subNames.length; i++) {
        if (!subNames[i].value) {
            alert(`অনুগ্রহ করে বিষয় ${i+1}-এর নাম ড্রপডাউন থেকে সিলেক্ট করুন!`);
            return;
        }
        subjectsData.push({
            name: subNames[i].value,
            fullMark: Number(subFull[i].value) || 100,
            highestMark: Number(subHigh[i].value) || 0
        });
    }

    goToStep(2);
}

function goToStep3() {
    if (totalWorkingDaysCount <= 0) {
        alert('অনুগ্রহ করে কার্যদিবসের সঠিক সংখ্যা প্রবেশ করান!');
        return;
    }

    let studentCount = parseInt(document.getElementById('totalStudents').value) || 0;
    let container = document.getElementById('studentsMarksContainer');
    container.innerHTML = "";

    let cName = document.getElementById('className').value;
    let sYear = document.getElementById('sessionYear').value;
    let classKey = `${cName}_${sYear}`;

    const currentUser = getCurrentLoggedInUser();

    if (!currentUser) {
        alert('লগইন করা ব্যবহারকারীর তথ্য পাওয়া যায়নি। আবার লগইন করুন।');
        window.location.href = 'index.html';
        return;
    }

    const currentTeacherId =
        localStorage.getItem('LS_LOGGED_IN_USER');

    const classRecord = schoolDatabase[classKey];

    if (
        classRecord &&
        classRecord.ownerTeacherId &&
        classRecord.ownerTeacherId !== currentTeacherId
    ) {
        alert('এই রেজাল্ট পরিবর্তন করার অনুমতি আপনার নেই।');
        return;
    }

    for (let s = 0; s < studentCount; s++) {
        let existingStudent = (schoolDatabase[classKey] && schoolDatabase[classKey].students) ? schoolDatabase[classKey].students[s] : null;
        let isLocked = existingStudent ? isRecordLocked(existingStudent.createdAt) : false;

        let monthInputsHTML = "";
        monthsShort.forEach((m, mIdx) => {
            let existingVal = (existingStudent && existingStudent.monthlyAtt) ? existingStudent.monthlyAtt[mIdx] || "" : "";
            monthInputsHTML += `
                <div>
                    <input type="number" 
                           class="stud-month-${s}" 
                           placeholder="${m}" 
                           min="0" 
                           value="${existingVal}"
                           ${isLocked ? 'disabled' : ''}
                           oninput="checkAttendanceValidation(this, ${s}, ${mIdx})">
                </div>
            `;
        });

        monthInputsHTML += `
            <div>
                <input type="number" 
                       id="att-${s}" 
                       placeholder="মোট" 
                       readonly 
                       style="background-color: #d1ecf1; font-weight: bold; border-color: #17a2b8;">
            </div>
        `;

        let subInputsHTML = "";
        subjectsData.forEach((sub, subIdx) => {
            let isAttendanceSubject = (sub.name === "উপস্থিতি");
            let existingMark = "";
            if (existingStudent && existingStudent.terms && existingStudent.terms[selectedTerm]) {
                let savedSub = existingStudent.terms[selectedTerm].subResults.find(r => r.name === sub.name);
                if (savedSub) existingMark = savedSub.mark;
            }

            subInputsHTML += `
                <div class="form-group">
                    <label>${sub.name} (পূর্ণমান: ${sub.fullMark}):</label>
                    <input type="number" 
                           class="stud-mark-${s}" 
                           id="mark-${s}-${subIdx}"
                           data-subidx="${subIdx}" 
                           min="0" 
                           max="${sub.fullMark}" 
                           placeholder="প্রাপ্ত নম্বর"
                           value="${existingMark}"
                           ${isLocked ? 'disabled' : ''}
                           ${isAttendanceSubject ? 'readonly style="background-color: #e9ecef;"' : ''}>
                </div>
            `;
        });

        container.innerHTML += `
            <div class="card">
                <div class="grid-2" style="align-items: center; margin-bottom: 15px;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label>রোল নম্বর:</label>
                        <input type="text" value="রোল ${s+1}" readonly style="font-weight: bold; background-color: #e9ecef; color: var(--secondary-blue);">
                    </div>
                    <div style="font-weight: bold; color: var(--primary-green); font-size: 15px; margin-top: 18px;">
                        রোলের সিরিয়াল অনুযায়ী মার্ক তুলুন
                    </div>
                </div>
                <h4>শিক্ষার্থী ${s+1}-এর তথ্য ${isLocked ? '<span style="color:red; font-size:12px;">(১৫ দিন পার হওয়ায় তথ্য লক হয়ে গেছে)</span>' : ''}</h4>
                <div class="grid-2">
                    <div class="form-group">
                        <label>শিক্ষার্থীর নাম:</label>
                        <input type="text" class="stud-name" placeholder="নাম লিখুন" value="${existingStudent ? existingStudent.name : ''}" ${isLocked ? 'disabled' : ''}>
                    </div>

                    <div class="form-group">
                        <label>Student ID:</label>
                        <input type="text" class="stud-id" placeholder="Student ID লিখুন" value="${existingStudent && existingStudent.studentId ? existingStudent.studentId : ''}" ${isLocked ? 'disabled' : ''}>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>মাসের ভিত্তিক উপস্থিতি (১২ মাস + ১৩ নম্বর ঘরে মোট দিন):</label>
                    <div class="grid-attendance-13">
                        ${monthInputsHTML}
                    </div>
                </div>

                <h5>বিষয়ভিত্তিক নম্বর:</h5>
                <div class="grid-3">${subInputsHTML}</div>
            </div>
        `;

        setTimeout(() => calculateStudentTotalAttendance(s), 100);
    }

    goToStep(3);
}

// Attendance Input Validation
function checkAttendanceValidation(inputElement, studentIndex, monthIndex) {
    let inputVal = Number(inputElement.value) || 0;
    let maxDaysAllowed = monthlyWorkingDays[monthIndex] || 0;
    let monthName = monthsFull[monthIndex];

    if (maxDaysAllowed === 0 && inputVal > 0) {
        alert(`ভুল ইনপুট! ${monthName} মাসে ধাপ ২-এ কোনো কার্যদিবস দেয়া হয়নি (০ দিন)। তাই এই মাসে শিক্ষার্থীর উপস্থিতি দেয়া যাবে না।`);
        inputElement.value = "";
    } else if (inputVal > maxDaysAllowed) {
        alert(`ভুল ইনপুট! ${monthName} মাসে মোট কার্যদিবস ${maxDaysAllowed} দিন। শিক্ষার্থীর উপস্থিতি এর চেয়ে বেশি (${inputVal}) হতে পারে না!`);
        inputElement.value = maxDaysAllowed;
    }

    calculateStudentTotalAttendance(studentIndex);
}

function calculateStudentTotalAttendance(studentIndex) {
    let monthInputs = document.querySelectorAll(`.stud-month-${studentIndex}`);
    let totalAttDays = 0;

    monthInputs.forEach(inp => {
        totalAttDays += Number(inp.value) || 0;
    });

    let totalAttInput = document.getElementById(`att-${studentIndex}`);
    if(totalAttInput) totalAttInput.value = totalAttDays;

    subjectsData.forEach((sub, subIdx) => {
        if (sub.name === "উপস্থিতি") {
            let markInput = document.getElementById(`mark-${studentIndex}-${subIdx}`);
            if (markInput && totalWorkingDaysCount > 0) {
                let percentage = totalAttDays / totalWorkingDaysCount;
                let calculatedMark = Math.round(percentage * sub.fullMark);
                markInput.value = calculatedMark > sub.fullMark ? sub.fullMark : calculatedMark;
            }
        }
    });
}

function calculateGrade(marks, fullMark) {
    let percentage = (marks / fullMark) * 100;
    if (percentage >= 80) return { lg: 'A+', gp: 5.00, eval: 'অসাধারণ' };
    if (percentage >= 70) return { lg: 'A', gp: 4.00, eval: 'অর্জিত' };
    if (percentage >= 60) return { lg: 'A-', gp: 3.50, eval: 'সন্তোষজনক' };
    if (percentage >= 50) return { lg: 'B', gp: 3.00, eval: 'প্রাথমিক' };
    if (percentage >= 40) return { lg: 'C', gp: 2.00, eval: 'অগ্রগতির পথে' };
    if (percentage >= 33) return { lg: 'D', gp: 1.00, eval: 'প্রচেষ্টা প্রয়োজন' };
    return { lg: 'F', gp: 0.00, eval: 'অনুত্তীর্ণ' };
}

// Save/Update Functionality
function saveOrUpdateStudentProgress(classKey, studentData, studentIdx) {

    const currentTeacherId =
        localStorage.getItem('LS_LOGGED_IN_USER');

    const classRecord = schoolDatabase[classKey];

    if (
        classRecord &&
        classRecord.ownerTeacherId &&
        classRecord.ownerTeacherId !== currentTeacherId
    ) {
        alert('এই রেজাল্ট পরিবর্তন করার অনুমতি আপনার নেই।');
        return;
    }

    if (!schoolDatabase[classKey].students[studentIdx]) {
        schoolDatabase[classKey].students[studentIdx] = {
            id: Date.now() + studentIdx,
            createdAt: Date.now(),
            ...studentData,
            updatedAt: new Date().toISOString()
        };
    } else {
        schoolDatabase[classKey].students[studentIdx] = {
            ...schoolDatabase[classKey].students[studentIdx],
            ...studentData,
            updatedAt: new Date().toISOString()
        };
    }
}

function processResults() {
    let cName = document.getElementById('className').value;
    let sYear = document.getElementById('sessionYear').value;

    const currentUser = getCurrentLoggedInUser();

    if (!currentUser) {
        alert('লগইন করা ব্যবহারকারীর তথ্য পাওয়া যায়নি। আবার লগইন করুন।');
        window.location.href = 'index.html';
        return;
    }

    const currentTeacherId =
        localStorage.getItem('LS_LOGGED_IN_USER');

    const currentTeacherDesignation =
    currentUser.designation;

const currentTeacherClass =
    currentUser.className;

if (currentTeacherDesignation === 'শ্রেণী শিক্ষক (Class Teacher)') {

    function normalizeClass(value) {

        const normalized =
            String(value || '')
                .trim()
                .toLowerCase()
                .replace(/\([^)]*\)/g, '')
                .replace(/\s+/g, '');

        const classMap = {
            'প্লে': 'play',
            'play': 'play',

            'নার্সারি': 'nursery',
            'nursery': 'nursery',

            'ওয়ান': 'one',
            'ওয়ান': 'one',
            'one': 'one',

            'টু': 'two',
            'two': 'two',

            'থ্রি': 'three',
            'three': 'three',

            'ফোর': 'four',
            'four': 'four',

            'ফাইভ': 'five',
            'five': 'five'
        };

        return classMap[normalized] || normalized;
    }

    if (
        normalizeClass(cName) !==
        normalizeClass(currentTeacherClass)
    ) {
        alert('আপনি এই ক্লাসের শিক্ষক নন।');
        return;
    }
}

    let classKey = `${cName}_${sYear}`;

    if(!schoolDatabase[classKey]) {
        schoolDatabase[classKey] = {
            className: cName,
            sessionYear: sYear,
            totalWorkingDays: totalWorkingDaysCount,
            monthlyWorkingDays: monthlyWorkingDays,
            ownerTeacherId: currentTeacherId,
            students: []
        };
    }

    if (
        schoolDatabase[classKey].ownerTeacherId &&
        schoolDatabase[classKey].ownerTeacherId !== currentTeacherId
    ) {
        alert('এই রেজাল্ট পরিবর্তন করার অনুমতি আপনার নেই।');
        return;
    }

    const isEditingSameExistingResult =
    isEditingExistingResult &&
    editingExistingClassKey === classKey &&
    editingExistingTerm === selectedTerm;

if (!isEditingSameExistingResult) {
    const classRecord = schoolDatabase[classKey];

    const hasExistingTermResult =
        classRecord &&
        Array.isArray(classRecord.students) &&
        classRecord.students.some(
            student =>
                student &&
                student.terms &&
                student.terms[selectedTerm]
        );

    if (hasExistingTermResult) {
        alert(
            'এই ক্লাস, সেশন ও প্রান্তিকের ফলাফল ইতোমধ্যে তৈরি করা হয়েছে। নতুন করে ফলাফল তৈরি করা যাবে না।'
        );
        return;
    }
}

    let studNames = document.querySelectorAll('.stud-name');
    let studIds = document.querySelectorAll('.stud-id');

    // Student ID duplicate validation
    for (let i = 0; i < studIds.length; i++) {

        const studentId = studIds[i] ? studIds[i].value.trim() : "";

        if (!studentId) {
            continue;
        }

        // একই ফলাফল তৈরির সময় Student ID একাধিকবার দেওয়া হয়েছে কি না
        for (let j = i + 1; j < studIds.length; j++) {

            const nextStudentId =
                studIds[j] ? studIds[j].value.trim() : "";

            if (studentId === nextStudentId) {
                alert(
                    `Student ID "${studentId}" একাধিক শিক্ষার্থীর জন্য ব্যবহার করা হয়েছে। অনুগ্রহ করে প্রতিটি শিক্ষার্থীর জন্য আলাদা Student ID প্রদান করুন।`
                );
                return;
            }
        }

        // আগে থেকে সংরক্ষিত অন্য শিক্ষার্থীর Student ID-এর সাথে মিলছে কি না
        const existingStudentIndex =
            schoolDatabase[classKey].students.findIndex(
                (student, index) =>
                    index !== i &&
                    String(student.studentId || '').trim() === studentId
            );

        if (existingStudentIndex !== -1) {
            alert(
                `Student ID "${studentId}" ইতোমধ্যে এই ক্লাস ও সেশনের অন্য একজন শিক্ষার্থীর জন্য সংরক্ষিত আছে।`
            );
            return;
        }
    }

    for (let i = 0; i < studNames.length; i++) {
        let name = studNames[i].value || `শিক্ষার্থী ${i+1}`;
        let studentId = studIds[i] ? studIds[i].value.trim() : "";
        let att = Number(document.getElementById(`att-${i}`).value) || 0;
        let attPercentage = ((att / totalWorkingDaysCount) * 100).toFixed(1);

        let monthAtts = [];
        let monthInps = document.querySelectorAll(`.stud-month-${i}`);
        monthInps.forEach(mInp => monthAtts.push(Number(mInp.value) || 0));

        let markInputs = document.querySelectorAll(`.stud-mark-${i}`);
        let totalMarks = 0;
        let totalGP = 0;
        let grandFullMark = 0;
        let hasFailed = false;
        let subResults = [];

        markInputs.forEach(inp => {
            let m = Number(inp.value) || 0;
            let subIdx = inp.getAttribute('data-subidx');
            let subObj = subjectsData[subIdx];
            let res = calculateGrade(m, subObj.fullMark);

            if (res.lg === 'F') hasFailed = true;

            totalMarks += m;
            grandFullMark += subObj.fullMark;
            totalGP += res.gp;
            subResults.push({ 
                name: subObj.name, 
                fullMark: subObj.fullMark,
                highestMark: subObj.highestMark,
                mark: m, 
                grade: res.lg, 
                gp: res.gp.toFixed(2),
                eval: res.eval 
            });
        });

        let gpa = (totalGP / subjectsData.length).toFixed(2);
        let weightageRate = (selectedTerm === "3") ? 0.80 : 0.10;
        let calculatedWeightage = (totalMarks * weightageRate).toFixed(2);

        let existingTerms = (schoolDatabase[classKey].students[i] && schoolDatabase[classKey].students[i].terms) ? schoolDatabase[classKey].students[i].terms : {};

        existingTerms[selectedTerm] = {
            attendance: attPercentage,
            totalAttDays: att,
            totalMarks: totalMarks,
            grandFullMark: grandFullMark,
            weightageMarks: Number(calculatedWeightage),
            gpa: hasFailed ? "0.00" : gpa,
            status: hasFailed ? "ফেল" : "পাশ",
            subResults: subResults
        };

        let studentPayload = {
             name: name,
             studentId: studentId,
             monthlyAtt: monthAtts,
             terms: existingTerms
};

        saveOrUpdateStudentProgress(classKey, studentPayload, i);
    }

    calculateRankings(classKey);
    saveToLocalStorage();
    renderResultTable(classKey);
    goToStep(4);
}

function calculateRankings(classKey) {
    let students = schoolDatabase[classKey].students;
    let rankingStudents = [...students];

    if (selectedTerm === "1" || selectedTerm === "2") {
        rankingStudents.sort((a, b) => {
            let termA = a.terms[selectedTerm] || {
                totalMarks: 0,
                attendance: 0
            };

            let termB = b.terms[selectedTerm] || {
                totalMarks: 0,
                attendance: 0
            };

            // প্রথমে মোট নম্বর বেশি হলে আগে
            if (Number(termB.totalMarks) !== Number(termA.totalMarks)) {
                return Number(termB.totalMarks) - Number(termA.totalMarks);
            }

            // মোট নম্বর সমান হলে Attendance Percentage বেশি হলে আগে
            return Number(termB.attendance) - Number(termA.attendance);
        });

        rankingStudents.forEach((st, idx) => {
            if (st.terms[selectedTerm]) {
                st.terms[selectedTerm].rank = idx + 1;
            }
        });

    } else if (selectedTerm === "3") {
        rankingStudents.sort((a, b) => {
            let sumA = getAnnualTotalWeightedScore(a);
            let sumB = getAnnualTotalWeightedScore(b);

            // প্রথমে Annual Weighted Score বেশি হলে আগে
            if (Number(sumB) !== Number(sumA)) {
                return Number(sumB) - Number(sumA);
            }

            // Annual Score সমান হলে ৩য় প্রান্তিকের Attendance বেশি হলে আগে
            let attendanceA =
                a.terms["3"] ? Number(a.terms["3"].attendance) || 0 : 0;

            let attendanceB =
                b.terms["3"] ? Number(b.terms["3"].attendance) || 0 : 0;

            return attendanceB - attendanceA;
        });

        rankingStudents.forEach((st, idx) => {
            if (st.terms["3"]) {
                st.terms["3"].rank = idx + 1;
                st.terms["3"].annualTotalWeighted =
                    getAnnualTotalWeightedScore(st).toFixed(2);
            }
        });
    }
}

function getAnnualTotalWeightedScore(studentObj) {
    let w1 = (studentObj.terms["1"]) ? Number(studentObj.terms["1"].weightageMarks) || 0 : 0;
    let w2 = (studentObj.terms["2"]) ? Number(studentObj.terms["2"].weightageMarks) || 0 : 0;
    let w3 = (studentObj.terms["3"]) ? Number(studentObj.terms["3"].weightageMarks) || 0 : 0;
    return w1 + w2 + w3;
}

function renderResultTable(classKey) {
    let sessionVal = document.getElementById('sessionYear').value || "২০২৬";
    let students = schoolDatabase[classKey].students;

    document.getElementById('resClassName').innerText = document.getElementById('className').value;
    document.getElementById('resSession').innerText = sessionVal;
    document.getElementById('resTotalStudents').innerText = students.length;
    document.getElementById('resWorkingDays').innerText = totalWorkingDaysCount;
    
    let termNameText = selectedTerm === "1" ? "১ম প্রান্তিক" : (selectedTerm === "2" ? "২য় প্রান্তিক" : "৩য় প্রান্তিক/বার্ষিক");
    document.getElementById('resTermName').innerText = termNameText;

    if(selectedTerm === "3") {
        document.getElementById('resTableWeightHeader').innerText = "৮০% ওয়েটেজ";
        document.getElementById('resTableScoreHeader').innerText = "বার্ষিক মোট নম্বর (১০০% ওয়েটেজ)";
    } else {
        document.getElementById('resTableScoreHeader').innerText = "মোট নম্বর";
        document.getElementById('resTableWeightHeader').innerText = "১০% ওয়েটেজ";
    }

    let tbody = document.querySelector('#resultTable tbody');
    tbody.innerHTML = "";

    students.forEach((st, idx) => {
        let termData = st.terms[selectedTerm];
        if(!termData) return;

        let displayScore = (selectedTerm === "3") ? termData.annualTotalWeighted : termData.totalMarks;
        let subDetailsHTML = termData.subResults.map(s => `${s.name}: ${s.mark} (${s.grade} - ${s.eval})`).join('<br>');
        let rollNumber = (idx + 1).toString().padStart(2, '0');

        tbody.innerHTML += `
            <tr>
                <td><b>${rollNumber}</b></td>
                <td><b>${st.name}</b></td>
                <td>${termData.attendance}%</td>
                <td>${termData.weightageMarks}</td>
                <td><b>${displayScore}</b></td>
                <td><b>${termData.gpa}</b></td>
                <td><span class="${termData.status === 'পাশ' ? 'badge-pass' : 'badge-fail'}">${termData.status}</span></td>
                <td><b>${termData.rank}ম</b></td>
                <td style="text-align: left; font-size: 11px;">${subDetailsHTML}</td>
                <td>
                    <button
                        type="button"
                        class="btn-result-details"
                        onclick="openResultDetails(${idx})"
                    >
                        বিস্তারিত
                    </button>
                </td>
            </tr>
        `;
    });
}


function openResultDetails(studentIndex) {
    const className =
        document.getElementById('className')?.value || "";

    const sessionYear =
        document.getElementById('sessionYear')?.value || "";

    const context = {
        classKey: `${className}_${sessionYear}`,
        studentIndex: studentIndex,
        term: selectedTerm
    };

    sessionStorage.setItem(
        'ls_result_details_context',
        JSON.stringify(context)
    );

    window.location.href = 'result-details.html';
}

// Edit and Reset Action Handlers
function handleEditCurrentStudent() {

    const currentUser = getCurrentLoggedInUser();

    if (!currentUser) {
        alert('লগইন করা ব্যবহারকারীর তথ্য পাওয়া যায়নি। আবার লগইন করুন।');
        window.location.href = 'index.html';
        return;
    }

    const cName =
        document.getElementById('className').value.trim();

    const sYear =
        document.getElementById('sessionYear').value.trim();

    const classKey = `${cName}_${sYear}`;

    const classRecord = schoolDatabase[classKey];

    if (
        classRecord &&
        classRecord.ownerTeacherId &&
        classRecord.ownerTeacherId !==
        localStorage.getItem('LS_LOGGED_IN_USER')
    ) {
        alert('এই রেজাল্ট পরিবর্তন করার অনুমতি আপনার নেই।');
        return;
    }

    isEditingExistingResult = true;
    editingExistingClassKey = classKey;
    editingExistingTerm = selectedTerm;

    showFormView();
    goToStep(1);
}

function handleAddNewTerm() {

    const currentUser = getCurrentLoggedInUser();

    if (!currentUser) {
        alert('লগইন করা ব্যবহারকারীর তথ্য পাওয়া যায়নি। আবার লগইন করুন।');
        window.location.href = 'index.html';
        return;
    }

    const cName =
        document.getElementById('className').value.trim();

    const sYear =
        document.getElementById('sessionYear').value.trim();

    const classKey = `${cName}_${sYear}`;

    const classRecord = schoolDatabase[classKey];

    if (
        classRecord &&
        classRecord.ownerTeacherId &&
        classRecord.ownerTeacherId !==
        localStorage.getItem('LS_LOGGED_IN_USER')
    ) {
        alert('এই রেজাল্ট পরিবর্তন করার অনুমতি আপনার নেই।');
        return;
    }

    isEditingExistingResult = false;
    editingExistingClassKey = '';
    editingExistingTerm = '';

    showFormView();
    document.getElementById('totalSubjects').value = '';
    document.getElementById('subjectContainer').innerHTML = '';
    goToStep(1);
}

// =========================================================
// BOOKLET VIEW & DYNAMIC POPULATION
// =========================================================
function showBookletView() {
    document.getElementById('formSection').classList.add('hidden');
    document.getElementById('bookletSection').classList.remove('hidden');

    // Booklet page state reset
    currentStep = 1;

    if (typeof pages !== 'undefined' && pages) {
        pages.forEach(page => page.classList.remove('flipped'));
    }

    updateIndicator();

    let cName = document.getElementById('className').value;
    let sYear = document.getElementById('sessionYear').value;
    let classKey = `${cName}_${sYear}`;
    let students = schoolDatabase[classKey] ? schoolDatabase[classKey].students : [];

    let selector = document.getElementById('studentSelector');
    selector.innerHTML = "";
    students.forEach((st, idx) => {
        let activeRank = st.terms[selectedTerm] ? st.terms[selectedTerm].rank : (idx+1);
        selector.innerHTML += `<option value="${idx}">${st.name} (মেধা স্থান: ${activeRank})</option>`;
    });

    loadStudentBooklet();
}
function showFormView() {
    document.getElementById('bookletSection').classList.add('hidden');
    document.getElementById('formSection').classList.remove('hidden');
}

function loadStudentBooklet() {
    let cName = document.getElementById('className').value;
    let sYear = document.getElementById('sessionYear').value;
    let classKey = `${cName}_${sYear}`;
    let students = schoolDatabase[classKey] ? schoolDatabase[classKey].students : [];

    let idx = document.getElementById('studentSelector').value || 0;
    let student = students[idx];
    if (!student) return;

    let activeTermData = student.terms[selectedTerm] || { rank: '-' };

    // Cover Page Mapping
    document.getElementById('bk-stud-name').innerText = student.name;
    document.getElementById('bk-stud-class').innerText = cName;
    document.getElementById('bk-stud-roll').innerText = activeTermData.rank;
    document.getElementById('bk-stud-id').innerText = student.studentId || '';
    document.getElementById('bk-stud-session').innerText = sYear;

    // Year Boxes
    let yearContainer = document.getElementById('yearBoxContainer');
    if (yearContainer) {
        yearContainer.innerHTML = "";
        sYear.split('').forEach(d => {
            yearContainer.innerHTML += `<div class="year-box">${d}</div>`;
        });
    }

    // Render all available terms for this student
    renderBookletTable('bk-table-term1', student, "1", students.length);
    renderBookletTable('bk-table-term2', student, "2", students.length);
    renderBookletTable('bk-table-term3', student, "3", students.length);

    // Populate Page 3C: Annual Summary Page
    document.getElementById('sum-name').innerText = student.name;
    document.getElementById('sum-class').innerText = cName;
    document.getElementById('sum-session').innerText = sYear;
    document.getElementById('sum-roll').innerText = activeTermData.rank;

    let t1 = student.terms["1"];
    let t2 = student.terms["2"];
    let t3 = student.terms["3"];

    document.getElementById('sum-t1-marks').innerText = t1 ? t1.totalMarks : '-';
    document.getElementById('sum-t1-rank').innerText = t1 ? (t1.rank + 'ম') : '-';

    document.getElementById('sum-t2-marks').innerText = t2 ? t2.totalMarks : '-';
    document.getElementById('sum-t2-rank').innerText = t2 ? (t2.rank + 'ম') : '-';

    document.getElementById('sum-t3-marks').innerText = t3 ? t3.totalMarks : '-';
    document.getElementById('sum-t3-rank').innerText = t3 ? (t3.rank + 'ম') : '-';

    let grandTotal = getAnnualTotalWeightedScore(student).toFixed(2);
    document.getElementById('sum-grand-total').innerText = grandTotal;
    document.getElementById('sum-final-rank').innerText = t3 ? (t3.rank + 'ম') : '-';
    document.getElementById('sum-final-status').innerText = (t1?.status === 'ফেল' || t2?.status === 'ফেল' || t3?.status === 'ফেল') ? 'অনুত্তীর্ণ' : 'উত্তীর্ণ';

    // Attendance Page 4
    document.getElementById('bk-working-days').innerText = `${totalWorkingDaysCount} দিন`;
    let attBody = document.getElementById('bk-attendance-rows');
    attBody.innerHTML = "";

    let row1 = `<tr><td>মোট কার্য দিবস</td>`;
    let row2 = `<tr><td>মোট উপস্থিতি</td>`;
    let row3 = `<tr><td>মোট অনুপস্থিতি</td>`;

    for(let i=0; i<12; i++) {
        let wDay = monthlyWorkingDays[i] || 0;
        let aDay = student.monthlyAtt ? (student.monthlyAtt[i] || 0) : 0;
        let absDay = wDay > aDay ? (wDay - aDay) : 0;

        row1 += `<td class="handwritten-blue">${wDay || ''}</td>`;
        row2 += `<td class="handwritten-blue">${aDay || ''}</td>`;
        row3 += `<td class="handwritten-blue">${wDay ? absDay : ''}</td>`;
    }

    attBody.innerHTML = row1 + `</tr>` + row2 + `</tr>` + row3 + `</tr>` + `
        <tr>
            <td>শিক্ষকের মন্তব্য</td>
            <td colspan="12" class="remarks-cell">
                <span class="handwritten-blue">
                    ${(activeTermData.status === 'পাশ') ? 'আচরণ ভালো। শ্রেণি কাজে নিয়মিত মনোযোগ দেয়। ফলাফল সন্তোষজনক।' : 'পড়াশোনায় আরও মনোযোগ দেওয়া প্রয়োজন। নিয়মিত ক্লাসে উপস্থিতি কাম্য।'}
                </span>
            </td>
        </tr>
    `;
}

// Render Booklet Tables
function renderBookletTable(tableId, student, termKey, totalStudentsCount) {
    let tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = "";

    let termData = student.terms[termKey];

    if (!termData) {
        tbody.innerHTML = `<tr><td colspan="9" style="padding:15px; color:#888;">এই প্রান্তিকের মূল্যায়ন তথ্য প্রদান করা হয়নি।</td></tr>`;
        return;
    }

    let rowCount = termData.subResults.length;
    let displayScore = (termKey === "3") ? termData.annualTotalWeighted : termData.totalMarks;

    termData.subResults.forEach((sub, i) => {
        if (i === 0) {
            tbody.innerHTML += `
                <tr>
                    <td class="text-left">${sub.name}</td>
                    <td>${sub.fullMark}</td>
                    <td class="handwritten">${sub.highestMark}</td>
                    <td class="handwritten">${sub.mark}</td>
                    <td class="handwritten">${sub.grade}</td>
                    <td class="handwritten">${sub.gp}</td>
                    <td rowspan="${rowCount}" class="handwritten"><div class="vertical-text">${termData.gpa}</div></td>
                    <td rowspan="${rowCount}" class="handwritten"><div class="vertical-text">${termData.weightageMarks}</div></td>
                    <td rowspan="${rowCount}" class="handwritten"><b>${termData.rank}ম</b></td>
                </tr>
            `;
        } else {
            tbody.innerHTML += `
                <tr>
                    <td class="text-left">${sub.name}</td>
                    <td>${sub.fullMark}</td>
                    <td class="handwritten">${sub.highestMark}</td>
                    <td class="handwritten">${sub.mark}</td>
                    <td class="handwritten">${sub.grade}</td>
                    <td class="handwritten">${sub.gp}</td>
                </tr>
            `;
        }
    });

    tbody.innerHTML += `
        <tr style="font-weight: bold; background-color: #f5f5f5;">
            <td class="text-left">${termKey === "3" ? '৩টি পরীক্ষার মোট প্রাপ্ত মান' : 'মোট নম্বর'}</td>
            <td>${termData.grandFullMark}</td>
            <td>-</td>
            <td class="handwritten">${displayScore}</td>
            <td colspan="5"></td>
        </tr>
        <tr>
            <td class="text-left">মোট ছাত্র/ছাত্রীর সংখ্যা</td>
            <td colspan="8" class="handwritten" style="text-align: left; padding-left: 10px;">${totalStudentsCount} জন</td>
        </tr>
        <tr>
            <td class="text-left">মোট কার্য দিবস</td>
            <td colspan="8" class="handwritten" style="text-align: left; padding-left: 10px;">${totalWorkingDaysCount} দিন</td>
        </tr>
    `;
}

// BOOKLET PAGE NAVIGATION (Updated for 7 Pages)
let currentStep = 1;
const totalSteps = 7;

const pages = [
    document.getElementById('p1'),
    document.getElementById('p2'),
    document.getElementById('p3'),
    document.getElementById('p3b'),
    document.getElementById('p3c'),
    document.getElementById('p4'),
    document.getElementById('p5')
];

function updateIndicator() {
    document.getElementById('page-num').innerText = 'পৃষ্ঠা: ' + currentStep + ' / ' + totalSteps;
}

function nextPage() {
    if (currentStep < totalSteps) {
        pages[currentStep - 1].classList.add('flipped');
        currentStep++;
        updateIndicator();
    }
}

function prevPage() {
    if (currentStep > 1) {
        currentStep--;
        pages[currentStep - 1].classList.remove('flipped');
        updateIndicator();
    }
}

function downloadResultPDF() {
    let element = document.getElementById('step-4');
    let className = document.getElementById('className').value || "Class";

    if (!element) {
        alert("ধাপ ৪ এর টেবিলটি পাওয়া যায়নি!");
        return;
    }

    // টেবিলের আসল রূপ ধরে রাখার জন্য একটি কন্টেইনার
    let cloneElement = element.cloneNode(true);
    
    // PDF বাটনে ক্লিক করলে বা বাটনগুলো বাদ দেওয়ার জন্য (যদি থাকে)
    let buttons = cloneElement.querySelectorAll('button, .btn, input[type="button"]');
    buttons.forEach(btn => btn.remove());

    cloneElement.style.width = '1050px';
    cloneElement.style.padding = '20px';
    cloneElement.style.background = '#ffffff';

    let opt = {
        margin:       [0.3, 0.3, 0.3, 0.3],
        filename:     `Result_Sheet_${className}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(cloneElement).save().then(() => {
        console.log("রেজাল্ট শিট সফলভাবে ডাউনলোড হয়েছে!");
    });
}

function downloadBookletPDF() {
    let cName = document.getElementById('className').value;
    let sYear = document.getElementById('sessionYear').value;
    let classKey = `${cName}_${sYear}`;
    let students = schoolDatabase[classKey] ? schoolDatabase[classKey].students : [];

    let idx = document.getElementById('studentSelector').value || 0;
    let student = students[idx];
    let studentName = student ? student.name : "Student";

    let pdfWrapper = document.createElement('div');
    pdfWrapper.style.width = '480px';
    pdfWrapper.style.margin = '0 auto';
    pdfWrapper.style.background = '#fff';

    pages.forEach((p) => {
        let pageFront = p.querySelector('.page-front').cloneNode(true);
        pageFront.style.position = 'relative';
        pageFront.style.width = '480px';
        pageFront.style.height = '670px';
        pageFront.style.pageBreakAfter = 'always';
        pdfWrapper.appendChild(pageFront);
    });

    let opt = {
        margin:       0,
        filename:     `Progress_Report_${studentName}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'pt', format: [480, 670], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfWrapper).outputPdf('blob').then(function(pdfBlob) {
        let fileName = `Progress_Report_${studentName}.pdf`;
        let file = new File([pdfBlob], fileName, { type: 'application/pdf' });

        let a = document.createElement('a');
        a.href = URL.createObjectURL(pdfBlob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: `Progress Report - ${studentName}`,
                text: `${studentName}-এর প্রগ্রেস রিপোর্ট PDF`
            }).catch((error) => console.log('Sharing canceled or failed', error));
        }
    });
}


function printResultPage() {
    const element = document.getElementById('step-4');

    if (!element) {
        alert('ফলাফল পেজ পাওয়া যায়নি।');
        return;
    }

    const cloneElement = element.cloneNode(true);

    cloneElement.querySelectorAll('button').forEach(btn => btn.remove());

    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    if (!printWindow) {
        alert('Print window খোলা যায়নি।');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <title>ফলাফল প্রিন্ট</title>

            <link rel="stylesheet" href="style.css">
            <link rel="stylesheet" href="style2.css">

            <style>
                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }

                body {
                    margin: 0;
                    padding: 0;
                    background: #fff;
                }

                #step-4 {
                    display: block !important;
                    width: 100% !important;
                    overflow: visible !important;
                }

                table {
                    page-break-inside: auto;
                }

                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
            </style>
        </head>

        <body>
            ${cloneElement.outerHTML}

            <script>
                window.onload = function () {
                    setTimeout(function () {
                        window.print();
                    }, 700);
                };

                window.onafterprint = function () {
                    window.close();
                };
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
}


function printBooklet() {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');

    if (!printWindow) {
        alert('Print window খোলা যায়নি।');
        return;
    }

    const pdfWrapper = document.createElement('div');
    pdfWrapper.style.width = '480px';
    pdfWrapper.style.margin = '0 auto';
    pdfWrapper.style.background = '#fff';

    pages.forEach((p) => {
        const pageFront = p.querySelector('.page-front').cloneNode(true);

        pageFront.style.position = 'relative';
        pageFront.style.width = '480px';
        pageFront.style.height = '670px';
        pageFront.style.pageBreakAfter = 'always';
        pageFront.style.breakAfter = 'page';

        pdfWrapper.appendChild(pageFront);
    });

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <title>প্রগ্রেস রিপোর্ট প্রিন্ট</title>

            <link rel="stylesheet" href="style.css">
            <link rel="stylesheet" href="style2.css">

            <style>
                @page {
                    size: 480px 670px;
                    margin: 0;
                }

                html, body {
                    margin: 0;
                    padding: 0;
                    background: #fff;
                }

                .print-wrapper {
                    width: 480px;
                    margin: 0 auto;
                }
            </style>
        </head>

        <body>
            <div class="print-wrapper">
                ${pdfWrapper.innerHTML}
            </div>

            <script>
                window.onload = function () {
                    setTimeout(function () {
                        window.print();
                    }, 1000);
                };

                window.onafterprint = function () {
                    window.close();
                };
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
}


