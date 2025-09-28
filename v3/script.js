// === DATA ===
const bacteriaData = {
    "S.Pseudintermedius": {
        "Gram stain (+/-)": "Gram-positive",
        "Catalase": "+",
        "Oxidase": "-",
        "OF-test (oxidative/fermentative)": "Fermentative",
        "Coagulase test": "+",
        "Maltose fermented": "+/-",
        "Galactose fermented": "+",
        "Mannitol fermented (anaerobe)": "-",
        "VP test": "-",
        "Esculin hydrolysis": "-",
        "Arginine dihydrolase": "+",
        "Dnase test": "+",
        "Mannitol salt agar(MSA)": "-",
        "Baird-Parker agar": "+"
    },
    "S.aureus": {
        "Gram stain (+/-)": "Gram-positive",
        "Catalase": "+",
        "Oxidase": "-",
        "OF-test (oxidative/fermentative)": "Fermentative",
        "Coagulase test": "+",
        "Maltose fermented": "+",
        "Galactose fermented": "+",
        "Mannitol fermented (anaerobe)": "+",
        "VP test": "+",
        "Esculin hydrolysis": "-",
        "Arginine dihydrolase": "-",
        "Dnase test": "+",
        "Mannitol salt agar(MSA)": "+",
        "Baird-Parker agar": "+"
    },
    "S.schleiferi subsp.coagulans": {
        "Gram stain (+/-)": "Gram-positive",
        "Catalase": "+",
        "Oxidase": "-",
        "OF-test (oxidative/fermentative)": "Fermentative",
        "Coagulase test": "+",
        "Maltose fermented": "-",
        "Galactose fermented": "+",
        "Mannitol fermented (anaerobe)": "-",
        "VP test": "+",
        "Esculin hydrolysis": "+/-",
        "Arginine dihydrolase": "+",
        "Dnase test": "+",
        "Mannitol salt agar(MSA)": "-",
        "Baird-Parker agar": "+"
    },
    "S.epidermidis": {
        "Gram stain (+/-)": "Gram-positive",
        "Catalase": "+",
        "Oxidase": "-",
        "OF-test (oxidative/fermentative)": "Fermentative",
        "Coagulase test": "-",
        "Maltose fermented": "+",
        "Galactose fermented": "+/-",
        "Mannitol fermented (anaerobe)": "-",
        "VP test": "+",
        "Esculin hydrolysis": "-",
        "Arginine dihydrolase": "+",
        "Dnase test": "-",
        "Mannitol salt agar(MSA)": "-",
        "Baird-Parker agar": "+"
    }
};

// === DOM ELEMENTS ===
const form = document.getElementById("testForm");
const barsContainer = document.getElementById("bars");
const tests = Object.keys(bacteriaData["S.aureus"]);
const options = ["+", "-", "+/-"];

// === UTILITY FUNCTIONS ===
const createSelect = (name) => {
    const select = document.createElement("select");
    select.name = name;
    select.className = "border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400";
    select.innerHTML = `<option value="">Select</option><option value="+">+</option><option value="-">-</option>`;
    return select;
};

const isBiochemicalTest = (value) => options.includes(value);

// === FORM BUILDER ===
const buildForm = () => {
    tests.forEach(test => {
        const field = document.createElement("div");
        field.className = "flex items-center justify-between bg-white p-3 rounded-lg shadow-sm";

        const label = document.createElement("label");
        label.className = "font-medium text-gray-700";
        label.textContent = test;

        field.appendChild(label);

        const value = bacteriaData["S.aureus"][test];
        if (isBiochemicalTest(value)) {
            field.appendChild(createSelect(test));
        } else {
            const span = document.createElement("span");
            span.className = "text-gray-700";
            span.textContent = value;
            field.appendChild(span);
        }

        form.appendChild(field);
    });
};

// === SCORING ===
const calculateScores = (input) => {
    const scores = {};
    for (const [species, data] of Object.entries(bacteriaData)) {
        let correct = 0;
        let invalid = false;

        for (const [test, val] of Object.entries(input)) {
            const expected = data[test];
            if (isBiochemicalTest(expected)) {
                if (expected !== "+/-" && expected !== val) {
                    invalid = true;
                    break;
                } else {
                    correct++;
                }
            }
        }

        scores[species] = invalid ? 0 : Math.round((correct / Object.keys(input).length) * 100);
    }
    return scores;
};

// === TABLE RENDERER ===
const renderTable = (scores, input) => {
    const maxScore = Math.max(...Object.values(scores));
    const bestSpecies = Object.entries(scores)
        .filter(([_, v]) => v === maxScore)
        .map(([k, _]) => k);

    let table = `<div class="overflow-auto"><table class="table-auto w-full border border-gray-300 text-center"><thead><tr><th class="border p-2 bg-gray-50">Biochemical test</th>`;

    for (const species of Object.keys(bacteriaData)) {
        const isBest = bestSpecies.includes(species);
        const headerClass = isBest ? "bg-green-200 font-semibold" : "bg-gray-100";
        table += `<th class="border p-2 ${headerClass} w-36 break-words">
                <div class="whitespace-normal break-words">${species}</div>
                <div class="text-sm text-gray-600 mt-1">${scores[species]}%</div>
              </th>`;
    }

    table += `</tr></thead><tbody>`;

    tests.forEach(test => {
        table += `<tr class="odd:bg-white even:bg-gray-50"><td class="border p-2 text-left font-medium">${test}</td>`;
        for (const [species, data] of Object.entries(bacteriaData)) {
            const expected = data[test];
            const userSelected = input.hasOwnProperty(test);
            let cellClass = "";

            if (isBiochemicalTest(expected) && userSelected) {
                cellClass = (expected === "+/-" || expected === input[test]) ? "bg-green-100" : "bg-red-100";
            }

            table += `<td class="border p-2 ${cellClass} w-36 break-words">${expected}</td>`;
        }
        table += `</tr>`;
    });

    table += `</tbody></table></div>`;
    barsContainer.innerHTML = table;
};

// === UPDATE FUNCTION ===
const updateTable = () => {
    const formData = new FormData(form);
    const input = {};
    tests.forEach(t => {
        const val = formData.get(t);
        if (["+", "-"].includes(val)) input[t] = val;
    });

    if (Object.keys(input).length === 0) {
        barsContainer.innerHTML = `<p class="text-center text-gray-500">Select tests to see predictions.</p>`;
        return;
    }

    const scores = calculateScores(input);
    renderTable(scores, input);
};

// === INITIALIZATION ===
buildForm();
form.querySelectorAll("select").forEach(sel => sel.addEventListener("change", updateTable));
updateTable();
