import {useState} from "react";
import styled from "styled-components";

import ConfigEditor from "./molecules/ConfigEditor";
import Downloads from "./molecules/Dowloads";
import FilePreview from "./molecules/FilePreview";

import {useConfigContext} from "./context/ConfigContext";
import Button from "./atoms/Button";
import Select from "react-select/base";
import GenOption from "./atoms/GenOption";

const EditorContainer = styled.div`
  position: relative;
  height: 80%;
  display: flex;
  flex-direction: column;
  max-width: 33em;
  width: 100%;
  flex-grow: 1;

  @media screen and (max-width: 1000px) {
    max-width: unset;
  }
`;


const FlexContainer = styled.div`
  display: flex;
  flex-flow: wrap;

  @media screen and (max-width: 1000px) {
    flex-direction: column;
  }
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;

  flex-grow: 1;
  flex-basis: 25em;
  padding: 1em;
`;


const Error = styled.div`
  background: #ff6d6d;
  color: #a31111;
  padding: 1em;
  margin: 0.5em 0 0.5em 0;
  border: 1px solid #a31111;
  border-radius: 0.3em;
`;

const StyledFilePreview = styled(FilePreview)`
  flex-grow: 1;
`;

const StyledConfigEditor = styled(ConfigEditor)`
  border: 3px solid grey;
  border-radius: 0.3em;
  height: 80%;
  position: relative;
`;

const OptionContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;


const Ergogen = () => {
    const [previewKey, setPreviewKey] = useState("demo.svg");

    const configContext = useConfigContext();
    if (!configContext) return null;

    const {
        results,
        error,
        processInput,
        configInput,
        autoGen,
        setAutoGen,
        autoGen3D,
        setAutoGen3D,
        debug,
        setDebug
    } = configContext;

    let previewContent = results;
    // Walk through the JSON keys until we get the content of the desired previewKey
    previewKey.split(".").forEach((key) => previewContent = previewContent?.[key]);

    return (
        <div>
            <FlexContainer>
                    <EditorContainer>
                        <Select onChange={()=>{}} onInputChange={()=>{}} value={''} inputValue={''}  onMenuClose={()=>{}} onMenuOpen={()=>{}}/>
                        <StyledConfigEditor />
                        <Button onClick={()=>processInput(configInput, { pointsonly: false })}>Generate</Button>
                        <OptionContainer>
                            <GenOption optionId={'autogen'} label={'Auto-generate'} setSelected={setAutoGen} checked={autoGen}/>
                            <GenOption optionId={'debug'} label={'Debug'} setSelected={setDebug} checked={debug}/>
                            <GenOption optionId={'autogen3d'} label={<>Auto-gen 3D <small>(slow)</small></>} setSelected={setAutoGen3D} checked={autoGen3D}/>
                        </OptionContainer>
                        {error && <Error>{error.toString()}</Error>}
                    </EditorContainer>

                    <FlexColumn>
                        <Downloads setPreview={setPreviewKey}/>
                        {previewKey && typeof previewContent === 'string' &&
                            <StyledFilePreview previewKey={previewKey} previewContent={previewContent}/>
                        }
                    </FlexColumn>
            </FlexContainer>
        </div>
    );
}

export default Ergogen;