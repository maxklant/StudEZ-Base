// Quiz Application JavaScript

class QuizApp {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.timerInterval = null;
        this.score = 0;
        
        this.init();
    }

    init() {
        // Get subject from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const subject = urlParams.get('subject');
        
        if (subject) {
            this.loadQuiz(subject);
        } else {
            this.showError('No subject specified. Please select a subject from the home page.');
        }
    }

    async loadQuiz(subject) {
        try {
            // Show loading state
            this.showLoading();
            
            // Fetch XML file
            const response = await fetch(`quizzes/${subject}.xml`);
            if (!response.ok) {
                throw new Error(`Failed to load quiz for ${subject}`);
            }
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Failed to parse quiz data');
            }
            
            // Parse quiz data
            this.currentQuiz = this.parseQuizXML(xmlDoc);
            this.userAnswers = new Array(this.currentQuiz.questions.length).fill(null);
            
            // Initialize quiz interface
            this.initializeQuiz();
            this.displayQuestion();
            this.startTimer();
            
        } catch (error) {
            console.error('Error loading quiz:', error);
            this.showError(`Error loading quiz: ${error.message}`);
        }
    }

    parseQuizXML(xmlDoc) {
        const quiz = {
            title: xmlDoc.querySelector('quiz title').textContent,
            description: xmlDoc.querySelector('quiz description').textContent,
            subject: xmlDoc.querySelector('quiz subject').textContent,
            questions: []
        };

        const questions = xmlDoc.querySelectorAll('question');
        questions.forEach((questionNode, index) => {
            const question = {
                id: questionNode.getAttribute('id'),
                text: questionNode.querySelector('text').textContent,
                type: questionNode.getAttribute('type'),
                difficulty: questionNode.getAttribute('difficulty') || 'medium',
                options: [],
                correctAnswer: questionNode.querySelector('correct-answer').textContent,
                explanation: questionNode.querySelector('explanation')?.textContent || ''
            };

            // Get options
            const options = questionNode.querySelectorAll('option');
            options.forEach(option => {
                question.options.push({
                    id: option.getAttribute('id'),
                    text: option.textContent
                });
            });

            quiz.questions.push(question);
        });

        return quiz;
    }

    initializeQuiz() {
        // Update quiz header
        document.getElementById('quiz-title').textContent = this.currentQuiz.title;
        document.getElementById('quiz-description').textContent = this.currentQuiz.description;
        
        // Update progress
        this.updateProgress();
        
        // Hide loading and show question container
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('question-container').style.display = 'block';
    }

    displayQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        // Update question header
        document.getElementById('question-number').textContent = 
            `Question ${this.currentQuestionIndex + 1}`;
        
        const difficultyBadge = document.getElementById('difficulty-badge');
        difficultyBadge.textContent = question.difficulty;
        difficultyBadge.className = `difficulty-badge ${question.difficulty}`;
        
        // Update question text
        document.getElementById('question-text').textContent = question.text;
        
        // Generate options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.onclick = () => this.selectOption(option.id, optionElement);
            
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            
            optionElement.innerHTML = `
                <div class="option-letter">${letter}</div>
                <div class="option-text">${option.text}</div>
            `;
            
            // If user has already answered this question, show their selection
            if (this.userAnswers[this.currentQuestionIndex] === option.id) {
                optionElement.classList.add('selected');
            }
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Update navigation buttons
        this.updateNavigationButtons();
        this.updateProgress();
    }

    selectOption(optionId, optionElement) {
        // Remove previous selection
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selection to clicked option
        optionElement.classList.add('selected');
        
        // Store user's answer
        this.userAnswers[this.currentQuestionIndex] = optionId;
        
        // Enable next button
        document.getElementById('next-btn').disabled = false;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            this.finishQuiz();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        // Previous button
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // Next button
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;
        nextBtn.disabled = !hasAnswer;
        
        // Update next button text for last question
        if (this.currentQuestionIndex === this.currentQuiz.questions.length - 1) {
            nextBtn.innerHTML = 'Finish Quiz <i class="fas fa-flag-checkered"></i>';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
        }
    }

    updateProgress() {
        const answered = this.userAnswers.filter(answer => answer !== null).length;
        const total = this.currentQuiz.questions.length;
        const percentage = (answered / total) * 100;
        
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${answered} / ${total}`;
    }

    finishQuiz() {
        this.stopTimer();
        this.calculateScore();
        this.showResults();
    }

    calculateScore() {
        this.score = 0;
        this.userAnswers.forEach((answer, index) => {
            if (answer === this.currentQuiz.questions[index].correctAnswer) {
                this.score++;
            }
        });
    }

    showResults() {
        // Hide question container and show results
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('results-container').style.display = 'block';
        
        const total = this.currentQuiz.questions.length;
        const percentage = Math.round((this.score / total) * 100);
        const incorrect = total - this.score;
        
        // Update results display
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('score-total').textContent = `/ ${total}`;
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('correct-count').textContent = this.score;
        document.getElementById('incorrect-count').textContent = incorrect;
        document.getElementById('total-time').textContent = this.getFormattedTime();
        
        // Update results icon based on performance
        const resultsIcon = document.querySelector('.results-icon');
        if (percentage >= 80) {
            resultsIcon.className = 'fas fa-trophy results-icon';
            resultsIcon.style.color = '#ffd700';
        } else if (percentage >= 60) {
            resultsIcon.className = 'fas fa-medal results-icon';
            resultsIcon.style.color = '#c0c0c0';
        } else {
            resultsIcon.className = 'fas fa-certificate results-icon';
            resultsIcon.style.color = '#cd7f32';
        }
    }

    reviewAnswers() {
        document.getElementById('results-container').style.display = 'none';
        document.getElementById('review-container').style.display = 'block';
        
        const reviewQuestions = document.getElementById('review-questions');
        reviewQuestions.innerHTML = '';
        
        this.currentQuiz.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-question';
            
            // Find user's selected option text
            const userOption = question.options.find(opt => opt.id === userAnswer);
            const correctOption = question.options.find(opt => opt.id === question.correctAnswer);
            
            reviewElement.innerHTML = `
                <div class="review-question-header">
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="difficulty-badge ${question.difficulty}">${question.difficulty}</span>
                </div>
                <div class="review-question-text">${question.text}</div>
                <div class="review-options">
                    <p><strong>Your answer:</strong> 
                        <span class="${isCorrect ? 'correct' : 'incorrect'}" style="color: ${isCorrect ? '#28a745' : '#dc3545'}">
                            ${userOption ? userOption.text : 'Not answered'}
                            ${isCorrect ? '✓' : '✗'}
                        </span>
                    </p>
                    ${!isCorrect ? `<p><strong>Correct answer:</strong> 
                        <span style="color: #28a745">${correctOption.text} ✓</span>
                    </p>` : ''}
                </div>
                ${question.explanation ? `
                    <div class="review-explanation">
                        <h4>Explanation:</h4>
                        <p>${question.explanation}</p>
                    </div>
                ` : ''}
            `;
            
            reviewQuestions.appendChild(reviewElement);
        });
    }

    showResults() {
        document.getElementById('review-container').style.display = 'none';
        document.getElementById('results-container').style.display = 'block';
    }

    retakeQuiz() {
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.questions.length).fill(null);
        this.score = 0;
        
        // Hide results and show questions
        document.getElementById('results-container').style.display = 'none';
        document.getElementById('review-container').style.display = 'none';
        document.getElementById('question-container').style.display = 'block';
        
        // Restart quiz
        this.displayQuestion();
        this.startTimer();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            document.getElementById('timer-text').textContent = this.formatTime(elapsed);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getFormattedTime() {
        if (this.startTime) {
            const elapsed = Date.now() - this.startTime;
            return this.formatTime(elapsed);
        }
        return '00:00';
    }

    showLoading() {
        document.getElementById('loading-state').style.display = 'block';
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('results-container').style.display = 'none';
        document.getElementById('review-container').style.display = 'none';
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-modal').style.display = 'flex';
    }
}

// Global functions for button events
function nextQuestion() {
    if (window.quizApp) {
        window.quizApp.nextQuestion();
    }
}

function previousQuestion() {
    if (window.quizApp) {
        window.quizApp.previousQuestion();
    }
}

function reviewAnswers() {
    if (window.quizApp) {
        window.quizApp.reviewAnswers();
    }
}

function showResults() {
    if (window.quizApp) {
        window.quizApp.showResults();
    }
}

function retakeQuiz() {
    if (window.quizApp) {
        window.quizApp.retakeQuiz();
    }
}

function closeErrorModal() {
    document.getElementById('error-modal').style.display = 'none';
}

function retryLoadQuiz() {
    closeErrorModal();
    location.reload();
}

// Initialize quiz app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});

// Handle page visibility changes to pause/resume timer
document.addEventListener('visibilitychange', () => {
    if (window.quizApp) {
        if (document.hidden) {
            // Page is hidden, could pause timer here if needed
        } else {
            // Page is visible again
        }
    }
});