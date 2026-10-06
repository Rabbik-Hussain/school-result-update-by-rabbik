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

// =========================================================
// Feature 6 — এক নজরে সেরা শিক্ষার্থী Form Open / Close
// =========================================================

function openBestStudentsForm() {

    const formSection =
        document.getElementById('best-students-form-section');

    if (!formSection) return;

    formSection.style.display = 'block';

    formSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}


function closeBestStudentsForm() {

    const formSection =
        document.getElementById('best-students-form-section');

    if (!formSection) return;

    formSection.style.display = 'none';
}

// =========================================================
// Feature 6 — Best Students Form Submit
// Step 5: Session Input
// =========================================================

function handleBestStudentsFormSubmit(event) {

    event.preventDefault();

    const sessionInput =
        document.getElementById('best-students-session-input');

    if (!sessionInput) return;

    const session = sessionInput.value.trim();

if (!session) {
    alert('অনুগ্রহ করে সেশন লিখুন।');
    return;
}

// নতুন সেশন সার্চ করার আগে আগের ফলাফল পরিষ্কার করুন
const oldBestStudentsResults =
    document.getElementById('best-students-search-results');

if (oldBestStudentsResults) {
    oldBestStudentsResults.innerHTML = '';
}

    // Step 5-এ শুধু Session নেওয়া হচ্ছে।
    // Best Students calculation পরবর্তী Step-এ যোগ হবে।
   const schoolData =
    JSON.parse(localStorage.getItem('ls_school_data')) || {};

const sessionResults = Object.entries(schoolData).filter(
    ([key, classData]) =>
        classData &&
        classData.sessionYear === session
);

console.log('Best Students Session:', session);
console.log('Best Students Existing Data:', sessionResults);
console.log('Best Students Data Structure:', sessionResults);
if (sessionResults.length === 0) {
    alert('এই সেশনের জন্য এখনো কোনো ফলাফল পাওয়া যায়নি।');
    return;
}

console.log(
    'Best Students First Data JSON:',
    JSON.stringify(sessionResults[0][1], null, 2)
);

const existingTerms = new Set();

sessionResults.forEach(([key, classData]) => {

    if (!classData || !Array.isArray(classData.students)) {
        return;
    }

    classData.students.forEach(student => {

        if (!student || !student.terms) {
            return;
        }

        Object.keys(student.terms).forEach(term => {
            existingTerms.add(term);
        });

    });

});

console.log(
    'Best Students Existing Terms:',
    Array.from(existingTerms).sort()
);

// =========================================================
// Feature 6 — Step 9
// Existing students data সংগ্রহ
// =========================================================

const bestStudentsData = {};

Array.from(existingTerms).sort().forEach(term => {

    bestStudentsData[term] = [];

    sessionResults.forEach(([key, classData]) => {

        if (!classData || !Array.isArray(classData.students)) {
            return;
        }

        classData.students.forEach(student => {

            if (!student || !student.terms) {
                return;
            }

            const termResult = student.terms[term];

            if (!termResult) {
                return;
            }

            bestStudentsData[term].push({
                className: classData.className,
                name: student.name,
                gpa: termResult.gpa,
                rank: termResult.rank
            });

        });

    });

});

console.log(
    'Best Students Collected Data JSON:',
    JSON.stringify(bestStudentsData, null, 2)
);

// =========================================================
// Feature 6 — Step 10
// প্রতিটি Class-এর Top 5 শিক্ষার্থী নির্বাচন
// =========================================================

const bestStudentsTop5 = {};

Object.keys(bestStudentsData).forEach(term => {

    bestStudentsTop5[term] = {};

    const classGroups = {};

    bestStudentsData[term].forEach(student => {

        if (!classGroups[student.className]) {
            classGroups[student.className] = [];
        }

        classGroups[student.className].push(student);

    });

    Object.keys(classGroups).forEach(className => {

        bestStudentsTop5[term][className] =
            classGroups[className]
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 5);

    });

});

console.log(
    'Best Students Top 5 JSON:',
    JSON.stringify(bestStudentsTop5, null, 2)
);

// =========================================================
// Feature 6 — Step 11
// Best Students Result Display
// =========================================================

const bestStudentsResultsContainer =
    document.getElementById('best-students-search-results');

