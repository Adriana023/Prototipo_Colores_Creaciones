document.addEventListener("DOMContentLoaded", function () {
    const page = document.querySelector(".a11y-page");
    const widget = document.querySelector(".a11y-widget");
    const sharedAccessibility = window.ColoresCreacionesAccesibilidad;
    const trigger = document.getElementById("a11y-trigger");
    const panel = document.getElementById("a11y-panel");
    const closeButton = document.getElementById("a11y-close");
    const fontValue = document.getElementById("a11y-font-value");
    const zoomValue = document.getElementById("a11y-zoom-value");
    const speechStatus = document.getElementById("a11y-speech-status");
    const speechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

    if (!page || !widget || !sharedAccessibility || !trigger || !panel || !closeButton) {
        console.error("No se pudo inicializar el panel de accesibilidad: falta su estructura HTML.");
        return;
    }

    const toggleModes = {
        dyslexia: "a11y-dyslexia",
        focus: "a11y-focus-mode",
        cursor: "a11y-large-cursor"
    };
    let preferences = sharedAccessibility.getPreferences();

    function syncControls() {
        document.querySelectorAll("[data-color]").forEach(function (button) {
            button.setAttribute("aria-pressed", String(button.dataset.color === preferences.colorMode));
        });
        document.querySelectorAll("[data-contrast]").forEach(function (button) {
            button.setAttribute("aria-pressed", String(button.dataset.contrast === preferences.contrastMode));
        });
        Object.keys(toggleModes).forEach(function (mode) {
            const button = document.querySelector('[data-toggle="' + mode + '"]');
            button.setAttribute("aria-pressed", String(preferences[mode]));
        });
        fontValue.value = preferences.fontPercent + " %";
        zoomValue.value = Math.round(preferences.pageZoom * 100) + " %";
        document.getElementById("a11y-font-down").disabled = preferences.fontPercent <= 80;
        document.getElementById("a11y-font-up").disabled = preferences.fontPercent >= 200;
        document.getElementById("a11y-zoom-down").disabled = preferences.pageZoom <= 1;
        document.getElementById("a11y-zoom-up").disabled = preferences.pageZoom >= 1.3;
    }

    function savePreferences() {
        preferences = sharedAccessibility.setPreferences(preferences);
        syncControls();
    }

    syncControls();

    function openPanel() {
        panel.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        closeButton.focus();
    }

    function closePanel() {
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
    }

    trigger.addEventListener("click", function () {
        if (panel.hidden) {
            openPanel();
        } else {
            closePanel();
        }
    });

    closeButton.addEventListener("click", closePanel);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !panel.hidden) {
            closePanel();
        }
    });

    document.querySelectorAll("[data-color]").forEach(function (button) {
        button.addEventListener("click", function () {
            preferences.colorMode = button.dataset.color;
            savePreferences();
        });
    });

    document.querySelectorAll("[data-contrast]").forEach(function (button) {
        button.addEventListener("click", function () {
            preferences.contrastMode = button.dataset.contrast;
            savePreferences();
        });
    });

    Object.keys(toggleModes).forEach(function (mode) {
        const button = document.querySelector('[data-toggle="' + mode + '"]');
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            preferences[mode] = !preferences[mode];
            savePreferences();
        });
    });

    document.getElementById("a11y-font-down").addEventListener("click", function () {
        preferences.fontPercent = Math.max(80, preferences.fontPercent - 10);
        savePreferences();
    });

    document.getElementById("a11y-font-up").addEventListener("click", function () {
        preferences.fontPercent = Math.min(200, preferences.fontPercent + 10);
        savePreferences();
    });

    document.getElementById("a11y-font-reset").addEventListener("click", function () {
        preferences.fontPercent = 100;
        savePreferences();
    });

    document.getElementById("a11y-zoom-down").addEventListener("click", function () {
        preferences.pageZoom = Math.max(1, Math.round((preferences.pageZoom - 0.1) * 10) / 10);
        savePreferences();
    });

    document.getElementById("a11y-zoom-up").addEventListener("click", function () {
        preferences.pageZoom = Math.min(1.3, Math.round((preferences.pageZoom + 0.1) * 10) / 10);
        savePreferences();
    });

    const speakButton = document.getElementById("a11y-speak");
    const pauseButton = document.getElementById("a11y-pause");
    const resumeButton = document.getElementById("a11y-resume");
    const stopButton = document.getElementById("a11y-stop");
    let speechActive = false;
    let speechPaused = false;
    let activeUtterance = null;

    function updateSpeechControls() {
        pauseButton.disabled = !speechSupported || !speechActive || speechPaused;
        resumeButton.disabled = !speechSupported || !speechActive || !speechPaused;
        stopButton.disabled = !speechSupported || !speechActive;
    }

    function stopNarration(message) {
        if (!speechSupported) {
            return;
        }
        activeUtterance = null;
        window.speechSynthesis.cancel();
        speechActive = false;
        speechPaused = false;
        if (message) {
            speechStatus.textContent = message;
        }
        updateSpeechControls();
    }

    if (!speechSupported) {
        [speakButton, pauseButton, resumeButton, stopButton].forEach(function (button) {
            button.disabled = true;
        });
        speechStatus.textContent = "La lectura en voz alta no está disponible en este navegador.";
    } else {
        speakButton.addEventListener("click", function () {
            const text = page.innerText.trim();
            if (!text) {
                speechStatus.textContent = "No hay contenido disponible para leer.";
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            activeUtterance = utterance;
            utterance.lang = "es-PE";
            utterance.onstart = function () {
                if (activeUtterance !== utterance) {
                    return;
                }
                speechActive = true;
                speechStatus.textContent = speechPaused ? "Lectura pausada." : "Lectura en curso.";
                updateSpeechControls();
            };
            utterance.onend = function () {
                if (activeUtterance !== utterance) {
                    return;
                }
                activeUtterance = null;
                speechActive = false;
                speechPaused = false;
                speechStatus.textContent = "Lectura finalizada.";
                updateSpeechControls();
            };
            utterance.onerror = function (event) {
                if (activeUtterance !== utterance) {
                    return;
                }
                activeUtterance = null;
                speechActive = false;
                speechPaused = false;
                speechStatus.textContent = "No se pudo completar la lectura: " + event.error + ".";
                updateSpeechControls();
            };
            speechActive = true;
            speechPaused = false;
            window.speechSynthesis.speak(utterance);
            speechStatus.textContent = "Preparando lectura.";
            updateSpeechControls();
        });

        pauseButton.addEventListener("click", function () {
            window.speechSynthesis.pause();
            speechPaused = true;
            speechStatus.textContent = "Lectura pausada.";
            updateSpeechControls();
        });

        resumeButton.addEventListener("click", function () {
            window.speechSynthesis.resume();
            speechPaused = false;
            speechStatus.textContent = "Lectura reanudada.";
            updateSpeechControls();
        });

        stopButton.addEventListener("click", function () {
            stopNarration("Lectura detenida.");
        });

        window.addEventListener("pagehide", function () {
            stopNarration();
        });
    }

    window.addEventListener("storage", function (event) {
        if (event.key !== sharedAccessibility.storageKey && event.key !== null) {
            return;
        }
        preferences = sharedAccessibility.getPreferences();
        syncControls();
        if (event.newValue === null) {
            stopNarration("Configuración restablecida.");
        }
    });

    document.getElementById("a11y-reset").addEventListener("click", function () {
        preferences = sharedAccessibility.resetPreferences();
        syncControls();
        stopNarration("Configuración restablecida. Las opciones visuales fueron eliminadas.");
    });

    updateSpeechControls();
});
