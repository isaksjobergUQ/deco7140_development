// Community page functionality
import { fetchGetData } from "./modules/getData.js";
import { postFormData } from "./modules/postFormData.js";
import { storage } from "./modules/storage.js";
import { i18n } from "./modules/i18n.js";

// API Configuration
const API_BASE_URL =
    "https://damp-castle-86239-1b70ee448fbd.herokuapp.com/decoapi/";
const CHAT_ENDPOINT = `${API_BASE_URL}genericchat/`;
const STUDENT_NUMBER = "s4978714";
const UQ_CLOUD_ZONE_ID = "435eba26";

let allThreads = [];
let allGroups = [];

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
    await i18n.init();
    document.getElementById("year").textContent = new Date().getFullYear();
    await loadCommunityData();
    setupLikeHandlers();
    setupGroupHandlers();
    setupNewPostForm();
});

async function loadCommunityData() {
    try {
        const [threads, groups, apiPosts] = await Promise.all([
            fetchGetData("./data/threads.json"),
            fetchGetData("./data/groups.json"),
            fetchGetData(CHAT_ENDPOINT, {
                student_number: STUDENT_NUMBER,
                uqcloud_zone_id: UQ_CLOUD_ZONE_ID,
            }),
        ]);

        allThreads = threads;
        allGroups = groups;

        const convertedApiPosts = (apiPosts || []).map((post) => {
            let dateStr = post.chat_date_time;
            if (dateStr && !dateStr.includes("T")) {
                dateStr = dateStr.replace(" ", "T");
            }
            return {
                id: `api-${post.id}`,
                title: post.chat_post_title,
                content: post.chat_post_content.replace(/\n/g, "<br>"),
                author: post.person_name,
                date: dateStr || new Date().toISOString(),
                likes: 0,
                replies: 0,
                category: "General",
                fromAPI: true,
            };
        });

        const userPosts = storage.getUserPosts();
        allThreads = [
            ...convertedApiPosts.reverse(),
            ...userPosts.reverse(),
            ...threads,
        ];

        renderForums(allThreads);
        renderGroups(allGroups);
    } catch (error) {
        try {
            const threads = await fetchGetData("./data/threads.json");
            const groups = await fetchGetData("./data/groups.json");
            const userPosts = storage.getUserPosts();
            allThreads = [...userPosts.reverse(), ...(threads || [])];
            allGroups = groups || [];
            renderForums(allThreads);
            renderGroups(allGroups);
        } catch (localError) {
            showError("forums-container");
            showError("groups-container");
        }
    }
}

function renderForums(threads) {
    const container = document.getElementById("forums-container");
    if (threads.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No discussions available</p>`;
        return;
    }
    container.innerHTML = threads
        .map(
            (thread) => `
        <div class="forum-thread" data-thread-id="${thread.id}">
            <div class="thread-header">
                <h3 class="thread-title">${thread.title}</h3>
                <div class="thread-meta">
                    <span class="author">by ${thread.author}</span>
                    <span class="date">${formatDate(thread.date)}</span>
                </div>
            </div>
            <div class="thread-content">
                <p>${thread.content}</p>
            </div>
            <div class="thread-footer">
                <button class="like-btn" data-thread-id="${
                    thread.id
                }" aria-label="Like this thread">
                    <span class="like-icon">${
                        storage.isLiked(thread.id) ? "❤️" : "🤍"
                    }</span>
                    <span class="like-count">${
                        thread.likes + (storage.isLiked(thread.id) ? 1 : 0)
                    }</span>
                </button>
                <span class="replies-count">${thread.replies} replies</span>
                <span class="category">${thread.category}</span>
            </div>
        </div>
    `
        )
        .join("");
}

function formatDate(dateStr) {
    if (!dateStr) return "Recent";
    try {
        if (
            typeof dateStr === "string" &&
            dateStr.includes(" ") &&
            !dateStr.includes("T")
        ) {
            dateStr = dateStr.replace(" ", "T");
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString();
    } catch (error) {
        return dateStr || "Recent";
    }
}

function renderGroups(groups) {
    const container = document.getElementById("groups-container");
    if (groups.length === 0) {
        container.innerHTML = `<p data-i18n="no_content">No study groups available</p>`;
        return;
    }
    container.innerHTML = groups
        .map((group) => {
            const isMember = storage.isGroupMember(group.id);
            const currentMembers = group.members + (isMember ? 1 : 0);
            return `
            <div class="study-group" data-group-id="${group.id}">
                <div class="group-header">
                    <h3 class="group-name">${group.name}</h3>
                    <div class="group-meta">
                        <span class="category">${group.category}</span>
                        <span class="members">${currentMembers}/${
                group.max_members
            } members</span>
                    </div>
                </div>
                <div class="group-content">
                    <p class="group-description">${group.description}</p>
                    <div class="group-details">
                        <p><strong>Meeting Day:</strong> ${
                            group.meeting_day
                        }</p>
                        <p><strong>Meeting Time:</strong> ${
                            group.meeting_time
                        }</p>
                        <p><strong>Location:</strong> ${group.location}</p>
                    </div>
                </div>
                <div class="group-footer">
                    <button class="btn btn-secondary join-btn ${
                        isMember ? "joined" : ""
                    }" data-group-id="${group.id}" aria-label="${
                isMember ? "Leave group" : "Join group"
            }: ${group.name}">
                        ${isMember ? "Leave Group" : "Join Group"}
                    </button>
                    <span class="contact">Contact: ${group.contact}</span>
                </div>
            </div>
        `;
        })
        .join("");
}

function setupLikeHandlers() {
    document.addEventListener("click", (e) => {
        if (e.target.closest(".like-btn")) {
            const threadId = e.target.closest(".like-btn").dataset.threadId;
            toggleLike(threadId);
        }
    });
}

function setupGroupHandlers() {
    document.addEventListener("click", (e) => {
        if (e.target.closest(".join-btn")) {
            const groupId = e.target.closest(".join-btn").dataset.groupId;
            toggleGroupMembership(groupId);
        }
    });
}

function toggleLike(threadId) {
    const isLiked = storage.toggleLike(threadId);
    const likeBtn = document.querySelector(
        `[data-thread-id="${threadId}"] .like-btn`
    );
    if (likeBtn) {
        const icon = likeBtn.querySelector(".like-icon");
        const count = likeBtn.querySelector(".like-count");
        icon.textContent = isLiked ? "❤️" : "🤍";
        const originalCount = allThreads.find((t) => t.id === threadId).likes;
        count.textContent = originalCount + (isLiked ? 1 : 0);
    }
}

function toggleGroupMembership(groupId) {
    const isMember = storage.isGroupMember(groupId);
    if (isMember) {
        storage.leaveGroup(groupId);
    } else {
        storage.joinGroup(groupId);
    }
    const group = document.querySelector(`[data-group-id="${groupId}"]`);
    if (group) {
        const joinBtn = group.querySelector(".join-btn");
        const membersSpan = group.querySelector(".members");
        const newIsMember = storage.isGroupMember(groupId);
        const originalGroup = allGroups.find((g) => g.id === groupId);
        const currentMembers = originalGroup.members + (newIsMember ? 1 : 0);
        joinBtn.textContent = newIsMember ? "Leave Group" : "Join Group";
        joinBtn.classList.toggle("joined", newIsMember);
        membersSpan.textContent = `${currentMembers}/${originalGroup.max_members} members`;
    }
}

function showError(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p data-i18n="error_loading">Error loading content</p>`;
}

