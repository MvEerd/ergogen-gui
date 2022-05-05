import Absolem from "./absolem";
import Atreus from "./atreus";
import Adux from "./adux";
import Wubbo from "./wubbo";
import TuckNRoll from "./tuck-n-roll";

const Examples = {
    absolem: {
        label: "Absolem",
        configContent:  Absolem
    },
    atreus: {
        label: "Atreus",
        configContent: Atreus,
    },
    adux: {
        label: "A. dux",
        configContent: Adux
    },
    tucknroll: {
        label: "Tuck-n-Roll",
        configContent: TuckNRoll
    },
    wubbo: {
        label: "Wubbo",
        configContent: Wubbo
    }
}

export default Examples;

export interface ConfigOption {
    readonly value: string;
    readonly label: string;
}