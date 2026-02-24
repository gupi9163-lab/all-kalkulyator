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
function generateSeminarInputs() {
    const count = parseInt(document.getElementById('seminarCount').value);
    const container = document.getElementById('seminarInputs');
    
    if (!count || count < 1 || count > 11) {
        alert('Seminar sayı 1-11 arasında olmalıdır!');
        return;
    }
    
    let html = '<div class="dynamic-inputs">';
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="dynamic-input">
                <label>Seminar ${i}</label>
                <input type="number" id="seminar${i}" min="0" max="10" step="0.1" placeholder="0-10">
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

function generateKollokInputs() {
    const count = parseInt(document.getElementById('kollokCount').value);
    const container = document.getElementById('kollokInputs');
    
    if (!count || count < 1 || count > 4) {
        alert('Kollekvium sayı 1-4 arasında olmalıdır!');
        return;
    }
    
    let html = '<div class="dynamic-inputs">';
    for (let i = 1; i <= count; i++) {
        html += `
            <div class="dynamic-input">
                <label>Kollekvium ${i}</label>
                <input type="number" id="kollok${i}" min="0" max="10" step="0.1" placeholder="0-10">
            </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
}

function calculateAttendance(hours, absences) {
    const rules = {
        30: { 10: [0], 9: [1, 2], 8: [3], kesr: 4 },
        45: { 10: [1], 9: [2, 3], 8: [4, 5], kesr: 6 },
        60: { 10: [1], 9: [2, 3, 4], 8: [5, 6, 7], kesr: 8 },
        75: { 10: [1], 9: [2, 3, 4, 5], 8: [6, 7, 8, 9], kesr: 10 },
        90: { 10: [1, 2], 9: [3, 4, 5, 6], 8: [7, 8, 9, 10, 11], kesr: 12 },
        105: { 10: [1, 2], 9: [3, 4, 5, 6, 7], 8: [8, 9, 10, 11, 12, 13], kesr: 14 }
    };
    
    const rule = rules[hours];
    if (!rule) return 0;
    
    if (absences >= rule.kesr) return 'KƏSR';
    if (rule[10].includes(absences)) return 10;
    if (rule[9].includes(absences)) return 9;
    if (rule[8].includes(absences)) return 8;
    return 0;
}

function calculateSemester() {
    const seminarCount = parseInt(document.getElementById('seminarCount').value);
    const kollokCount = parseInt(document.getElementById('kollokCount').value);
    const serbestInput = document.getElementById('serbest').value;
    const hours = parseInt(document.getElementById('hourSelect').value);
    const absences = parseInt(document.getElementById('absences').value);
    
    if (!seminarCount || !kollokCount) {
        alert('Zəhmət olmasa seminar və kollekvium saylarını yaradın!');
        return;
    }
    
    if (!serbestInput || !hours || absences === '' || isNaN(absences)) {
        alert('Zəhmət olmasa bütün məlumatları daxil edin!');
        return;
    }
    
    // Calculate seminar average
    let seminarSum = 0;
    let seminarValid = true;
    for (let i = 1; i <= seminarCount; i++) {
        const value = parseFloat(document.getElementById(`seminar${i}`).value);
        if (isNaN(value) || value < 0 || value > 10) {
            seminarValid = false;
            break;
        }
        seminarSum += value;
    }
    
    if (!seminarValid) {
        alert('Seminar qiymətləri 0-10 aralığında olmalıdır!');
        return;
    }
    
    const seminarAvg = seminarSum / seminarCount;
    
    // Calculate kollok average
    let kollokSum = 0;
    let kollokValid = true;
    for (let i = 1; i <= kollokCount; i++) {
        const value = parseFloat(document.getElementById(`kollok${i}`).value);
        if (isNaN(value) || value < 0 || value > 10) {
            kollokValid = false;
            break;
        }
        kollokSum += value;
    }
    
    if (!kollokValid) {
        alert('Kollekvium qiymətləri 0-10 aralığında olmalıdır!');
        return;
    }
    
    const kollokAvg = kollokSum / kollokCount;
    
    // Validate serbest (0-10)
    const serbest = parseFloat(serbestInput);
    if (isNaN(serbest) || serbest < 0 || serbest > 10) {
        alert('Sərbəst iş qiyməti 0-10 aralığında olmalıdır!');
        return;
    }
    
    // Calculate attendance - DÜZƏLDILDI
    const attendanceResult = calculateAttendance(hours, absences);
    
    if (attendanceResult === 'KƏSR') {
        document.getElementById('semesterResult').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <div class="final-score">KƏSR</div>
                <p style="font-size: 18px;">Davamiyyət səbəbindən kəsr aldınız!</p>
                <p style="margin-top: 15px; font-size: 14px; opacity: 0.9;">
                    <strong>${hours} saat üçün ${absences} qayıb</strong> - maksimum limit keçildi.
                </p>
            </div>
        `;
        return;
    }
    
    // DÜSTUR: (Seminar orta × 0.4 + Kollokvium orta × 0.6) × 3 + Davamiyyət + Sərbəst iş
    // Seminar + Kollekvium birlikdə maksimum 30 bal
    const seminarKollokScore = (seminarAvg * 0.4 + kollokAvg * 0.6) * 3;
    
    // Davamiyyət balı (0, 8, 9 və ya 10)
    const attendanceScore = attendanceResult;
    
    // Sərbəst iş (0-10)
    const serbestScore = serbest;
    
    // Yekun bal
    const finalScore = seminarKollokScore + attendanceScore + serbestScore;
    
    // Determine status
    let status = '';
    let emoji = '';
    if (finalScore >= 50) {
        status = '🎉 MÜVƏFFƏQİYYƏTLƏ KEÇDİNİZ!';
        emoji = '✅';
    } else if (finalScore >= 40) {
        status = '⚠️ ORTA NƏTİCƏ';
        emoji = '📊';
    } else if (finalScore > 0) {
        status = '⚠️ AŞAĞI NƏTİCƏ';
        emoji = '📉';
    } else {
        status = '⚠️ 0 BAL';
        emoji = '⚠️';
    }
    
    document.getElementById('semesterResult').innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">${emoji}</div>
            <div class="final-score">${finalScore.toFixed(2)} bal</div>
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 25px;">${status}</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin-top: 20px;">
            <strong>📊 DETALLI NƏTİCƏLƏR:</strong><br><br>
            🎯 Seminar ortalaması: <strong>${seminarAvg.toFixed(2)}</strong><br>
            📝 Kollekvium ortalaması: <strong>${kollokAvg.toFixed(2)}</strong><br>
            🔢 Seminar + Kollekvium balı (maks 30): <strong>${seminarKollokScore.toFixed(2)}</strong><br>
            ✅ Davamiyyət balı (${hours} saat, ${absences} qayıb): <strong>${attendanceScore}</strong><br>
            📚 Sərbəst iş balı (maks 10): <strong>${serbestScore.toFixed(2)}</strong><br><br>
            <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 15px;">
                <strong>📌 YEKUN BAL: ${finalScore.toFixed(2)} / 50</strong>
            </div>
        </div>
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
