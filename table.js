// ─── Render Table ─────────────────────────────────────────────────────────────
// method: 'saw' | 'wp'

function renderTable(dataArray, method) {
    if (!dataArray || dataArray.length === 0) return;

    dataArray = dataArray.filter(row => row.some(cell => cell !== "" && cell !== null));

    const headerLen = dataArray[0].length;

    // Pasang data-method di <table> agar utils.js bisa detect method via closest()
    let html = `<table id="spkTable-${method}" data-method="${method}">`;

    dataArray.forEach((row, index) => {
        while (row.length < headerLen) row.push("");

        html += `<tr>`;

        row.forEach((col, colIndex) => {
            if (colIndex >= headerLen) return;

            if (index === 0) {
                // ── Baris header (nama kriteria) ──
                if (colIndex === 0) {
                    html += `<th>${col}</th>`;
                } else {
                    html += `<th>
                                <div class="th-content">
                                    <span contenteditable="true" onblur="validateData('${method}')">${col}</span>
                                    <button class="btn-delete-icon" onclick="deleteKriteria(this,'${method}')" title="Hapus Kriteria">⌫</button>
                                </div>
                             </th>`;
                }

            } else if (index === 1) {
                // ── Baris bobot ──
                if (colIndex === 0) {
                    html += `<td><strong>${col}</strong></td>`;
                } else {
                    html += `<td contenteditable="true" onblur="formatCell(this)">${formatNumber(col)}</td>`;
                }

            } else if (index === 2) {
                // ── Baris tipe (benefit / cost) ──
                if (colIndex === 0) {
                    html += `<td><strong>${col}</strong></td>`;
                } else {
                    const isCost = String(col).toLowerCase().trim() === 'cost';
                    html += `<td>
                                <select onchange="validateData('${method}')">
                                    <option value="benefit" ${!isCost ? 'selected' : ''}>benefit</option>
                                    <option value="cost"    ${ isCost ? 'selected' : ''}>cost</option>
                                </select>
                             </td>`;
                }

            } else {
                // ── Baris alternatif ──
                if (colIndex === 0) {
                    html += `<td contenteditable="true" onblur="validateData('${method}')">${col}</td>`;
                } else {
                    html += `<td contenteditable="true" onblur="formatCell(this)">${formatNumber(col)}</td>`;
                }
            }
        });

        // ── Kolom aksi ──
        if (index === 0) {
            html += `<th>Aksi</th>`;
        } else if (index === 1 || index === 2) {
            html += `<td>-</td>`;
        } else {
            html += `<td>
                        <button class="btn-delete-icon" onclick="deleteRow(this,'${method}')" title="Hapus Alternatif" style="margin:auto;">⌫</button>
                     </td>`;
        }

        html += `</tr>`;
    });

    html += `</table>`;

    document.getElementById(`dataTableContainer-${method}`).innerHTML     = html;
    document.getElementById(`resultContainer-${method}`).innerHTML        = '';
    document.getElementById(`dynamicTools-${method}`).style.display       = 'flex';

    validateData(method);
}

// ─── Delete Kriteria ──────────────────────────────────────────────────────────

function deleteKriteria(btn, method) {
    if (!confirm("Apakah Anda yakin ingin menghapus kriteria ini?")) return;

    const th       = btn.closest('th');
    const colIndex = th.cellIndex;
    const table    = document.getElementById(`spkTable-${method}`);

    for (let i = 0; i < table.rows.length; i++) {
        table.rows[i].deleteCell(colIndex);
    }

    validateData(method);
}

// ─── Delete Row ───────────────────────────────────────────────────────────────

function deleteRow(btn, method) {
    if (!confirm("Apakah Anda yakin ingin menghapus alternatif ini?")) return;

    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);

    validateData(method);
}

// ─── Tambah Kriteria ──────────────────────────────────────────────────────────

function tambahKriteria(method) {
    const table = document.getElementById(`spkTable-${method}`);
    if (!table) return;

    const rows = table.rows;

    for (let i = 0; i < rows.length; i++) {
        const row         = rows[i];
        const targetIndex = row.cells.length - 1;

        if (i === 0) {
            const th = document.createElement('th');
            th.innerHTML = `<div class="th-content">
                                <span contenteditable="true" onblur="validateData('${method}')">Baru</span>
                                <button class="btn-delete-icon" onclick="deleteKriteria(this,'${method}')" title="Hapus Kriteria">⌫</button>
                            </div>`;
            row.insertBefore(th, row.cells[targetIndex]);

        } else if (i === 1) {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.innerText       = "0";
            td.setAttribute('onblur', 'formatCell(this)');
            row.insertBefore(td, row.cells[targetIndex]);

        } else if (i === 2) {
            const td = document.createElement('td');
            td.innerHTML = `<select onchange="validateData('${method}')">
                                <option value="benefit">benefit</option>
                                <option value="cost">cost</option>
                            </select>`;
            row.insertBefore(td, row.cells[targetIndex]);

        } else {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.innerText       = "0";
            td.setAttribute('onblur', 'formatCell(this)');
            row.insertBefore(td, row.cells[targetIndex]);
        }
    }

    validateData(method);
}

// ─── Tambah Alternatif ────────────────────────────────────────────────────────

function tambahAlternatif(method) {
    const table = document.getElementById(`spkTable-${method}`);
    if (!table) return;

    const rowCount = table.rows.length;
    const colCount = table.rows[0].cells.length;
    const newRow   = table.insertRow(rowCount);

    for (let i = 0; i < colCount; i++) {
        const cell = newRow.insertCell(i);

        if (i === 0) {
            cell.contentEditable = "true";
            cell.innerText       = "Alternatif Baru";
            cell.setAttribute('onblur', `validateData('${method}')`);

        } else if (i === colCount - 1) {
            cell.innerHTML = `<button class="btn-delete-icon" onclick="deleteRow(this,'${method}')" title="Hapus Alternatif" style="margin:auto;">⌫</button>`;

        } else {
            cell.contentEditable = "true";
            cell.innerText       = "0";
            cell.setAttribute('onblur', 'formatCell(this)');
        }
    }

    validateData(method);
}

// ─── Reset Data ───────────────────────────────────────────────────────────────

function resetData(method) {
    if (!confirm("Apakah Anda yakin ingin mereset semua data? Semua data pada tabel dan hasil perhitungan akan hilang.")) return;

    document.getElementById(`dataTableContainer-${method}`).innerHTML =
        `<p class="placeholder-text">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="opacity:.3;display:block;margin:0 auto 12px;"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            Belum ada data. Download &amp; upload template Excel terlebih dahulu.
        </p>`;

    document.getElementById(`resultContainer-${method}`).innerHTML       = '';
    document.getElementById(`fileUpload-${method}`).value                = '';
    document.getElementById(`dynamicTools-${method}`).style.display      = 'none';
    document.getElementById(`btnHitung-${method}`).disabled              = true;
}