function setupNewPostForm() {
    const newPostBtn = document.getElementById("new-post-btn");
    const formContainer = document.getElementById("new-post-form-container");
    const cancelBtn = document.getElementById("cancel-post-btn");
    const form = document.getElementById("new-post-form");

    newPostBtn.addEventListener("click", () => {
        formContainer.style.display = "block";
        formContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    cancelBtn.addEventListener("click", () => {
        formContainer.style.display = "none";
        form.reset();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const name = formData.get("name")?.trim() || "";
        const title = formData.get("title").trim();
        const content = formData.get("content").trim();
        const category = formData.get("category");
        const author = name || "Anonymous";
        if (!name || !title || !content) {
            alert("Please fill in name, title, and content.");
            return;
        }
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Submitting...";
        submitBtn.disabled = true;
        try {
            const apiForm = document.createElement("form");
            const personNameInput = document.createElement("input");
            personNameInput.type = "hidden";
            personNameInput.name = "person_name";
            personNameInput.value = author;
            apiForm.appendChild(personNameInput);
            const titleInput = document.createElement("input");
            titleInput.type = "hidden";
            titleInput.name = "chat_post_title";
            titleInput.value = title;
            apiForm.appendChild(titleInput);
            const contentInput = document.createElement("input");
            contentInput.type = "hidden";
            contentInput.name = "chat_post_content";
            contentInput.value = content;
            apiForm.appendChild(contentInput);
            const { success, data: responseData } = await postFormData(
                apiForm,
                CHAT_ENDPOINT,
                {
                    student_number: STUDENT_NUMBER,
                    uqcloud_zone_id: UQ_CLOUD_ZONE_ID,
                }
            );
            if (success) {
                formContainer.style.display = "none";
                form.reset();
                await loadCommunityData();
                setTimeout(() => {
                    const forumsSection =
                        document.getElementById("forums-container");
                    if (forumsSection)
                        forumsSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                }, 100);
            } else {
                const newPost = storage.addUserPost({
                    title: title,
                    content: `<p>${content}</p>`,
                    author: author,
                    category: category,
                });
                alert(
                    "Your post was saved locally but could not be sent to the server. " +
                        (responseData?.message || "Please try again later.")
                );
                allThreads.unshift(newPost);
                renderForums(allThreads);
                formContainer.style.display = "none";
                form.reset();
            }
        } catch (error) {
            const newPost = storage.addUserPost({
                title: title,
                content: `<p>${content}</p>`,
                author: author,
                category: category,
            });
            allThreads.unshift(newPost);
            renderForums(allThreads);
            formContainer.style.display = "none";
            form.reset();
            alert(
                "Your post was saved locally but there was an error connecting to the server."
            );
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}
