import {useEffect, useState} from "react";
import styled from "styled-components";
import Split from "react-split";

import ConfigEditor from "./molecules/ConfigEditor";
import Downloads from "./molecules/Dowloads";
import FilePreview from "./molecules/FilePreview";

import {useConfigContext} from "./context/ConfigContext";
import Button from "./atoms/Button";
import Select from "react-select";
import GenOption from "./atoms/GenOption";
import Tabs from "./organisms/Tabs";
import {ConfigOption, exampleOptions} from "./examples";

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

const StyledSelect = styled(Select)`
    color: black;
    white-space: nowrap;
`;

// @ts-ignore
const StyledSplit = styled(Split)`
  width: 100%;
  height: 100%;
  display: flex;
  padding: 1rem;

  .gutter {
    background-color: #878787;
    border-radius: 0.15rem;

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
    position: relative;
`;

const RightSplitPane = styled.div`
    padding-left: 1rem;
    position: relative;
`;

const Ergogen = () => {
    const [previewKey, setPreviewKey] = useState("demo.svg");
    const [selectedOption, setSelectedOption] = useState<ConfigOption|null>(null);
    const configContext = useConfigContext();

    useEffect(()=>{
        if(selectedOption?.value) {
            configContext?.setConfigInput(selectedOption.value)
        }
    }, [selectedOption]);

    if (!configContext) return null;


    let walkArray = configContext?.results;
    // Walk through the JSON keys until we get the content of the desired previewKey
    previewKey.split(".").forEach((key) => walkArray = walkArray?.[key]);

    let previewContent = typeof walkArray === 'string' ? walkArray : "";

    return (
        <FlexContainer>
            <StyledSplit
                direction={"horizontal"}
                sizes={[30, 70]}
                minSize={100}
                gutterSize={10}
                snapOffset={0}
            >
                <LeftSplitPane>
                    <EditorContainer>
                        <StyledSelect
                            options={exampleOptions}
                            value={selectedOption}
                            // @ts-ignore
                            onChange={(newValue: ConfigOption|null) => setSelectedOption(newValue)}
                            placeholder={"Paste your config below, or select an example here!"}
                        />
                        <StyledConfigEditor/>
                        <Button onClick={() => configContext?.processInput(configContext?.configInput, {pointsonly: false})}>Generate</Button>
                        <OptionContainer>
                            <GenOption optionId={'autogen'} label={'Auto-generate'} setSelected={configContext?.setAutoGen} checked={configContext?.autoGen}/>
                            <GenOption optionId={'debug'} label={'Debug'} setSelected={configContext?.setDebug} checked={configContext?.debug}/>
                            <GenOption optionId={'autogen3d'} label={<>Auto-gen 3D <small>(slow)</small></>} setSelected={configContext?.setAutoGen3D} checked={configContext?.autoGen3D}/>
                        </OptionContainer>
                        {configContext?.error && <Error>{configContext?.error?.toString()}</Error>}
                    </EditorContainer>
                </LeftSplitPane>

                <RightSplitPane>
                    <StyledSplit
                        direction={"horizontal"}
                        sizes={[70, 30]}
                        minSize={100}
                        gutterSize={10}
                        snapOffset={0}
                    >
                        <LeftSplitPane>
                            <StyledFilePreview key={previewKey} previewKey={previewKey} previewContent={previewContent}/>
                        </LeftSplitPane>
                        <RightSplitPane>
                            <Downloads setPreview={setPreviewKey}/>
                        </RightSplitPane>
                    </StyledSplit>
                </RightSplitPane>
            </StyledSplit>
        </FlexContainer>
    );
}

export default Ergogen;