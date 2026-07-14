import net from "node:net";

const DEFAULT_PORT = 3310;

export function isVirusScanRequired() {
  if (process.env.VIRUS_SCAN_REQUIRED !== undefined) return process.env.VIRUS_SCAN_REQUIRED === "true";
  return process.env.NODE_ENV === "production";
}

// Uses ClamAV's clamd INSTREAM protocol so document bytes never touch disk.
export function scanDocument(buffer) {
  const host = process.env.CLAMAV_HOST;
  if (!host) return Promise.resolve({ status: "unavailable" });

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port: Number(process.env.CLAMAV_PORT || DEFAULT_PORT) });
    let response = "";
    const timeout = setTimeout(() => socket.destroy(new Error("ClamAV scan timed out")), 15_000);

    socket.on("connect", () => {
      socket.write("zINSTREAM\0");
      const length = Buffer.alloc(4);
      length.writeUInt32BE(buffer.length);
      socket.write(length);
      socket.write(buffer);
      socket.write(Buffer.alloc(4));
    });
    socket.on("data", (data) => {
      response += data.toString("utf8");
      if (response.includes("OK") || response.includes("FOUND")) socket.end();
    });
    socket.on("error", reject);
    socket.on("close", () => {
      clearTimeout(timeout);
      if (response.includes("FOUND")) return resolve({ status: "infected" });
      if (response.includes("OK")) return resolve({ status: "clean" });
      return reject(new Error(`Unexpected ClamAV response: ${response || "none"}`));
    });
  });
}
