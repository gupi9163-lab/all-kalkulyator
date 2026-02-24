// PWA Install
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'flex';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(err => console.log('SW registration failed:', err));
}

// Navigation
function goToHome() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('homePage').classList.add('active');
    window.scrollTo(0, 0);
}

document.querySelectorAll('.calculator-card').forEach(card => {
    card.addEventListener('click', function() {
        const calculator = this.dataset.calculator;
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(calculator + 'Page').classList.add('active');
        window.scrollTo(0, 0);
    });
});

// Semestr Bal Hesablama
function generateFields(type) {
    const countId = type + 'Count';
    const fieldsId = type + 'Fields';
    const count = parseInt(document.getElementById(countId).value);
    
    if (!count || count < 1 || count > 20) {
        alert('Zəhmət olmasa 1-20 arası say daxil edin');
        return;
    }
    
    const container = document.getElementById(fieldsId);
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item';
        fieldItem.innerHTML = `
            <label>${type === 'seminar' ? 'Seminar' : 'Kollekvium'} ${i}:</label>
            <input type="number" id="${type}${i}" min="0" max="10" step="0.01" placeholder="0-10">
        `;
        container.appendChild(fieldItem);
    }
}

function calculateAttendance(hours, absences) {
    const rules = {
        30: { 10: [1, 2], 9: [3], 8: [4] },
        45: { 10: [1], 9: [2, 3], 8: [4, 5] },
        60: { 10: [1], 9: [2, 3, 4], 8: [5, 6, 7] },
        75: { 10: [1], 9: [2, 3, 4, 5], 8: [6, 7, 8, 9] },
        90: { 10: [1, 2], 9: [3, 4, 5, 6], 8: [7, 8, 9, 10, 11] },
        105: { 10: [1, 2], 9: [3, 4, 5, 6, 7], 8: [8, 9, 10, 11, 12, 13] }
    };
    
    const rule = rules[hours];
    if (!rule) return null;
    
    for (const [score, absenceList] of Object.entries(rule)) {
        if (absenceList.includes(absences)) {
            return parseFloat(score);
        }
    }
    
    return 'KƏSR';
}

function calculateSemester() {
    const seminarCount = parseInt(document.getElementById('seminarCount').value) || 0;
    const colloquiumCount = parseInt(document.getElementById('colloquiumCount').value) || 0;
    const selfWorkGrade = parseFloat(document.getElementById('selfWorkGrade').value);
    const courseHours = parseInt(document.getElementById('courseHours').value);
    const absences = parseInt(document.getElementById('absences').value);
    
    const resultDiv = document.getElementById('semesterResult');
    
    // Validasiya
    if (seminarCount === 0 && colloquiumCount === 0) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Ən azı seminar və ya kollekvium sayı daxil edin!';
        return;
    }
    
    if (isNaN(selfWorkGrade) || selfWorkGrade < 0 || selfWorkGrade > 10) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Sərbəst iş qiyməti 0-10 aralığında olmalıdır!';
        return;
    }
    
    if (!courseHours) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Fənn saatını seçin!';
        return;
    }
    
    if (isNaN(absences) || absences < 0) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Qayıb sayını düzgün daxil edin!';
        return;
    }
    
    // Seminar ballarını topla
    let seminarTotal = 0;
    let seminarValid = 0;
    for (let i = 1; i <= seminarCount; i++) {
        const val = parseFloat(document.getElementById('seminar' + i).value);
        if (!isNaN(val) && val >= 0 && val <= 10) {
            seminarTotal += val;
            seminarValid++;
        }
    }
    
    if (seminarCount > 0 && seminarValid !== seminarCount) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Bütün seminar qiymətlərini 0-10 aralığında daxil edin!';
        return;
    }
    
    // Kollekvium ballarını topla
    let colloquiumTotal = 0;
    let colloquiumValid = 0;
    for (let i = 1; i <= colloquiumCount; i++) {
        const val = parseFloat(document.getElementById('colloquium' + i).value);
        if (!isNaN(val) && val >= 0 && val <= 10) {
            colloquiumTotal += val;
            colloquiumValid++;
        }
    }
    
    if (colloquiumCount > 0 && colloquiumValid !== colloquiumCount) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Bütün kollekvium qiymətlərini 0-10 aralığında daxil edin!';
        return;
    }
    
    // Orta hesabla
    const seminarAvg = seminarCount > 0 ? seminarTotal / seminarCount : 0;
    const colloquiumAvg = colloquiumCount > 0 ? colloquiumTotal / colloquiumCount : 0;
    
    // Davamiyyət balı
    const attendanceScore = calculateAttendance(courseHours, absences);
    
    if (attendanceScore === 'KƏSR') {
        resultDiv.className = 'result warning';
        resultDiv.innerHTML = `
            <strong>⚠️ KƏSR!</strong><br><br>
            <strong>Qayıb sayı çox olduğu üçün fəndən KƏSR aldınız!</strong><br><br>
            📊 Seminar ortalaması: ${seminarAvg.toFixed(2)}<br>
            📊 Kollekvium ortalaması: ${colloquiumAvg.toFixed(2)}<br>
            📝 Sərbəst iş: ${selfWorkGrade.toFixed(2)}<br>
            ❌ Davamiyyət: KƏSR<br>
            📚 Fənn saatı: ${courseHours}<br>
            🚫 Qayıb sayı: ${absences}
        `;
        return;
    }
    
    // Final hesablama: (semestr orta*0.4 + kollekvium orta*0.6)*3 + davamiyyət + sərbəst iş
    const semesterScore = ((seminarAvg * 0.4 + colloquiumAvg * 0.6) * 3) + attendanceScore + selfWorkGrade;
    const finalScore = Math.min(semesterScore, 50); // Maksimum 50
    
    resultDiv.className = 'result';
    resultDiv.innerHTML = `
        <strong>✅ Nəticə:</strong><br><br>
        📊 Seminar ortalaması: <strong>${seminarAvg.toFixed(2)}</strong><br>
        📊 Kollekvium ortalaması: <strong>${colloquiumAvg.toFixed(2)}</strong><br>
        📝 Sərbəst iş balı: <strong>${selfWorkGrade.toFixed(2)}</strong><br>
        ✅ Davamiyyət balı: <strong>${attendanceScore.toFixed(2)}</strong><br>
        📚 Fənn saatı: <strong>${courseHours}</strong><br>
        🚫 Qayıb sayı: <strong>${absences}</strong><br><br>
        <strong style="font-size: 1.4rem;">🎯 Semestr Balınız: ${finalScore.toFixed(2)} / 50</strong>
    `;
}

