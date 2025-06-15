let h = document.getElementById("h");
h.addEventListener("click", () => {
    h.style.color = "green";
    fetch("/logs/up", {
        method: "POST",
    })
        .then(r => r.json())
        .then(re => h.innerHTML = re.welcome)
        .catch(er => {
        console.error(er)
        })
});