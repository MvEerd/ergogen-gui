import React from "react";
import styled from "styled-components";

type TabPaneProps = {
    content: React.ReactComponentElement<any>,
    className?: string
};

const Pane = styled.div`
    position: relative;
    height: 100%;
`

const TabPane = ({content, className}: TabPaneProps) => {
    return (
        <Pane className={className}>
            {content}
        </Pane>
    );
}

export default TabPane;