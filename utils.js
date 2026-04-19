// ─── Number Formatting ────────────────────────────────────────────────────────

function formatNumber(num) {
    if (num === null || num === undefined || num === "") return "";

    let parsed = parseFloat(num);
    if (isNaN(parsed)) return num;

    return parsed.toLocaleString('id-ID', { maximumFractionDigits: 3 });
}

function unformatNumber(str) {
    if (str === null || str === undefined || str === "") return NaN;

    str = str.toString().trim();

    if (str.includes(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
    } else {
        let dots = (str.match(/\./g) || []).length;

        if (dots > 1) {
            str = str.replace(/\./g, '');
        } else if (dots === 1) {
            let parts = str.split('.');
            if (parts[1].length === 3 && parts[0] !== '0') {
                str = str.replace(/\./g, '');
            }
        }
    }

    return parseFloat(str);
}

// ─── Cell Formatting ──────────────────────────────────────────────────────────
// Dipanggil via onblur; method dideteksi otomatis dari tabel induk.

function formatCell(cell) {
    const text        = cell.innerText.trim();
    const unformatted = unformatNumber(text);

    if (!isNaN(unformatted) && text !== "") {
        cell.innerText = formatNumber(unformatted);
    }

    // Temukan method dari data-method pada <table> induk
    const table = cell.closest('table');
    if (table && table.dataset.method) {
        validateData(table.dataset.method);
    }
}

// ─── Validation ───────────────────────────────────────────────────────────────
// method: 'saw' | 'wp'

function validateData(method) {
    const btn   = document.getElementById(`btnHitung-${method}`);
    const table = document.getElementById(`spkTable-${method}`);

    if (!table || table.rows.length <= 3) {
        if (btn) btn.disabled = true;
        return;
    }

    let isComplete = true;

    for (let r = 1; r < table.rows.length; r++) {
        if (r === 2) continue; // baris Tipe (select) — selalu valid

        const cols = table.rows[r].cells.length;

        for (let c = 1; c < cols - 1; c++) {
            const textValue = table.rows[r].cells[c].innerText.trim();
            const numValue  = unformatNumber(textValue);

            if (textValue === "" || isNaN(numValue)) {
                isComplete = false;
                break;
            }
        }

        if (!isComplete) break;
    }

    if (btn) btn.disabled = !isComplete;
}

// ─── Event Listener (shared) ──────────────────────────────────────────────────

document.addEventListener('input', function (e) {
    if (e.target.hasAttribute('contenteditable')) {
        const table = e.target.closest('table');
        if (table && table.dataset.method) {
            validateData(table.dataset.method);
        }
    }
});
