// === DATA ===
// value: "+", "-", or "+/-"  -> when user selects "+" or "-", "+/-" counts as match
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
const resultSection = document.getElementById("result");
const barsContainer = document.getElementById("bars");
const predictBtn = document.getElementById("predictBtn");

// === Build form ===
tests.forEach(test => {
  const field = document.createElement("div");
  field.className = "flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm";
  // for tests that are descriptive text (not +/-, +, -)
  if (bacteriaData["S.aureus"][test] !== "+" &&
      bacteriaData["S.aureus"][test] !== "-" &&
      bacteriaData["S.aureus"][test] !== "+/-") {
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

predictBtn.addEventListener("click", () => {
  const formData = new FormData(form);
  let input = {};
  tests.forEach(t => {
    let val = formData.get(t);
    if (val === "+" || val === "-") input[t] = val;
  });

  barsContainer.innerHTML = "";
  if (Object.keys(input).length === 0) {
    barsContainer.innerHTML = `<p class="text-center text-red-600">Please select at least one test.</p>`;
    resultSection.classList.remove("hidden");
    return;
  }

  // === Scoring ===
  let scores = {};
  for (const [species, data] of Object.entries(bacteriaData)) {
    let correct = 0, total = 0;
    for (const [test, val] of Object.entries(input)) {
      const expected = data[test];
      if (expected === "+" || expected === "-" || expected === "+/-") {
        total++;
        if (expected === "+/-" || expected === val) correct++;
      }
    }
    scores[species] = Math.round((correct / total) * 100);
  }

  const maxScore = Math.max(...Object.values(scores));
  const bestSpecies = Object.entries(scores)
    .filter(([_, v]) => v === maxScore)
    .map(([k,_]) => k);

  // === Render progress bars ===
  for (const [species, percent] of Object.entries(scores)) {
    const bar = document.createElement("div");
    bar.innerHTML = `
      <div class="flex justify-between mb-1">
        <span class="font-medium text-gray-800">${species}</span>
        <span class="text-gray-600">${percent}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-4">
        <div class="bg-blue-600 h-4 rounded-full transition-all duration-700" style="width: ${percent}%"></div>
      </div>
    `;
    barsContainer.appendChild(bar);
  }

  // === Build result table ===
  let table = `
    <div class="overflow-auto mt-8">
      <table class="table-auto w-full border border-gray-300 text-center">
        <thead>
          <tr>
            <th class="border p-2 bg-gray-50">Biochemical test</th>`;
  for (const species of Object.keys(bacteriaData)) {
    const isBest = bestSpecies.includes(species);
    const headerClass = isBest ? "bg-green-200 font-semibold" : "bg-gray-100";
    // set equal width and wrap text
    table += `<th class="border p-2 ${headerClass} w-40 break-words">
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
      if (expected === "+" || expected === "-" || expected === "+/-") {
        isMatch = userSelected && (expected === "+/-" || expected === input[test]);
      }
      const cellClass = isMatch ? "bg-green-100" : "";
      table += `<td class="border p-2 ${cellClass} w-40 break-words">${expected}</td>`;
    }
    table += `</tr>`;
  });

  table += `</tbody></table></div>`;
  barsContainer.insertAdjacentHTML("beforeend", table);
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});
