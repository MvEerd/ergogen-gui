import styled from "styled-components";
import {ReactComponent as CacheWorksLogo} from './cacheworks.svg';

declare global {
    interface Window {
        ergogen: any;
    }
}

const FooterContainer = styled.div`
      display: flex;
      margin-top: auto;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 0 1em 0.5em 1em;
      color: #FFFFFF;

      a {
        color: white;
        text-decoration: none;
      }
    `;

const Footer = (): JSX.Element => {
    return (
        <FooterContainer>
            <div>
                <a href="https://www.github.com/MrZealot/ergogen" target="_blank" rel="noreferrer">
                    Ergogen by MrZealot
                </a>
            </div>
            <div>
                <CacheWorksLogo />
            </div>
            <div>
                v{window.ergogen.version}
            </div>
        </FooterContainer>
    );
}

export default Footer;