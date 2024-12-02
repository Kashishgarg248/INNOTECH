const canvas = document.getElementById('pollutionCanvas');
const ctx = canvas.getContext('2d');
const vehicleSpeedSlider = document.getElementById('vehicleSpeed');
const pollutionCollectedElem = document.getElementById('pollutionCollected');
const carbonGeneratedElem = document.getElementById('carbonGenerated');
const electricityGeneratedElem = document.getElementById('electricityGenerated');
const speedValueElem = document.getElementById('speedValue');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

let vehicles = [];
let pollutionCollected = 0;
let carbonRemoved = 0;
let electricityGenerated = 0;
let isRunning = false;
let lastTimestamp = 0;
let animationFrame;

// Constants for carbon and electricity conversion
const CARBON_CONVERSION_FACTOR = 0.273; // 1 unit of pollution = 0.273 grams of carbon
const ELECTRICITY_GENERATION_FACTOR = 0.05; // Efficiency factor for electricity generation

class Vehicle {
    constructor(x, y, speed, color) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.color = color;
        this.pollutionRate = speed * 0.05; // Pollution rate is based on speed
    }

    move() {
        this.x += this.speed;
        if (this.x > canvas.width) this.x = -60; // Reset position if off canvas
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 50, 30);

        // Emit pollution particles behind the vehicle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - 10, this.y + 15, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    // Calculate pollution based on speed and elapsed time
    generatePollution(deltaTime) {
        return this.pollutionRate * deltaTime;
    }
}

class SpeedBreaker {
    constructor(x) {
        this.x = x;
        this.y = 350;
    }

    draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x, this.y, 60, 15);
    }

    // Improved electricity generation logic based on vehicle speed
    generateElectricity(vehicle, deltaTime) {
        if (vehicle.x > this.x && vehicle.x < this.x + 60) {
            // Generate electricity based on speed, factor, and time
            electricityGenerated += vehicle.speed * ELECTRICITY_GENERATION_FACTOR * deltaTime;
        }
    }
}

let speedBreaker = new SpeedBreaker(450);

function initSimulation() {
    vehicles = [
        new Vehicle(-50, 120, vehicleSpeedSlider.valueAsNumber, 'red'),
        new Vehicle(-250, 250, vehicleSpeedSlider.valueAsNumber, 'blue'),
        new Vehicle(-450, 380, vehicleSpeedSlider.valueAsNumber, 'green')
    ];
    pollutionCollected = 0; // Reset pollution at the start
    carbonRemoved = 0; // Reset carbon removed
    electricityGenerated = 0; // Reset electricity
}

function drawRoad() {
    ctx.fillStyle = '#757575';
    ctx.fillRect(0, 100, canvas.width, 400);
}

function drawStreetLights() {
    ctx.fillStyle = electricityGenerated > 1 ? '#FFFF00' : '#777';
    for (let i = 200; i < canvas.width; i += 200) {
        ctx.fillRect(i, 60, 10, 50);
    }
}

function updateCanvas(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    let deltaTime = (timestamp - lastTimestamp) / 1000; // Time difference in seconds

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawRoad();
    drawStreetLights();

    let totalPollution = 0;
    
    vehicles.forEach(vehicle => {
        vehicle.move();
        vehicle.draw();
        totalPollution += vehicle.generatePollution(deltaTime);
        speedBreaker.generateElectricity(vehicle, deltaTime);
    });

    speedBreaker.draw();

    // Accumulate pollution collected
    pollutionCollected += totalPollution;

    // Calculate Carbon Removed
    carbonRemoved = pollutionCollected * CARBON_CONVERSION_FACTOR;

    // Update Stats on the UI
    pollutionCollectedElem.textContent = pollutionCollected.toFixed(2);
    carbonGeneratedElem.textContent = carbonRemoved.toFixed(2); // Display grams of carbon removed
    electricityGeneratedElem.textContent = electricityGenerated.toFixed(2);

    lastTimestamp = timestamp;
    animationFrame = requestAnimationFrame(updateCanvas);
}

// Event Listeners
startButton.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        initSimulation();
        requestAnimationFrame(updateCanvas);
    }
});

resetButton.addEventListener('click', () => {
    cancelAnimationFrame(animationFrame);
    isRunning = false;
    pollutionCollected = 0;
    carbonRemoved = 0;
    electricityGenerated = 0;
    pollutionCollectedElem.textContent = "0";
    carbonGeneratedElem.textContent = "0";
    electricityGeneratedElem.textContent = "0";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastTimestamp = 0;
});

vehicleSpeedSlider.addEventListener('input', (e) => {
    const newSpeed = parseInt(e.target.value);
    speedValueElem.textContent = newSpeed;
    
    // Update the speed and pollution rate for each vehicle
    vehicles.forEach(vehicle => {
        vehicle.speed = newSpeed;
        vehicle.pollutionRate = vehicle.speed * 0.05; // Recalculate pollution rate based on new speed
    });
});
