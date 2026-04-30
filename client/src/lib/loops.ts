// Public image URLs for use with <Image src="..."/>
// Using strings avoids trying to import files from /public (not supported by TS module resolution).
const mission1 = "/images/MISSION_1.JPG";
const mission2 = "/images/MISSION_2.png";
const mission3 = "/images/MISSION_3.JPG";
const mission4 = "/images/MISSION_4.JPG";
const mission5 = "/images/MISSION_5.JPG";
const mission6 = "/images/MISSION_6.JPG";
import { LuInstagram } from "react-icons/lu";
import { SiLinkedin, SiYoutube } from "react-icons/si";
import { BsTwitch, BsTwitterX } from "react-icons/bs";

export const Mission = [
  mission1,
  mission2,
  mission3,
  mission4,
  mission5,
  mission6,
];

export const Inquiries = [
  { id: 1, value: "How do I Join the Athletic Agency?" },
  { id: 2, value: "How do I register for the Summer Series?" },
  { id: 3, value: "How do I access more detailed stats?" },
  { id: 4, value: "When does registration close for the Summer Series?" },
  { id: 5, value: "Others" },
];

export const leadershipBoardTabs = [
  "Goals",
  "Assists",
  "Yellow cards",
  "Red cards",
];

export const leagueTabs = (basePath: string) => [
  {
    name: "Highlights",
    path: `${basePath}`,
  },
  {
    name: "Results",
    path: `${basePath}/results`,
  },
  {
    name: "Table",
    path: `${basePath}/table`,
  },
  {
    name: "News",
    path: `${basePath}/news`,
  },
  {
    name: "Teams",
    path: `${basePath}/teams`,
  },
];

export const navLinks = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "News",
    path: "/news",
  },
];

export const socials = [
  {
    icon: BsTwitterX,
    link: "https://x.com/TheAAgencySport",
  },
  {
    icon: SiLinkedin,
    link: "https://www.linkedin.com/company/the-athletic-agency",
  },
  {
    icon: LuInstagram,
    link: "https://www.instagram.com/aasportshub/",
  },
  {
    icon: BsTwitch,
    link: "https://www.twitch.tv/aasportsnetwork",
  },
  {
    icon: SiYoutube,
    link: "http://www.youtube.com/@AASports-d4q",
  },
];

export const leagueTableHeaders = ["PL", "W", "D", "L", "F", "A", "GD", " Pts"];

export const videoType = [
  {
    name: "Live videos",
    path: "/live-videos",
  },
  {
    name: "Video library",
    path: "/video-library",
  },
];