if (bestStudentsResultsContainer) {

    bestStudentsResultsContainer.innerHTML = '';

    // বাকি কোড...

    const termNames = {
        '1': 'প্রথম প্রান্তিক',
        '2': 'দ্বিতীয় প্রান্তিক',
        '3': 'তৃতীয় প্রান্তিক'
    };

    Object.keys(bestStudentsTop5)
        .sort((a, b) => Number(a) - Number(b))
        .forEach(term => {

            const termWrapper =
                document.createElement('div');

            termWrapper.className =
                'best-students-term-wrapper';

            const termCard = document.createElement('div');
            termCard.className = 'best-students-term-card';

            const termTitle = document.createElement('h3');
            termTitle.className = 'best-students-term-card-title';

            termTitle.textContent =
                termNames[term] || `${term}ম প্রান্তিক`;

            termCard.appendChild(termTitle);

const viewButton = document.createElement('button');

viewButton.type = 'button';
viewButton.className = 'btn-view-best-students';
viewButton.textContent = 'সেরা দেখুন';

viewButton.dataset.term = term;

viewButton.addEventListener('click', function () {

    const selectedTerm = this.dataset.term;

    const selectedTermData =
        bestStudentsTop5[selectedTerm];

    if (!selectedTermData) {
        return;
    }

    const existingList =
        termWrapper.querySelector(
            `.best-students-list-section[data-term="${selectedTerm}"]`
        );

    if (existingList) {

        existingList.remove();

        return;
    }

    const listSection =
        document.createElement('div');

    listSection.className =
    'best-students-term-card best-students-list-section';

    listSection.style.marginTop = '20px';
    listSection.style.alignItems = 'stretch';

    listSection.dataset.term =
        selectedTerm;

    const listTitle =
        document.createElement('h3');

    listTitle.className =
        'best-students-list-title';

    listTitle.textContent =
        termNames[selectedTerm] ||
        `${selectedTerm}ম প্রান্তিক`;

    listSection.appendChild(listTitle);

    Object.keys(selectedTermData).forEach(className => {

        const classSection =
            document.createElement('div');

        classSection.className =
            'best-students-class-section';

        const classTitle =
            document.createElement('h4');

        classTitle.className =
            'best-students-class-title';

        classTitle.textContent =
            `শ্রেণী: ${className}`;

        classSection.appendChild(classTitle);

        selectedTermData[className].forEach(student => {

            const studentItem =
                document.createElement('div');

            studentItem.className =
                'best-student-item';

            const meritNames = {
                1: 'প্রথম',
                2: 'দ্বিতীয়',
                3: 'তৃতীয়',
                4: 'চতুর্থ',
                5: 'পঞ্চম'
            };

            const meritPosition =
                meritNames[student.rank] ||
                student.rank;

            studentItem.innerHTML = `
                <div>
                    <strong>নাম:</strong>
                    ${student.name}
                </div>

                <div>
                    <strong>মেধাস্থান:</strong>
                    ${meritPosition}
                </div>

                <div>
                    <strong>GPA:</strong>
                    ${student.gpa}
                </div>
            `;

            classSection.appendChild(studentItem);

        });

        listSection.appendChild(classSection);

    });

    termWrapper.appendChild(listSection);

});

termCard.appendChild(viewButton);

termWrapper.appendChild(termCard);

bestStudentsResultsContainer.appendChild(termWrapper);

        });
}

}


function openResultCreation() {

    const currentUser = getCurrentLoggedInUser();

    if (!currentUser) {
        alert('লগইন করা ব্যবহারকারীর তথ্য পাওয়া যায়নি। আবার লগইন করুন।');
        window.location.href = 'index.html';
        return;
    }

    if (currentUser.designation !== 'শ্রেণী শিক্ষক (Class Teacher)') {
        alert('এই বাটনটি শুধু ক্লাস টিচারের জন্য বরাদ্দ।');
        return;
    }

    window.location.href = 'result.html';
}

// পেজ পরিবর্তন করার ফাংশন
function showPage(pageName) {
  // পেজ সমূহের অ্যাক্টিভ ক্লাস পরিবর্তন
  document.getElementById('home-page').classList.remove('active-page');
  document.getElementById('info-page').classList.remove('active-page');
  
  // বাটন সমূহের অ্যাক্টিভ ক্লাস পরিবর্তন
  document.getElementById('btn-home').classList.remove('active');
  document.getElementById('btn-info').classList.remove('active');
  
  if (pageName === 'home') {
    document.getElementById('home-page').classList.add('active-page');
    document.getElementById('btn-home').classList.add('active');
  } else if (pageName === 'info') {
    document.getElementById('info-page').classList.add('active-page');
    document.getElementById('btn-info').classList.add('active');

    renderDirectorInformation();
    renderTeacherInformation();
  }
}


// ================= DIRECTOR INFORMATION CARDS =================

