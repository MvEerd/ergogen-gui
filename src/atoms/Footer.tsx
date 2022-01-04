import styled from "styled-components";

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
                <a href="https://www.github.com/ergogen/ergogen" target="_blank" rel="noreferrer">
                    Ergogen by MrZealot
                </a>
            </div>
            <div>
                v{window.ergogen.version}
            </div>
            <div>
                Powering the <a href="https://zealot.hu/absolem" target="_blank" rel="noreferrer">Absolem</a>
            </div>
        </FooterContainer>
    );
}

export default Footer;