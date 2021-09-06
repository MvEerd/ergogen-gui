import EditorTabs from "../molecules/EditorTabs";
import {useState} from "react";

type Props = {
    config: string,
    className: string
};

const FormEditor = ({config, className}: Props) => {
    const [selected, setSelected] = useState('');

    if (config === null || typeof config !== 'object') {
        return null;
    }

    return (
        <div className={className}>
            <EditorTabs config={config} setSelected={setSelected}/>
            {JSON.stringify(config?.[selected])}
        </div>
    );
}

export default FormEditor;