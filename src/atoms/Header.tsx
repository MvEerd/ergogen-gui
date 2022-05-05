import styled from "styled-components";

const HeaderContainer = styled.div`
      width: 100%;
      height: 4em;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem 0 1rem;
`;

const LinkContainer = styled.div`
      a {
        color: white;
        text-decoration: none;
        display: inline-block;
        margin-right: 2em
      }
      a:last-of-type{
        margin-right: 0;
      }
    `;



const Header = (): JSX.Element => {
    return (
        <HeaderContainer>
            <div>
                <h2>Ergogen</h2>
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