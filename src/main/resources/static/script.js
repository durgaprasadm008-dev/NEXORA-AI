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

/* =========================================================
   NEXORA AI CORE V3
   ========================================================= */

const aiInput =
    document.querySelector(".ai-input-area input");

const aiSendButton =
    document.querySelector(".ai-input-area button");

const aiChat =
    document.querySelector("#ai-chat");

const thinkingCore =
    document.querySelector("#nexora-thinking");

const thinkingStatus =
    document.querySelector("#thinking-status");

const thinkingSteps =
    document.querySelectorAll(".thinking-step");


if (
    aiInput &&
    aiSendButton &&
    aiChat &&
    thinkingCore &&
    thinkingStatus
) {

    let controller = null;

    let thinkingTimer = null;

    let currentStep = 0;

    let requestStartTime = 0;


    /* =====================================================
       PROCESSING STATES
       ===================================================== */

    const processingStates = [

        "Receiving request...",

        "Analyzing request structure...",

        "Understanding context...",

        "Connecting relevant knowledge...",

        "Processing information...",

        "Constructing response...",

        "Refining information...",

        "Generating answer..."

    ];


    /* =====================================================
       DETECT TASK MODE
       ===================================================== */

    function detectMode(message) {

        const text =
            message.toLowerCase();


        if (
            text.includes("code") ||
            text.includes("java") ||
            text.includes("python") ||
            text.includes("program") ||
            text.includes("javascript") ||
            text.includes("html") ||
            text.includes("css") ||
            text.includes("bug") ||
            text.includes("error")
        ) {

            return "code";
        }


        if (
            text.includes("math") ||
            text.includes("calculate") ||
            text.includes("equation") ||
            text.includes("formula") ||
            text.includes("probability") ||
            text.includes("statistics")
        ) {

            return "math";
        }


        if (
            text.includes("learn") ||
            text.includes("explain") ||
            text.includes("study") ||
            text.includes("exam") ||
            text.includes("definition") ||
            text.includes("concept")
        ) {

            return "learning";
        }


        if (
            text.includes("data") ||
            text.includes("dataset") ||
            text.includes("analysis") ||
            text.includes("analytics") ||
            text.includes("chart") ||
            text.includes("graph")
        ) {

            return "analytics";
        }


        if (
            text.includes("design") ||
            text.includes("idea") ||
            text.includes("creative") ||
            text.includes("story") ||
            text.includes("write")
        ) {

            return "creative";
        }


        return "general";
    }


    /* =====================================================
       MARKDOWN RENDERER
       ===================================================== */

    function escapeHTML(text) {

        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }


    function renderMarkdown(text) {

        let html =
            escapeHTML(text);


        /* code blocks */

        html = html.replace(
            /```([\s\S]*?)```/g,

            function (_, code) {

                return `
                    <pre class="ai-code-block">
                        <code>${code.trim()}</code>
                    </pre>
                `;
            }
        );


        /* headings */

        html = html.replace(
            /^### (.*)$/gm,
            "<h4>$1</h4>"
        );


        html = html.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );


        html = html.replace(
            /^# (.*)$/gm,
            "<h2>$1</h2>"
        );


        /* bold */

        html = html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


        /* inline code */

        html = html.replace(
            /`([^`\n]+)`/g,
            "<code class=\"inline-code\">$1</code>"
        );


        /* unordered lists */

        html = html.replace(
            /^[•\-] (.*)$/gm,
            "<li>$1</li>"
        );


        html = html.replace(
            /((?:<li>.*<\/li>\s*)+)/g,
            "<ul>$1</ul>"
        );


        /* numbered lists */

        html = html.replace(
            /^\d+\.\s+(.*)$/gm,
            "<li>$1</li>"
        );


        /* paragraphs */

        html = html.replace(
            /\n{2,}/g,
            "<br><br>"
        );


        html = html.replace(
            /\n/g,
            "<br>"
        );


        return html;
    }


    /* =====================================================
       MODE VISUAL
       ===================================================== */

    function applyMode(mode) {

        const classes = [
            "mode-code",
            "mode-learning",
            "mode-math",
            "mode-analytics",
            "mode-creative"
        ];


        classes.forEach(
            className =>
                thinkingCore.classList.remove(className)
        );


        if (mode !== "general") {

            thinkingCore.classList.add(
                `mode-${mode}`
            );
        }
    }


    /* =====================================================
       THINKING START
       ===================================================== */

    function startThinkingAnimation(mode) {

        currentStep = 0;

        requestStartTime =
            performance.now();


        thinkingCore.classList.add("active");

        thinkingCore.classList.remove("completed");


        applyMode(mode);


        thinkingStatus.textContent =
            processingStates[0];


        thinkingSteps.forEach(
            step => {

                step.classList.remove(
                    "active",
                    "complete"
                );

            }
        );


        if (thinkingSteps[0]) {

            thinkingSteps[0]
                .classList.add("active");
        }


        /* ===============================================
           PROGRESS STATE ENGINE
           =============================================== */

        thinkingTimer =
            setInterval(() => {

                if (
                    currentStep <
                    processingStates.length - 1
                ) {

                    if (thinkingSteps[currentStep]) {

                        thinkingSteps[currentStep]
                            .classList.remove("active");

                        thinkingSteps[currentStep]
                            .classList.add("complete");
                    }


                    currentStep++;


                    thinkingStatus.textContent =
                        processingStates[currentStep];


                    if (thinkingSteps[currentStep]) {

                        thinkingSteps[currentStep]
                            .classList.add("active");
                    }

                }

            }, 2200);
    }


    /* =====================================================
       STOP THINKING
       ===================================================== */

    function stopThinkingAnimation() {

        if (thinkingTimer) {

            clearInterval(
                thinkingTimer
            );

            thinkingTimer = null;
        }
    }


    /* =====================================================
       RESPONSE COMPLETE
       ===================================================== */

    function completeThinkingAnimation() {

        stopThinkingAnimation();


        thinkingSteps.forEach(
            step => {

                step.classList.remove(
                    "active"
                );

                step.classList.add(
                    "complete"
                );

            }
        );


        thinkingStatus.textContent =
            "Response ready";


        thinkingCore.classList.add(
            "completed"
        );


        const processingState =
            thinkingCore.querySelector(
                ".processing-state"
            );


        if (processingState) {

            processingState.textContent =
                "COMPLETE";
        }


        setTimeout(() => {

            thinkingCore.classList.remove(
                "completed"
            );

            thinkingCore.classList.remove(
                "active"
            );

        }, 1100);
    }


    /* =====================================================
       CREATE USER MESSAGE
       ===================================================== */

    function addUserMessage(message) {

        const userMessage =
            document.createElement("div");


        userMessage.classList.add(
            "user-message"
        );


        userMessage.innerHTML = `

            <strong>You</strong>

            <p>
                ${escapeHTML(message)}
            </p>

        `;


        aiChat.appendChild(
            userMessage
        );
    }


    /* =====================================================
       CREATE AI MESSAGE
       ===================================================== */

    function createAIMessage() {

        const aiReply =
            document.createElement("div");


        aiReply.classList.add(
            "ai-message"
        );


        aiReply.innerHTML = `

            <div class="ai-avatar">
                ✦
            </div>

            <div class="ai-response-container">

                <strong>NEXORA AI</strong>

                <div
                    class="ai-response"
                ></div>

                <div
                    class="ai-stream-status"
                >
                    Generating...
                </div>

            </div>

        `;


        aiChat.appendChild(
            aiReply
        );


        return aiReply;
    }


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    async function sendMessage() {

        const message =
            aiInput.value.trim();


        if (!message) {

            return;
        }


        /* stop previous request */

        if (controller) {

            controller.abort();
        }


        controller =
            new AbortController();


        const mode =
            detectMode(message);


        addUserMessage(
            message
        );


        aiInput.value = "";


        aiInput.disabled = true;

        aiSendButton.disabled = true;


        startThinkingAnimation(
            mode
        );


        const aiReply =
            createAIMessage();


        const responseText =
            aiReply.querySelector(
                ".ai-response"
            );


        const streamStatus =
            aiReply.querySelector(
                ".ai-stream-status"
            );


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
                    `Backend request failed: ${result.status}`
                );
            }


            if (!result.body) {

                throw new Error(
                    "Streaming is not supported."
                );
            }


            const reader =
                result.body.getReader();


            const decoder =
                new TextDecoder();


            let fullResponse = "";


            /* =========================================
               STREAM RESPONSE
               ========================================= */

            while (true) {

                const {
                    value,
                    done
                } =
                    await reader.read();


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


                if (!chunk) {

                    continue;
                }


                fullResponse +=
                    chunk;


                responseText.innerHTML =
                    renderMarkdown(
                        fullResponse
                    );


                streamStatus.textContent =
                    "Generating response";


                aiChat.scrollTop =
                    aiChat.scrollHeight;
            }


            /* flush decoder */

            const finalChunk =
                decoder.decode();


            if (finalChunk) {

                fullResponse +=
                    finalChunk;
            }


            responseText.innerHTML =
                renderMarkdown(
                    fullResponse
                );


            if (
                streamStatus
            ) {

                streamStatus.textContent =
                    "Response complete";
            }


            completeThinkingAnimation();


            /* =========================================
               RESPONSE TIME
               ========================================= */

            const elapsed =
                (
                    performance.now() -
                    requestStartTime
                ) / 1000;


            console.log(
                `NEXORA response completed in ${elapsed.toFixed(1)}s`
            );


            if (
                fullResponse.trim() === ""
            ) {

                responseText.innerHTML = `
                    <p>
                        NEXORA could not generate
                        a response.
                    </p>
                `;
            }


        } catch (error) {

            stopThinkingAnimation();


            thinkingCore.classList.remove(
                "active"
            );


            if (
                error.name ===
                "AbortError"
            ) {

                console.log(
                    "NEXORA generation stopped."
                );


            } else {

                console.error(
                    "NEXORA AI error:",
                    error
                );


                responseText.innerHTML = `

                    <p>
                        <strong>
                            NEXORA could not connect
                            to the AI engine.
                        </strong>
                    </p>

                    <p>
                        Make sure Ollama and the
                        Spring Boot backend are running.
                    </p>

                `;


                if (streamStatus) {

                    streamStatus.textContent =
                        "Connection error";
                }

            }

        } finally {

            controller = null;

            aiInput.disabled = false;

            aiSendButton.disabled = false;

            aiInput.focus();
        }
    }


    /* =====================================================
       BUTTON
       ===================================================== */

    aiSendButton.addEventListener(
        "click",
        sendMessage
    );


    /* =====================================================
       ENTER TO SEND
       ===================================================== */

    aiInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }

        }
    );

}


/* =========================================================
   EXISTING NEXORA FUNCTIONS
   ========================================================= */

function openCreator() {

    const creator =
        document.getElementById(
            "creator-interface"
        );


    if (creator) {

        creator.scrollIntoView({
            behavior: "smooth"
        });
    }
}


function openCodeLab() {

    const codeLab =
        document.getElementById(
            "code-lab-interface"
        );


    if (codeLab) {

        codeLab.scrollIntoView({
            behavior: "smooth"
        });
    }
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
