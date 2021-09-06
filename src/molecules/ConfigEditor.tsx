import Editor from "@monaco-editor/react";
import React, {useEffect} from "react";
import {useConfigContext} from "../context/ConfigContext";

type Props = {
  className?: string
};

const ConfigEditor = ({className}: Props) => {
    const configContext = useConfigContext();

    // @ts-ignore
    const {configInput, setConfigInput} = configContext;

    const handleChange = async (textInput: string | undefined) => {
        if(!textInput) return null;

        setConfigInput(textInput);
    }

    useEffect(() => {
        handleChange(configInput);
    }, []);

    return (
        <div className={className}>
            <Editor
                height="70vh"
                defaultLanguage="JSON"
                onChange={handleChange}
                value={configInput}
                theme={"vs-dark"}
                defaultValue={configInput}
            />
        </div>
    );
}

export default ConfigEditor;