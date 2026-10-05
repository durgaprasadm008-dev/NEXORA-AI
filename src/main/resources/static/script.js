console.log("NEXORA is running successfully.");

const enterButton = document.querySelector(".primary-btn");

if (enterButton) {
    enterButton.addEventListener("click", function () {
        alert("Welcome to NEXORA 🚀");
    });
}

const hero = document.querySelector(".hero");
const title = document.querySelector(".hero-title");

if (hero && title) {

    hero.addEventListener("mousemove", function (event) {

        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;

        title.style.transform =
            `translate(${x * 8}px, ${y * 8}px)`;
    });

    hero.addEventListener("mouseleave", function () {
        title.style.transform = "translate(0, 0)";
    });

}
const glow = document.createElement("div");

glow.classList.add("mouse-glow");

document.body.appendChild(glow);

document.addEventListener("mousemove", function (event) {
    glow.style.left = event.clientX + "px";
    glow.style.top = event.clientY + "px";
});
function openWorkspace() {
    document.getElementById("workspace").scrollIntoView({
        behavior: "smooth"
    });
}
function openAICore() {
    document.getElementById("ai-core").scrollIntoView({
        behavior: "smooth"
    });
}

const aiInput = document.querySelector(".ai-input-area input");
const aiSendButton = document.querySelector(".ai-input-area button");
const aiChat = document.querySelector("#ai-chat");

const thinkingCore = document.querySelector("#nexora-thinking");
const thinkingStatus = document.querySelector("#thinking-status");
const thinkingSteps = document.querySelectorAll(".thinking-step");

if (
    aiInput &&
    aiSendButton &&
    aiChat &&
    thinkingCore &&
    thinkingStatus
) {

    let controller = null;
    let thinkingTimer = null;

    const thinkingMessages = [
        "Connecting to Intelligence Core...",
        "Analyzing your request...",
        "Understanding context...",
        "Exploring relevant knowledge...",
        "Building logical connections...",
        "Formulating the best response..."
    ];

    function startThinkingAnimation() {

        thinkingCore.classList.add("active");

        let currentStep = 0;

        thinkingStatus.textContent =
            thinkingMessages[0];

        thinkingSteps.forEach(step => {
            step.classList.remove("active");
        });

        if (thinkingSteps[0]) {
            thinkingSteps[0].classList.add("active");
        }

        thinkingTimer = setInterval(() => {

            currentStep++;

            if (currentStep < thinkingMessages.length) {

                thinkingStatus.textContent =
                    thinkingMessages[currentStep];

            }

            thinkingSteps.forEach(step => {
                step.classList.remove("active");
            });

            const stepIndex =
                Math.min(
                    currentStep,
                    thinkingSteps.length - 1
                );

            if (thinkingSteps[stepIndex]) {
                thinkingSteps[stepIndex]
                    .classList.add("active");
            }

        }, 1800);
    }

    function stopThinkingAnimation() {

        if (thinkingTimer) {
            clearInterval(thinkingTimer);
            thinkingTimer = null;
        }

        thinkingCore.classList.remove("active");

        thinkingSteps.forEach(step => {
            step.classList.remove("active");
        });
    }

    aiSendButton.addEventListener(
        "click",
        async function () {

            const message =
                aiInput.value.trim();

            if (message === "") {
                return;
            }

            if (controller) {
                controller.abort();
            }

            controller =
                new AbortController();

            // USER MESSAGE

            const userMessage =
                document.createElement("div");

            userMessage.classList.add(
                "user-message"
            );

            userMessage.innerHTML = `
                <strong>You</strong>
                <p>${message}</p>
            `;

            aiChat.appendChild(userMessage);

            // START INTELLIGENCE CORE

            startThinkingAnimation();

            aiInput.value = "";

            try {

                const result =
                    await fetch(
                        "/api/ai/chat",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "text/plain"
                            },
                            body: message,
                            signal:
                                controller.signal
                        }
                    );

                if (!result.ok) {
                    throw new Error(
                        "Backend request failed"
                    );
                }

                if (!result.body) {
                    throw new Error(
                        "Streaming is not supported"
                    );
                }

                const reader =
                    result.body.getReader();

                const decoder =
                    new TextDecoder();

                let fullResponse = "";

                let aiReply =
                    document.createElement("div");

                aiReply.classList.add(
                    "ai-message"
                );

                aiReply.innerHTML = `
                    <div class="ai-avatar">✦</div>

                    <div>
                        <strong>NEXORA AI</strong>

                        <p class="ai-response"></p>
                    </div>
                `;

                aiChat.appendChild(aiReply);

                const responseText =
                    aiReply.querySelector(
                        ".ai-response"
                    );

                while (true) {

                    const {
                        value,
                        done
                    } = await reader.read();

                    if (done) {
                        break;
                    }

                    const chunk =
                        decoder.decode(
                            value,
                            {
                                stream: true
                            }
                        );

                    fullResponse += chunk;

                    responseText.textContent =
                        fullResponse;

                    aiChat.scrollTop =
                        aiChat.scrollHeight;
                }

                stopThinkingAnimation();

                if (
                    fullResponse.trim() === ""
                ) {

                    responseText.textContent =
                        "NEXORA could not generate a response.";
                }

            } catch (error) {

                stopThinkingAnimation();

                if (
                    error.name ===
                    "AbortError"
                ) {

                    console.log(
                        "NEXORA generation stopped."
                    );

                } else {

                    const errorMessage =
                        document.createElement(
                            "div"
                        );

                    errorMessage.classList.add(
                        "ai-message"
                    );

                    errorMessage.innerHTML = `
                        <div class="ai-avatar">⚠</div>

                        <div>
                            <strong>NEXORA AI</strong>

                            <p>
                                NEXORA backend is not responding.
                                Please make sure the Spring Boot
                                server is running.
                            </p>
                        </div>
                    `;

                    aiChat.appendChild(
                        errorMessage
                    );

                    console.error(error);
                }

            } finally {

                controller = null;
            }
        }
    );

    // ENTER TO SEND

    aiInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                aiSendButton.click();
            }
        }
    );
}
function openCreator() {
    document.getElementById("creator-interface").scrollIntoView({
        behavior: "smooth"
    });
}

