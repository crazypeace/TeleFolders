import i18n from "./i18n.js";
import Main from "./components/MainWidget/index.js";

// Init locale: load default first, then override from server after Eel connects
await i18n.loadDefault();
const main = new Main();
main.init();
