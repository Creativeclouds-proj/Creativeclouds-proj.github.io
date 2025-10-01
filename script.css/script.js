// --- 1. GAME DATA (Questions and Answers) ---
const GAME_DATA = [
    {
        category: "IaaS Basics",
        questions: [
            { value: 100, question: "The acronym for Infrastructure as a Service.", answer: "IaaS" },
            { value: 200, question: "This allows you to scale computing resources up or down quickly.", answer: "Elasticity" },
            { value: 300, question: "A virtual server or computer running in the cloud is called an ____.", answer: "Instance" },
            { value: 400, question: "The deployment model where the cloud is hosted by a single organization for its exclusive use.", answer: "Private Cloud" },
            { value: 500, question: "The 'pay as you go' financial model common in IaaS.", answer: "Consumption-based" }
        ]
    },
    {
        category: "PaaS/SaaS",
        questions: [
            { value: 100, question: "The 'A' in PaaS stands for this.", answer: "Application" },
            { value: 200, question: "A common example of a SaaS product used for email and documents (e.g., Google Workspace or Microsoft 365).", answer: "Email" },
            { value: 300, question: "With PaaS, you are still responsible for managing this layer, but not the OS.", answer: "Application Data" },
            { value: 400, question: "SaaS provides a complete, ready-to-use software solution.", answer: "True", isBoolean: true },
            { value: 500, question: "The capability in PaaS to automatically add resources when demand increases.", answer: "Auto-Scaling" }
        ]
    },
    {
        category: "Cloud Security",
        questions: [
            { value: 100, question: "The security model where the responsibility is split between the cloud provider and the customer.", answer: "Shared Responsibility" },
            { value: 200, question: "The act of verifying the identity of a user or service.", answer: "Authentication" },
            { value: 300, question: "Encrypting data that is being stored, not actively being moved.", answer: "Data at Rest" },
            { value: 400, question: "The principle that a user should only have the minimum permissions needed to perform their job.", answer: "Least Privilege" },
            { value: 500, question: "This service monitors traffic and filters malicious requests before they reach your web server.", answer: "WAF" }
        ]
    },
    {
        category: "Terminology",
        questions: [
            { value: 100, question: "A global network of data centers that provide cloud services.", answer: "Region" },
            { value: 200, question: "The distance between a user request and the data center it connects to.", answer: "Latency" },
            { value: 300, question: "A temporary state of an Instance before it is shut down.", answer: "Hibernation" },
            { value: 400, question: "The process of moving a system from an on-premise data center to the cloud.", answer: "Migration" },
            { value: 500, question: "Refers to code running without managing servers, like AWS Lambda or Azure Functions.", answer: "Serverless" }
        ]
    },
    {
        category: "Networking",
        questions: [
            { value: 100, question: "A network that is logically isolated from all other virtual networks in the cloud.", answer: "VPC" },
            { value: 200, question: "The acronym for Public IP Address.", answer: "PIP" },
            { value: 300, question: "A virtual firewall that controls inbound and outbound traffic to a cloud resource (like an instance).", answer: "Security Group" },
            { value: 400, question: "This service distributes incoming application traffic across multiple targets, like EC2 instances.", answer: "Load Balancer" },
            { value: 500, question: "A connection that links two or more separate VPCs.", answer: "VPC Peering" }
        ]
    }
];

// --- 2. GAME STATE VARIABLES ---
let currentScore = 0;
let activeQuestion = null; // Stores the object of the question currently open
let activeTile = null;     // Stores the DOM element of the tile currently clicked

// --- 3. DOM ELEMENTS ---
const gameBoard = document.getElementById('game-board');
const currentScoreElement = document.getElementById('current-score');
const modal = document.getElementById('question-modal');
const closeBtn = modal.querySelector('.close-btn');
const submitBtn = document.getElementById('submit-answer-btn');
const answerInput = document.getElementById('answer-input');
const feedbackMessage = document.getElementById('feedback-message');
const resetButton = document.getElementById('reset-button');


// --- 4. CORE FUNCTIONS ---

/**
 * Renders the Jeopardy-style game board based on GAME_DATA.
 */
