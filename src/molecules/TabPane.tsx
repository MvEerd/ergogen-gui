import React from "react";

type TabPaneProps = {
    content: React.ReactComponentElement<any>,
    className?: string
};

const TabPane = ({content, className}: TabPaneProps) => {
    return (
        <div className={className}>
            {content}
        </div>
    );
}

export default TabPane;