const googleScriptUrl = "https://script.google.com/macros/s/AKfycbxYhuEMbVP0_hkX80LKgus-vjJiBFbCte035vbAWcOOp3JVAeyZ-JwZV4i6jA1g2CVG/exec";
const weddingDate = new Date("2026-12-23T18:30:00+02:00");
const pageLoader = document.getElementById("pageLoader");
const openEnvelope = document.getElementById("openEnvelope");
const weddingMusic = document.getElementById("weddingMusic");
const musicToggle = document.getElementById("musicToggle");
const calendarLink = document.getElementById("calendarLink");
const appleCalendarLink = document.getElementById("appleCalendarLink");
const rsvpForm = document.getElementById("rsvpForm");
let invitationOpened = false;

function updateCountdown() {
  const distance = Math.max(weddingDate.getTime() - Date.now(), 0);
  const values = {
    Days: Math.floor(distance / 86400000),
    Hours: Math.floor(distance / 3600000) % 24,
    Minutes: Math.floor(distance / 60000) % 60,
    Seconds: Math.floor(distance / 1000) % 60
  };
  Object.entries(values).forEach(([name, value]) => {
    [name.toLowerCase(), `loader${name}`].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value).padStart(2, "0");
    });
  });
}

function finishLoader() {
  document.body.classList.add("loader-finished");
  document.body.classList.remove("is-loading");
  window.setTimeout(() => pageLoader?.remove(), 800);
}

function updateMusicButton() {
  if (!musicToggle || !weddingMusic) return;
  const playing = !weddingMusic.paused;
  musicToggle.classList.toggle("playing", playing);
  musicToggle.textContent = playing ? "Ⅱ" : "♪";
  musicToggle.setAttribute("aria-label", playing ? "Mettre la musique en pause" : "Lancer la musique");
}

function playMusic() {
  if (!weddingMusic) return;
  weddingMusic.currentTime = 0;
  weddingMusic.play().catch(() => {});
}

function toggleMusic() {
  if (!weddingMusic) return;
  if (weddingMusic.paused) weddingMusic.play().catch(() => {});
  else weddingMusic.pause();
}

function openInvitation() {
  if (invitationOpened) return;
  invitationOpened = true;
  playMusic();
  document.body.classList.add("invitation-open");
  const firstPage = document.querySelector(".first-page");
  if (firstPage) firstPage.classList.add("is-visible");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function createCalendarLinks() {
  const title = encodeURIComponent("Mariage Eve & Eytan");
  const details = encodeURIComponent("Kabbalat Panim à 18h30. Houppa à 19h30.");
  const location = encodeURIComponent("Salle Ya'ar, 1 Yasmin Street, Mate Yehuda Regional Council 90, Israel");
  if (calendarLink) {
    calendarLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261223T163000Z/20261223T213000Z&details=${details}&location=${location}`;
  }
  if (appleCalendarLink) {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      "UID:mariage-eve-eytan-20261223", "DTSTART:20261223T163000Z",
      "DTEND:20261223T213000Z", "SUMMARY:Mariage Eve & Eytan",
      "DESCRIPTION:Kabbalat Panim à 18h30. Houppa à 19h30.",
      "LOCATION:Salle Ya'ar, Moshav Ora, Jérusalem", "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    appleCalendarLink.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    appleCalendarLink.download = "mariage-eve-eytan.ics";
  }
}

function setupScrollReveal() {
  const elements = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach((element) => observer.observe(element));
}

async function handleRsvpSubmit(event) {
  event.preventDefault();
  const side = document.getElementById("guestSide").value;
  const name = document.getElementById("guestName").value.trim();
  const guestCount = document.getElementById("guestCount").value;
  const message = document.getElementById("guestMessage").value.trim();
  const attendance = document.querySelector('input[name="attendance"]:checked')?.value || "yes";
  if (!side || !name) return alert("Merci de choisir un côté et d’indiquer votre nom.");
  const button = rsvpForm.querySelector('button[type="submit"]');
  button.disabled = true;
  button.innerHTML = "ENVOI EN COURS…";
  try {
    await fetch(googleScriptUrl, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        side, name,
        attendance: attendance === "yes" ? "Oui, je viens" : "Non, je ne pourrai pas",
        guestCount, message
      })
    });
    alert("Merci, votre réponse a bien été envoyée.");
    rsvpForm.reset();
  } catch {
    alert("Une erreur est survenue. Merci de réessayer.");
  } finally {
    button.disabled = false;
    button.innerHTML = "ENVOYER MA RÉPONSE <span>→</span>";
  }
}

openEnvelope?.addEventListener("click", openInvitation);
musicToggle?.addEventListener("click", toggleMusic);
weddingMusic?.addEventListener("play", updateMusicButton);
weddingMusic?.addEventListener("pause", updateMusicButton);
weddingMusic?.addEventListener("timeupdate", () => {
  if (weddingMusic.currentTime >= 74) {
    weddingMusic.pause();
    weddingMusic.currentTime = 0;
  }
});
rsvpForm?.addEventListener("submit", handleRsvpSubmit);

updateCountdown();
setInterval(updateCountdown, 1000);
createCalendarLinks();
setupScrollReveal();
updateMusicButton();
window.setTimeout(finishLoader, 5000);
