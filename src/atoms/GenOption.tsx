import React, {Dispatch, SetStateAction} from "react";
import styled from "styled-components";

type Props = {
  optionId: string;
  label: React.ReactNode;
  checked: boolean;
  setSelected: Dispatch<SetStateAction<boolean>>;
};

const OptionContainer = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const GenOption = ({optionId, label, setSelected, checked}: Props): JSX.Element => {
    return (
        <OptionContainer>
            <input
                type={"checkbox"}
                id={optionId}
                checked={checked}
                onChange={(e)=>setSelected(e.target.checked)}
            />
            <label htmlFor={optionId}>{label}</label>
        </OptionContainer>
    );
};

export default GenOption;