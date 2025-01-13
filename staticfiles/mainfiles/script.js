// global.js
window.getCurrentDateTime = function () {
  const now = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC", // Specify UTC explicitly
    timeZoneName: "short",
  };

  const formattedDateTime = now.toLocaleString("en-US", options);
  return formattedDateTime;
};
