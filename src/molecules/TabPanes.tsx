import React from "react";

type TabProps = {
    children: React.ReactChildren
}

const Tab = ({children}: TabProps) => {
    return children;
}

type TabPanesProps = {
    label: string,
    children: React.ReactChildren,
    className?: string
};

const TabPanes = ({label, children, className}: TabPanesProps) => {
    return (
        <div className={className}>
            <h1>{label}</h1>
            {children}
        </div>
    );
}


export default TabPanes;