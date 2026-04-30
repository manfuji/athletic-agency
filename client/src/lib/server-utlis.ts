export const getServerHtmlContent = async (html: string): Promise<string> => {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(html);
  return dom.window.document.body.innerHTML;
};
