import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../libs/service/extension";
import { Body, H1, Text, TextLink } from "../../components/Components";
import { HomeButton } from "../../components/HomeButton";
import { ArrowForwardIcon, LinkIcon } from "../../components/Icons";
import { AppRoute, relative } from "../../routes";
import packageJson from "/package.json";

enum SettingsRoutes {
  about = "/about",
  index = "/",
}

const Item = styled.div`
  font-size: large;
  color: ${(props) => props.theme.darkBlue};
  cursor: pointer;
  font-width: bold;
  padding: ${(props) => props.theme.padding} 0;
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SettingsIndex = () => {
  const navigate = useNavigate();
  return (
    <>
      <HomeButton />
      <Body>
        <H1>Account Settings</H1>
        <Item onClick={() => navigate(relative(SettingsRoutes.about))}>
          <span>About</span>
          <ArrowForwardIcon />
        </Item>
      </Body>
    </>
  );
};

const About = () => {
  return (
    <>
      <HomeButton path={AppRoute.settings} text="Back to Settings" />
      <Body>
        <H1>About</H1>
        <Text>
          <img
            src="tonmask-logo.svg"
            width="68"
            height="68"
            alt="OpenMask Logo"
          />
        </Text>
        <Text>OpenMask Beta version {packageJson.version}</Text>
        <Text>Non-custodial web extension wallet for The Open Network</Text>
        <Text>Links:</Text>
        <TextLink
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `https://openmask.app/`,
            });
          }}
        >
          Visit our website <LinkIcon />
        </TextLink>
        <TextLink
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `https://t.me/openproduct`,
            });
          }}
        >
          Telegram <LinkIcon />
        </TextLink>
        <TextLink
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `https://github.com/OpenProduct`,
            });
          }}
        >
          GitHub <LinkIcon />
        </TextLink>
        <TextLink
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `${packageJson.repository}/issues`,
            });
          }}
        >
          Issue Tracker <LinkIcon />
        </TextLink>
      </Body>
    </>
  );
};

export const Settings = () => {
  return (
    <Routes>
      <Route path={SettingsRoutes.about} element={<About />} />
      <Route path={SettingsRoutes.index} element={<SettingsIndex />} />
    </Routes>
  );
};