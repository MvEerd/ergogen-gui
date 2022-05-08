import Button from "./Button";
import styled from "styled-components";
import {Dispatch, SetStateAction} from "react";

type Props = {
    fileName: string,
    extension: string,
    content: string,
    preview?: string,
    setPreview: (preview: string) => void,
    setTabIndex: Dispatch<SetStateAction<number>> | undefined
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5em
`;

const FileName = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Buttons = styled.div`
    white-space: nowrap;
`;

const StyledButton = styled(Button)`
margin-right: 0.5em;
`;

const DownloadRow = ({fileName, extension, content, preview, setPreview, setTabIndex}: Props): JSX.Element => {
    return (
        <Row>
            <FileName>{fileName}.{extension}</FileName>
            <Buttons>
                {preview && (
                    <StyledButton size={"small"}
                        onClick={()=>{
                            setPreview(preview);
                            setTabIndex?.(0)
                        }}
                    >
                        Preview
                    </StyledButton>
                )}
                <a target={"_blank"}
                   rel={"noreferrer"}
                   download={`${fileName}.${extension}`}
                   href={window.URL.createObjectURL(new Blob([content], {type: "octet/stream"}))}>
                    <Button size={"small"}>Download</Button>
                </a>
            </Buttons>
        </Row>
    );
};

export default DownloadRow;