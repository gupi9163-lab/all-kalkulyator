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

    if (!serbestInput || isNaN(hours) || isNaN(absences)) {
        alert('Zəhmət olmasa bütün məlumatları daxil edin!');
        return;
    }

    // ===== Seminar ortalaması =====
    let seminarSum = 0;
    for (let i = 1; i <= seminarCount; i++) {
        const value = parseFloat(document.getElementById(`seminar${i}`).value);
        if (isNaN(value) || value < 0 || value > 10) {
            alert('Seminar qiymətləri 0-10 aralığında olmalıdır!');
            return;
        }
        seminarSum += value;
    }
    const seminarAvg = seminarSum / seminarCount;

    // ===== Kollekvium ortalaması =====
    let kollokSum = 0;
    for (let i = 1; i <= kollokCount; i++) {
        const value = parseFloat(document.getElementById(`kollok${i}`).value);
        if (isNaN(value) || value < 0 || value > 10) {
            alert('Kollekvium qiymətləri 0-10 aralığında olmalıdır!');
            return;
        }
        kollokSum += value;
    }
    const kollokAvg = kollokSum / kollokCount;

    // ===== Seminar + Kollok (maks 30 bal) =====
    const semesterScore = (seminarAvg * 0.4 + kollokAvg * 0.6) * 3;

    // ===== Sərbəst iş (maks 10 bal) =====
    const serbest = parseFloat(serbestInput);
    if (isNaN(serbest) || serbest < 0 || serbest > 10) {
        alert('Sərbəst iş qiyməti 0-10 aralığında olmalıdır!');
        return;
    }

    // ===== Davamiyyət (maks 10 bal) =====
    const attendance = calculateAttendance(hours, absences);

    if (attendance === 'KƏSR') {
        document.getElementById('semesterResult').innerHTML = `
            <div style="text-align:center;">
                <h2>❌ KƏSR</h2>
                <p>Davamiyyət limitini keçdiniz.</p>
            </div>
        `;
        return;
    }

    // ===== Final hesab =====
    const finalScore = semesterScore + attendance + serbest;

    // ===== Status =====
    let status = '';
    if (finalScore >= 50) {
        status = '🎉 MÜVƏFFƏQİYYƏTLƏ KEÇDİNİZ!';
    } else if (finalScore >= 40) {
        status = '⚠️ ORTA NƏTİCƏ';
    } else {
        status = '⚠️ AŞAĞI NƏTİCƏ';
    }

    document.getElementById('semesterResult').innerHTML = `
        <div style="text-align:center;">
            <h2>${status}</h2>
            <h1>${finalScore.toFixed(1)} / 50</h1>
            <p>Seminar + Kollekvium: ${semesterScore.toFixed(1)} / 30</p>
            <p>Davamiyyət: ${attendance} / 10</p>
            <p>Sərbəst iş: ${serbest} / 10</p>
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
