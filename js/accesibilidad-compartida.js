(function () {
    const storageKey = "coloresCreaciones.accessibility.v1";
    const colors = ["normal", "protanopia", "deuteranopia", "tritanopia"];
    const contrasts = ["normal", "high", "dark", "enhanced"];
    const defaults = {
        version: 1,
        colorMode: "normal",
        contrastMode: "normal",
        fontPercent: 100,
        pageZoom: 1,
        dyslexia: false,
        focus: false,
        cursor: false
    };
    const page = document.querySelector(".a11y-page") || document.body;
    const preferenceStatus = document.getElementById("a11y-preference-status");

    page.classList.add("a11y-page");

    function reportStorageError(action, error) {
        const message = "No se pudo " + action + " las preferencias de accesibilidad.";
        console.error(message, error);
        if (preferenceStatus) {
            preferenceStatus.textContent = message;
        }
    }

    function validatePreferences(value) {
        if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1) {
            throw new TypeError("El formato de preferencias guardado no es válido.");
        }
        if (!colors.includes(value.colorMode) || !contrasts.includes(value.contrastMode)) {
            throw new TypeError("El modo de color o contraste guardado no es válido.");
        }
        if (!Number.isInteger(value.fontPercent) || value.fontPercent < 80 || value.fontPercent > 200 || value.fontPercent % 10 !== 0) {
            throw new TypeError("El tamaño de texto guardado no es válido.");
        }
        if (typeof value.pageZoom !== "number" || value.pageZoom < 1 || value.pageZoom > 1.3 ||
            Math.round(value.pageZoom * 10) !== value.pageZoom * 10) {
            throw new TypeError("La ampliación guardada no es válida.");
        }
        ["dyslexia", "focus", "cursor"].forEach(function (key) {
            if (typeof value[key] !== "boolean") {
                throw new TypeError("La preferencia " + key + " no es válida.");
            }
        });
        return {
            version: 1,
            colorMode: value.colorMode,
            contrastMode: value.contrastMode,
            fontPercent: value.fontPercent,
            pageZoom: value.pageZoom,
            dyslexia: value.dyslexia,
            focus: value.focus,
            cursor: value.cursor
        };
    }

    function parsePreferences(raw) {
        try {
            return validatePreferences(JSON.parse(raw));
        } catch (error) {
            reportStorageError("leer", error);
            return Object.assign({}, defaults);
        }
    }

    function loadPreferences() {
        let raw;
        try {
            raw = window.localStorage.getItem(storageKey);
        } catch (error) {
            reportStorageError("leer", error);
            return Object.assign({}, defaults);
        }
        return raw === null ? Object.assign({}, defaults) : parsePreferences(raw);
    }

    function ensureColorFilters() {
        if (document.getElementById("a11y-protanopia")) {
            return;
        }

        const definitions = [
            ["a11y-protanopia", "0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"],
            ["a11y-deuteranopia", "0.625 0.375 0 0 0  0.700 0.300 0 0 0  0 0.300 0.700 0 0  0 0 0 1 0"],
            ["a11y-tritanopia", "0.950 0.050 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"]
        ];
        const namespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(namespace, "svg");
        svg.setAttribute("class", "a11y-filters");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");

        definitions.forEach(function (definition) {
            const filter = document.createElementNS(namespace, "filter");
            const matrix = document.createElementNS(namespace, "feColorMatrix");
            filter.setAttribute("id", definition[0]);
            matrix.setAttribute("type", "matrix");
            matrix.setAttribute("values", definition[1]);
            filter.appendChild(matrix);
            svg.appendChild(filter);
        });

        document.body.appendChild(svg);
    }

    function applyPreferences(value) {
        colors.slice(1).forEach(function (mode) {
            page.classList.remove("a11y-color-" + mode);
        });
        contrasts.slice(1).forEach(function (mode) {
            page.classList.remove("a11y-contrast-" + mode);
        });
        page.classList.remove("a11y-dyslexia", "a11y-focus-mode", "a11y-large-cursor");

        if (value.colorMode !== "normal") {
            page.classList.add("a11y-color-" + value.colorMode);
        }
        if (value.contrastMode !== "normal") {
            page.classList.add("a11y-contrast-" + value.contrastMode);
        }
        if (value.dyslexia) {
            page.classList.add("a11y-dyslexia");
        }
        if (value.focus) {
            page.classList.add("a11y-focus-mode");
        }
        if (value.cursor) {
            page.classList.add("a11y-large-cursor");
        }

        document.documentElement.style.fontSize = value.fontPercent + "%";
        page.style.setProperty("--a11y-page-zoom", String(value.pageZoom));
        page.style.setProperty("--a11y-page-width", (100 / value.pageZoom) + "%");
        page.classList.toggle("a11y-reflow", value.fontPercent > 100 || value.pageZoom > 1);
    }

    let preferences = loadPreferences();
    ensureColorFilters();
    applyPreferences(preferences);

    function getPreferences() {
        return Object.assign({}, preferences);
    }

    function setPreferences(value) {
        const next = validatePreferences(value);
        preferences = next;
        applyPreferences(preferences);

        try {
            window.localStorage.setItem(storageKey, JSON.stringify(preferences));
            if (preferenceStatus) {
                preferenceStatus.textContent = "";
            }
        } catch (error) {
            reportStorageError("guardar", error);
        }
        return getPreferences();
    }

    function resetPreferences() {
        preferences = Object.assign({}, defaults);
        applyPreferences(preferences);

        try {
            window.localStorage.removeItem(storageKey);
            if (preferenceStatus) {
                preferenceStatus.textContent = "";
            }
        } catch (error) {
            reportStorageError("eliminar", error);
        }
        return getPreferences();
    }

    window.ColoresCreacionesAccesibilidad = {
        storageKey: storageKey,
        getPreferences: getPreferences,
        setPreferences: setPreferences,
        resetPreferences: resetPreferences
    };

    window.addEventListener("storage", function (event) {
        if (event.key !== storageKey && event.key !== null) {
            return;
        }
        preferences = event.newValue === null
            ? Object.assign({}, defaults)
            : parsePreferences(event.newValue);
        applyPreferences(preferences);
    });
})();
