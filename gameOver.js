window.onload = (event) => {
    const urlParams = new URLSearchParams(
        window.location.search,
    );

    let level = urlParams.get('level');
    document.getElementById("levelText").innerHTML = "Last played level: Level " + level;
};