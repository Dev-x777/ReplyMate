function createAIButton() {
    const button = document.createElement("button");
    button.className = "ai-reply-button";
    button.textContent = "Generate AI Reply";
    button.style.padding = "10px 16px";
    button.style.backgroundColor = "#1a73e8";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    return button;
}

function findComposeToolbar() {
    const selectors = [".btC", ".aDh", "[role='toolbar']", ".gU.Up"];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

function getEmailContent() {
    const selectors = [".h7", ".a3s.aiL", ".gmail_quote", "[role='presentation']"];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) return content.innerText.trim();
    }
    return '';
}

async function generateReply(emailContent) {
    const response = await fetch("http://localhost:9191/api/email/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailContent,
            tone: "professional",          // defaulted
            language: "en",                // defaulted
            maxLength: 2000,
            targetLanguage: "en",
            enforceLanguage: true,
            format: "email"
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }

    return response.text();
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) return;

    const button = createAIButton();
    button.addEventListener("click", async () => {
        if (button.disabled) return;

        try {
            button.disabled = true;
            button.textContent = "Generating...";

            const emailContent = getEmailContent();
            if (!emailContent) throw new Error("No email content found");

            const generatedText = await generateReply(emailContent);

            const composeBox = document.querySelector("[role='textbox'][g_editable='true']");
            if (!composeBox) throw new Error("Compose box not found");

            composeBox.innerHTML = generatedText;
        } catch (err) {
            console.error("Error:", err.message);
            alert("Failed to generate reply: " + err.message);
        } finally {
            button.disabled = false;
            button.textContent = "Generate AI Reply";
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

// Observe Gmail DOM to auto-inject button
let debounceTimeout;
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const nodes = Array.from(mutation.addedNodes);
        if (nodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        )) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
