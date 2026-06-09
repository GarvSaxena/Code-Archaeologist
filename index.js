const fs = require("fs");
const readline = require("readline");
const path = require("path");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function line() {
    console.log("============================================================");
}

function section(title) {
    console.log();
    line();
    console.log(title);
    line();
}

function showMenu() {

    line();
    console.log("                    CODE ARCHAEOLOGIST");
    line();

    rl.question("\nEnter the path: ", (dirPath) => {

        if (fs.existsSync(dirPath)) {
            console.log("\nScanning project...\n");
            getDirStats(dirPath);
        }
        else {
            console.log("\nInvalid path!\n");
            showMenu();
        }
    });
}

function getDirStats(dirPath) {

    const stats = fs.statSync(dirPath);

    let type;

    if (stats.isDirectory()) {
        type = "Directory";
    }
    else {
        type = "File";
    }

    section("PROJECT INFORMATION");

    console.log(`Name : ${path.basename(dirPath)}`);
    console.log(`Type : ${type}`);

    if (stats.isDirectory()) {
        scanDir(dirPath);
    }
    else {
        console.log("\nSingle file selected.");
    }

    console.log();
    line();
    console.log("Analysis Complete");
    line();

    rl.close();
}

function scanDir(dirPath) {

    let dirCount = 0;
    let fileCount = 0;
    let totalSize = 0;

    let largestFileName = "None";
    let largestFileSize = 0;

    const extensions = {};

    section("CONTENTS");

    console.log(
        `${"Path".padEnd(50)}${"Type".padEnd(15)}Size`
    );

    console.log("-".repeat(75));

    function traverse(currentPath) {

        const content = fs.readdirSync(currentPath);

        content.forEach((item) => {

            if (
                item === "node_modules" ||
                item === ".git"
            ) {
                return;
            }

            const itemPath = path.join(currentPath, item);
            const itemStats = fs.statSync(itemPath);

            let itemType;

            if (itemStats.isDirectory()) {

                itemType = "Directory";
                dirCount++;

            }
            else {

                itemType = "File";
                fileCount++;

                totalSize += itemStats.size;

                if (itemStats.size > largestFileSize) {
                    largestFileSize = itemStats.size;
                    largestFileName = itemPath;
                }

                const ext = path.extname(itemPath);

                if (extensions[ext]) {
                    extensions[ext]++;
                }
                else {
                    extensions[ext] = 1;
                }
            }

            console.log(
                `${itemPath.padEnd(50)}${itemType.padEnd(15)}${itemStats.size} B`
            );

            if (itemStats.isDirectory()) {
                traverse(itemPath);
            }
        });
    }

    traverse(dirPath);

    section("STATISTICS");

    console.log(`Directories : ${dirCount}`);
    console.log(`Files       : ${fileCount}`);
    console.log(`Total Size  : ${totalSize} B`);

    console.log();

    console.log("Largest File");
    console.log("-".repeat(30));

    console.log(`Name : ${largestFileName}`);
    console.log(`Size : ${largestFileSize} B`);

    section("EXTENSIONS");

    if (Object.keys(extensions).length === 0) {
        console.log("No files found.");
    }
    else {

        console.log(
            `${"Extension".padEnd(20)}Count`
        );

        console.log("-".repeat(30));

        for (const ext in extensions) {

            console.log(
                `${(ext || "[no extension]").padEnd(20)}${extensions[ext]}`
            );
        }
    }
}

showMenu();