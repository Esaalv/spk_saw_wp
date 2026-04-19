// --- FUNGSI ANIMASI LOADING & LOGIKA UTAMA METODE WP ---

function processWP() {
    const btn = document.getElementById('btnHitung-wp');
    if (btn.disabled) return;
    btn.disabled = true;

    const loadingUI   = document.getElementById('loadingBarContainer-wp');
    const progressBar = document.getElementById('progressBar-wp');

    document.getElementById('resultContainer-wp').innerHTML = '';
    loadingUI.style.display = 'block';

    progressBar.style.transition = 'none';
    progressBar.style.width      = '0%';

    setTimeout(() => {
        progressBar.style.transition = 'width 1s linear';
        progressBar.style.width      = '100%';
    }, 10);

    setTimeout(() => {
        loadingUI.style.display = 'none';
        hitungWP();
        btn.disabled = false;
    }, 1000);
}

// --- ALGORITMA PERHITUNGAN WP ---

function hitungWP() {
    const table = document.getElementById('spkTable-wp');
    const rows  = table.rows;

    let kriteria = [], bobot = [], tipe = [], alternatif = [], nilai = [];

    // Ekstraksi Data HTML ke Variabel
    for (let i = 1; i < rows[0].cells.length - 1; i++) {
        const span = rows[0].cells[i].querySelector('span[contenteditable="true"]');
        kriteria.push(span ? span.innerText.trim() : '');
    }

    for (let i = 1; i < rows[1].cells.length - 1; i++) {
        const bVal = unformatNumber(rows[1].cells[i].innerText.trim());
        bobot.push(isNaN(bVal) ? 0 : bVal);

        const selectEl = rows[2].cells[i].querySelector('select');
        tipe.push(selectEl ? selectEl.value : 'benefit');
    }

    for (let r = 3; r < rows.length; r++) {
        alternatif.push(rows[r].cells[0].innerText.trim());
        const rowData = [];
        for (let c = 1; c < rows[r].cells.length - 1; c++) {
            const nVal = unformatNumber(rows[r].cells[c].innerText.trim());
            rowData.push(isNaN(nVal) ? 0 : nVal);
        }
        nilai.push(rowData);
    }

    let resultHTML = '<h2 class="result-heading">Hasil Perhitungan WP</h2>';

    // LANGKAH 1 & 2: Info data
    resultHTML += `
    <div class="step-card wp-card">
        <h3>Langkah 1 &amp; 2: Data Alternatif, Kriteria, Bobot, Tipe (Cost/Benefit)</h3>
        <p>Data berhasil diekstrak dari tabel di atas.</p>
    </div>`;

    // LANGKAH 3: Normalisasi Bobot (W)
    const totalBobot = bobot.reduce((a, b) => a + b, 0);
    const bobotNorm  = bobot.map(b => totalBobot === 0 ? 0 : b / totalBobot);

    resultHTML += `
    <div class="step-card wp-card">
        <h3>Langkah 3: Normalisasi Bobot (W)</h3>
        <p>Total Bobot Awal = <strong>${formatNumber(totalBobot)}</strong></p>
        <table>
            <tr>
                <th>Kriteria</th>
                <th>Bobot Awal</th>
                <th>Perhitungan</th>
                <th>Bobot Ternormalisasi (W)</th>
                <th>Tipe Pangkat</th>
            </tr>`;

    for (let c = 0; c < kriteria.length; c++) {
        const tipePangkat      = tipe[c] === 'benefit' ? 'Positif (+)' : 'Negatif (-)';
        const teksPerhitungan  = `${formatNumber(bobot[c])} / ${formatNumber(totalBobot)}`;
        resultHTML += `
            <tr>
                <td>${kriteria[c]}</td>
                <td>${formatNumber(bobot[c])}</td>
                <td style="font-size:13px;">${teksPerhitungan}</td>
                <td><strong style="color:#3498db;">${formatNumber(bobotNorm[c])}</strong></td>
                <td>${tipePangkat}</td>
            </tr>`;
    }
    resultHTML += `</table></div>`;

    // LANGKAH 4: Vektor S (Perkalian Pangkat)
    const vektorS = [];
    let   totalS  = 0;

    resultHTML += `
    <div class="step-card wp-card">
        <h3>Langkah 4: Menghitung Nilai Vektor S</h3>
        <table>
            <tr>
                <th>Alternatif</th>
                <th>Perhitungan (Nilai ^ Pangkat)</th>
                <th>Nilai S</th>
            </tr>`;

    for (let r = 0; r < alternatif.length; r++) {
        let nilaiS        = 1;
        const teksKalkulasi = [];

        for (let c = 0; c < kriteria.length; c++) {
            const w   = tipe[c] === 'benefit' ? bobotNorm[c] : -bobotNorm[c];
            const val = Math.pow(nilai[r][c], w);
            nilaiS   *= val;

            const wStr = parseFloat(w.toFixed(3));
            teksKalkulasi.push(`(${formatNumber(nilai[r][c])}<sup>${wStr}</sup>)`);
        }

        vektorS.push(nilaiS);
        totalS += nilaiS;

        resultHTML += `
            <tr>
                <td>${alternatif[r]}</td>
                <td style="font-size:13px; line-height:2;">${teksKalkulasi.join(' &times; ')}</td>
                <td><strong>${formatNumber(nilaiS)}</strong></td>
            </tr>`;
    }

    resultHTML += `</table>
        <p style="margin-top:15px; font-size:16px;">
            Total Seluruh Nilai S (&#x3A3;S) = <strong style="color:#e74c3c;">${formatNumber(totalS)}</strong>
        </p>
    </div>`;

    // LANGKAH 5: Nilai Preferensi (Vektor V)
    const skorAkhir = [];

    resultHTML += `
    <div class="step-card wp-card">
        <h3>Langkah 5: Menghitung Nilai Vektor V</h3>
        <table>
            <tr>
                <th>Alternatif</th>
                <th>Perhitungan (S / &#x3A3;S)</th>
                <th>Nilai Preferensi (V)</th>
            </tr>`;

    for (let r = 0; r < alternatif.length; r++) {
        const v = totalS === 0 ? 0 : vektorS[r] / totalS;
        skorAkhir.push({ nama: alternatif[r], s: vektorS[r], skor: v });

        resultHTML += `
            <tr>
                <td><strong>${alternatif[r]}</strong></td>
                <td style="font-size:13px;">${formatNumber(vektorS[r])} / ${formatNumber(totalS)}</td>
                <td><strong>${formatNumber(v)}</strong></td>
            </tr>`;
    }
    resultHTML += `</table></div>`;

    // LANGKAH 6: Perangkingan
    skorAkhir.sort((a, b) => b.skor - a.skor);

    resultHTML += `
    <div class="step-card wp-card">
        <h3>Langkah 6: Perangkingan</h3>
        <table>
            <tr>
                <th>Peringkat</th>
                <th>Alternatif</th>
                <th>Nilai Akhir (V)</th>
            </tr>`;

    skorAkhir.forEach((item, index) => {
        resultHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.nama}</td>
                <td><strong style="color:#27ae60; font-size:18px;">${formatNumber(item.skor)}</strong></td>
            </tr>`;
    });
    resultHTML += `</table></div>`;

    // Tampilkan hasil & animasi
    const container = document.getElementById('resultContainer-wp');
    container.innerHTML = resultHTML;

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(
            container.querySelectorAll('.step-card'),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' }
        );
    } else {
        container.querySelectorAll('.step-card').forEach(el => (el.style.opacity = '1'));
    }
}
