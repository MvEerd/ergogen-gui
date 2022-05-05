import React, {createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState} from 'react';
import { DebouncedFunc } from "lodash-es";
import yaml from "js-yaml";
import debounce from "lodash.debounce";
import { useLocalStorage } from 'react-use';

type Props = {
    initialInput: string,
    children: React.ReactNode[] | React.ReactNode,
};

type Results = { [key: string]: any|Results };

type ContextProps = {
    configInput: string | undefined,
    setConfigInput: Dispatch<SetStateAction<string | undefined>>,
    processInput: DebouncedFunc<(textInput: string | undefined, options?: ProcessOptions) => Promise<void>>,
    error: string | null,
    results: Results | null,
    debug: boolean,
    setDebug: Dispatch<SetStateAction<boolean>>,
    autoGen: boolean,
    setAutoGen: Dispatch<SetStateAction<boolean>>,
    autoGen3D: boolean,
    setAutoGen3D: Dispatch<SetStateAction<boolean>>
};

type ProcessOptions = {
    pointsonly: boolean
};

export const ConfigContext = createContext<ContextProps | null>(null);
export const CONFIG_LOCAL_STORAGE_KEY = 'LOCAL_STORAGE_CONFIG'

const ConfigContextProvider = ({initialInput, children}: Props) => {
    const [configInput, setConfigInput] = useLocalStorage<string>(CONFIG_LOCAL_STORAGE_KEY, initialInput);
    const [error, setError] = useState<string|null>(null);
    const [results, setResults] = useState<Results|null>(null);
    const [debug, setDebug] = useState<boolean>(true);
    const [autoGen, setAutoGen] = useState<boolean>(true);
    const [autoGen3D, setAutoGen3D] = useState<boolean>(false);


    const parseConfig = (inputString: string) => {
        let type = 'UNKNOWN';
        let parsedConfig = null;

        try {
            parsedConfig = JSON.parse(inputString);
            type = 'JSON';
        } catch (e: unknown) {
            // Input is not valid JSON
        }

        try {
            parsedConfig = yaml.load(inputString);
            type = 'YAML';
        } catch (e: unknown) {
            // Input is not valid YAML
        }

        return [type, parsedConfig]
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const processInput = useCallback(
        debounce(async (textInput: string | undefined, options: ProcessOptions = { pointsonly: true }) => {
            let results = null;
            let inputConfig: string | {} = textInput ?? '';
            const [,parsedConfig] = parseConfig(textInput ?? '');

            setError(null);

            // When running this as part of onChange we only send 'points', 'units' and 'variables' to generate a preview
            // If there is no 'points' key we send the input to Ergogen as-is, it could be KLE or invalid.
            if (parsedConfig?.points && options?.pointsonly) {
                inputConfig = {
                    points: {...parsedConfig?.points},
                    units: {...parsedConfig?.units},
                    variables: {...parsedConfig?.variables},
                    outlines: {...parsedConfig?.outlines}
                };
            }

            try {
                results = await window.ergogen.process(
                    inputConfig,
                    debug, // debug
                    (m: string) => console.log(m) // logger
                );
            } catch (e: unknown) {
                if(!e) return;

                if (typeof e === "string"){
                    setError(e);
                }
                if (typeof e === "object"){
                    // @ts-ignore
                    setError(e.toString());
                }
                return;
            }

            setResults(results);

        }, 300),
        [window.ergogen]
    );

    useEffect(() => {
        if(autoGen) {
            processInput(configInput, { pointsonly: !autoGen3D });
        }
    }, [configInput, processInput]);


    return (
        <ConfigContext.Provider
            value={ {
                configInput,
                setConfigInput,
                processInput,
                error,
                results,
                debug,
                setDebug,
                autoGen,
                setAutoGen,
                autoGen3D,
                setAutoGen3D
            } }
        >
            { children }
        </ConfigContext.Provider>
    );
};

export default ConfigContextProvider;

export const useConfigContext = () => useContext(ConfigContext);