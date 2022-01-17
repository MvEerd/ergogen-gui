import {useState} from "react";
import styled from "styled-components";
import Split from "react-split";

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
  width: 100%;
  flex-grow: 1;
`;


const FlexContainer = styled.div`
  display: flex;
  flex-flow: wrap;
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
  height: 100%;
`;

const StyledConfigEditor = styled(ConfigEditor)`
  position: relative;
`;

const OptionContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledSplit = styled(Split)`
  width: 100%;
  display: flex;
  padding: 1rem;

  .gutter {
    background-color: #878787;
    border-radius: 0.25rem;

    background-repeat: no-repeat;
    background-position: 50%;

    &:hover {
      background-color: #a0a0a0;
    }

    &.gutter-horizontal {
      cursor: col-resize;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    }
  }
`;

const LeftSplitPane = styled.div`
  padding-right: 1rem;
`;

const RightSplitPane = styled.div`
  padding-left: 1rem;
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
        <FlexContainer>
            <StyledSplit
                direction={"horizontal"}
                sizes={[50, 50]}
                minSize={100}
                gutterSize={10}
                snapOffset={0}
            >
                <LeftSplitPane>
                    <EditorContainer>
                        <Select
                            onChange={() => {}}
                            onInputChange={() => {}}
                            value={''}
                            inputValue={''}
                            onMenuClose={() => {}}
                            onMenuOpen={() => {}}
                            placeholder={"Paste your config below, or select an example here!"}
                        />
                        <StyledConfigEditor/>
                        <Button onClick={() => processInput(configInput, {pointsonly: false})}>Generate</Button>
                        <OptionContainer>
                            <GenOption optionId={'autogen'} label={'Auto-generate'} setSelected={setAutoGen} checked={autoGen}/>
                            <GenOption optionId={'debug'} label={'Debug'} setSelected={setDebug} checked={debug}/>
                            <GenOption optionId={'autogen3d'} label={<>Auto-gen 3D <small>(slow)</small></>} setSelected={setAutoGen3D} checked={autoGen3D}/>
                        </OptionContainer>
                        {error && <Error>{error.toString()}</Error>}
                    </EditorContainer>
                </LeftSplitPane>

                <RightSplitPane>
                    {/*<Downloads setPreview={setPreviewKey}/>*/}
                    {previewKey && typeof previewContent === 'string' &&
                      <StyledFilePreview previewKey={previewKey} previewContent={previewContent}/>
                    }
                </RightSplitPane>
            </StyledSplit>
        </FlexContainer>
    );
}

export default Ergogen;