import React from 'react';
import styled from "styled-components";
import {OpenJSCAD} from "openjscad-react";

type Props = {
    previewContent: string
};

const StyledOpenJSCAD = styled(OpenJSCAD)`
  width: 100%;
  height: 400px;
`;

const JscadPreview = ({previewContent}: Props): JSX.Element => (
    <StyledOpenJSCAD
         jscadScript={previewContent}
         style={{
             wrapperDiv: {'height': '100%', 'width': '100%'},
             viewerCanvas: {'height': '400px', 'width': '100%'},
         }}
    />
);

export default React.memo(JscadPreview);