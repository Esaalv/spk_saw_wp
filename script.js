// ─── Tab Switching ────────────────────────────────────────────────────────────

const TABS = ['saw', 'wp'];

function switchTab(method) {
    TABS.forEach(m => {
        const btn   = document.getElementById(`tab-${m}`);
        const panel = document.getElementById(`panel-${m}`);
        if (!btn || !panel) return;

        btn.classList.toggle('active',   m === method);
        panel.classList.toggle('active', m === method);
    });

    // Animasi tab-indicator dengan GSAP
    moveIndicator(method);
}

function moveIndicator(method) {
    const indicator = document.getElementById('tabIndicator');
    const activeBtn = document.getElementById(`tab-${method}`);
    if (!indicator || !activeBtn) return;

    // Warna indicator sesuai metode
    const colors = { saw: 'var(--saw-color)', wp: 'var(--wp-color)' };
    indicator.style.background = colors[method] || 'var(--saw-color)';

    if (typeof gsap !== 'undefined') {
        gsap.to(indicator, {
            x:        activeBtn.offsetLeft,
            width:    activeBtn.offsetWidth,
            duration: 0.35,
            ease:     'power2.out'
        });
    } else {
        // Fallback tanpa GSAP
        indicator.style.width       = activeBtn.offsetWidth + 'px';
        indicator.style.transform   = `translateX(${activeBtn.offsetLeft}px)`;
    }
}

// ─── Inisialisasi ─────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
    // Set posisi awal indicator ke tab SAW
    requestAnimationFrame(() => moveIndicator('saw'));
});

// Re-hitung posisi indicator saat resize
window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) moveIndicator(activeBtn.dataset.tab);
});
