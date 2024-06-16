

function convertLength() {
    const inches = document.getElementById('inches').value;
    const centimeters = inches * 2.54;
    document.getElementById('lengthResult').textContent = `${inches} inches is equal to ${centimeters.toFixed(2)} centimeters.`;
}

function convertWeight() {
    const pounds = document.getElementById('pounds').value;
    const kilograms = pounds * 0.453592;
    document.getElementById('weightResult').textContent = `${pounds} pounds is equal to ${kilograms.toFixed(2)} kilograms.`;
}

function convertTemperature() {
    const fahrenheit = document.getElementById('fahrenheit').value;
    const celsius = (fahrenheit - 32) * 5 / 9;
    document.getElementById('temperatureResult').textContent = `${fahrenheit}°F is equal to ${celsius.toFixed(2)}°C.`;
}