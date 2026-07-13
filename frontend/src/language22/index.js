import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// import all your JSONs from THIS folder
import en from "./en.json";
import hi from "./hi.json";
import as from "./as.json";
import bn from "./bn.json";
import bo from "./bo.json";   // Tibetan or fallback, your choice
import brx from "./brx.json"; // Bodo (official code)
import doi from "./doi.json";
import gu from "./gu.json";
import kn from "./kn.json";
import kok from "./kok.json";
import ks from "./ks.json";
import mai from "./mai.json";
import ml from "./ml.json";
import mni from "./mni.json";
import mr from "./mr.json";
import ne from "./ne.json";
import orJson from "./or.json";
import pa from "./pa.json";
import sa from "./sa.json";
import sat from "./sat.json";
import sd from "./sd.json";
import ta from "./ta.json";
import te from "./te.json";
import ur from "./ur.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    as: { translation: as },
    bn: { translation: bn },
    bo: { translation: bo },
    brx: { translation: brx },
    doi: { translation: doi },
    gu: { translation: gu },
    kn: { translation: kn },
    kok: { translation: kok },
    ks: { translation: ks },
    mai: { translation: mai },
    ml: { translation: ml },
    mni: { translation: mni },
    mr: { translation: mr },
    ne: { translation: ne },
    or: { translation: orJson },
    pa: { translation: pa },
    sa: { translation: sa },
    sat: { translation: sat },
    sd: { translation: sd },
    ta: { translation: ta },
    te: { translation: te },
    ur: { translation: ur }
  },

  lng: "en",          // default language
  fallbackLng: "en",  // if translation missing
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
