import Image from "next/image";
import { globby } from "globby";
import { builder } from "@/lib/img";

const excludedFiles: Array<string> = ["!public/media/**/*w.jpg"];

const monthsYear = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const brands = ["kodak", "fujifilm", "ilford"];

const splitFolder = (folder: string) => folder.split("-");

const getAlbum = (folder: string) => splitFolder(folder)[0];

const getYear = (folder: string) =>
  splitFolder(folder).filter(
    (m) => !monthsYear.find((month) => m === month) && m !== getAlbum(folder)
  )[0];

const getMonths = (folder: string) =>
  splitFolder(folder)
    .map((month) => monthsYear.find((m) => m === month))
    .filter((m) => m !== undefined);

const getPeriod = (folder: string) => {
  const months = getMonths(folder);
  const year = getYear(folder);
  return `${months[0]}${
    months[months.length - 1] === months[0]
      ? ""
      : ` - ${months[months.length - 1]}`
  }`;
};

const getBrand = (folder: string) =>
  splitFolder(folder).filter((m) => brands.find((b) => b === m))[0];

const getIso = (folder: string) =>
  splitFolder(folder)[splitFolder(folder).length - 1];

const getModelFilm = (folder: string) =>
  splitFolder(folder)
    .filter(
      (m) =>
        !monthsYear.find((month) => m === month) &&
        m !== getAlbum(folder) &&
        m !== getBrand(folder) &&
        m !== getIso(folder) &&
        m !== getYear(folder)
    )
    .join(" ");

const getFilm = (folder: string) => {
  const brand = getBrand(folder);
  const modelFilm = getModelFilm(folder);
  const iso = getIso(folder);
  return `${brand} ${modelFilm} ${iso}`;
};

async function getImages() {
  const res = await globby(["public/media/**/*.jpg", ...excludedFiles]);
  return res
    .map((file) => {
      const path = file.replace("public", "");
      const folder = file.replace("public/media", "").split("/")[1];
      const name = file.replace("public/media", "").split("/")[2];
      const album = getAlbum(folder);
      const period = getPeriod(folder);
      const year = getYear(folder);
      const film = getFilm(folder);

      return {
        album,
        name,
        path,
        film,
        period,
        year,
      };
    })
    .sort((a, b) => {
      if (a.album > b.album) {
        return -1;
      }
      if (a.album < b.album) {
        return 1;
      }
      return 0;
    });
}

export default async function Page() {
  const images = await getImages();
  const buildImages = images.map((image) => builder(image.path));

  return (
    <div className="px-3 pb-3 lg:px-6 lg:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 lg:gap-x-6 gap-y-4 max-w-7xl">
        <div className="col-span-1 md:col-span-9">
          <div className="flex items-center w-full min-h-[4rem] leading-none">
            <div className="flex flex-grow items-center gap-4">
              <div className="flex divide-x divide-gray-300 dark:divide-gray-800 border rounded-[0.25rem] border-gray-300 dark:border-gray-800 overflow-hidden shadow-sm">
                <a className="py-0.5 px-1.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 active:text-gray-400 dark:hover:bg-gray-950 dark:active:bg-gray-900/75 dark:active:text-gray-600 text-black dark:text-white">
                  <svg
                    width="28"
                    height="24"
                    viewBox="0 0 28 24"
                    fill="none"
                    stroke="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Full Frame</title>
                    <rect
                      x="5.625"
                      y="6.625"
                      width="16.75"
                      height="10.75"
                      rx="1"
                      strokeWidth="1.25"
                    ></rect>
                    <line
                      x1="5"
                      y1="3.875"
                      x2="23"
                      y2="3.875"
                      strokeWidth="1.25"
                    ></line>
                    <line
                      x1="23"
                      y1="20.125"
                      x2="5"
                      y2="20.125"
                      strokeWidth="1.25"
                    ></line>
                  </svg>
                </a>
                <a className="py-0.5 px-1.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 active:text-gray-400 dark:hover:bg-gray-950 dark:active:bg-gray-900/75 dark:active:text-gray-600 text-black dark:text-white">
                  <svg
                    width="28"
                    height="24"
                    viewBox="0 0 28 24"
                    fill="none"
                    stroke="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Grid</title>
                    <rect
                      x="5.625"
                      y="6.625"
                      width="16.75"
                      height="10.75"
                      rx="1"
                      strokeWidth="1.25"
                    ></rect>
                    <line
                      x1="11.375"
                      y1="7"
                      x2="11.375"
                      y2="18"
                      strokeWidth="1.25"
                    ></line>
                    <line
                      x1="16.875"
                      y1="7"
                      x2="16.875"
                      y2="18"
                      strokeWidth="1.25"
                    ></line>
                    <line
                      x1="5"
                      y1="12.0417"
                      x2="22.3333"
                      y2="12.0417"
                      strokeWidth="1.25"
                    ></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-[16rem] sm:min-h-[30rem]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 lg:gap-x-6 gap-y-4 max-w-7xl">
          <div className="col-span-1 md:col-span-9">
            <div className="space-y-4">
              <div className="grid gap-1 grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 items-center">
                {buildImages.map(({ image, sources, widths }) => (
                  <img
                    className="object-cover w-full h-full aspect-4/3"
                    key={image.src}
                    alt={image.alt}
                    src={image.src}
                    srcSet={image.srcset}
                    width={300}
                    height={200}
                    sizes={widths[0] + "px"}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-3 hidden md:block">
            <div className="sticky top-4 space-y-4">
              <div>holaa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
