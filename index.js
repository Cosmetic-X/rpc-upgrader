/*
 * Copyright (c) Jan Sohn
 * All rights reserved.
 * Only people with the explicit permission from Jan Sohn are allowed to modify, share or distribute this code.
 *
 * You are NOT allowed to do any kind of modification to this software.
 * You are NOT allowed to share this software with others without the explicit permission from Jan Sohn.
 * You MUST acquire this software from official sources.
 * You MUST run this software on your device as compiled file from our releases.
 */

global.time = function () {
	return (new Date().getTime() / 1000);
};
global.randomInt = (min, max) => {
	return Math.floor(Math.random() * ((max || 10) - (min || 1) + 1) + (min || 1));
}
global.getConfig = (key, default_value = undefined) => {
	if (!libraries.fs.existsSync(DATA_FOLDER("config.json"))) {
		libraries.fs.writeFileSync(DATA_FOLDER("config.json"), "{}");
		return {};
	}
	return JSON.parse(libraries.fs.readFileSync(DATA_FOLDER("config.json")).toString())[ key ] || default_value;
};
global.pkg = require("./package.json");
global.config = require('./resources/config.json');

global.TEST_MODE = isInTestMode();
global.DEBUG_MODE = config["debug_mode"] || false;

if (DEBUG_MODE) {
	console.log(DEBUG_MODE ? "Debug mode enabled." : "Debug mode disabled.");
}
global.COSMETICX_LINK = TEST_MODE ?"http://localhost:" + config["cosmetic-x"]["backend"]["port"] : "https://cosmetic-x.de";

if (TEST_MODE) {
	console.log("Test mode enabled.");
	config["cosmetic-x"]["rpc"]["host"] = "localhost";
} else {
	console.log("Test mode disabled.");
}

global.libraries = {
	fs: require("fs"),
	os: require("os"),
	path: require("path"),
	axios: require("axios"),
	exec: require("child_process").exec,
};

global.DATA_FOLDER = function (path) {
	return libraries.path.join(libraries.path.join((require("appdata-path"))("Cosmetic-X"), "/"), path || "");
};
global.COSMETICX_NATIVE_IMAGE = (require("electron")).nativeImage.createFromPath(libraries.path.join("resources/images", "logo.png"));

console.log("Starting Electron..");
global.electron = require("electron");
global.app = electron.app;

if (!electron.app.requestSingleInstanceLock()) {
	electron.app.quit();
	return;
}
electron.app.setAppUserModelId("de.cosmetic-x.rpc-client")


try {
	//TODO: Add more
} catch (e) {
	console.error(e);
}
require("./src/index.js");


function isInTestMode() {
	// Renderer process
	if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
		return true;
	}
	// Main process
	if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
		return true;
	}
	// Detect the user agent when the `nodeIntegration` option is set to true
	if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
		return true;
	}
}