function renderDirectorInformation() {
  const container =
    document.getElementById('directorsInformationContainer');

  if (!container) return;

  container.innerHTML = '';

  const teachersDB =
    JSON.parse(localStorage.getItem('teachersDB')) || {};

  const directorIds =
    Object.keys(teachersDB).filter(function(id) {
      return teachersDB[id] &&
             teachersDB[id].designation === 'পরিচালক (Director)';
    });

  if (directorIds.length === 0) {
    container.innerHTML = `
            <div style="
                text-align:center;
                padding:30px 15px;
                color:#888;
                width:100%;
            ">
                এখনো কোনো পরিচালক নিবন্ধন করেননি।
            </div>
        `;
    return;
  }

  directorIds.forEach(function(directorId) {
    const director = teachersDB[directorId];

    if (!director) return;

    const fullName =
      director.name || 'নাম পাওয়া যায়নি';

    const profileImage =
      director.profileImage || '';

    const signatureImage =
      director.signatureImage || '';

    const card =
      document.createElement('div');

    card.className = 'director-info-card';

    card.innerHTML = `
            <div class="director-profile-side">

                ${
                    profileImage
                    ?
                    `
                    <img
                        src="${profileImage}"
                        alt="Director Profile"
                        class="director-profile-image"
                    >
                    `
                    :
                    `
                    <div
                        class="director-profile-image"
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:#eef2f7;
                            color:#2a5298;
                            font-size:2.5rem;
                        "
                    >
                        <i class="fa-solid fa-user"></i>
                    </div>
                    `
                }

            </div>


            <div class="director-details-side">

                <div class="director-name">
                    ${fullName}
                </div>


                <div class="director-detail-row">

                    <i class="fa-solid fa-id-card"></i>

                    <span>
                        Director ID: ${directorId}
                    </span>

                </div>


                <div class="director-detail-row">

                    <i class="fa-solid fa-user-tie"></i>

                    <span>
                        ${director.directorType || 'পদবি পাওয়া যায়নি'}
                    </span>

                </div>


                <div class="director-detail-row">

                    <i class="fa-solid fa-signature"></i>

                    <span>
                        Signature
                    </span>

                    ${
                        signatureImage
                        ?
                        `
                        <img
                            src="${signatureImage}"
                            alt="Director Signature"
                            class="director-signature"
                        >
                        `
                        :
                        `
                        <span style="color:#999; font-size:0.9rem;">
                            স্বাক্ষর দেওয়া হয়নি
                        </span>
                        `
                    }

                </div>

            </div>
        `;

    container.appendChild(card);
  });
}


// =========================================================
// REMOVE DIRECTOR
// =========================================================

function openRemoveDirectorForm() {
  const form =
    document.getElementById('removeDirectorForm');

  if (!form) return;

  form.style.display = 'block';

  form.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


function closeRemoveDirectorForm() {
  const form =
    document.getElementById('removeDirectorForm');

  if (!form) return;

  form.style.display = 'none';

  const idInput =
    document.getElementById('removeDirectorId');

  const passwordInput =
    document.getElementById('removeDirectorPassword');

  if (idInput) {
    idInput.value = '';
  }

  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.type = 'password';
  }

  const icon =
    document.getElementById('removeDirectorPasswordIcon');

  if (icon) {
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}


function toggleRemoveDirectorPassword() {
  const input =
    document.getElementById('removeDirectorPassword');

  const icon =
    document.getElementById('removeDirectorPasswordIcon');

  if (!input || !icon) return;

  if (input.type === 'password') {

    input.type = 'text';

    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');

  } else {

    input.type = 'password';

    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');

  }
}


function handleRemoveDirector(event) {
  event.preventDefault();

  const directorId =
    document.getElementById('removeDirectorId').value.trim();

  const password =
    document.getElementById('removeDirectorPassword').value;

  const teachersDB =
    JSON.parse(localStorage.getItem('teachersDB')) || {};

  const director =
    teachersDB[directorId];


  // Director ID পাওয়া না গেলে
  if (!director) {
    alert("এই Director ID-টি নিবন্ধিত নয়!");
    return;
  }


  // ID সঠিক হলেও Director না হলে
  if (director.designation !== 'পরিচালক (Director)') {
    alert("এই ID-টি কোনো Director-এর নয়!");
    return;
}


  // Password ভুল হলে
  if (director.password !== password) {
    alert("Director ID এবং Password মিল নেই!");
    return;
  }


  // সঠিক ID + Password হলে Confirmation
  const confirmed =
    confirm("আপনি কি Director-কে Remove করতে চান?");

  if (!confirmed) {
    return;
  }


  // Director data delete
  delete teachersDB[directorId];
localStorage.setItem('teachersDB', JSON.stringify(teachersDB));

if (localStorage.getItem('LS_LOGGED_IN_USER') === directorId) {
    localStorage.removeItem('LS_LOGGED_IN_USER');
}


  alert("Director সফলভাবে Remove করা হয়েছে!");


  // Form reset এবং close
  const form =
    document.getElementById('removeDirectorForm');

  if (form) {
    form.style.display = 'none';
  }


  const idInput =
    document.getElementById('removeDirectorId');

  const passwordInput =
    document.getElementById('removeDirectorPassword');

  if (idInput) {
    idInput.value = '';
  }

  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.type = 'password';
  }


  const icon =
    document.getElementById('removeDirectorPasswordIcon');

  if (icon) {
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }


  // Director information card সঙ্গে সঙ্গে update
  renderDirectorInformation();
}


// =========================================================
// TEACHER INFORMATION CARDS
// =========================================================

