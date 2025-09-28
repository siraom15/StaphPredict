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

const tests = Object.keys(bacteriaData["S.aureus"]);
const form = document.getElementById("testForm");
const barsContainer = document.getElementById("bars");

// === Build form ===
tests.forEach(test => {
    const field = document.createElement("div");
    field.className = "flex items-center justify-between bg-white p-3 rounded-lg shadow-sm";
    if (!["+", "-", "+/-"].includes(bacteriaData["S.aureus"][test])) {
        field.innerHTML = `
          <label class="font-medium text-gray-700">${test}</label>
          <span class="text-gray-700">${bacteriaData["S.aureus"][test]}</span>
        `;
    } else {
        field.innerHTML = `
          <label class="font-medium text-gray-700">${test}</label>
          <select name="${test}" class="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Select</option>
            <option value="+">+</option>
            <option value="-">-</option>
          </select>
        `;
    }
    form.appendChild(field);
});

// === Update table function ===
function updateTable() {
    const formData = new FormData(form);
    let input = {};
    tests.forEach(t => {
        let val = formData.get(t);
        if (["+", "-"].includes(val)) input[t] = val;
    });

    barsContainer.innerHTML = "";
    if (Object.keys(input).length === 0) {
        barsContainer.innerHTML = `<p class="text-center text-gray-500">Select tests to see predictions.</p>`;
        return;
    }

    // === Scoring ===
    let scores = {};
    for (const [species, data] of Object.entries(bacteriaData)) {
        let correct = 0, total = 0;
        for (const [test, val] of Object.entries(input)) {
            const expected = data[test];
            if (["+", "-", "+/-"].includes(expected)) {
                total++;
                if (expected === "+/-" || expected === val) correct++;
            }
        }
        scores[species] = Math.round((correct / total) * 100);
    }

    const maxScore = Math.max(...Object.values(scores));
    const bestSpecies = Object.entries(scores)
        .filter(([_, v]) => v === maxScore)
        .map(([k, _]) => k);

    // === Render table ===
    let table = `
        <div class="overflow-auto">
          <table class="table-auto w-full border border-gray-300 text-center">
            <thead>
              <tr>
                <th class="border p-2 bg-gray-50">Biochemical test</th>`;
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
        table += `<tr class="odd:bg-white even:bg-gray-50">
                    <td class="border p-2 text-left font-medium">${test}</td>`;
        for (const [species, data] of Object.entries(bacteriaData)) {
            const expected = data[test];
            const userSelected = input.hasOwnProperty(test);
            let isMatch = false;
            if (["+", "-", "+/-"].includes(expected)) {
                isMatch = userSelected && (expected === "+/-" || expected === input[test]);
            }
            const cellClass = isMatch ? "bg-green-100" : "";
            table += `<td class="border p-2 ${cellClass} w-36 break-words">${expected}</td>`;
        }
        table += `</tr>`;
    });

    table += `</tbody></table></div>`;
    barsContainer.innerHTML = table;
}

// === Attach event listeners ===
form.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("change", updateTable);
});

// initial render
updateTable();