(function () {
  "use strict";

  var config = window.DOCS_FORGE_CONFIG || {};
  var consentKey = "docs_forge_consent_v2";
  var ledgerKey = "docs_forge_consent_ledger_v1";
  var policyVersion = config.policyVersion || "2026-07-29";
  var posthogInitialized = false;

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "df-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function readJson(key, fallback) {
    try {
      var value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function currentConsent() {
    return readJson(consentKey, null);
  }

  function appendLocalReceipt(receipt) {
    var ledger = readJson(ledgerKey, []);
    ledger.push(receipt);
    writeJson(ledgerKey, ledger.slice(-40));
  }

  function publishReceipt(receipt) {
    window.dispatchEvent(
      new CustomEvent("docs-forge:consent-recorded", { detail: receipt })
    );

    if (
      window.DOCS_FORGE_CMP &&
      typeof window.DOCS_FORGE_CMP.recordConsent === "function"
    ) {
      Promise.resolve(window.DOCS_FORGE_CMP.recordConsent(receipt)).catch(function () {
        return undefined;
      });
      return;
    }

    if (config.consentEndpoint) {
      window
        .fetch(config.consentEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(receipt),
          keepalive: true
        })
        .catch(function () {
          return undefined;
        });
    }
  }

  function makeReceipt(purpose, status, source, legalBasis) {
    return {
      id: createId(),
      schema: "docs-forge-consent/1",
      subjectType: "device",
      purpose: purpose,
      status: status,
      legalBasis: legalBasis,
      source: source,
      collectionPoint: "docs-forge-site",
      policyVersion: policyVersion,
      recordedAt: new Date().toISOString()
    };
  }

  function installPostHogStub() {
    if (window.posthog && window.posthog.__SV) {
      return;
    }

    (function (documentObject, posthogObject) {
      var index;
      var method;
      var script;
      var firstScript;

      if (posthogObject.__SV) {
        return;
      }

      window.posthog = posthogObject;
      posthogObject._i = [];
      posthogObject.init = function (apiKey, options, instanceName) {
        function stub(target, methodName) {
          var parts = methodName.split(".");
          if (parts.length === 2) {
            target = target[parts[0]];
            methodName = parts[1];
          }
          target[methodName] = function () {
            target.push(
              [methodName].concat(Array.prototype.slice.call(arguments, 0))
            );
          };
        }

        script = documentObject.createElement("script");
        script.type = "text/javascript";
        script.crossOrigin = "anonymous";
        script.async = true;
        script.src = options.api_host + "/static/array.js";
        firstScript = documentObject.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(script, firstScript);

        var instance =
          instanceName !== undefined
            ? (posthogObject[instanceName] = [])
            : posthogObject;
        var resolvedName = instanceName || "posthog";
        instance.people = instance.people || [];
        instance.toString = function (asPeople) {
          var label = resolvedName;
          if (resolvedName !== "posthog") {
            label = "posthog." + resolvedName;
          }
          return asPeople ? label + ".people (stub)" : label + " (stub)";
        };
        instance.people.toString = function () {
          return instance.toString(true);
        };

        var methods =
          "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags captureException".split(
            " "
          );
        for (index = 0; index < methods.length; index += 1) {
          method = methods[index];
          stub(instance, method);
        }
        posthogObject._i.push([apiKey, options, instanceName]);
      };
      posthogObject.__SV = 1;
    })(document, window.posthog || []);
  }

  function enableAnalytics(recordExplicitOptIn) {
    if (!config.posthogKey || !config.posthogHost) {
      return;
    }

    if (posthogInitialized && window.posthog) {
      if (recordExplicitOptIn) {
        window.posthog.opt_in_capturing();
      }
      return;
    }

    installPostHogStub();
    window.posthog.init(config.posthogKey, {
      api_host: config.posthogHost,
      defaults: config.posthogDefaults || "2026-05-30",
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_surveys: true,
      advanced_disable_flags: true,
      advanced_disable_feature_flags_on_first_load: true,
      person_profiles: "identified_only",
      persistence: "localStorage+cookie"
    });
    if (recordExplicitOptIn) {
      window.posthog.opt_in_capturing();
    }
    posthogInitialized = true;
  }

  function disableAnalytics() {
    if (!window.posthog) {
      return;
    }

    if (typeof window.posthog.reset === "function") {
      window.posthog.reset(true);
    }
    if (typeof window.posthog.opt_out_capturing === "function") {
      window.posthog.opt_out_capturing();
    }
  }

  function applyAnalyticsPreference(allowed) {
    if (allowed) {
      enableAnalytics(true);
    } else {
      disableAnalytics();
    }
  }

  function saveCookiePreference(analyticsAllowed, source) {
    var savedAt = new Date().toISOString();
    var state = {
      schema: "docs-forge-cookie-preferences/2",
      manager: "external_cmp",
      necessary: true,
      analytics: Boolean(analyticsAllowed),
      policyVersion: policyVersion,
      updatedAt: savedAt
    };

    writeJson(consentKey, state);

    var necessaryReceipt = makeReceipt(
      "strictly_necessary_storage",
      "enabled",
      source,
      "strictly_necessary"
    );
    var analyticsReceipt = makeReceipt(
      "site_analytics",
      analyticsAllowed ? "granted" : "denied",
      source,
      "consent"
    );

    appendLocalReceipt(necessaryReceipt);
    appendLocalReceipt(analyticsReceipt);
    publishReceipt(necessaryReceipt);
    publishReceipt(analyticsReceipt);
    applyAnalyticsPreference(Boolean(analyticsAllowed));

    window.dispatchEvent(
      new CustomEvent("docs-forge:consent-changed", { detail: state })
    );

    return state;
  }

  function setupConsentBridge() {
    var existing = currentConsent();

    if (
      existing &&
      existing.manager === "external_cmp" &&
      typeof existing.analytics === "boolean"
    ) {
      applyAnalyticsPreference(existing.analytics);
    } else if (config.consentMode === "immediate") {
      enableAnalytics(true);
    }

    window.docsForgeConsent = Object.freeze({
      getPreferences: currentConsent,
      setConsent: function (choice) {
        var detail = choice || {};
        return saveCookiePreference(
          Boolean(detail.analytics),
          detail.source || "external_cmp"
        );
      },
      savePreferences: function (analyticsAllowed) {
        return saveCookiePreference(Boolean(analyticsAllowed), "external_cmp");
      }
    });

    window.addEventListener("docs-forge:cmp-consent", function (event) {
      var detail = event.detail || {};
      saveCookiePreference(
        Boolean(detail.analytics),
        detail.source || "external_cmp_event"
      );
    });

    window.dispatchEvent(new CustomEvent("docs-forge:consent-bridge-ready"));
  }

  function contactReceipt(purpose, granted) {
    return {
      id: createId(),
      schema: "docs-forge-consent/1",
      subjectType: "person",
      purpose: purpose,
      status: granted ? "granted" : "denied",
      legalBasis: "consent",
      source: "contact_form",
      collectionPoint: "homepage_contact_form",
      policyVersion: policyVersion,
      recordedAt: new Date().toISOString()
    };
  }

  function setupContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) {
      return;
    }

    var status = form.querySelector("[data-form-status]");
    var submitButton = form.querySelector('button[type="submit"]');

    if (!config.formEndpoint) {
      submitButton.disabled = true;
      status.textContent =
        "Contact collection is not connected yet. Add a secure form endpoint in site/config.js before publishing submissions.";
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      var data = new FormData(form);
      if (data.get("website")) {
        form.reset();
        status.textContent = "Request received.";
        return;
      }

      var responseReceipt = contactReceipt("respond_to_enquiry", true);
      var updatesReceipt = contactReceipt(
        "product_updates",
        data.get("product_updates") === "yes"
      );
      var payload = {
        email: data.get("email"),
        phone: data.get("phone"),
        message: data.get("message"),
        consents: [responseReceipt, updatesReceipt],
        submittedAt: new Date().toISOString()
      };

      submitButton.disabled = true;
      status.textContent = "Sending your request…";

      window
        .fetch(config.formEndpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Submission failed");
          }

          window.dispatchEvent(
            new CustomEvent("docs-forge:contact-consent-recorded", {
              detail: { consents: payload.consents }
            })
          );

          if (
            currentConsent() &&
            currentConsent().analytics &&
            window.posthog &&
            typeof window.posthog.capture === "function"
          ) {
            window.posthog.capture("contact_form_submitted");
          }

          form.reset();
          status.textContent =
            "Request sent. We will use your details according to the choices you made.";
        })
        .catch(function () {
          status.textContent =
            "We could not send the request. Please try again later.";
        })
        .finally(function () {
          submitButton.disabled = false;
        });
    });
  }

  function start() {
    setupConsentBridge();
    setupContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
