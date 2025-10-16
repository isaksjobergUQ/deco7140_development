const initGalleryViewer = () => {
    const viewer = document.getElementById("viewer");
    const viewerImg = document.getElementById("viewer-img");
    const viewerCaption = document.getElementById("viewer-caption");
    const closeBtn = document.getElementById("close-viewer");

    document.querySelectorAll(".gallery img").forEach((img) => {
        img.addEventListener("click", () => {
            viewerImg.src = img.src;
            viewerImg.alt = img.alt;
            viewerCaption.textContent = img.alt;
            viewer.classList.add("open");
            viewer.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        });
    });

    closeBtn.addEventListener("click", () => {
        viewer.classList.remove("open");
        viewer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "auto";
    });
};

export { initGalleryViewer };

