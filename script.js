// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Subject selection function
function selectSubject(subject) {
    // Add a subtle animation when clicked
    event.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
        event.target.style.transform = '';
    }, 150);

    // Navigate to quiz page with subject parameter
    window.location.href = `quiz.html?subject=${subject}`;
}

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Add entrance animation to subject cards
function animateOnScroll() {
    const cards = document.querySelectorAll('.subject-card');
    cards.forEach((card, index) => {
        const cardTop = card.getBoundingClientRect().top;
        const cardVisible = 150;
        
        if (cardTop < window.innerHeight - cardVisible) {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}

// Initialize card animations
document.querySelectorAll('.subject-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Quiz data loader (for future use with XML files)
class QuizLoader {
    constructor() {
        this.quizData = {};
    }

    // Load quiz data from XML file
    async loadQuizData(subject) {
        try {
            const response = await fetch(`quizzes/${subject}.xml`);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Parse XML and store quiz data
            this.quizData[subject] = this.parseQuizXML(xmlDoc);
            return this.quizData[subject];
        } catch (error) {
            console.error(`Error loading quiz data for ${subject}:`, error);
            return null;
        }
    }

    // Parse XML quiz data
    parseQuizXML(xmlDoc) {
        const quiz = {
            title: xmlDoc.querySelector('quiz title').textContent,
            description: xmlDoc.querySelector('quiz description').textContent,
            questions: []
        };

        const questions = xmlDoc.querySelectorAll('question');
        questions.forEach(questionNode => {
            const question = {
                id: questionNode.getAttribute('id'),
                text: questionNode.querySelector('text').textContent,
                type: questionNode.getAttribute('type'),
                options: [],
                correctAnswer: questionNode.querySelector('correct-answer').textContent,
                explanation: questionNode.querySelector('explanation')?.textContent || ''
            };

            // Get options for multiple choice questions
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

    // Get quiz data for a subject
    getQuizData(subject) {
        return this.quizData[subject] || null;
    }
}

// Initialize quiz loader
const quizLoader = new QuizLoader();

// Enhanced subject selection with quiz loading
async function selectSubjectWithQuiz(subject) {
    // Add click animation
    event.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
        event.target.style.transform = '';
    }, 150);

    // Navigate directly to quiz page
    window.location.href = `quiz.html?subject=${subject}`;
}