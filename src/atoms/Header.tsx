import styled from "styled-components";

const HeaderContainer = styled.div`
      width: 100%;
      height: 4em;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

const LinkContainer = styled.div`
      a {
        color: white;
        text-decoration: none;
        display: inline-block;
        margin-right: 2em
      }
    `;

const H2Gradient = styled.h2`
  display: inline;
  background: #99d4d9;
  background: linear-gradient(to right, #99d4d9 0%, #b9dbaf 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const Header = (): JSX.Element => {
    return (
        <HeaderContainer>
            <div>
                <H2Gradient>Ergogen</H2Gradient>
            </div>

            <LinkContainer>
                <a href="#" rel="noreferrer">
                    {/*TODO fix*/}
                    Intro
                </a>
                <a href="https://docs.ergogen.xyz/" target="_blank" rel="noreferrer">
                    Docs
                </a>
                <a href="https://discord.gg/nbKcAZB" target="_blank" rel="noreferrer">
                    Discord
                </a>
            </LinkContainer>
        </HeaderContainer>
    );
}

export default Header;