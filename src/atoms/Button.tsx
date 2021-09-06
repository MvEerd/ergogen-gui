import React from 'react';
import styled from "styled-components";

type Props = {
    size?: string,
    children: React.ReactNode,
    onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
};

const Button = styled.button`
  display: inline-block;
  border: none;
  padding: 1rem 2rem;
  margin: 0;
  text-decoration: none;
  background-image: linear-gradient(320deg, #70c3d7 0%, #42aca2 100%);
  color: #ffffff;
  font-family: sans-serif;
  font-size: 1.2rem;
  cursor: pointer;
  text-align: center;
  transition: all 50ms ease-in-out,
  transform 150ms ease;
  -webkit-appearance: none;
  -moz-appearance: none;

  &:hover {
    background-image: linear-gradient(320deg, #66b1c6 0%, #3ba096 100%);
  }

  &:active {
    transform: scale(0.98);
    outline: 2px solid #fff;
    outline-offset: -5px;
  }
`;

const MediumButton = styled(Button)`
    padding: 0.7rem 1.4rem;
    font-size: 1rem;
`;

const SmallButton  = styled(Button)`
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
`;

const styledButton = ({size, ...rest}: Props): JSX.Element => {
    switch(size){
        case "sm":
        case "small":
            return <SmallButton {...rest}/>;
        case "md":
        case "medium":
            return <MediumButton {...rest}/>;
        case "lg":
        case "large":
        default:
            return <Button {...rest}/>;
    }
};

export default styledButton;