function openCodeLab() {
    document.getElementById("code-lab-interface").scrollIntoView({
        behavior: "smooth"
    });
}

function openLearning() {
    document.getElementById("learning-interface").scrollIntoView({
        behavior: "smooth"
    });
}

function openProjects() {
    document.getElementById("projects-interface").scrollIntoView({
        behavior: "smooth"
    });
}

function openAnalytics() {
    document.getElementById("analytics-interface").scrollIntoView({
        behavior: "smooth"
    });
}

function generateCreatorIdeas() {

    const ideasBox = document.getElementById("creator-ideas");

    ideasBox.innerHTML = `
        <div class="idea-result">
            <h4>✦ NEXORA Ideas</h4>

            <p>1. AI-powered student assistant</p>
            <p>2. Smart study planner</p>
            <p>3. AI gaming content generator</p>
            <p>4. Personal productivity dashboard</p>
            <p>5. AI website builder</p>
        </div>
    `;
}
function runCode() {

    const code = document.getElementById("code-editor").value;
    const output = document.getElementById("code-output");

    if (code.trim() === "") {
        output.textContent = "Please enter some code.";
        return;
    }

    if (code.includes('print("Hello from NEXORA!")')) {
        output.textContent = "Hello from NEXORA!";
    } else {
        output.textContent =
            "Code received successfully.\n\n" +
            "NEXORA Code Lab is ready to connect with a real code execution engine.";
    }
}
function learnTopic() {
    alert("📚 Learning Mode\n\nChoose any topic and NEXORA will help you understand it step by step.");
}

function practiceQuestions() {
    alert("✦ Practice Mode\n\nNEXORA will generate practice questions based on your selected topic.");
}

function showLearningProgress() {
    alert("✓ Learning Progress\n\nYour learning progress will appear here.");
}
function openProject() {
    alert(
        "▣ NEXORA Project\n\n" +
        "Project: NEXORA\n" +
        "Status: Active\n" +
        "Progress: 40%\n\n" +
        "Your project workspace is ready."
    );
}

function createProject() {
    alert(
        "✦ Create New Project\n\n" +
        "New project creation will allow you to add a name, description, tasks and progress."
    );
}
