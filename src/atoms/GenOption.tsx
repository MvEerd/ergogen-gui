import React, {Dispatch, SetStateAction} from "react";

type Props = {
  optionId: string;
  label: React.ReactNode;
  checked: boolean;
  setSelected: Dispatch<SetStateAction<boolean>>;
};

const GenOption = ({optionId, label, setSelected, checked}: Props): JSX.Element => {
    return (
        <span>
            <input
                type={"checkbox"}
                id={optionId}
                checked={checked}
                onChange={(e)=>setSelected(e.target.checked)}
            />
            <label htmlFor={optionId}>{label}</label>
        </span>
    );
};

export default GenOption;