function renderBoard() {
    gameBoard.innerHTML = ''; // Clear any existing content

    GAME_DATA.forEach((categoryData, catIndex) => {
        // Create Category Header
        const header = document.createElement('div');
        header.className = 'category-header';
        header.textContent = categoryData.category;
        gameBoard.appendChild(header);

        // Create Question Tiles for the category
        categoryData.questions.forEach((question, qIndex) => {
            const tile = document.createElement('div');
            tile.className = 'question-tile';
            tile.textContent = '$' + question.value;

            // Store indices on the DOM element for easy lookup
            tile.dataset.catIndex = catIndex;
            tile.dataset.qIndex = qIndex;
            
            // Add click listener to open the question
            tile.addEventListener('click', handleTileClick);

            gameBoard.appendChild(tile);
        });
    });
}

/**
 * Handles the click event on a question tile.
 */
function handleTileClick(event) {
    activeTile = event.target;
    
    // Get question data from the global structure
    const catIndex = activeTile.dataset.catIndex;
    const qIndex = activeTile.dataset.qIndex;
    activeQuestion = GAME_DATA[catIndex].questions[qIndex];

    // Populate Modal
    document.getElementById('modal-category').textContent = GAME_DATA[catIndex].category;
    document.getElementById('modal-value').textContent = '$' + activeQuestion.value;
    document.getElementById('modal-question').textContent = activeQuestion.question;

    // Reset Modal elements
    answerInput.value = '';
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'feedback';
    submitBtn.disabled = false;
    answerInput.disabled = false;

    // Show the modal
    modal.style.display = 'block';
}

/**
 * Checks the user's submitted answer against the correct answer.
 */
function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = activeQuestion.answer.toLowerCase();
    let isCorrect = false;

    // Standardized comparison for easier checking
    if (activeQuestion.isBoolean) {
        // Only check for 'true' or 'false'/'yes' or 'no' variations
        isCorrect = (userAnswer === 'true' || userAnswer === 'yes') === (correctAnswer === 'true' || correctAnswer === 'yes');
    } else {
        // Simple string comparison for standard answers
        isCorrect = userAnswer === correctAnswer;
    }

    // Display feedback
    if (isCorrect) {
        feedbackMessage.textContent = `Correct! The answer was: ${activeQuestion.answer}`;
        feedbackMessage.className = 'feedback correct';
        updateScore(activeQuestion.value);
    } else {
        feedbackMessage.textContent = `Incorrect. The correct answer was: ${activeQuestion.answer}`;
        feedbackMessage.className = 'feedback incorrect';
        updateScore(-activeQuestion.value); // Deduct points for a wrong answer
    }
    
    // Disable inputs/button after the first attempt
    submitBtn.disabled = true;
    answerInput.disabled = true;

    // Mark the tile as answered
    activeTile.classList.add('answered');
}

/**
 * Updates the game score and displays it.
 */
function updateScore(points) {
    currentScore += points;
    currentScoreElement.textContent = currentScore;
}

/**
 * Closes the question modal.
 */
function closeModal() {
    modal.style.display = 'none';
    activeQuestion = null;
    activeTile = null;
}

/**
 * Resets the entire game board and score.
 */
function resetGame() {
    if (confirm("Are you sure you want to restart the game? Your current score will be lost.")) {
        currentScore = 0;
        updateScore(0); // Reset score display
        renderBoard();  // Re-render the board to reset all tiles
        closeModal();
    }
}


// --- 5. EVENT LISTENERS ---

// Listener for the Submit button in the modal
submitBtn.addEventListener('click', checkAnswer);

// Listener for the Close button (x) in the modal
closeBtn.addEventListener('click', closeModal);

// Listener for closing the modal by clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        closeModal();
    }
});

// Listener for the reset button
resetButton.addEventListener('click', resetGame);

// Allow pressing Enter to submit the answer when input is focused
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !submitBtn.disabled) {
        checkAnswer();
    }
});


// --- 6. INITIALIZATION ---
// Start the game when the script loads
document.addEventListener('DOMContentLoaded', () => {
    renderBoard();
});
