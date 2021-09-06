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

const H3Gradient = styled.h3`
  display: inline;
  background: #d999a6;
  background: linear-gradient(to right, #d999a6 0%, #d4afdb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const Header = (): JSX.Element => {
    return (
        <HeaderContainer>
            <div>
                <H2Gradient>Ergogen UI </H2Gradient>
                <H3Gradient>Beta by cache</H3Gradient>
            </div>

            <LinkContainer>
                <a href="https://www.github.com/MrZealot/ergogen" target="_blank" rel="noreferrer">
                    Ergogen
                </a>
                <a href="https://github.com/mrzealot/ergogen/blob/master/docs/reference.md" target="_blank" rel="noreferrer">
                    Docs
                </a>
            </LinkContainer>
        </HeaderContainer>
    );
}

export default Header;