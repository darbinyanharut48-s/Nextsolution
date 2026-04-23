const FORMSPREE_ENDPOINT = "https://formspree.io/f/meevpnvp";

const FORM_MESSAGES = {
  en: {
    required: "Please fill out this field.",
    invalidEmail: "Please enter a valid email address.",
    consent: "Please accept the consent statement.",
    sending: "Sending...",
    success: "Thank you. Your message was sent successfully.",
    error: "Please review the highlighted fields and try again.",
    network: "Network error. Please try again.",
    submit: "Send request"
  },
  fr: {
    required: "Veuillez remplir ce champ.",
    invalidEmail: "Veuillez saisir une adresse e-mail valide.",
    consent: "Veuillez accepter la mention de consentement.",
    sending: "Envoi...",
    success: "Merci. Votre message a été envoyé avec succès.",
    error: "Veuillez vérifier les champs en erreur.",
    network: "Erreur réseau. Veuillez réessayer.",
    submit: "Envoyer la demande"
  },
  es: {
    required: "Por favor, complete este campo.",
    invalidEmail: "Por favor, introduzca un correo electrónico válido.",
    consent: "Debe aceptar el consentimiento para continuar.",
    sending: "Enviando...",
    success: "Gracias. Su mensaje se envió correctamente.",
    error: "Revise los campos marcados e intente de nuevo.",
    network: "Error de red. Inténtelo de nuevo.",
    submit: "Enviar solicitud"
  }
};

window.FORM_MESSAGES = FORM_MESSAGES;

(() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const getLang = (form) => form.getAttribute("data-lang") || document.body.dataset.lang || "en";
  const getMsg = (lang, key) => (FORM_MESSAGES[lang] && FORM_MESSAGES[lang][key]) || FORM_MESSAGES.en[key] || "";

  const selectorEscape = (value) => {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(value);
    }
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  };

  const getFieldWrapper = (field) => field.closest(".field") || field.closest(".check-row")?.parentElement || field.parentElement;

  const setFieldError = (field, text) => {
    const wrapper = getFieldWrapper(field);
    if (!wrapper) return;

    wrapper.classList.add("has-error");
    field.setAttribute("aria-invalid", "true");

    let errorNode = wrapper.querySelector(".field-error");
    if (!errorNode) {
      errorNode = document.createElement("p");
      errorNode.className = "field-error";
      errorNode.setAttribute("aria-live", "polite");
      wrapper.appendChild(errorNode);
    }

    if (!errorNode.id) {
      const token = field.id || field.name || `field-${Math.random().toString(36).slice(2, 8)}`;
      errorNode.id = `${token}-error`;
    }

    field.setAttribute("aria-describedby", errorNode.id);
    errorNode.textContent = text;
  };

  const clearFieldError = (field) => {
    const wrapper = getFieldWrapper(field);
    if (!wrapper) return;

    wrapper.classList.remove("has-error");
    field.removeAttribute("aria-invalid");

    const errorNode = wrapper.querySelector(".field-error");
    if (errorNode) {
      errorNode.textContent = "";
      if (field.getAttribute("aria-describedby") === errorNode.id) {
        field.removeAttribute("aria-describedby");
      }
    }
  };

  const clearFormErrors = (form) => {
    form.querySelectorAll(".has-error").forEach((node) => node.classList.remove("has-error"));
    form.querySelectorAll(".field-error").forEach((node) => {
      node.textContent = "";
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach((node) => {
      node.removeAttribute("aria-invalid");
      node.removeAttribute("aria-describedby");
    });
  };

  const setStatus = (form, state, text) => {
    const status = form.querySelector("[data-form-status]");
    if (!status) return;

    status.dataset.state = state;
    status.textContent = text;
    status.setAttribute("aria-live", "polite");

    if (state === "error") {
      status.setAttribute("role", "alert");
    } else {
      status.removeAttribute("role");
    }
  };

  const setSubmitState = (form, lang, isLoading) => {
    const submitButton = form.querySelector('[type="submit"]');
    if (!(submitButton instanceof HTMLButtonElement)) return;

    if (!submitButton.dataset.defaultLabel) {
      submitButton.dataset.defaultLabel = submitButton.textContent.trim();
    }

    submitButton.disabled = isLoading;
    submitButton.setAttribute("aria-disabled", String(isLoading));
    submitButton.textContent = isLoading
      ? getMsg(lang, "sending")
      : submitButton.dataset.defaultLabel || getMsg(lang, "submit");
  };

  const validateForm = (form, lang) => {
    clearFormErrors(form);
    let valid = true;
    let firstInvalid = null;

    const requiredFields = [...form.querySelectorAll("[required]")];
    requiredFields.forEach((field) => {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) {
        return;
      }
      if (field.disabled) return;

      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        if (!field.checked) {
          valid = false;
          firstInvalid = firstInvalid || field;
          setFieldError(field, getMsg(lang, "consent"));
        }
        return;
      }

      if (!String(field.value || "").trim()) {
        valid = false;
        firstInvalid = firstInvalid || field;
        setFieldError(field, getMsg(lang, "required"));
      }
    });

    const emailField = form.querySelector('input[type="email"]');
    if (emailField instanceof HTMLInputElement && String(emailField.value || "").trim() && !emailPattern.test(emailField.value.trim())) {
      valid = false;
      firstInvalid = firstInvalid || emailField;
      setFieldError(emailField, getMsg(lang, "invalidEmail"));
    }

    if (firstInvalid) firstInvalid.focus();
    return valid;
  };

  const applyServerErrors = (form, errors, lang) => {
    if (!Array.isArray(errors) || errors.length === 0) return false;
    let hasFieldErrors = false;

    errors.forEach((item) => {
      if (!item || typeof item !== "object") return;

      const message = String(item.message || "").trim() || getMsg(lang, "error");
      const fieldName = typeof item.field === "string" ? item.field : "";
      if (!fieldName) return;

      const field = form.querySelector(`[name="${selectorEscape(fieldName)}"]`);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        setFieldError(field, message);
        hasFieldErrors = true;
      }
    });

    if (hasFieldErrors) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
    }

    return hasFieldErrors;
  };

  const postForm = async (form, lang) => {
    const formData = new FormData(form);
    formData.append("form_language", lang);
    formData.append("form_page", window.location.pathname);

    return fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    });
  };

  document.querySelectorAll("[data-validate-form]").forEach((form) => {
    const clearTargetField = (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
        clearFieldError(target);
      }
    };

    form.addEventListener("input", clearTargetField);
    form.addEventListener("change", clearTargetField);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const lang = getLang(form);

      if (!validateForm(form, lang)) {
        setStatus(form, "error", getMsg(lang, "error"));
        return;
      }

      setSubmitState(form, lang, true);
      setStatus(form, "loading", getMsg(lang, "sending"));

      try {
        const response = await postForm(form, lang);
        let payload = null;

        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (response.ok) {
          form.reset();
          clearFormErrors(form);
          setStatus(form, "success", getMsg(lang, "success"));
          return;
        }

        const hasFieldErrors = applyServerErrors(form, payload?.errors, lang);
        if (hasFieldErrors) {
          setStatus(form, "error", getMsg(lang, "error"));
          return;
        }

        const fallback = String(payload?.error || "").trim() || getMsg(lang, "error");
        setStatus(form, "error", fallback);
      } catch {
        setStatus(form, "error", getMsg(lang, "network"));
      } finally {
        setSubmitState(form, lang, false);
      }
    });
  });
})();
