(function () {
  const screens = Array.from(document.querySelectorAll(".screen"));
  const routeButtons = Array.from(document.querySelectorAll("[data-route]"));

  function navigateTo(screenName) {
    screens.forEach((screen) => {
      screen.hidden = screen.dataset.screen !== screenName;
    });
  }

  routeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo(button.dataset.route);
    });
  });

  const ppdInput = document.getElementById("ppd");
  const distanceInput = document.getElementById("distance");
  const dynoHInput = document.getElementById("dyno-h");
  const ppvResult = document.getElementById("ppv-result");
  const calcButton = document.getElementById("calculate-ppv");

  const siteCurrentFactorInput = document.getElementById("site-current-factor");
  const siteActualPpvInput = document.getElementById("site-actual-ppv");
  const siteExpectedPpvInput = document.getElementById("site-expected-ppv");
  const siteFactorResult = document.getElementById("site-factor-result");
  const calculateSiteFactorButton = document.getElementById("calculate-site-factor");

  const empiricalRockTypeInput = document.getElementById("emp-rock-type");
  const empiricalFaceHeightInput = document.getElementById("emp-face-height");
  const empiricalDhInput = document.getElementById("emp-dh");
  const empiricalPatternTypeInput = document.getElementById("emp-pattern-type");
  const empiricalWarning = document.getElementById("emp-warning");
  const empiricalBurden = document.getElementById("emp-burden");
  const empiricalSpacing = document.getElementById("emp-spacing");
  const empiricalRatio = document.getElementById("emp-ratio");
  const empiricalBand = document.getElementById("emp-band");
  const empiricalConstant = document.getElementById("emp-constant");
  const empiricalPf = document.getElementById("emp-pf");
  const empiricalSubdrill = document.getElementById("emp-subdrill");
  const empiricalStemming = document.getElementById("emp-stemming");
  const calculateEmpiricalButton = document.getElementById("calculate-empirical");

  const referencesStatus = document.getElementById("references-status");
  const referenceLinks = Array.from(document.querySelectorAll('[data-screen="references"] a'));

  const gasUnitsInput = document.getElementById("gas-units");
  const gasWetHoleInput = document.getElementById("gas-wet-hole");
  const gasAltNeededInput = document.getElementById("gas-alt-needed");
  const gasHoleDiameterInput = document.getElementById("gas-hole-diameter");
  const gasHoleDepthInput = document.getElementById("gas-hole-depth");
  const gasAltDiameterInput = document.getElementById("gas-alt-diameter");
  const gasBottomColumnInput = document.getElementById("gas-bottom-column");
  const gasTopColumnInput = document.getElementById("gas-top-column");
  const gasBottomDensityInput = document.getElementById("gas-bottom-density");
  const gasTopDensityInput = document.getElementById("gas-top-density");

  const gasAvgDensityBottomOut = document.getElementById("gas-avg-density-bottom");
  const gasAvgDensityTopOut = document.getElementById("gas-avg-density-top");
  const gasBottomDensityBottomOut = document.getElementById("gas-bottom-density-bottom");
  const gasBottomDensityTopOut = document.getElementById("gas-bottom-density-top");
  const gasPoundsBottomOut = document.getElementById("gas-pounds-bottom");
  const gasPoundsTopOut = document.getElementById("gas-pounds-top");
  const gasResult = document.getElementById("gas-result");
  const gasStatus = document.getElementById("gas-status");
  const gasAsLoadedChart = document.getElementById("gas-as-loaded-chart");
  const gasFinalChart = document.getElementById("gas-final-chart");
  const gasRise = document.getElementById("gas-rise");
  const gasReloadTemplateButton = document.getElementById("gas-reload-template");
  const gasCalculateButton = document.getElementById("gas-calculate");

  let gassingTemplateValues = {};
  let gassingFormulaMap = {};

  function parseValue(el) {
    if (!el) return 0;
    const value = Number.parseFloat(el.value);
    return Number.isFinite(value) ? value : 0;
  }

  function asFloat(value) {
    const n = Number.parseFloat(String(value));
    return Number.isFinite(n) ? n : 0;
  }

  function asBool(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const s = value.trim().toUpperCase();
      return ["TRUE", "1", "YES", "Y"].includes(s);
    }
    return Boolean(value);
  }

  function formatPpvResult(dynoPpv, usbmPpv, highestExpectedPpv, scaleDistance) {
    return [
      `Dyno PPV: ${dynoPpv.toFixed(4)} in/sec`,
      `USBM PPV: ${usbmPpv.toFixed(4)} in/sec`,
      `Highest Expected PPV: ${highestExpectedPpv.toFixed(4)} in/sec`,
      `Scale Distance: ${scaleDistance.toFixed(4)}`,
    ].join("\n");
  }

  function calculatePpv() {
    const w = parseValue(ppdInput);
    const d = parseValue(distanceInput);
    const dynoHFactor = parseValue(dynoHInput);

    if (w <= 0 || d <= 0) {
      ppvResult.textContent = "Enter Pounds per Delay and Distance to Seismograph before calculating.";
      return;
    }

    const sqrtScaledRatio = Math.sqrt(w) / d;
    const sd = d / Math.sqrt(w);
    const dynoPpv = dynoHFactor * (sqrtScaledRatio ** 1.6);
    const usbmBestFitPpv = 119.0 * (sd ** -1.52);
    const quarryUpperBoundPpv = 138.0 * (sd ** -1.38);

    ppvResult.textContent = formatPpvResult(dynoPpv, usbmBestFitPpv, quarryUpperBoundPpv, sd);
  }

  function calculateAdjustedSiteFactor() {
    const current = parseValue(siteCurrentFactorInput);
    const actual = parseValue(siteActualPpvInput);
    const expected = parseValue(siteExpectedPpvInput);

    if (expected <= 0) {
      siteFactorResult.textContent = "Adjusted factor: enter Expected PPV > 0";
      return;
    }

    const adjusted = current * (actual / expected);
    siteFactorResult.textContent = `Adjusted factor: ${Math.round(adjusted)}`;
  }

  function getEmpiricalBandAndConstant(ratioR, rockType) {
    const granite = { A: 1200, B: 906, C: 806, D: 484, E: 282 };
    const limestone = { A: 1560, B: 1177, C: 1047, D: 629, E: 366 };
    const constants = rockType === "Granite/Hard Limestone" ? granite : limestone;
    if (ratioR >= 13.23) return { band: "A", constant: constants.A, belowRange: false };
    if (ratioR >= 9.45) return { band: "B", constant: constants.B, belowRange: false };
    if (ratioR >= 4.8) return { band: "C", constant: constants.C, belowRange: false };
    if (ratioR >= 2.62) return { band: "D", constant: constants.D, belowRange: false };
    if (ratioR >= 1.84) return { band: "E", constant: constants.E, belowRange: false };
    return { band: "E", constant: constants.E, belowRange: true };
  }

  function rectangularK(rockType) {
    return rockType === "Granite/Hard Limestone" ? 0.85 : 0.93;
  }

  function resetEmpiricalOutputs() {
    empiricalBurden.textContent = "--";
    empiricalSpacing.textContent = "--";
    empiricalRatio.textContent = "--";
    empiricalBand.textContent = "--";
    empiricalConstant.textContent = "--";
    empiricalPf.textContent = "--";
    empiricalSubdrill.textContent = "--";
    empiricalStemming.textContent = "--";
  }

  function calculateEmpirical() {
    const rockType = empiricalRockTypeInput.value;
    const faceHeight = parseValue(empiricalFaceHeightInput);
    const dh = parseValue(empiricalDhInput);
    const patternType = empiricalPatternTypeInput.value;

    if (dh <= 0 || faceHeight <= 0) {
      empiricalWarning.textContent = "Face height and Dh must be greater than 0.";
      resetEmpiricalOutputs();
      return;
    }

    const ratioR = faceHeight / dh;
    const empirical = getEmpiricalBandAndConstant(ratioR, rockType);
    const patternFootage = ((dh / 12) ** 2) * empirical.constant;
    const base = Math.sqrt(patternFootage);
    const burden = patternType === "Square" ? base : rectangularK(rockType) * base;
    const spacing = burden > 0 ? patternFootage / burden : 0;
    const subdrill = 0.3 * burden;
    const stemming = empirical.band === "E" ? 0.7 * faceHeight : 0.7 * burden;

    empiricalWarning.textContent = empirical.belowRange
      ? "Ratio below empirical table range; Band E used as fallback."
      : "";
    empiricalBurden.textContent = burden.toFixed(3);
    empiricalSpacing.textContent = spacing.toFixed(3);
    empiricalRatio.textContent = ratioR.toFixed(3);
    empiricalBand.textContent = empirical.band;
    empiricalConstant.textContent = String(empirical.constant);
    empiricalPf.textContent = `${patternFootage.toFixed(3)} ft^2`;
    empiricalSubdrill.textContent = `${subdrill.toFixed(3)} ft`;
    empiricalStemming.textContent = `${stemming.toFixed(3)} ft`;
  }

  function colToNum(col) {
    let n = 0;
    for (let i = 0; i < col.length; i += 1) {
      n = n * 26 + (col.charCodeAt(i) - 64);
    }
    return n;
  }

  function numToCol(n) {
    let out = "";
    let value = n;
    while (value > 0) {
      const rem = (value - 1) % 26;
      out = String.fromCharCode(65 + rem) + out;
      value = Math.floor((value - 1) / 26);
    }
    return out;
  }

  function splitRef(ref) {
    const m = ref.match(/^(\$?)([A-Z]{1,3})(\$?)(\d+)$/);
    if (!m) return null;
    return {
      absCol: m[1] === "$",
      col: m[2],
      absRow: m[3] === "$",
      row: Number.parseInt(m[4], 10),
    };
  }

  class FormulaParser {
    constructor(text, getCell, getRange) {
      this.tokens = this.tokenize(text || "");
      this.pos = 0;
      this.getCell = getCell;
      this.getRange = getRange;
    }

    tokenize(text) {
      const src = String(text).replace(/^=/, "").replace(/\s+/g, "");
      const pattern = /"[^"]*"|<=|>=|<>|[=+\-*/^(),:]|\$?[A-Z]{1,3}\$?\d+|[A-Z_][A-Z0-9_.]*|\d+\.\d+|\d+/g;
      return src.match(pattern) || [];
    }

    peek() {
      return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
    }

    take() {
      const token = this.peek();
      this.pos += 1;
      return token;
    }

    accept(value) {
      if (this.peek() === value) {
        this.pos += 1;
        return true;
      }
      return false;
    }

    parse() {
      if (this.tokens.length === 0) return "";
      return this.comparison();
    }

    comparison() {
      let left = this.add();
      while (["=", "<>", "<", ">", "<=", ">="].includes(this.peek())) {
        const op = this.take();
        const right = this.add();
        left = this.cmp(op, left, right);
      }
      return left;
    }

    add() {
      let left = this.mul();
      while (["+", "-"].includes(this.peek())) {
        const op = this.take();
        const right = this.mul();
        left = op === "+" ? this.num(left) + this.num(right) : this.num(left) - this.num(right);
      }
      return left;
    }

    mul() {
      let left = this.pow();
      while (["*", "/"].includes(this.peek())) {
        const op = this.take();
        const right = this.pow();
        if (op === "*") {
          left = this.num(left) * this.num(right);
        } else {
          const d = this.num(right);
          left = d !== 0 ? this.num(left) / d : 0;
        }
      }
      return left;
    }

    pow() {
      let left = this.unary();
      while (this.peek() === "^") {
        this.take();
        const right = this.unary();
        left = this.num(left) ** this.num(right);
      }
      return left;
    }

    unary() {
      if (this.accept("+")) return this.num(this.unary());
      if (this.accept("-")) return -this.num(this.unary());
      return this.primary();
    }

    primary() {
      const token = this.peek();
      if (token == null) return "";
      if (token === "(") {
        this.take();
        const value = this.comparison();
        this.accept(")");
        return value;
      }
      if (token.startsWith('"') && token.endsWith('"')) {
        this.take();
        return token.slice(1, -1);
      }
      if (/^\d+\.\d+$|^\d+$/.test(token)) {
        this.take();
        return Number.parseFloat(token);
      }
      if (["TRUE", "FALSE"].includes(token.toUpperCase())) {
        this.take();
        return token.toUpperCase() === "TRUE";
      }
      if (/^\$?[A-Z]{1,3}\$?\d+$/.test(token)) {
        const ref1 = this.take().replace(/\$/g, "");
        if (this.accept(":")) {
          const ref2 = (this.take() || "").replace(/\$/g, "");
          return this.getRange(ref1, ref2);
        }
        return this.getCell(ref1);
      }
      if (/^[A-Z_][A-Z0-9_.]*$/i.test(token)) {
        const name = this.take().toUpperCase();
        if (this.accept("(")) {
          const args = [];
          if (this.peek() !== ")") {
            while (true) {
              args.push(this.comparison());
              if (!this.accept(",")) break;
            }
          }
          this.accept(")");
          return this.call(name, args);
        }
        return name;
      }
      this.take();
      return "";
    }

    call(name, args) {
      if (name === "IF") {
        const cond = args.length > 0 ? this.bool(args[0]) : false;
        const yes = args.length > 1 ? args[1] : "";
        const no = args.length > 2 ? args[2] : "";
        return cond ? yes : no;
      }
      if (name === "OR") {
        return args.some((a) => this.bool(a));
      }
      if (name === "INDEX") {
        if (args.length < 2) return 0;
        const arr = args[0];
        const r = Math.trunc(this.num(args[1]));
        const c = args.length > 2 ? Math.trunc(this.num(args[2])) : 1;
        if (!Array.isArray(arr) || arr.length === 0) return 0;
        const rr = r - 1;
        const cc = c - 1;
        if (rr < 0 || rr >= arr.length) return 0;
        const row = arr[rr];
        if (!Array.isArray(row) || cc < 0 || cc >= row.length) return 0;
        return row[cc];
      }
      return 0;
    }

    num(value) {
      if (typeof value === "boolean") return value ? 1 : 0;
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (value === "" || value == null) return 0;
      const n = Number.parseFloat(String(value));
      return Number.isFinite(n) ? n : 0;
    }

    bool(value) {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0;
      if (typeof value === "string") {
        const s = value.trim().toUpperCase();
        if (["", "FALSE", "0"].includes(s)) return false;
        if (["TRUE", "1"].includes(s)) return true;
      }
      return Boolean(value);
    }

    cmp(op, left, right) {
      let a;
      let b;
      if (typeof left === "string" || typeof right === "string") {
        a = String(left);
        b = String(right);
      } else {
        a = this.num(left);
        b = this.num(right);
      }
      if (op === "=") return a === b;
      if (op === "<>") return a !== b;
      if (op === "<") return a < b;
      if (op === ">") return a > b;
      if (op === "<=") return a <= b;
      if (op === ">=") return a >= b;
      return false;
    }
  }

  function drawStackedChart(container, values, colors, labels) {
    container.innerHTML = "";
    const positive = values.map((v) => Math.max(0, v));
    const total = positive.reduce((sum, v) => sum + v, 0);
    if (total <= 0) {
      const p = document.createElement("p");
      p.className = "body-text";
      p.textContent = "No data";
      container.appendChild(p);
      return;
    }

    const targetHeight = 240;
    for (let i = positive.length - 1; i >= 0; i -= 1) {
      const val = positive[i];
      if (val <= 0) continue;
      const seg = document.createElement("div");
      seg.className = "stack-segment";
      seg.style.backgroundColor = colors[i];
      seg.style.minHeight = `${Math.max(20, Math.round((val / total) * targetHeight))}px`;
      seg.title = `${labels[i]}: ${val.toFixed(4)}`;
      seg.textContent = `${labels[i]} ${val.toFixed(2)}`;
      container.appendChild(seg);
    }
  }

  function buildRuntimeValues() {
    const values = { ...gassingTemplateValues };
    values.T3 = Number.parseInt(gasUnitsInput.value, 10);
    values.O10 = gasWetHoleInput.checked;
    values.Q10 = gasAltNeededInput.checked;
    values.P3 = parseValue(gasHoleDiameterInput);
    values.C9 = parseValue(gasHoleDepthInput);
    values.E8 = parseValue(gasAltDiameterInput);
    values.C13 = parseValue(gasBottomColumnInput);
    values.D13 = 0;
    values.E13 = 0;
    values.F13 = parseValue(gasTopColumnInput);
    values.C14 = parseValue(gasBottomDensityInput);
    values.D14 = 0;
    values.E14 = 0;
    values.F14 = parseValue(gasTopDensityInput);
    return values;
  }

  function calculateGassing() {
    const values = buildRuntimeValues();
    const runtimeFormulas = { ...gassingFormulaMap };

    if (!gasAltNeededInput.checked) {
      delete runtimeFormulas.P3;
      values.P3 = parseValue(gasHoleDiameterInput);
      values.Q10 = false;
    } else {
      values.Q10 = true;
    }

    const cache = {};
    const visiting = new Set();

    function getCell(ref) {
      if (Object.hasOwn(cache, ref)) return cache[ref];
      if (visiting.has(ref)) return values[ref] ?? 0;
      if (Object.hasOwn(runtimeFormulas, ref)) {
        visiting.add(ref);
        const parser = new FormulaParser(runtimeFormulas[ref], getCell, getRange);
        let result;
        try {
          result = parser.parse();
        } catch (_err) {
          result = values[ref] ?? 0;
        }
        visiting.delete(ref);
        cache[ref] = result;
        values[ref] = result;
        return result;
      }
      return values[ref] ?? 0;
    }

    function getRange(startRef, endRef) {
      const s = splitRef(startRef);
      const e = splitRef(endRef);
      if (!s || !e) return [[0]];
      const sc = colToNum(s.col);
      const ec = colToNum(e.col);
      const sr = s.row;
      const er = e.row;
      const rowStep = er >= sr ? 1 : -1;
      const colStep = ec >= sc ? 1 : -1;
      const out = [];
      for (let r = sr; rowStep > 0 ? r <= er : r >= er; r += rowStep) {
        const rowVals = [];
        for (let c = sc; colStep > 0 ? c <= ec : c >= ec; c += colStep) {
          rowVals.push(getCell(`${numToCol(c)}${r}`));
        }
        out.push(rowVals);
      }
      return out;
    }

    Object.keys(runtimeFormulas).forEach((ref) => {
      getCell(ref);
    });

    const avgDensityBottom = asFloat(values.C16).toFixed(2);
    const avgDensityTop = asFloat(values.F16).toFixed(2);
    const bottomDensityBottom = asFloat(values.C17).toFixed(2);
    const bottomDensityTop = asFloat(values.F17).toFixed(2);
    const poundsBottom = String(Math.round(asFloat(values.C19)));
    const poundsTop = String(Math.round(asFloat(values.F19)));
    gasAvgDensityBottomOut.textContent = avgDensityBottom;
    gasAvgDensityTopOut.textContent = avgDensityTop;
    gasBottomDensityBottomOut.textContent = bottomDensityBottom;
    gasBottomDensityTopOut.textContent = bottomDensityTop;
    gasPoundsBottomOut.textContent = poundsBottom;
    gasPoundsTopOut.textContent = poundsTop;

    let asLoadedValues = ["U20", "U19", "U18", "U17", "U16"].map((ref) => asFloat(values[ref]));
    if (asLoadedValues.map((v) => Math.max(0, v)).reduce((a, b) => a + b, 0) <= 0) {
      asLoadedValues = ["R20", "R19", "R18", "R17", "R16"].map((ref) => asFloat(values[ref]));
    }
    if (asLoadedValues.map((v) => Math.max(0, v)).reduce((a, b) => a + b, 0) <= 0) {
      if (Number.parseInt(values.T3, 10) === 1) {
        asLoadedValues = ["Q20", "Q19", "Q18", "Q17", "Q16"].map((ref) => asFloat(values[ref]));
      } else {
        asLoadedValues = ["P20", "P19", "P18", "P17", "P16"].map((ref) => asFloat(values[ref]));
      }
    }
    if (asLoadedValues.map((v) => Math.max(0, v)).reduce((a, b) => a + b, 0) <= 0) {
      asLoadedValues = ["U20", "U19", "U18", "U17", "U16"].map((ref) => asFloat(gassingTemplateValues[ref]));
    }

    const finalValues = [
      asFloat(values.C13),
      asFloat(values.D13),
      asFloat(values.E13),
      asFloat(values.F13),
      asFloat(values.S16),
    ];

    const chartLabels = ["Unloaded Collar", "Top", "Bottom"];
    const chartColors = ["#38bdf8", "#ef4444", "#22c55e"];
    const asLoadedTop = asLoadedValues[0] + asLoadedValues[1];
    const asLoadedBottom = asLoadedValues[3] + asLoadedValues[2];
    const finalTop = finalValues[3] + finalValues[2];
    const finalBottom = finalValues[0] + finalValues[1];
    const asLoadedChartValues = [asLoadedValues[4], asLoadedTop, asLoadedBottom];
    const finalChartValues = [finalValues[4], finalTop, finalBottom];
    drawStackedChart(gasAsLoadedChart, asLoadedChartValues, chartColors, chartLabels);
    drawStackedChart(gasFinalChart, finalChartValues, chartColors, chartLabels);

    const rise = asLoadedValues[4] - finalValues[4];
    gasRise.textContent = rise.toFixed(2);

    let holeAvgDensity = asFloat(values.G20);
    if (holeAvgDensity === 0) {
      const lengths = ["C", "D", "E", "F"].map((col) => asFloat(values[`${col}13`]));
      const densities = ["C", "D", "E", "F"].map((col) => asFloat(values[`${col}16`]));
      const totalLength = lengths.reduce((a, b) => a + b, 0);
      if (totalLength > 0) {
        holeAvgDensity = lengths.reduce((sum, len, idx) => sum + (len * densities[idx]), 0) / totalLength;
      }
    }

    let totalPounds = asFloat(values.G19);
    if (totalPounds === 0) {
      totalPounds = ["C", "D", "E", "F"].reduce((sum, col) => sum + asFloat(values[`${col}19`]), 0);
    }

    gasResult.textContent = `Hole Average Density: ${holeAvgDensity.toFixed(2)}\nTotal Pounds for Hole: ${totalPounds.toFixed(2)}`;
    gasStatus.textContent = "";
  }

  function applyGassingTemplateDefaults() {
    gasHoleDiameterInput.value = asFloat(gassingTemplateValues.P3 || 4.5);
    gasHoleDepthInput.value = asFloat(gassingTemplateValues.C9 || 38);
    gasAltDiameterInput.value = asFloat(gassingTemplateValues.E8 || 5.75);
    gasBottomColumnInput.value = asFloat(gassingTemplateValues.C13 || 29);
    gasTopColumnInput.value = asFloat(gassingTemplateValues.F13 || 0);
    gasBottomDensityInput.value = asFloat(gassingTemplateValues.C14 || 1.1);
    gasTopDensityInput.value = asFloat(gassingTemplateValues.F14 || 0);

    gasUnitsInput.value = Number.parseInt(gassingTemplateValues.T3, 10) === 1 ? "1" : "2";
    gasWetHoleInput.checked = asBool(gassingTemplateValues.O10);
    gasAltNeededInput.checked = asBool(gassingTemplateValues.Q10);
    gasAltDiameterInput.disabled = !gasAltNeededInput.checked;
  }

  async function loadGassingTemplate() {
    gasStatus.textContent = "Loading workbook template...";
    try {
      const response = await fetch("./data/gassing-template.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      gassingTemplateValues = payload.values || {};
      gassingFormulaMap = payload.formulas || {};
      applyGassingTemplateDefaults();
      gasStatus.textContent = "Workbook template loaded.";
    } catch (err) {
      gassingTemplateValues = {};
      gassingFormulaMap = {};
      gasStatus.textContent = `Workbook template not loaded: ${String(err)}`;
    }
  }

  referenceLinks.forEach((link) => {
    link.addEventListener("click", () => {
      referencesStatus.textContent = `Opened: ${link.textContent.trim()}`;
    });
  });

  calcButton.addEventListener("click", calculatePpv);
  calculateSiteFactorButton.addEventListener("click", calculateAdjustedSiteFactor);
  calculateEmpiricalButton.addEventListener("click", calculateEmpirical);

  gasAltNeededInput.addEventListener("change", () => {
    gasAltDiameterInput.disabled = !gasAltNeededInput.checked;
  });
  gasReloadTemplateButton.addEventListener("click", loadGassingTemplate);
  gasCalculateButton.addEventListener("click", calculateGassing);

  loadGassingTemplate();
  navigateTo("start");
})();
