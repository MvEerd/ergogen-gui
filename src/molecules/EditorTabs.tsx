import {Dispatch, SetStateAction} from "react";

type Props = {
    config: string,
    className?: string,
    setSelected: Dispatch<SetStateAction<string>>,
};

const EditorTabs = ({config, className, setSelected}: Props) => {
    return config !== null && typeof config === 'object' ? (
        <div className={className}>
            {
                Object.keys(config)?.map?.(
                    configKey => (
                        <span onClick={()=>setSelected(configKey)}>{configKey}</span>
                    )
                )
            }
        </div>
    ) : null;
}

export default EditorTabs;