// 25% Ödəniş Hesablama
function calculateTuition() {
    const annualTuition = parseFloat(document.getElementById('annualTuition').value);
    const credits = parseFloat(document.getElementById('credits').value);
    const resultDiv = document.getElementById('tuitionResult');
    
    if (isNaN(annualTuition) || annualTuition <= 0) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> İllik ödənişi düzgün daxil edin!';
        return;
    }
    
    if (isNaN(credits) || credits <= 0 || credits > 10) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Kredit sayı 1-10 aralığında olmalıdır!';
        return;
    }
    
    // Düstur: [((illik ödəniş/60)*kredit sayı)/4] + 1
    const amount = (((annualTuition / 60) * credits) / 4) + 1;
    
    resultDiv.className = 'result';
    resultDiv.innerHTML = `
        <strong>✅ Nəticə:</strong><br><br>
        💰 İllik ödəniş: <strong>${annualTuition.toFixed(2)} AZN</strong><br>
        📚 Kredit sayı: <strong>${credits}</strong><br><br>
        <strong style="font-size: 1.4rem;">💳 25% İmtahan ödənişi: ${amount.toFixed(2)} AZN</strong>
    `;
}

// Yaş Hesablayıcı
function calculateAge() {
    const birthdateInput = document.getElementById('birthdate').value;
    const resultDiv = document.getElementById('ageResult');
    
    // Format validasiyası
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = birthdateInput.match(dateRegex);
    
    if (!match) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Tarix formatı düzgün deyil! Format: GG.AA.IIII (məs: 15.03.2000)';
        return;
    }
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    // Tarix validasiyası
    if (month < 1 || month > 12) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Ay 1-12 aralığında olmalıdır!';
        return;
    }
    
    if (day < 1 || day > 31) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Gün 1-31 aralığında olmalıdır!';
        return;
    }
    
    const birthDate = new Date(year, month - 1, day);
    
    // Tarix mövcudluğunu yoxla
    if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Belə bir tarix mövcud deyil!';
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birthDate.setHours(0, 0, 0, 0);
    
    if (birthDate >= today) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = '<strong>⚠️ Xəta:</strong> Doğum tarixi bu gündən əvvəl olmalıdır!';
        return;
    }
    
    // Yaş hesablama
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Yaşadığı gün sayı
    const daysDiff = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
    
    // Növbəti ad gününə qalan gün
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday <= today) {
        nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
    }
    const daysToNext = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    
    // Ay adları
    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 
                        'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
    
    resultDiv.className = 'result';
    resultDiv.innerHTML = `
        <strong>✅ Nəticə:</strong><br><br>
        🎂 Doğum tarixi: <strong>${day} ${monthNames[month - 1]} ${year}</strong><br>
        📅 Bu gün: <strong>${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}</strong><br><br>
        <strong style="font-size: 1.4rem;">🎯 Yaşınız: ${age} il</strong><br>
        ⏳ Yaşadığınız gün: <strong>${daysDiff} gün</strong><br>
        🎉 Növbəti ad gününüzə: <strong>${daysToNext} gün qalıb</strong>
    `;
}

// Input formatting
document.getElementById('birthdate')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    
    if (value.length >= 2) {
        value = value.slice(0, 2) + '.' + value.slice(2);
    }
    if (value.length >= 5) {
        value = value.slice(0, 5) + '.' + value.slice(5);
    }
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    e.target.value = value;
});