const catalog = new Map([
    ['CAM-01', { name: '练习相机', image: 'cam-01.jpg', dailyCents: 12000 }],
    ['CAM-02', { name: '轻便旅行相机', image: 'cam-02.jpg', dailyCents: 9000 }],
    ['CAM-03', { name: '视频创作相机', image: 'cam-03.jpg', dailyCents: 18000 }],
]);

const sku = new URLSearchParams(window.location.search).get('sku') ?? 'CAM-01';
const equipment = catalog.get(sku);

if (equipment) {
    showQuote(sku, equipment);
} else {
    document.querySelector('[data-demo-missing]').hidden = false;
}

function showQuote(sku, equipment) {
    const panel = document.querySelector('[data-demo-quote]');
    const calculator = panel.querySelector('.reserve-form');
    const image = panel.querySelector('[data-demo-image]');
    const startDate = panel.querySelector('#start-date');
    const endDate = panel.querySelector('#end-date');
    const days = panel.querySelector('[data-demo-days]');
    const total = panel.querySelector('[data-demo-total]');
    const feedback = panel.querySelector('#quote-feedback');
    const dailyRate = yuan(equipment.dailyCents);

    document.title = equipment.name + ' · 费用预览 · 取景 FRAME RENTAL';
    image.src = './assets/' + equipment.image;
    image.alt = equipment.name + '示例图片';
    panel.querySelector('[data-demo-code]').textContent = sku;
    panel.querySelector('[data-demo-title]').textContent = equipment.name;
    panel.querySelector('[data-demo-rate]').textContent = dailyRate;
    panel.querySelector('[data-demo-unit]').textContent = dailyRate;
    panel.hidden = false;

    function updateQuote() {
        const start = calendarDay(startDate.value);
        const end = calendarDay(endDate.value);
        const invalidStart = startDate.validity.badInput || (startDate.value !== '' && start === null);
        const invalidEnd = endDate.validity.badInput || (endDate.value !== '' && end === null);
        const reversed = start !== null && end !== null && end < start;
        const invalid = invalidStart || invalidEnd || reversed;

        startDate.setAttribute('aria-invalid', String(invalidStart));
        endDate.setAttribute('aria-invalid', String(invalidEnd || reversed));
        endDate.min = start === null ? '' : startDate.value;
        calculator.dataset.quoteState = invalid ? 'invalid' : 'idle';

        if (invalid || start === null || end === null) {
            days.textContent = '—';
            total.textContent = '—';
            if (reversed) {
                feedback.textContent = '结束日期必须等于或晚于开始日期。';
            } else {
                feedback.textContent = invalid ? '请选择有效日期。' : '';
            }
            return;
        }

        const rentalDays = end - start + 1;
        calculator.dataset.quoteState = 'ready';
        days.textContent = rentalDays + ' 天';
        total.textContent = yuan(rentalDays * equipment.dailyCents);
        feedback.textContent = '';
    }

    for (const input of [startDate, endDate]) {
        input.addEventListener('input', updateQuote);
        input.addEventListener('change', updateQuote);
    }
    updateQuote();
}

function calendarDay(value) {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value.startsWith('0000')) {
        return null;
    }

    const midnight = Date.parse(value + 'T00:00:00Z');

    if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== value) {
        return null;
    }

    return midnight / 86_400_000;
}

function yuan(cents) {
    const digits = String(cents).padStart(3, '0');

    return '¥' + digits.slice(0, -2) + '.' + digits.slice(-2);
}
