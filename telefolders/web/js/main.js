import i18n from "./i18n.js";
import Main from "./components/MainWidget/index.js";

// Init locale after Eel connection is established
const main = new Main();
await main.initI18n();
main.init();