function renderTeacherInformation() {
  const container =
    document.getElementById('teachersInformationContainer');

  if (!container) return;

  container.innerHTML = '';

  const teachersDB =
    JSON.parse(localStorage.getItem('teachersDB')) || {};

  const teacherIds =
    Object.keys(teachersDB).filter(function(id) {
      return teachersDB[id] &&
             teachersDB[id].designation !== 'পরিচালক (Director)';
    });


  if (teacherIds.length === 0) {
    container.innerHTML = `
            <div style="
                text-align:center;
                padding:30px 15px;
                color:#888;
                width:100%;
            ">
                এখনো কোনো শিক্ষক নিবন্ধন করেননি।
            </div>
        `;
    return;
  }


  teacherIds.forEach(function(teacherId) {
    const teacher =
      teachersDB[teacherId];

    if (!teacher) return;

    const fullName =
      teacher.name || 'নাম পাওয়া যায়নি';

    const profileImage =
      teacher.profileImage || '';

    const signatureImage =
      teacher.signatureImage || '';


    const card =
      document.createElement('div');

    card.className = 'teacher-info-card';


    card.innerHTML = `
            <div class="teacher-profile-side">
                ${
                    profileImage
                    ?
                    `<img src="${profileImage}" alt="Teacher Profile" class="teacher-profile-image">`
                    :
                    `
                    <div
                        class="teacher-profile-image"
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:#eef2f7;
                            color:#2a5298;
                            font-size:2.5rem;
                        "
                    >
                        <i class="fa-solid fa-user"></i>
                    </div>
                    `
                }
            </div>

            <div class="teacher-details-side">
                <div class="teacher-name">
                    ${fullName}
                </div>

                <div class="teacher-detail-row">
                    <i class="fa-solid fa-id-card"></i>
                    <span>Teacher ID: ${teacherId}</span>
                </div>

                <div class="teacher-detail-row">
                    <i class="fa-solid fa-briefcase"></i>
                    <span>
                        ${
                            teacher.designation &&
                            teacher.designation.includes('শ্রেণী শিক্ষক')
                            ? `শ্রেণী শিক্ষক (Class Teacher) — ${
                                {
                                    'প্লে': 'প্লে (Play)',
                                    'নার্সারি': 'নার্সারি (Nursery)',
                                    'ওয়ান': 'ওয়ান (One)',
                                    'ওয়ান': 'ওয়ান (One)',
                                    'টু': 'টু (Two)',
                                    'থ্রি': 'থ্রি (Three)',
                                    'ফোর': 'ফোর (Four)',
                                    'ফাইভ': 'ফাইভ (Five)'
                                }[String(teacher.className || '').trim()] || teacher.className || ''
                            }`
                            : teacher.designation === 'প্রধান শিক্ষক (Head Teacher)'
                            ? `প্রধান শিক্ষক (Head Teacher)`
                            : teacher.designation === 'সহকারী শিক্ষক (Assistant Teacher)'
                            ? `সহকারী শিক্ষক (Assistant Teacher)`
                            : teacher.designation || ''
                        }
                    </span>
                </div>

                <div class="teacher-detail-row">
                    <i class="fa-solid fa-signature"></i>
                    <span>Signature</span>

                    ${
                        signatureImage
                        ?
                        `<img src="${signatureImage}" alt="Teacher Signature" class="teacher-signature">`
                        :
                        `<span style="color:#999; font-size:0.9rem;">
                            স্বাক্ষর দেওয়া হয়নি
                        </span>`
                    }
                </div>
            </div>
        `;

    container.appendChild(card);
  });
}


// =========================================================
// REMOVE TEACHER
// =========================================================

function openRemoveTeacherForm() {
  const form =
    document.getElementById('removeTeacherForm');

  if (!form) return;

  form.style.display = 'block';

  form.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


function closeRemoveTeacherForm() {
  const form =
    document.getElementById('removeTeacherForm');

  if (!form) return;

  form.style.display = 'none';

  const idInput =
    document.getElementById('removeTeacherId');

  const passwordInput =
    document.getElementById('removeTeacherPassword');

  if (idInput) {
    idInput.value = '';
  }

  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.type = 'password';
  }

  const icon =
    document.getElementById('removeTeacherPasswordIcon');

  if (icon) {
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}


function toggleRemoveTeacherPassword() {
  const input =
    document.getElementById('removeTeacherPassword');

  const icon =
    document.getElementById('removeTeacherPasswordIcon');

  if (!input || !icon) return;

  if (input.type === 'password') {

    input.type = 'text';

    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');

  } else {

    input.type = 'password';

    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');

  }
}


function handleRemoveTeacher(event) {
  event.preventDefault();

  const teacherId =
    document.getElementById('removeTeacherId').value.trim();

  const password =
    document.getElementById('removeTeacherPassword').value;

  const teachersDB =
    JSON.parse(localStorage.getItem('teachersDB')) || {};

  const teacher =
    teachersDB[teacherId];


  // Teacher ID পাওয়া না গেলে
  if (!teacher) {
    alert("এই টিচার আইডিটি নিবন্ধিত নয়!");
    return;
  }


  // Director ID দিয়ে Teacher remove করা যাবে না
  if (teacher.designation === 'পরিচালক (Director)') {
    alert("এই ID-টি কোনো Teacher-এর নয়!");
    return;
}


  // Password ভুল হলে
  if (teacher.password !== password) {
    alert("টিচার আইডি এবং পাসওয়ার্ড মিল নেই!");
    return;
  }


  // সঠিক ID + Password হলে Confirmation
  const confirmed =
    confirm("আপনি কি টিচারকে রিমুভ করতে চান?");

  if (!confirmed) {
    return;
  }


  // Teacher data delete
  delete teachersDB[teacherId];
localStorage.setItem('teachersDB', JSON.stringify(teachersDB));

if (localStorage.getItem('LS_LOGGED_IN_USER') === teacherId) {
    localStorage.removeItem('LS_LOGGED_IN_USER');
}


  alert("টিচার সফলভাবে রিমুভ করা হয়েছে!");


  // Form reset এবং close
  const form =
    document.getElementById('removeTeacherForm');

  if (form) {
    form.style.display = 'none';
  }


  const idInput =
    document.getElementById('removeTeacherId');

  const passwordInput =
    document.getElementById('removeTeacherPassword');

  if (idInput) {
    idInput.value = '';
  }

  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.type = 'password';
  }


  const icon =
    document.getElementById('removeTeacherPasswordIcon');

  if (icon) {
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }


  // Teacher information card সঙ্গে সঙ্গে update
  renderTeacherInformation();
}


