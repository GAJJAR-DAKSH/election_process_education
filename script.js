document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scrolling for anchor links
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

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once the animation has played
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Select all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up');
    animatedElements.forEach(el => observer.observe(el));

    // 3. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');

        questionBtn.addEventListener('click', () => {
            // Close all other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // 4. Chatbot Logic
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotInput = document.getElementById('chatbot-input-field');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Toggle Chat Window
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.remove('hidden');
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.add('hidden');
    });

    // Send Message Function
    const sendMessage = async () => {
        const text = chatbotInput.value.trim();
        if (!text) return;

        // Add user message
        appendMessage(text, 'user-message');
        chatbotInput.value = '';

        // Add a temporary "Thinking..." message
        const thinkingId = 'msg-' + Date.now();
        appendMessage("Thinking...", 'bot-message', thinkingId);

        try {
            // Call the Gemini API
            const API_KEY = 'AIzaSyA2dF4x-Sw9etMZMuOuQbo45YjfJtV7U2g';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "You are a friendly, helpful expert on the election process. Keep your answers relatively short, simple, and easy to understand. Only answer questions related to elections, voting, or democracy. User asks: " + text }]
                    }]
                })
            });

            const data = await response.json();
            
            // Extract the text response from Gemini
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            // Update UI: remove "Thinking..." and show real response
            removeMessage(thinkingId);
            appendMessage(aiResponse, 'bot-message');

        } catch (error) {
            console.error(error);
            removeMessage(thinkingId);
            appendMessage("Sorry, I had trouble connecting to my brain! Please try again later.", 'bot-message');
        }
    };

    // Append Message to UI
    const appendMessage = (text, className, id = null) => {
        const messageDiv = document.createElement('div');
        if (id) messageDiv.id = id;
        messageDiv.classList.add('message', className);
        // Using innerHTML briefly to parse markdown-like responses (optional, but good for Gemini)
        messageDiv.textContent = text; 
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    // Helper to remove messages
    const removeMessage = (id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
    };

    // Event Listeners for sending
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
