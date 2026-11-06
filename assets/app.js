import { serializeEntries } from "./csv-export.js";

const DEFAULT_PRIZES = [
  { label: "Notebook", weight: 30 },
  { label: "Umbrella", weight: 5 },
  { label: "Tote bag", weight: 20 },
  { label: "Pen", weight: 35 },
  { label: "Toiletry bag", weight: 10 }
];
const PREVIOUS_DEFAULT_PRIZE_SETS = [
  [
    { label: "Notebook", weight: 30 },
    { label: "Pen", weight: 35 },
    { label: "Umbrella", weight: 5 },
    { label: "Toiletry bag", weight: 10 },
    { label: "Tote bag", weight: 20 }
  ],
  [
    { label: "Umbrella", weight: 5 },
    { label: "Notebook", weight: 30 },
    { label: "Pen", weight: 35 },
    { label: "Sponge Bag", weight: 10 },
    { label: "Eco bag", weight: 20 }
  ],
  [
    { label: "Umbrella", weight: 10 },
    { label: "Notebook", weight: 30 },
    { label: "Pen", weight: 30 },
    { label: "Sponge Bag", weight: 10 },
    { label: "Eco bag", weight: 20 }
  ]
];
const PREVIOUS_DEFAULT_PRIZES = ["Powerbank", "Executive Pen", "Railway Pin", "Notebook", "Water Bottle", "Tech Pouch"];
const PRIZE_COLORS = ["#304c96", "#087e70", "#234183", "#0b6f63", "#3b5daa"];
    const canvas = document.getElementById("wheelCanvas");
    const ctx = canvas.getContext("2d");
    const labelCanvas = document.getElementById("wheelLabels");
    const labelCtx = labelCanvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const IDLE_WHEEL_CLASS = "wheel-canvas--idle";
    let isSpinning = false;
    let autoResetTimer = null;
    let labelAnimationFrame = null;
    let prizes = DEFAULT_PRIZES.map(prize => ({ ...prize }));
    let wheelSegments = [];
    let totalPrizeWeight = 0;
    let editorPrizes = [];
    let prizeSettingsLoaded = true;
    let entriesAvailable = true;
    let lastLabelAngle = null;

    function currentWheelAngle() {
      const transform = getComputedStyle(canvas).transform;
      if (transform === "none") return 0;
      const matrix = new DOMMatrixReadOnly(transform);
      return (Math.atan2(matrix.b, matrix.a) * 180 / Math.PI + 360) % 360;
    }

    function pauseIdleWheel() {
      const angle = currentWheelAngle();
      canvas.classList.remove(IDLE_WHEEL_CLASS);
      canvas.style.transition = "none";
      canvas.style.transform = `rotate(${angle}deg)`;
      void canvas.offsetWidth;
      return angle;
    }

    function resumeIdleWheel() {
      const angle = currentWheelAngle();
      canvas.classList.remove(IDLE_WHEEL_CLASS);
      canvas.style.transition = "none";
      canvas.style.transform = "";
      canvas.style.setProperty("--idle-start", `${angle}deg`);
      void canvas.offsetWidth;
      if (!prefersReducedMotion.matches) {
        canvas.classList.add(IDLE_WHEEL_CLASS);
      }
    }

    function drawWheel() {
      const radius = canvas.width / 2;
      const activePrizes = prizes.filter(prize => prize.weight > 0);
      totalPrizeWeight = activePrizes.reduce((total, prize) => total + prize.weight, 0);
      wheelSegments = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let segmentStart = 0;
      for (const [index, prize] of activePrizes.entries()) {
        const segmentAngle = 2 * Math.PI * (prize.weight / totalPrizeWeight);
        wheelSegments.push({
          prize,
          startAngle: segmentStart,
          segmentAngle,
          startDegrees: segmentStart * 180 / Math.PI,
          segmentDegrees: segmentAngle * 180 / Math.PI
        });
        ctx.beginPath();
        ctx.fillStyle = PRIZE_COLORS[index % PRIZE_COLORS.length];
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, segmentStart, segmentStart + segmentAngle);
        ctx.lineTo(radius, radius);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        segmentStart += segmentAngle;
      }

      ctx.beginPath();
      ctx.arc(radius, radius, 30, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#23a990";
      ctx.stroke();
      if (activePrizes.length === 0) {
        ctx.fillStyle = "#304c96";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Add a prize", radius, radius + 55);
      }
      lastLabelAngle = null;
      drawWheelLabels();
    }

    function drawWheelLabels() {
      const wheelAngle = currentWheelAngle();
      if (lastLabelAngle !== null && Math.abs((wheelAngle - lastLabelAngle + 540) % 360 - 180) < 0.05) return;
      lastLabelAngle = wheelAngle;

      const radius = labelCanvas.width / 2;
      labelCtx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
      labelCtx.fillStyle = "#ffffff";
      labelCtx.font = "600 17px 'Segoe UI', Arial, sans-serif";
      labelCtx.textAlign = "center";
      labelCtx.textBaseline = "middle";

      for (const segment of wheelSegments) {
        const middleAngle = segment.startAngle + segment.segmentAngle / 2 + wheelAngle * Math.PI / 180;
        const labelRadius = radius * 0.7;
        const availableTextWidth = 2 * labelRadius * Math.sin(Math.min(segment.segmentAngle, Math.PI) / 2) - 12;

        if (availableTextWidth >= 40) {
          const x = radius + Math.cos(middleAngle) * labelRadius;
          const y = radius + Math.sin(middleAngle) * labelRadius;
          labelCtx.fillText(segment.prize.label, x, y, availableTextWidth);
        }
      }
    }

    function animateWheelLabels() {
      labelAnimationFrame = null;
      if (document.hidden) return;

      drawWheelLabels();
      if (isSpinning || (!prefersReducedMotion.matches && canvas.classList.contains(IDLE_WHEEL_CLASS))) {
        labelAnimationFrame = requestAnimationFrame(animateWheelLabels);
      }
    }

    function updateWheelLabelAnimation() {
      const shouldAnimate = !document.hidden &&
        (isSpinning || (!prefersReducedMotion.matches && canvas.classList.contains(IDLE_WHEEL_CLASS)));
      if (shouldAnimate) {
        if (labelAnimationFrame === null) {
          labelAnimationFrame = requestAnimationFrame(animateWheelLabels);
        }
        return;
      }

      if (labelAnimationFrame !== null) {
        cancelAnimationFrame(labelAnimationFrame);
        labelAnimationFrame = null;
      }
      drawWheelLabels();
    }

    const leadForm = document.getElementById("leadForm");
    const participantFormSection = document.getElementById("participantFormSection");
    const submitBtn = document.getElementById("submitBtn");
    const consentCheckbox = document.getElementById("inputConsent");
    const resultSection = document.getElementById("resultSection");
    const prizeDisplay = document.getElementById("prizeDisplay");
    const timerCount = document.getElementById("timerCount");
    const manualResetBtn = document.getElementById("manualResetBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const organizerPanel = document.getElementById("organizerPanel");
    const prizeRows = document.getElementById("prizeRows");
    const settingsMessage = document.getElementById("settingsMessage");
    const weightTotal = document.getElementById("weightTotal");
    const addPrizeBtn = document.getElementById("addPrizeBtn");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    const cancelSettingsBtn = document.getElementById("cancelSettingsBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const clearEntriesBtn = document.getElementById("clearEntriesBtn");
    const entryManagementMessage = document.getElementById("entryManagementMessage");
    const storageMessage = document.getElementById("storageMessage");
    const STORAGE_KEY = "railwaySummit2026Entries";
    const PRIZES_STORAGE_KEY = "railwaySummit2026Prizes";

    function validatePrizes(value) {
      if (!Array.isArray(value) || value.length > 50) {
        throw new Error("Prize settings must contain between 1 and 50 prizes.");
      }

      const validatedPrizes = value.map(prize => {
        if (typeof prize.label !== "string" || !prize.label.trim() ||
            prize.label.trim().length > 60 ||
            typeof prize.weight !== "number" || !Number.isFinite(prize.weight) ||
            prize.weight < 0 || prize.weight > 100) {
          throw new Error("Each prize needs a name and a percentage between 0 and 100.");
        }
        return { label: prize.label.trim(), weight: prize.weight };
      });

      const totalPercentage = validatedPrizes.reduce((total, prize) => total + prize.weight, 0);
      if (Math.abs(totalPercentage - 100) > 0.001) {
        throw new Error(`Prize percentages must total 100%. The current total is ${totalPercentage.toFixed(2)}%.`);
      }
      if (!validatedPrizes.some(prize => prize.weight > 0)) {
        throw new Error("At least one prize must have a weight greater than 0.");
      }
      return validatedPrizes;
    }

    function loadPrizes() {
      const savedPrizes = localStorage.getItem(PRIZES_STORAGE_KEY);
      if (savedPrizes === null) return DEFAULT_PRIZES.map(prize => ({ ...prize }));

      const savedPrizeList = JSON.parse(savedPrizes);
      if (!Array.isArray(savedPrizeList) || savedPrizeList.length === 0 || savedPrizeList.length > 50 ||
          savedPrizeList.some(prize => typeof prize.weight !== "number" || !Number.isFinite(prize.weight) || prize.weight < 0)) {
        throw new Error("Saved prize settings are not in the expected format.");
      }
      const matchesPreviousDefaultWeights = PREVIOUS_DEFAULT_PRIZE_SETS.some(previousPrizes =>
        savedPrizeList.length === previousPrizes.length &&
        savedPrizeList.every((prize, index) =>
          prize.label === previousPrizes[index].label &&
          prize.weight === previousPrizes[index].weight
        )
      );
      const matchesPreviousDefaultNames =
        savedPrizeList.length === PREVIOUS_DEFAULT_PRIZES.length &&
        savedPrizeList.every((prize, index) => prize.label === PREVIOUS_DEFAULT_PRIZES[index]);
      if (matchesPreviousDefaultWeights || matchesPreviousDefaultNames) {
        return DEFAULT_PRIZES.map(prize => ({ ...prize }));
      }
      const savedTotal = savedPrizeList.reduce((total, prize) => total + prize.weight, 0);
      if (savedTotal <= 0) throw new Error("Saved prize percentages must include at least one active prize.");
      if (Math.abs(savedTotal - 100) <= 0.001) return validatePrizes(savedPrizeList);

      const normalizedPrizes = savedPrizeList.map(prize => ({
        ...prize,
        weight: Number(((prize.weight / savedTotal) * 100).toFixed(2))
      }));
      const lastActiveIndex = normalizedPrizes.reduce((lastIndex, prize, index) => prize.weight > 0 ? index : lastIndex, -1);
      const roundedTotal = normalizedPrizes.reduce((total, prize) => total + prize.weight, 0);
      normalizedPrizes[lastActiveIndex].weight = Number((normalizedPrizes[lastActiveIndex].weight + 100 - roundedTotal).toFixed(2));
      return validatePrizes(normalizedPrizes);
    }

    function loadEntries() {
      const savedEntries = localStorage.getItem(STORAGE_KEY);
      if (savedEntries === null) return [];

      const entries = JSON.parse(savedEntries);
      if (!Array.isArray(entries)) {
        throw new Error("Saved entry data is not in the expected format.");
      }
      return entries;
    }

    function updateEntryControls(entryCount) {
      exportCsvBtn.textContent = `Download results CSV (${entryCount})`;
      exportCsvBtn.disabled = entryCount === 0;
      clearEntriesBtn.disabled = entryCount === 0;
    }

    function updateSpinButton() {
      submitBtn.disabled = !prizeSettingsLoaded || !entriesAvailable || isSpinning || !consentCheckbox.checked;
    }

    function showStorageError(message) {
      storageMessage.textContent = message;
      storageMessage.classList.remove("hidden");
    }

    function showSettingsError(message) {
      settingsMessage.textContent = message;
      settingsMessage.classList.remove("hidden");
    }

    function renderPrizeEditor() {
      prizeRows.replaceChildren();
      editorPrizes.forEach((prize, index) => {
        const row = document.createElement("div");
        row.className = "settings-row";

        const nameField = document.createElement("label");
        nameField.className = "settings-label";
        nameField.textContent = "Prize name";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.maxLength = 60;
        nameInput.required = true;
        nameInput.value = prize.label;
        nameInput.dataset.field = "label";
        nameInput.className = "settings-input";
        nameField.appendChild(nameInput);

        const weightField = document.createElement("label");
        weightField.className = "settings-label";
        weightField.textContent = "Chance (%)";
        const weightInput = document.createElement("input");
        weightInput.type = "number";
        weightInput.min = "0";
        weightInput.max = "100";
        weightInput.step = "0.01";
        weightInput.required = true;
        weightInput.value = Number(prize.weight.toFixed(2));
        weightInput.dataset.field = "weight";
        weightInput.className = "settings-input";
        weightInput.addEventListener("input", updateWeightTotal);
        weightField.appendChild(weightInput);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", `Remove ${prize.label}`);
        removeButton.className = "remove-prize-button";
        removeButton.addEventListener("click", () => {
          if (editorPrizes.length === 1) {
            showSettingsError("Keep at least one prize in the list. Set its weight to 0 to temporarily disable it when another prize is available.");
            return;
          }
          editorPrizes.splice(index, 1);
          settingsMessage.classList.add("hidden");
          renderPrizeEditor();
        });

        row.append(nameField, weightField, removeButton);
        prizeRows.appendChild(row);
      });
      updateWeightTotal();
    }

    function updateWeightTotal() {
      const total = Array.from(prizeRows.children).reduce((sum, row) => {
        const weightInput = row.querySelector('[data-field="weight"]');
        return sum + (weightInput.value.trim() ? Number(weightInput.value) : 0);
      }, 0);
      weightTotal.textContent = `Total chance: ${total.toFixed(2)}%`;
      weightTotal.classList.toggle("weight-total--error", Math.abs(total - 100) > 0.001);
    }

    function closeSettings() {
      organizerPanel.classList.add("hidden");
      settingsBtn.setAttribute("aria-expanded", "false");
      settingsMessage.classList.add("hidden");
      editorPrizes = [];
      drawWheel();
    }

    settingsBtn.addEventListener("click", () => {
      if (isSpinning) return;
      const isOpening = organizerPanel.classList.contains("hidden");
      if (isOpening) {
        editorPrizes = prizes.map(prize => ({ ...prize }));
        renderPrizeEditor();
        organizerPanel.classList.remove("hidden");
      } else {
        closeSettings();
      }
      settingsBtn.setAttribute("aria-expanded", String(isOpening));
    });

    addPrizeBtn.addEventListener("click", () => {
      if (editorPrizes.length >= 50) {
        showSettingsError("The wheel can have at most 50 prizes.");
        return;
      }
      editorPrizes.push({ label: "New prize", weight: 0 });
      settingsMessage.classList.add("hidden");
      renderPrizeEditor();
    });

    saveSettingsBtn.addEventListener("click", () => {
      if (isSpinning) return;
      try {
        const updatedPrizes = Array.from(prizeRows.children, row => {
          const weightValue = row.querySelector('[data-field="weight"]').value;
          if (!weightValue.trim()) throw new Error("Enter a percentage for each prize.");
          return {
            label: row.querySelector('[data-field="label"]').value,
            weight: Number(weightValue)
          };
        });
        const validatedPrizes = validatePrizes(updatedPrizes);
        localStorage.setItem(PRIZES_STORAGE_KEY, JSON.stringify(validatedPrizes));
        prizes = validatedPrizes;
        prizeSettingsLoaded = true;
        updateSpinButton();
        closeSettings();
      } catch (error) {
        showSettingsError(error instanceof SyntaxError
          ? "Could not read the saved prize settings. Please check the browser's saved data."
          : error.message || "Could not save prize settings.");
        console.error("Prize settings save error:", error);
      }
    });

    cancelSettingsBtn.addEventListener("click", closeSettings);

    function handleMotionPreferenceChange() {
      if (prefersReducedMotion.matches) {
        canvas.classList.remove(IDLE_WHEEL_CLASS);
      } else if (!isSpinning) {
        resumeIdleWheel();
      }
      updateWheelLabelAnimation();
    }

    prefersReducedMotion.addEventListener("change", handleMotionPreferenceChange);
    document.addEventListener("visibilitychange", updateWheelLabelAnimation);

    try {
      prizes = loadPrizes();
    } catch (error) {
      prizeSettingsLoaded = false;
      showStorageError("Could not load the saved prize settings. Do not collect entries until the wheel settings are corrected.");
      console.error("Prize settings load error:", error);
    }
    drawWheel();
    updateWheelLabelAnimation();
    function saveEntries(entries) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      entriesAvailable = true;
      updateEntryControls(entries.length);
    }

    function exportEntries() {
      try {
        const entries = loadEntries();
        if (entries.length === 0) return;

        const csv = serializeEntries(entries);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = `railway-summit-spins-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      } catch (error) {
        showStorageError("Could not export the saved entries. Keep this browser open and contact the event administrator.");
        console.error("CSV export error:", error);
      }
    }

    try {
      updateEntryControls(loadEntries().length);
    } catch (error) {
      entriesAvailable = false;
      showStorageError("Could not read saved entries from this browser. Do not continue collecting entries until the data issue is resolved.");
      console.error("Saved entry read error:", error);
    }
    updateSpinButton();
    consentCheckbox.addEventListener("change", updateSpinButton);

    exportCsvBtn.addEventListener("click", exportEntries);

    clearEntriesBtn.addEventListener("click", function () {
      try {
        const entries = loadEntries();
        if (entries.length === 0) {
          updateEntryControls(0);
          return;
        }
        if (!window.confirm(`Permanently remove ${entries.length} saved ${entries.length === 1 ? "entry" : "entries"} from this browser? Downloaded CSV copies will not be affected.`)) {
          return;
        }

        localStorage.removeItem(STORAGE_KEY);
        entriesAvailable = true;
        updateEntryControls(0);
        entryManagementMessage.textContent = "Saved entries were cleared from this browser. Downloaded CSV copies were not affected.";
        entryManagementMessage.classList.remove("hidden");
        storageMessage.classList.add("hidden");
      } catch (error) {
        showStorageError("Could not clear the saved entries from this browser. Contact the event administrator.");
        console.error("Saved entry deletion error:", error);
      }
    });

    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isSpinning) return;
      if (!prizeSettingsLoaded) {
        showStorageError("Could not load the saved prize settings. Open Wheel Setup and save valid settings before spinning.");
        return;
      }

      const name = document.getElementById("inputName").value.trim();
      const email = document.getElementById("inputEmail").value.trim();
      const company = document.getElementById("inputCompany").value.trim();
      const consent = consentCheckbox.checked;

      if (wheelSegments.length === 0 || !Number.isFinite(totalPrizeWeight)) {
        showStorageError("No valid prizes are available. Open Wheel Setup and correct the prize weights before spinning.");
        return;
      }
      let weightedPick = Math.random() * totalPrizeWeight;
      const winningIndex = wheelSegments.findIndex(({ prize }) => {
        weightedPick -= prize.weight;
        return weightedPick < 0;
      });
      const selectedIndex = winningIndex === -1 ? wheelSegments.length - 1 : winningIndex;
      const selectedSegment = wheelSegments[selectedIndex];
      const wonPrize = selectedSegment.prize.label;
      const entry = {
        timestamp: new Date().toISOString(),
        name,
        email,
        company,
        prize: wonPrize,
        marketingConsent: consent
      };
      try {
        saveEntries([...loadEntries(), entry]);
        storageMessage.classList.add("hidden");
      } catch (error) {
        showStorageError("Could not save this entry in the browser. The wheel was not spun; contact the event administrator.");
        console.error("Browser entry save error:", error);
        return;
      }

      isSpinning = true;
      updateSpinButton();
      updateWheelLabelAnimation();
      manualResetBtn.disabled = true;

      const currentAngle = pauseIdleWheel();
      const extraSpins = 5;
      const targetDeg = (360 - ((currentAngle + selectedSegment.startDegrees + (selectedSegment.segmentDegrees / 2)) % 360)) % 360;
      const totalRotationDeg = currentAngle + (extraSpins * 360) + targetDeg;
      const spinDuration = prefersReducedMotion.matches ? 250 : 8000;

      settingsBtn.disabled = true;
      canvas.style.transition = `transform ${spinDuration}ms cubic-bezier(0.2, 0.8, 0.25, 1)`;
      canvas.style.transform = `rotate(${totalRotationDeg}deg)`;

      setTimeout(() => {
        isSpinning = false;
        updateSpinButton();
        updateWheelLabelAnimation();
        manualResetBtn.disabled = false;
        settingsBtn.disabled = false;
        prizeDisplay.textContent = wonPrize;
        participantFormSection.classList.add("hidden");
        resultSection.classList.remove("hidden");

        let countdown = 12;
        timerCount.textContent = countdown;
        autoResetTimer = setInterval(() => {
          countdown--;
          timerCount.textContent = countdown;
          if (countdown <= 0) {
            resetApp();
          }
        }, 1000);
      }, spinDuration + 200);
    });

    function resetApp() {
      if (isSpinning) return;
      if (autoResetTimer) clearInterval(autoResetTimer);
      leadForm.reset();
      resumeIdleWheel();
      resultSection.classList.add("hidden");
      participantFormSection.classList.remove("hidden");
      isSpinning = false;
      updateSpinButton();
      updateWheelLabelAnimation();
    }

    manualResetBtn.addEventListener("click", resetApp);
