import AA_LOGO from "./AA-LOGO";
import { LOGO } from "@/lib/constant";
import { socials } from "@/lib/loops";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-primary  text-white flex flex-col md:flex-row justify-between md:items-center gap-y-32 px-[18px] lg:px-20 pt-14 pb-6 md:pt-24 md:pb-16">
      <div className="space-y-8">
        <h1 className="font-evogria text-3xl">CONTACT US</h1>
        <div className="flex flex-col gap-y-6">
          <div className="font-inter text-base flex flex-col gap-y-6">
            <p>Phone: +233533297424</p>
            <p>
              Email:{" "}
              <span className="underline">AASN@theathleticagency.net</span>
            </p>
          </div>
          <div className="flex items-center gap-x-4">
            {socials.map((social, i) => (
              <Link href={social.link} target="_blank" key={i}>
                <social.icon size={32} />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-1">
        <AA_LOGO
          logo={LOGO.WHITE}
          className="w-[204px] h-[76px] sm:w-[411px] sm:h-[150px]"
        />
        <p className="font-inter text-xs sm:text-lg">
          &copy; {new Date().getFullYear()} The Athletic Agency. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
