alert("welcome to PWA");

const installButton = document.querySelector("#install-button");
const installStatus = document.querySelector("#install-status");
let installPromptEvent;

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButton() {
  if (isRunningStandalone()) {
    installButton.disabled = true;
    installButton.querySelector("span").textContent = "App installed";
  }
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPromptEvent = event;
  installStatus.textContent = "";
});

installButton.addEventListener("click", async () => {
  if (isRunningStandalone()) {
    installStatus.textContent = "This app is already installed.";
    return;
  }

  if (!installPromptEvent) {
    installStatus.textContent = "Install this app from your browser menu. On iPhone or iPad, use Share, then Add to Home Screen.";
    return;
  }

  installPromptEvent.prompt();
  const choice = await installPromptEvent.userChoice;
  installStatus.textContent = choice.outcome === "accepted" ? "Thanks for installing!" : "Installation was cancelled.";
  installPromptEvent = undefined;
});

window.addEventListener("appinstalled", () => {
  installStatus.textContent = "Thanks for installing!";
  updateInstallButton();
});

updateInstallButton();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.error("Service worker registration failed:", error);
    });
  });
}