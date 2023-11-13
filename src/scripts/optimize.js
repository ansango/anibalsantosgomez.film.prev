import sharp from "sharp";
import {
  lstatSync,
  existsSync,
  rmdirSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import { extname, basename, dirname } from "node:path";
import { globby } from "globby";
import minimist from "minimist";

let params = {
  sourceFolder: null,
  targetFolder: null,
  inputFormats: null,
  outputFormats: null,
  widths: null,
  enlarge: false,
  clearTarget: false,
};

function validateParams(args) {
  if (!args) {
    console.error("Missing execution arguments");
    return false;
  }

  params.sourceFolder = args.sourceFolder;
  params.targetFolder = args.targetFolder;
  params.inputFormats = args.inputFormats;
  params.outputFormats = args.outputFormats;
  params.widths = args.widths;
  params.enlarge = args.enlarge;
  params.clearTarget = args.clearTarget;

  if (!params.sourceFolder) {
    console.error("sourceFolder missing");
    return false;
  }
  if (!params.targetFolder) {
    console.error("targetFolder missing");
    return false;
  }
  if (!params.inputFormats) {
    console.error("inputFormats missing");
    return false;
  }

  if (!(params.inputFormats instanceof Array)) {
    params.inputFormats = [params.inputFormats];
  }

  if (!(params.outputFormats instanceof Array)) {
    params.outputFormats = [params.outputFormats];
  }

  if (!(params.widths instanceof Array)) {
    params.widths = [params.widths];
  }

  return true;
}

async function removeGeneratedFiles() {
  const generated = await globby([
    ...params.outputFormats.map((format) => `**/*w.${format}`),
  ]);
  generated.forEach((file) => {
    console.log(`Deleting ${file}`);
    unlinkSync(file);
  });
}

async function runAllOptimizations() {
  const src = params.sourceFolder + "/**/*";

  await removeGeneratedFiles();
  const res = await globby([src]);

  res.forEach((filepath) => {
    if (
      !lstatSync(filepath).isDirectory() &&
      params.inputFormats.indexOf(
        extname(filepath).split(".").pop().toLowerCase()
      ) >= 0
    ) {
      console.log(`Optimizing ${filepath}`);
      params.outputFormats.forEach((format) => {
        if (params.widths) {
          params.widths.forEach((width) => {
            optimize(filepath, format, width);
          });
        } else {
          optimize(filepath, format);
        }
      });
    }
  });
}

function optimize(filePath, newFormat, width) {
  const originalFormat = basename(filePath).split(".")[1];
  const fileName = basename(filePath).split(".")[0];
  const fileRelativePath = filePath.replace(params.sourceFolder, "");

  if (originalFormat === newFormat && !width) {
    return;
  }
  verifyCreateFolder(dirname(`${params.targetFolder}${fileRelativePath}`));

  sharp(filePath)
    .resize(width ? width : null, null, { withoutEnlargement: !params.enlarge })
    .toFile(mountName(), (err) => {
      if (err) {
        console.log(err);
      }
    });

  function mountName() {
    let res = `${params.targetFolder}${dirname(fileRelativePath)}/${fileName}`;

    if (width) {
      res += `-${width}w`;
    }
    res += `.${newFormat ? newFormat : originalFormat}`;

    return res;
  }
}

function verifyCreateFolder(directory, deleteIfExists) {
  if (existsSync(directory) && deleteIfExists) {
    console.log("Deleting folder");
    rmdirSync(directory, { recursive: true });
  }
  mkdirSync(directory, { recursive: true });
}

const run = (args) => {
  if (validateParams(args)) {
    verifyCreateFolder(params.targetFolder, Boolean(params.clearTarget));
    runAllOptimizations();
    return true;
  } else {
    return false;
  }
};

function printHelpText() {
  console.log(`
  OPTIMIZE

  This is a helper script that automatically converts and resizes your images based on the arguments given.

  Available arguments:
    --help, -h        Displays this help text
    
    --run, -r         Executes the script
      --sourceFolder      REQUIRED - The relative or absolute path to the folder where the images currently are.
      --targetFolder      REQUIRED - The relative or absolute path to the destination folder where the converted images will be saved at. Warning: all contents in the folder will be deleted prior to execution.
      --inputFormats      REQUIRED - The existing formats that the script will look for, like jpg and png.
      --targetFormats     REQUIRED - The formats the script will convert to.
      --widths            Optional - The widths to which the images will be resized to. If not declared, images will be kept at their original size.
      --enlarge           Optional - Defines if images should be enlarged in case their original width is smaller than the target size defined on --widths.
      --clearTarget       Optional - Defines if the targetFolder should be cleared (all files deleted) before the optimization runs.
  `);
}

export function cli() {
  if (process.env.NODE_ENV == "production") {
    console.log("Not in production mode. Skipping optimize script.");
    return;
  }
  let args = minimist(process.argv.slice(2));

  if (args.run === true || args.R === true || args.r === true) {
    const result = run(args);

    if (!result) {
      printHelpText();
    }
  } else if (args.help === true || args.H === true || args.h === true) {
    printHelpText();
  } else {
    printHelpText();
  }
}

cli();
