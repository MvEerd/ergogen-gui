import React from 'react';
import ReactDOM from 'react-dom';
import styled from "styled-components";
import './index.css';

import Ergogen from './Ergogen';
import Header from "./atoms/Header";
import Footer from "./atoms/Footer";
import ConfigContextProvider from "./context/ConfigContext";
import Absolem from "./examples/absolem";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: #FFFFFF;
  height: 100%;
  width: 100%;
`;

ReactDOM.render(
  <React.StrictMode>
      <>
          <AppContainer>
              <Header/>
              <ConfigContextProvider initialInput={Absolem.value}>
                <Ergogen />
              </ConfigContextProvider>
              <Footer/>
          </AppContainer>
      </>
  </React.StrictMode>,
  document.getElementById('root')
);