type Props = {
  optionId: string;
  label: string;
};

const GenOption = ({optionId, label}: Props): JSX.Element => {
    return (
        <span>
            <input type={"checkbox"} id={optionId}/>
            <label htmlFor={optionId}>
                {label}
            </label>
        </span>
    );
};

export default GenOption;