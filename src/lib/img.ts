export type Format = "avif" | "webp" | "jpg" | "png";

const getSrcSet = (src: string, format: Format, widths: string[]) =>
  widths.map((width) => `${src}-${width}w.${format} ${width}w`).join(", ");

export type Source = {
  srcset: string;
  type: string;
};

const widths = ["640", "768", "1024"];
const formats: Array<Format> = ["webp"];

export const builder = (src: string) => {
  const condition = formats.length >= 1;
  const file = src.split(".")[0];

  const originalFormat = src.split(".").pop();
  const restFormats = formats.filter((format) => format !== originalFormat);

  const sources = condition
    ? restFormats.map((format) => {
        return {
          srcset: getSrcSet(file, format, widths),
          type: `image/${format === "jpg" ? "jpeg" : format}`,
        };
      })
    : [];
  const image = {
    src: `${file}.${originalFormat}`,
    alt: "image",
    srcset: condition
      ? getSrcSet(file, originalFormat as Format, widths)
      : undefined,
    sizes: condition
      ? widths
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((width, i) =>
            i === widths.length - 1
              ? `100vw`
              : `(max-width: ${widths[i + 1]}px) ${width}px,`
          )
          .join(" ")
      : undefined,
  };

  return { image, sources, widths };
};
