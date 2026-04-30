import Link from "next/link";
import Image from "next/image";
import { PanelLeft, PanelRight } from "lucide-react";

interface SidenavHeaderProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const SidenavHeader: React.FC<SidenavHeaderProps> = ({
  sidebarExpanded,
  setSidebarExpanded,
}) => {
  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };
  return (
    <div className="flex justify-between items-center pr-3 sm:px-2 relative">
      <Link href="/" replace>
        <Image
          className={`mt-4 mb-8 w-[180px] h-auto ${sidebarExpanded ? "block" : "xs:hidden"}`}
          src="/AALogo.svg"
          height={32}
          width={180}
          alt="logo"
          onClick={handleLogoClick}
          priority
          sizes="180px"
          style={{ width: "auto", height: "auto" }}
        />
      </Link>

      <div
        className={`mt-4 mb-8 h-20 w-20 flex flex-col items-center relative ${
          sidebarExpanded ? "xs:hidden" : "block"
        }`}
      >
        <Link href="/" replace>
          <Image
            className="w-[100px] h-auto"
            src="/AALogo-collapse.svg"
            height={100}
            width={100}
            alt="logo"
            onClick={handleLogoClick}
            priority
            sizes="100px"
            style={{ width: "auto", height: "auto" }}
          />
        </Link>

        {!sidebarExpanded && (
          <button
            onClick={() => setSidebarExpanded(true)}
            className="absolute bottom-[-10px]"
          >
            <PanelRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {sidebarExpanded && (
        <button
          onClick={() => setSidebarExpanded(false)}
          className="ml-auto mb-12"
        >
          <PanelLeft className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default SidenavHeader;
