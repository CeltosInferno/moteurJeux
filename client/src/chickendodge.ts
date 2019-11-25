import { ILocaleFiles, Localisation } from "./localisation";
import { IConfig, run } from "./main";
import { Resources } from "./resources";

const locales: ILocaleFiles = {
  en: "locales/en.json",
  fr: "locales/fr.json",
};

type IStartFn = () => void;
let startFn: IStartFn;

export function start() {
  startFn();
}

export function preload() {
  return Resources.init("data/resources.json");
}

export function init() {
  const equipe = Resources.load<string>("equipe.txt")!;
  console.log(equipe);
  if (equipe === "Coéquipiers") {
    alert("N'oubliez pas d'inscrire les membres de votre équipe dans le fichier client/data/equipe.txt!");
  }

  Localisation.init(locales);
  const localized = document.getElementsByClassName("localized") as HTMLCollectionOf<HTMLElement>;
  for (const item of localized) {
    item.innerText = Localisation.get(item.innerText);
  }
  document.getElementById("body")!.style.display = "initial";

  startFn = () => {
    const alias1 = (document.getElementById("player1_alias") as HTMLInputElement)!.value.trim();
    const alias2 = (document.getElementById("player2_alias") as HTMLInputElement)!.value.trim();

    if (alias1.length === 0) {
      return alert(Localisation.get("EMPTY_ALIAS", { ID: "1" }));
    }
    if (alias2.length === 0) {
      return alert(Localisation.get("EMPTY_ALIAS", { ID: "2" }));
    }

    const config: IConfig = {
      alias: [alias1, alias2],
      canvasId: "canvas",
      launchScene: "scenes/play.json",
    };

    Localisation.setContext("PLAYER_1", alias1);
    Localisation.setContext("PLAYER_2", alias2);

    document.getElementById("config")!.style.display = "none";
    document.getElementById("canvas")!.style.display = "block";

    return run(config);
  };
}
