function calculateTap() {
    const unitSystem = document.getElementById('unit-system').value;
    const drillSize = parseFloat(document.getElementById('drill-size').value);
    const threadPitch = parseFloat(document.getElementById('thread-pitch').value);

    if (isNaN(drillSize) || isNaN(threadPitch)) {
        document.getElementById('result').innerText = 'Please enter valid numbers for both fields.';
        return;
    }

    let tapSize;
    if (unitSystem === 'metric') {
        tapSize = drillSize + threadPitch;
        document.getElementById('result').innerText = `Recommended Tap Size: ${tapSize.toFixed(2)} mm`;
    } else {
        tapSize = drillSize + (1 / threadPitch);
        document.getElementById('result').innerText = `Recommended Tap Size: ${tapSize.toFixed(2)} inch`;
    }
}