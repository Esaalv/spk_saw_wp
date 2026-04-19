// ─── SAW: Animasi Loading & Logika Utama 

function processSAW() {
    const btn = document.getElementById('btnHitung-saw');
    if (btn.disabled) return;
    btn.disabled = true;

    const loadingUI  = document.getElementById('loadingBarContainer-saw');
    const progressBar = document.getElementById('progressBar-saw');

    document.getElementById('resultContainer-saw').innerHTML = '';
    loadingUI.style.display = 'block';

    progressBar.style.transition = 'none';
    progressBar.style.width      = '0%';

    setTimeout(() => {
        progressBar.style.transition = 'width 1s linear';
        progressBar.style.width      = '100%';
    }, 10);

    setTimeout(() => {
        loadingUI.style.display = 'none';
        hitungSAW();
        btn.disabled = false;
    }, 1000);
}

// ─── SAW: Algoritma Perhitungan 

function hitungSAW() {
    const table = document.getElementById('spkTable-saw');
    const rows  = table.rows;

    let kriteria = [], bobot = [], tipe = [], alternatif = [], nilai = [];

    // ── Ekstraksi kriteria ──
    for (let i = 1; i < rows[0].cells.length - 1; i++) {
        const span = rows[0].cells[i].querySelector('span[contenteditable]');
        kriteria.push(span ? span.innerText.trim() : "");
    }

    // ── Ekstraksi bobot & tipe ──
    for (let i = 1; i < rows[1].cells.length - 1; i++) {
        const bVal = unformatNumber(rows[1].cells[i].innerText.trim());
        bobot.push(isNaN(bVal) ? 0 : bVal);

        const selectEl = rows[2].cells[i].querySelector('select');
        tipe.push(selectEl ? selectEl.value : 'benefit');
    }

    // ── Ekstraksi alternatif & nilai ──
    for (let r = 3; r < rows.length; r++) {
        alternatif.push(rows[r].cells[0].innerText.trim());
        const rowData = [];
        for (let c = 1; c < rows[r].cells.length - 1; c++) {
            const nVal = unformatNumber(rows[r].cells[c].innerText.trim());
            rowData.push(isNaN(nVal) ? 0 : nVal);
        }
        nilai.push(rowData);
    }

    let resultHTML = '<h2 class="result-heading">Hasil Perhitungan SAW</h2>';

    // ── Langkah 1 & 2 ──
    resultHTML += `
    <div class="step-card saw-card">
        <h3>Langkah 1 &amp; 2: Data Alternatif, Kriteria, Bobot, Cost/Benefit</h3>
        <p>Data berhasil diekstrak dari tabel di atas.</p>
    </div>`;

    // ── Langkah 3: Max/Min ──
    const maxMinVals = [];
    for (let c = 0; c < kriteria.length; c++) {
        const colVals = nilai.map(row => row[c]);
        maxMinVals.push(tipe[c] === 'benefit' ? Math.max(...colVals) : Math.min(...colVals));
    }

    resultHTML += `
    <div class="step-card saw-card">
        <h3>Langkah 3: Nilai Max/Min Berdasarkan Tipe</h3>
        <table>
            <tr><th>Kriteria</th><th>Benefit / Cost</th><th>Nilai (Max/Min)</th></tr>`;
    for (let c = 0; c < kriteria.length; c++) {
        const jns = tipe[c] === 'benefit' ? 'Max' : 'Min';
        resultHTML += `
            <tr>
                <td>${kriteria[c]}</td>
                <td>${tipe[c]}</td>
                <td><strong>${jns} = ${formatNumber(maxMinVals[c])}</strong></td>
            </tr>`;
    }
    resultHTML += '</table></div>';

    // ── Langkah 4: Matriks Normalisasi ──
    const normalisasi = [];
    resultHTML += `
    <div class="step-card saw-card">
        <h3>Langkah 4: Matriks Normalisasi</h3>
        <table>
            <tr><th>Alternatif</th>`;
    kriteria.forEach(k => resultHTML += `<th>${k}</th>`);
    resultHTML += '</tr>';

    for (let r = 0; r < alternatif.length; r++) {
        const normRow = [];
        resultHTML += `<tr><td>${alternatif[r]}</td>`;
        for (let c = 0; c < kriteria.length; c++) {
            const maxMin    = maxMinVals[c];
            const actualVal = nilai[r][c];
            let nVal = 0;

            if (tipe[c] === 'benefit') {
                nVal = maxMin === 0 ? 0 : actualVal / maxMin;
            } else {
                nVal = actualVal === 0 ? 0 : maxMin / actualVal;
            }

            nVal = parseFloat(nVal.toFixed(3));
            normRow.push(nVal);
            resultHTML += `<td>${nVal}</td>`;
        }
        normalisasi.push(normRow);
        resultHTML += '</tr>';
    }
    resultHTML += '</table></div>';

    // ── Langkah 5: Perkalian Bobot ──
    const skorAkhir = [];
    resultHTML += `
    <div class="step-card saw-card">
        <h3>Langkah 5: Perkalian Bobot dan Normalisasi (Nilai V)</h3>
        <table>
            <tr>
                <th>Alternatif</th>
                <th>Perhitungan (Normalisasi × Bobot)</th>
                <th>Total Skor</th>
            </tr>`;

    for (let r = 0; r < alternatif.length; r++) {
        let total = 0;
        const pStr = [];
        for (let c = 0; c < kriteria.length; c++) {
            const val = normalisasi[r][c] * bobot[c];
            total    += val;
            pStr.push(`(${normalisasi[r][c]} × ${bobot[c]})`);
        }
        total = parseFloat(total.toFixed(3));
        skorAkhir.push({ nama: alternatif[r], skor: total });

        resultHTML += `
            <tr>
                <td>${alternatif[r]}</td>
                <td style="font-size:12px;">${pStr.join(' + ')}</td>
                <td><strong>${total}</strong></td>
            </tr>`;
    }
    resultHTML += '</table></div>';

    // ── Langkah 6: Perangkingan ──
    skorAkhir.sort((a, b) => b.skor - a.skor);

    resultHTML += `
    <div class="step-card saw-card">
        <h3>Langkah 6: Perangkingan</h3>
        <table>
            <tr><th>Peringkat</th><th>Alternatif</th><th>Total Skor</th></tr>`;
    skorAkhir.forEach((item, idx) => {
        resultHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${item.nama}</td>
                <td><strong>${item.skor}</strong></td>
            </tr>`;
    });
    resultHTML += '</table></div>';

    // ── Tampilkan & animasi ──
    const container = document.getElementById('resultContainer-saw');
    container.innerHTML = resultHTML;

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(container.querySelectorAll('.step-card'),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' }
        );
    } else {
        // Fallback jika GSAP tidak tersedia
        container.querySelectorAll('.step-card').forEach(el => el.style.opacity = '1');
    }
}
