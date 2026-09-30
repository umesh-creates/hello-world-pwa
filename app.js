/* ===== Edit these three lines as needed ===== */
            const COMPANY_NAME = 'Gajanan Electric Shop';
            const CITY = 'Pune';
            const DISCOUNT = 30;   // % off, used as the rate on the invoice

            /* ===== Item table: columns (3rd dimension) and price (MRP) per size ===== */
            const HEIGHTS = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
            const A = [1000, 1020, 1040, 1060, 1080, 1100, 1120, 1140, 1160, 1180, 1200, 1230];
            const B = [1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550];
            const C = [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200];
            const ITEMS = [
                { size: '24X63', mrp: A }, { size: '38X67', mrp: A }, { size: '32X67', mrp: A },
                { size: '31X70', mrp: A }, { size: '35X70', mrp: A }, { size: '38X70', mrp: A },
                { size: '31X72', mrp: A }, { size: '38X72', mrp: A }, { size: '35X72', mrp: A },
                { size: '36X80', mrp: B }, { size: '33X85', mrp: B }, { size: '38X85', mrp: B },
                { size: '33X90', mrp: C }, { size: '38X90', mrp: C }, { size: '33X95', mrp: C }, { size: '38X95', mrp: C }
            ];

            /* ===== Helpers ===== */
            const $ = s => document.querySelector(s);
            const grid = $('#grid'), qty = $('#qty');
            const offPrice = m => Math.round(m * (100 - DISCOUNT) / 100);
            const dateStr = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const nameOf = l => ITEMS[l.i].size + 'X' + HEIGHTS[l.j];

            // Indian rupee format: 3,00,000
            function inr(n) {
                n = Math.round(n);
                const s = String(Math.abs(n));
                let last3 = s.slice(-3), rest = s.slice(0, -3);
                if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); last3 = ',' + last3; }
                return '\u20B9' + (n < 0 ? '-' : '') + rest + last3;
            }
            function calc() {
                let tq = 0, total = 0;
                lines.forEach(l => { tq += l.qty; total += offPrice(ITEMS[l.i].mrp[l.j]) * l.qty; });
                return { tq, total };
            }

            let selectMode = false, sel = null, lines = [];

            document.title = COMPANY_NAME + ' - Invoice';
            $('#brand').textContent = COMPANY_NAME;
            $('#brandCity').textContent = CITY;
            $('#invCompany').textContent = COMPANY_NAME;
            $('#invCity').textContent = CITY;

            /* ===== Build item table ===== */
            (function () {
                let html = '';
                ITEMS.forEach((it, i) => {
                    let r1 = '<tr class="r-mrp"><th class="lab">price</th>';
                    let r2 = '<tr class="r-off"><th class="lab">' + DISCOUNT + '% off</th>';
                    let r3 = '<tr class="r-dim"><th class="lab size">' + it.size + '</th>';
                    it.mrp.forEach((m, j) => {
                        const d = 'data-i="' + i + '" data-j="' + j + '"';
                        r1 += '<td class="c" ' + d + '>' + inr(m) + '</td>';
                        r2 += '<td class="c" ' + d + '>' + inr(offPrice(m)) + '</td>';
                        r3 += '<td class="c" ' + d + '>' + HEIGHTS[j] + '</td>';
                    });
                    html += '<tbody>' + r1 + '</tr>' + r2 + '</tr>' + r3 + '</tr></tbody>';
                });
                grid.innerHTML = html;
            })();

            /* ===== Selection ===== */
            function paintSel(on) {
                if (!sel) return;
                grid.querySelectorAll('td[data-i="' + sel.i + '"][data-j="' + sel.j + '"]')
                    .forEach(td => td.classList.toggle('sel', on));
            }

            function updateBar() {
                const b = $('#btnSelect');
                b.textContent = selectMode ? 'Cancel' : 'Select';
                b.classList.toggle('outline', selectMode);
                grid.classList.toggle('selecting', selectMode);
                $('#hint').textContent = selectMode
                    ? 'Tap a cell to pick an item. Added items show at the bottom.'
                    : (lines.length ? 'Tap Select to add more items.' : 'Tap Select, then choose an item.');
                $('#pick').hidden = !sel;
                $('#added').hidden = !lines.length;
                $('#dock').hidden = !sel && !lines.length;
                if (sel) {
                    $('#pickName').textContent = nameOf(sel);
                    $('#pickPrice').textContent = inr(offPrice(ITEMS[sel.i].mrp[sel.j]));
                }
                if (lines.length) {
                    const c = calc();
                    $('#cnt').textContent = lines.length + (lines.length === 1 ? ' item' : ' items') + ' \u00B7 ' + inr(c.total);
                    $('#chips').innerHTML = lines.map(l => '<span class="ch">' + nameOf(l) + ' \u00D7' + l.qty + '</span>').join('');
                    $('#chips').scrollLeft = 99999;
                }
            }

            $('#btnSelect').onclick = () => {
                $('#dupBackdrop').hidden = true;
                if (selectMode) { paintSel(false); sel = null; selectMode = false; }
                else selectMode = true;
                updateBar();
            };

            function showDup(onOk) {
                const bd = $('#dupBackdrop'), ok = $('#dupOk');
                bd.hidden = false;
                const handler = () => { bd.hidden = true; ok.removeEventListener('click', handler); onOk(); };
                ok.addEventListener('click', handler);
            }

            grid.addEventListener('click', e => {
                if (!selectMode) return;
                const td = e.target.closest('td[data-i]');
                if (!td) return;
                const i = +td.dataset.i, j = +td.dataset.j;
                const same = sel && sel.i === i && sel.j === j;
                if (same) { paintSel(false); sel = null; updateBar(); return; }
                const found = lines.find(l => l.key === (i + '-' + j));
                paintSel(false);
                sel = { i, j };
                paintSel(true);
                updateBar();
                if (found) {
                    showDup(() => {
                        qty.value = found.qty; qty.classList.remove('err');
                        if (matchMedia('(hover:hover)').matches) { qty.focus({ preventScroll: true }); qty.select(); }
                    });
                } else {
                    qty.value = 1; qty.classList.remove('err');
                    if (matchMedia('(hover:hover)').matches) { qty.focus({ preventScroll: true }); qty.select(); }
                }
            });

            document.querySelectorAll('.step').forEach(b => b.onclick = () => {
                qty.value = Math.max(1, (parseInt(qty.value, 10) || 0) + (+b.dataset.d));
                qty.classList.remove('err');
            });
            qty.addEventListener('input', () => qty.classList.remove('err'));
            qty.addEventListener('keydown', e => { if (e.key === 'Enter') done(); });
            $('#btnDone').onclick = done;
            $('#btnView').onclick = () => $('#invoiceSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

            /* ===== Done: add item, stay in select mode for the next one ===== */
            function done() {
                if (!sel) return;
                const q = parseInt(qty.value, 10);
                if (!(q > 0 && q <= 100000)) { qty.classList.add('err'); qty.focus(); return; }
                const key = sel.i + '-' + sel.j;
                const found = lines.find(l => l.key === key);
                if (found) found.qty = q; else lines.push({ key, i: sel.i, j: sel.j, qty: q });
                paintSel(false); sel = null;
                renderInvoice();
                updateBar();
            }

            /* ===== Invoice ===== */
            function renderInvoice() {
                $('#invoiceSection').hidden = !lines.length;
                if (!lines.length) return;
                let rows = '';
                lines.forEach((l, n) => {
                    const m = ITEMS[l.i].mrp[l.j], r = offPrice(m);
                    rows += '<tr><td class="l">' + (n + 1) + '</td>'
                        + '<td class="it">' + nameOf(l) + '</td>'
                        + '<td>' + inr(r) + '<small>' + inr(m) + '</small></td>'
                        + '<td>' + l.qty + '</td>'
                        + '<td><b>' + inr(r * l.qty) + '</b></td>'
                        + '<td class="no-print"><button class="rm" type="button" data-k="' + l.key + '" aria-label="Remove item">&times;</button></td></tr>';
                });
                const c = calc();
                $('#lines').innerHTML = rows;
                $('#totQty').textContent = c.tq;
                $('#grand').textContent = inr(c.total);
                $('#invDate').textContent = dateStr();
            }

            $('#lines').addEventListener('click', e => {
                const b = e.target.closest('.rm');
                if (!b) return;
                lines = lines.filter(l => l.key !== b.dataset.k);
                renderInvoice();
                updateBar();
            });

            // Clear everything and start selecting again
            $('#btnNew').onclick = () => {
                $('#dupBackdrop').hidden = true;
                paintSel(false); sel = null; lines = [];
                selectMode = true;
                renderInvoice();
                updateBar();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            /* ===== Print ===== */
            const oldTitle = document.title;
            $('#btnPrint').onclick = () => {
                document.title = COMPANY_NAME + ' ' + dateStr();
                try { window.print(); } catch (e) { alert('Print is not available here. Use Save PDF.'); }
            };
            window.addEventListener('afterprint', () => { document.title = oldTitle; });

            /* ===== Save PDF (built in the browser, no library, works offline) ===== */
            function drawPages() {
                const S = 2, W = 794, H = 1123, P = 48, RH = 44, FONT = '"Segoe UI",Roboto,Arial,sans-serif';
                const rows = lines.map((l, n) => {
                    const m = ITEMS[l.i].mrp[l.j], r = offPrice(m);
                    return { n: n + 1, name: nameOf(l), rate: r, mrp: m, qty: l.qty, amt: r * l.qty };
                });
                const c = calc(), pages = [];
                let idx = 0;
                do {
                    const cv = document.createElement('canvas');
                    cv.width = W * S; cv.height = H * S;
                    const g = cv.getContext('2d');
                    g.scale(S, S);
                    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
                    let y = 40;
                    if (!pages.length) {
                        const gr = g.createLinearGradient(0, 0, W, 170);
                        gr.addColorStop(0, '#08294A'); gr.addColorStop(.5, '#0B3D6E'); gr.addColorStop(.85, '#007ACC'); gr.addColorStop(1, '#23A9F2');
                        g.fillStyle = gr; g.fillRect(0, 0, W, 150);
                        g.fillStyle = 'rgba(255,255,255,.16)';
                        g.beginPath(); g.moveTo(0, 130); g.bezierCurveTo(200, 160, 400, 100, 600, 130); g.bezierCurveTo(800, 160, 1000, 110, W, 130); g.lineTo(W, 150); g.lineTo(0, 150); g.fill();
                        g.fillStyle = '#fff'; g.textAlign = 'left';
                        g.font = '800 34px ' + FONT; g.fillText(COMPANY_NAME, P, 70);
                        g.font = '17px ' + FONT; g.fillText(CITY, P, 100);
                        g.textAlign = 'right';
                        g.font = '300 28px ' + FONT; g.fillText('INV-VERSION-01', W - P, 70);
                        g.font = '17px ' + FONT; g.fillText(dateStr(), W - P, 100);
                        y = 180;
                    }
                    g.textAlign = 'left';
                    g.fillStyle = '#D9EEFC'; g.fillRect(P, y, W - 2 * P, 36);
                    g.fillStyle = '#0B3D6E'; g.font = '700 14px ' + FONT;
                    g.fillText('#', P + 8, y + 23); g.fillText('Item (size)', P + 44, y + 23);
                    g.textAlign = 'right';
                    g.fillText('Rate', W - P - 230, y + 23); g.fillText('Qty', W - P - 140, y + 23); g.fillText('Amount', W - P - 8, y + 23);
                    y += 36;
                    while (idx < rows.length && y + RH <= H - 140) {
                        const r = rows[idx++];
                        g.fillStyle = '#0E2A40'; g.textAlign = 'left'; g.font = '15px ' + FONT;
                        g.fillText(r.n, P + 8, y + 27);
                        g.font = '700 16px ' + FONT; g.fillText(r.name, P + 44, y + 27);
                        g.textAlign = 'right'; g.font = '15px ' + FONT;
                        g.fillText(inr(r.rate), W - P - 230, y + 22);
                        g.fillStyle = '#5D7A90'; g.font = '11.5px ' + FONT;
                        const t = inr(r.mrp); g.fillText(t, W - P - 230, y + 37);
                        const tw = g.measureText(t).width;
                        g.fillRect(W - P - 230 - tw, y + 33, tw, 1);
                        g.fillStyle = '#0E2A40'; g.font = '15px ' + FONT; g.fillText(r.qty, W - P - 140, y + 27);
                        g.font = '700 15px ' + FONT; g.fillText(inr(r.amt), W - P - 8, y + 27);
                        g.fillStyle = '#CFE3F1'; g.fillRect(P, y + RH - 1, W - 2 * P, 1);
                        y += RH;
                    }
                    if (idx >= rows.length) {
                        g.textAlign = 'left'; g.fillStyle = '#5D7A90'; g.font = '15px ' + FONT;
                        g.fillText('Total quantity: ' + c.tq, P + 8, y + 52);
                        const bw = 300, bx = W - P - bw;
                        const gr2 = g.createLinearGradient(bx, 0, bx + bw, 0);
                        gr2.addColorStop(0, '#0B3D6E'); gr2.addColorStop(1, '#007ACC');
                        g.fillStyle = gr2;
                        if (g.roundRect) { g.beginPath(); g.roundRect(bx, y + 20, bw, 54, 12); g.fill(); } else g.fillRect(bx, y + 20, bw, 54);
                        g.fillStyle = '#fff'; g.font = '16px ' + FONT; g.fillText('Total', bx + 18, y + 54);
                        g.textAlign = 'right'; g.font = '800 26px ' + FONT; g.fillText(inr(c.total), bx + bw - 18, y + 56);
                        g.textAlign = 'center'; g.fillStyle = '#5D7A90'; g.font = '14px ' + FONT;
                        g.fillText('Thank you for your purchase. Please visit again.', W / 2, H - 36);
                    }
                    pages.push(cv);
                } while (idx < rows.length);
                return pages;
            }

            function buildPdf(pages) {
                const enc = new TextEncoder(), parts = [], offs = [];
                let len = 0;
                const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
                const obj = (id, fn) => { offs[id] = len; push(id + ' 0 obj\n'); fn(); push('\nendobj\n'); };
                const jpegs = pages.map(cv => Uint8Array.from(atob(cv.toDataURL('image/jpeg', .92).split(',')[1]), ch => ch.charCodeAt(0)));
                const n = jpegs.length, w = pages[0].width, h = pages[0].height;
                push('%PDF-1.4\n');
                obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
                obj(2, () => push('<< /Type /Pages /Kids [' + jpegs.map((_, k) => (3 + k * 3) + ' 0 R').join(' ') + '] /Count ' + n + ' >>'));
                jpegs.forEach((jb, k) => {
                    const p = 3 + k * 3, cs = 'q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';
                    obj(p, () => push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ' + (p + 2) + ' 0 R >> >> /Contents ' + (p + 1) + ' 0 R >>'));
                    obj(p + 1, () => push('<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream'));
                    obj(p + 2, () => { push('<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jb.length + ' >>\nstream\n'); push(jb); push('\nendstream'); });
                });
                const total = 3 + n * 3, xref = len;
                let x = 'xref\n0 ' + total + '\n0000000000 65535 f \n';
                for (let i = 1; i < total; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
                push(x + 'trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
                return new Blob(parts, { type: 'application/pdf' });
            }

            function makePdfFile() {
                const name = (COMPANY_NAME + ' ' + dateStr()).replace(/[^\w ]+/g, '').trim().replace(/\s+/g, '-') + '.pdf';
                return new File([buildPdf(drawPages())], name, { type: 'application/pdf' });
            }

            $('#btnPdf').onclick = () => {
                if (!lines.length) return;
                const f = makePdfFile(), a = document.createElement('a');
                a.href = URL.createObjectURL(f); a.download = f.name;
                document.body.appendChild(a); a.click(); a.remove();
                setTimeout(() => URL.revokeObjectURL(a.href), 5000);
            };

            // Share button appears only where the browser can share files (e.g. phone -> WhatsApp)
            try {
                if (navigator.canShare && navigator.canShare({ files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] })) {
                    $('#btnShare').hidden = false;
                    $('#btnShare').onclick = async () => {
                        if (!lines.length) return;
                        try { await navigator.share({ files: [makePdfFile()] }); } catch (e) { }
                    };
                }
            } catch (e) { }

            updateBar();

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("./sw.js").catch(error => {
			console.error("Service worker registration failed:", error);
		});
	});
}
