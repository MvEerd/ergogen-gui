import Absolem from "./absolem";
import Atreus from "./atreus";
import Adux from "./adux";
import Wubbo from "./wubbo";
import Sweeplike from "./sweeplike";
import Reviung41 from "./reviung41";
import Tiny20 from "./tiny20";
import Alpha from "./alpha";
import Plank from "./plank";

export interface GroupedOption {
    readonly label: string;
    readonly options: readonly ConfigOption[];
}

export interface ConfigOption {
    readonly value: string;
    readonly label: string;
}

export interface ConfigExample extends ConfigOption {
    readonly label: string;
    readonly value: string;
    readonly author: string;
}

const simpleExamples = [
    Absolem,
    Atreus,

];

const completeExamples = [
    Adux,
    Sweeplike,
    Reviung41,
    Tiny20
];

const miscExamples = [
    Wubbo,
    Alpha,
    Plank
];

export const exampleOptions: readonly GroupedOption[] = [
    {
        label: 'Simple (points only)',
        options: simpleExamples,
    },
    {
        label: 'Complete (with pcb)',
        options: completeExamples,
    },
    {
        label: 'Miscellaneous',
        options: miscExamples,
    },
];

export default exampleOptions;