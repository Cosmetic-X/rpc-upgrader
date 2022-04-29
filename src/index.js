app.on("ready", async () => {
	if (!["darwin", "win32"].includes(require("os").platform())) {
		return electron.dialog.showErrorBox("Unsupported OS", "This application is only supported on macOS and Windows") && process.exit();
	}
	//let data = await libraries.axios.get(COSMETICX_LINK + "/api/versions").catch(() => electron.dialog.showMessageBox(null, { type:"error", message:"Service is offline" }) && process.exit());
	let data = {app:"0.1.2"}
	if (!data?.app) {
		return electron.dialog.showMessageBox(null, { type:"error", message:"Could not check for updates" }) && process.exit();
	}
	if (getConfig("client.version", "0.0.0") >= data.app) {
		return electron.dialog.showMessageBox(null, {
			message: "There are currently no updates available.",
			type: "info"
		}) && process.exit();
	}
	electron.dialog.showOpenDialog({
		title: "Select the 'Rich-Presence-Client.exe' file",
		defaultPath: libraries.path.dirname(electron.app.getPath("exe")),
		properties: [ "openFile" ],
		filters: [
			{
				name: "Rich-Presence-Client.exe",
				extensions: [ "exe" ],
			},
		],
	}).then(({ canceled, filePaths }) => {
		if (!canceled) {
			filePaths[ 0 ] = filePaths[ 0 ].replace(/\\/g, "/");
			if (TEST_MODE && filePaths[ 0 ].endsWith("electron/dist/electron.exe")) {
				electron.dialog.showErrorBox("Important", "Please don't do that, its not a good idea.");
			} else {
			}
			if (!libraries.fs.existsSync(DATA_FOLDER("updated.exe"))) {
				if (!downloadNewVersion(DATA_FOLDER("updated.exe"))) {
					return electron.dialog.showErrorBox("Error", "Could not download the new version") && process.exit();
				}
			}
			if (!libraries.fs.existsSync(DATA_FOLDER("updated.exe"))) {
				electron.dialog.showErrorBox("Just in case Error (This is bad) ", "Please update the Rich-Presence-Client first.");
			} else {
				libraries.fs.rmSync(filePaths[ 0 ]);
				libraries.fs.copyFileSync(DATA_FOLDER("updated.exe"), filePaths[ 0 ]);
				libraries.fs.rmSync(DATA_FOLDER("updated.exe"));
			}
		}
		app.quit();
		process.exit();
	});
});

async function downloadNewVersion(updaterPath) {
	const response = await libraries.axios({
		url: COSMETICX_LINK + "/downloads/rpc/client/" + (libraries.os.platform() === "win32" ? "exe" : "app"),
		method: "GET",
		responseType: "stream"
	});
	if (!response) {
		return false;
	}
	const writer = libraries.fs.createWriteStream(updaterPath);
	response.data.pipe(writer);

	let value = await new Promise((resolve, reject) => {
		writer.on("finish", () => resolve(true));
		writer.on("error", () => resolve(false));
	}).catch(errorHandler);
	libraries.exec(updaterPath, errorHandler);
	return value;

	async function errorHandler(err) {
		let value = await electron.dialog.showMessageBox({
			title: `Error while updating Rich-Presence-Client`,
			message: `If this error persists reinstall the app from our releases.`,
			detail: err.message,
			buttons: ["Okay", "Reinstall Application"],
			type: "error"
		});
		if (value.response === 1) {
			electron.shell.openExternal(COSMETICX_LINK + "/downloads");
		}
	}
}