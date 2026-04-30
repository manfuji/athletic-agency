"use client";

import AA_LOGO from "./AA-LOGO";
import { LOGO } from "@/lib/constant";
import Button from "./Button";
import Link from "next/link";
import NavLinks from "./nav-links";
import SelectType from "../competitions/select-type";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import AnimationsWrapper from "../animations/animations-wrapper";
import SelectVideos from "../videos/select-videos";

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  return (
    <nav className="flex justify-between items-center px-[18px] lg:px-20 py-3 bg-white">
      <AA_LOGO logo={LOGO.PRIMARY} />

      <div className="font-evogria lg:flex gap-x-6 items-center hidden">
        <NavLinks />
        <SelectVideos />
        <SelectType />

        <Link href="/#inquiry">
          <Button className="text-sm py-2 px-[14px] sm:px-5 sm:py-3">
            Make Enquiry
          </Button>
        </Link>
      </div>

      {/* Mobile Nav */}

      <Menu size={28} className="lg:hidden" onClick={toggleMobileMenu} />

      {isMobileOpen && (
        <AnimationsWrapper
          variant="slideInLeft"
          className="fixed lg:hidden top-0 left-0 w-full h-full bg-primary text-white z-30 p-4"
        >
          <X
            size={32}
            className="absolute top-4 right-4"
            onClick={toggleMobileMenu}
          />

          <div onClick={toggleMobileMenu}>
            <AA_LOGO logo={LOGO.WHITE} />
          </div>

          <div className="flex flex-col gap-y-10 mt-14 font-evogria  text-xl lg:text-base">
            <div className="flex flex-col gap-y-10" onClick={toggleMobileMenu}>
              <NavLinks />
            </div>
            <SelectVideos onClose={toggleMobileMenu} />
            <SelectType onClose={toggleMobileMenu} />
            <Link href="/#inquiry" onClick={toggleMobileMenu}>
              <Button className="bg-white text-primary py-2 px-[14px] sm:px-5 sm:py-3">
                Make Enquiry
              </Button>
            </Link>
          </div>
        </AnimationsWrapper>
      )}
    </nav>
  );
};

export default Navbar;
