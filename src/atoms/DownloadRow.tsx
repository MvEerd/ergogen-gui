import Button from "./Button";
import styled from "styled-components";

type Props = {
    fileName: string,
    extension: string,
    content: string,
    preview?: string,
    setPreview: (preview: string) => void
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5em
`;

const FileName = styled.div`
`;

const Buttons = styled.div`
    
`;

const StyledButton = styled(Button)`
margin-right: 0.5em;
`;

const DownloadRow = ({fileName, extension, content, preview, setPreview}: Props): JSX.Element => {
    return (
        <Row>
            <FileName>{fileName}.{extension}</FileName>
            <Buttons>
                {preview && <StyledButton size={"small"} onClick={()=>setPreview(preview)}>Preview</StyledButton>}
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