// রেজাল্ট দেখার ফরম খোলার ফাংশন
function openResultForm() {
  const formSection =
    document.getElementById('result-form-section');

  formSection.style.display = 'block';

  // স্মুথ স্ক্রোল করে ফরমে নিয়ে যাওয়া
  formSection.scrollIntoView({
    behavior: 'smooth'
  });
}


// রেজাল্ট দেখার ফরম বন্ধ করার ফাংশন
function closeResultForm() {
  document.getElementById(
    'result-form-section'
  ).style.display = 'none';
}


// ফলাফলের শতকরা হার দেখার ফরম খোলার ফাংশন
function openPercentageResultForm() {
  const formSection =
    document.getElementById('percentage-result-form-section');

  formSection.style.display = 'block';

  // স্মুথ স্ক্রোল করে ফরমে নিয়ে যাওয়া
  formSection.scrollIntoView({
    behavior: 'smooth'
  });
}


// ফলাফলের শতকরা হার দেখার ফরম বন্ধ করার ফাংশন
function closePercentageResultForm() {
  document.getElementById(
    'percentage-result-form-section'
  ).style.display = 'none';
}


// =========================================================
// রেজাল্ট সার্চ ও প্রান্তিক Card দেখানো
// =========================================================

function handleFormSubmit(event) {
  event.preventDefault();

  const className =
    document.getElementById('class-input').value.trim();

  const session =
    document.getElementById('session-input').value.trim();

  const resultContainer =
    document.getElementById('result-search-results');

  if (!resultContainer) return;

  // আগের Search Result পরিষ্কার
  resultContainer.innerHTML = '';

  // LocalStorage থেকে Result Database নেওয়া
  const schoolDatabase =
    JSON.parse(localStorage.getItem('ls_school_data')) || {};

  // result.js-এর একই Class + Session Key
  const classKey = `${className}_${session}`;

  const classData =
    schoolDatabase[classKey];

  // এই Class + Session-এর কোনো তথ্য না থাকলে
  if (
    !classData ||
    !Array.isArray(classData.students)
  ) {
    resultContainer.innerHTML = `
      <div style="
        text-align:center;
        padding:20px;
        color:#d32f2f;
        background:#fff;
        border-radius:10px;
        border:1px solid #f0caca;
        margin-top:20px;
      ">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p style="margin:8px 0 0;">
          এই ক্লাস ও সেশনের কোনো রেজাল্ট পাওয়া যায়নি।
        </p>
      </div>
    `;

    resultContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  // কোন কোন প্রান্তিকের Result আছে তা পরীক্ষা
  const hasTerm1 =
    classData.students.some(function(student) {
      return student &&
             student.terms &&
             student.terms["1"];
    });

  const hasTerm2 =
    classData.students.some(function(student) {
      return student &&
             student.terms &&
             student.terms["2"];
    });

  const hasTerm3 =
    classData.students.some(function(student) {
      return student &&
             student.terms &&
             student.terms["3"];
    });

  // কোনো Term-এর Result না থাকলে
  if (!hasTerm1 && !hasTerm2 && !hasTerm3) {
    resultContainer.innerHTML = `
      <div style="
        text-align:center;
        padding:20px;
        color:#d32f2f;
        background:#fff;
        border-radius:10px;
        border:1px solid #f0caca;
        margin-top:20px;
      ">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p style="margin:8px 0 0;">
          এই ক্লাস ও সেশনের কোনো প্রান্তিক রেজাল্ট পাওয়া যায়নি।
        </p>
      </div>
    `;

    resultContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  // Result Card তৈরি করার Function
  function createTermCard(term, title, icon) {

    const card =
      document.createElement('div');

    card.className = 'result-term-card';

    card.innerHTML = `
      <div class="result-term-card-icon">
        ${icon}
      </div>

      <div class="result-term-card-content">
        <h3>${title}</h3>
        <p>
          ক্লাস: ${className}<br>
          সেশন: ${session}
        </p>
      </div>

      <button
    type="button"
    class="result-term-card-button"
    onclick="openSelectedTermResult('${classKey}', '${term}')"
>
    রেজাল্ট দেখুন
</button>
    `;

    resultContainer.appendChild(card);
  }

  // ১ম প্রান্তিক
  if (hasTerm1) {
    createTermCard(
      "1",
      "১ম প্রান্তিক",
      "📘"
    );
  }

  // ২য় প্রান্তিক
  if (hasTerm2) {
    createTermCard(
      "2",
      "২য় প্রান্তিক",
      "📗"
    );
  }

  // ৩য় প্রান্তিক / বার্ষিক
  if (hasTerm3) {
    createTermCard(
      "3",
      "৩য় প্রান্তিক/বার্ষিক",
      "📕"
    );
  }

  // Search Result-এ স্ক্রোল
  resultContainer.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


// ফলাফলের শতকরা হার দেখার সেশন সার্চ
function handlePercentageFormSubmit(event) {
  event.preventDefault();

  const session =
    document.getElementById('percentage-session-input').value.trim();

  const resultContainer =
    document.getElementById('percentage-result-search-results');

  if (!resultContainer) return;

  // আগের Percentage Result পরিষ্কার
  resultContainer.innerHTML = '';

  // LocalStorage থেকে Result Database নেওয়া
  const schoolDatabase =
    JSON.parse(localStorage.getItem('ls_school_data')) || {};

  // নির্দিষ্ট Session-এর Class খুঁজে বের করা
  const sessionClasses = Object.keys(schoolDatabase).filter(function(key) {

    const classData = schoolDatabase[key];

    return (
      classData &&
      classData.sessionYear &&
      String(classData.sessionYear).trim() === session
    );
  });

  // এই Session-এর কোনো Result Data না থাকলে
  if (sessionClasses.length === 0) {
    resultContainer.innerHTML = `
      <div style="
        text-align:center;
        padding:20px;
        color:#d32f2f;
        background:#fff;
        border-radius:10px;
        border:1px solid #f0caca;
        margin-top:20px;
      ">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p style="margin:8px 0 0;">
          এই সেশনের কোনো রেজাল্ট পাওয়া যায়নি।
        </p>
      </div>
    `;

    resultContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  // কোন কোন প্রান্তিকের Result আছে তা পরীক্ষা
  const hasTerm1 =
    sessionClasses.some(function(key) {
      const classData = schoolDatabase[key];

      return Array.isArray(classData.students) &&
        classData.students.some(function(student) {
          return student &&
                 student.terms &&
                 student.terms["1"];
        });
    });

  const hasTerm2 =
    sessionClasses.some(function(key) {
      const classData = schoolDatabase[key];

      return Array.isArray(classData.students) &&
        classData.students.some(function(student) {
          return student &&
                 student.terms &&
                 student.terms["2"];
        });
    });

  const hasTerm3 =
    sessionClasses.some(function(key) {
      const classData = schoolDatabase[key];

      return Array.isArray(classData.students) &&
        classData.students.some(function(student) {
          return student &&
                 student.terms &&
                 student.terms["3"];
        });
    });

  // কোনো Term-এর Result না থাকলে
  if (!hasTerm1 && !hasTerm2 && !hasTerm3) {
    resultContainer.innerHTML = `
      <div style="
        text-align:center;
        padding:20px;
        color:#d32f2f;
        background:#fff;
        border-radius:10px;
        border:1px solid #f0caca;
        margin-top:20px;
      ">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p style="margin:8px 0 0;">
          এই সেশনের কোনো প্রান্তিক রেজাল্ট পাওয়া যায়নি।
        </p>
      </div>
    `;

    resultContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  // Percentage Result Card তৈরি করার Function
  function createPercentageTermCard(term, title, icon) {

    const card =
      document.createElement('div');

    card.className = 'result-term-card';

    card.innerHTML = `
      <div class="result-term-card-icon">
        ${icon}
      </div>

      <div class="result-term-card-content">
        <h3>${title}</h3>
        <p>
          সেশন: ${session}
        </p>
      </div>

      <button
        type="button"
        class="result-term-card-button"
        onclick="openPercentageTermResult('${session}', '${term}')"
      >
        ফলাফল দেখুন
      </button>
    `;

    resultContainer.appendChild(card);
  }

  // ১ম প্রান্তিক
  if (hasTerm1) {
    createPercentageTermCard(
      "1",
      "১ম প্রান্তিক",
      "📘"
    );
  }

  // ২য় প্রান্তিক
  if (hasTerm2) {
    createPercentageTermCard(
      "2",
      "২য় প্রান্তিক",
      "📗"
    );
  }

  // ৩য় প্রান্তিক / বার্ষিক
  if (hasTerm3) {
    createPercentageTermCard(
      "3",
      "৩য় প্রান্তিক/বার্ষিক",
      "📕"
    );
  }

  // Search Result-এ স্ক্রোল
  resultContainer.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


function openPercentageTermResult(session, term) {

  const resultContainer =
    document.getElementById('percentage-result-search-results');

  if (!resultContainer) return;

  // আগের Result পরিষ্কার
  resultContainer.innerHTML = '';

  // LocalStorage থেকে Result Database নেওয়া
  const schoolDatabase =
    JSON.parse(localStorage.getItem('ls_school_data')) || {};

  // Result System-এ ব্যবহৃত বৈধ Class নাম
  // Result System-এ ব্যবহৃত বৈধ Class নাম
  const validClasses = [
    "play",
    "nursery",
    "one",
    "two",
    "three",
    "four",
    "five"
  ];

  // বাংলা ও English Class নামকে একই নামে রূপান্তর
  const normalizeClassName = function(className) {
    const classMap = {
      "প্লে": "play",
      "play": "play",

      "নার্সারি": "nursery",
      "nursery": "nursery",

      "ওয়ান": "one",
      "ওয়ান": "one",
      "one": "one",

      "টু": "two",
      "two": "two",

      "থ্রি": "three",
      "three": "three",

      "ফোর": "four",
      "four": "four",

      "ফাইভ": "five",
      "five": "five"
    };

    return classMap[
      String(className || "").trim().toLowerCase()
    ] || "";
  };

  // নির্দিষ্ট Session-এর শুধু বৈধ Class Result নেওয়া
  const sessionClasses =
    Object.keys(schoolDatabase).filter(function(key) {

      const classData = schoolDatabase[key];

      return (
        classData &&
        classData.sessionYear &&
        String(classData.sessionYear).trim() === session &&
        validClasses.includes(
          normalizeClassName(classData.className)
        ) &&
        Array.isArray(classData.students)
      );
    });

  // একটি বড় Analysis Card
  const analysisCard =
    document.createElement('div');

  analysisCard.className =
    'percentage-analysis-card';

  // Class Row রাখার Container
  const rowsContainer =
    document.createElement('div');

  rowsContainer.className =
    'percentage-analysis-rows';

  let totalStudents = 0;
  let totalPass = 0;
  let totalFail = 0;

  let classResultFound = false;

  // প্রতিটি Class-এর Result
  sessionClasses.forEach(function(key) {

    const classData =
      schoolDatabase[key];

    const termStudents =
      classData.students.filter(function(student) {

        return (
          student &&
          student.terms &&
          student.terms[term]
        );
      });

    // এই Class-এ এই Term-এর Result না থাকলে বাদ
    if (termStudents.length === 0) {
      return;
    }

    classResultFound = true;

    let classPass = 0;
    let classFail = 0;

    termStudents.forEach(function(student) {

      const termData =
        student.terms[term];

      if (termData.status === "পাশ") {
        classPass++;
      }

      if (termData.status === "ফেল") {
        classFail++;
      }
    });

    const classTotal =
      classPass + classFail;

    const classPassPercentage =
      classTotal > 0
        ? (classPass / classTotal) * 100
        : 0;

    const classFailPercentage =
      classTotal > 0
        ? (classFail / classTotal) * 100
        : 0;

    totalStudents += classTotal;
    totalPass += classPass;
    totalFail += classFail;

    // একটি Class-এর একটি Row
    const classRow =
      document.createElement('div');

    classRow.className =
      'percentage-analysis-row';

    classRow.innerHTML = `
      <div class="percentage-class-name">
        ${String(classData.className || key).trim().toUpperCase()}
      </div>

      <div class="percentage-row-stat">
        <span>মোট শিক্ষার্থী</span>
        <strong>${classTotal}</strong>
      </div>

      <div class="percentage-row-stat">
        <span>পাশ</span>
        <strong>${classPass}</strong>
      </div>

      <div class="percentage-row-stat">
        <span>ফেল</span>
        <strong>${classFail}</strong>
      </div>

      <div class="percentage-row-stat">
        <span>পাশের হার</span>
        <strong>${classPassPercentage.toFixed(2)}%</strong>
      </div>

      <div class="percentage-row-stat">
        <span>ফেলের হার</span>
        <strong>${classFailPercentage.toFixed(2)}%</strong>
      </div>
    `;

    rowsContainer.appendChild(classRow);
  });

  // কোনো Class-এর এই Term-এর Result না থাকলে
  if (!classResultFound || totalStudents === 0) {

    resultContainer.innerHTML = `
      <div style="
        text-align:center;
        padding:20px;
        color:#d32f2f;
        background:#fff;
        border-radius:10px;
        border:1px solid #f0caca;
        margin-top:20px;
      ">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p style="margin:8px 0 0;">
          এই প্রান্তিকের কোনো ফলাফল পাওয়া যায়নি।
        </p>
      </div>
    `;

    resultContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    return;
  }

  // Term নাম
  const termName =
    term === "1"
      ? "১ম প্রান্তিক"
      : term === "2"
        ? "২য় প্রান্তিক"
        : "৩য় প্রান্তিক/বার্ষিক";

  // পুরো Class Analysis Card-এর Header
  analysisCard.innerHTML = `
    <div class="percentage-analysis-header">
      <h3>${termName} — ক্লাসভিত্তিক ফলাফল</h3>
      <p>সেশন: ${session}</p>
    </div>
  `;

  // Header-এর পরে Class Rows যোগ
  analysisCard.appendChild(rowsContainer);

  // Overall হিসাব
  const totalPassPercentage =
    (totalPass / totalStudents) * 100;

  const totalFailPercentage =
    (totalFail / totalStudents) * 100;

  // Overall অংশ
  const overallSection =
    document.createElement('div');

  overallSection.className =
    'percentage-analysis-overall';

  overallSection.innerHTML = `
    <div class="percentage-analysis-overall-title">
      <h3>সামগ্রিক ফলাফল</h3>
    </div>

    <div class="percentage-analysis-overall-stats">

      <div class="percentage-row-stat">
        <span>মোট শিক্ষার্থী</span>
        <strong>${totalStudents}</strong>
      </div>

      <div class="percentage-row-stat">
        <span>মোট পাশ</span>
        <strong>${totalPass}</strong>
      </div>

      <div class="percentage-row-stat">
        <span>মোট ফেল</span>
        <strong>${totalFail}</strong>
      </div>

      <div class="percentage-row-stat">
        <span>মোট পাশের হার</span>
        <strong>${totalPassPercentage.toFixed(2)}%</strong>
      </div>

      <div class="percentage-row-stat">
        <span>মোট ফেলের হার</span>
        <strong>${totalFailPercentage.toFixed(2)}%</strong>
      </div>

    </div>
  `;

  analysisCard.appendChild(overallSection);

  // মূল Result Container-এ পুরো Analysis Card যোগ
  resultContainer.appendChild(analysisCard);

  // ৩টি Term থাকলে নিচে Session Summary Card
  createPercentageSessionSummary(session);

  // Analysis Result-এ স্ক্রোল
  resultContainer.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}


function createPercentageSessionSummary(session) {

  const schoolDatabase =
    JSON.parse(localStorage.getItem('ls_school_data')) || {};

  const sessionClasses =
    Object.keys(schoolDatabase).filter(function(key) {

      const classData = schoolDatabase[key];

      return (
        classData &&
        classData.sessionYear &&
        String(classData.sessionYear).trim() === session &&
        Array.isArray(classData.students)
      );
    });

  if (sessionClasses.length === 0) {
    return;
  }

  const termPercentages = {};

  ["1", "2", "3"].forEach(function(term) {

    let totalStudents = 0;
    let totalPass = 0;

    sessionClasses.forEach(function(key) {

      const classData = schoolDatabase[key];

      classData.students.forEach(function(student) {

        if (
          student &&
          student.terms &&
          student.terms[term]
        ) {

          const termData =
            student.terms[term];

          totalStudents++;

          if (termData.status === "পাশ") {
            totalPass++;
          }
        }
      });
    });

    if (totalStudents > 0) {

      termPercentages[term] =
        (totalPass / totalStudents) * 100;
    }
  });

  // তিনটি Term-এর Result না থাকলে Summary Card দেখাবে না
  if (
    termPercentages["1"] === undefined ||
    termPercentages["2"] === undefined ||
    termPercentages["3"] === undefined
  ) {
    return;
  }

  // তিন Term-এর Pass Percentage-এর গড়
  const finalPercentage =
    (
      termPercentages["1"] +
      termPercentages["2"] +
      termPercentages["3"]
    ) / 3;

  const resultContainer =
    document.getElementById('percentage-result-search-results');

  if (!resultContainer) return;

  const summaryCard =
    document.createElement('div');

  summaryCard.className =
    'percentage-session-summary-card';

  summaryCard.innerHTML = `
    <div class="percentage-session-summary-content">

      <div class="percentage-session-summary-icon">
        📊
      </div>

      <div class="percentage-session-summary-text">
        <h3>${session} সেশনের মোট ফলাফল</h3>

        <p>
          ১ম প্রান্তিক: ${termPercentages["1"].toFixed(2)}%
          &nbsp; | &nbsp;
          ২য় প্রান্তিক: ${termPercentages["2"].toFixed(2)}%
          &nbsp; | &nbsp;
          ৩য় প্রান্তিক/বার্ষিক: ${termPercentages["3"].toFixed(2)}%
        </p>

        <strong>
          মোট পাশের হার: ${finalPercentage.toFixed(2)}%
        </strong>
      </div>

    </div>
  `;

  resultContainer.appendChild(summaryCard);
}

// =========================================================
// Search Result Card থেকে নির্দিষ্ট প্রান্তিকের Result দেখা
// =========================================================

function openSelectedTermResult(classKey, term) {

  sessionStorage.setItem(
    'ls_result_search_context',
    JSON.stringify({
      classKey: classKey,
      term: term
    })
  );

  window.location.href = 'result.html';
}


// লগ আউট হ্যান্ডলার
function handleLogout() {
  if (confirm('আপনি কি নিশ্চিত যে আপনি লগ আউট করতে চান?')) {

    localStorage.removeItem('LS_LOGGED_IN_USER');

    alert('সফলভাবে লগ আউট হয়েছে.');

    window.location.href = "index.html";
  }
}