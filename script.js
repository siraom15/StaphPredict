// === DATA: Positive = true, Negative = false ===
const bacteriaData = {
  "S.aureus": {
    "Gram stain": true, "Motility": false, "Oxidase": false, "Catalase": true,
    "High salt growth": true, "Nitrat Reduction": true, "Acetoin": true,
    "Mannitol fermentation": true, "Growth on BPA": true,
    "Staphyloxanthin": true, "DNase": true, "Coagulase": true
  },
  "S.chromogenes": {
    "Gram stain": true, "Motility": false, "Oxidase": false, "Catalase": true,
    "High salt growth": true, "Nitrat Reduction": true, "Acetoin": false,
    "Mannitol fermentation": true, "Growth on BPA": false,
    "Staphyloxanthin": true, "DNase": false, "Coagulase": false
  },
  "S.epidermidis": {
    "Gram stain": true, "Motility": false, "Oxidase": false, "Catalase": true,
    "High salt growth": true, "Nitrat Reduction": true, "Acetoin": true,
    "Mannitol fermentation": false, "Growth on BPA": false,
    "Staphyloxanthin": false, "DNase": false, "Coagulase": false
  }
};

const tests = Object.keys(bacteriaData["S.aureus"]);

const form = document.getElementById("testForm");
const resultSection = document.getElementById("result");
const barsContainer = document.getElementById("bars");
const predictBtn = document.getElementById("predictBtn");

// Create input fields dynamically (same UI as before)
tests.forEach(test => {
  const field = document.createElement("div");
  field.className = "flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm";
  field.innerHTML = `
    <label class="font-medium text-gray-700">${test}</label>
    <select name="${test}" class="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
      <option value="">--Select--</option>
      <option value="true">Positive</option>
      <option value="false">Negative</option>
    </select>
  `;
  form.appendChild(field);
});

predictBtn.addEventListener("click", () => {
  // Get user input
  const formData = new FormData(form);
  let input = {};
  tests.forEach(t => {
    let val = formData.get(t);
    if (val !== "") input[t] = val === "true";
  });

  // Clear previous results
  barsContainer.innerHTML = "";

  if (Object.keys(input).length === 0) {
    barsContainer.innerHTML = `<p class="text-center text-red-600">Please select at least one test.</p>`;
    resultSection.classList.remove("hidden");
    return;
  }

  // Calculate % match per species
  let scores = {};
  for (const [species, data] of Object.entries(bacteriaData)) {
    let correct = 0, total = 0;
    for (const [test, val] of Object.entries(input)) {
      total++;
      if (data[test] === val) correct++;
    }
    scores[species] = Math.round((correct / total) * 100);
  }

  // Determine best score(s) (may be a tie)
  const maxScore = Math.max(...Object.values(scores));
  const bestSpecies = Object.entries(scores)
    .filter(([_, v]) => v === maxScore)
    .map(([k,_]) => k);

  // Render progress bars
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

  // ===== Create result table (cell-level highlights based on user input) =====
  let table = `
    <div class="overflow-auto mt-8">
      <table class="table-auto w-full border border-gray-300 text-center">
        <thead>
          <tr>
            <th class="border p-2 bg-gray-50">Biochemical test</th>`;

  // Header: highlight header(s) of best-matching species
  for (const species of Object.keys(bacteriaData)) {
    const isBest = bestSpecies.includes(species);
    const headerClass = isBest ? "bg-green-200 font-semibold" : "bg-gray-100";
    // show score under species name
    table += `<th class="border p-2 ${headerClass}">
                <div>${species}</div>
                <div class="text-sm text-gray-600 mt-1">${scores[species]}%</div>
              </th>`;
  }

  table += `</tr></thead><tbody>`;

  // Table body: for each test row, highlight only the cells that match the user's selection for that test
  tests.forEach(test => {
    table += `<tr class="odd:bg-white even:bg-gray-50">
                <td class="border p-2 text-left font-medium">${test}</td>`;

    for (const [species, data] of Object.entries(bacteriaData)) {
      const expected = data[test] ? "Positive" : "Negative";
      // Highlight this cell only if the user provided a value for this test AND it matches the expected value
      const userSelected = input.hasOwnProperty(test);
      const isMatch = userSelected && (data[test] === input[test]);
      const cellClass = isMatch ? "bg-green-100" : "";
      table += `<td class="border p-2 ${cellClass}">${expected}</td>`;
    }

    table += `</tr>`;
  });

  table += `</tbody></table></div>`;

  // Append table after bars
  barsContainer.insertAdjacentHTML("beforeend", table);

  // Reveal results area
  resultSection.classList.remove("hidden");

  // Scroll into view for convenience (nice UX)
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});
