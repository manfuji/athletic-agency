import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export default function VideoPlayer({ url }: { url: string }) {
  return <ReactPlayer url={url} controls playing width={"100%"} height={500} />;
}
