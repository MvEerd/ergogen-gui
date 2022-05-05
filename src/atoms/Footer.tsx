import styled from "styled-components";

declare global {
    interface Window {
        ergogen: any;
    }
}

const FooterContainer = styled.div`
      display: flex;
      height: 3rem;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem 0.5rem 1rem;
      margin-top: auto;
      color: #FFFFFF;

      a {
        color: #28a745;
        text-decoration: none;
        
        &:hover {
          color: #FFF;
        }
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