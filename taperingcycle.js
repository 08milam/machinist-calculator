
function generateGCode() {
    const startDiameter = parseFloat(document.getElementById('startDiameter').value);
    const endDiameter = parseFloat(document.getElementById('endDiameter').value);
    const length = parseFloat(document.getElementById('length').value);
    const depth = parseFloat(document.getElementById('depth').value);

    if (isNaN(startDiameter) || isNaN(endDiameter) || isNaN(length) || isNaN(depth)) {
        alert('Please fill out all fields correctly.');
        return;
    }

    const gcode = [];
    gcode.push('G21 ; Set units to millimeters');
    gcode.push('G90 ; Absolute positioning');

    const stepLength = length / 10;
    const diameterStep = (startDiameter - endDiameter) / 10;

    for (let i = 0; i <= 10; i++) {
        const currentDiameter = startDiameter - (i * diameterStep);
        gcode.push(`G01 X${(i * stepLength).toFixed(2)} Z${currentDiameter.toFixed(2)} F150`);
    }

    gcode.push('G28 ; Home all axes');
    gcode.push('M30 ; End of program');

    document.getElementById('gcodeOutput').innerText = gcode.join('\n');

    function toggleUnitLabels() {
        const unitSystem = document.getElementById('unit-system').value;
        const drillSizeLabel = document.getElementById('drill-size-label');
        const threadPitchLabel = document.getElementById('thread-pitch-label');

        if (unitSystem === 'metric') {
            drillSizeLabel.innerText = 'Drill Size (mm):';
            threadPitchLabel.innerText = 'Thread Pitch (mm):';
        } else {
            drillSizeLabel.innerText = 'Drill Size (inch):';
            threadPitchLabel.innerText = 'Thread Pitch (TPI):';
        }
    }
}