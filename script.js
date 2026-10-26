// LAB 07 - JavaScript Web Calculator
let current = "0";
let firstNumber = null;
let operation = null;
let newNumber = false;

const display = document.getElementById("display");
const history = document.getElementById("history");

// Show and hide the three-dot menu.
function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.classList.toggle("hidden");
    document.getElementById("menuButton").setAttribute(
        "aria-expanded", String(!menu.classList.contains("hidden"))
    );
}

// Open the selected mode.
function showPanel(mode) {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("menuButton").setAttribute("aria-expanded", "false");
    document.getElementById("calculatorPanel").classList.toggle("hidden", mode === "unit" || mode === "currency");
    document.getElementById("scientificPanel").classList.toggle("hidden", mode !== "scientific");
    document.getElementById("unitPanel").classList.toggle("hidden", mode !== "unit");
    document.getElementById("currencyPanel").classList.toggle("hidden", mode !== "currency");
    document.getElementById("modeTitle").textContent = mode === "scientific" ? "Scientific Calculator" : "Basic Calculator";
}

// Enter a digit or decimal point.
function pressNumber(value) {
    if (current === "Error") clearAll();

    if (value === ".") {
        if (newNumber) {
            current = "0";
            newNumber = false;
        }
        if (!current.includes(".")) current += ".";
    } else {
        if (newNumber || current === "0") current = value;
        else current += value;
        newNumber = false;
    }
    display.value = current;
}

// Save the first number and mathematical operator.
function setOperation(symbol) {
    if (current === "Error") return;
    if (operation !== null && !newNumber) calculate();
    if (current === "Error") return;
    firstNumber = Number(current);
    operation = symbol;
    newNumber = true;
    history.textContent = current + " " + symbol;
}

// Perform +, -, *, /, and power calculations.
function calculate() {
    if (operation === null || newNumber) return;

    const secondNumber = Number(current);
    let answer;

    if (operation === "+") answer = firstNumber + secondNumber;
    else if (operation === "-") answer = firstNumber - secondNumber;
    else if (operation === "*") answer = firstNumber * secondNumber;
    else if (operation === "/") answer = secondNumber === 0 ? NaN : firstNumber / secondNumber;
    else if (operation === "^") answer = Math.pow(firstNumber, secondNumber);

    current = Number.isFinite(answer) ? String(Number(answer.toPrecision(12))) : "Error";
    display.value = current;
    history.textContent = "";
    firstNumber = null;
    operation = null;
    newNumber = true;
}

function clearAll() {
    current = "0";
    firstNumber = null;
    operation = null;
    newNumber = false;
    display.value = current;
    history.textContent = "";
}

function backspace() {
    if (current === "Error") return clearAll();
    current = current.length > 1 ? current.slice(0, -1) : "0";
    if (current === "-" || current === "") current = "0";
    newNumber = false;
    display.value = current;
}

// Scientific functions: trigonometry is in degrees.
function scientific(type) {
    const number = Number(current);
    const radians = number * Math.PI / 180;
    let answer;

    if (type === "sqrt") answer = Math.sqrt(number);
    else if (type === "square") answer = number * number;
    else if (type === "sin") answer = Math.sin(radians);
    else if (type === "cos") answer = Math.cos(radians);
    else if (type === "tan") answer = Math.abs(Math.cos(radians)) < 1e-10 ? NaN : Math.tan(radians);

    current = Number.isFinite(answer) ? String(Number(answer.toPrecision(12))) : "Error";
    display.value = current;
    newNumber = true;
}

// Length, weight, and temperature conversions.
function convertUnit() {
    const input = document.getElementById("unitValue");
    const value = Number(input.value);
    const type = document.getElementById("unitType").value;
    const output = document.getElementById("unitResult");

    if (input.value.trim() === "" || !Number.isFinite(value)) {
        output.textContent = "Please enter a valid number.";
        return;
    }

    let answer, label;
    if (type === "m-ft") { answer = value * 3.28084; label = "feet"; }
    else if (type === "ft-m") { answer = value / 3.28084; label = "meters"; }
    else if (type === "kg-lb") { answer = value * 2.20462262; label = "pounds"; }
    else if (type === "lb-kg") { answer = value / 2.20462262; label = "kilograms"; }
    else if (type === "c-f") { answer = value * 9 / 5 + 32; label = "°F"; }
    else if (type === "f-c") { answer = (value - 32) * 5 / 9; label = "°C"; }

    output.textContent = Number(answer.toFixed(4)) + " " + label;
}

// Sample backup rates are used only if the live API is unavailable.
let currencyRates = { USD: 1, PKR: 280, EUR: 0.92, GBP: 0.77 };

async function loadRates() {
    const status = document.getElementById("rateStatus");
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        if (data.result !== "success" || !data.rates?.PKR) throw new Error("Invalid rates");
        currencyRates = data.rates;
        status.textContent = "Live exchange rates loaded (last update: " + data.time_last_update_utc + ").";
    } catch (error) {
        status.textContent = "Offline demo: using sample rates, not current market rates.";
    }
}

function convertCurrency() {
    const input = document.getElementById("currencyValue");
    const amount = Number(input.value);
    const from = document.getElementById("fromCurrency").value;
    const to = document.getElementById("toCurrency").value;
    const output = document.getElementById("currencyResult");

    if (input.value.trim() === "" || !Number.isFinite(amount) || amount < 0) {
        output.textContent = "Please enter a valid amount.";
        return;
    }

    // Convert to USD first, then convert USD to the selected currency.
    const converted = (amount / currencyRates[from]) * currencyRates[to];
    output.textContent = amount + " " + from + " = " + converted.toFixed(2) + " " + to;
}

loadRates();
