import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Only fully-translated locales are wired in. The other 22 files under this
// folder cover header/nav strings only and would silently fall back to
// English for every section below the header — removed rather than ship a
// partial "translation" that reads as broken to a Hindi speaker.
import en from "./en.json";
import hi from "./hi.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },

  lng: localStorage.getItem("dhansetu-language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
